"""
reset_db.py — Full database wipe + re-seed for development.

WARNING: This deletes ALL data from every table. Dev use only.
Run from the backend/ directory:
    uv run python reset_db.py
"""

import models
import security
from database import SessionLocal


def wipe_all(db):
    """Delete all rows in FK-safe order. No DROP TABLE — schema stays intact."""
    print("  Wiping order_status_history ...")
    db.query(models.OrderStatusHistory).delete()

    print("  Wiping order_items ...")
    db.query(models.OrderItem).delete()

    print("  Wiping orders ...")
    db.query(models.Order).delete()

    print("  Wiping products ...")
    db.query(models.Product).delete()

    print("  Wiping admin_users ...")
    db.query(models.AdminUser).delete()

    print("  Wiping business_rules ...")
    db.query(models.BusinessRule).delete()

    db.commit()
    print("  All tables cleared.\n")


def seed_products(db):
    products = [
        # ── Breads ────────────────────────────────────────────────────────────
        models.Product(
            name="Signature Classic Sourdough",
            price=18.00,
            category="Breads",
            description=(
                "Our crown jewel. A 48-hour cold-fermented country loaf with a "
                "deeply caramelised crust, wild open crumb, and complex tang. "
                "Made with 20% freshly milled heritage wheat."
            ),
            image_url=None,
            lead_time_h=48,
            is_active=True,
            is_featured=False,
        ),
        models.Product(
            name="Special Sourdough",
            price=22.00,
            category="Breads",
            description=(
                "A rotating baker's special — expect inclusions like toasted "
                "walnuts & dried fig, roasted garlic & rosemary, or seeded rye. "
                "Check with us for this week's flavour."
            ),
            image_url=None,
            lead_time_h=48,
            is_active=True,
            is_featured=True,
        ),
        models.Product(
            name="Daily Baguette",
            price=6.00,
            category="Breads",
            description=(
                "A classic French baguette baked fresh each morning — thin, "
                "crackly golden crust with a chewy, hole-riddled interior. "
                "Perfect torn and eaten straight from the bag."
            ),
            image_url=None,
            lead_time_h=24,
            is_active=True,
            is_featured=False,
        ),
        models.Product(
            name="Plain Baguette",
            price=5.00,
            category="Breads",
            description=(
                "A straightforward, no-fuss baguette made with just flour, water, "
                "salt, and time. Light and mild — ideal for sandwiches or alongside "
                "soups and cheese boards."
            ),
            image_url=None,
            lead_time_h=24,
            is_active=True,
            is_featured=False,
        ),
        models.Product(
            name="Olive Focaccia",
            price=12.00,
            category="Breads",
            description=(
                "Thick, pillowy focaccia dimpled with Kalamata olives, fresh "
                "rosemary, and a generous pour of extra-virgin olive oil. "
                "Slightly crisp on the outside, fluffy and airy within."
            ),
            image_url=None,
            lead_time_h=24,
            is_active=True,
            is_featured=False,
        ),
        models.Product(
            name="Black Garlic Focaccia",
            price=14.00,
            category="Breads",
            description=(
                "A bold twist on our classic focaccia — swirled with slow-roasted "
                "black garlic paste and scattered with sea salt flakes. Rich, "
                "umami-forward, and deeply savoury."
            ),
            image_url=None,
            lead_time_h=24,
            is_active=False,  # Coming soon — not yet on the menu
            is_featured=False,
        ),
        # ── Pastries ──────────────────────────────────────────────────────────
        models.Product(
            name="Almond Croissant",
            price=7.50,
            category="Pastries",
            description=(
                "Twice-baked buttery croissant filled with silky frangipane, "
                "finished with toasted flaked almonds and a dusting of icing sugar. "
                "Rich and indulgent."
            ),
            image_url=None,
            lead_time_h=24,
            is_active=True,
            is_featured=False,
        ),
        models.Product(
            name="Regular Croissant",
            price=5.50,
            category="Pastries",
            description=(
                "Classically laminated with 27 layers of butter. Crisp, "
                "honeycomb-textured shell with a soft, doughy pull-apart interior. "
                "Simple, perfected."
            ),
            image_url=None,
            lead_time_h=24,
            is_active=True,
            is_featured=False,
        ),
        models.Product(
            name="Pain au Chocolat",
            price=6.50,
            category="Pastries",
            description=(
                "Two batons of Valrhona dark chocolate encased in our house "
                "laminated dough. Shatteringly crisp outside, molten chocolate "
                "at the centre when warm."
            ),
            image_url=None,
            lead_time_h=24,
            is_active=True,
            is_featured=False,
        ),
        models.Product(
            name="Pain au Vanilla",
            price=6.50,
            category="Pastries",
            description=(
                "Laminated pastry filled with a generous stripe of Madagascan "
                "vanilla custard cream. Delicate, fragrant, and lightly sweet — "
                "a softer alternative to pain au chocolat."
            ),
            image_url=None,
            lead_time_h=24,
            is_active=False,  # Temporarily off menu — returning next week
            is_featured=False,
        ),
    ]
    db.add_all(products)
    db.commit()
    print(f"  Seeded {len(products)} products.")


def seed_admin(db):
    admin = models.AdminUser(
        email="admin@crumbandcrust.com",
        hashed_password=security.get_password_hash("admin123"),
        role="owner",
        full_name="Admin Owner",
    )
    db.add(admin)
    db.commit()
    print("  Seeded admin user.")
    print("    Email   : admin@crumbandcrust.com")
    print("    Password: admin123")


def seed_business_rules(db):
    rule = models.BusinessRule(
        daily_order_cap=50,
        blackout_dates=[],
        opening_hours_json={"start": "08:00", "end": "14:00"},
        max_advance_days=30,
    )
    db.add(rule)
    db.commit()
    print("  Seeded business rules.")


def main():
    print("=" * 50)
    print("  Crumb & Crust — Database Reset")
    print("=" * 50)
    print()
    print("  WARNING: This will delete ALL data.")
    confirm = input("  Type 'yes' to continue: ").strip().lower()

    if confirm != "yes":
        print("  Aborted. No changes made.")
        return

    db = SessionLocal()
    try:
        print("\n[ 1/2 ] Wiping tables...")
        wipe_all(db)

        print("[ 2/2 ] Seeding fresh data...")
        seed_products(db)
        seed_admin(db)
        seed_business_rules(db)

        print()
        print("  Done! Database is clean and ready.")
        print("=" * 50)

    except Exception as e:
        db.rollback()
        print(f"\n  ERROR: {e}")
        print("  Rolled back. No changes were saved.")

    finally:
        db.close()


if __name__ == "__main__":
    main()
