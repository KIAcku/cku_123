from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

if "sqlite" in settings.ASYNC_DATABASE_URL:
    engine = create_async_engine(
        settings.ASYNC_DATABASE_URL,
        echo=False,
        future=True,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_async_engine(
        settings.ASYNC_DATABASE_URL,
        echo=False,
        future=True,
        connect_args={"statement_cache_size": 0}
    )

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
