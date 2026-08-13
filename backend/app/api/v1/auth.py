from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from pydantic import constr
import random
import string

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User
from app.models.diary import DiaryEntry
from app.models.community import Post, Comment
from app.models.report import Report
from app.models.verification import EmailVerification
from app.schemas.user_schema import UserCreate, UserResponse, UserUpdate, Token
from app.schemas.schemas import UserStats
from app.api.dependencies import get_current_user

router = APIRouter()

VALID_ROLES = {"STUDENT", "TEACHER", "COUNSELOR", "ADMIN"}
# 회원가입 시 자가 부여 가능한 역할 — TEACHER/COUNSELOR/ADMIN은 불가
PUBLIC_SIGNUP_ROLES = {"STUDENT"}

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # 이메일 중복 체크
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="이미 등록된 이메일입니다.")

    # 닉네임 중복 체크 (닉네임이 제공된 경우)
    if user_in.nickname and user_in.nickname != "익명학생":
        nick_result = await db.execute(select(User).where(User.nickname == user_in.nickname))
        if nick_result.scalars().first():
            raise HTTPException(status_code=400, detail="이미 사용 중인 닉네임입니다.")

    # [SECURITY] 일반 가입으로는 STUDENT만 허용 — 관리자가 직접 역할 부여해야 함
    role = "STUDENT"

    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        nickname=user_in.nickname or "익명학생",
        role=role,
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
        avatar_url=user.avatar_url,
        guardian_email=user.guardian_email,
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user_data}

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # last_seen_at 업데이트 (5분 이상 지났을 때만 DB 쓰기 — 불필요한 write 방지)
    now = datetime.now(timezone.utc)
    last_seen = current_user.last_seen_at
    if last_seen is None or (now - (last_seen if last_seen.tzinfo else last_seen.replace(tzinfo=timezone.utc))).total_seconds() > 300:
        current_user.last_seen_at = now
        current_user.is_online = True
        db.add(current_user)
        await db.commit()
        await db.refresh(current_user)
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 닉네임 변경 시 중복 체크
    if update_data.nickname is not None and update_data.nickname != current_user.nickname:
        nick_result = await db.execute(select(User).where(User.nickname == update_data.nickname))
        if nick_result.scalars().first():
            raise HTTPException(status_code=400, detail="이미 사용 중인 닉네임입니다.")
        current_user.nickname = update_data.nickname

    if update_data.language is not None:
        current_user.language = update_data.language

    if update_data.avatar_url is not None:
        current_user.avatar_url = update_data.avatar_url

    if update_data.guardian_email is not None:
        current_user.guardian_email = update_data.guardian_email

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
    # [FIX] 전체 신고 수가 아닌 해당 유저의 신고 수만 반환
    report_count_r = await db.execute(
        select(func.count(Report.id)).where(Report.user_id == current_user.id)
    )
    return UserStats(
        diary_count=diary_count_r.scalar() or 0,
        post_count=post_count_r.scalar() or 0,
        comment_count=comment_count_r.scalar() or 0,
        report_count=report_count_r.scalar() or 0,
    )

# ─── 비밀번호 변경 ──────────────────────────────────────────

class PasswordChange(BaseModel):
    current_password: str
    new_password: str  # 최소 8자 — 프론트에서도 검증하지만 백엔드에서도 확인

    def validate(self):
        if len(self.new_password) < 8:
            raise ValueError("새 비밀번호는 최소 8자 이상이어야 합니다.")

@router.put("/me/password")
async def change_password(
    data: PasswordChange,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="현재 비밀번호가 올바르지 않습니다.")
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="새 비밀번호는 최소 8자 이상이어야 합니다.")
    current_user.hashed_password = get_password_hash(data.new_password)
    db.add(current_user)
    await db.commit()
    return {"message": "비밀번호가 변경되었습니다."}

# ─── 계정 탈퇴 ──────────────────────────────────────────────

class AccountDelete(BaseModel):
    password: str

