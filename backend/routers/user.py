from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.database import get_db
from models.user import User
from schemas.user import UserUpdate, UserCreate, GetAllUsersResponse, UserOut

from datetime import datetime

from core.security import get_password_hash

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
                created_at=u.created_at.isoformat(),
                updated_at=u.updated_at.isoformat(),
            )
            for u in users
        ]
    )


# # http://localhost:8000/api/users/1
# @router.get("/{user_id}", response_model=UserOut)
# def get_user(user_id: int, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.id == user_id).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     return UserOut(
#         id=user.id,
#         first_name=user.first_name,
#         last_name=user.last_name,
#         email=user.email,
#         status_id=user.status_id,
#         role_id=user.role_id,
#         created_at=user.created_at.isoformat(),
#         updated_at=user.updated_at.isoformat(),
#     )

# create new user
@router.post("/", response_model=UserOut)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    # check email to prevent dupicate
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    # create new user
    user = User(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        password=get_password_hash(payload.password),
        role_id=payload.role_id,
        status_id=payload.status_id,
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

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

@router.patch("/{user_id}", response_model=UserOut)
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # check email to prevent duplicate
    if payload.email != user.email:
        existing = db.query(User).filter(User.email == payload.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")

    user.first_name = payload.first_name
    user.last_name = payload.last_name
    user.email = payload.email
    user.role_id = payload.role_id
    user.status_id = payload.status_id

    # password is optional
    if payload.password and payload.password.strip():
        user.password = get_password_hash(payload.password.strip())

    # only change the update time
    user.updated_at = datetime.now()

    db.commit()
    db.refresh(user)

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