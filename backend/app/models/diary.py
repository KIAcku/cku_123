import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class DiaryEntry(Base):
    __tablename__ = "diary_entries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    emotion = Column(String(20), default="neutral")  # happy, sad, angry, anxious, neutral, tired
    emotion_score = Column(String(10), default="3")  # 1~5
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    # 상담사 날씨 태그 필드
    weather_tag = Column(String(10), nullable=True)   # ☀️🌤️⛅🌧️⛈️🌈
    counselor_note = Column(Text, nullable=True)       # 상담사 메모
    tagged_by = Column(String(36), ForeignKey("users.id"), nullable=True)  # 태그한 상담사 ID
