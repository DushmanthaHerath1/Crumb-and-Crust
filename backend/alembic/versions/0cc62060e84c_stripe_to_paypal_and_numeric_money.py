"""stripe to paypal and numeric money

Revision ID: 0cc62060e84c
Revises: 1eed00631d9c
Create Date: 2026-10-20 00:03:38.642127

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0cc62060e84c'
down_revision: Union[str, Sequence[str], None] = '1eed00631d9c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

MONEY_COLUMNS = [
    # (table, column, nullable)
    ("products", "price", False),
    ("order_items", "subtotal", False),
    ("orders", "total_price", True),
]

def upgrade() -> None:
    # 1. Money: DOUBLE PRECISION -> NUMERIC(10,2), rounding existing values
    for table, column, nullable in MONEY_COLUMNS:
        op.alter_column(
            table,
            column,
            existing_type=sa.Float(),
            type_=sa.Numeric(10, 2),
            existing_nullable=nullable,
            postgresql_using=f"ROUND({column}::numeric, 2)",
        )

    # 2. Orders still pending can never be paid (their Stripe/mock sessions are gone).
    #    Mark them failed so they stop using up daily pickup capacity.
    op.execute("UPDATE orders SET status = 'failed' WHERE status = 'pending'")
    # 3. Remove Stripe column (Postgres drops its unique constraint with it)
    op.drop_column("orders", "stripe_session_id")
    # 4. PayPal columns
    op.add_column("orders", sa.Column("paypal_order_id", sa.String(64), nullable=True))
    op.add_column("orders", sa.Column("paypal_capture_id", sa.String(64), nullable=True))
    op.create_index(op.f("ix_orders_paypal_order_id"), "orders", ["paypal_order_id"], unique=True)
    op.create_index(op.f("ix_orders_paypal_capture_id"), "orders", ["paypal_capture_id"], unique=True)

def downgrade() -> None:
    op.drop_index(op.f("ix_orders_paypal_capture_id"), table_name="orders")
    op.drop_index(op.f("ix_orders_paypal_order_id"), table_name="orders")
    op.drop_column("orders", "paypal_capture_id")
    op.drop_column("orders", "paypal_order_id")
    op.add_column("orders", sa.Column("stripe_session_id", sa.String(), nullable=True))
    op.create_unique_constraint("orders_stripe_session_id_key", "orders", ["stripe_session_id"])
    # Note: the pending -> failed status change is intentionally not reversed.
    for table, column, nullable in MONEY_COLUMNS:
        op.alter_column(
            table,
            column,
            existing_type=sa.Numeric(10, 2),
            type_=sa.Float(),
            existing_nullable=nullable,
        )
