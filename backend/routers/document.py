import os
import uuid
import zipfile
from io import BytesIO

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


# Helper function for new file path convention
def get_result_file_path(document_id: int, suffix: str) -> str:
    """Get result file path based on new directory structure."""
    return f"storage/analyze_results/{document_id}/document_{document_id}{suffix}"


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

    try:
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    uploaded_status = db.query(Status).filter(Status.name == "Uploaded").first()

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

    background_tasks.add_task(process_document, document.id)

    return DocumentUploadResponse(
        id=document.id,
        filename=document.original_filename,
        status="success",
        message="File uploaded successfully",
    )


# Download endpoints


def _get_document_or_404(
    document_id: int,
    db: Session,
    current_user: User,
    require_processed: bool = True,
) -> Document:
    """Helper to get document with common validation."""
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if require_processed and document.status.name != "Processed":
        raise HTTPException(status_code=400, detail="Document not processed yet")

    return document


@router.get("/{document_id}/download/csv")
def download_csv(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download summary CSV file."""
    document = _get_document_or_404(document_id, db, current_user)

    file_path = get_result_file_path(document_id, "_summary.csv")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="CSV file not found")

    filename = f"{os.path.splitext(document.original_filename)[0]}_summary.csv"

    return FileResponse(
        path=file_path,
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
    """Download mask PNG file."""
    document = _get_document_or_404(document_id, db, current_user)

    file_path = get_result_file_path(document_id, "_mask.png")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Mask image not found")

    filename = f"{os.path.splitext(document.original_filename)[0]}_mask.png"

    return FileResponse(
        path=file_path,
        media_type="image/png",
        filename=filename,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{document_id}/download/grains")
def download_grains(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download grains visualization image."""
    document = _get_document_or_404(document_id, db, current_user)

    file_path = get_result_file_path(document_id, "_grains.jpg")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Grains image not found")

    filename = f"{os.path.splitext(document.original_filename)[0]}_grains.jpg"

    return FileResponse(
        path=file_path,
        media_type="image/jpeg",
        filename=filename,
    )


@router.get("/{document_id}/download/histogram")
def download_histogram(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download size histogram image."""
    document = _get_document_or_404(document_id, db, current_user)

    file_path = get_result_file_path(document_id, "_summary.jpg")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Histogram image not found")

    filename = f"{os.path.splitext(document.original_filename)[0]}_histogram.jpg"

    return FileResponse(
        path=file_path,
        media_type="image/jpeg",
        filename=filename,
    )


@router.get("/{document_id}/download/geojson")
def download_geojson(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download GeoJSON file."""
    document = _get_document_or_404(document_id, db, current_user)

    file_path = get_result_file_path(document_id, "_grains.geojson")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="GeoJSON file not found")

    filename = f"{os.path.splitext(document.original_filename)[0]}_grains.geojson"

    return FileResponse(
        path=file_path,
        media_type="application/geo+json",
        filename=filename,
    )


@router.get("/{document_id}/download/mask-preview")
def download_mask_preview(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download mask preview image (JPG)."""
    document = _get_document_or_404(document_id, db, current_user)

    file_path = get_result_file_path(document_id, "_mask2.jpg")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Mask preview not found")

    filename = f"{os.path.splitext(document.original_filename)[0]}_mask_preview.jpg"

    return FileResponse(
        path=file_path,
        media_type="image/jpeg",
        filename=filename,
    )


@router.get("/{document_id}/download/all")
def download_all(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download all result files as ZIP."""
    document = _get_document_or_404(document_id, db, current_user)

    base_name = os.path.splitext(document.original_filename)[0]

    # All possible result files
    result_files = [
        ("_grains.jpg", f"{base_name}_grains.jpg"),
        ("_grains.geojson", f"{base_name}_grains.geojson"),
        ("_summary.csv", f"{base_name}_summary.csv"),
        ("_summary.jpg", f"{base_name}_histogram.jpg"),
        ("_mask.png", f"{base_name}_mask.png"),
        ("_mask2.jpg", f"{base_name}_mask_preview.jpg"),
    ]

    files_to_zip = []
    for suffix, archive_name in result_files:
        file_path = get_result_file_path(document_id, suffix)
        if os.path.exists(file_path):
            files_to_zip.append((file_path, archive_name))

    if not files_to_zip:
        raise HTTPException(status_code=404, detail="No result files found")

    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for file_path, archive_name in files_to_zip:
            zip_file.write(file_path, archive_name)

    zip_buffer.seek(0)
    zip_filename = f"{base_name}_results.zip"

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{zip_filename}"'},
    )
