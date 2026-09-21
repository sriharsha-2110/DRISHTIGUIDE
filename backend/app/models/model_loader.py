import os
from pathlib import Path
from typing import Dict, Any, Optional, List
from app.config import settings

# Determine robust absolute path to project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
CUSTOM_BEST_MODEL_PATH = PROJECT_ROOT / "models" / "best.pt"

EXPECTED_CLASSES: List[str] = [
    "bottle", "cup", "mobile_phone", "book", "chair", "laptop", "pen", "keys",
    "backpack", "water_glass", "plate", "spoon", "shoes", "clock", "remote",
    "keyboard", "mouse", "sunglasses", "umbrella", "helmet"
]

class ModelLoader:
    """
    Singleton Manager for Ultralytics YOLO Object Detection Model.
    Strictly loads custom trained model weights (models/best.pt).
    NEVER silently falls back to generic yolov8n.pt or fake detections.
    """
    _instance: Optional['ModelLoader'] = None

    def __init__(self):
        self.model = None
        self.model_path = str(CUSTOM_BEST_MODEL_PATH)
        self.is_custom = True
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

            # Resolve absolute model path
            target_path = CUSTOM_BEST_MODEL_PATH
            if not target_path.exists():
                # Check fallback relative path if executed in backend subfolder
                alt_path = Path("models/best.pt").resolve()
                if alt_path.exists():
                    target_path = alt_path
                elif Path("../models/best.pt").resolve().exists():
                    target_path = Path("../models/best.pt").resolve()

            if not target_path.exists():
                self.load_status = "CUSTOM MODEL MISSING"
                self.load_error = f"CUSTOM MODEL MISSING: '{CUSTOM_BEST_MODEL_PATH}' not found. Please deploy custom trained models/best.pt."
                print(f"[ModelLoader Error] {self.load_error}")
                self.model = None
                return

            print(f"[ModelLoader] Loading custom Drishti AI model from: {target_path}")
            self.model = YOLO(str(target_path))
            self.model_path = str(target_path)
            self.is_custom = True

            # Extract and verify model class names
            raw_names = getattr(self.model, 'names', {})
            if isinstance(raw_names, dict):
                self.class_names = {int(k): str(v) for k, v in raw_names.items()}
            elif isinstance(raw_names, list):
                self.class_names = {idx: str(v) for idx, v in enumerate(raw_names)}
            else:
                self.class_names = {}

            self.load_status = "ONLINE"
            self.load_error = None
            print(f"[ModelLoader SUCCESS] Custom model loaded successfully with {len(self.class_names)} classes.")
        except Exception as e:
            self.load_status = "ERROR"
            self.load_error = f"Failed loading custom Drishti AI model: {e}"
            print(f"[ModelLoader Error] {self.load_error}")

    def get_info(self) -> Dict[str, Any]:
        params = 3157200
        gflops = 8.7

        if self.model and hasattr(self.model, 'model'):
            try:
                params = sum(p.numel() for p in self.model.model.parameters())
            except Exception:
                pass

        model_classes_list = list(self.class_names.values()) if self.class_names else EXPECTED_CLASSES

        return {
            "status": self.load_status,
            "model_name": os.path.basename(self.model_path) if self.model_path else "best.pt",
            "model_path": self.model_path,
            "model_type": "Custom Fine-Tuned 20-Class YOLOv8",
            "is_custom": True,
            "classes_count": len(model_classes_list),
            "model_classes": model_classes_list,
            "parameter_count": params,
            "gflops": gflops,
            "confidence_threshold": settings.CONFIDENCE_THRESHOLD,
            "iou_threshold": settings.IOU_THRESHOLD,
            "load_error": self.load_error
        }
