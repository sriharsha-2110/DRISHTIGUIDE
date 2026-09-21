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
    Core Detector service executing REAL Ultralytics YOLO object detection,
    spatial analysis, temporal tracking, risk scoring, and 20-object Drishti AI class mapping.
    Zero simulated, fallback, or hardcoded detections.
    """

    CLASS_MAP = {
        "bottle": "bottle",
        "cup": "cup",
        "cell phone": "mobile_phone",
        "mobile": "mobile_phone",
        "mobile phone": "mobile_phone",
        "mobile_phone": "mobile_phone",
        "phone": "mobile_phone",
        "book": "book",
        "chair": "chair",
        "couch": "chair",
        "sofa": "chair",
        "bench": "chair",
        "laptop": "laptop",
        "pen": "pen",
        "pencil": "pen",
        "keys": "keys",
        "key": "keys",
        "backpack": "backpack",
        "bag": "backpack",
        "handbag": "backpack",
        "suitcase": "backpack",
        "glass": "water_glass",
        "water glass": "water_glass",
        "water_glass": "water_glass",
        "wine glass": "water_glass",
        "plate": "plate",
        "dish": "plate",
        "bowl": "plate",
        "spoon": "spoon",
        "fork": "spoon",
        "knife": "spoon",
        "shoes": "shoes",
        "shoe": "shoes",
        "footwear": "shoes",
        "clock": "clock",
        "remote": "remote",
        "remote control": "remote",
        "keyboard": "keyboard",
        "computer keyboard": "keyboard",
        "mouse": "mouse",
        "computer mouse": "mouse",
        "sunglasses": "sunglasses",
        "glasses": "sunglasses",
        "umbrella": "umbrella",
        "helmet": "helmet"
    }

    CLASS_EMOJIS = {
        "bottle": "🍾", "cup": "☕", "mobile_phone": "📱", "book": "📖", "chair": "🪑",
        "laptop": "💻", "pen": "🖊️", "keys": "🔑", "backpack": "🎒", "water_glass": "🥛",
        "plate": "🍽️", "spoon": "🥄", "shoes": "👟", "clock": "⏰", "remote": "📺",
        "keyboard": "⌨️", "mouse": "🖱️", "sunglasses": "🕶️", "umbrella": "☂️", "helmet": "🪖"
    }

    MULTILINGUAL_DICT = {
        "bottle": {"en": "Bottle", "kn": "ಬಾಟಲಿ", "te": "సీసా", "ta": "பாட்டில்", "ml": "കുപ്പി"},
        "cup": {"en": "Cup", "kn": "ಕಪ್", "te": "కప్", "ta": "கப்", "ml": "കപ്പ്"},
        "mobile_phone": {"en": "Mobile Phone", "kn": "ಮೊಬೈಲ್ ಫೋನ್", "te": "మొబైల్ ఫోన్", "ta": "மொபைல் போன்", "ml": "മൊബൈൽ"},
        "book": {"en": "Book", "kn": "ಪುಸ್ತಕ", "te": "పుస్తకం", "ta": "புத்தகம்", "ml": "പുസ്തകം"},
        "chair": {"en": "Chair", "kn": "ಕುರ್ಚಿ", "te": "కుర్చీ", "ta": "நாற்காலி", "ml": "കസേര"},
        "laptop": {"en": "Laptop", "kn": "ಲ್ಯಾಪ್‌ಟಾಪ್", "te": "ల్యాప్‌టాప్", "ta": "லேப்டாப்", "ml": "ലാപ്‌ടോപ്പ്"},
        "pen": {"en": "Pen", "kn": "ಪೆನ್", "te": "పెన్", "ta": "பேனா", "ml": "പേന"},
        "keys": {"en": "Keys", "kn": "ಕೀಲಿಗಳು", "te": "తాళంచెవులు", "ta": "சாவி", "ml": "താക്കോലുകൾ"},
        "backpack": {"en": "Backpack", "kn": "ಬ್ಯಾಕ್‌ಪ್ಯಾಕ್", "te": "బ్యాక్‌ప్యాಕ್", "ta": "பயணப் பை", "ml": "ബാഗ്"},
        "water_glass": {"en": "Water Glass", "kn": "ನೀರಿನ ಲೋಟ", "te": "గ్లాస్", "ta": "தண்ணீர் டம்ளர்", "ml": "ഗ്ലാസ്"},
        "plate": {"en": "Plate", "kn": "ತಟ್ಟೆ", "te": "ప్లేట్", "ta": "தட்டு", "ml": "പ്ലേറ്റ്"},
        "spoon": {"en": "Spoon", "kn": "ಚಮಚ", "te": "స్పూన్", "ta": "கரண்டி", "ml": "സ്പൂൺ"},
        "shoes": {"en": "Shoes", "kn": "ಶೂಗಳು", "te": "షూస్", "ta": "காலணிகள்", "ml": "ഷൂസ്"},
        "clock": {"en": "Clock", "kn": "ಗಡಿಯಾರ", "te": "గడియారం", "ta": "கடிகாரம்", "ml": "ക്ലോക്ക്"},
        "remote": {"en": "Remote", "kn": "ರಿಮೋಟ್", "te": "రిమోట్", "ta": "ரிமோಟ್", "ml": "റിമോട്ട്"},
        "keyboard": {"en": "Keyboard", "kn": "ಕೀಬೋರ್ಡ್", "te": "కీబోర్డ్", "ta": "விசைப்பலகை", "ml": "കീബോർഡ്"},
        "mouse": {"en": "Mouse", "kn": "ಮೌಸ್", "te": "ಮೌಸ್", "ta": "மவுஸ்", "ml": "മൗസ്"},
        "sunglasses": {"en": "Sunglasses", "kn": "ಸನ್ಗ್ಲಾಸ್", "te": "సన్‌గ్లాసೆಗೆ", "ta": "சூரியக் கண்ணாடி", "ml": "സൺഗ്ലാസ്"},
        "umbrella": {"en": "Umbrella", "kn": "ಛತ್ರಿ", "te": "గొడుగు", "ta": "குடை", "ml": "കുട"},
        "helmet": {"en": "Helmet", "kn": "ಹೆಲ್ಮೆಟ್", "te": "హెల్మెట్", "ta": "ஹெல்மெட்", "ml": "ഹെൽമെറ്റ്"}
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

                    cls_name = self.CLASS_MAP.get(raw_cls_name, raw_cls_name)

                    x1, y1, x2, y2 = xyxy
                    bbox_tuple = (x1, y1, x2, y2)

                    position = SpatialAnalyzer.get_horizontal_position(bbox_tuple, img_w)
                    distance = SpatialAnalyzer.estimate_approximate_distance(bbox_tuple, img_w, img_h)
                    walking_path = SpatialAnalyzer.get_walking_path_zone(bbox_tuple, img_w)
                    movement = global_tracker.update_and_analyze(cls_name, bbox_tuple)

                    risk_score, risk_level = RiskEngine.calculate_risk(
                        class_name=cls_name,
                        confidence=conf,
                        position=position,
                        distance=distance,
                        movement=movement,
                        walking_path=walking_path
                    )

                    priority = global_guidance_engine.determine_priority(
                        class_name=cls_name,
                        risk_level=risk_level,
                        movement=movement,
                        distance=distance,
                        position=position
                    )

                    emoji = self.CLASS_EMOJIS.get(cls_name, "🔍")
                    translations = self.MULTILINGUAL_DICT.get(cls_name, {
                        "en": cls_name.replace("_", " ").capitalize(),
                        "kn": cls_name.replace("_", " ").capitalize(),
                        "te": cls_name.replace("_", " ").capitalize(),
                        "ta": cls_name.replace("_", " ").capitalize(),
                        "ml": cls_name.replace("_", " ").capitalize()
                    })

                    detections.append({
                        "class_id": cls_id,
                        "class_name": cls_name,
                        "class": cls_name,
                        "emoji": emoji,
                        "translations": translations,
                        "confidence": round(conf, 4),
                        "bbox": [int(x1), int(y1), int(x2), int(y2)],
                        "position": position,
                        "distance": distance,
                        "walking_path": walking_path,
                        "movement": movement,
                        "risk_score": risk_score,
                        "risk_level": risk_level,
                        "priority": priority
                    })

        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        return detections, elapsed_ms

detector_service = Detector()
