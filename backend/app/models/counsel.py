from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    test_type = Column(String, nullable=False)  # 'phq9', 'gad7', 'stress'
    score = Column(Integer, default=0)
    answers = Column(Text, default="[]")  # JSON 문자열
    level = Column(String, default="")   # 'minimal', 'mild', 'moderate', 'severe'
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CounselSession(Base):
    __tablename__ = "counsel_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    concern = Column(Text, default="")           # 상담 주제/고민
    counselor_name = Column(String, default="상담사")
    status = Column(String, default="waiting")   # waiting, active, closed
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)


class CounselMessage(Base):
    __tablename__ = "counsel_messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("counsel_sessions.id"), nullable=False)
    sender_role = Column(String, default="user")  # 'user' or 'counselor'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
