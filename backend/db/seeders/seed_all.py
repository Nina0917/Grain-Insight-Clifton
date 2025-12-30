from db.seeders.seed_users import seed_users
from db.seeders.seed_roles import seed_roles
from db.seeders.seed_statuses import seed_statuses

from db.database import SessionLocal
from models.user import User
from models.role import Role
from models.status import Status

def clear_tables():
    db = SessionLocal()
    try:
        db.query(User).delete()
        db.query(Role).delete()
        db.query(Status).delete()
        db.commit()
        print("🧹 All tables cleared!")
    finally:
        db.close()


def run_all_seeders():
    print("🌱 Start seeding...")
    clear_tables()
    seed_roles()
    seed_statuses()
    seed_users()
    print("✅ All seeders completed")


if __name__ == "__main__":
    run_all_seeders()
