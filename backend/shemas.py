from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


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


class OrderResponse(BaseModel):
    id: int
    status: str
    pickup_datetime: datetime
    stripe_session_id: Optional[str] = None

    class Config:
        from_attributes = True


class ProductResponse(BaseModel):
    id: int
    name: str
    price: float
    lead_time_h: int
    is_active: bool

    class Config:
        from_attribute = True
