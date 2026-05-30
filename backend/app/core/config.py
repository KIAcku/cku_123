from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "마음이음 Student Care Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "CHANGE_THIS_IN_PRODUCTION_TO_RANDOM_STRING"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # DATABASE — Railway에서 자동 주입, 로컬은 SQLite 폴백
    DATABASE_URL: str = ""

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        url = self.DATABASE_URL
        if not url:
            # 로컬 개발용 SQLite
            return "sqlite+aiosqlite:///./studentcare.db"
        # Railway PostgreSQL URL: postgresql:// → postgresql+asyncpg://
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url

    # CORS — 프론트엔드 URL (환경변수로 주입)
    FRONTEND_URL: str = "http://localhost:3000"

    # Email (SMTP)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    SMTP_FROM: str = "noreply@maumium.com"

    class Config:
        env_file = ".env"

settings = Settings()

