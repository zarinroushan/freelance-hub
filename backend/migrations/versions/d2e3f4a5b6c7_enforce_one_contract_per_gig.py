"""enforce one contract per gig

Revision ID: d2e3f4a5b6c7
Revises: c1d2e3f4a5b6
Create Date: 2026-09-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d2e3f4a5b6c7"
down_revision: Union[str, Sequence[str], None] = "c1d2e3f4a5b6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    constraints = {
        constraint.get("name")
        for constraint in inspector.get_unique_constraints("contracts")
    }
    if "uq_contracts_gig_id" not in constraints:
        op.create_unique_constraint("uq_contracts_gig_id", "contracts", ["gig_id"])


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    constraints = {
        constraint.get("name")
        for constraint in inspector.get_unique_constraints("contracts")
    }
    if "uq_contracts_gig_id" in constraints:
        op.drop_constraint("uq_contracts_gig_id", "contracts", type_="unique")