from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.database import get_db
from models.user import User
from schemas.user import GetAllUsersResponse, UserOut

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=GetAllUsersResponse)
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return GetAllUsersResponse(users=users)


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserOut(
        id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        status_id=user.status_id,
        role_id=user.role_id,
        created_at=user.created_at.isoformat(),
        updated_at=user.updated_at.isoformat(),
    )
