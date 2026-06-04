from datetime import datetime, timezone

from database import Base
from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship


# Products table (menu items & lead times)
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    lead_time_h = Column(Integer, default=48)  # 48 fermentation rule
    is_active = Column(Boolean, default=True)


# Business rules table(Capacity & availability)
class BusinessRule(Base):
    __tablename__ = "business_rules"

    id = Column(Integer, primary_key=True, index=True)
    daily_order_cap = Column(Integer, default=50)
    blackout_dates = Column(JSON, default=list)


# Orders Table (Main checkout state)
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_json = Column(JSON, nullable=False)
    pickup_datetime = Column(DateTime, nullable=False)
    status = Column(
        String, default="pending"
    )  ## pending, paid, ready_for_pickup, completed
    stripe_session_id = Column(String, unique=True, nullable=True)
    paid_at = Column(DateTime, nullable=True)

    items = relationship("OrderItem", back_populates="order")


# Order Items Table (Line items per order)
class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")


# Admin Users Table (Staff Auth)
class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, default="staff")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# Order History Table (Audit Trail)
class OrderHistory(Base):
    __tablename__ = "order_history"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    changed_by_user_id = Column(Integer, ForeignKey("admin_users.id"))
    new_status = Column(String, nullable=False)
    changed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
