from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import logging

logger = logging.getLogger("unigigs.config")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False
    )

    # Database
    DATABASE_URL: str

    @field_validator("DATABASE_URL", mode="before")
    def fix_postgres_scheme(cls, v: str) -> str:
        if isinstance(v, str) and v.startswith("postgres://"):
            logger.warning(
                "DATABASE_URL uses deprecated 'postgres://' scheme; replacing with 'postgresql://'."
            )
            return v.replace("postgres://", "postgresql://", 1)
        return v

    # JWT
    JWT_SECRET_KEY: str = "unigigs-secret-jwt-key-production-fallback"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,https://frontend-rho-five-23.vercel.app" 

    # Application
    APP_ENV: str = "development"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings()