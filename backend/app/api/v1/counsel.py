from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import json

from app.core.database import get_db
from app.models.counsel import TestResult, CounselSession, CounselMessage
from app.models.alert import AlertLog
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

# ─── 위기 키워드 ──────────────────────────────────────────────
CRISIS_KEYWORDS = ["죽고 싶", "자살", "사라지고 싶", "죽겠다", "끝내고 싶", "자해", "못 살겠"]

# ─── 스키마 ───────────────────────────────────────────────────

class TestCreate(BaseModel):
    test_type: str
    score: int
    answers: List[int]
    level: str

class TestResultOut(BaseModel):
    id: str
    test_type: str
    score: int
    level: str
    created_at: datetime
    class Config: from_attributes = True

class SessionCreate(BaseModel):
    concern: str
    scheduled_at: Optional[datetime] = None

class SessionOut(BaseModel):
    id: str
    concern: str
    counselor_name: str
    status: str
    scheduled_at: Optional[datetime] = None
    created_at: datetime
    class Config: from_attributes = True

class MessageCreate(BaseModel):
    content: str

class MessageOut(BaseModel):
    id: str
    session_id: str
    sender_role: str
    content: str
    created_at: datetime
    class Config: from_attributes = True

class CounselReportCreate(BaseModel):
    summary: str
    risk_level: str = "low"

class CounselReportOut(BaseModel):
    id: str
    session_id: str
    counselor_id: str
    summary: str
    risk_level: str
    created_at: datetime
    class Config: from_attributes = True

# ─── 자가진단 테스트 ────────────────────────────────────────