@router.delete("/me")
async def delete_account(
    data: AccountDelete,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(data.password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="비밀번호가 올바르지 않습니다.")
    current_user.is_active = False
    db.add(current_user)
    await db.commit()
    return {"message": "계정이 탈퇴되었습니다."}

# ─── 이메일 인증 ─────────────────────────────────────────────

class SendCodeRequest(BaseModel):
    email: str
    purpose: str  # find_id, reset_password

@router.post("/send-code")
async def send_verification_code(data: SendCodeRequest, db: AsyncSession = Depends(get_db)):
    code = ''.join(random.choices(string.digits, k=6))
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    verification = EmailVerification(
        email=data.email,
        code=code,
        purpose=data.purpose,
        expires_at=expires
    )
    db.add(verification)
    await db.commit()
    # 이메일 발송 시도
    from app.core.config import settings
    sent = False
    if settings.SMTP_HOST:
        try:
            import aiosmtplib
            from email.mime.text import MIMEText
            msg = MIMEText(f"[마음이음] 인증 코드: {code} (10분 내 사용)")
            msg['Subject'] = '[마음이음] 이메일 인증 코드'
            msg['From'] = settings.SMTP_FROM
            msg['To'] = data.email
            await aiosmtplib.send(
                msg,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASS,
                start_tls=True
            )
            sent = True
        except Exception as e:
            # [SECURITY] 코드를 로그에 출력하지 않음 — 이메일만 기록
            print(f"[EMAIL ERROR] {data.email}에 발송 실패: {type(e).__name__}")
    if not sent:
        # [DEV] 개발 환경에서만 stdout으로 코드 확인 (프로덕션에서는 SMTP_HOST 설정 필요)
        import os
        if os.getenv("APP_ENV", "development") == "development":
            print(f"[DEV 인증코드] {data.email} 용 코드가 DB에 저장됨 (SMTP 미설정)")
    return {"message": "인증 코드가 발송되었습니다."}

class VerifyCodeRequest(BaseModel):
    email: str
    code: str
    purpose: str

@router.post("/verify-code")
async def verify_code(data: VerifyCodeRequest, db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)
    res = await db.execute(
        select(EmailVerification).where(
            EmailVerification.email == data.email,
            EmailVerification.code == data.code,
            EmailVerification.purpose == data.purpose,
            EmailVerification.is_used == False,
        ).order_by(EmailVerification.created_at.desc())
    )
    verification = res.scalars().first()
    if not verification:
        raise HTTPException(status_code=400, detail="인증 코드가 올바르지 않거나 만료되었습니다.")
    # expires_at 비교 (naive/aware 호환)
    expires = verification.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires < now:
        raise HTTPException(status_code=400, detail="인증 코드가 만료되었습니다.")
    verification.is_used = True
    db.add(verification)
    await db.commit()
    return {"message": "인증되었습니다.", "verified": True}

# ─── 아이디 찾기 ─────────────────────────────────────────────

class FindIdRequest(BaseModel):
    email: str

@router.post("/find-id")
async def find_id(data: FindIdRequest, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User).where(User.email == data.email, User.is_active == True))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="해당 이메일로 가입된 계정이 없습니다.")
    return {"email": user.email, "nickname": user.nickname, "created_at": str(user.created_at)}

# ─── 비밀번호 재설정 ─────────────────────────────────────────

class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str

@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    # [SECURITY CRITICAL FIX] 반드시 verify-code 완료 여부 확인 후 변경 허용
    now = datetime.now(timezone.utc)
    verification_res = await db.execute(
        select(EmailVerification).where(
            EmailVerification.email == data.email,
            EmailVerification.purpose == "reset_password",
            EmailVerification.is_used == True,
        ).order_by(EmailVerification.created_at.desc())
    )
    verified = verification_res.scalars().first()
    if not verified:
        raise HTTPException(status_code=403, detail="이메일 인증을 먼저 완료해주세요.")
    # 인증 후 10분 이내만 허용
    verified_at = verified.expires_at  # expires_at이 인증 시점의 만료 시각
    if verified_at.tzinfo is None:
        verified_at = verified_at.replace(tzinfo=timezone.utc)
    if (now - verified_at).total_seconds() > 1200:  # 10분 + 여유 10분 = 20분
        raise HTTPException(status_code=403, detail="인증이 만료되었습니다. 다시 인증해주세요.")

    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="비밀번호는 최소 8자 이상이어야 합니다.")

    res = await db.execute(select(User).where(User.email == data.email, User.is_active == True))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="해당 이메일로 가입된 계정이 없습니다.")
    user.hashed_password = get_password_hash(data.new_password)
    db.add(user)
    await db.commit()
    return {"message": "비밀번호가 재설정되었습니다."}
