from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    """Login request schema"""

    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Login response schema"""

    access_token: str
    token_type: str = "bearer"
    user: dict

    class Config:
        from_attributes = True


class UserInfo(BaseModel):
    """User information schema (without password)"""

    id: int
    first_name: str
    last_name: str
    email: str
    role_id: int
    role_name: Optional[str] = None
    status_id: int

    class Config:
        from_attributes = True
