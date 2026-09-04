from logging.config import fileConfig
from sqlalchemy import engine_from_config
from alembic import context
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import Base
from app.core.config import settings
from app.models.user import User, Profile, UserRole
from app.models.category import Category
from app.models.skill import Skill, UserSkill
from app.models.gig import Gig, GigSkill, GigAttachment, GigStatus
from app.models.application import Application, ApplicationStatus
from app.models.contract import Contract, ContractDeliverable, ContractStatus
from app.models.notification import Notification
from app.models.saved_gig import SavedGig
from app.models.portfolio import PortfolioItem
from app.models.message import Message, Conversation

config = context.config
fileConfig(config.config_file_name)
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

target_metadata = Base.metadata


def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=None,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()