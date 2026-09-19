"""add contract revision feedback

Revision ID: c1d2e3f4a5b6
Revises: 7410f072685e
Create Date: 2026-09-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c1d2e3f4a5b6"
down_revision: Union[str, Sequence[str], None] = "7410f072685e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {column["name"] for column in inspector.get_columns("contracts")}
    if "revision_feedback" not in columns:
        op.add_column("contracts", sa.Column("revision_feedback", sa.Text(), nullable=True))


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {column["name"] for column in inspector.get_columns("contracts")}
    if "revision_feedback" in columns:
        op.drop_column("contracts", "revision_feedback")