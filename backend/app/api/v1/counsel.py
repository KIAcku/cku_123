from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import json
import asyncio

from app.core.database import get_db
from app.models.counsel import TestResult, CounselSession, CounselMessage
from app.models.alert import AlertLog
from app.api.dependencies import get_current_user
from app.models.user import User
from app.core.supabase_client import broadcast_message, send_notification
from app.core.encryption import encrypt, decrypt

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
    image_url: Optional[str] = None

class MessageOut(BaseModel):
    id: str
    session_id: str
    sender_role: str
    content: str
    image_url: Optional[str] = None
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

@router.get("/tests/integrated-report")
async def get_integrated_report(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """각 검사 유형별 최신 결과를 가져와 통합 심리 프로파일을 반환합니다."""
    res = await db.execute(
        select(TestResult)
        .where(TestResult.user_id == current_user.id)
        .order_by(TestResult.created_at.desc())
    )
    all_results = res.scalars().all()

    # 검사 유형별 최신 결과 1건만 추출
    latest: dict = {}
    for r in all_results:
        if r.test_type not in latest:
            latest[r.test_type] = {
                "test_type": r.test_type,
                "score": r.score,
                "level": r.level,
                "answers": json.loads(r.answers) if r.answers else [],
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }

    # 도메인별 점수 정규화 (0~100 스케일)
    NORMALIZERS = {
        "phq9":        {"max": 27, "invert": True},
        "gad7":        {"max": 21, "invert": True},
        "stress":      {"max": 30, "invert": True},
        "rses":        {"max": 40, "invert": False},
        "ecr_anxiety": {"max": 36, "invert": True},
        "ecr_avoid":   {"max": 36, "invert": True},
        "relationship":{"max": 40, "invert": True},
        "ders":        {"max": 40, "invert": True},
        "ego":         {"max": 32, "invert": False},
    }

    ecr_data = latest.get("ecr")
    if ecr_data and ecr_data.get("answers"):
        answers = ecr_data["answers"]
        anxiety_score = sum(answers[i] for i in range(0, min(12, len(answers)), 2))
        avoid_score   = sum(answers[i] for i in range(1, min(12, len(answers)), 2))
        latest["ecr_anxiety"] = {"test_type": "ecr_anxiety", "score": anxiety_score, "level": ecr_data["level"], "created_at": ecr_data["created_at"]}
        latest["ecr_avoid"]   = {"test_type": "ecr_avoid",   "score": avoid_score,   "level": ecr_data["level"], "created_at": ecr_data["created_at"]}

    def normalize(test_type: str, score: int) -> float:
        cfg = NORMALIZERS.get(test_type)
        if not cfg:
            return 50.0
        pct = min(score / cfg["max"], 1.0) * 100
        return round(100 - pct if cfg["invert"] else pct, 1)

    profile = {}
    for tt, data in latest.items():
        if tt in NORMALIZERS:
            profile[tt] = {
                **data,
                "normalized": normalize(tt, data["score"])
            }

    def avg_norm(*keys):
        vals = [profile[k]["normalized"] for k in keys if k in profile]
        return round(sum(vals) / len(vals), 1) if vals else None

    radar = {
        "emotional_health":   avg_norm("phq9", "gad7"),
        "stress_resilience":  avg_norm("stress", "ego"),
        "self_esteem":        avg_norm("rses"),
        "attachment_security":avg_norm("ecr_anxiety", "ecr_avoid"),
        "relationship_health":avg_norm("relationship"),
        "emotion_regulation": avg_norm("ders"),
    }

    radar_named = {k: v for k, v in radar.items() if v is not None}
    weak_areas   = sorted([(k, v) for k, v in radar_named.items() if v < 45], key=lambda x: x[1])
    strong_areas = sorted([(k, v) for k, v in radar_named.items() if v >= 65], key=lambda x: -x[1])

    return {
        "latest_tests": latest,
        "profile": profile,
        "radar": radar,
        "weak_areas":   [{"domain": k, "score": v} for k, v in weak_areas],
        "strong_areas": [{"domain": k, "score": v} for k, v in strong_areas],
        "completed_types": list(latest.keys()),
    }


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

def _decrypt_session(session: CounselSession) -> CounselSession:
    """세션의 concern 필드를 복호화합니다."""
    session.concern = decrypt(session.concern)
    return session

def _decrypt_message(msg: CounselMessage) -> CounselMessage:
    """메시지의 content 필드를 복호화합니다."""
    msg.content = decrypt(msg.content)
    return msg

@router.post("/sessions", response_model=SessionOut, status_code=201)
async def create_session(
    data: SessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = CounselSession(
        user_id=current_user.id,
        concern=encrypt(data.concern),   # 🔐 상담 주제 암호화
        scheduled_at=data.scheduled_at,
        status="waiting",
        counselor_name="마음이음 상담사",
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    # 첫 인사 메시지
    concern_text = data.concern.replace("[", "").replace("]", "")
    greeting_content = (
        f"안녕하세요! 저는 마음이음 상담사예요 😊\n\n"
        f"오늘 '{concern_text}'에 대해 이야기해주시겠다고 하셨군요.\n"
        f"먼저 용기 내어 상담을 신청해주셔서 정말 감사해요.\n\n"
        f"여기서는 어떤 이야기를 해도 절대 판단하지 않아요. 💙\n"
        f"천천히, 편하게 이야기해주세요. 오늘 어떤 마음으로 오셨는지 들려주실 수 있나요?"
    )
    greeting = CounselMessage(
        session_id=session.id,
        sender_role="counselor",
        content=encrypt(greeting_content),   # 🔐 인사 메시지 암호화
    )
    db.add(greeting)
    await db.commit()

    # Supabase Realtime에 인사 메시지 broadcast (평문으로 전송)
    asyncio.create_task(broadcast_message(
        session_id=session.id,
        sender_role="counselor",
        content=greeting_content,
    ))

    # 응답 시 concern 복호화
    session.concern = decrypt(session.concern)
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
    sessions = res.scalars().all()
    # 🔐 concern 복호화
    for s in sessions:
        s.concern = decrypt(s.concern)
    return sessions

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
    messages = res.scalars().all()
    # 🔐 content 복호화
    for msg in messages:
        msg.content = decrypt(msg.content)
    return messages

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

    # 위기 키워드 감지 (저장 전 평문으로 검사)
    for kw in CRISIS_KEYWORDS:
        if kw in data.content:
            alert = AlertLog(session_id=session_id, message_content=data.content, keyword=kw)
            db.add(alert)
            break

    # 🔐 메시지 암호화 후 저장
    user_msg = CounselMessage(
        session_id=session_id,
        sender_role="user",
        content=encrypt(data.content),
        image_url=data.image_url,
    )
    db.add(user_msg)
    await db.commit()

    # Supabase Realtime broadcast (평문으로 전송)
    asyncio.create_task(broadcast_message(
        session_id=session_id,
        sender_role="user",
        content=data.content,
        image_url=data.image_url,
    ))

    res = await db.execute(
        select(CounselMessage).where(CounselMessage.session_id == session_id)
        .order_by(CounselMessage.created_at.asc())
    )
    messages = res.scalars().all()
    # 🔐 전체 메시지 복호화
    for msg in messages:
        msg.content = decrypt(msg.content)
    return messages

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
    session.concern = decrypt(session.concern)
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
    sessions = res.scalars().all()
    # 🔐 concern 복호화
    for s in sessions:
        s.concern = decrypt(s.concern)
    return sessions

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
    messages = res.scalars().all()
    # 🔐 content 복호화
    for msg in messages:
        msg.content = decrypt(msg.content)
    return messages

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
    # 🔐 상담사 답변 암호화 후 저장
    msg = CounselMessage(
        session_id=session_id,
        sender_role="counselor",
        content=encrypt(data.content),
        image_url=data.image_url,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    # Supabase Realtime broadcast + 학생에게 알림 (평문으로 전송)
    asyncio.create_task(broadcast_message(
        session_id=session_id,
        sender_role="counselor",
        content=data.content,
        image_url=data.image_url,
    ))
    asyncio.create_task(send_notification(
        user_id=str(session.user_id),
        type="counsel_reply",
        title="📩 상담사가 답변했습니다",
        body=data.content[:60] + ("..." if len(data.content) > 60 else ""),
        link=f"/dashboard/counsel",
    ))

    # 🔐 응답 시 복호화
    msg.content = decrypt(msg.content)
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
    session.concern = decrypt(session.concern)
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
        summary=encrypt(data.summary),   # 🔐 보고서 요약 암호화
        risk_level=data.risk_level
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    report.summary = decrypt(report.summary)
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
    reports = res.scalars().all()
    # 🔐 보고서 요약 복호화
    for r in reports:
        r.summary = decrypt(r.summary)
    return reports
