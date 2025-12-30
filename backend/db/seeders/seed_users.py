from models.status import Status
from models.role import Role
from db.database import SessionLocal, create_tables
from models.user import User
from core.security import get_password_hash


def seed_users():
    db = SessionLocal()

     # 查询对应的 status_id
    status = db.query(Status).filter(Status.name == "Active").first()
    role_admin = db.query(Role).filter(Role.name == "Admin").first()
    role_user = db.query(Role).filter(Role.name == "User").first()

    users = [
        {
            "email": "admin@example.com",
            "password": "password",
            "first_name": "Admin",
            "last_name": "User",
            "status_id": status.id if status else 1,
            "role_id": role_admin.id if role_admin else 1,
        },
        {
            "email": "user@example.com",
            "password": "password",
            "first_name": "Regular",
            "last_name": "User",
            "status_id": status.id if status else 1,
            "role_id": role_user.id if role_user else 2,
        },
    ]

    for u in users:
        exists = db.query(User).filter(User.email == u["email"]).first()
        if exists:
            print(f"User {u['email']} already exists, skipping")
            continue

        user = User(
            email=u["email"],
            password=get_password_hash(u["password"]),
            first_name=u["first_name"],
            last_name=u["last_name"],
            status_id=u["status_id"],
            role_id=u["role_id"],
        )

        db.add(user)

    db.commit()
    db.close()
    print("✅ User seeding completed")
