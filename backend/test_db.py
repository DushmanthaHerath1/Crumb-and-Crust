from database import engine


def test_connection():
    try:
        with engine.connect() as connection:
            print("Successfully connected to the Supabase PostgreSQL database!")

    except Exception as e:
        print("Connection failed! Check your .env file and network.")
        print("Error details:", e)


if __name__ == "__main__":
    test_connection()
