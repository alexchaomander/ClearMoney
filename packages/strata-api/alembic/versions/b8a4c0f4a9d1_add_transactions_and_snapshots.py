"""Add transactions and portfolio snapshots

Revision ID: b8a4c0f4a9d1
Revises: 4f0a49fb54ba
Create Date: 2026-02-01 10:15:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b8a4c0f4a9d1"
down_revision: Union[str, Sequence[str], None] = "4f0a49fb54ba"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "portfolio_snapshots",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("snapshot_date", sa.Date(), nullable=False),
        sa.Column("net_worth", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("total_investment_value", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("total_cash_value", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("total_debt_value", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "snapshot_date", name="uq_portfolio_snapshot_user_date"),
    )
    op.create_index(op.f("ix_portfolio_snapshots_snapshot_date"), "portfolio_snapshots", ["snapshot_date"], unique=False)
    op.create_index(op.f("ix_portfolio_snapshots_user_id"), "portfolio_snapshots", ["user_id"], unique=False)

    op.create_table(
        "transactions",
        sa.Column("account_id", sa.Uuid(), nullable=False),
        sa.Column("security_id", sa.Uuid(), nullable=True),
        sa.Column("provider_transaction_id", sa.String(length=255), nullable=True),
        sa.Column(
            "type",
            sa.Enum(
                "buy",
                "sell",
                "dividend",
                "interest",
                "fee",
                "transfer",
                "other",
                name="transactiontype",
            ),
            nullable=False,
        ),
        sa.Column("quantity", sa.Numeric(precision=18, scale=8), nullable=True),
        sa.Column("price", sa.Numeric(precision=14, scale=4), nullable=True),
        sa.Column("amount", sa.Numeric(precision=14, scale=2), nullable=True),
        sa.Column("trade_date", sa.Date(), nullable=True),
        sa.Column("settlement_date", sa.Date(), nullable=True),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column("source", sa.String(length=100), nullable=True),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["account_id"], ["investment_accounts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["security_id"], ["securities.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "account_id",
            "provider_transaction_id",
            name="uq_transaction_account_provider_id",
        ),
    )
    op.create_index(op.f("ix_transactions_account_id"), "transactions", ["account_id"], unique=False)
    op.create_index(op.f("ix_transactions_security_id"), "transactions", ["security_id"], unique=False)
    op.create_index(op.f("ix_transactions_trade_date"), "transactions", ["trade_date"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_transactions_trade_date"), table_name="transactions")
    op.drop_index(op.f("ix_transactions_security_id"), table_name="transactions")
    op.drop_index(op.f("ix_transactions_account_id"), table_name="transactions")
    op.drop_table("transactions")
    op.drop_index(op.f("ix_portfolio_snapshots_user_id"), table_name="portfolio_snapshots")
    op.drop_index(op.f("ix_portfolio_snapshots_snapshot_date"), table_name="portfolio_snapshots")
    op.drop_table("portfolio_snapshots")
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("DROP TYPE IF EXISTS transactiontype")
