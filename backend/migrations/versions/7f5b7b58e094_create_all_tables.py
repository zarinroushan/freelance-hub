"""create_all_tables

Revision ID: 7f5b7b58e094
Revises: be031a3f0f8b
Create Date: 2026-09-07 12:56:23.241643

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7f5b7b58e094'
down_revision: Union[str, Sequence[str], None] = 'be031a3f0f8b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - create all tables if missing."""
    from app.db.database import Base
    import app.models  # noqa: F401
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    """Downgrade schema."""
    pass
