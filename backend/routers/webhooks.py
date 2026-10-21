# stdlib
from datetime import datetime, timezone
import json
import logging

# local
import config
from database import get_db
import models
from services import paypal as paypal_service

# thirdparty
from fastapi import APIRouter, Depends, HTTPException, Request, status
import httpx
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Webhooks"])


@router.post("/api/webhooks/paypal", status_code=status.HTTP_200_OK)
async def paypal_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle incoming PayPal webhooks with mandatory signature verification. Processed events:
    - PAYMENT.CAPTURE.COMPLETED: Confirms order paid if client capture
    - PAYMENT.CAPTURE.DENIED / DECLINED: Marks order as failed
    - PAYMENT.CAPTURE.DENIED / DECLINED: Marks order as failed
    - PAYMENT.CAPTURE.REFUNDED / REVERSED: Marks order as refunded
    """
    raw_body = await request.body()

    try:
        event = json.loads(raw_body)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload",
        )

    async with httpx.AsyncClient() as client:
        is_valid = await paypal_service.verify_webhook_signature(
            client=client,
            headers=dict(request.headers),
            raw_body=raw_body,
            event_json=event,
        )

    if not is_valid:
        logger.warning("PayPal webhook signature verification failed.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature",
        )
    
    event_type = event.get("event_type")
    resource = event.get("resource", {})
    logger.info(f"Received verified PayPal webhook:{event_type}", )


    if event_type == "PAYMENT.CAPTURE.COMPLETED":
        capture_id = resource.get("id")
        supplementary_data = resource.get("supplementary_data", {})
        related_ids = supplementary_data.get("related_ids", {})
        paypal_order_id = related_ids.get("order_id")
        custom_id = resource.get("custom_id")  

        order = None
        if paypal_order_id:
            order = db.query(models.Order).filter(models.Order.paypal_order_id == paypal_order_id).first()

        if not order and custom_id and custom_id.isdigit():
            order = db.query(models.Order).filter(models.Order.id == int(custom_id)).first()

        if not order:
            logger.error(f"Webhook: No order found for PayPal Order ID {paypal_order_id} or Custom ID {custom_id}")
            return {"status": "ignored_unknown_order"}


        amount_data = resource.get("amount", {})
        captured_currency = amount_data.get("currency_code")
        captured_value = amount_data.get("value")
        expected_amount = paypal_service.format_amount(order.total_price)

        if captured_currency != config.PAYPAL_CURRENCY or captured_value != expected_amount:
            logger.error(
                "Webhook amount mismatch on Order #%s! Expected %s %s, received %s %s",
                order.id, 
                config.PAYPAL_CURRENCY, 
                expected_amount, 
                captured_currency, 
                captured_value,
            )
            return {"status": "amount_mismatch_ignored"}

        if order.status == "pending":
            order.status = "paid"
            order.paid_at = datetime.now(timezone.utc)
            order.paypal_capture_id = capture_id
            db.commit()
            logger.info(f"Webhook: Order #{order.id} marked as PAID via capture {capture_id}")

        else: 
            logger.info(f"Webhook: Order #{order.id} already in status '{order.status}'")

    elif event_type in ("PAYMENT.CAPTURE.DENIED", "PAYMENT.CAPTURE.DECLINED"):
        capture_id = resource.get("id")
        order = db.query(models.Order).filter(models.Order.paypal_capture_id == capture_id).first()
        if order and order.status != "failed":
            order.status = "failed"
            db.commit()
            logger.warning(f"Webhook: Order #{order.id} marked as FAILED due to capture event {event_type}")

    elif event_type in ("PAYMENT.CAPTURE.REFUNDED", "PAYMENT.CAPTURE.REVERSED"):
        links = resource.get("links", [])
        up_link = next((l.get("href", "") for l in links if l.get("rel") == "up"), "")
        parent_capture_id = up_link.rstrip("/").split("/")[-1] if up_link else None

        order = None
        if parent_capture_id:
            order = db.query(models.Order).filter(models.Order.paypal_capture_id == parent_capture_id).first()

        if order and order.status != "refunded":
            order.status = "refunded"
            db.commit()
            logger.info("Webhook: Order #%s marked as REFUNDED", order.id)
    

    # Always return HTTP 200 for recognized & verified webhooks so PayPal does not continuously retry
    return {"status": "success"}







        
