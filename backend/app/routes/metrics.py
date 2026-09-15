import os
import json
from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["Metrics"])

METRICS_FILE_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "models", "metrics.json")

@router.get("/metrics")
def get_metrics():
    """
    GET /api/metrics
    Loads model evaluation metrics from models/metrics.json if custom training was run.
    If metrics.json does not exist, returns evaluation_available: False so the dashboard displays
    'Custom model evaluation not available.' without fabricating fake metrics.
    """
    if os.path.exists(METRICS_FILE_PATH):
        try:
            with open(METRICS_FILE_PATH, "r") as f:
                data = json.load(f)
                data["evaluation_available"] = True
                return data
        except Exception as e:
            print(f"[Metrics Warning] Failed to read metrics.json: {e}")

    # Honest fallback when custom model training has not been executed yet
    return {
        "evaluation_available": False,
        "message": "Custom model evaluation not available.",
        "metrics": None,
        "training": None,
        "confusion_matrix": None
    }
