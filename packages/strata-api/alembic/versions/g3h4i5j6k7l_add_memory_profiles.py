"""add_memory_profiles

Revision ID: g3h4i5j6k7l
Revises: f2b3c4d5e6f7
Create Date: 2026-02-03 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'g3h4i5j6k7l'
down_revision: Union[str, Sequence[str], None] = 'f2b3c4d5e6f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('financial_memories', sa.Column('spending_categories_monthly', sa.JSON(), nullable=True))
    op.add_column('financial_memories', sa.Column('debt_profile', sa.JSON(), nullable=True))
    op.add_column('financial_memories', sa.Column('portfolio_summary', sa.JSON(), nullable=True))
    op.add_column('financial_memories', sa.Column('equity_compensation', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('financial_memories', 'equity_compensation')
    op.drop_column('financial_memories', 'portfolio_summary')
    op.drop_column('financial_memories', 'debt_profile')
    op.drop_column('financial_memories', 'spending_categories_monthly')
