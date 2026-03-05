"""add physical asset tables

Revision ID: y2c3d4e5f6g7
Revises: x1b2c3d4e5f6
Create Date: 2026-03-03 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'y2c3d4e5f6g7'
down_revision: Union[str, Sequence[str], None] = 'x1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the physical asset tables."""
    # Enum types
    valuationtype = sa.Enum('manual', 'auto', name='valuationtype')
    realestatetype = sa.Enum(
        'primary_residence', 'investment_property', 'vacation_home', 'commercial', 'land',
        name='realestatetype',
    )
    vehicletype = sa.Enum(
        'car', 'motorcycle', 'boat', 'aircraft', 'other',
        name='vehicletype',
    )
    collectibletype = sa.Enum(
        'art', 'watch', 'handbag', 'jewelry', 'wine', 'card', 'other',
        name='collectibletype',
    )
    metaltype = sa.Enum(
        'gold', 'silver', 'platinum', 'palladium',
        name='metaltype',
    )

    # Real Estate
    op.create_table(
        'real_estate_assets',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('address', sa.String(length=512), nullable=False),
        sa.Column('city', sa.String(length=255), nullable=True),
        sa.Column('state', sa.String(length=2), nullable=True),
        sa.Column('zip_code', sa.String(length=20), nullable=True),
        sa.Column('property_type', realestatetype, nullable=False, server_default='primary_residence'),
        sa.Column('valuation_type', valuationtype, nullable=False, server_default='manual'),
        sa.Column('market_value', sa.Numeric(precision=14, scale=2), nullable=False, server_default='0'),
        sa.Column('purchase_price', sa.Numeric(precision=14, scale=2), nullable=True),
        sa.Column('purchase_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('zillow_zpid', sa.String(length=100), nullable=True),
        sa.Column('last_valuation_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_real_estate_assets_user_id'), 'real_estate_assets', ['user_id'], unique=False)

    # Vehicles
    op.create_table(
        'vehicle_assets',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('make', sa.String(length=100), nullable=False),
        sa.Column('model', sa.String(length=100), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('vin', sa.String(length=17), nullable=True),
        sa.Column('mileage', sa.Integer(), nullable=True),
        sa.Column('vehicle_type', vehicletype, nullable=False, server_default='car'),
        sa.Column('valuation_type', valuationtype, nullable=False, server_default='manual'),
        sa.Column('market_value', sa.Numeric(precision=14, scale=2), nullable=False, server_default='0'),
        sa.Column('purchase_price', sa.Numeric(precision=14, scale=2), nullable=True),
        sa.Column('purchase_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_valuation_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_vehicle_assets_user_id'), 'vehicle_assets', ['user_id'], unique=False)

    # Collectibles
    op.create_table(
        'collectible_assets',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('item_type', collectibletype, nullable=False, server_default='other'),
        sa.Column('valuation_type', valuationtype, nullable=False, server_default='manual'),
        sa.Column('market_value', sa.Numeric(precision=14, scale=2), nullable=False, server_default='0'),
        sa.Column('purchase_price', sa.Numeric(precision=14, scale=2), nullable=True),
        sa.Column('purchase_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('metadata_json', sa.JSON(), nullable=True),
        sa.Column('last_valuation_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_collectible_assets_user_id'), 'collectible_assets', ['user_id'], unique=False)

    # Precious Metals
    op.create_table(
        'precious_metal_assets',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('metal_type', metaltype, nullable=False),
        sa.Column('weight_oz', sa.Numeric(precision=14, scale=4), nullable=False),
        sa.Column('valuation_type', valuationtype, nullable=False, server_default='auto'),
        sa.Column('market_value', sa.Numeric(precision=14, scale=2), nullable=False, server_default='0'),
        sa.Column('last_valuation_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_precious_metal_assets_user_id'), 'precious_metal_assets', ['user_id'], unique=False)


def downgrade() -> None:
    """Drop the physical asset tables."""
    op.drop_index(op.f('ix_precious_metal_assets_user_id'), table_name='precious_metal_assets')
    op.drop_table('precious_metal_assets')
    op.drop_index(op.f('ix_collectible_assets_user_id'), table_name='collectible_assets')
    op.drop_table('collectible_assets')
    op.drop_index(op.f('ix_vehicle_assets_user_id'), table_name='vehicle_assets')
    op.drop_table('vehicle_assets')
    op.drop_index(op.f('ix_real_estate_assets_user_id'), table_name='real_estate_assets')
    op.drop_table('real_estate_assets')
    sa.Enum(name='metaltype').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='collectibletype').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='vehicletype').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='realestatetype').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='valuationtype').drop(op.get_bind(), checkfirst=True)
