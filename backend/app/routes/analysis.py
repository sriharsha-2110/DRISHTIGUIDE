from fastapi import APIRouter, File, UploadFile, Query, HTTPException, status
from app.detection.preprocessing import validate_and_decode_image
from app.detection.detector import detector_service
from app.guidance.guidance_engine import global_guidance_engine

router = APIRouter(prefix="/api", tags=["Analysis"])

@router.post("/analyze")
async def analyze_frame(
    file: UploadFile = File(...),
    force: bool = Query(False, description="Force speech announcement bypassing cooldown for demo testing")
):
    """
    POST /api/analyze
    Receives an image payload, executes YOLO object detection, spatial position classification,
    approximate distance estimation, temporal movement analysis, dynamic risk scoring,
    and priority guidance generation.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Image file required (JPEG, PNG, WEBP)."
        )

    image_bytes = await file.read()
    img_bgr = validate_and_decode_image(image_bytes)

    detections, processing_time_ms = detector_service.detect(img_bgr)
    
    guidance_result = global_guidance_engine.process_frame_detections(
        detections=detections,
        force_announce=force
    )

    top_movement = "STATIONARY"
    if detections:
        top_item = max(detections, key=lambda d: d.get("risk_score", 0))
        top_movement = top_item.get("movement", "STATIONARY")

    instruction_text = guidance_result.get("instruction") or ""

    return {
        "detections": detections,
        "risk_score": guidance_result.get("risk_score", 0),
        "risk_level": guidance_result.get("risk_level", "SAFE"),
        "instruction": instruction_text,
        "priority": guidance_result.get("priority", "NONE"),
        "critical": guidance_result.get("critical", False),
        "suppressed": guidance_result.get("suppressed", False),
        "reason": guidance_result.get("reason", ""),
        "movement": top_movement,
        "processing_time_ms": processing_time_ms
    }
