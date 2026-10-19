#local
import models
import schemas
import config
from database import get_db
from services.scheduling import validate_pickup

#thirdparty
import stripe
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(tags=["Orders"])

@router.post("/api/orders", response_model=schemas.OrderResponse, status_code=201)
def create_order(order_data: schemas.OrderCreate, db: Session = Depends(get_db)):
    """
    Compare an order from front-end with business rules, calculate total
    according to the Zero-Trust rule and send to the database only if
    the order is complete and valid.
    """
    existing_order = (
        db.query(models.Order)
        .filter(models.Order.idempotency_key == order_data.idempotency_key)
        .first()
    )

    if existing_order:
        checkout_url = None
        if config.IS_MOCK_STRIPE:
            checkout_url = f"{config.FRONTEND_URL}/mock-checkout?session_id={existing_order.stripe_session_id}"
        elif existing_order.stripe_session_id:
            try:
                stripe_session = stripe.checkout.Session.retrieve(existing_order.stripe_session_id)
                checkout_url = stripe_session.url
            except Exception:
                pass
        return {
            "id": existing_order.id,
            "status": existing_order.status,
            "pickup_datetime": existing_order.pickup_datetime,
            "stripe_session_id": existing_order.stripe_session_id,
            "checkout_url": checkout_url,
        }

    rule = db.query(models.BusinessRule).first()
    if not rule:
        raise HTTPException(
            status_code=500,
            detail="System configuration error: Business rules are not defined in the database.",
        )

    try:
        max_lead_time_hours = 0
        calculated_total = 0
        validated_items = []

        for item in order_data.cart_items:
            product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
            if not product or not product.is_active:
                raise HTTPException(status_code=400, detail=f"Product ID {item.product_id} is unavailable.")

            if product.lead_time_h > max_lead_time_hours:
                max_lead_time_hours = product.lead_time_h

            calculated_total += product.price * item.quantity
            validated_items.append({"product": product, "quantity": item.quantity})

        validate_pickup(order_data.requested_pickup_datetime, rule, max_lead_time_hours, db)

        new_order = models.Order(
            customer_json=order_data.customer_details.model_dump(),
            pickup_datetime=order_data.requested_pickup_datetime,
            status="pending",
            total_price=calculated_total,
            idempotency_key=order_data.idempotency_key,
        )
        db.add(new_order)
        db.flush()

        for v_item in validated_items:
            db.add(models.OrderItem(
                order_id=new_order.id,
                product_id=v_item["product"].id,
                quantity=v_item["quantity"],
                subtotal=v_item["product"].price * v_item["quantity"],
            ))

        db.commit()
        db.refresh(new_order)

        calculated_total_cents = int(calculated_total * 100)

        if config.IS_MOCK_STRIPE:
            session_id = f"mock_sess_{new_order.id}"
            checkout_url = f"{config.FRONTEND_URL}/mock-checkout?session_id={session_id}"
        else:
            try:
                stripe_session = stripe.checkout.Session.create(
                    payment_method_types=["card"],
                    line_items=[{
                        "price_data": {
                            "currency": "aud",
                            "product_data": {"name": f"Crumb & Crust Order #{new_order.id}"},
                            "unit_amount": calculated_total_cents,
                        },
                        "quantity": 1,
                    }],
                    mode="payment",
                    success_url=f"{config.FRONTEND_URL}/success?session_id={{CHECKOUT_SESSION_ID}}",
                    cancel_url=f"{config.FRONTEND_URL}",
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

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
