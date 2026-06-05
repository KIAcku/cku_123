'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://studentcare-production.up.railway.app/api/v1';

interface Notice {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

interface NoticePopupProps {
  lang?: string;
}

const i18n: Record<string, Record<string, string>> = {
  ko: { title: '공지사항', close: '닫기', new: '신규', pinned: '📌 고정', no_notices: '공지사항이 없습니다', mark_read: '모두 읽음 표시' },
  en: { title: 'Notices', close: 'Close', new: 'New', pinned: '📌 Pinned', no_notices: 'No notices', mark_read: 'Mark all read' },
  ja: { title: 'お知らせ', close: '閉じる', new: '新規', pinned: '📌 固定', no_notices: 'お知らせはありません', mark_read: 'すべて既読にする' },
  zh: { title: '公告', close: '关闭', new: '新', pinned: '📌 置顶', no_notices: '暂无公告', mark_read: '全部标为已读' },
};

export default function NoticePopup({ lang = 'ko' }: NoticePopupProps) {
  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const t = i18n[lang] || i18n.ko;

  // 읽은 공지 ID 목록 (localStorage)
  const getReadIds = (): Set<string> => {
    try {
      const raw = localStorage.getItem('read_notice_ids');
      return new Set(raw ? JSON.parse(raw) : []);
    } catch { return new Set(); }
  };

  const markAllRead = () => {
    const ids = notices.map(n => n.id);
    localStorage.setItem('read_notice_ids', JSON.stringify(ids));
    setUnreadCount(0);
  };

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API}/notices`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data: Notice[] = await res.json();
          setNotices(data);
          const readIds = getReadIds();
          setUnreadCount(data.filter(n => !readIds.has(n.id)).length);
        }
      } catch {}
    };
    fetchNotices();
    // 5분마다 갱신
    const interval = setInterval(fetchNotices, 300000);
    return () => clearInterval(interval);
  }, []);

  // 팝업 열 때 읽음 처리
  const handleOpen = () => {
    setOpen(true);
    markAllRead();
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* 공지 벨 버튼 */}
      <button
        id="notice-bell-btn"
        className="header-icon-btn"
        onClick={handleOpen}
        title={t.title}
        style={{ position: 'relative' }}
      >
        📢
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute', top: 2, right: 2,
              background: 'var(--danger)',
              color: 'white', borderRadius: '50%',
              width: 16, height: 16, fontSize: '0.62rem',
              fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid var(--bg-base)',
              lineHeight: 1,
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* 팝업 패널 */}
      <AnimatePresence>
        {open && (
          <>
            {/* 배경 오버레이 */}
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 280 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              onClick={e => e.stopPropagation()}
              style={{
                position: 'absolute', right: 0, top: 46,
                width: 360, maxHeight: 480,
                background: 'var(--bg-layer3)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-xl)',
                backdropFilter: 'blur(24px)',
                zIndex: 290,
                boxShadow: 'var(--glass-shadow)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* 헤더 */}
              <div style={{
                padding: '16px 18px 12px',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  📢 {t.title}
                  {notices.length > 0 && (
                    <span style={{
                      background: 'var(--primary)',
                      color: 'white', borderRadius: 999,
                      padding: '1px 7px', fontSize: '0.68rem', fontWeight: 800
                    }}>
                      {notices.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'var(--bg-subtle)', border: 'none',
                    borderRadius: 'var(--radius-full)', width: 26, height: 26,
                    cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* 공지 리스트 */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {notices.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 10 }}>📭</div>
                    {t.no_notices}
                  </div>
                ) : (
                  notices.map((notice, i) => (
                    <motion.div
                      key={notice.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{
                        padding: '14px 18px',
                        borderBottom: '1px solid var(--glass-border)',
                        cursor: 'default',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        {notice.is_pinned && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--warning)', flexShrink: 0, marginTop: 2 }}>📌</span>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontWeight: 700, fontSize: '0.85rem',
                            color: 'var(--text-primary)',
                            marginBottom: 4,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {notice.title}
                          </div>
                          <div style={{
                            fontSize: '0.78rem', color: 'var(--text-secondary)',
                            overflow: 'hidden', display: '-webkit-box',
                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            lineHeight: 1.5,
                          }}>
                            {notice.content}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 6 }}>
                            {new Date(notice.created_at).toLocaleDateString(
                              lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : 'en-US',
                              { year: 'numeric', month: 'short', day: 'numeric' }
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
