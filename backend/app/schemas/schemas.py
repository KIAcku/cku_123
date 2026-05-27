from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# --- Diary ---
class DiaryCreate(BaseModel):
    content: str
    emotion: str = "neutral"
    emotion_score: str = "3"

class DiaryUpdate(BaseModel):
    content: Optional[str] = None
    emotion: Optional[str] = None
    emotion_score: Optional[str] = None

class DiaryResponse(BaseModel):
    id: str
    user_id: str
    content: str
    emotion: Optional[str] = "neutral"
    emotion_score: Optional[str] = "3"
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EmotionStat(BaseModel):
    emotion: str
    count: int

class DiaryStats(BaseModel):
    total: int
    this_month: int
    emotion_distribution: List[EmotionStat]
    streak_days: int


# --- Report ---
class ReportCreate(BaseModel):
    category: str
    title: str
    content: str

class ReportResponse(BaseModel):
    id: str
    category: str
    title: str
    content: str
    status: Optional[str] = "접수완료"
    created_at: datetime

    class Config:
        from_attributes = True


# --- Community ---
class PostCreate(BaseModel):
    title: str
    content: str
    category: str = "general"

class PostResponse(BaseModel):
    id: str
    user_id: str
    author_nickname: Optional[str] = "익명"
    title: str
    content: str
    category: Optional[str] = "general"
    likes: Optional[int] = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: str
    post_id: str
    user_id: str
    author_nickname: Optional[str] = "익명"
    content: str
    likes: Optional[int] = 0
    created_at: datetime

    class Config:
        from_attributes = True


# --- User Stats ---
class UserStats(BaseModel):
    diary_count: int
    post_count: int
    comment_count: int
    report_count: int
