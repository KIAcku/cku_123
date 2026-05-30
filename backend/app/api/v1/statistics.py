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

router = APIRouter()

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
    }
