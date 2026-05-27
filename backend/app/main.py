from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, diary, report, community, counsel

# 모든 모델 import (테이블 생성을 위해)
from app.models import user, diary as diary_model, report as report_model, community as community_model
from app.models import counsel as counsel_model

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
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/")
def read_root():
    return {"message": "마음이음 Platform API v2.0"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
