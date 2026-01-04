import os
import uuid

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from db.database import get_db
from models.document import Document
from models.status import Status

UPLOAD_DIR = "uploads/documents"

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):

    # Ensure upload directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    ext = os.path.splitext(file.filename)[1]
    stored_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, stored_filename)

    # Save file to disk
    with open(file_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):
            buffer.write(chunk)

    uploaded_status = db.query(Status).filter(Status.name == "Uploaded").first()

    # Create document record in database
    document = Document(
        user_id=1, # In a real app, get the user ID from the authenticated user
        original_filename=file.filename,
        stored_filename=stored_filename,
        file_path=file_path,
        content_type=file.content_type,
        status_id=uploaded_status.id,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return JSONResponse(
        content={
            "id": document.id,
            "filename": document.original_filename,
            "status": uploaded_status.name,
            "message": "Upload successful",
        }
    )
