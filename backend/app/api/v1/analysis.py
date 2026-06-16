"""
app/api/v1/analysis.py
─────────────────────
심리 분석 API — diary_entries / test_results 테이블 기반 통계
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, cast, Float
from datetime import datetime, timedelta, timezone
from collections import defaultdict
import json

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.diary import DiaryEntry
from app.models.counsel import TestResult
from app.core.encryption import decrypt

router = APIRouter()


# ──────────────────────────────────────────────────────────────────
# GET /emotion-trend  최근 30일 일별 평균 감정점수
# ──────────────────────────────────────────────────────────────────
@router.get("/emotion-trend")
async def get_emotion_trend(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """최근 30일 동안의 일별 평균 emotion_score를 반환합니다."""
    since = datetime.now(timezone.utc) - timedelta(days=30)

    result = await db.execute(
        select(DiaryEntry).where(
            DiaryEntry.user_id == current_user.id,
            DiaryEntry.created_at >= since,
        ).order_by(DiaryEntry.created_at)
    )
    entries = result.scalars().all()

    # 일별로 평균 계산
    daily: dict[str, list[float]] = defaultdict(list)
    for entry in entries:
        day = entry.created_at.strftime("%Y-%m-%d") if entry.created_at else None
        if day:
            try:
                score = float(entry.emotion_score or 3)
                daily[day].append(score)
            except (ValueError, TypeError):
                pass

    trend = [
        {"date": day, "avg_score": round(sum(scores) / len(scores), 2)}
        for day, scores in sorted(daily.items())
    ]
    return {"trend": trend}


# ──────────────────────────────────────────────────────────────────
# GET /emotion-by-day  요일별 감정 분포
# ──────────────────────────────────────────────────────────────────
@router.get("/emotion-by-day")
async def get_emotion_by_day(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """요일별(월~일) 감정 분포를 반환합니다."""
    result = await db.execute(
        select(DiaryEntry).where(DiaryEntry.user_id == current_user.id)
    )
    entries = result.scalars().all()

    DAY_NAMES = ["월", "화", "수", "목", "금", "토", "일"]
    day_scores: dict[int, list[float]] = defaultdict(list)

    for entry in entries:
        if entry.created_at:
            weekday = entry.created_at.weekday()  # 0=월, 6=일
            try:
                score = float(entry.emotion_score or 3)
                day_scores[weekday].append(score)
            except (ValueError, TypeError):
                pass

    distribution = [
        {
            "day": DAY_NAMES[i],
            "avg_score": round(sum(day_scores[i]) / len(day_scores[i]), 2) if day_scores[i] else None,
            "count": len(day_scores[i]),
        }
        for i in range(7)
    ]
    return {"by_day": distribution}


# ──────────────────────────────────────────────────────────────────
# GET /emotion-dist  전체 감정 분포
# ──────────────────────────────────────────────────────────────────
@router.get("/emotion-dist")
async def get_emotion_dist(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """전체 감정 분포 (happy / sad / anxious 등 비율)를 반환합니다."""
    result = await db.execute(
        select(DiaryEntry.emotion).where(DiaryEntry.user_id == current_user.id)
    )
    emotions = [row[0] for row in result.all() if row[0]]

    dist: dict[str, int] = defaultdict(int)
    for emo in emotions:
        dist[emo] += 1

    total = len(emotions)
    distribution = [
        {"emotion": emo, "count": cnt, "ratio": round(cnt / total * 100, 1) if total else 0}
        for emo, cnt in sorted(dist.items(), key=lambda x: -x[1])
    ]
    return {"total": total, "distribution": distribution}


# ──────────────────────────────────────────────────────────────────
# GET /test-history  테스트 점수 이력
# ──────────────────────────────────────────────────────────────────
@router.get("/test-history")
async def get_test_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """test_type별 날짜순 테스트 점수 이력을 반환합니다."""
    result = await db.execute(
        select(TestResult).where(TestResult.user_id == current_user.id)
        .order_by(TestResult.created_at)
    )
    records = result.scalars().all()

    history_by_type: dict[str, list] = defaultdict(list)
    for rec in records:
        history_by_type[rec.test_type].append({
            "id": rec.id,
            "score": rec.score,
            "level": rec.level,
            "created_at": rec.created_at.isoformat() if rec.created_at else None,
        })

    return {"history": dict(history_by_type)}


# ──────────────────────────────────────────────────────────────────
# GET /weekly-report  이번 주 종합 리포트
# ──────────────────────────────────────────────────────────────────
@router.get("/weekly-report")
async def get_weekly_report(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """이번 주(최근 7일) 종합 리포트를 반환합니다."""
    since = datetime.now(timezone.utc) - timedelta(days=7)

    # 이번 주 일기
    diary_result = await db.execute(
        select(DiaryEntry).where(
            DiaryEntry.user_id == current_user.id,
            DiaryEntry.created_at >= since,
        ).order_by(DiaryEntry.created_at.desc())
    )
    diaries = diary_result.scalars().all()

    diary_count = len(diaries)
    scores = []
    emotion_counts: dict[str, int] = defaultdict(int)

    for entry in diaries:
        try:
            scores.append(float(entry.emotion_score or 3))
        except (ValueError, TypeError):
            pass
        if entry.emotion:
            emotion_counts[entry.emotion] += 1

    avg_score = round(sum(scores) / len(scores), 2) if scores else None
    dominant_emotion = max(emotion_counts, key=emotion_counts.get) if emotion_counts else None

    # 최신 테스트 결과 (타입별 최신 1건)
    test_result = await db.execute(
        select(TestResult).where(TestResult.user_id == current_user.id)
        .order_by(TestResult.created_at.desc())
    )
    all_tests = test_result.scalars().all()

    latest_tests: dict[str, dict] = {}
    for rec in all_tests:
        if rec.test_type not in latest_tests:
            latest_tests[rec.test_type] = {
                "test_type": rec.test_type,
                "score": rec.score,
                "level": rec.level,
                "created_at": rec.created_at.isoformat() if rec.created_at else None,
            }

    # 최근 일기 5개 (내용 복호화)
    recent_diaries = []
    for entry in diaries[:5]:
        recent_diaries.append({
            "id": entry.id,
            "emotion": entry.emotion,
            "emotion_score": entry.emotion_score,
            "content_preview": decrypt(entry.content)[:100] if entry.content else "",
            "created_at": entry.created_at.isoformat() if entry.created_at else None,
        })

    return {
        "week_summary": {
            "diary_count": diary_count,
            "avg_emotion_score": avg_score,
            "dominant_emotion": dominant_emotion,
            "emotion_distribution": dict(emotion_counts),
        },
        "latest_tests": list(latest_tests.values()),
        "recent_diaries": recent_diaries,
    }
