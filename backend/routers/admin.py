#stdlib
import logging
from typing import List, Optional
from datetime import date

#local
import models
import schemas
import security
from database import get_db
from dependencies import get_current_admin

#thirdparty
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import Date, cast
from sqlalchemy.orm import Session, selectinload

logger = logging.getLogger(__name__)

ALLOWED_STATUS_TRANSITIONS = {
    "paid": ["ready_for_pickup"],
    "ready_for_pickup": ["completed"],
}

KITCHEN_VISIBLE_STATUSES = ["paid", "ready_for_pickup", "completed"]

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
    pickup_date: Optional[date] = Query(None, alias="date", description="Filter by pickup date YYYY-MM-DD"),
    status: Optional[str] = Query(None, description="Filter by order status"),
    db: Session = Depends(get_db),
    current_admin: models.AdminUser = Depends(get_current_admin),
):
    """Get all orders (only accessible by logged-in admins). Excludes unpaid/pending/failed orders by default."""
    query = db.query(models.Order).options(selectinload(models.Order.items).selectinload(models.OrderItem.product))

    if status:
        query = query.filter(models.Order.status == status)
    else:
        query = query.filter(models.Order.status.in_(KITCHEN_VISIBLE_STATUSES))

    if pickup_date:
        query = query.filter(cast(models.Order.pickup_datetime, Date) == pickup_date)

    return query.order_by(models.Order.pickup_datetime.asc()).all()


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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Order not found"
            )

    allowed = ALLOWED_STATUS_TRANSITIONS.get(order.status, [])
    if status_update.new_status not in allowed:
        raise HTTPException(
            status_code = status.HTTP_409_CONFLICT,
            detail=f"Cammot transition order #{order_id} from '{order.status}' to '{status_update.new_status}'. Allowed transactions: {allowed}",
        )

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
        logger.error(f"Database error updating order #{order_id} status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Database transaction failed while updating order status."
        )

@router.get("/products", response_model=List[schemas.ProductResponse])
def get_all_admin_products(
    db: Session = Depends(get_db),
    current_admin: models.AdminUser = Depends(get_current_admin),
):
    """
    Get all products including inactive ones.
    Sorted by category and ID.
    """
    return (
        db.query(models.Product)
        .order_by(models.Product.category.asc(), models.Product.id.asc())
        .all()
    )

@router.patch("/products/{product_id}/availability", response_model=schemas.ProductResponse)
def update_product_availability(
    product_id: int,
    update: schemas.ProductAvailabilityUpdate,
    db: Session = Depends(get_db),
    current_admin: models.AdminUser = Depends(get_current_admin),
):
    """
    Update product active status (In stock / Out of stock).
    Setting is_active=False immediately hides it from customer menu and rejects checkout.
    """
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Product not found"
        )
    product.is_active = update.is_active
    try:
        db.commit()
        db.refresh(product)
        return product
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating product #{product_id} availability: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database transaction failed while updating product availability.",
        )
