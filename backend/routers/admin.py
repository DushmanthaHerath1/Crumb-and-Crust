#stdlib
from fastapi import APIRouter
from typing import List

#local
import models
import schemas
import security
from database import get_db
from dependencies import get_current_admin

#thirdparty
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# admin login endpoint
@router.post("/login")
def admin_login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """Authenticate an admin user and return a JWT token (OAuth2 compatible)."""
    user = (
        db.query(models.AdminUser)
        .filter(models.AdminUser.email == form_data.username)
        .first()
    )

    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = security.create_access_token(
        data={"sub": user.email, "role": user.role, "user_id": user.id}
    )
    return {"access_token": access_token, "token_type": "bearer"}


# test: endpoint for view orders (secured)
@router.get("/orders", response_model=List[schemas.AdminOrderResponse])
def get_all_orders(
    db: Session = Depends(get_db),
    current_admin: models.AdminUser = Depends(get_current_admin),
):
    """Get all orders (only accessible by logged-in admins)"""
    return db.query(models.Order).order_by(models.Order.pickup_datetime.asc()).all()


@router.patch("/orders/{order_id}/status", response_model=schemas.AdminOrderResponse)
def update_order_status(
    order_id: int,
    status_update: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_admin: models.AdminUser = Depends(get_current_admin),
):
    """Update status of an order and create an audit trail record."""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    old_status = order.status
    order.status = status_update.new_status

    history_record = models.OrderStatusHistory(
        order_id=order.id,
        changed_by_user_id=current_admin.id,
        old_status=old_status,
        new_status=status_update.new_status,
    )

    try:
        db.add(history_record)
        db.commit()
        db.refresh(order)
        return order
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database transaction failed{e}")
