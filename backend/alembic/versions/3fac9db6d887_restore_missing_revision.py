"""restore missing revision (original file was lost, never committed)

The database already contains this revision's changes. This placeholder
only reconnects the migration chain 8abbac3ad114 -> 1eed00631d9c.

Revision ID: 3fac9db6d887
Revises: 8abbac3ad114
"""
from typing import Sequence, Union

revision: str = "3fac9db6d887"
down_revision: Union[str, Sequence[str], None] = "8abbac3ad114"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
