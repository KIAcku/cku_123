from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import json
import random

from app.core.database import get_db
from app.models.counsel import TestResult, CounselSession, CounselMessage
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

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

# ─── 상담사 자동응답 엔진 (맥락 기반) ─────────────────────────

def generate_counselor_reply(user_message: str, history_count: int) -> str:
    """메시지 내용과 대화 진행 단계에 따라 맥락 있는 답변 생성"""
    msg = user_message.lower()

    # 위기 키워드 감지
    crisis_keywords = ["죽고 싶", "자살", "죽겠다", "사라지고 싶", "끝내고 싶", "힘들어 죽"]
    if any(k in msg for k in crisis_keywords):
        return (
            "지금 많이 힘드시겠어요. 그 마음이 전해져서 저도 마음이 아파요. 💙\n\n"
            "지금 이 순간, 혼자 감당하지 않으셔도 됩니다. 전문 상담사와 즉시 연결할 수 있는 번호를 알려드릴게요:\n\n"
            "📞 **자살예방상담전화 1393** (24시간)\n"
            "📞 **청소년전화 1388** (24시간)\n\n"
            "지금 안전한가요? 조금 더 이야기해주실 수 있나요?"
        )

    # 학업 관련
    study_keywords = ["공부", "시험", "성적", "학점", "수능", "입시", "숙제", "과제"]
    if any(k in msg for k in study_keywords):
        replies = [
            "학업 스트레스가 정말 많이 쌓이셨겠어요. 😔 구체적으로 어떤 부분이 제일 힘드세요? 시험 준비가 잘 안 된다는 건가요, 아니면 결과가 기대에 미치지 못해서 속상하신 건가요?",
            "공부 때문에 힘드시군요. 요즘 하루에 몇 시간 정도 공부하고 계세요? 스스로를 너무 몰아붙이고 있는 건 아닌지 걱정이 돼요.",
            "성적이나 학업 압박감은 정말 큰 스트레스가 될 수 있어요. 선생님이나 부모님의 기대가 부담이 되고 있는 건가요?",
        ]
        return random.choice(replies)

    # 인간관계 관련
    relation_keywords = ["친구", "따돌림", "왕따", "관계", "싸웠", "갈등", "외로", "혼자"]
    if any(k in msg for k in relation_keywords):
        replies = [
            "친구 관계 때문에 마음이 많이 아프시겠어요. 언제부터 그런 상황이 생겼나요? 무슨 일이 있었는지 조심스럽게 여쭤봐도 될까요?",
            "혼자라고 느낄 때 얼마나 힘든지 잘 알아요. 그 감정은 충분히 당연한 거예요. 지금 학교에서 믿을 수 있는 사람이 한 명이라도 있나요?",
            "그 상황이 정말 불편하고 힘드셨겠어요. 상대방에게 직접 이야기해본 적이 있으신가요?",
        ]
        return random.choice(replies)

    # 가족 관련
    family_keywords = ["부모", "엄마", "아빠", "형제", "가족", "집", "이혼", "갈등"]
    if any(k in msg for k in family_keywords):
        replies = [
            "가족 문제는 정말 가슴 깊이 상처가 될 수 있어요. 집에서 어떤 일이 있으셨는지 좀 더 이야기해주실 수 있나요?",
            "부모님과의 갈등은 정말 힘들죠. 요즘 집에 있을 때 어떤 감정이 드세요?",
            "가족 문제를 혼자 감당하고 계셨군요. 그 무게가 얼마나 무거웠을지... 충분히 힘드셨겠어요.",
        ]
        return random.choice(replies)

    # 우울/불안 관련
    mental_keywords = ["우울", "불안", "힘들", "지쳐", "무기력", "슬프", "괜찮지 않", "눈물", "울고 싶"]
    if any(k in msg for k in mental_keywords):
        replies = [
            "그런 감정을 느끼고 계시는군요. 먼저 용기 내서 이야기해주셔서 정말 고마워요. 💙\n언제부터 그런 감정이 시작됐는지 기억하세요?",
            "많이 지쳐 계시겠어요. 요즘 잠은 잘 자고 계신가요? 식사는 제대로 하고 있나요?",
            "충분히 힘드셨겠어요. 그 감정은 부끄러운 게 아니에요. 저와 함께 천천히 이야기 나눠봐요.",
        ]
        return random.choice(replies)

    # 대화 단계에 따른 기본 응답
    if history_count <= 2:
        # 초반 — 라포 형성
        return random.choice([
            f"말씀해주셔서 감사해요. 😊 오늘 어떤 마음으로 상담을 신청하게 됐는지 좀 더 이야기해주실 수 있나요?",
            "천천히, 편하게 이야기해주세요. 여기서는 무슨 말을 해도 판단하지 않아요. 오늘 가장 마음에 걸리는 게 뭐예요?",
        ])
    elif history_count <= 6:
        # 중반 — 탐색
        return random.choice([
            "그렇군요. 그 상황에서 어떤 감정이 제일 크게 느껴졌어요?",
            "말씀하신 것처럼 힘드셨을 때, 주변에 도움을 요청할 수 있었나요?",
            "그 때 기분이 어떠셨는지 좀 더 구체적으로 이야기해줄 수 있어요?",
            "지금 이 상황에서 가장 바라는 게 뭔가요? 어떻게 되었으면 좋겠어요?",
        ])
    else:
        # 후반 — 정리와 지지
        return random.choice([
            "오늘 정말 많은 이야기를 해주셨어요. 이야기를 나누면서 마음이 조금 가벼워지셨나요? 💙",
            "지금까지 혼자 이 모든 걸 감당해왔다는 게 정말 대단해요. 그 용기에 박수를 드리고 싶어요.",
            "앞으로도 힘들 때 언제든지 이야기하러 오세요. 저는 항상 여기 있을게요. 😊",
            "오늘 나눈 이야기를 바탕으로, 작은 것부터 하나씩 해볼 수 있을 것 같아요. 어떻게 생각하세요?",
        ])

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
        status="active",
        counselor_name="마음이음 상담사",
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    # 첫 인사 — 더 따뜻하고 자세하게
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
    await db.flush()

    # 대화 히스토리 수 확인 (맥락 기반 응답을 위해)
    history_count_r = await db.execute(
        select(func.count(CounselMessage.id)).where(CounselMessage.session_id == session_id)
    )
    history_count = history_count_r.scalar() or 0

    # 맥락 기반 상담사 자동 응답
    reply_content = generate_counselor_reply(data.content, history_count)
    counselor_reply = CounselMessage(
        session_id=session_id,
        sender_role="counselor",
        content=reply_content,
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

# ─── 상담사 전용 API ────────────────────────────────────────

@router.get("/counselor/sessions", response_model=List[SessionOut])
async def get_all_sessions_for_counselor(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """상담사/선생님 전용: 모든 활성 상담 세션 조회"""
    if current_user.role not in ("COUNSELOR", "TEACHER", "ADMIN"):
        raise HTTPException(status_code=403, detail="상담사 권한이 필요합니다.")
    res = await db.execute(
        select(CounselSession).where(CounselSession.status == "active")
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
    if current_user.role not in ("COUNSELOR", "TEACHER", "ADMIN"):
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
    if current_user.role not in ("COUNSELOR", "TEACHER", "ADMIN"):
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
