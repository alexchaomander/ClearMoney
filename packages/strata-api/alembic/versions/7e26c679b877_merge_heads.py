"""merge heads

Revision ID: 7e26c679b877
Revises: b2c3d4e5f6a7, h4i5j6k7l8m
Create Date: 2026-02-07 21:49:51.691633

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7e26c679b877'
down_revision: Union[str, Sequence[str], None] = ('b2c3d4e5f6a7', 'h4i5j6k7l8m')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
