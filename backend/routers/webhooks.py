#stdlib
import json

#local
import config
import models
from database import get_db

#thirdparty
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session
import stripe

router = APIRouter(tags=["Webhooks"])

@router.post("/api/webhooks/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
    db: Session = Depends(get_db),
):
    payload = await request.body()

    if config.IS_MOCK_STRIPE:
        try:
            event = json.loads(payload)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON payload")
    else:
        if not config.STRIPE_WEBHOOK_SECRET:
            raise HTTPException(status_code=500, detail="Webhook secret not configured")
        try:
            event = stripe.Webhook.construct_event(
                payload, stripe_signature, config.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="invalid signature")

    if event.get("type") == "checkout.session.completed":
        session_id = event["data"]["object"]["id"]
        order = (
            db.query(models.Order)
            .filter(models.Order.stripe_session_id == session_id)
            .first()
        )

        if order:
            if order.status == "pending":
                order.status = "paid"
                db.commit()
                print(f"Success: Order {order.id} status changed to PAID!")
            else:
                print(f"Idempotency: Order {order.id} is already processed.")
        else:
            print(f"ERROR: Order not found for session ID {session_id}")

    return {"status": "success"}