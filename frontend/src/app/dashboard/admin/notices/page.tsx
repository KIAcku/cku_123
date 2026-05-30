'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://studentcare-production.up.railway.app/api/v1';

const i18n: Record<string, Record<string, string>> = {
  ko: {
    title: '공지사항 관리', subtitle: '학생들에게 공지사항을 작성하고 관리합니다.',
    create_notice: '공지 작성', edit: '수정', delete: '삭제',
    pinned: '📌 고정됨', pin: '고정', unpin: '고정 해제',
    notice_title: '제목', notice_content: '내용', is_pinned: '상단 고정',
    save: '저장', cancel: '취소', submit: '등록',
    loading: '불러오는 중...', no_data: '공지사항이 없습니다.',
    delete_confirm: '정말 삭제하시겠습니까?', created_at: '작성일',
    edit_notice: '공지 수정', create_new: '새 공지 작성',
    placeholder_title: '공지사항 제목을 입력하세요',
    placeholder_content: '공지사항 내용을 입력하세요...',
    saved: '저장되었습니다!', deleted: '삭제되었습니다!',
  },
  en: {
    title: 'Notice Management', subtitle: 'Write and manage notices for students.',
    create_notice: 'Create Notice', edit: 'Edit', delete: 'Delete',
    pinned: '📌 Pinned', pin: 'Pin', unpin: 'Unpin',
    notice_title: 'Title', notice_content: 'Content', is_pinned: 'Pin to Top',
    save: 'Save', cancel: 'Cancel', submit: 'Submit',
    loading: 'Loading...', no_data: 'No notices yet.',
    delete_confirm: 'Are you sure you want to delete this?', created_at: 'Date',
    edit_notice: 'Edit Notice', create_new: 'Create New Notice',
    placeholder_title: 'Enter notice title',
    placeholder_content: 'Enter notice content...',
    saved: 'Saved!', deleted: 'Deleted!',
  },
  ja: {
    title: 'お知らせ管理', subtitle: '学生向けのお知らせを作成・管理します。',
    create_notice: 'お知らせ作成', edit: '編集', delete: '削除',
    pinned: '📌 固定済み', pin: '固定', unpin: '固定解除',
    notice_title: 'タイトル', notice_content: '内容', is_pinned: 'トップに固定',
    save: '保存', cancel: 'キャンセル', submit: '登録',
    loading: '読み込み中...', no_data: 'お知らせがありません。',
    delete_confirm: '本当に削除しますか？', created_at: '作成日',
    edit_notice: 'お知らせ編集', create_new: '新規お知らせ作成',
    placeholder_title: 'タイトルを入力してください',
    placeholder_content: '内容を入力してください...',
    saved: '保存しました！', deleted: '削除しました！',
  },
  zh: {
    title: '公告管理', subtitle: '为学生编写和管理公告。',
    create_notice: '创建公告', edit: '编辑', delete: '删除',
    pinned: '📌 已置顶', pin: '置顶', unpin: '取消置顶',
    notice_title: '标题', notice_content: '内容', is_pinned: '置顶显示',
    save: '保存', cancel: '取消', submit: '提交',
    loading: '加载中...', no_data: '暂无公告。',
    delete_confirm: '确定要删除吗？', created_at: '日期',
    edit_notice: '编辑公告', create_new: '创建新公告',
    placeholder_title: '请输入公告标题',
    placeholder_content: '请输入公告内容...',
    saved: '已保存！', deleted: '已删除！',
  },
};

