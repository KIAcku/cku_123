from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List
from app.core.database import get_db
from app.models.diary import DiaryEntry
from app.schemas.schemas import DiaryCreate, DiaryUpdate, DiaryResponse, DiaryStats, EmotionStat
from app.api.dependencies import get_current_user
from app.models.user import User
from datetime import datetime, date

router = APIRouter()

@router.post("", response_model=DiaryResponse, status_code=201)
async def create_diary(
    diary_in: DiaryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = DiaryEntry(
        user_id=current_user.id,
        content=diary_in.content,
        emotion=diary_in.emotion,
        emotion_score=diary_in.emotion_score,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry

@router.get("/stats", response_model=DiaryStats)
async def get_diary_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 전체 일기 수
    total_result = await db.execute(
        select(func.count(DiaryEntry.id)).where(DiaryEntry.user_id == current_user.id)
    )
    total = total_result.scalar() or 0

    # 이번 달 일기 수
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    month_result = await db.execute(
        select(func.count(DiaryEntry.id)).where(
            DiaryEntry.user_id == current_user.id,
            DiaryEntry.created_at >= month_start
        )
    )
    this_month = month_result.scalar() or 0

    # 감정 분포
    emotion_result = await db.execute(
        select(DiaryEntry.emotion, func.count(DiaryEntry.id))
        .where(DiaryEntry.user_id == current_user.id)
        .group_by(DiaryEntry.emotion)
    )
    emotion_distribution = [
        EmotionStat(emotion=row[0], count=row[1])
        for row in emotion_result.all()
    ]

    return DiaryStats(
        total=total,
        this_month=this_month,
        emotion_distribution=emotion_distribution,
        streak_days=0  # 추후 구현
    )

@router.get("", response_model=List[DiaryResponse])
async def get_diaries(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(DiaryEntry)
        .where(DiaryEntry.user_id == current_user.id)
        .order_by(DiaryEntry.created_at.desc())
    )
    return result.scalars().all()

@router.get("/calendar")
async def get_diary_calendar(
    year: int, month: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    start = datetime(year, month, 1)
    if month == 12:
        end = datetime(year + 1, 1, 1)
    else:
        end = datetime(year, month + 1, 1)
    res = await db.execute(
        select(DiaryEntry.created_at, DiaryEntry.emotion)
        .where(DiaryEntry.user_id == current_user.id, DiaryEntry.created_at >= start, DiaryEntry.created_at < end)
        .order_by(DiaryEntry.created_at.asc())
    )
    entries = res.all()
    return [{"date": str(e[0].date()), "emotion": e[1]} for e in entries]

@router.get("/{diary_id}", response_model=DiaryResponse)
async def get_diary(
    diary_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(DiaryEntry).where(DiaryEntry.id == diary_id, DiaryEntry.user_id == current_user.id)
    )
    entry = result.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail="일기를 찾을 수 없습니다.")
    return entry


@router.put("/{diary_id}", response_model=DiaryResponse)
async def update_diary(
    diary_id: str,
    diary_in: DiaryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(DiaryEntry).where(DiaryEntry.id == diary_id, DiaryEntry.user_id == current_user.id)
    )
    entry = result.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail="일기를 찾을 수 없습니다.")
    if diary_in.content is not None:
        entry.content = diary_in.content
    if diary_in.emotion is not None:
        entry.emotion = diary_in.emotion
    if diary_in.emotion_score is not None:
        entry.emotion_score = diary_in.emotion_score
    entry.updated_at = datetime.utcnow()
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry

@router.delete("/{diary_id}", status_code=204)
async def delete_diary(
    diary_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(DiaryEntry).where(DiaryEntry.id == diary_id, DiaryEntry.user_id == current_user.id)
    )
    entry = result.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail="일기를 찾을 수 없습니다.")
    await db.delete(entry)
    await db.commit()
