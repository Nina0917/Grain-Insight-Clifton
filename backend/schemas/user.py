from typing import List, Optional

from pydantic import BaseModel


class UserOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    status_id: int
    role_id: int
    created_at: str
    updated_at: str

    class Config:
        orm_mode = True


class GetAllUsersResponse(BaseModel):
    users: List[UserOut]


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    status_id: int
    role_id: int


class UserUpdate(BaseModel):
    first_name: str
    last_name: str
    email: str
    role_id: int
    status_id: int
    password: Optional[str] = None
