from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from db.database import Base


class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)

    users = relationship("User", back_populates="role")
    description = Column(String(255))
