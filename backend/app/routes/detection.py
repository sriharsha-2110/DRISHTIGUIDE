from fastapi import APIRouter, File, UploadFile, HTTPException, status
from app.detection.preprocessing import validate_and_decode_image
from app.detection.detector import detector_service

router = APIRouter(prefix="/api", tags=["Detection"])

@router.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    """
    POST /api/detect
    Receives an image file via multipart/form-data, decodes it,
    runs YOLO object detection, and returns detections with horizontal position & distance.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Image file required (JPEG, PNG, WEBP)."
        )
        
    image_bytes = await file.read()
    img_bgr = validate_and_decode_image(image_bytes)
    
    detections, processing_time_ms = detector_service.detect(img_bgr)
    
    # Strip extra research fields for basic detect schema compliance
    clean_detections = []
    for d in detections:
        clean_detections.append({
            "class": d["class"],
            "confidence": d["confidence"],
            "bbox": d["bbox"],
            "position": d["position"],
            "distance": d["distance"]
        })

    return {
        "detections": clean_detections,
        "processing_time_ms": processing_time_ms
    }
