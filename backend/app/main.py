import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse


from app.core.config import settings
from app.db.database import Base, engine
import app.models  # noqa: F401  – registers every table with Base.metadata

logger = logging.getLogger("unigigs")


from app.routers import (
    auth,
    users,
    gig,
    application,
    contracts,
    messages,
    reviews,
    notifications,  # ✅ ADDED
)

app = FastAPI(
    title="UniGigs API",
    description="Student-focused freelance/gig marketplace API",
    version="1.0.0",
    debug=False,
    swagger_ui_parameters={"syntaxHighlight": "monokai"},
    swagger_url="/docs",
    openapi_url="/openapi.json",
)


# ── CORS (must be added FIRST so it wraps everything) ──────────────
cors_origins = settings.cors_origins_list

if "*" in cors_origins:
    allow_origins = ["*"]
else:
    allow_origins = cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ── Create tables if they don't exist (safety net for deployments) ──
try:
    Base.metadata.create_all(bind=engine)
except Exception:
    logger.exception("Failed to auto-create database tables on startup")


# Include routers
app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["Authentication"]
)


app.include_router(
    users.router,
    prefix="/api/users",
    tags=["Users"]
)


app.include_router(
    gig.router,
    prefix="/api/gigs",
    tags=["Gigs"]
)


app.include_router(
    application.router,
    prefix="/api/applications",
    tags=["Applications"]
)


app.include_router(
    contracts.router,
    prefix="/api/contracts",
    tags=["Contracts"]
)


app.include_router(
    messages.router,
    prefix="/api/messages",
    tags=["Messages"]
)


app.include_router(
    reviews.router,
    prefix="/api/reviews",
    tags=["Reviews"]
)


app.include_router(
    notifications.router,
    prefix="/api/notifications",
    tags=["Notifications"]  # ✅ ADDED
)


@app.get("/")
def root():
    return {
        "message": "Welcome to UniGigs API",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}