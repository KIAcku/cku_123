from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.models.user import User
from app.api.dependencies import get_current_user
from datetime import datetime, timedelta

router = APIRouter()

class CounselorStatus(BaseModel):
    id: str
    nickname: str
    is_online: bool
    class Config: from_attributes = True

@router.get("/online", response_model=List[CounselorStatus])
async def get_online_counselors(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    five_min_ago = datetime.utcnow() - timedelta(minutes=5)
    res = await db.execute(
        select(User).where(
            User.role == "COUNSELOR",
            User.is_active == True,
            User.last_seen_at >= five_min_ago
        )
    )
    return res.scalars().all()
