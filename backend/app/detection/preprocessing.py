import io
import numpy as np
from PIL import Image
from fastapi import HTTPException, status
from app.config import settings

# Safe optional import of OpenCV
try:
    import cv2
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False

def validate_and_decode_image(image_bytes: bytes) -> np.ndarray:
    """
    Validates payload size, decodes JPEG/PNG image bytes into RGB/BGR numpy array,
    and resizes to target processing dimensions (default: 640x480).
    """
    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty image payload received."
        )
    
    if len(image_bytes) > settings.MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image size exceeds limit of {settings.MAX_IMAGE_SIZE_BYTES / (1024*1024):.1f} MB"
        )

    try:
        pil_image = Image.open(io.BytesIO(image_bytes))
        pil_image = pil_image.convert("RGB")
        
        if pil_image.width != settings.IMAGE_WIDTH or pil_image.height != settings.IMAGE_HEIGHT:
            pil_image = pil_image.resize((settings.IMAGE_WIDTH, settings.IMAGE_HEIGHT), Image.Resampling.LANCZOS)
            
        img_np = np.array(pil_image)
        
        if HAS_OPENCV:
            img_out = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        else:
            img_out = img_np

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid or corrupted image format: {str(e)}"
        )

    return img_out
