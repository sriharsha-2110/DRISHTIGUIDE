from fastapi import APIRouter, File, UploadFile, HTTPException, status
from app.detection.preprocessing import validate_and_decode_image
from app.detection.detector import detector_service

router = APIRouter(prefix="/api", tags=["Detection"])

@router.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    """
    POST /api/detect
    Receives an actual camera image frame, executes real YOLO inference,
    and returns detected classes, confidence floats, and bounding box coordinates.
    Returns 'No object detected. Please adjust the camera.' when detections list is empty.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Image file required (JPEG, PNG, WEBP)."
        )

    image_bytes = await file.read()
    img_bgr = validate_and_decode_image(image_bytes)

    detections, processing_time_ms = detector_service.detect(img_bgr)

    if not detections:
        return {
            "success": True,
            "detections": [],
            "message": "No object detected. Please adjust the camera.",
            "processing_time_ms": processing_time_ms
        }

    return {
        "success": True,
        "detections": detections,
        "message": None,
        "processing_time_ms": processing_time_ms
    }
