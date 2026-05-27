'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/apiClient';

const roleLabel: Record<string, string> = { STUDENT: '학생', TEACHER: '선생님', COUNSELOR: '상담사' };

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [diaries, setDiaries] = useState<any[]>([]);
  const [form, setForm] = useState({ nickname: '', language: 'ko' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'diaries'>('info');

  const token = () => localStorage.getItem('token') || '';
  const authH = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed);
      setForm({ nickname: parsed.nickname || '', language: parsed.language || 'ko' });
    }
    loadStats();
    loadDiaries();
  }, []);

  const loadStats = async () => {
    const res = await fetch(`${API_BASE}/auth/me/stats`, { headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) setStats(await res.json());
  };

  const loadDiaries = async () => {
    const res = await fetch(`${API_BASE}/diaries`, { headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) setDiaries(await res.json());
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleUpdate = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'PUT', headers: authH(),
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const updated = await res.json();
      const newUser = { ...user, ...updated };
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      showToast('프로필이 저장되었습니다 ✅');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const initials = user?.nickname?.slice(0, 1) || '익';

  const emotionEmoji: Record<string, string> = {
    happy: '😊', sad: '😢', angry: '😠', anxious: '😰', neutral: '😐', tired: '😴', excited: '🤩',
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2 className="page-title">👤 내 프로필</h2>
        <p className="page-subtitle">계정 정보와 활동 내역을 확인하고 관리하세요.</p>
      </div>

      {/* 프로필 헤더 */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
        <div className="avatar avatar-xl" style={{ fontSize: '2rem' }}>{initials}</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{user?.nickname || '익명학생'}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user?.email}</p>
          <span className="badge badge-primary" style={{ marginTop: 6 }}>{roleLabel[user?.role] || '학생'}</span>
        </div>
        <button className="btn btn-danger" onClick={handleLogout}>🚪 로그아웃</button>
      </div>

      {/* 활동 통계 */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: '감정 일기', value: stats?.diary_count ?? '-', icon: '📔', color: 'var(--primary-light)', vc: 'var(--primary)' },
          { label: '커뮤니티 글', value: stats?.post_count ?? '-', icon: '✏️', color: 'var(--secondary-light)', vc: 'var(--secondary)' },
          { label: '댓글', value: stats?.comment_count ?? '-', icon: '💬', color: 'var(--info-light)', vc: 'var(--info)' },
          { label: '익명 신고', value: stats?.report_count ?? '-', icon: '🚨', color: 'var(--danger-light)', vc: 'var(--danger)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div>
              <div className="stat-value" style={{ color: s.vc, fontSize: '1.4rem' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 탭 */}
      <div className="tabs" style={{ marginBottom: 24 }}>
        <button className={`tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>⚙️ 계정 설정</button>
        <button className={`tab ${activeTab === 'diaries' ? 'active' : ''}`} onClick={() => setActiveTab('diaries')}>📔 내 일기 ({diaries.length})</button>
      </div>

      {activeTab === 'info' && (
        <div className="card" style={{ maxWidth: 520 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>프로필 수정</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">이메일</label>
              <input className="form-input" value={user?.email || ''} disabled
                style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>이메일은 변경할 수 없습니다</span>
            </div>
            <div className="form-group">
              <label className="form-label">닉네임</label>
              <input className="form-input" placeholder="닉네임 입력"
                value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">언어</label>
              <select className="form-select" value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}>
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleUpdate} disabled={loading}>
              {loading ? '저장 중...' : '변경 사항 저장'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'diaries' && (
        <div>
          {diaries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📔</div>
              <p>아직 작성한 일기가 없어요</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {diaries.map((d: any) => (
                <div key={d.id} className="card card-sm" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <span style={{ fontSize: '1.6rem' }}>{emotionEmoji[d.emotion] || '😐'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                      {new Date(d.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <p style={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.content}</p>
                  </div>
                  <span className="badge badge-primary" style={{ fontSize: '0.7rem', flexShrink: 0 }}>{d.emotion}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {toast && <div className="toast success">{toast}</div>}
    </div>
  );
}
