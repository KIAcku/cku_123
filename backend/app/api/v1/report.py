from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.core.database import get_db
from app.models.report import Report
from app.schemas.schemas import ReportCreate, ReportResponse

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
async def get_reports(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Report).order_by(Report.created_at.desc())
    )
    return result.scalars().all()
