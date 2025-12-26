from typing import List

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
