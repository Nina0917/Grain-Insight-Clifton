import os
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session

from core.config import settings
from core.dependencies import get_current_user
from db.database import get_db
from models.document import Document
from models.status import Status
from models.user import User
from schemas.document import (
    DocumentResponse,
    DocumentStatusResponse,
    DocumentUploadResponse,
)
from tasks.document_tasks import process_document

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("", response_model=list[DocumentResponse])
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    documents = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.uploaded_at.desc())
        .all()
    )

    return documents

@router.get("/{document_id}", response_model=DocumentStatusResponse)
def get_document_status(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return DocumentStatusResponse(
        id=document.id,
        filename=document.original_filename,
        status=document.status,
        result_csv_url=document.result_csv_path,
        result_mask_url=document.result_mask_path,
        error_message="Error Message" if document.status.name == "Error" else None,
    )


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
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

    background_tasks.add_task(
        process_document,
        document.id,
    )

    return DocumentUploadResponse(
        id=document.id,
        filename=document.original_filename,
        status="success",
        message="File uploaded successfully",
    )


@router.get("/{document_id}/download/csv")
def download_csv(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download CSV results file"""
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if document.status.name != "Processed":
        raise HTTPException(status_code=400, detail="Document not processed yet")

    if not document.result_csv_path or not os.path.exists(document.result_csv_path):
        raise HTTPException(status_code=404, detail="CSV file not found")

    filename = f"{os.path.splitext(document.original_filename)[0]}_results.csv"

    return FileResponse(
        path=document.result_csv_path,
        media_type="text/csv",
        filename=filename,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{document_id}/download/mask")
def download_mask(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download mask image file"""
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if document.status.name != "Processed":
        raise HTTPException(status_code=400, detail="Document not processed yet")

    if not document.result_mask_path or not os.path.exists(document.result_mask_path):
        raise HTTPException(status_code=404, detail="Mask image not found")

    filename = f"{os.path.splitext(document.original_filename)[0]}_mask.png"

    return FileResponse(
        path=document.result_mask_path,
        media_type="image/png",
        filename=filename,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{document_id}/download/all")
def download_all(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download all result files as ZIP"""
    import zipfile
    from io import BytesIO

    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if document.status.name != "Processed":
        raise HTTPException(status_code=400, detail="Document not processed yet")

    files_to_zip = []
    if document.result_csv_path and os.path.exists(document.result_csv_path):
        files_to_zip.append(
            (
                document.result_csv_path,
                f"{os.path.splitext(document.original_filename)[0]}_results.csv",
            )
        )
    if document.result_mask_path and os.path.exists(document.result_mask_path):
        files_to_zip.append(
            (
                document.result_mask_path,
                f"{os.path.splitext(document.original_filename)[0]}_mask.png",
            )
        )

    if not files_to_zip:
        raise HTTPException(status_code=404, detail="No result files found")

    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for file_path, archive_name in files_to_zip:
            zip_file.write(file_path, archive_name)

    zip_buffer.seek(0)
    zip_filename = f"{os.path.splitext(document.original_filename)[0]}_results.zip"

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{zip_filename}"'},
    )
