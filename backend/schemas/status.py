from typing import Optional

from pydantic import BaseModel


class StatusResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True