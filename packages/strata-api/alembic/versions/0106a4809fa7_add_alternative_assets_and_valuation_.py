"""add alternative assets and valuation history

Revision ID: 0106a4809fa7
Revises: 6eaced234200
Create Date: 2026-03-05 07:59:00.628154

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0106a4809fa7"
down_revision: Union[str, Sequence[str], None] = "6eaced234200"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Enum types
    assettype = sa.Enum(
        "real_estate",
        "vehicle",
        "collectible",
        "precious_metal",
        "alternative",
        name="assettype",
    )
    alternativeassettype = sa.Enum(
        "private_equity",
        "angel_investment",
        "venture_capital",
        "hedge_fund",
        "limited_partnership",
        "other",
        name="alternativeassettype",
    )

    # Asset Valuations
    op.create_table(
        "asset_valuations",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("asset_id", sa.Uuid(), nullable=False),
        sa.Column("asset_type", assettype, nullable=False),
        sa.Column("value", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("valuation_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("source", sa.String(length=100), nullable=True),
        sa.Column("notes", sa.String(length=500), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_asset_valuations_user_id"),
        "asset_valuations",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_asset_valuations_asset_id"),
        "asset_valuations",
        ["asset_id"],
        unique=False,
    )

    # Alternative Assets
    op.create_table(
        "alternative_assets",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column(
            "asset_type", alternativeassettype, nullable=False, server_default="other"
        ),
        sa.Column("description", sa.String(length=1000), nullable=True),
        sa.Column(
            "market_value",
            sa.Numeric(precision=14, scale=2),
            nullable=False,
            server_default="0",
        ),
        sa.Column("cost_basis", sa.Numeric(precision=14, scale=2), nullable=True),
        sa.Column("purchase_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "estimated_annual_growth_rate",
            sa.Numeric(precision=6, scale=4),
            nullable=True,
        ),
        sa.Column("last_valuation_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_alternative_assets_user_id"),
        "alternative_assets",
        ["user_id"],
        unique=False,
    )

    # Add growth rate to existing tables
    op.add_column(
        "real_estate_assets",
        sa.Column(
            "estimated_annual_growth_rate",
            sa.Numeric(precision=6, scale=4),
            nullable=True,
        ),
    )
    op.add_column(
        "vehicle_assets",
        sa.Column(
            "estimated_annual_growth_rate",
            sa.Numeric(precision=6, scale=4),
            nullable=True,
        ),
    )
    op.add_column(
        "collectible_assets",
        sa.Column(
            "estimated_annual_growth_rate",
            sa.Numeric(precision=6, scale=4),
            nullable=True,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("collectible_assets", "estimated_annual_growth_rate")
    op.drop_column("vehicle_assets", "estimated_annual_growth_rate")
    op.drop_column("real_estate_assets", "estimated_annual_growth_rate")

    op.drop_index(
        op.f("ix_alternative_assets_user_id"), table_name="alternative_assets"
    )
    op.drop_table("alternative_assets")

    op.drop_index(op.f("ix_asset_valuations_asset_id"), table_name="asset_valuations")
    op.drop_index(op.f("ix_asset_valuations_user_id"), table_name="asset_valuations")
    op.drop_table("asset_valuations")

    sa.Enum(name="alternativeassettype").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="assettype").drop(op.get_bind(), checkfirst=True)
