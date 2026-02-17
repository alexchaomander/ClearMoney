"""add_credit_cards

Revision ID: d2c3d4e5f6a7
Revises: c1b2c3d4e5f6
Create Date: 2026-02-02 10:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'd2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'c1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    period_enum = sa.Enum("annual", "monthly", name="card_credit_period")
    period_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        'credit_cards',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('issuer', sa.String(length=100), nullable=False),
        sa.Column('annual_fee', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('apply_url', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_credit_cards_issuer'), 'credit_cards', ['issuer'], unique=False)

    op.create_table(
        'card_credits',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('card_id', sa.Uuid(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('value', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('period', period_enum, nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.ForeignKeyConstraint(['card_id'], ['credit_cards.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_card_credits_card_id'), 'card_credits', ['card_id'], unique=False)

    op.create_table(
        'card_benefits',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('card_id', sa.Uuid(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('valuation_method', sa.String(length=50), nullable=True),
        sa.Column('default_value', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.ForeignKeyConstraint(['card_id'], ['credit_cards.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_card_benefits_card_id'), 'card_benefits', ['card_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    period_enum = sa.Enum("annual", "monthly", name="card_credit_period")
    op.drop_index(op.f('ix_card_benefits_card_id'), table_name='card_benefits')
    op.drop_table('card_benefits')
    op.drop_index(op.f('ix_card_credits_card_id'), table_name='card_credits')
    op.drop_table('card_credits')
    op.drop_index(op.f('ix_credit_cards_issuer'), table_name='credit_cards')
    op.drop_table('credit_cards')
    period_enum.drop(op.get_bind(), checkfirst=True)
