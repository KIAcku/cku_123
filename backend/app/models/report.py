import uuid
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    # 완전 익명 - user_id 저장 안 함
    category = Column(String(50), nullable=False)  # bullying, discrimination, harassment, other
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String(20), default="pending")  # pending, reviewing, resolved
    created_at = Column(DateTime(timezone=True), server_default=func.now())
