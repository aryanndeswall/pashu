import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

logger = logging.getLogger(__name__)

FALLBACK_SQLITE_URL = "sqlite+aiosqlite:///./pashu_cloud.db"


def create_resilient_engine(db_url: str):
    if db_url.startswith("sqlite"):
        return create_async_engine(
            db_url,
            echo=False,
            connect_args={"check_same_thread": False},
        )
    return create_async_engine(
        db_url,
        echo=False,
        pool_pre_ping=True,
    )


engine = create_resilient_engine(settings.DATABASE_URL)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Initializes tables on active database; falls back to local SQLite if cloud DB unreachable."""
    global engine, AsyncSessionLocal
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database schema initialized on %s", engine.url)
    except Exception as e:
        if not str(engine.url).startswith("sqlite"):
            logger.warning(
                "Failed to connect to cloud database (%s): %s. Falling back to local SQLite.",
                engine.url,
                e,
            )
            engine = create_resilient_engine(FALLBACK_SQLITE_URL)
            AsyncSessionLocal = async_sessionmaker(
                bind=engine,
                class_=AsyncSession,
                expire_on_commit=False,
                autocommit=False,
                autoflush=False,
            )
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Fallback local SQLite database initialized successfully.")
        else:
            raise e

