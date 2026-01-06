import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from core.config import settings
from core.dependencies import get_current_user
from db.database import get_db
from models.document import Document
from models.status import Status
from models.user import User

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    allowed_extensions = set(
        ext.strip() for ext in settings.ALLOWED_EXTENSIONS.split(",")
    )
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file_ext}' not allowed. Allowed types: {settings.ALLOWED_EXTENSIONS}",
        )

    contents = await file.read()
    file_size = len(contents)

    if file_size > settings.MAX_FILE_SIZE:
        max_size_mb = settings.MAX_FILE_SIZE / 1024 / 1024
        raise HTTPException(
            status_code=400,
            detail=f"File size ({file_size / 1024 / 1024:.2f}MB) exceeds maximum allowed size ({max_size_mb}MB)",
        )

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    stored_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, stored_filename)

    # Save file to disk
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    uploaded_status = db.query(Status).filter(Status.name == "Uploaded").first()

    if not uploaded_status:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=500, detail="Uploaded status not found in database"
        )
    # Create document record in database
    document = Document(
        user_id=current_user.id,
        original_filename=file.filename,
        stored_filename=stored_filename,
        file_path=file_path,
        content_type=file.content_type,
        status_id=uploaded_status.id,
    )
    try:
        db.add(document)
        db.commit()
        db.refresh(document)
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return JSONResponse(
        content={
            "id": document.id,
            "filename": document.original_filename,
            "status": uploaded_status.name,
            "message": "Upload successful",
        }
    )
