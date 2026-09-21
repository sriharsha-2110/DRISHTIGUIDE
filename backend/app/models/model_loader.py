import os
from typing import Dict, Any, Optional
from app.config import settings

class ModelLoader:
    """
    Singleton Manager for Ultralytics YOLO Object Detection Model.
    Loads trained custom weights (models/best.pt) or standard pretrained weights.
    Reports clean error status if custom model file is missing or fails to load.
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

            target_path = self.model_path
            if os.path.exists("models/best.pt"):
                target_path = "models/best.pt"
                self.is_custom = True
            elif os.path.exists(self.model_path):
                target_path = self.model_path
                self.is_custom = (target_path != "yolov8n.pt")
            else:
                target_path = "yolov8n.pt"
                self.is_custom = False

            if not os.path.exists(target_path) and target_path != "yolov8n.pt":
                self.load_status = "ERROR"
                self.load_error = "Custom Drishti AI model is not installed."
                print("[ModelLoader Error] Custom Drishti AI model is not installed.")
                return

            self.model = YOLO(target_path)
            self.model_path = target_path
            self.class_names = self.model.names if hasattr(self.model, 'names') else {}
            self.load_status = "ONLINE"
            self.load_error = None
        except Exception as e:
            self.load_status = "ERROR"
            self.load_error = f"Custom Drishti AI model is not installed. Detail: {e}"
            print(f"[ModelLoader Error] {self.load_error}")

    def get_info(self) -> Dict[str, Any]:
        params = 3157200  # Default YOLOv8n parameter count
        gflops = 8.7

        if self.model and hasattr(self.model, 'model'):
            try:
                params = sum(p.numel() for p in self.model.model.parameters())
            except Exception:
                pass

        return {
            "status": self.load_status,
            "model_name": os.path.basename(self.model_path) if self.model_path else "N/A",
            "model_type": "Custom Fine-Tuned YOLOv8" if self.is_custom else "Pretrained YOLOv8 Nano Base Model",
            "is_custom": self.is_custom,
            "classes_count": len(self.class_names) if self.class_names else 20,
            "parameter_count": params,
            "gflops": gflops,
            "confidence_threshold": settings.CONFIDENCE_THRESHOLD,
            "iou_threshold": settings.IOU_THRESHOLD,
            "load_error": self.load_error
        }
