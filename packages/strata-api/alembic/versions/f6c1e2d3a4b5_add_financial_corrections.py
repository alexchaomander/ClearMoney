"""add financial corrections

Revision ID: f6c1e2d3a4b5
Revises: cc448bef9bfd
Create Date: 2026-03-12 10:30:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f6c1e2d3a4b5"
down_revision: Union[str, Sequence[str], None] = "cc448bef9bfd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "financial_corrections",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("trace_id", sa.Uuid(), nullable=True),
        sa.Column("metric_id", sa.String(length=100), nullable=True),
        sa.Column(
            "correction_type",
            sa.Enum(
                "wrong_fact",
                "stale_fact",
                "wrong_categorization",
                "wrong_assumption",
                "wrong_recommendation",
                "intentional_exception",
                "source_mistrust",
                "execution_mismatch",
                name="financialcorrectiontype",
            ),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum("open", "applied", "dismissed", name="financialcorrectionstatus"),
            nullable=False,
            server_default="open",
        ),
        sa.Column("target_field", sa.String(length=100), nullable=False),
        sa.Column("target_id", sa.String(length=255), nullable=True),
        sa.Column("summary", sa.String(length=500), nullable=True),
        sa.Column("reason", sa.String(length=1000), nullable=False),
        sa.Column("original_value", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("proposed_value", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("resolved_value", sa.JSON(), nullable=True),
        sa.Column("impact_summary", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["trace_id"], ["decision_traces.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_financial_corrections_user_id"), "financial_corrections", ["user_id"], unique=False)
    op.create_index(op.f("ix_financial_corrections_trace_id"), "financial_corrections", ["trace_id"], unique=False)
    op.create_index(op.f("ix_financial_corrections_metric_id"), "financial_corrections", ["metric_id"], unique=False)
    op.create_index(op.f("ix_financial_corrections_target_field"), "financial_corrections", ["target_field"], unique=False)
    op.create_index(op.f("ix_financial_corrections_correction_type"), "financial_corrections", ["correction_type"], unique=False)
    op.create_index(op.f("ix_financial_corrections_status"), "financial_corrections", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_financial_corrections_status"), table_name="financial_corrections")
    op.drop_index(op.f("ix_financial_corrections_correction_type"), table_name="financial_corrections")
    op.drop_index(op.f("ix_financial_corrections_target_field"), table_name="financial_corrections")
    op.drop_index(op.f("ix_financial_corrections_metric_id"), table_name="financial_corrections")
    op.drop_index(op.f("ix_financial_corrections_trace_id"), table_name="financial_corrections")
    op.drop_index(op.f("ix_financial_corrections_user_id"), table_name="financial_corrections")
    op.drop_table("financial_corrections")
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("DROP TYPE IF EXISTS financialcorrectionstatus")
        op.execute("DROP TYPE IF EXISTS financialcorrectiontype")
