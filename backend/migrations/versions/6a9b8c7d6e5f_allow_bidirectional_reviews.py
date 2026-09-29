"""allow one review per contract participant

Revision ID: 6a9b8c7d6e5f
Revises: 0f56864323aa, a5b6c7d8e9f0
Create Date: 2026-09-29

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6a9b8c7d6e5f"
down_revision: Union[str, Sequence[str], None] = ("0f56864323aa", "a5b6c7d8e9f0")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    constraints = inspector.get_unique_constraints("reviews")
    has_reviewer_constraint = any(
        set(constraint.get("column_names") or []) == {"contract_id", "reviewer_id"}
        for constraint in constraints
    )

    for constraint in constraints:
        if constraint.get("column_names") == ["contract_id"]:
            op.drop_constraint(constraint["name"], "reviews", type_="unique")

    if not has_reviewer_constraint:
        op.create_unique_constraint(
            "uq_reviews_contract_reviewer",
            "reviews",
            ["contract_id", "reviewer_id"],
        )


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    constraints = inspector.get_unique_constraints("reviews")
    if any(
        constraint.get("name") == "uq_reviews_contract_reviewer"
        for constraint in constraints
    ):
        op.drop_constraint("uq_reviews_contract_reviewer", "reviews", type_="unique")
    if not any(
        constraint.get("column_names") == ["contract_id"]
        for constraint in constraints
    ):
        op.create_unique_constraint("uq_reviews_contract_id", "reviews", ["contract_id"])