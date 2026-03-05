"""merge physical assets and entity heads

Revision ID: 6eaced234200
Revises: 21ba92652443, y2c3d4e5f6g7
Create Date: 2026-03-05 07:58:56.665642

"""
from typing import Sequence, Union

# revision identifiers, used by Alembic.
revision: str = '6eaced234200'
down_revision: Union[str, Sequence[str], None] = ('21ba92652443', 'y2c3d4e5f6g7')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
