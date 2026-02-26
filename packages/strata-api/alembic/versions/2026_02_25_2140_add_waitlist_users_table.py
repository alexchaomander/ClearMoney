"""add waitlist users table

Revision ID: 2026_02_25_2140
Revises: h4i5j6k7l8m
Create Date: 2026-02-25 21:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '2026_02_25_2140'
down_revision = 'h4i5j6k7l8m'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'waitlist_users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('email', sa.String(length=320), nullable=False),
        sa.Column('role', sa.String(length=100), nullable=True),
        sa.Column('net_worth_bracket', sa.String(length=50), nullable=True),
        sa.Column('interested_tier', sa.String(length=50), nullable=True),
        sa.Column('source_tool', sa.String(length=100), nullable=True),
        sa.Column('referral_code', sa.String(length=20), nullable=False),
        sa.Column('referred_by', sa.String(length=20), nullable=True),
        sa.Column('metadata_json', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )
    op.create_index(op.f('ix_waitlist_users_email'), 'waitlist_users', ['email'], unique=True)
    op.create_index(op.f('ix_waitlist_users_referral_code'), 'waitlist_users', ['referral_code'], unique=True)

def downgrade():
    op.drop_index(op.f('ix_waitlist_users_referral_code'), table_name='waitlist_users')
    op.drop_index(op.f('ix_waitlist_users_email'), table_name='waitlist_users')
    op.drop_table('waitlist_users')
