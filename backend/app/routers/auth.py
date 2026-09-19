from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import timedelta
from urllib.parse import urlencode
import secrets
import hmac
import httpx
from app.db.database import get_db
from app.models.user import User, Profile
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user, verify_token
from app.core.config import settings
from pydantic import BaseModel

router = APIRouter()


def _google_redirect_uri() -> str:
    return settings.GOOGLE_REDIRECT_URI or f"{settings.FRONTEND_URL.rstrip('/')}/api/auth/google/callback"


def _frontend_redirect(path: str, **params: str) -> RedirectResponse:
    query = urlencode(params)
    target = f"{settings.FRONTEND_URL.rstrip('/')}{path}"
    return RedirectResponse(f"{target}?{query}" if query else target)


class GoogleExchangeRequest(BaseModel):
    code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


@router.get("/google/login")
def google_login(response: Response):
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=503, detail="Google sign-in is not configured")

    state = secrets.token_urlsafe(32)
    response = RedirectResponse(
        "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode({
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": _google_redirect_uri(),
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "access_type": "online",
            "prompt": "select_account",
        })
    )
    response.set_cookie(
        "google_oauth_state",
        state,
        httponly=True,
        secure=settings.APP_ENV == "production",
        samesite="lax",
        max_age=600,
    )
    return response


@router.get("/google/callback")
def google_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: Session = Depends(get_db),
):
    if error:
        return _frontend_redirect("/login", google_error="Google sign-in was cancelled")
    if not code or not state or not hmac.compare_digest(state, request.cookies.get("google_oauth_state", "")):
        return _frontend_redirect("/login", google_error="Google sign-in could not be verified")

    try:
        with httpx.Client(timeout=10.0) as client:
            token_response = client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": _google_redirect_uri(),
                    "grant_type": "authorization_code",
                },
            )
            token_response.raise_for_status()
            id_token = token_response.json().get("id_token")
            if not id_token:
                raise ValueError("Google did not return an ID token")

            identity_response = client.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": id_token},
            )
            identity_response.raise_for_status()
            identity = identity_response.json()

        if identity.get("aud") != settings.GOOGLE_CLIENT_ID or identity.get("email_verified") != "true":
            raise ValueError("Google identity verification failed")

        email = identity.get("email", "").strip().lower()
        if not email:
            raise ValueError("Google account has no email address")

        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                hashed_password=get_password_hash(secrets.token_urlsafe(32)),
                role="student",
            )
            db.add(user)
            db.flush()
            db.add(Profile(user_id=user.id, full_name=identity.get("name") or email.split("@")[0], availability="available"))
            db.commit()
            db.refresh(user)

        if not user.is_active:
            raise ValueError("Account is inactive")

        handoff = create_access_token(
            {"sub": str(user.id), "purpose": "google_handoff"},
            expires_delta=timedelta(minutes=1),
        )
        return _frontend_redirect("/auth/callback", code=handoff)
    except (httpx.HTTPError, ValueError, KeyError):
        db.rollback()
        return _frontend_redirect("/login", google_error="Google sign-in failed. Please try again.")


@router.post("/google/exchange", response_model=TokenResponse)
def exchange_google_code(request: GoogleExchangeRequest, db: Session = Depends(get_db)):
    payload = verify_token(request.code)
    if not payload or payload.get("purpose") != "google_handoff":
        raise HTTPException(status_code=400, detail="Invalid or expired Google sign-in code")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")

    role_val = user.role.value if hasattr(user.role, "value") else str(user.role)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": role_val},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/register", response_model=TokenResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    email = user_data.email.strip().lower()
    
    # Check if user exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=email,
        hashed_password=hashed_password,
        role=user_data.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create associated profile
    full_name = user_data.full_name.strip() if user_data.full_name and user_data.full_name.strip() else email.split("@")[0].replace(".", " ").title()
    profile = Profile(
        user_id=new_user.id,
        full_name=full_name,
        availability="available"
    )
    db.add(profile)
    db.commit()
    
    role_val = new_user.role.value if hasattr(new_user.role, "value") else str(new_user.role)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(new_user.id), "role": role_val},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    
    user_response = UserResponse(
        id=new_user.id,
        email=new_user.email,
        role=new_user.role,
        is_active=new_user.is_active,
        created_at=new_user.created_at,
    )
    
    return TokenResponse(
        access_token=access_token,
        user=user_response,
    )


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    email = credentials.email.strip().lower()
    # Find user
    user = db.query(User).filter(User.email == email).first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )
    
    role_val = user.role.value if hasattr(user.role, "value") else str(user.role)

    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id), "role": role_val},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    
    user_response = UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
    )
    
    return TokenResponse(
        access_token=access_token,
        user=user_response,
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == int(current_user["user_id"])).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
    )