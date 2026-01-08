import logging
import os
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

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

# from dependencies.auth import get_current_user

UPLOAD_DIR = "uploads/documents"

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("", response_model=list[DocumentResponse])
def list_documents(
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user),
):
    current_user = db.query(User).first()  # TODO: 替换为实际用户获取逻辑

    documents = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.uploaded_at.desc())
        .all()
    )

    return documents


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):

    # 1. 确保目录存在
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # 2. 生成安全的文件名
    ext = os.path.splitext(file.filename)[1]
    stored_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, stored_filename)

    # 3. 流式保存文件到磁盘（重点）
    with open(file_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):
            buffer.write(chunk)

    processing_status = db.query(Status).filter(Status.name == "Processing").first()

    # 4. 创建 document 记录
    document = Document(
        user_id=1,  # TODO: 替换为实际用户 ID
        original_filename=file.filename,
        stored_filename=stored_filename,
        file_path=file_path,
        content_type=file.content_type,
        status_id=processing_status.id,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

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

@router.get("/{document_id}", response_model=DocumentStatusResponse)
def get_document_status(
    document_id: int,
    db: Session = Depends(get_db),
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id)
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
        error_message="Error Message",
    )