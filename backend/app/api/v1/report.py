from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.models.report import Report
from app.schemas.schemas import ReportCreate, ReportResponse
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("", response_model=ReportResponse, status_code=201)
async def create_report(
    report_in: ReportCreate,
    db: AsyncSession = Depends(get_db)
    # 완전 익명 — 인증 불필요, user_id 저장 안 함
):
    report = Report(
        category=report_in.category,
        title=report_in.title,
        content=report_in.content,
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report

@router.get("", response_model=List[ReportResponse])
async def get_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("TEACHER", "ADMIN"):
        raise HTTPException(status_code=403, detail="선생님 권한이 필요합니다.")
    result = await db.execute(select(Report).order_by(Report.created_at.desc()))
    return result.scalars().all()

class ReportStatusUpdate(BaseModel):
    status: str  # pending, reviewing, resolved

@router.patch("/{report_id}/status", response_model=ReportResponse)
async def update_report_status(
    report_id: str,
    data: ReportStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("TEACHER", "ADMIN"):
        raise HTTPException(status_code=403, detail="선생님 권한이 필요합니다.")
    res = await db.execute(select(Report).where(Report.id == report_id))
    report = res.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="신고를 찾을 수 없습니다.")
    report.status = data.status
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report
