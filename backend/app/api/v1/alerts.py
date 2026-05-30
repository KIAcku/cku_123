from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.core.database import get_db
from app.models.alert import AlertLog
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

class AlertOut(BaseModel):
    id: str
    session_id: Optional[str] = None
    message_content: str
    keyword: str
    resolved: bool
    created_at: datetime
    class Config: from_attributes = True

@router.get("", response_model=List[AlertOut])
async def get_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("COUNSELOR", "TEACHER", "ADMIN"):
        raise HTTPException(status_code=403)
    res = await db.execute(
        select(AlertLog).where(AlertLog.resolved == False).order_by(AlertLog.created_at.desc())
    )
    return res.scalars().all()

@router.patch("/{alert_id}/resolve")
async def resolve_alert(
    alert_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("COUNSELOR", "TEACHER", "ADMIN"):
        raise HTTPException(status_code=403)
    res = await db.execute(select(AlertLog).where(AlertLog.id == alert_id))
    alert = res.scalars().first()
    if not alert:
        raise HTTPException(status_code=404)
    alert.resolved = True
    alert.resolved_at = datetime.utcnow()
    db.add(alert)
    await db.commit()
    return {"message": "처리되었습니다."}
