from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List
from app.core.database import get_db
from app.models.diary import DiaryEntry
from app.schemas.schemas import DiaryCreate, DiaryUpdate, DiaryResponse, DiaryStats, EmotionStat, WeatherTagRequest
from app.api.dependencies import get_current_user
from app.models.user import User
from app.core.encryption import encrypt, decrypt
from datetime import datetime, date, timedelta, timezone

router = APIRouter()

# ─── 상담사 전용: 학생 목록 ─────────────────────────────────────
@router.get("/counselor/students")
async def counselor_get_students(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """상담사가 전체 학생 목록 + 각 학생의 일기 수를 조회합니다."""
    if current_user.role not in ("COUNSELOR", "ADMIN"):
        raise HTTPException(status_code=403, detail="상담사 계정만 접근 가능합니다.")
    res = await db.execute(
        select(User).where(User.role == "STUDENT", User.is_active == True)
        .order_by(User.nickname)
    )
    students = res.scalars().all()
    result = []
    for s in students:
        cnt = await db.execute(
            select(func.count(DiaryEntry.id)).where(DiaryEntry.user_id == s.id)
        )
        result.append({
            "id": s.id,
            "nickname": s.nickname,
            "email": s.email,
            "diary_count": cnt.scalar() or 0,
        })
    return result


# ─── 상담사 전용: 특정 학생 일기 조회 ─────────────────────────
@router.get("/counselor/student/{student_id}", response_model=List[DiaryResponse])
async def counselor_get_student_diaries(
    student_id: str,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """상담사가 특정 학생의 감정 일기를 조회합니다."""
    if current_user.role not in ("COUNSELOR", "ADMIN"):
        raise HTTPException(status_code=403, detail="상담사 계정만 접근 가능합니다.")
    # 학생 존재 확인
    student_res = await db.execute(select(User).where(User.id == student_id, User.role == "STUDENT"))
    student = student_res.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="학생을 찾을 수 없습니다.")
    limit = min(max(1, limit), 200)
    result = await db.execute(
        select(DiaryEntry)
        .where(DiaryEntry.user_id == student_id)
        .order_by(DiaryEntry.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    entries = result.scalars().all()
    for entry in entries:
        entry.content = decrypt(entry.content)
    return entries


# ─── 상담사 전용: 날씨 태그 + 메모 달기 ───────────────────────
@router.patch("/counselor/{diary_id}/tag")
async def counselor_tag_diary(
    diary_id: str,
    body: WeatherTagRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """상담사가 학생 일기에 날씨 태그와 메모를 답니다."""
    if current_user.role not in ("COUNSELOR", "ADMIN"):
        raise HTTPException(status_code=403, detail="상담사 계정만 접근 가능합니다.")
    result = await db.execute(select(DiaryEntry).where(DiaryEntry.id == diary_id))
    entry = result.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail="일기를 찾을 수 없습니다.")
    if body.weather_tag is not None:
        entry.weather_tag = body.weather_tag
    if body.counselor_note is not None:
        entry.counselor_note = body.counselor_note
    entry.tagged_by = current_user.id
    entry.updated_at = datetime.now(timezone.utc)
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return {
        "id": entry.id,
        "weather_tag": entry.weather_tag,
        "counselor_note": entry.counselor_note,
        "tagged_by": entry.tagged_by,
    }



@router.post("", response_model=DiaryResponse, status_code=201)
async def create_diary(
    diary_in: DiaryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = DiaryEntry(
        user_id=current_user.id,
        content=encrypt(diary_in.content),   # 🔐 암호화 후 저장
        emotion=diary_in.emotion,
        emotion_score=diary_in.emotion_score,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    # 응답 시 복호화
    entry.content = decrypt(entry.content)
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

    # 이번 달 일기 수 — UTC 기준 (데이터 일관성)
    now = datetime.now(timezone.utc)
    month_start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
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

    # ─── 연속 기록(streak) 계산 ───────────────────────────────
    all_dates_result = await db.execute(
        select(DiaryEntry.created_at)
        .where(DiaryEntry.user_id == current_user.id)
        .order_by(DiaryEntry.created_at.desc())
    )
    all_dates = [row[0].date() for row in all_dates_result.all() if row[0]]
    written_days = sorted(set(all_dates), reverse=True)  # 중복 제거 + 내림차순

    # [FIX] 서버 로컬 시간이 아닌 UTC 기준 오늘 사용
    today = datetime.now(timezone.utc).date()
    streak = 0
    check_date = today
    for d in written_days:
        if d == check_date:
            streak += 1
            check_date = check_date - timedelta(days=1)
        elif d < check_date:
            break

    return DiaryStats(
        total=total,
        this_month=this_month,
        emotion_distribution=emotion_distribution,
        streak_days=streak
    )



@router.get("", response_model=List[DiaryResponse])
async def get_diaries(
    limit: int = 50,   # [FIX] 페이지네이션 추가 — 무제한 메모리 사용 방지
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # limit 상한 강제 (max 200)
    limit = min(max(1, limit), 200)
    result = await db.execute(
        select(DiaryEntry)
        .where(DiaryEntry.user_id == current_user.id)
        .order_by(DiaryEntry.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    entries = result.scalars().all()
    # 🔐 모든 일기 내용 복호화
    for entry in entries:
        entry.content = decrypt(entry.content)
    return entries

@router.get("/calendar")
async def get_diary_calendar(
    year: int, month: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # [FIX] 입력값 검증 — 잘못된 값 시 500 대신 422 반환
    if not (1 <= month <= 12):
        from fastapi import HTTPException
        raise HTTPException(status_code=422, detail="month는 1~12 사이여야 합니다.")
    if not (2000 <= year <= 2100):
        from fastapi import HTTPException
        raise HTTPException(status_code=422, detail="year는 2000~2100 사이여야 합니다.")
    start = datetime(year, month, 1, tzinfo=timezone.utc)
    if month == 12:
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(year, month + 1, 1, tzinfo=timezone.utc)
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
    # 🔐 복호화 후 반환
    entry.content = decrypt(entry.content)
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
        entry.content = encrypt(diary_in.content)   # 🔐 수정 시 재암호화
    if diary_in.emotion is not None:
        entry.emotion = diary_in.emotion
    if diary_in.emotion_score is not None:
        entry.emotion_score = diary_in.emotion_score
    entry.updated_at = datetime.now(timezone.utc)
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    # 🔐 응답 시 복호화
    entry.content = decrypt(entry.content)
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
