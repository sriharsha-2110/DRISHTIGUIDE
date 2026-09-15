import os
import time
from typing import Dict, Any, Optional
from app.config import settings

class ModelLoader:
    """
    Singleton Manager for Ultralytics YOLO Object Detection Model.
    Supports pretrained YOLOv8 models as well as custom-trained weights with safe fallback.
    """
    _instance: Optional['ModelLoader'] = None

    def __init__(self):
        self.model = None
        self.model_path = settings.MODEL_PATH
        self.is_custom = False
        self.load_status = "INITIALIZING"
        self.load_error: Optional[str] = None
        self.class_names: Dict[int, str] = {}
        self.load_model()

    @classmethod
    def get_instance(cls) -> 'ModelLoader':
        if cls._instance is None:
            cls._instance = ModelLoader()
        return cls._instance

    def load_model(self):
        try:
            from ultralytics import YOLO
            
            # Check if custom model path exists
            if os.path.exists(self.model_path) and self.model_path != "yolov8n.pt":
                self.model = YOLO(self.model_path)
                self.is_custom = True
            else:
                # Load standard lightweight YOLOv8 nano model
                self.model = YOLO("yolov8n.pt")
                self.is_custom = False
                
            self.class_names = self.model.names if hasattr(self.model, 'names') else {}
            self.load_status = "ONLINE"
        except Exception as e:
            self.load_status = "STANDBY"
            self.load_error = f"Ultralytics dependency not present or initializing weights: {e}"
            print(f"[ModelLoader Notice] Operating in smart mock inference mode: {e}")

    def get_info(self) -> Dict[str, Any]:
        params = 3157200  # YOLOv8n default parameter count
        gflops = 8.7
        
        if self.model and hasattr(self.model, 'model'):
            try:
                params = sum(p.numel() for p in self.model.model.parameters())
            except Exception:
                pass

        return {
            "status": "ONLINE" if self.load_status == "ONLINE" else "STANDBY (DEMO ENGINE)",
            "model_name": os.path.basename(self.model_path),
            "model_type": "Custom Fine-Tuned YOLOv8" if self.is_custom else "Pretrained YOLOv8 Nano (Lightweight)",
            "is_custom": self.is_custom,
            "classes_count": len(self.class_names) if self.class_names else 23,
            "parameter_count": params,
            "gflops": gflops,
            "confidence_threshold": settings.CONFIDENCE_THRESHOLD,
            "iou_threshold": settings.IOU_THRESHOLD,
            "load_error": self.load_error
        }
