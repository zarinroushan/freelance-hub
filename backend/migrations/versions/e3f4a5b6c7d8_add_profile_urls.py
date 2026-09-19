"""add profile resume, portfolio, github and linkedin urls

Revision ID: e3f4a5b6c7d8
Revises: d2e3f4a5b6c7
Create Date: 2026-09-19

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "e3f4a5b6c7d8"
down_revision: Union[str, Sequence[str], None] = "d2e3f4a5b6c7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {col["name"] for col in inspector.get_columns("profiles")}

    if "resume_url" not in columns:
        op.add_column("profiles", sa.Column("resume_url", sa.String(), nullable=True))
    if "portfolio_url" not in columns:
        op.add_column("profiles", sa.Column("portfolio_url", sa.String(), nullable=True))
    if "github_url" not in columns:
        op.add_column("profiles", sa.Column("github_url", sa.String(), nullable=True))
    if "linkedin_url" not in columns:
        op.add_column("profiles", sa.Column("linkedin_url", sa.String(), nullable=True))


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {col["name"] for col in inspector.get_columns("profiles")}

    if "linkedin_url" in columns:
        op.drop_column("profiles", "linkedin_url")
    if "github_url" in columns:
        op.drop_column("profiles", "github_url")
    if "portfolio_url" in columns:
        op.drop_column("profiles", "portfolio_url")
    if "resume_url" in columns:
        op.drop_column("profiles", "resume_url")
