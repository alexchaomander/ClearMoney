"""add share reports

Revision ID: 62f8e8c9e415
Revises: 7e26c679b877
Create Date: 2026-02-07 21:50:39.221936

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '62f8e8c9e415'
down_revision: Union[str, Sequence[str], None] = '7e26c679b877'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "share_reports",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("tool_id", sa.String(length=128), nullable=False),
        sa.Column("mode", sa.String(length=32), nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
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
    )
    op.create_index(op.f("ix_share_reports_user_id"), "share_reports", ["user_id"], unique=False)
    op.create_index(op.f("ix_share_reports_tool_id"), "share_reports", ["tool_id"], unique=False)
    op.create_index(op.f("ix_share_reports_token_hash"), "share_reports", ["token_hash"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_share_reports_token_hash"), table_name="share_reports")
    op.drop_index(op.f("ix_share_reports_tool_id"), table_name="share_reports")
    op.drop_index(op.f("ix_share_reports_user_id"), table_name="share_reports")
    op.drop_table("share_reports")
