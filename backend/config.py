import os
from dotenv import load_dotenv
from zoneinfo import ZoneInfo

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL")

_bakery_tz_name = os.getenv("BAKERY_TZ")
if not _bakery_tz_name:
    raise RuntimeError("BAKERY_TZ environment variable is not set")
BAKERY_TZ = ZoneInfo(_bakery_tz_name)
SLOT_MINUTES = 120

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
IS_MOCK_STRIPE = (not STRIPE_SECRET_KEY) or STRIPE_SECRET_KEY == "sk_test_dummy_key_for_mocking"