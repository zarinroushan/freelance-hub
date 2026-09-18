# Import all models so Base.metadata knows about every table
from app.models.user import User, Profile  # noqa: F401
from app.models.category import Category  # noqa: F401
from app.models.skill import Skill, UserSkill  # noqa: F401
from app.models.gig import Gig, GigSkill, GigAttachment  # noqa: F401
from app.models.application import Application  # noqa: F401
from app.models.contract import Contract, ContractDeliverable  # noqa: F401
from app.models.notification import Notification  # noqa: F401
from app.models.saved_gig import SavedGig  # noqa: F401
from app.models.portfolio import PortfolioItem  # noqa: F401
from app.models.message import Message, Conversation  # noqa: F401
from app.models.review import Review  # noqa: F401
from app.models.payment import Payment  # noqa: F401

