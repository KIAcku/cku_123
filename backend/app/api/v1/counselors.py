from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
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
    last_seen_at: Optional[datetime] = None
    class Config: from_attributes = True

# 전체 상담사 목록 (온라인/오프라인 포함)
@router.get("", response_model=List[CounselorStatus])
async def get_all_counselors(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(
        select(User).where(
            User.role == "COUNSELOR",
            User.is_active == True
        )
    )
    counselors = res.scalars().all()
    # 5분 이내 활동 시 온라인으로 표시
    five_min_ago = datetime.utcnow() - timedelta(minutes=5)
    for c in counselors:
        if c.last_seen_at and c.last_seen_at >= five_min_ago:
            c.is_online = True
        else:
            if not c.is_online:
                c.is_online = False
    return counselors

# 온라인 상담사만
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

# 상담사 온라인 상태 토글 (상담사 본인만 호출)
@router.post("/me/online")
async def set_online_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "COUNSELOR":
        raise HTTPException(status_code=403, detail="상담사 계정만 사용 가능합니다.")
    current_user.is_online = True
    current_user.last_seen_at = datetime.utcnow()
    db.add(current_user)
    await db.commit()
    return {"is_online": True}

@router.post("/me/offline")
async def set_offline_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "COUNSELOR":
        raise HTTPException(status_code=403, detail="상담사 계정만 사용 가능합니다.")
    current_user.is_online = False
    db.add(current_user)
    await db.commit()
    return {"is_online": False}

# heartbeat — 상담사가 주기적으로 호출해 온라인 유지
@router.post("/me/heartbeat")
async def counselor_heartbeat(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "COUNSELOR":
        raise HTTPException(status_code=403)
    current_user.last_seen_at = datetime.utcnow()
    current_user.is_online = True
    db.add(current_user)
    await db.commit()
    return {"ok": True}
