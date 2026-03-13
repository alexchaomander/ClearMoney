"""add recommendation reviews

Revision ID: b3d9f4e8c2a1
Revises: f6c1e2d3a4b5
Create Date: 2026-03-12 14:10:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b3d9f4e8c2a1"
down_revision: Union[str, Sequence[str], None] = "f6c1e2d3a4b5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "recommendation_reviews",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("decision_trace_id", sa.Uuid(), nullable=False),
        sa.Column("recommendation_id", sa.Uuid(), nullable=True),
        sa.Column(
            "review_type",
            sa.Enum(
                "user_dispute",
                "outdated",
                "human_review",
                "context_block",
                "factual_followup",
                name="recommendationreviewtype",
            ),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum(
                "open",
                "resolved",
                "dismissed",
                "converted_to_correction",
                "superseded",
                name="recommendationreviewstatus",
            ),
            nullable=False,
            server_default="open",
        ),
        sa.Column("opened_reason", sa.Text(), nullable=False),
        sa.Column("resolution", sa.String(length=255), nullable=True),
        sa.Column("resolution_notes", sa.Text(), nullable=True),
        sa.Column("applied_changes", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("reviewer_label", sa.String(length=255), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["decision_trace_id"], ["decision_traces.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["recommendation_id"], ["recommendations.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_recommendation_reviews_user_id"), "recommendation_reviews", ["user_id"], unique=False)
    op.create_index(op.f("ix_recommendation_reviews_decision_trace_id"), "recommendation_reviews", ["decision_trace_id"], unique=False)
    op.create_index(op.f("ix_recommendation_reviews_recommendation_id"), "recommendation_reviews", ["recommendation_id"], unique=False)
    op.create_index(op.f("ix_recommendation_reviews_status"), "recommendation_reviews", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_recommendation_reviews_status"), table_name="recommendation_reviews")
    op.drop_index(op.f("ix_recommendation_reviews_recommendation_id"), table_name="recommendation_reviews")
    op.drop_index(op.f("ix_recommendation_reviews_decision_trace_id"), table_name="recommendation_reviews")
    op.drop_index(op.f("ix_recommendation_reviews_user_id"), table_name="recommendation_reviews")
    op.drop_table("recommendation_reviews")
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("DROP TYPE IF EXISTS recommendationreviewstatus")
        op.execute("DROP TYPE IF EXISTS recommendationreviewtype")
