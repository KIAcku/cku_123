from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, diary, report, community, counsel, upload, alerts, notifications, statistics, notices, counselors
import os

# 모든 모델 import (테이블 생성을 위해)
from app.models import user, diary as diary_model, report as report_model
from app.models.community import Post, Comment, PostLike, CommentLike
from app.models import counsel as counsel_model
from app.models import alert as alert_model
from app.models import notice as notice_model
from app.models import verification as verification_model
from app.models.counsel import CounselReport

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="학생 심리 케어 및 학교 적응 지원 플랫폼 API",
    version="2.0.0"
)

# ✅ CORS 설정 — 미들웨어는 라우터보다 먼저 등록
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "https://cku-maumium.vercel.app",
        "https://cku-mumium.vercel.app",
        "https://frontend-cku-s-projects.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (avatars)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "static")
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "avatars"), exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# 라우터 등록
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["인증"])
app.include_router(diary.router, prefix=f"{settings.API_V1_STR}/diaries", tags=["감정 일기"])
app.include_router(report.router, prefix=f"{settings.API_V1_STR}/reports", tags=["익명 신고"])
app.include_router(community.router, prefix=f"{settings.API_V1_STR}/posts", tags=["커뮤니티"])
app.include_router(counsel.router, prefix=f"{settings.API_V1_STR}/counsel", tags=["상담"])
app.include_router(upload.router, prefix=f"{settings.API_V1_STR}/upload", tags=["파일 업로드"])
app.include_router(alerts.router, prefix=f"{settings.API_V1_STR}/alerts", tags=["위기 알림"])
app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["알림"])
app.include_router(statistics.router, prefix=f"{settings.API_V1_STR}/statistics", tags=["통계"])
app.include_router(notices.router, prefix=f"{settings.API_V1_STR}/notices", tags=["공지사항"])
app.include_router(counselors.router, prefix=f"{settings.API_V1_STR}/counselors", tags=["상담사"])

@app.get("/")
def read_root():
    return {"message": "마음이음 Platform API v2.0"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
