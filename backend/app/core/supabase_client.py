import httpx
import os
from typing import Optional

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://rzxuxpdfijpctajcjsvz.supabase.co")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


def _headers():
    return {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }


async def broadcast_message(
    session_id: str,
    sender_role: str,
    content: Optional[str],
    image_url: Optional[str] = None,
):
    """Supabase realtime_messages 테이블에 insert → 프론트 Realtime 구독 트리거"""
    if not SUPABASE_SERVICE_KEY:
        return
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            await client.post(
                f"{SUPABASE_URL}/rest/v1/realtime_messages",
                headers=_headers(),
                json={
                    "session_id": str(session_id),
                    "sender_role": sender_role,
                    "content": content,
                    "image_url": image_url,
                },
            )
        except Exception as e:
            print(f"[Supabase] broadcast_message failed: {e}")


async def send_notification(
    user_id: str,
    type: str,
    title: str,
    body: str = "",
    link: str = "",
):
    """Supabase user_notifications 테이블에 insert → 프론트 Realtime 알림 트리거"""
    if not SUPABASE_SERVICE_KEY:
        return
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            await client.post(
                f"{SUPABASE_URL}/rest/v1/user_notifications",
                headers=_headers(),
                json={
                    "user_id": str(user_id),
                    "type": type,
                    "title": title,
                    "body": body,
                    "link": link,
                },
            )
        except Exception as e:
            print(f"[Supabase] send_notification failed: {e}")
