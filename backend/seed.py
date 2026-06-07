import models
from database import SessionLocal


def seed_products():
    db = SessionLocal()

    try:
        if db.query(models.Product).count() > 0:
            print("Products already exist in the database. Seeding skipped.")
            return

        products = [
            models.Product(
                name="Classic Sourdough", price=850.00, lead_time_h=48, is_active=True
            ),
            models.Product(
                name="Almond Croissant", price=550.00, lead_time_h=24, is_active=True
            ),
            models.Product(
                name="Pain au Chocolat", price=450.00, lead_time_h=24, is_active=True
            ),
            models.Product(
                name="Baguette", price=400.00, lead_time_h=48, is_active=True
            ),
            models.Product(
                name="Cinnamon Scroll", price=350.00, lead_time_h=24, is_active=False
            ),
        ]

        db.add_all(products)
        db.commit()

        print("Successfully seeded the database with initial products!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database{e}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_products()
