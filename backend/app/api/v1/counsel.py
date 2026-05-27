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
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

# ─── 스키마 ───────────────────────────────────────────────

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

# ─── 자가진단 테스트 ───────────────────────────────────────

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

COUNSELOR_RESPONSES = [
    "말씀해주셔서 감사해요. 더 자세히 이야기해주실 수 있나요?",
    "그런 상황이었군요. 그 때 기분이 어떠셨나요?",
    "충분히 힘드셨겠어요. 지금은 어떠신가요?",
    "그 감정은 자연스러운 반응이에요. 함께 방법을 찾아봐요.",
    "혼자 감당하지 않아도 돼요. 제가 옆에 있을게요.",
    "많이 용기 내셨네요. 이야기해줘서 고마워요.",
    "그 상황에서 어떻게 하셨나요? 구체적으로 이야기해주세요.",
    "지금 가장 걱정되는 것은 무엇인가요?",
]

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
        status="active",
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    # 상담사 첫 인사 자동 발송
    greeting = CounselMessage(
        session_id=session.id,
        sender_role="counselor",
        content=f"안녕하세요! 저는 담당 상담사예요 😊\n'{data.concern}'에 대해 상담해드릴게요.\n편하게 이야기해주세요.",
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
    # 세션 본인 확인
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
    import random
    # 세션 확인
    sr = await db.execute(select(CounselSession).where(CounselSession.id == session_id))
    session = sr.scalars().first()
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="접근 권한이 없습니다.")

    # 사용자 메시지 저장
    user_msg = CounselMessage(
        session_id=session_id,
        sender_role="user",
        content=data.content,
    )
    db.add(user_msg)
    await db.flush()

    # 상담사 자동 응답
    counselor_reply = CounselMessage(
        session_id=session_id,
        sender_role="counselor",
        content=random.choice(COUNSELOR_RESPONSES),
    )
    db.add(counselor_reply)
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
