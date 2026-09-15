import pytest
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
    # Left zone (<33%): x_center = 100 -> 100/640 = 0.156
    pos_left = SpatialAnalyzer.get_horizontal_position((50, 50, 150, 200), img_w)
    assert pos_left == "LEFT"
    
    # Center zone (33%-66%): x_center = 320 -> 320/640 = 0.50
    pos_center = SpatialAnalyzer.get_horizontal_position((220, 50, 420, 200), img_w)
    assert pos_center == "CENTER"

    # Right zone (>66%): x_center = 500 -> 500/640 = 0.78
    pos_right = SpatialAnalyzer.get_horizontal_position((450, 50, 550, 200), img_w)
    assert pos_right == "RIGHT"

# 2. Test Approximate Distance Estimation
def test_approximate_distance_estimation():
    img_w, img_h = 640, 480
    # Very near: large height ratio or close to bottom
    dist_very_near = SpatialAnalyzer.estimate_approximate_distance((100, 50, 500, 470), img_w, img_h)
    assert dist_very_near == "VERY_NEAR"

    # Far: tiny bounding box
    dist_far = SpatialAnalyzer.estimate_approximate_distance((100, 50, 130, 80), img_w, img_h)
    assert dist_far == "FAR"

# 3. Test Dynamic Risk Engine
def test_risk_engine_scoring():
    # Vehicle + CENTER + NEAR + APPROACHING -> Critical high risk
    score, level = RiskEngine.calculate_risk(
        class_name="car",
        confidence=0.92,
        position="CENTER",
        distance="NEAR",
        movement="APPROACHING",
        walking_path="CENTER PATH"
    )
    assert level in ["HIGH", "CRITICAL"]
    assert score > 60

    # Chair + RIGHT + FAR + STATIONARY -> Safe / low risk
    score_low, level_low = RiskEngine.calculate_risk(
        class_name="chair",
        confidence=0.80,
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
    bbox1 = (100, 100, 200, 200) # area = 10,000
    movement1 = tracker.update_and_analyze("car", bbox1)
    assert movement1 == "STATIONARY"

    # Frame 2: Box area expands dramatically -> APPROACHING
    bbox2 = (80, 80, 250, 250) # area = 28,900
    movement2 = tracker.update_and_analyze("car", bbox2)
    assert movement2 == "APPROACHING"

# 5. Test Priority Guidance & Speech Rules
def test_speech_rules_phrasing():
    phrase = SpeechRules.generate_instruction("car", "CENTER", "NEAR", "APPROACHING", "CRITICAL")
    assert phrase == "STOP. Vehicle approaching."

    phrase_stairs = SpeechRules.generate_instruction("stairs", "CENTER", "NEAR", "STATIONARY", "HIGH")
    assert phrase_stairs == "Stairs ahead. Move carefully."

# 6. Test Cooldown & Emergency Override
def test_cooldown_and_emergency_override():
    engine = GuidanceEngine(normal_cooldown=4.0, critical_cooldown=1.0)
    
    detections_normal = [{
        "class": "chair", "position": "RIGHT", "distance": "MEDIUM",
        "movement": "STATIONARY", "risk_level": "CAUTION", "risk_score": 35,
        "priority": "INFORMATION"
    }]
    
    res1 = engine.process_frame_detections(detections_normal, force_announce=True)
    assert res1["instruction"] == "Obstacle on your right."
    
    # Second immediate frame with same routine detection should be suppressed
    res2 = engine.process_frame_detections(detections_normal, force_announce=False)
    assert res2["suppressed"] is True

    # Emergency critical detection suddenly arrives -> MUST OVERRIDE!
    detections_critical = [{
        "class": "car", "position": "CENTER", "distance": "NEAR",
        "movement": "APPROACHING", "risk_level": "CRITICAL", "risk_score": 95,
        "priority": "CRITICAL"
    }]
    res_crit = engine.process_frame_detections(detections_critical, force_announce=False)
    assert res_crit["critical"] is True
    assert res_crit["instruction"] == "STOP. Vehicle approaching."

# 7. Test FastAPI Health & Info Endpoints
def test_health_and_info_api():
    r_health = client.get("/api/health")
    assert r_health.status_code == 200
    assert r_health.json()["status"] == "online"

    r_info = client.get("/api/model-info")
    assert r_info.status_code == 200
    assert "model_name" in r_info.json()

    r_metrics = client.get("/api/metrics")
    assert r_metrics.status_code == 200
    assert "metrics" in r_metrics.json()
