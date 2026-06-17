from datetime import datetime
from typing import List

import models
import schemas
from database import get_db
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Date, cast
from sqlalchemy.orm import Session

app = FastAPI(title="Crumb & Crust API")

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
        customer_data_dict = order_data.customer_details.model_dump()

        new_order = models.Order(
            customer_json=customer_data_dict,
            pickup_datetime=order_data.requested_pickup_datetime,
            status="pending",
        )
        db.add(new_order)
        db.flush()

        calculated_total = 0

        for item in order_data.cart_items:
            product = (
                db.query(models.Product)
                .filter(models.Product.id == item.product_id)
                .first()
            )

            if not product or not product.is_active:
                raise HTTPException(
                    status_code=400,
                    detail=f"Product ID {item.product_id} is unavailable.",
                )

            line_total = product.price * item.quantity
            calculated_total += line_total

            new_item = models.OrderItem(
                order_id=new_order.id,
                product_id=product.id,
                quantity=item.quantity,
                unit_price=product.price,
            )
            db.add(new_item)

        db.commit()
        db.refresh(new_order)

        return new_order

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
