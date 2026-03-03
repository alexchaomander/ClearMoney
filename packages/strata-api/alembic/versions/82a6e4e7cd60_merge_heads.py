"""merge heads

Revision ID: 82a6e4e7cd60
Revises: 6e9449631daa, x1b2c3d4e5f6
Create Date: 2026-03-03 05:43:32.991758

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '82a6e4e7cd60'
down_revision: Union[str, Sequence[str], None] = ('6e9449631daa', 'x1b2c3d4e5f6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
