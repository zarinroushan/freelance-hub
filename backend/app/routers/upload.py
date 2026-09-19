import os
import uuid
import base64
import logging
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from typing import Optional
from app.core.config import settings
from app.core.security import get_current_user

router = APIRouter()
logger = logging.getLogger("unigigs.upload")

# Try importing cloudinary SDK
try:
    import cloudinary
    import cloudinary.uploader
    CLOUDINARY_AVAILABLE = True
except ImportError:
    CLOUDINARY_AVAILABLE = False


def is_cloudinary_configured() -> bool:
    return bool(
        CLOUDINARY_AVAILABLE
        and settings.CLOUDINARY_CLOUD_NAME
        and settings.CLOUDINARY_API_KEY
        and settings.CLOUDINARY_API_SECRET
    )


def configure_cloudinary():
    """Configure cloudinary lazily on each call to pick up env vars correctly."""
    if is_cloudinary_configured():
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True,
        )
        return True
    return False


@router.get("/config")
def get_upload_config():
    """Returns Cloudinary configuration status."""
    return {
        "configured": is_cloudinary_configured(),
        "cloud_name": settings.CLOUDINARY_CLOUD_NAME,
        "upload_preset": settings.CLOUDINARY_UPLOAD_PRESET,
    }


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    folder: Optional[str] = "unigigs/images",
    current_user: dict = Depends(get_current_user),
):
    """
    Upload an image file to Cloudinary (or fallback if unconfigured).
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, detail="File provided is not an image"
        )

    content = await file.read()
    
    if configure_cloudinary():
        try:
            result = cloudinary.uploader.upload(
                content,
                folder=folder,
                resource_type="image",
            )
            return {
                "url": result.get("secure_url") or result.get("url"),
                "public_id": result.get("public_id"),
                "format": result.get("format"),
                "bytes": result.get("bytes"),
                "provider": "cloudinary",
            }
        except Exception as e:
            logger.error("Cloudinary image upload failed: %s", e, exc_info=True)
            raise HTTPException(
                status_code=500, detail=f"Cloudinary upload failed: {str(e)}"
            )

    # Fallback: Cloudinary not configured — return base64 data URL
    encoded = base64.b64encode(content).decode("utf-8")
    data_url = f"data:{file.content_type};base64,{encoded}"
    return {
        "url": data_url,
        "public_id": f"local_{uuid.uuid4().hex[:8]}",
        "format": file.content_type.split("/")[-1],
        "bytes": len(content),
        "provider": "fallback_base64",
    }


@router.post("/file")
async def upload_file(
    file: UploadFile = File(...),
    folder: Optional[str] = "unigigs/documents",
    current_user: dict = Depends(get_current_user),
):
    """
    Upload a general file (PDF, DOCX, ZIP, etc.) to Cloudinary (or fallback).
    """
    content = await file.read()

    if configure_cloudinary():
        try:
            result = cloudinary.uploader.upload(
                content,
                folder=folder,
                resource_type="auto",
            )
            return {
                "url": result.get("secure_url") or result.get("url"),
                "public_id": result.get("public_id"),
                "format": result.get("format"),
                "bytes": result.get("bytes"),
                "filename": file.filename,
                "provider": "cloudinary",
            }
        except Exception as e:
            logger.error("Cloudinary file upload failed: %s", e, exc_info=True)
            raise HTTPException(
                status_code=500, detail=f"Cloudinary file upload failed: {str(e)}"
            )

    # Fallback: Cloudinary not configured — return base64 data URL
    encoded = base64.b64encode(content).decode("utf-8")
    data_url = f"data:{file.content_type or 'application/octet-stream'};base64,{encoded}"
    return {
        "url": data_url,
        "public_id": f"local_file_{uuid.uuid4().hex[:8]}",
        "format": file.filename.split(".")[-1] if "." in file.filename else "bin",
        "bytes": len(content),
        "filename": file.filename,
        "provider": "fallback_base64",
    }