interface Notice {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

export default function NoticesPage() {
  const router = useRouter();
  const [lang, setLang] = useState('ko');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [form, setForm] = useState({ title: '', content: '', is_pinned: false });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const t = i18n[lang] || i18n.ko;

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/dashboard'); return; }
    const user = JSON.parse(u);
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      router.push('/dashboard'); return;
    }
    const savedLang = localStorage.getItem('lang') || 'ko';
    setLang(savedLang);
    fetchNotices();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/notices`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setNotices(Array.isArray(data) ? data : data.notices || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingNotice(null);
    setForm({ title: '', content: '', is_pinned: false });
    setShowForm(true);
  };

  const handleOpenEdit = (n: Notice) => {
    setEditingNotice(n);
    setForm({ title: n.title, content: n.content, is_pinned: n.is_pinned });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      if (editingNotice) {
        await fetch(`${API}/notices/${editingNotice.id}`, {
          method: 'PUT', headers, body: JSON.stringify(form),
        });
      } else {
        await fetch(`${API}/notices`, {
          method: 'POST', headers, body: JSON.stringify(form),
        });
      }
      await fetchNotices();
      setShowForm(false);
      showToast(t.saved);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.delete_confirm)) return;
    const token = localStorage.getItem('token');
    await fetch(`${API}/notices/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotices(prev => prev.filter(n => n.id !== id));
    showToast(t.deleted);
  };

  const pinned = notices.filter(n => n.is_pinned);
  const regular = notices.filter(n => !n.is_pinned);

  return (
    <div className="page-content" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #F59E0B 0%, #10B981 100%)',
        borderRadius: 'var(--radius-xl)', padding: '32px 36px',
        marginBottom: 28, color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: 60, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: '1.8rem' }}>📢</span>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{t.title}</h1>
            </div>
            <p style={{ opacity: 0.85, fontSize: '0.9rem' }}>{t.subtitle}</p>
          </div>
          <button
            onClick={handleOpenCreate}
            style={{
              background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)',
              color: 'white', borderRadius: 'var(--radius-md)',
              padding: '10px 20px', fontSize: '0.875rem', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              backdropFilter: 'blur(4px)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            ✏️ {t.create_notice}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>📢</div>
          {t.loading}
        </div>
      ) : (
        <>
          {/* Pinned Notices */}
          {pinned.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--warning)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                📌 고정된 공지
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pinned.map(n => (
                  <NoticeCard key={n.id} notice={n} t={t} onEdit={handleOpenEdit} onDelete={handleDelete} isPinned />
                ))}
              </div>
            </div>
          )}

          {/* Regular Notices */}
          {regular.length === 0 && pinned.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-icon">📭</div>
              <p>{t.no_data}</p>
              <button className="btn btn-primary btn-sm" onClick={handleOpenCreate}>✏️ {t.create_notice}</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {regular.map(n => (
                <NoticeCard key={n.id} notice={n} t={t} onEdit={handleOpenEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingNotice ? t.edit_notice : t.create_new}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">{t.notice_title}</label>
                  <input
                    className="form-input"
                    placeholder={t.placeholder_title}
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.notice_content}</label>
                  <textarea
                    className="form-textarea"
                    placeholder={t.placeholder_content}
                    value={form.content}
                    onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                    rows={6}
                    required
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: form.is_pinned ? 'var(--primary)' : 'var(--border)',
                    position: 'relative', transition: 'background 0.2s',
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', background: 'white',
                      position: 'absolute', top: 3,
                      left: form.is_pinned ? 23 : 3,
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                    <input
                      type="checkbox"
                      checked={form.is_pinned}
                      onChange={e => setForm(p => ({ ...p, is_pinned: e.target.checked }))}
                      style={{ display: 'none' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>📌 {t.is_pinned}</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>{t.cancel}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={submitting}>
                  {submitting ? '...' : (editingNotice ? t.save : t.submit)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast success">✅ {toast}</div>
      )}
    </div>
  );
}

function NoticeCard({ notice, t, onEdit, onDelete, isPinned }: {
  notice: Notice;
  t: Record<string, string>;
  onEdit: (n: Notice) => void;
  onDelete: (id: string) => void;
  isPinned?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: 'white',
      border: `1px solid ${isPinned ? 'var(--warning)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: '20px 24px',
      borderLeft: isPinned ? '4px solid var(--warning)' : '4px solid var(--border)',
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            {isPinned && (
              <span style={{
                padding: '2px 8px', borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem', fontWeight: 700,
                background: 'var(--warning-light)', color: 'var(--warning)',
              }}>
                {t.pinned}
              </span>
            )}
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
              {notice.title}
            </h3>
          </div>
          {!expanded ? (
            <p style={{
              fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              cursor: 'pointer',
            }} onClick={() => setExpanded(true)}>
              {notice.content}
            </p>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', cursor: 'pointer' }}
              onClick={() => setExpanded(false)}>
              {notice.content}
            </p>
          )}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
            📅 {new Date(notice.created_at).toLocaleDateString('ko-KR')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onEdit(notice)} style={{ fontSize: '0.8rem' }}>
            ✏️ {t.edit}
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(notice.id)} style={{ fontSize: '0.8rem' }}>
            🗑 {t.delete}
          </button>
        </div>
      </div>
    </div>
  );
}
