"""add_execution_manifest_col

Revision ID: 91269ba828fa
Revises: 315993611f09
Create Date: 2026-02-16 17:28:55.045551

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '91269ba828fa'
down_revision: Union[str, Sequence[str], None] = '315993611f09'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "action_intents",
        sa.Column(
            "execution_manifest",
            sa.JSON(),
            nullable=False,
            server_default=sa.text("'{}'"),
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("action_intents", "execution_manifest")
