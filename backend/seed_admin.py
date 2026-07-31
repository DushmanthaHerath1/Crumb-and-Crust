import models
from database import SessionLocal
from security import get_password_hash

db = SessionLocal()


def seed_admin():
    # Database එකේ දැනටමත් admin කෙනෙක් ඉන්නවද බලනවා
    existing_admin = db.query(models.AdminUser).first()

    if existing_admin:
        print("Admin user already exists!")
        return

    # අලුත් Admin කෙනෙක්ව හදනවා (Owner)
    new_admin = models.AdminUser(
        email="admin@crumbandcrust.com",
        hashed_password=get_password_hash("admin123"),
        role="owner",
    )

    db.add(new_admin)
    db.commit()
    print("Admin user seeded successfully!")
    print("Email: admin@crumbandcrust.com")
    print("Password: admin123")


if __name__ == "__main__":
    seed_admin()
    db.close()
