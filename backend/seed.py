import models
from database import SessionLocal


def seed_products():
    db = SessionLocal()

    try:
        if db.query(models.Product).count() > 0:
            print("Products already exist in the database. Seeding skipped.")
            return

        products = [
            # ── Breads ────────────────────────────────────────────────────────
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
            ),
            # ── Pastries ──────────────────────────────────────────────────────
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
            ),
        ]

        db.add_all(products)
        db.commit()

        print(f"Successfully seeded {len(products)} products!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_products()
