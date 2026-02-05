"""Add Plaid banking support

Revision ID: h4i5j6k7l8m
Revises: g3h4i5j6k7l
Create Date: 2026-02-05 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "h4i5j6k7l8m"
down_revision: Union[str, Sequence[str], None] = "g3h4i5j6k7l"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add provider-linking columns to cash_accounts
    op.add_column(
        "cash_accounts",
        sa.Column("connection_id", sa.Uuid(), nullable=True),
    )
    op.add_column(
        "cash_accounts",
        sa.Column("provider_account_id", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "cash_accounts",
        sa.Column("available_balance", sa.Numeric(precision=14, scale=2), nullable=True),
    )
    op.add_column(
        "cash_accounts",
        sa.Column("mask", sa.String(length=10), nullable=True),
    )
    op.add_column(
        "cash_accounts",
        sa.Column(
            "is_manual",
            sa.Boolean(),
            nullable=False,
            server_default="true",
        ),
    )

    # Add foreign key constraint and index for connection_id
    op.create_foreign_key(
        "fk_cash_accounts_connection_id",
        "cash_accounts",
        "connections",
        ["connection_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index(
        op.f("ix_cash_accounts_connection_id"),
        "cash_accounts",
        ["connection_id"],
        unique=False,
    )

    # Create bank_transactions table
    op.create_table(
        "bank_transactions",
        sa.Column("cash_account_id", sa.Uuid(), nullable=False),
        sa.Column("provider_transaction_id", sa.String(length=255), nullable=False),
        sa.Column("amount", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("transaction_date", sa.Date(), nullable=False),
        sa.Column("posted_date", sa.Date(), nullable=True),
        sa.Column("name", sa.String(length=500), nullable=False),
        sa.Column("primary_category", sa.String(length=100), nullable=True),
        sa.Column("detailed_category", sa.String(length=100), nullable=True),
        sa.Column("plaid_category", sa.JSON(), nullable=True),
        sa.Column("merchant_name", sa.String(length=255), nullable=True),
        sa.Column("payment_channel", sa.String(length=50), nullable=True),
        sa.Column("pending", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column(
            "iso_currency_code",
            sa.String(length=3),
            nullable=False,
            server_default="USD",
        ),
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
        sa.ForeignKeyConstraint(
            ["cash_account_id"],
            ["cash_accounts.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "cash_account_id",
            "provider_transaction_id",
            name="uq_bank_tx_account_provider",
        ),
    )
    op.create_index(
        op.f("ix_bank_transactions_cash_account_id"),
        "bank_transactions",
        ["cash_account_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_bank_transactions_transaction_date"),
        "bank_transactions",
        ["transaction_date"],
        unique=False,
    )
    op.create_index(
        op.f("ix_bank_transactions_primary_category"),
        "bank_transactions",
        ["primary_category"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop bank_transactions table
    op.drop_index(
        op.f("ix_bank_transactions_primary_category"),
        table_name="bank_transactions",
    )
    op.drop_index(
        op.f("ix_bank_transactions_transaction_date"),
        table_name="bank_transactions",
    )
    op.drop_index(
        op.f("ix_bank_transactions_cash_account_id"),
        table_name="bank_transactions",
    )
    op.drop_table("bank_transactions")

    # Remove columns from cash_accounts
    op.drop_index(
        op.f("ix_cash_accounts_connection_id"),
        table_name="cash_accounts",
    )
    op.drop_constraint(
        "fk_cash_accounts_connection_id",
        "cash_accounts",
        type_="foreignkey",
    )
    op.drop_column("cash_accounts", "is_manual")
    op.drop_column("cash_accounts", "mask")
    op.drop_column("cash_accounts", "available_balance")
    op.drop_column("cash_accounts", "provider_account_id")
    op.drop_column("cash_accounts", "connection_id")
