from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.report import Report
from app.models.counsel import CounselSession
from app.models.diary import DiaryEntry
from app.models.alert import AlertLog
from datetime import datetime, timedelta
from collections import defaultdict

router = APIRouter()

NEGATIVE_EMOTIONS = {"sad", "angry", "anxious", "tired"}

@router.get("/overview")
async def get_statistics_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("TEACHER", "ADMIN"):
        raise HTTPException(status_code=403, detail="선생님 권한이 필요합니다.")
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    if now.month == 1:
        prev_month_start = datetime(now.year - 1, 12, 1)
    else:
        prev_month_start = datetime(now.year, now.month - 1, 1)
    week_ago = now - timedelta(days=7)

    total_reports = (await db.execute(select(func.count(Report.id)))).scalar() or 0
    this_month_reports = (await db.execute(
        select(func.count(Report.id)).where(Report.created_at >= month_start)
    )).scalar() or 0
    prev_month_reports = (await db.execute(
        select(func.count(Report.id)).where(Report.created_at >= prev_month_start, Report.created_at < month_start)
    )).scalar() or 0
    total_sessions = (await db.execute(select(func.count(CounselSession.id)))).scalar() or 0
    this_month_sessions = (await db.execute(
        select(func.count(CounselSession.id)).where(CounselSession.created_at >= month_start)
    )).scalar() or 0
    total_students = (await db.execute(
        select(func.count(User.id)).where(User.role == "STUDENT", User.is_active == True)
    )).scalar() or 0
    active_alerts = (await db.execute(
        select(func.count(AlertLog.id)).where(AlertLog.resolved == False)
    )).scalar() or 0

    # Category distribution
    cat_res = await db.execute(
        select(Report.category, func.count(Report.id)).group_by(Report.category)
    )
    category_dist = [{'category': r[0], 'count': r[1]} for r in cat_res.all()]

    # Emotion distribution (last 7 days)
    emotion_res = await db.execute(
        select(DiaryEntry.emotion, func.count(DiaryEntry.id))
        .where(DiaryEntry.created_at >= week_ago)
        .group_by(DiaryEntry.emotion)
    )
    emotion_dist = [{'emotion': r[0], 'count': r[1]} for r in emotion_res.all()]

    # Weekly emotion trend (last 4 weeks, per week)
    four_weeks_ago = now - timedelta(weeks=4)
    weekly_res = await db.execute(
        select(DiaryEntry.emotion, DiaryEntry.created_at)
        .where(DiaryEntry.created_at >= four_weeks_ago)
    )
    weekly_entries = weekly_res.all()
    weekly_trend = defaultdict(lambda: defaultdict(int))
    for emotion, created_at in weekly_entries:
        week_num = (now - created_at).days // 7
        label = f"{week_num}주 전" if week_num > 0 else "이번 주"
        weekly_trend[label][emotion] += 1
    weekly_trend_list = [
        {"week": k, **v} for k, v in sorted(weekly_trend.items(), reverse=True)
    ]

    return {
        "total_reports": total_reports,
        "this_month_reports": this_month_reports,
        "prev_month_reports": prev_month_reports,
        "total_sessions": total_sessions,
        "this_month_sessions": this_month_sessions,
        "total_students": total_students,
        "active_alerts": active_alerts,
        "category_distribution": category_dist,
        "emotion_distribution": emotion_dist,
        "weekly_trend": weekly_trend_list,
    }


@router.get("/at-risk-students")
async def get_at_risk_students(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """최근 7일간 부정적 감정을 3회 이상 기록한 학생 목록"""
    if current_user.role not in ("TEACHER", "ADMIN"):
        raise HTTPException(status_code=403, detail="선생님 권한이 필요합니다.")

    week_ago = datetime.utcnow() - timedelta(days=7)

    # 최근 7일 부정 감정 일기 목록
    res = await db.execute(
        select(DiaryEntry.user_id, DiaryEntry.emotion, DiaryEntry.created_at)
        .where(
            DiaryEntry.created_at >= week_ago,
            DiaryEntry.emotion.in_(list(NEGATIVE_EMOTIONS))
        )
    )
    entries = res.all()

    # user_id 별 부정 감정 카운트
    counts = defaultdict(int)
    last_emotions = defaultdict(list)
    for user_id, emotion, created_at in entries:
        counts[user_id] += 1
        last_emotions[user_id].append(emotion)

    # 3회 이상인 학생만
    at_risk_ids = [uid for uid, cnt in counts.items() if cnt >= 3]

    if not at_risk_ids:
        return []

    # 학생 정보 조회
    user_res = await db.execute(
        select(User).where(User.id.in_(at_risk_ids))
    )
    users = user_res.scalars().all()

    result = []
    for u in users:
        emotions_list = last_emotions[u.id]
        # 가장 많이 나타난 감정
        dominant = max(set(emotions_list), key=emotions_list.count)
        result.append({
            "id": u.id,
            "nickname": u.nickname,
            "negative_count": counts[u.id],
            "dominant_emotion": dominant,
            "risk_level": "high" if counts[u.id] >= 5 else "medium",
        })

    return sorted(result, key=lambda x: x["negative_count"], reverse=True)
