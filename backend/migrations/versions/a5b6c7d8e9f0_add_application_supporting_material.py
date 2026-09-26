"""add optional application supporting material URLs

Revision ID: a5b6c7d8e9f0
Revises: 0f56864323aa
Create Date: 2026-09-26

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a5b6c7d8e9f0"
down_revision: Union[str, Sequence[str], None] = "0f56864323aa"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {column["name"] for column in inspector.get_columns("applications")}
    for column_name in ("resume_url", "portfolio_url", "additional_link"):
        if column_name not in columns:
            op.add_column("applications", sa.Column(column_name, sa.String(), nullable=True))


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {column["name"] for column in inspector.get_columns("applications")}
    for column_name in ("additional_link", "portfolio_url", "resume_url"):
        if column_name in columns:
            op.drop_column("applications", column_name)