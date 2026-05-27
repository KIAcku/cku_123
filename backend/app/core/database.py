from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# ASYNC_DATABASE_URL 속성 사용 (SQLite ↔ PostgreSQL 자동 전환)
engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    echo=False,
    future=True,
    # PostgreSQL은 connect_args 불필요, SQLite는 check_same_thread 필요
    connect_args={"check_same_thread": False} if "sqlite" in settings.ASYNC_DATABASE_URL else {}
)

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
