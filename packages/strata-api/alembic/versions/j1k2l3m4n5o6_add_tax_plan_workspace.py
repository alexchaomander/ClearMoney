"""add tax plan workspace tables

Revision ID: j1k2l3m4n5o6
Revises: 9f3a4d2b1c0e
Create Date: 2026-02-11 20:45:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "j1k2l3m4n5o6"
down_revision: str | None = "9f3a4d2b1c0e"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "tax_plans",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("household_name", sa.String(length=160), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("approved_version_id", sa.Uuid(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tax_plans_user_id"), "tax_plans", ["user_id"], unique=False)

    op.create_table(
        "tax_plan_versions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("plan_id", sa.Uuid(), nullable=False),
        sa.Column("created_by_user_id", sa.Uuid(), nullable=False),
        sa.Column("label", sa.String(length=128), nullable=False),
        sa.Column("inputs", sa.JSON(), nullable=False),
        sa.Column("results", sa.JSON(), nullable=True),
        sa.Column("source", sa.String(length=32), nullable=False),
        sa.Column("is_approved", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_by_user_id", sa.Uuid(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["plan_id"], ["tax_plans.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["approved_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tax_plan_versions_plan_id"), "tax_plan_versions", ["plan_id"], unique=False)
    op.create_index(op.f("ix_tax_plan_versions_created_by_user_id"), "tax_plan_versions", ["created_by_user_id"], unique=False)

    op.create_table(
        "tax_plan_comments",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("plan_id", sa.Uuid(), nullable=False),
        sa.Column("version_id", sa.Uuid(), nullable=True),
        sa.Column("author_user_id", sa.Uuid(), nullable=False),
        sa.Column("author_role", sa.String(length=32), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["plan_id"], ["tax_plans.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["version_id"], ["tax_plan_versions.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["author_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tax_plan_comments_plan_id"), "tax_plan_comments", ["plan_id"], unique=False)
    op.create_index(op.f("ix_tax_plan_comments_version_id"), "tax_plan_comments", ["version_id"], unique=False)
    op.create_index(op.f("ix_tax_plan_comments_author_user_id"), "tax_plan_comments", ["author_user_id"], unique=False)

    op.create_table(
        "tax_plan_collaborators",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("plan_id", sa.Uuid(), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("role", sa.String(length=32), nullable=False),
        sa.Column("invited_by_user_id", sa.Uuid(), nullable=False),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["plan_id"], ["tax_plans.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["invited_by_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tax_plan_collaborators_plan_id"), "tax_plan_collaborators", ["plan_id"], unique=False)
    op.create_index(op.f("ix_tax_plan_collaborators_email"), "tax_plan_collaborators", ["email"], unique=False)
    op.create_index(op.f("ix_tax_plan_collaborators_invited_by_user_id"), "tax_plan_collaborators", ["invited_by_user_id"], unique=False)

    op.create_table(
        "tax_plan_events",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("plan_id", sa.Uuid(), nullable=False),
        sa.Column("version_id", sa.Uuid(), nullable=True),
        sa.Column("actor_user_id", sa.Uuid(), nullable=True),
        sa.Column("event_type", sa.String(length=64), nullable=False),
        sa.Column("event_metadata", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["plan_id"], ["tax_plans.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["version_id"], ["tax_plan_versions.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["actor_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tax_plan_events_plan_id"), "tax_plan_events", ["plan_id"], unique=False)
    op.create_index(op.f("ix_tax_plan_events_version_id"), "tax_plan_events", ["version_id"], unique=False)
    op.create_index(op.f("ix_tax_plan_events_event_type"), "tax_plan_events", ["event_type"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_tax_plan_events_event_type"), table_name="tax_plan_events")
    op.drop_index(op.f("ix_tax_plan_events_version_id"), table_name="tax_plan_events")
    op.drop_index(op.f("ix_tax_plan_events_plan_id"), table_name="tax_plan_events")
    op.drop_table("tax_plan_events")

    op.drop_index(op.f("ix_tax_plan_collaborators_invited_by_user_id"), table_name="tax_plan_collaborators")
    op.drop_index(op.f("ix_tax_plan_collaborators_email"), table_name="tax_plan_collaborators")
    op.drop_index(op.f("ix_tax_plan_collaborators_plan_id"), table_name="tax_plan_collaborators")
    op.drop_table("tax_plan_collaborators")

    op.drop_index(op.f("ix_tax_plan_comments_author_user_id"), table_name="tax_plan_comments")
    op.drop_index(op.f("ix_tax_plan_comments_version_id"), table_name="tax_plan_comments")
    op.drop_index(op.f("ix_tax_plan_comments_plan_id"), table_name="tax_plan_comments")
    op.drop_table("tax_plan_comments")

    op.drop_index(op.f("ix_tax_plan_versions_created_by_user_id"), table_name="tax_plan_versions")
    op.drop_index(op.f("ix_tax_plan_versions_plan_id"), table_name="tax_plan_versions")
    op.drop_table("tax_plan_versions")

    op.drop_index(op.f("ix_tax_plans_user_id"), table_name="tax_plans")
    op.drop_table("tax_plans")
