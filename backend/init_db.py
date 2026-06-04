import models  # noqa: F401
from database import Base, engine

print("Creating database tables in Supabase...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully! Database is ready.")
