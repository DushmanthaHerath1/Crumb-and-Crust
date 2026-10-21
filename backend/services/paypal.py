#stdlib
from decimal import Decimal, ROUND_HALF_UP
import logging
import time
from typing import Any, Dict, Optional
import httpx

#local
import config

logger = logging.getLogger(__name__)

# In-memory token cache (to be replaced with Redis)
_token_cache: Dict[str, Any] = {
    "access_token": None,
    "expires_at": 0.0,
}

def format_amount(amount: Any) -> str:
    """Format any numeric/decimal price into a strict 2-decimal string like '12.50'."""
    dec = Decimal(str(amount))
    return str(dec.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

async def get_access_token(client: httpx.AsyncClient) -> str:
    """
    Fetch or return a valid OAuth 2.0 bearer token using client credentials.
    Caches token in-memory and refreshes 60 seconds before expiration.
    """
    now = time.time()
    if _token_cache["access_token"] and _token_cache["expires_at"] - 60 > now:
        return _token_cache["access_token"]
    url = f"{config.PAYPAL_API_BASE}/v1/oauth2/token"
    try:
        response = await client.post(
            url,
            auth=(config.PAYPAL_CLIENT_ID, config.PAYPAL_CLIENT_SECRET),
            data={"grant_type": "client_credentials"},
            headers={"Accept": "application/json", "Accept-Language": "en_US"},
            timeout=15.0,
        )
        response.raise_for_status()
        data = response.json()
    except httpx.HTTPStatusError as e:
        logger.error("PayPal OAuth failed with status %s: %s", e.response.status_code, e.response.text)
        raise RuntimeError("Failed to authenticate with PayPal") from e
    except Exception as e:
        logger.error("PayPal OAuth connection error: %s", str(e))
        raise RuntimeError("PayPal service is currently unreachable") from e
    token = data["access_token"]
    expires_in = data.get("expires_in", 3600)
    _token_cache["access_token"] = token
    _token_cache["expires_at"] = now + float(expires_in)
    return token


async def create_order(
    client: httpx.AsyncClient,
    order_id: int,
    total_price: Any,
    idempotency_key: str,
) -> Dict[str, Any]:
    """
    Create a PayPal v2 checkout order.
    Amount is strictly determined by backend database calculations.
    """
    token = await get_access_token(client)
    url = f"{config.PAYPAL_API_BASE}/v2/checkout/orders"
    formatted_total = format_amount(total_price)
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "PayPal-Request-Id": idempotency_key,  # Prevents double order creation on retries
    }
    payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "reference_id": str(order_id),
                "custom_id": str(order_id),
                "invoice_id": f"CC-{order_id}-{int(time.time())}",  # PayPal prevents duplicate payments for the same invoice ID. added {int(time.time())} to prevent edge cases
                "description": f"Crumb & Crust Bakery Order #{order_id}",
                "amount": {
                    "currency_code": config.PAYPAL_CURRENCY,
                    "value": formatted_total,
                },
            }
        ],
        "payment_source": {
            "paypal": {
                "experience_context": {
                    "shipping_preference": "NO_SHIPPING",  # Pickup only
                    "user_action": "PAY_NOW",
                    "brand_name": "Crumb & Crust",
                }
            }
        },
    }
    try:
        response = await client.post(url, headers=headers, json=payload, timeout=20.0)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        logger.error("PayPal create_order error %s: %s", e.response.status_code, e.response.text)
        raise RuntimeError("PayPal failed to create order") from e
    except Exception as e:
        logger.error("PayPal create_order network error: %s", str(e))
        raise RuntimeError("Payment gateway unreachable") from e


async def capture_order(
    client: httpx.AsyncClient,
    paypal_order_id: str,
    idempotency_key: str,
) -> Dict[str, Any]:
    """
    Capture an authorized payment for an approved PayPal order.
    """
    token = await get_access_token(client)
    url = f"{config.PAYPAL_API_BASE}/v2/checkout/orders/{paypal_order_id}/capture"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "PayPal-Request-Id": idempotency_key,
    }
    try:
        response = await client.post(url, headers=headers, json={}, timeout=20.0)
        # Note: If PayPal returns 422 (e.g. INSTRUMENT_DECLINED), we capture the response text
        # to allow graceful recovery in routers.orders
        if response.status_code in (400, 422):
            return response.json()
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        logger.error("PayPal capture error %s: %s", e.response.status_code, e.response.text)
        raise RuntimeError("PayPal payment capture failed") from e
    except Exception as e:
        logger.error("PayPal capture network error: %s", str(e))
        raise RuntimeError("Payment gateway unreachable during capture") from e



async def verify_webhook_signature(
    client: httpx.AsyncClient,
    headers: Dict[str, str],
    raw_body: bytes,
    event_json: Dict[str, Any],
) -> bool:
    """
    Verify incoming PayPal webhook authenticity against PayPal's verification endpoint.
    Guarantees no spoofed payment confirmations are processed.
    """
    if not config.PAYPAL_WEBHOOK_ID:
        logger.error("PAYPAL_WEBHOOK_ID is not configured. Webhook verification rejected.")
        return False
    token = await get_access_token(client)
    url = f"{config.PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature"
    
    lower_headers = {k.lower(): v for k, v in headers.items()} # PayPal headers are case-insensitive in HTTP, but standardizing extraction:
    verification_payload = {
        "auth_algo": lower_headers.get("paypal-auth-algo"),
        "cert_url": lower_headers.get("paypal-cert-url"),
        "transmission_id": lower_headers.get("paypal-transmission-id"),
        "transmission_sig": lower_headers.get("paypal-transmission-sig"),
        "transmission_time": lower_headers.get("paypal-transmission-time"),
        "webhook_id": config.PAYPAL_WEBHOOK_ID,
        "webhook_event": event_json,
    }
    # Verify all required verification headers exist
    for key, val in verification_payload.items():
        if val is None:
            logger.warning("Missing required PayPal verification header: %s", key)
            return False
    try:
        response = await client.post(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json=verification_payload,
            timeout=15.0,
        )
        response.raise_for_status()
        data = response.json()
        return data.get("verification_status") == "SUCCESS"
    except Exception as e:
        logger.error("Error verifying PayPal webhook signature: %s", str(e))
        return False

