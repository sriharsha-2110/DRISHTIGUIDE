from typing import Dict, Any

class SpeechRules:
    """
    Generates short, actionable voice phrases designed for earphone audio delivery,
    explicitly announcing the detected object name and position to assist visually impaired users.
    """

    @staticmethod
    def generate_instruction(
        class_name: str,
        position: str,
        distance: str,
        movement: str,
        risk_level: str
    ) -> str:
        cls = class_name.lower().replace("_", " ")
        
        # 1. Emergency & Approaching Vehicles
        if cls in ["car", "bus", "truck", "motorcycle", "vehicle"] and movement == "APPROACHING":
            if position == "CENTER":
                return f"STOP. {cls.capitalize()} approaching."
            else:
                return f"STOP. {cls.capitalize()} approaching from your {position.lower()}."
                
        if cls == "bicycle" and movement == "APPROACHING":
            if position == "CENTER":
                return "Bicycle approaching ahead."
            else:
                return f"Bicycle approaching from your {position.lower()}."

        # 2. Ground & Fall Hazards
        if cls == "stairs":
            if position == "CENTER":
                return "Stairs detected ahead. Move carefully."
            else:
                return f"Stairs detected on your {position.lower()}."

        if cls == "pothole":
            return "Pothole detected ahead. Step carefully."

        if cls in ["open drain", "open_drain"]:
            return "Danger. Open drain detected ahead."
            
        if cls == "curb" and distance in ["VERY_NEAR", "NEAR"]:
            return "Curb detected ahead. Watch your step."

        # 3. Structural Doors & Furniture Obstacles
        if cls == "door":
            if position == "CENTER":
                return "Door detected ahead."
            else:
                return f"Door detected on your {position.lower()}."

        if cls in ["chair", "table", "bench", "trash bin", "trash_bin", "pole", "barrier"]:
            if distance in ["VERY_NEAR", "NEAR", "MEDIUM"]:
                if position == "CENTER":
                    return f"{cls.capitalize()} detected directly ahead."
                else:
                    return f"{cls.capitalize()} detected on your {position.lower()}."

        # 4. People & Animals
        if cls == "person":
            if position == "CENTER":
                return "Person detected ahead."
            else:
                return f"Person detected on your {position.lower()}."

        if cls == "animal":
            return f"Animal detected on your {position.lower()}."

        # 5. Generic Object Fallback Format
        pos_str = "ahead" if position == "CENTER" else f"on your {position.lower()}"
        return f"{cls.capitalize()} detected {pos_str}."
