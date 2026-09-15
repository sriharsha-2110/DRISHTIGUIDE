from fastapi import APIRouter
from app.config import settings
from app.models.model_loader import ModelLoader

router = APIRouter(prefix="/api", tags=["Health"])

@router.get("/health")
def get_health():
    loader = ModelLoader.get_instance()
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "tagline": settings.TAGLINE,
        "model_status": loader.load_status,
        "model_name": loader.get_info()["model_name"]
    }
