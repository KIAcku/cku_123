from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    nickname: Optional[str] = "익명학생"
    role: Optional[str] = "STUDENT"

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    nickname: Optional[str] = "익명학생"
    role: Optional[str] = "STUDENT"
    language: Optional[str] = "ko"
    is_active: Optional[bool] = True
    avatar_url: Optional[str] = None
    guardian_email: Optional[str] = None

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    nickname: Optional[str] = None
    language: Optional[str] = None
    avatar_url: Optional[str] = None
    guardian_email: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

