"""add crypto_wallets table

Revision ID: x1b2c3d4e5f6
Revises: 2026_02_25_2140
Create Date: 2026-03-02 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'x1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '2026_02_25_2140'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the crypto_wallets table."""
    op.create_table(
        'crypto_wallets',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('address', sa.String(length=255), nullable=False),
        sa.Column('chain', sa.Enum(
            'ethereum', 'solana', 'polygon', 'arbitrum', 'base', 'optimism', 'bitcoin',
            name='cryptochain',
        ), nullable=False),
        sa.Column('label', sa.String(length=255), nullable=True),
        sa.Column('last_balance_usd', sa.Numeric(precision=36, scale=18), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'address', 'chain', name='uq_crypto_wallet_user_address_chain'),
    )
    op.create_index(op.f('ix_crypto_wallets_user_id'), 'crypto_wallets', ['user_id'], unique=False)
    op.create_index(op.f('ix_crypto_wallets_address'), 'crypto_wallets', ['address'], unique=False)


def downgrade() -> None:
    """Drop the crypto_wallets table."""
    op.drop_index(op.f('ix_crypto_wallets_address'), table_name='crypto_wallets')
    op.drop_index(op.f('ix_crypto_wallets_user_id'), table_name='crypto_wallets')
    op.drop_table('crypto_wallets')
    sa.Enum(name='cryptochain').drop(op.get_bind(), checkfirst=True)
