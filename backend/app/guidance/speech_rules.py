from typing import Dict, Any

class SpeechRules:
    """
    Generates short, actionable voice phrases designed for earphone audio delivery.
    """

    @staticmethod
    def generate_instruction(
        class_name: str,
        position: str,
        distance: str,
        movement: str,
        risk_level: str
    ) -> str:
        cls = class_name.lower()
        
        # 1. Emergency & Vehicles (Approaching)
        if cls in ["car", "bus", "truck", "motorcycle"] and movement == "APPROACHING":
            if position == "CENTER":
                return "STOP. Vehicle approaching."
            elif position == "LEFT":
                return "Vehicle approaching from your left."
            else:
                return "Vehicle approaching from your right."
                
        if cls == "bicycle" and movement == "APPROACHING":
            if position == "CENTER":
                return "Bicycle approaching ahead."
            else:
                return f"Bicycle approaching from your {position.lower()}."

        # 2. Critical Fall / Ground Hazards
        if cls == "stairs":
            if position == "CENTER":
                return "Stairs ahead. Move carefully."
            else:
                return f"Stairs on your {position.lower()}."

        if cls == "pothole":
            return "Pothole ahead. Step carefully."

        if cls == "open_drain":
            return "Danger. Open drain ahead."
            
        if cls == "curb" and distance in ["VERY_NEAR", "NEAR"]:
            return "Curb ahead. Watch your step."

        # 3. Structural Barriers / Doors
        if cls == "door":
            if position == "CENTER":
                return "Door ahead."
            else:
                return f"Door on your {position.lower()}."

        if cls in ["chair", "table", "bench", "trash_bin", "pole", "barrier"]:
            if distance in ["VERY_NEAR", "NEAR", "MEDIUM"]:
                if position == "CENTER":
                    return "Obstacle directly ahead."
                else:
                    return f"Obstacle on your {position.lower()}."

        # 4. People & Animals
        if cls == "person":
            if position == "CENTER":
                return "Person ahead."
            else:
                return f"Person on your {position.lower()}."

        if cls == "animal":
            return f"Animal detected on your {position.lower()}."

        # 5. Default Fallback Formats
        pos_str = "ahead" if position == "CENTER" else f"on your {position.lower()}"
        return f"{class_name.capitalize()} {pos_str}."
