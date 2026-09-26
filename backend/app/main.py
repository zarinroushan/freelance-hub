import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse


from app.core.config import settings
from app.db.database import Base
import app.models  # noqa: F401

logger = logging.getLogger("unigigs")


from app.routers import (
    auth,
    users,
    gig,
    application,
    contracts,
    messages,
    reviews,
    notifications,
    upload,
    payments,
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



# Include routers
app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["Authentication"]
)

# Compatibility alias for direct non-/api requests
app.include_router(
    auth.router,
    prefix="/auth",
    include_in_schema=False
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
    tags=["Notifications"]
)


app.include_router(
    upload.router,
    prefix="/api/upload",
    tags=["Uploads"]
)


app.include_router(
    payments.router,
    prefix="/api/payments",
    tags=["Payments"]
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