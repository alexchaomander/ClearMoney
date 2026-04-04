"""everyday_money_foundation

Revision ID: 5a0f0c0a8b6b
Revises: b7b454c34159
Create Date: 2026-04-03 13:15:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "5a0f0c0a8b6b"
down_revision: Union[str, Sequence[str], None] = "b7b454c34159"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    budgetcategorytype = sa.Enum("fixed", "flexible", name="budgetcategorytype")
    goaltype = sa.Enum(
        "emergency_fund",
        "general_savings",
        "debt_payoff",
        "major_purchase",
        name="goaltype",
    )
    goalstatus = sa.Enum("active", "paused", "completed", name="goalstatus")
    recurringcadence = sa.Enum("weekly", "monthly", "quarterly", name="recurringcadence")
    recurringstate = sa.Enum("review", "active", "dismissed", name="recurringstate")
    rulematchmode = sa.Enum("contains", "exact", name="rulematchmode")
    transactionkind = sa.Enum("standard", "transfer", "personal", "business", name="transactionkind")
    inboxitemtype = sa.Enum(
        "budget_drift",
        "recurring_change",
        "goal_risk",
        "data_freshness",
        "review",
        "general",
        name="inboxitemtype",
    )
    itemseverity = sa.Enum("info", "warning", "critical", name="itemseverity")
    reviewitemtype = sa.Enum("transaction", "recurring", "goal", name="reviewitemtype")
    reviewitemstatus = sa.Enum("open", "resolved", "dismissed", name="reviewitemstatus")

    bind = op.get_bind()
    budgetcategorytype.create(bind, checkfirst=True)
    goaltype.create(bind, checkfirst=True)
    goalstatus.create(bind, checkfirst=True)
    recurringcadence.create(bind, checkfirst=True)
    recurringstate.create(bind, checkfirst=True)
    rulematchmode.create(bind, checkfirst=True)
    transactionkind.create(bind, checkfirst=True)
    inboxitemtype.create(bind, checkfirst=True)
    itemseverity.create(bind, checkfirst=True)
    reviewitemtype.create(bind, checkfirst=True)
    reviewitemstatus.create(bind, checkfirst=True)

    op.add_column("bank_transactions", sa.Column("user_primary_category", sa.String(length=100), nullable=True))
    op.add_column("bank_transactions", sa.Column("user_merchant_name", sa.String(length=255), nullable=True))
    op.add_column(
        "bank_transactions",
        sa.Column("excluded_from_budget", sa.Boolean(), server_default="false", nullable=False),
    )
    op.add_column(
        "bank_transactions",
        sa.Column("excluded_from_goals", sa.Boolean(), server_default="false", nullable=False),
    )
    op.add_column(
        "bank_transactions",
        sa.Column("transaction_kind", sa.String(length=50), server_default="standard", nullable=False),
    )

    op.create_table(
        "budgets",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("month_start", sa.Date(), nullable=False),
        sa.Column("notes", sa.String(length=500), nullable=True),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "month_start", name="uq_budget_user_month"),
    )
    op.create_index(op.f("ix_budgets_user_id"), "budgets", ["user_id"], unique=False)
    op.create_index(op.f("ix_budgets_month_start"), "budgets", ["month_start"], unique=False)

    op.create_table(
        "budget_categories",
        sa.Column("budget_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("planned_amount", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("category_type", budgetcategorytype, nullable=False),
        sa.Column("rollover_enabled", sa.Boolean(), nullable=False),
        sa.Column("rollover_amount", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["budget_id"], ["budgets.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_budget_categories_budget_id"), "budget_categories", ["budget_id"], unique=False)

    op.create_table(
        "goals",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("goal_type", goaltype, nullable=False),
        sa.Column("target_amount", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("current_amount", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("monthly_contribution", sa.Numeric(precision=14, scale=2), nullable=True),
        sa.Column("target_date", sa.Date(), nullable=True),
        sa.Column("linked_account_ids", sa.JSON(), nullable=True),
        sa.Column("status", goalstatus, nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_goals_user_id"), "goals", ["user_id"], unique=False)

    op.create_table(
        "recurring_items",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("merchant_name", sa.String(length=200), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=True),
        sa.Column("cadence", recurringcadence, nullable=False),
        sa.Column("expected_amount", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("amount_tolerance", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("next_due_date", sa.Date(), nullable=True),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("confidence", sa.Numeric(precision=5, scale=4), nullable=False),
        sa.Column("state", recurringstate, nullable=False),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "merchant_name", name="uq_recurring_user_merchant"),
    )
    op.create_index(op.f("ix_recurring_items_merchant_name"), "recurring_items", ["merchant_name"], unique=False)
    op.create_index(op.f("ix_recurring_items_user_id"), "recurring_items", ["user_id"], unique=False)

    op.create_table(
        "transaction_rules",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("match_text", sa.String(length=255), nullable=False),
        sa.Column("match_mode", rulematchmode, nullable=False),
        sa.Column("merchant_name_override", sa.String(length=200), nullable=True),
        sa.Column("primary_category_override", sa.String(length=100), nullable=True),
        sa.Column("transaction_kind_override", transactionkind, nullable=True),
        sa.Column("exclude_from_budget", sa.Boolean(), nullable=False),
        sa.Column("exclude_from_goals", sa.Boolean(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_transaction_rules_match_text"), "transaction_rules", ["match_text"], unique=False)
    op.create_index(op.f("ix_transaction_rules_user_id"), "transaction_rules", ["user_id"], unique=False)

    op.create_table(
        "inbox_items",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("item_type", inboxitemtype, nullable=False),
        sa.Column("severity", itemseverity, nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("message", sa.String(length=500), nullable=False),
        sa.Column("due_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_resolved", sa.Boolean(), nullable=False),
        sa.Column("action_url", sa.String(length=200), nullable=True),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_inbox_items_user_id"), "inbox_items", ["user_id"], unique=False)

    op.create_table(
        "review_items",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("review_type", reviewitemtype, nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("message", sa.String(length=500), nullable=False),
        sa.Column("status", reviewitemstatus, nullable=False),
        sa.Column("confidence", sa.Numeric(precision=5, scale=4), nullable=True),
        sa.Column("source_type", sa.String(length=100), nullable=True),
        sa.Column("source_id", sa.String(length=100), nullable=True),
        sa.Column("due_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_review_items_user_id"), "review_items", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_review_items_user_id"), table_name="review_items")
    op.drop_table("review_items")
    op.drop_index(op.f("ix_inbox_items_user_id"), table_name="inbox_items")
    op.drop_table("inbox_items")
    op.drop_index(op.f("ix_transaction_rules_user_id"), table_name="transaction_rules")
    op.drop_index(op.f("ix_transaction_rules_match_text"), table_name="transaction_rules")
    op.drop_table("transaction_rules")
    op.drop_index(op.f("ix_recurring_items_user_id"), table_name="recurring_items")
    op.drop_index(op.f("ix_recurring_items_merchant_name"), table_name="recurring_items")
    op.drop_table("recurring_items")
    op.drop_index(op.f("ix_goals_user_id"), table_name="goals")
    op.drop_table("goals")
    op.drop_index(op.f("ix_budget_categories_budget_id"), table_name="budget_categories")
    op.drop_table("budget_categories")
    op.drop_index(op.f("ix_budgets_month_start"), table_name="budgets")
    op.drop_index(op.f("ix_budgets_user_id"), table_name="budgets")
    op.drop_table("budgets")

    op.drop_column("bank_transactions", "transaction_kind")
    op.drop_column("bank_transactions", "excluded_from_goals")
    op.drop_column("bank_transactions", "excluded_from_budget")
    op.drop_column("bank_transactions", "user_merchant_name")
    op.drop_column("bank_transactions", "user_primary_category")

    bind = op.get_bind()
    sa.Enum(name="reviewitemstatus").drop(bind, checkfirst=True)
    sa.Enum(name="reviewitemtype").drop(bind, checkfirst=True)
    sa.Enum(name="itemseverity").drop(bind, checkfirst=True)
    sa.Enum(name="inboxitemtype").drop(bind, checkfirst=True)
    sa.Enum(name="transactionkind").drop(bind, checkfirst=True)
    sa.Enum(name="rulematchmode").drop(bind, checkfirst=True)
    sa.Enum(name="recurringstate").drop(bind, checkfirst=True)
    sa.Enum(name="recurringcadence").drop(bind, checkfirst=True)
    sa.Enum(name="goalstatus").drop(bind, checkfirst=True)
    sa.Enum(name="goaltype").drop(bind, checkfirst=True)
    sa.Enum(name="budgetcategorytype").drop(bind, checkfirst=True)
