"""Add bank transaction reimbursement annotations

Revision ID: 1b7c6d5e4f3a
Revises: 9f3a4d2b1c0e
Create Date: 2026-02-08 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "1b7c6d5e4f3a"
down_revision: Union[str, Sequence[str], None] = "9f3a4d2b1c0e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("bank_transactions", sa.Column("reimbursed_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("bank_transactions", sa.Column("reimbursement_memo", sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column("bank_transactions", "reimbursement_memo")
    op.drop_column("bank_transactions", "reimbursed_at")

