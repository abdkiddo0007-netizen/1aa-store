import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from backend.core.config import settings

# Determine DB URL; allows falling back to aiosqlite in standalone test environments if PostgreSQL is absent
db_url = settings.DATABASE_URL
if os.environ.get("TESTING") == "1" or "sqlite" in db_url:
    engine = create_async_engine(
        db_url,
        echo=False,
        future=True,
    )
else:
    engine = create_async_engine(
        db_url,
        echo=False,
        future=True,
        pool_size=20,
        max_overflow=10,
        pool_pre_ping=True
    )

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to provide an isolated async database session per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
