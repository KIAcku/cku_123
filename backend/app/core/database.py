from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

db_url = settings.ASYNC_DATABASE_URL

if "sqlite" in db_url:
    engine = create_async_engine(
        db_url,
        echo=False,
        future=True,
        connect_args={"check_same_thread": False}
    )
else:
    # URL 쿼리 파라미터로 prepared_statement_cache_size=0 추가하여 
    # SQLAlchemy의 쿼리 캐시 처리를 완전히 우회하고 TypeError를 방지합니다.
    if "?" in db_url:
        db_url += "&prepared_statement_cache_size=0"
    else:
        db_url += "?prepared_statement_cache_size=0"
        
    engine = create_async_engine(
        db_url,
        echo=False,
        future=True
    )

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
