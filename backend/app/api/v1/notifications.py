from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.counsel import CounselSession, CounselMessage
from app.models.report import Report
from app.models.alert import AlertLog
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/unread")
async def get_unread_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = {"messages": 0, "reports": 0, "alerts": 0}
    if current_user.role in ("COUNSELOR", "ADMIN"):
        # Count sessions with student messages in last hour (unread)
        res = await db.execute(
            select(func.count(CounselSession.id))
            .where(CounselSession.status == "active")
        )
        result["messages"] = res.scalar() or 0
    if current_user.role in ("TEACHER", "ADMIN"):
        since = datetime.utcnow() - timedelta(days=1)
        res = await db.execute(
            select(func.count(Report.id)).where(Report.created_at >= since)
        )
        result["reports"] = res.scalar() or 0
    if current_user.role in ("COUNSELOR", "TEACHER", "ADMIN"):
        res = await db.execute(
            select(func.count(AlertLog.id)).where(AlertLog.resolved == False)
        )
        result["alerts"] = res.scalar() or 0
    return result
