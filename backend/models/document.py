from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from db.database import Base


class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User")

    status_id = Column(Integer, ForeignKey("statuses.id"), nullable=False)
    status = relationship("Status")

    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    content_type = Column(String(100), nullable=False)
    result_csv_path = Column(String(512), nullable=True)
    result_mask_path = Column(String(512), nullable=True)
    uploaded_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
