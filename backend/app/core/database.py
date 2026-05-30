from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
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
    # URL을 안전하게 파싱하여 prepared_statement_cache_size를 0으로 설정 (중복 파라미터 방지)
    parsed_url = urlparse(db_url)
    query_params = dict(parse_qsl(parsed_url.query))
    query_params["prepared_statement_cache_size"] = "0"
    
    new_query = urlencode(query_params)
    parsed_url = parsed_url._replace(query=new_query)
    db_url = urlunparse(parsed_url)
        
    engine = create_async_engine(
        db_url,
        echo=False,
        future=True,
        poolclass=NullPool,
        connect_args={"statement_cache_size": 0}
    )

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
