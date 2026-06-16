"""
app/api/v1/cbt.py
─────────────────
CBT 자기성찰 일지 & 코핑카드 API
"""
import json
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.cbt import CbtRecord, CopingCard
from app.core.encryption import encrypt, decrypt

router = APIRouter()


# ══════════════════════════════════════════════════════════════════
# Pydantic Schemas
# ══════════════════════════════════════════════════════════════════

class CbtRecordCreate(BaseModel):
    situation: str
    auto_thought: str
    evidence_for: Optional[str] = ""
    evidence_against: Optional[str] = ""
    balanced_thought: Optional[str] = ""
    emotion_before: Optional[str] = "anxious"
    emotion_after: Optional[str] = "neutral"
    distortions: Optional[List[str]] = []


class CopingCardCreate(BaseModel):
    title: str
    content: str
    category: Optional[str] = "general"


# ══════════════════════════════════════════════════════════════════
# CBT Records
# ══════════════════════════════════════════════════════════════════

@router.post("/records", status_code=status.HTTP_201_CREATED)
async def create_cbt_record(
    body: CbtRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """CBT 자기성찰 일지를 작성합니다. 텍스트 필드는 암호화 저장됩니다."""
    record = CbtRecord(
        user_id=current_user.id,
        situation=encrypt(body.situation),
        auto_thought=encrypt(body.auto_thought),
        evidence_for=encrypt(body.evidence_for) if body.evidence_for else "",
        evidence_against=encrypt(body.evidence_against) if body.evidence_against else "",
        balanced_thought=encrypt(body.balanced_thought) if body.balanced_thought else "",
        emotion_before=body.emotion_before or "anxious",
        emotion_after=body.emotion_after or "neutral",
        distortions=json.dumps(body.distortions or [], ensure_ascii=False),
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    return _serialize_cbt_record(record)


@router.get("/records")
async def list_cbt_records(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """내 CBT 기록 목록을 반환합니다. 텍스트 필드는 복호화됩니다."""
    result = await db.execute(
        select(CbtRecord)
        .where(CbtRecord.user_id == current_user.id)
        .order_by(CbtRecord.created_at.desc())
    )
    records = result.scalars().all()
    return {"records": [_serialize_cbt_record(r) for r in records]}


@router.delete("/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cbt_record(
    record_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """CBT 기록을 삭제합니다."""
    result = await db.execute(
        select(CbtRecord).where(
            CbtRecord.id == record_id,
            CbtRecord.user_id == current_user.id,
        )
    )
    record = result.scalars().first()
    if not record:
        raise HTTPException(status_code=404, detail="기록을 찾을 수 없습니다.")
    await db.delete(record)
    await db.commit()


def _serialize_cbt_record(record: CbtRecord) -> dict:
    distortions = []
    try:
        distortions = json.loads(record.distortions) if record.distortions else []
    except (json.JSONDecodeError, TypeError):
        pass
    return {
        "id": record.id,
        "user_id": record.user_id,
        "situation": decrypt(record.situation),
        "auto_thought": decrypt(record.auto_thought),
        "evidence_for": decrypt(record.evidence_for) if record.evidence_for else "",
        "evidence_against": decrypt(record.evidence_against) if record.evidence_against else "",
        "balanced_thought": decrypt(record.balanced_thought) if record.balanced_thought else "",
        "emotion_before": record.emotion_before,
        "emotion_after": record.emotion_after,
        "distortions": distortions,
        "created_at": record.created_at.isoformat() if record.created_at else None,
    }


# ══════════════════════════════════════════════════════════════════
# Coping Cards
# ══════════════════════════════════════════════════════════════════

@router.post("/coping-cards", status_code=status.HTTP_201_CREATED)
async def create_coping_card(
    body: CopingCardCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """코핑카드를 생성합니다. content는 암호화 저장됩니다."""
    card = CopingCard(
        user_id=current_user.id,
        title=body.title,
        content=encrypt(body.content),
        category=body.category or "general",
    )
    db.add(card)
    await db.commit()
    await db.refresh(card)
    return _serialize_coping_card(card)


@router.get("/coping-cards")
async def list_coping_cards(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """내 코핑카드 목록을 반환합니다. content는 복호화됩니다."""
    result = await db.execute(
        select(CopingCard)
        .where(CopingCard.user_id == current_user.id)
        .order_by(CopingCard.is_favorite.desc(), CopingCard.created_at.desc())
    )
    cards = result.scalars().all()
    return {"cards": [_serialize_coping_card(c) for c in cards]}


@router.patch("/coping-cards/{card_id}/favorite")
async def toggle_favorite(
    card_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """코핑카드 즐겨찾기를 토글합니다."""
    result = await db.execute(
        select(CopingCard).where(
            CopingCard.id == card_id,
            CopingCard.user_id == current_user.id,
        )
    )
    card = result.scalars().first()
    if not card:
        raise HTTPException(status_code=404, detail="코핑카드를 찾을 수 없습니다.")
    card.is_favorite = not card.is_favorite
    db.add(card)
    await db.commit()
    await db.refresh(card)
    return _serialize_coping_card(card)


@router.delete("/coping-cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_coping_card(
    card_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """코핑카드를 삭제합니다."""
    result = await db.execute(
        select(CopingCard).where(
            CopingCard.id == card_id,
            CopingCard.user_id == current_user.id,
        )
    )
    card = result.scalars().first()
    if not card:
        raise HTTPException(status_code=404, detail="코핑카드를 찾을 수 없습니다.")
    await db.delete(card)
    await db.commit()


def _serialize_coping_card(card: CopingCard) -> dict:
    return {
        "id": card.id,
        "user_id": card.user_id,
        "title": card.title,
        "content": decrypt(card.content),
        "category": card.category,
        "is_favorite": card.is_favorite,
        "created_at": card.created_at.isoformat() if card.created_at else None,
    }
