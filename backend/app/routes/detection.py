from fastapi import APIRouter, File, UploadFile, HTTPException, status
from app.detection.preprocessing import validate_and_decode_image
from app.detection.detector import detector_service

router = APIRouter(prefix="/api", tags=["Detection"])

@router.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    """
    POST /api/detect
    Receives an image file, executes YOLO detection, and returns detections
    enriched with 20-object class mapping, emoji, and multilingual translations.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Image file required (JPEG, PNG, WEBP)."
        )
        
    image_bytes = await file.read()
    img_bgr = validate_and_decode_image(image_bytes)
    
    detections, processing_time_ms = detector_service.detect(img_bgr)

    return {
        "detections": detections,
        "processing_time_ms": processing_time_ms
    }
