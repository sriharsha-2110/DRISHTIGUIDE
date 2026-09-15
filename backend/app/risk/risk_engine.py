from typing import Dict, Any, Tuple

class RiskEngine:
    """
    Computes prototype heuristic risk scores (0-100) and risk levels (SAFE, CAUTION, HIGH, CRITICAL).
    """

    CLASS_HAZARD_WEIGHTS: Dict[str, float] = {
        # High Risk Moving Hazards
        "car": 0.95, "bus": 1.00, "truck": 1.00, "motorcycle": 0.95, "bicycle": 0.85,
        
        # High Fall / Structural Hazards
        "stairs": 0.90, "pothole": 0.90, "open_drain": 1.00, "barrier": 0.70,
        
        # Obstacles / Navigation Landmarks
        "door": 0.55, "chair": 0.45, "table": 0.45, "pole": 0.65,
        "curb": 0.50, "traffic_light": 0.60, "traffic_sign": 0.45,
        "pedestrian_crossing": 0.35, "animal": 0.60, "bag": 0.35,
        "wall": 0.40, "bench": 0.35, "trash_bin": 0.40,
        
        # People
        "person": 0.50
    }

    DISTANCE_WEIGHTS: Dict[str, float] = {
        "VERY_NEAR": 1.00,
        "NEAR": 0.85,
        "MEDIUM": 0.55,
        "FAR": 0.25
    }

    POSITION_WEIGHTS: Dict[str, float] = {
        "CENTER": 1.00,
        "LEFT": 0.65,
        "RIGHT": 0.65
    }

    MOVEMENT_WEIGHTS: Dict[str, float] = {
        "APPROACHING": 1.40,
        "STATIONARY": 0.90,
        "MOVING_LATERALLY": 0.80,
        "MOVING_AWAY": 0.40,
        "UNKNOWN": 0.75
    }

    @classmethod
    def calculate_risk(
        cls,
        class_name: str,
        confidence: float,
        position: str,
        distance: str,
        movement: str,
        walking_path: str
    ) -> Tuple[int, str]:
        base_hazard = cls.CLASS_HAZARD_WEIGHTS.get(class_name.lower(), 0.45)
        dist_factor = cls.DISTANCE_WEIGHTS.get(distance, 0.50)
        pos_factor = cls.POSITION_WEIGHTS.get(position, 0.65)
        move_factor = cls.MOVEMENT_WEIGHTS.get(movement, 0.75)
        
        path_factor = 1.30 if walking_path == "CENTER PATH" else 0.85
        
        # Base raw score formula with 65.0 scale multiplier
        raw_score = (base_hazard * 65.0) * dist_factor * pos_factor * move_factor * path_factor * (0.8 + 0.2 * confidence)
        
        score = int(min(max(round(raw_score), 0), 100))
        
        if score <= 25:
            level = "SAFE"
        elif score <= 50:
            level = "CAUTION"
        elif score <= 75:
            level = "HIGH"
        else:
            level = "CRITICAL"
            
        return score, level
