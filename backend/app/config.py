from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Pashu-Suraksha Cloud Surveillance Gateway"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    DATABASE_URL: str = "sqlite+aiosqlite:///./pashu_cloud.db"
    DPDP_PHONE_SALT: str = "pashu_dpdp_secret_salt_2026"
    CORS_ORIGINS: List[str] = ["*"]

    # Google Gemini 3.7 / 2.5 Flash Settings
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    AI_INFERENCE_TIMEOUT_SECONDS: float = 3.0

    # Firebase Cloud Storage & Admin SDK
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None
    FIREBASE_CREDENTIALS_JSON: Optional[str] = None
    FIREBASE_CREDENTIALS_BASE64: Optional[str] = None
    FIREBASE_STORAGE_BUCKET: Optional[str] = None

    # Redis Pub/Sub Live Alert Broker
    REDIS_URL: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
