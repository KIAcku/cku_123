from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.api.dependencies import get_current_user
from app.models.user import User
from app.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
import os
import uuid
from datetime import datetime

router = APIRouter()

STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "static", "avatars")
os.makedirs(STATIC_DIR, exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_SIZE = 5 * 1024 * 1024  # 5MB

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="JPG, PNG, GIF, WEBP만 업로드 가능합니다.")
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="파일 크기는 5MB 이하여야 합니다.")
    ext = file.filename.rsplit('.', 1)[-1] if '.' in file.filename else 'jpg'
    filename = f"{current_user.id}_{int(datetime.utcnow().timestamp())}.{ext}"
    filepath = os.path.join(STATIC_DIR, filename)
    with open(filepath, 'wb') as f:
        f.write(content)
    avatar_url = f"/static/avatars/{filename}"
    current_user.avatar_url = avatar_url
    db.add(current_user)
    await db.commit()
    return {"url": avatar_url}
