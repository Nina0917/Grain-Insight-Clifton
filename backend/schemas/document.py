from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from schemas.status import StatusResponse


class DocumentResponse(BaseModel):
    id: int
    user_id: int
    status_id: int
    original_filename: str
    stored_filename: str
    file_path: str
    content_type: str
    uploaded_at: datetime
    status: StatusResponse

    class Config:
        from_attributes = True


class DocumentUploadResponse(BaseModel):
    id: int
    filename: str
    status: str
    message: str


class DocumentStatusResponse(BaseModel):
    id: int
    filename: str
    status: StatusResponse

    result_csv_url: Optional[str] = None
    result_mask_url: Optional[str] = None
    error_message: Optional[str] = None
