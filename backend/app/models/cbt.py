import uuid
from sqlalchemy import Column, String, Text, DateTime, Boolean, Integer
from sqlalchemy.sql import func
from app.core.database import Base


class CbtRecord(Base):
    """CBT 자기성찰 일지 — 상황/자동사고/증거/균형사고 구조"""
    __tablename__ = "cbt_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False)
    situation = Column(Text, nullable=False)        # 어떤 상황이었나요?
    auto_thought = Column(Text, nullable=False)     # 어떤 생각이 들었나요?
    evidence_for = Column(Text, default="")         # 그 생각이 사실이라는 증거
    evidence_against = Column(Text, default="")     # 그 생각이 사실이 아니라는 증거
    balanced_thought = Column(Text, default="")     # 균형잡힌 생각
    emotion_before = Column(String(20), default="anxious")  # 전 감정
    emotion_after = Column(String(20), default="neutral")   # 후 감정
    distortions = Column(Text, default="[]")        # JSON 배열 — 해당 인지왜곡 목록
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CopingCard(Base):
    """코핑 카드 — 개인 맞춤 대처 전략"""
    __tablename__ = "coping_cards"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)          # 대처 전략 내용
    category = Column(String(50), default="general")  # 호흡법, 인지재구성, 행동활성화, 사회적지지, 마음챙김
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
