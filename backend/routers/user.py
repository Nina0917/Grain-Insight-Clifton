from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.database import get_db
from models.user import User
from schemas.user import GetAllUsersResponse, UserOut

# api object defineds everything starts with /users and categorized as users
router = APIRouter(prefix="/users", tags=["users"])

# # http://localhost:8000/api/users/
# @router.get("/", response_model=GetAllUsersResponse)
# def get_all_users(db: Session = Depends(get_db)):
#     users = db.query(User).all()
#     return GetAllUsersResponse(users=users)

# test for ORM TO Pydantic transformation
@router.get("/", response_model=GetAllUsersResponse)
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()

    return GetAllUsersResponse(
        users=[
            UserOut(
                id=u.id,
                first_name=u.first_name,
                last_name=u.last_name,
                email=u.email,
                status_id=u.status_id,
                role_id=u.role_id,
                created_at=u.created_at.isoformat() if u.created_at else None,
                updated_at=u.updated_at.isoformat() if u.updated_at else None,
            )
            for u in users
        ]
    )


# http://localhost:8000/api/users/1
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
        created_at=user.created_at.isoformat() if user.created_at else None,
        updated_at=user.updated_at.isoformat() if user.updated_at else None,
    )
