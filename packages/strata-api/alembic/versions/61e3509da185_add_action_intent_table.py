"""add_action_intent_table

Revision ID: 61e3509da185
Revises: 1b7c6d5e4f3a
Create Date: 2026-02-16 12:31:20.601796

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '61e3509da185'
down_revision: Union[str, Sequence[str], None] = '1b7c6d5e4f3a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('action_intents',
    sa.Column('user_id', sa.Uuid(), nullable=False),
    sa.Column('decision_trace_id', sa.Uuid(), nullable=True),
    sa.Column('intent_type', sa.Enum('ach_transfer', 'acats_transfer', 'rebalance', 'tax_loss_harvest', 'open_account', 'custom', name='actionintenttype'), nullable=False),
    sa.Column('status', sa.Enum('draft', 'pending_approval', 'processing', 'executed', 'failed', 'cancelled', name='actionintentstatus'), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('payload', sa.JSON(), nullable=False),
    sa.Column('impact_summary', sa.JSON(), nullable=False),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['decision_trace_id'], ['decision_traces.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_action_intents_status'), 'action_intents', ['status'], unique=False)
    op.create_index(op.f('ix_action_intents_user_id'), 'action_intents', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_action_intents_status'), table_name='action_intents')
    op.drop_index(op.f('ix_action_intents_user_id'), table_name='action_intents')
    op.drop_table('action_intents')
