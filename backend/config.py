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

def _require(name: str) -> str:
    """Read a required env var or stop the app at startup"""
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"{name} environment variable is not set")
    return value

PAYPAL_ENV = os.getenv("PAYPAL_ENV", "sandbox").strip().lower()
_PAYPAL_API_BASES = {
    "sandbox": "https://api-m.sandbox.paypal.com",
    "live": "https://api-m.paypal.com",
}

if PAYPAL_ENV not in _PAYPAL_API_BASES:
    raise RuntimeError("PAYPAL_ENV must be 'sandbox' or 'live'")

PAYPAL_API_BASE = _PAYPAL_API_BASES[PAYPAL_ENV]
PAYPAL_CLIENT_ID = _require("PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = _require("PAYPAL_CLIENT_SECRET")
PAYPAL_CURRENCY = os.getenv("PAYPAL_CURRENCY", "USD").strip().upper()

PAYPAL_WEBHOOK_ID = os.getenv("PAYPAL_WEBHOOK_ID")
if PAYPAL_ENV == "live" and not PAYPAL_WEBHOOK_ID:
    raise RuntimeError("PAYPAL_WEBHOOK_ID is required when PAYPAL_ENV=live")

PENDING_HOLD_MINUTES = int(os.getenv("PENDING_HOLD_MINUTES", "30"))
