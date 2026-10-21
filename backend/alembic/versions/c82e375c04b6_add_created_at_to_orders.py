"""add created_at to orders

Revision ID: c82e375c04b6
Revises: 0cc62060e84c
Create Date: 2026-10-21 00:24:47.308945

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c82e375c04b6'
down_revision: Union[str, Sequence[str], None] = '0cc62060e84c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "orders",
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("(now() AT TIME ZONE 'utc')"),
        ),
    )


def downgrade() -> None:
    op.drop_column("orders", "created_at")
