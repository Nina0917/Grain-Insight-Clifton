from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from db.database import Base


class Status(Base):
    __tablename__ = "statuses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    users = relationship("User", back_populates="status")
    description = Column(String(255))
