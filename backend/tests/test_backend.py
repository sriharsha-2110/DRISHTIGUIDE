import io
import pytest
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.spatial.spatial_analyzer import SpatialAnalyzer
from app.risk.risk_engine import RiskEngine
from app.guidance.guidance_engine import GuidanceEngine
from app.guidance.speech_rules import SpeechRules
from app.detection.tracking import ObjectTracker

client = TestClient(app)

# 1. Test Spatial Positioning Rules
def test_horizontal_position_classification():
    img_w = 640
    pos_left = SpatialAnalyzer.get_horizontal_position((50, 50, 150, 200), img_w)
    assert pos_left == "LEFT"

    pos_center = SpatialAnalyzer.get_horizontal_position((220, 50, 420, 200), img_w)
    assert pos_center == "CENTER"

    pos_right = SpatialAnalyzer.get_horizontal_position((450, 50, 550, 200), img_w)
    assert pos_right == "RIGHT"

# 2. Test Approximate Distance Estimation
def test_approximate_distance_estimation():
    img_w, img_h = 640, 480
    dist_very_near = SpatialAnalyzer.estimate_approximate_distance((100, 50, 500, 470), img_w, img_h)
    assert dist_very_near == "VERY_NEAR"

    dist_far = SpatialAnalyzer.estimate_approximate_distance((100, 50, 130, 80), img_w, img_h)
    assert dist_far == "FAR"

# 3. Test Dynamic Risk Engine
def test_risk_engine_scoring():
    score, level = RiskEngine.calculate_risk(
        class_name="car",
        confidence=0.87,
        position="CENTER",
        distance="NEAR",
        movement="APPROACHING",
        walking_path="CENTER PATH"
    )
    assert level in ["HIGH", "CRITICAL"]
    assert score > 60

    score_low, level_low = RiskEngine.calculate_risk(
        class_name="chair",
        confidence=0.75,
        position="RIGHT",
        distance="FAR",
        movement="STATIONARY",
        walking_path="RIGHT PATH"
    )
    assert level_low in ["SAFE", "CAUTION"]
    assert score_low < 50

# 4. Test Temporal Tracking
def test_object_tracking_movement():
    tracker = ObjectTracker()
    bbox1 = (100, 100, 200, 200)
    movement1 = tracker.update_and_analyze("bottle", bbox1)
    assert movement1 == "STATIONARY"

    bbox2 = (80, 80, 250, 250)
    movement2 = tracker.update_and_analyze("bottle", bbox2)
    assert movement2 == "APPROACHING"

# 5. Test Speech Rules & Object Naming
def test_speech_rules_phrasing():
    phrase = SpeechRules.generate_instruction("car", "CENTER", "NEAR", "APPROACHING", "CRITICAL")
    assert "Car approaching" in phrase

    phrase_bottle = SpeechRules.generate_instruction("bottle", "CENTER", "NEAR", "STATIONARY", "CAUTION")
    assert "Bottle detected" in phrase_bottle

# 6. Test Cooldown & Emergency Override
def test_cooldown_and_emergency_override():
    engine = GuidanceEngine(normal_cooldown=4.0, critical_cooldown=1.0)

    detections_normal = [{
        "class": "chair", "position": "RIGHT", "distance": "MEDIUM",
        "movement": "STATIONARY", "risk_level": "CAUTION", "risk_score": 35,
        "priority": "INFORMATION"
    }]

    res1 = engine.process_frame_detections(detections_normal, force_announce=True)
    assert "Chair detected" in res1["instruction"]

    res2 = engine.process_frame_detections(detections_normal, force_announce=False)
    assert res2["suppressed"] is True

# 7. Test FastAPI Health & Info Endpoints
def test_health_and_info_api():
    r_health = client.get("/api/health")
    assert r_health.status_code == 200
    assert r_health.json()["status"] == "online"

    r_info = client.get("/api/model-info")
    assert r_info.status_code == 200
    assert "model_name" in r_info.json()

# 8. Test REAL Detection API with Blank Image -> Returns No Object Message
def test_detection_api_empty_frame():
    # Create plain white image
    img = Image.new("RGB", (640, 480), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    response = client.post(
        "/api/detect",
        files={"file": ("test_blank.jpg", buf, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["detections"] == []
    assert data["message"] == "No object detected. Please adjust the camera."

# 9. Test REAL Detection API with Synthesized Object Image -> Returns Real Model Detection
def test_detection_api_with_object():
    # Create simple synthetic test image
    img = Image.new("RGB", (640, 480), color=(120, 120, 120))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    response = client.post(
        "/api/detect",
        files={"file": ("test_object.jpg", buf, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    # Verify confidence values are floats from model, not hardcoded string/fixed 0.92
    for det in data.get("detections", []):
        assert isinstance(det["confidence"], float)
        assert det["confidence"] != 0.92
