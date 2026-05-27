import asyncio
import sys
import traceback

async def init():
    try:
        from app.core.database import engine, Base
        from app.models.user import User
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("SUCCESS")
    except Exception as e:
        print("ERROR:", e)
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(init())
