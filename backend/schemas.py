from sqlalchemy import false
from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CustomerDetails(BaseModel):
    name: str = Field(..., min_length=2, description="Customers full name")
    email: str = Field(..., description="Customer's email address")
    phone: str = Field(..., min_length=9, description="Customer's contact number")


class CartItem(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")


class OrderCreate(BaseModel):
    customer_details: CustomerDetails
    cart_items: List[CartItem]
    requested_pickup_datetime: datetime
    idempotency_key: str = Field(
        ..., description="UUID from front-end to prevent duplicate orders"
    )


class OrderResponse(BaseModel):
    id: int
    status: str
    pickup_datetime: datetime
    total_price: Optional[float] = None
    stripe_session_id: Optional[str] = None
    checkout_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Line-item within an order — used by admin dashboard
class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    subtotal: float  # price × quantity, stored at order time

    model_config = ConfigDict(from_attributes=True)


# Full order representation returned to admin endpoints
class AdminOrderResponse(BaseModel):
    id: int
    status: str
    pickup_datetime: datetime
    total_price: Optional[float] = None
    customer_json: dict
    paid_at: Optional[datetime] = None
    stripe_session_id: Optional[str] = None
    items: List[OrderItemResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ProductResponse(BaseModel):
    id: int
    name: str
    price: float
    category: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    lead_time_h: int
    is_active: bool
    is_featured: bool = False

    model_config = ConfigDict(from_attributes=True)


class BusinessRuleResponse(BaseModel):
    id: int
    daily_order_cap: int
    blackout_dates: List[str]

    opening_hours_json: dict
    max_advance_days: int

    model_config = ConfigDict(from_attributes=True)


class AdminLogin(BaseModel):
    email: EmailStr
    password: str

    model_config = ConfigDict(from_attributes=True)


class AdminResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    full_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class OrderStatusUpdate(BaseModel):
    new_status: Literal["ready_for_pickup", "completed", "failed", "refunded"]
