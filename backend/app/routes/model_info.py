from fastapi import APIRouter
from app.models.model_loader import ModelLoader

router = APIRouter(prefix="/api", tags=["Model Info"])

@router.get("/model-info")
def get_model_info():
    loader = ModelLoader.get_instance()
    return loader.get_info()
