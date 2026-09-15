from typing import Tuple, Dict, Any

class SpatialAnalyzer:
    """
    Computes spatial positioning, approximate distance, and walking path alignment
    for detected objects based on bounding box heuristics.
    """
    
    @staticmethod
    def get_horizontal_position(bbox: Tuple[float, float, float, float], img_width: float) -> str:
        """
        Calculates horizontal position based on the center of the bounding box:
        x_center < 33% width -> LEFT
        33% <= x_center <= 66% width -> CENTER
        x_center > 66% width -> RIGHT
        """
        x1, y1, x2, y2 = bbox
        center_x = (x1 + x2) / 2.0
        ratio = center_x / float(img_width)
        
        if ratio < 0.33:
            return "LEFT"
        elif ratio <= 0.66:
            return "CENTER"
        else:
            return "RIGHT"

    @staticmethod
    def estimate_approximate_distance(bbox: Tuple[float, float, float, float], img_width: float, img_height: float) -> str:
        """
        Heuristic-based approximate distance estimation using bounding box height ratio
        and bottom y coordinate relative to total frame height.
        
        Levels:
        - VERY_NEAR: height ratio > 0.45 or y2 > 0.85 (occupies substantial frame height or close to ground bottom)
        - NEAR: height ratio 0.25 - 0.45 or y2 > 0.70
        - MEDIUM: height ratio 0.12 - 0.25
        - FAR: height ratio < 0.12
        """
        x1, y1, x2, y2 = bbox
        box_height = abs(y2 - y1)
        box_width = abs(x2 - x1)
        
        height_ratio = box_height / float(img_height)
        area_ratio = (box_width * box_height) / float(img_width * img_height)
        bottom_ratio = y2 / float(img_height)
        
        if height_ratio >= 0.45 or area_ratio >= 0.25 or bottom_ratio >= 0.88:
            return "VERY_NEAR"
        elif height_ratio >= 0.25 or area_ratio >= 0.10 or bottom_ratio >= 0.70:
            return "NEAR"
        elif height_ratio >= 0.10 or area_ratio >= 0.03:
            return "MEDIUM"
        else:
            return "FAR"

    @staticmethod
    def get_walking_path_zone(bbox: Tuple[float, float, float, float], img_width: float) -> str:
        """
        Determines which zone of the direct walking path the object overlaps.
        """
        position = SpatialAnalyzer.get_horizontal_position(bbox, img_width)
        if position == "CENTER":
            return "CENTER PATH"
        elif position == "LEFT":
            return "LEFT PATH"
        else:
            return "RIGHT PATH"
