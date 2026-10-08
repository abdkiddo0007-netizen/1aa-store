from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "1AA Enterprise OMS & Logistics Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database Settings (PostgreSQL / Supabase asyncpg)
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/postgres",
        description="Async PostgreSQL database URL (postgresql+asyncpg://...)"
    )
    
    # Redis Cache & Concurrency Lock
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis connection URL for Soft Lock & DLQ fallback"
    )
    
    # Inventory Soft Lock TTL in seconds (15 minutes)
    INVENTORY_LOCK_TTL_SECONDS: int = 900
    
    # 3PL Logistics Webhook HMAC Secret
    WEBHOOK_SECRET: str = Field(
        default="1aa_logistics_live_hmac_secret_2026_secured",
        description="Shared secret for carrier webhook HMAC-SHA256 verification"
    )
    
    # AWS SQS DLQ Fallback URL (Optional)
    SQS_QUEUE_URL: Optional[str] = Field(
        default=None,
        description="AWS SQS Queue URL for carrier tracking Dead-Letter Queue"
    )
    
    # Platform Verification Exclusives
    OWNER_PHONE: str = "7406231167"
    OWNER_EMAIL: str = "1aaavailablealways@gmail.com"
    CENTRAL_DISPATCH_PINCODE: str = "570007"
    
    # Standard Tax Rate (18% GST for toys, games, consumer goods)
    DEFAULT_GST_RATE: float = 18.0
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
