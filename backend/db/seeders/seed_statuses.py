from db.database import SessionLocal
from models.status import Status


def seed_statuses():
    db = SessionLocal()

    statuses = [
        {"name": "Active", "description": "User is active"},
        {"name": "Inactive", "description": "User is inactive"},
    ]

    for s in statuses:
        exists = db.query(Status).filter(Status.name == s["name"]).first()
        if exists:
            print(f"Status '{s['name']}' already exists, skipping")
            continue

        status = Status(name=s["name"], description=s["description"])
        db.add(status)

    db.commit()
    db.close()
    print("✅ Status seeding completed")
