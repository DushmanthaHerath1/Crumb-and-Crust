# stdlib
from decimal import Decimal
import logging
from datetime import datetime, timezone

# local
import config
from database import get_db
import models
import schemas
from services import paypal as paypal_service
from services.scheduling import validate_pickup, is_hold_expired, has_capacity

# thirdparty
from fastapi import APIRouter, Depends, HTTPException, status
import httpx
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Orders"])

@router.post("/api/orders", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order_data: schemas.OrderCreate, db: Session = Depends(get_db)):
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
        if existing_order.status == "paid":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An order with this request key has already been paid and completed.",
            )

        if existing_order.status != "pending" or is_hold_expired(existing_order):
            if existing_order.status == "pending":
                existing_order.status = "failed"
                db.commit()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Your checkout session expired. Please try again.",
            )

        return {
            "id": existing_order.id,
            "status": existing_order.status,
            "pickup_datetime": existing_order.pickup_datetime,
            "total_price": float(existing_order.total_price) if existing_order.total_price is not None else None,
            "paypal_order_id": existing_order.paypal_order_id,
        }

    rule = db.query(models.BusinessRule).first()
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="System configuration error: Business rules are not defined in the database.",
        )

    try:
        max_lead_time_hours = 0
        calculated_total = Decimal("0.00")
        validated_items = []

        for item in order_data.cart_items:
            product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
            if not product or not product.is_active:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Product ID {item.product_id} is unavailable.")

            if product.lead_time_h > max_lead_time_hours:
                max_lead_time_hours = product.lead_time_h

            
            item_price = Decimal(str(product.price))
            calculated_total += item_price * item.quantity
            validated_items.append({"product": product, "quantity": item.quantity, "subtotal": item_price * item.quantity})

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
                subtotal=v_item["subtotal"],
            ))

        db.commit()
        db.refresh(new_order)

        # Initiate PayPal Order
        async with httpx.AsyncClient() as client:
            try: 
                paypal_order = await paypal_service.create_order(
                    client=client,
                    order_id=new_order.id,
                    total_price=new_order.total_price,
                    idempotency_key=order_data.idempotency_key
                )
                paypal_order_id = paypal_order["id"]
            except Exception as e: 
                #if paypal fails, rollback
                logger.error(f"Failed to create Paypal Order for Order #{new_order.id}: {str(e)}")

                new_order.status = "failed"
                db.commit()
                raise HTTPException(status_code = status.HTTP_502_BAD_GATEWAY, detail="Payment gateway error. Unable to initiate PayPal checkout session.")

        new_order.paypal_order_id = paypal_order_id
        db.commit()

        return {
            "id": new_order.id,
            "status": new_order.status,
            "pickup_datetime": new_order.pickup_datetime,
            "total_price": float(new_order.total_price),
            "paypal_order_id": paypal_order_id,
        }
    
    except HTTPException:
        raise 
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error creating order: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing your order.",
        )

@router.post(
    "/api/orders/{paypal_order_id}/capture", 
    response_model=schemas.OrderCaptureResponse,
    status_code=status.HTTP_200_OK
)
async def capture_order(paypal_order_id: str, db: Session = Depends(get_db)):
    """
    Capture an authorized PayPal payment after customer approval in PayPal popup.
    Validates amount, currency, and custom_id before marking the order as paid.
    """
    order = (
        db.query(models.Order)
        .filter(models.Order.paypal_order_id == paypal_order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found for the provided PayPal order ID.",
        )


    if order.status == "paid":
        return {
            "order_id": order.id,
            "status": order.status,
            "paypal_order_id": order.paypal_order_id,
            "paypal_capture_id": order.paypal_capture_id,
            "pickup_datetime": order.pickup_datetime,
        }

    if order.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This order can no longer be paid. Please start a new checkout.",
        )
    #handle hold-expires gracefully
    if is_hold_expired(order):
        rule = db.query(models.BusinessRule).first()
        if not rule or not has_capacity(db, order.pickup_datetime, rule):
            order.status = "failed"
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Sorry, this pickup date filled up while you were paying. You have not been charged.",
            )

    idempotency_key = f"capture-{order.id}"
    async with httpx.AsyncClient() as client:
        try:
            capture_data = await paypal_service.capture_order(
                client=client,
                paypal_order_id=paypal_order_id,
                idempotency_key=idempotency_key,
            )
        except Exception as e:
            logger.error(f"Capture call error for order #{order.id}: {str(e)}")

            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail = "Payment gateway communication error during capture.",
            )
    # Handle Funding Instrument Failures
    if "details" in capture_data:
        for detail in capture_data["details"]:
            issue = detail.get("issue")
            if issue == "INSTRUMENT_DECLINED":
                raise HTTPException(
                    status_code = status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail="INSTRUMENT_DECLINED",
                )
            if issue == "ORDER_ALREADY_CAPTURED":
                db.refresh(order)
                if order.status == "paid":
                    return {
                        "order_id": order.id,
                        "status": order.status,
                        "paypal_order_id": order.paypal_order_id,
                        "paypal_capture_id": order.paypal_capture_id,
                        "pickup_datetime": order.pickup_datetime,
                    }
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="This PayPal order has already been captured, but internal record is not marked paid. Please contact support.",
                )

    purchase_units = capture_data.get("purchase_units", [])
    if not purchase_units:
        logger.error(f"No purchase_units in PayPal capture response: {capture_data}", )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid response from payment gateway.",
        )
    
    payments = purchase_units[0].get("payments", {})
    captures = payments.get("captures", [])
    if not captures:
        logger.error(f"No captures found in purchase_units: {capture_data}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment capture could not be completed.",
        )

    capture_item = captures[0]
    capture_status = capture_item.get("status")
    capture_id = capture_item.get("id")
    amount_info = capture_item.get("amount", {})
    captured_currency = amount_info.get("currency_code")
    captured_value = amount_info.get("value")

    #validate: Status must be COMPLETED
    if capture_status != "COMPLETED":
        logger.warning(
            "PayPal capture status for order #%s is not COMPLETED: %s",
            order.id,
            capture_status,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment status is {capture_status}. Order cannot be marked as paid.",
        )

    
    #validate: Currency and Amount must match with DB
    expected_amount = paypal_service.format_amount(order.total_price)
    if captured_currency != config.PAYPAL_CURRENCY or captured_value != expected_amount:
        logger.error(
            "Amount mismatch on order #%s! Expected: %s %s, Received: %s %s",
            order.id,
            config.PAYPAL_CURRENCY,
            expected_amount,
            captured_currency,
            captured_value,
            )
        raise HTTPException(
                status_code = status.HTTP_400_BAD_REQUEST,
                detail=" Payment validation error: amount or currency mismatch."
            )

    order.status = "paid"
    order.paid_at = datetime.now(timezone.utc)
    order.paypal_capture_id = capture_id
    db.commit()
    db.refresh(order)

    logger.info(f"Order #{order.id} successfully paid via PayPal capture ID {capture_id}")

    return {
        "order_id": order.id,
        "status": order.status,
        "paypal_order_id": order.paypal_order_id,
        "paypal_capture_id": order.paypal_capture_id,
        "pickup_datetime": order.pickup_datetime,
        }
    

