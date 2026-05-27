from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User
from app.models.diary import DiaryEntry
from app.models.community import Post, Comment
from app.models.report import Report
from app.schemas.user_schema import UserCreate, UserResponse, UserUpdate, Token
from app.schemas.schemas import UserStats
from app.api.dependencies import get_current_user

router = APIRouter()

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="이미 등록된 이메일입니다.")
    
    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        nickname=user_in.nickname or "익명학생",
        role=user_in.role or "STUDENT",
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
async def login(db: AsyncSession = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="이메일 또는 비밀번호가 올바르지 않습니다.")
    
    access_token = create_access_token(subject=user.id)
    user_data = UserResponse(
        id=user.id,
        email=user.email,
        nickname=user.nickname,
        role=user.role,
        language=user.language,
        is_active=user.is_active,
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user_data}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if update_data.nickname is not None:
        current_user.nickname = update_data.nickname
    if update_data.language is not None:
        current_user.language = update_data.language
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.get("/me/stats", response_model=UserStats)
async def get_my_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    diary_count_r = await db.execute(
        select(func.count(DiaryEntry.id)).where(DiaryEntry.user_id == current_user.id)
    )
    post_count_r = await db.execute(
        select(func.count(Post.id)).where(Post.user_id == current_user.id)
    )
    comment_count_r = await db.execute(
        select(func.count(Comment.id)).where(Comment.user_id == current_user.id)
    )
    report_count_r = await db.execute(
        select(func.count(Report.id))
    )
    return UserStats(
        diary_count=diary_count_r.scalar() or 0,
        post_count=post_count_r.scalar() or 0,
        comment_count=comment_count_r.scalar() or 0,
        report_count=report_count_r.scalar() or 0,
    )
