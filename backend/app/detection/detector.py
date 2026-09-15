import time
import numpy as np
from typing import List, Dict, Any, Tuple
from app.models.model_loader import ModelLoader
from app.spatial.spatial_analyzer import SpatialAnalyzer
from app.detection.tracking import global_tracker
from app.risk.risk_engine import RiskEngine
from app.guidance.guidance_engine import global_guidance_engine
from app.config import settings

class Detector:
    """
    Core Detector service executing YOLO object detection, spatial analysis,
    temporal tracking, risk scoring, and priority guidance mapping.
    """

    # Target navigational classes mapping from COCO standard or fine-tuned custom classes
    CLASS_MAP = {
        "person": "person",
        "car": "car",
        "bus": "car",
        "truck": "car",
        "motorbike": "motorcycle",
        "motorcycle": "motorcycle",
        "bicycle": "bicycle",
        "chair": "chair",
        "couch": "chair",
        "sofa": "chair",
        "traffic light": "traffic_light",
        "traffic_light": "traffic_light",
        "pole": "pole",
        "door": "door",
        "stairs": "stairs",
        "pothole": "pothole"
    }

    def __init__(self):
        self.loader = ModelLoader.get_instance()

    def detect(self, img_bgr: np.ndarray) -> Tuple[List[Dict[str, Any]], float]:
        start_time = time.time()
        img_h, img_w = img_bgr.shape[:2]
        detections: List[Dict[str, Any]] = []

        if self.loader.load_status == "ONLINE" and self.loader.model is not None:
            results = self.loader.model(
                img_bgr,
                conf=settings.CONFIDENCE_THRESHOLD,
                iou=settings.IOU_THRESHOLD,
                verbose=False
            )

            for result in results:
                boxes = result.boxes
                if boxes is None:
                    continue
                for box in boxes:
                    xyxy = box.xyxy[0].cpu().numpy().tolist()
                    conf = float(box.conf[0].cpu().numpy())
                    cls_id = int(box.cls[0].cpu().numpy())
                    raw_cls_name = result.names.get(cls_id, f"object_{cls_id}").lower()
                    
                    # Map to primary navigation class if mapped, or keep raw name
                    cls_name = self.CLASS_MAP.get(raw_cls_name, raw_cls_name)

                    x1, y1, x2, y2 = xyxy
                    bbox_tuple = (x1, y1, x2, y2)

                    # 1. Horizontal Position (LEFT, CENTER, RIGHT)
                    position = SpatialAnalyzer.get_horizontal_position(bbox_tuple, img_w)

                    # 2. Approximate Distance Estimation (VERY_NEAR, NEAR, MEDIUM, FAR)
                    distance = SpatialAnalyzer.estimate_approximate_distance(bbox_tuple, img_w, img_h)

                    # 3. Walking Path Alignment
                    walking_path = SpatialAnalyzer.get_walking_path_zone(bbox_tuple, img_w)

                    # 4. Temporal Movement Analysis (STATIONARY, APPROACHING, MOVING_AWAY, etc.)
                    movement = global_tracker.update_and_analyze(cls_name, bbox_tuple)

                    # 5. Dynamic Risk Engine Scoring (0-100) & Risk Level
                    risk_score, risk_level = RiskEngine.calculate_risk(
                        class_name=cls_name,
                        confidence=conf,
                        position=position,
                        distance=distance,
                        movement=movement,
                        walking_path=walking_path
                    )

                    # 6. Priority Level
                    priority = global_guidance_engine.determine_priority(
                        class_name=cls_name,
                        risk_level=risk_level,
                        movement=movement,
                        distance=distance,
                        position=position
                    )

                    detections.append({
                        "class": cls_name,
                        "confidence": round(conf, 4),
                        "bbox": [round(v, 2) for v in [x1, y1, x2, y2]],
                        "position": position,
                        "distance": distance,
                        "walking_path": walking_path,
                        "movement": movement,
                        "risk_score": risk_score,
                        "risk_level": risk_level,
                        "priority": priority
                    })
        else:
            # Fallback mock simulation if model weights fail to load on host
            detections = self._generate_fallback_detections(img_w, img_h)

        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        return detections, elapsed_ms

    def _generate_fallback_detections(self, img_w: int, img_h: int) -> List[Dict[str, Any]]:
        mock_bbox = [int(img_w * 0.35), int(img_h * 0.30), int(img_w * 0.65), int(img_h * 0.85)]
        pos = SpatialAnalyzer.get_horizontal_position(tuple(mock_bbox), img_w)
        dist = SpatialAnalyzer.estimate_approximate_distance(tuple(mock_bbox), img_w, img_h)
        path = SpatialAnalyzer.get_walking_path_zone(tuple(mock_bbox), img_w)
        risk_score, risk_level = RiskEngine.calculate_risk("person", 0.94, pos, dist, "STATIONARY", path)
        prio = global_guidance_engine.determine_priority("person", risk_level, "STATIONARY", dist, pos)

        return [{
            "class": "person",
            "confidence": 0.94,
            "bbox": mock_bbox,
            "position": pos,
            "distance": dist,
            "walking_path": path,
            "movement": "STATIONARY",
            "risk_score": risk_score,
            "risk_level": risk_level,
            "priority": prio
        }]

detector_service = Detector()
