import time
from typing import List, Dict, Any, Tuple, Optional

class ObjectTracker:
    """
    Maintains temporal state of detected objects across video frames
    to compute dynamic movement vectors (STATIONARY, APPROACHING, MOVING_AWAY, MOVING_LATERALLY, UNKNOWN).
    """
    
    def __init__(self, history_ttl_seconds: float = 8.0, max_history_per_class: int = 5):
        self.history_ttl = history_ttl_seconds
        self.max_history = max_history_per_class
        # Structure: { class_name: [ { "bbox": (x1,y1,x2,y2), "area": float, "center": (cx, cy), "timestamp": float } ] }
        self.history: Dict[str, List[Dict[str, Any]]] = {}

    def update_and_analyze(self, cls_name: str, bbox: Tuple[float, float, float, float]) -> str:
        """
        Updates frame history for the given object class and returns temporal movement classification.
        """
        now = time.time()
        x1, y1, x2, y2 = bbox
        width = abs(x2 - x1)
        height = abs(y2 - y1)
        area = width * height
        cx = (x1 + x2) / 2.0
        cy = (y1 + y2) / 2.0
        
        # Clean up stale class histories
        self._cleanup(now)
        
        records = self.history.get(cls_name, [])
        
        if not records:
            # First time seeing this class in window
            self.history[cls_name] = [{
                "bbox": bbox,
                "area": area,
                "center": (cx, cy),
                "timestamp": now
            }]
            return "STATIONARY"  # Default assumption on first frame
        
        prev = records[-1]
        prev_area = prev["area"]
        prev_cx, prev_cy = prev["center"]
        dt = max(now - prev["timestamp"], 0.001)
        
        # Area delta ratio
        area_ratio = area / max(prev_area, 1.0)
        # Horizontal movement delta
        dx = cx - prev_cx
        
        movement = "STATIONARY"
        if area_ratio >= 1.20:
            # Object area grew significantly -> approaching towards camera
            movement = "APPROACHING"
        elif area_ratio <= 0.80:
            # Object area shrank significantly -> moving away from camera
            movement = "MOVING_AWAY"
        elif abs(dx) > 40.0:  # pixels
            movement = "MOVING_LATERALLY"
        else:
            movement = "STATIONARY"
            
        records.append({
            "bbox": bbox,
            "area": area,
            "center": (cx, cy),
            "timestamp": now
        })
        
        if len(records) > self.max_history:
            records.pop(0)
            
        self.history[cls_name] = records
        return movement

    def _cleanup(self, now: float):
        for cls_name in list(self.history.keys()):
            self.history[cls_name] = [
                rec for rec in self.history[cls_name]
                if (now - rec["timestamp"]) <= self.history_ttl
            ]
            if not self.history[cls_name]:
                del self.history[cls_name]

# Global tracker instance for in-memory temporal analysis across API calls
global_tracker = ObjectTracker()
