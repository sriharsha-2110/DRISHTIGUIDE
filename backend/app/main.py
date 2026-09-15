import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.routes import health, detection, analysis, model_info, metrics, dataset

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="DRISHTIGUIDE AI — Let AI Be Your Eyes: Deep Learning Visual Assistance System."
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Router Blueprints
app.include_router(health.router)
app.include_router(detection.router)
app.include_router(analysis.router)
app.include_router(model_info.router)
app.include_router(metrics.router)
app.include_router(dataset.router)

# Mount datasets static folder if available
datasets_path = os.path.join(os.path.dirname(__file__), "..", "..", "datasets")
if os.path.exists(datasets_path):
    app.mount("/datasets", StaticFiles(directory=datasets_path), name="datasets")

@app.get("/")
def read_root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} Backend API",
        "tagline": settings.TAGLINE,
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