@router.post("/tests", response_model=TestResultOut, status_code=201)
async def save_test(
    data: TestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = TestResult(
        user_id=current_user.id,
        test_type=data.test_type,
        score=data.score,
        answers=json.dumps(data.answers),
        level=data.level,
    )
    db.add(result)
    await db.commit()
    await db.refresh(result)
    return result

@router.get("/tests", response_model=List[TestResultOut])
async def get_tests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(
        select(TestResult).where(TestResult.user_id == current_user.id)
        .order_by(TestResult.created_at.desc())
    )
    return res.scalars().all()

# ─── 상담 세션 ─────────────────────────────────────────────

@router.post("/sessions", response_model=SessionOut, status_code=201)
async def create_session(
    data: SessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = CounselSession(
        user_id=current_user.id,
        concern=data.concern,
        scheduled_at=data.scheduled_at,
        status="waiting",
        counselor_name="마음이음 상담사",
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    # 첫 인사 메시지
    concern_text = data.concern.replace("[", "").replace("]", "")
    greeting = CounselMessage(
        session_id=session.id,
        sender_role="counselor",
        content=(
            f"안녕하세요! 저는 마음이음 상담사예요 😊\n\n"
            f"오늘 '{concern_text}'에 대해 이야기해주시겠다고 하셨군요.\n"
            f"먼저 용기 내어 상담을 신청해주셔서 정말 감사해요.\n\n"
            f"여기서는 어떤 이야기를 해도 절대 판단하지 않아요. 💙\n"
            f"천천히, 편하게 이야기해주세요. 오늘 어떤 마음으로 오셨는지 들려주실 수 있나요?"
        ),
    )
    db.add(greeting)
    await db.commit()
    return session

@router.get("/sessions", response_model=List[SessionOut])
async def get_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(
        select(CounselSession).where(CounselSession.user_id == current_user.id)
        .order_by(CounselSession.created_at.desc())
    )
    return res.scalars().all()

@router.get("/sessions/{session_id}/messages", response_model=List[MessageOut])
async def get_messages(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sr = await db.execute(select(CounselSession).where(CounselSession.id == session_id))
    session = sr.scalars().first()
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="접근 권한이 없습니다.")
    res = await db.execute(
        select(CounselMessage).where(CounselMessage.session_id == session_id)
        .order_by(CounselMessage.created_at.asc())
    )
    return res.scalars().all()

@router.post("/sessions/{session_id}/messages", response_model=List[MessageOut])
async def send_message(
    session_id: str,
    data: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sr = await db.execute(select(CounselSession).where(CounselSession.id == session_id))
    session = sr.scalars().first()
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="접근 권한이 없습니다.")
    if session.status == "closed":
        raise HTTPException(status_code=400, detail="종료된 상담 세션입니다.")

    # 사용자 메시지 저장
    user_msg = CounselMessage(
        session_id=session_id,
        sender_role="user",
        content=data.content,
    )
    db.add(user_msg)

    # 위기 키워드 감지 후 AlertLog 생성
    for kw in CRISIS_KEYWORDS:
        if kw in data.content:
            alert = AlertLog(session_id=session_id, message_content=data.content, keyword=kw)
            db.add(alert)
            break

    await db.commit()

    res = await db.execute(
        select(CounselMessage).where(CounselMessage.session_id == session_id)
        .order_by(CounselMessage.created_at.asc())
    )
    return res.scalars().all()

@router.patch("/sessions/{session_id}/close", response_model=SessionOut)
async def close_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sr = await db.execute(select(CounselSession).where(CounselSession.id == session_id))
    session = sr.scalars().first()
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="접근 권한이 없습니다.")
    session.status = "closed"
    session.closed_at = datetime.utcnow()
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

# ─── 상담사 전용 API ────────────────────────────────────────

@router.get("/counselor/sessions", response_model=List[SessionOut])
async def get_all_sessions_for_counselor(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """상담사/관리자 전용: 모든 활성 상담 세션 조회"""
    if current_user.role not in ("COUNSELOR", "ADMIN"):
        raise HTTPException(status_code=403, detail="상담사 권한이 필요합니다.")
    res = await db.execute(
        select(CounselSession).where(CounselSession.status.in_(["waiting", "active"]))
        .order_by(CounselSession.created_at.desc())
    )
    return res.scalars().all()

@router.get("/counselor/sessions/{session_id}/messages", response_model=List[MessageOut])
async def get_session_messages_counselor(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """상담사 전용: 특정 세션의 대화 내역 조회"""
    if current_user.role not in ("COUNSELOR", "ADMIN"):
        raise HTTPException(status_code=403, detail="상담사 권한이 필요합니다.")
    res = await db.execute(
        select(CounselMessage).where(CounselMessage.session_id == session_id)
        .order_by(CounselMessage.created_at.asc())
    )
    return res.scalars().all()

@router.post("/counselor/sessions/{session_id}/reply", response_model=MessageOut)
async def counselor_reply(
    session_id: str,
    data: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """상담사 전용: 학생에게 직접 답변"""
    if current_user.role not in ("COUNSELOR", "ADMIN"):
        raise HTTPException(status_code=403, detail="상담사 권한이 필요합니다.")
    sr = await db.execute(select(CounselSession).where(CounselSession.id == session_id))
    session = sr.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다.")
    msg = CounselMessage(
        session_id=session_id,
        sender_role="counselor",
        content=data.content,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg

@router.patch("/counselor/sessions/{session_id}/assign", response_model=SessionOut)
async def assign_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("COUNSELOR", "ADMIN"):
        raise HTTPException(status_code=403, detail="상담사 권한이 필요합니다.")
    sr = await db.execute(select(CounselSession).where(CounselSession.id == session_id))
    session = sr.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다.")
    session.counselor_name = current_user.nickname
    session.status = "active"
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

@router.post("/counselor/sessions/{session_id}/report", response_model=CounselReportOut, status_code=201)
async def create_counsel_report(
    session_id: str,
    data: CounselReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("COUNSELOR", "ADMIN"):
        raise HTTPException(status_code=403, detail="상담사 권한이 필요합니다.")
    from app.models.counsel import CounselReport
    report = CounselReport(
        session_id=session_id,
        counselor_id=current_user.id,
        summary=data.summary,
        risk_level=data.risk_level
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report

@router.get("/teacher/reports", response_model=List[CounselReportOut])
async def get_teacher_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("TEACHER", "ADMIN"):
        raise HTTPException(status_code=403, detail="선생님 권한이 필요합니다.")
    from app.models.counsel import CounselReport
    res = await db.execute(select(CounselReport).order_by(CounselReport.created_at.desc()))
    return res.scalars().all()
