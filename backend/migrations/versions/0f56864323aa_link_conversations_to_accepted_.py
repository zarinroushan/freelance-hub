"""link conversations to accepted applications

Revision ID: 0f56864323aa
Revises: f4a5b6c7d8e9
Create Date: 2026-09-20

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0f56864323aa"
down_revision: Union[str, Sequence[str], None] = "f4a5b6c7d8e9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "conversations",
        sa.Column(
            "gig_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.add_column(
        "conversations",
        sa.Column(
            "application_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.create_foreign_key(
        "fk_conversations_gig_id",
        "conversations",
        "gigs",
        ["gig_id"],
        ["id"],
    )

    op.create_foreign_key(
        "fk_conversations_application_id",
        "conversations",
        "applications",
        ["application_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_conversations_application_id",
        "conversations",
        type_="foreignkey",
    )

    op.drop_constraint(
        "fk_conversations_gig_id",
        "conversations",
        type_="foreignkey",
    )

    op.drop_column("conversations", "application_id")
    op.drop_column("conversations", "gig_id")