"""Add share report view limits + rotation metadata

Revision ID: 9f3a4d2b1c0e
Revises: 62f8e8c9e415
Create Date: 2026-02-08 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9f3a4d2b1c0e"
down_revision: Union[str, Sequence[str], None] = "62f8e8c9e415"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("share_reports", sa.Column("max_views", sa.Integer(), nullable=True))
    op.add_column(
        "share_reports",
        sa.Column("view_count", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column("share_reports", sa.Column("first_viewed_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("share_reports", sa.Column("last_viewed_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("share_reports", "last_viewed_at")
    op.drop_column("share_reports", "first_viewed_at")
    op.drop_column("share_reports", "view_count")
    op.drop_column("share_reports", "max_views")

