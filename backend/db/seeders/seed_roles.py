from db.database import SessionLocal
from models.role import Role


def seed_roles():
    db = SessionLocal()

    roles = [
        {"name": "Admin", "description": "Administrator with full access"},
        {"name": "User", "description": "Regular user with limited access"},
    ]

    for r in roles:
        exists = db.query(Role).filter(Role.name == r["name"]).first()
        if exists:
            print(f"Role '{r['name']}' already exists, skipping")
            continue

        role = Role(name=r["name"], description=r["description"])
        db.add(role)

    db.commit()
    db.close()
    print("✅ Role seeding completed")
