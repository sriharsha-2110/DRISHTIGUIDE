import time
from typing import List, Dict, Any, Optional, Tuple
from app.guidance.speech_rules import SpeechRules
from app.config import settings

class GuidanceEngine:
    """
    Intelligent Guidance Priority Engine.
    Filters multiple environment detections, prioritizes critical hazards,
    suppresses audio clutter/repetition, and generates short earphone guidance.
    """
    
    def __init__(self, normal_cooldown: float = 4.0, critical_cooldown: float = 1.5):
        self.normal_cooldown = normal_cooldown
        self.critical_cooldown = critical_cooldown
        self.last_announced_time: float = 0.0
        self.last_announced_phrase: str = ""
        self.last_announced_priority: str = "IGNORE"

    def determine_priority(
        self,
        class_name: str,
        risk_level: str,
        movement: str,
        distance: str,
        position: str
    ) -> str:
        """
        Categorizes priority into: CRITICAL, IMPORTANT, INFORMATION, or IGNORE.
        """
        cls = class_name.lower()
        
        # Ignored non-navigational background objects
        if cls in ["wall", "tree", "sky", "cloud", "building"]:
            return "IGNORE"
            
        if risk_level == "CRITICAL" or (cls in ["car", "bus", "truck", "motorcycle"] and movement == "APPROACHING"):
            return "CRITICAL"
            
        if risk_level == "HIGH" or cls in ["stairs", "open_drain", "pothole"]:
            return "IMPORTANT"
            
        if risk_level == "CAUTION" or distance in ["VERY_NEAR", "NEAR"]:
            return "INFORMATION"
            
        if distance == "FAR" and risk_level == "SAFE":
            return "IGNORE"
            
        return "INFORMATION"

    def process_frame_detections(
        self,
        detections: List[Dict[str, Any]],
        force_announce: bool = False
    ) -> Dict[str, Any]:
        """
        Evaluates a list of enriched frame detections and selects the most vital guidance instruction.
        """
        if not detections:
            return {
                "instruction": None,
                "priority": "IGNORE",
                "risk_level": "SAFE",
                "risk_score": 0,
                "critical": False,
                "suppressed": False,
                "reason": "No objects detected in frame."
            }

        # Priority ranking comparator
        priority_rank = {"CRITICAL": 4, "IMPORTANT": 3, "INFORMATION": 2, "IGNORE": 1}
        
        # Sort detections by Priority Rank (descending), then Risk Score (descending)
        sorted_detections = sorted(
            detections,
            key=lambda d: (priority_rank.get(d.get("priority", "IGNORE"), 1), d.get("risk_score", 0)),
            reverse=True
        )

        top_candidate = sorted_detections[0]
        top_priority = top_candidate.get("priority", "IGNORE")
        top_risk_score = top_candidate.get("risk_score", 0)
        top_risk_level = top_candidate.get("risk_level", "SAFE")
        
        if top_priority == "IGNORE":
            return {
                "instruction": None,
                "priority": "IGNORE",
                "risk_level": top_risk_level,
                "risk_score": top_risk_score,
                "critical": False,
                "suppressed": True,
                "reason": "Top object is background/low priority."
            }

        instruction = SpeechRules.generate_instruction(
            class_name=top_candidate["class"],
            position=top_candidate["position"],
            distance=top_candidate["distance"],
            movement=top_candidate.get("movement", "STATIONARY"),
            risk_level=top_risk_level
        )

        now = time.time()
        time_since_last = now - self.last_announced_time
        is_critical = (top_priority == "CRITICAL")
        is_duplicate = (instruction == self.last_announced_phrase)

        # 1. Emergency Override Logic: Critical warnings bypass normal 4s cooldown immediately
        if is_critical:
            if is_duplicate and time_since_last < self.critical_cooldown and not force_announce:
                return {
                    "instruction": None,
                    "priority": top_priority,
                    "risk_level": top_risk_level,
                    "risk_score": top_risk_score,
                    "critical": True,
                    "suppressed": True,
                    "reason": f"Critical duplicate suppressed within {self.critical_cooldown}s window."
                }
            # Announce critical alert immediately!
            self.last_announced_time = now
            self.last_announced_phrase = instruction
            self.last_announced_priority = top_priority
            return {
                "instruction": instruction,
                "priority": top_priority,
                "risk_level": top_risk_level,
                "risk_score": top_risk_score,
                "critical": True,
                "suppressed": False,
                "target_object": top_candidate["class"],
                "reason": f"CRITICAL alert override: {top_candidate['class']} approaching/near center."
            }

        # 2. Routine Guidance Logic: Apply normal speech cooldown & duplicate suppression
        if is_duplicate and time_since_last < 10.0 and not force_announce:
            return {
                "instruction": None,
                "priority": top_priority,
                "risk_level": top_risk_level,
                "risk_score": top_risk_score,
                "critical": False,
                "suppressed": True,
                "reason": f"Duplicate instruction '{instruction}' suppressed to avoid repetition."
            }

        if time_since_last < self.normal_cooldown and not force_announce:
            return {
                "instruction": None,
                "priority": top_priority,
                "risk_level": top_risk_level,
                "risk_score": top_risk_score,
                "critical": False,
                "suppressed": True,
                "reason": f"Speech rate limit cooldown active ({time_since_last:.1f}s / {self.normal_cooldown}s)."
            }

        # Announce routine instruction
        self.last_announced_time = now
        self.last_announced_phrase = instruction
        self.last_announced_priority = top_priority
        return {
            "instruction": instruction,
            "priority": top_priority,
            "risk_level": top_risk_level,
            "risk_score": top_risk_score,
            "critical": False,
            "suppressed": False,
            "target_object": top_candidate["class"],
            "reason": f"Routine priority selection: {top_candidate['class']} ({top_priority})."
        }

# Global guidance engine instance
global_guidance_engine = GuidanceEngine()
