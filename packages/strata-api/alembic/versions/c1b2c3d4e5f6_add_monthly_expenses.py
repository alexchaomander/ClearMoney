"""add_monthly_expenses

Revision ID: c1b2c3d4e5f6
Revises: 929f517c56cd
Create Date: 2026-02-01 12:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'c1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '929f517c56cd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('financial_memories', sa.Column('average_monthly_expenses', sa.Numeric(precision=14, scale=2), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('financial_memories', 'average_monthly_expenses')
