import os
from datetime import datetime
from typing import List

import models
import schemas
import stripe
from database import get_db
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Date, cast
from sqlalchemy.orm import Session

app = FastAPI(title="Crumb & Crust API")

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to Crumb & Crust"}


@app.get("/api/menu", response_model=List[schemas.ProductResponse])
def get_menu(db: Session = Depends(get_db)):
    """Get all product data from database and send to front-end"""

    products = db.query(models.Product).filter(models.Product.is_active.is_(True)).all()
    return products


@app.get("/api/business-rules", response_model=schemas.BusinessRuleResponse)
def get_business_rules(db: Session = Depends(get_db)):
    """
    Rules for configure date picker in front-end
    """
    rule = db.query(models.BusinessRule).first()

    if not rule:
        rule = models.BusinessRule(
            daily_order_cap=50,
            blackout_dates=["2026-12-25"],
            opening_hours_json={"start": "08:00", "end": "14:00"},
            max_advance_days=30,
        )

        db.add(rule)
        db.commit()
        db.refresh(rule)

    else:
        needs_update = False
        if rule.opening_hours_json is None:
            rule.opening_hours_json = {"start": "08:00", "end": "14:00"}
            needs_update = True

        if rule.max_advance_days is None:
            rule.max_advance_days = 30
            needs_update = True

        if needs_update:
            db.commit()
            db.refresh(rule)

    return rule


@app.post("/api/orders", response_model=schemas.OrderResponse, status_code=201)
def create_order(order_data: schemas.OrderCreate, db: Session = Depends(get_db)):
    """
    Compare an order from front-end with business rules, calculate total according to the Zero-Trust rule and finally send to the database if and only if the order is a complate order
    """

    rule = db.query(models.BusinessRule).first()

    if not rule:
        raise HTTPException(
            status_code=500,
            detail="System configuration error: Business rules are not defined in the database.",
        )

    pickup_date_str = order_data.requested_pickup_datetime.date().isoformat()

    if rule:
        if pickup_date_str in rule.blackout_dates:
            raise HTTPException(
                status_code=400, detail="Sorry, we are closed on the requested date."
            )

        days_ahead = (
            order_data.requested_pickup_datetime.date() - datetime.now().date()
        ).days
        if days_ahead > rule.max_advance_days:
            raise HTTPException(
                status_code=400,
                detail=f"Orders can only be placed up to {rule.max_advance_days} days in advance.",
            )

        current_orders_count = (
            db.query(models.Order)
            .filter(
                cast(models.Order.pickup_datetime, Date)
                == order_data.requested_pickup_datetime.date()
            )
            .count()
        )
        if current_orders_count >= rule.daily_order_cap:
            raise HTTPException(
                status_code=400, detail="Sorry, we are fully booked for this date."
            )

    try:
        max_lead_time_hours = 0
        calculated_total = 0
        validated_items = []

        # New Idempotency Ckeck
        existing_order = (
            db.query(models.Order)
            .filter(models.Order.idempotency_key == order_data.idempotency_key)
            .first()
        )

        if existing_order:
            return existing_order

        for item in order_data.cart_items:
            product = (
                db.query(models.Product)
                .filter(models.Product.id == item.product_id)
                .first()
            )
            if not product or not product.is_active:
                raise HTTPException(
                    status_code=201,
                    detail=f"Product ID {item.product_id} is unavailable.",
                )

            if product.lead_time_h > max_lead_time_hours:
                max_lead_time_hours = product.lead_time_h

            line_total = product.price * item.quantity
            calculated_total += line_total

            validated_items.append({"product": product, "quantity": item.quantity})

        time_difference = order_data.requested_pickup_datetime.replace(
            tzinfo=None
        ) - datetime.now().replace(tzinfo=None)
        hours_difference = time_difference.total_seconds() / 3600

        if hours_difference < max_lead_time_hours:
            raise HTTPException(
                status_code=400,
                detail=f"Minimum lead time not met. Your cart requires at least {max_lead_time_hours} hours of preparation.",
            )

        customer_data_dict = order_data.customer_details.model_dump()

        new_order = models.Order(
            customer_json=customer_data_dict,
            pickup_datetime=order_data.requested_pickup_datetime,
            status="pending",
            idempotency_key=order_data.idempotency_key,  # Parsing idempotency key
        )
        db.add(new_order)
        db.flush()

        for v_item in validated_items:
            new_item = models.OrderItem(
                order_id=new_order.id,
                product_id=v_item["product"].id,
                quantity=v_item["quantity"],
                # unit_price=v_item["product"].price,
                subtotal=v_item["product"].price * v_item["quantity"],
            )
            db.add(new_item)

        db.commit()
        db.refresh(new_order)

        calculated_total_cents = int(calculated_total * 100)

        if stripe.api_key == "sk_test_dummy_key_for_mocking" or not stripe.api_key:
            session_id = f"mock_sess_{new_order.id}"
            checkout_url = f"{FRONTEND_URL}/mock-checkout?session_id={session_id}"

        else:
            try:
                stripe_session = stripe.checkout.Session.create(
                    payment_method_types=["card"],
                    line_items=[
                        {
                            "price_data": {
                                "currency": "aud",
                                "product_data": {
                                    "name": f"Crumb & Crust Order #{new_order.id}",
                                },
                                "unit_amount": calculated_total_cents,
                            },
                            "quantity": 1,
                        }
                    ],
                    mode="payment",
                    success_url=f"{FRONTEND_URL}/success?session_id={{CHECKOUT_SESSION_ID}}",
                    cancel_url=f"{FRONTEND_URL}",
                    client_reference_id=str(new_order.id),
                )
                session_id = stripe_session.id
                checkout_url = stripe_session.url

            except Exception as e:
                db.rollback()
                raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")

        new_order.stripe_session_id = session_id
        db.commit()

        return {
            "id": new_order.id,
            "status": new_order.status,
            "pickup_datetime": new_order.pickup_datetime,
            "stripe_session_id": session_id,
            "checkout_url": checkout_url,
        }

        # return new_order #this guy is blurred after new code implementation
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
