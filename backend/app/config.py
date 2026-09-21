import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "DRISHTIGUIDE AI"
    VERSION: str = "1.0.0"
    TAGLINE: str = "Let AI Be Your Eyes."
    
    # Model Configuration
    MODEL_PATH: str = os.getenv("MODEL_PATH", "models/best.pt" if os.path.exists("models/best.pt") else "yolov8n.pt")
    CONFIDENCE_THRESHOLD: float = 0.25
    IOU_THRESHOLD: float = 0.45
    
    # Image Input Configuration
    IMAGE_WIDTH: int = 640
    IMAGE_HEIGHT: int = 480
    IMAGE_QUALITY: int = 70
    FRAME_INTERVAL: float = 4.0  # seconds between routine announcements
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "https://drishti-ai-backend-vwl4.onrender.com",
        "https://drishti-ai-frontend-vwl4.onrender.com",
        "https://drishtiguide-ai.onrender.com",
        "https://drishti-ai-frontend.onrender.com",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]
    
    # Maximum frame size (10 MB)
    MAX_IMAGE_SIZE_BYTES: int = 10 * 1024 * 1024
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
