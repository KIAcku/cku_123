"""
app/core/encryption.py
─────────────────────
애플리케이션 레벨 암호화 유틸 (Fernet = AES-128-CBC + HMAC-SHA256)

사용법:
    from app.core.encryption import encrypt, decrypt

    stored = encrypt("민감한 텍스트")   # DB 저장 시
    plain  = decrypt(stored)            # 조회 시

환경변수 ENCRYPTION_KEY 가 없으면 암호화 없이 투명하게 통과
(로컬 개발 환경 호환성 유지).
"""

import os
from cryptography.fernet import Fernet, InvalidToken

_KEY = os.getenv("ENCRYPTION_KEY", "").encode()
_fernet: "Fernet | None" = None

def _get_fernet() -> "Fernet | None":
    global _fernet, _KEY
    if _fernet is None and _KEY:
        try:
            _fernet = Fernet(_KEY)
        except Exception as e:
            print(f"[Encryption] 키 로드 실패: {e}")
    return _fernet


def encrypt(text: str) -> str:
    """
    텍스트를 암호화하여 반환합니다.
    ENCRYPTION_KEY 가 없으면 원문을 그대로 반환합니다.
    """
    if not text:
        return text
    f = _get_fernet()
    if f is None:
        return text  # 키 없음 → 암호화 비활성
    try:
        return f.encrypt(text.encode("utf-8")).decode("utf-8")
    except Exception as e:
        print(f"[Encryption] 암호화 실패: {e}")
        return text


def decrypt(text: str) -> str:
    """
    암호화된 텍스트를 복호화하여 반환합니다.
    - 복호화 실패 시(평문 기존 데이터 등) 원문을 그대로 반환합니다 (역호환).
    - ENCRYPTION_KEY 가 없으면 원문을 그대로 반환합니다.
    """
    if not text:
        return text
    f = _get_fernet()
    if f is None:
        return text  # 키 없음 → 복호화 비활성
    try:
        return f.decrypt(text.encode("utf-8")).decode("utf-8")
    except (InvalidToken, Exception):
        # 기존 평문 데이터 또는 다른 형식 → 원문 반환
        return text
