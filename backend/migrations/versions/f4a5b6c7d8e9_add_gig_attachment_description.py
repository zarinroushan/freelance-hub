"""add_gig_attachment_description

Revision ID: f4a5b6c7d8e9
Revises: e3f4a5b6c7d8
Create Date: 2026-09-19 19:22:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'f4a5b6c7d8e9'
down_revision: Union[str, Sequence[str], None] = 'e3f4a5b6c7d8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = [c['name'] for c in inspector.get_columns('gig_attachments')]
    if 'description' not in columns:
        op.add_column('gig_attachments', sa.Column('description', sa.Text(), nullable=True))


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = [c['name'] for c in inspector.get_columns('gig_attachments')]
    if 'description' in columns:
        op.drop_column('gig_attachments', 'description')
