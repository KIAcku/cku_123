from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db
from app.models.notice import Notice
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

class NoticeCreate(BaseModel):
    title: str
    content: str
    is_pinned: bool = False

class NoticeOut(BaseModel):
    id: str
    author_id: str
    title: str
    content: str
    is_pinned: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config: from_attributes = True

@router.get("", response_model=List[NoticeOut])
async def get_notices(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(
        select(Notice).order_by(Notice.is_pinned.desc(), Notice.created_at.desc())
    )
    return res.scalars().all()

@router.post("", response_model=NoticeOut, status_code=201)
async def create_notice(
    data: NoticeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("TEACHER", "ADMIN"):
        raise HTTPException(status_code=403, detail="선생님 권한이 필요합니다.")
    notice = Notice(
        author_id=current_user.id,
        title=data.title,
        content=data.content,
        is_pinned=data.is_pinned
    )
    db.add(notice)
    await db.commit()
    await db.refresh(notice)
    return notice

@router.put("/{notice_id}", response_model=NoticeOut)
async def update_notice(
    notice_id: str,
    data: NoticeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(Notice).where(Notice.id == notice_id))
    notice = res.scalars().first()
    if not notice:
        raise HTTPException(status_code=404)
    if notice.author_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403)
    notice.title = data.title
    notice.content = data.content
    notice.is_pinned = data.is_pinned
    notice.updated_at = datetime.utcnow()
    db.add(notice)
    await db.commit()
    await db.refresh(notice)
    return notice

@router.delete("/{notice_id}", status_code=204)
async def delete_notice(
    notice_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(Notice).where(Notice.id == notice_id))
    notice = res.scalars().first()
    if not notice:
        raise HTTPException(status_code=404)
    if notice.author_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403)
    await db.delete(notice)
    await db.commit()
