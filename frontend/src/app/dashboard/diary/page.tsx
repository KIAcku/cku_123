'use client';
import { useState, useEffect } from 'react';
import { API_BASE } from '@/lib/apiClient';

const emotions = [
  { value: 'happy', emoji: '😊', label: '행복해요', color: '#F59E0B' },
  { value: 'sad', emoji: '😢', label: '슬퍼요', color: '#3B82F6' },
  { value: 'angry', emoji: '😠', label: '화가나요', color: '#EF4444' },
  { value: 'anxious', emoji: '😰', label: '불안해요', color: '#8B5CF6' },
  { value: 'neutral', emoji: '😐', label: '보통이에요', color: '#6B7280' },
  { value: 'tired', emoji: '😴', label: '피곤해요', color: '#EC4899' },
];

type Diary = { id: string; content: string; emotion: string; emotion_score: string; created_at: string; updated_at?: string };

function groupByDate(diaries: Diary[]) {
  const groups: Record<string, Diary[]> = {};
  diaries.forEach(d => {
    const date = new Date(d.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(d);
  });
  return groups;
}

export default function DiaryPage() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [emotion, setEmotion] = useState('neutral');
  const [score, setScore] = useState(3);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState('');
  const [editTarget, setEditTarget] = useState<Diary | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'list'>('write');

  const token = () => localStorage.getItem('token') || '';
  const headers = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

  const fetchDiaries = async () => {
    setFetching(true);
    const res = await fetch(`${API_BASE}/diaries`, { headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) setDiaries(await res.json());
    setFetching(false);
  };

  useEffect(() => { fetchDiaries(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSubmit = async () => {
    if (!content.trim()) { showToast('내용을 입력해주세요'); return; }
    setLoading(true);
    const res = await fetch(`${API_BASE}/diaries`, {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ content, emotion, emotion_score: String(score) }),
    });
    if (res.ok) {
      setContent(''); setEmotion('neutral'); setScore(3);
      await fetchDiaries();
      showToast('일기가 저장되었습니다 📔');
      setActiveTab('list');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('일기를 삭제할까요?')) return;
    await fetch(`${API_BASE}/diaries/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    await fetchDiaries();
    showToast('삭제되었습니다');
  };

  const handleUpdate = async () => {
    if (!editTarget) return;
    setLoading(true);
    await fetch(`${API_BASE}/diaries/${editTarget.id}`, {
      method: 'PUT', headers: headers(),
      body: JSON.stringify({ content: editTarget.content, emotion: editTarget.emotion, emotion_score: editTarget.emotion_score }),
    });
    await fetchDiaries();
    setShowModal(false); setEditTarget(null);
    showToast('수정되었습니다 ✏️');
    setLoading(false);
  };

  const grouped = groupByDate(diaries);
  const selectedEmotion = emotions.find(e => e.value === emotion);

  return (
    <div className="page-content">
      <div className="page-header">
        <h2 className="page-title">📔 감정 일기</h2>
        <p className="page-subtitle">오늘의 감정을 솔직하게 기록하고 마음을 돌봐보세요.</p>
      </div>

      {/* 탭 */}
      <div className="tabs" style={{ marginBottom: 24 }}>
        <button className={`tab ${activeTab === 'write' ? 'active' : ''}`} onClick={() => setActiveTab('write')}>✏️ 오늘 일기 쓰기</button>
        <button className={`tab ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>📋 내 일기 목록 ({diaries.length})</button>
      </div>

      {activeTab === 'write' && (
        <div className="card" style={{ maxWidth: 680 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>오늘의 감정 기록</h3>

          {/* 감정 선택 */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">지금 기분은 어때요?</label>
            <div className="emotion-grid">
              {emotions.map(e => (
                <button key={e.value} type="button"
                  className={`emotion-btn ${emotion === e.value ? 'selected' : ''}`}
                  onClick={() => setEmotion(e.value)}
                  style={{ borderColor: emotion === e.value ? e.color : undefined, background: emotion === e.value ? `${e.color}15` : undefined }}>
                  <span className="emoji">{e.emoji}</span>
                  <span className="label">{e.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 강도 슬라이더 */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">
              감정 강도: <span style={{ color: selectedEmotion?.color, fontWeight: 700 }}>{score} / 5</span>
            </label>
            <input type="range" className="range-slider" min={1} max={5} value={score}
              onChange={e => setScore(Number(e.target.value))} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              <span>아주 약함</span><span>보통</span><span>매우 강함</span>
            </div>
          </div>

          {/* 내용 입력 */}
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">오늘 있었던 일을 자유롭게 적어보세요</label>
            <textarea className="form-textarea" rows={6}
              placeholder={`${selectedEmotion?.emoji || '😐'} 오늘 어떤 일이 있었나요? 생각과 감정을 솔직하게 써보세요...`}
              value={content} onChange={e => setContent(e.target.value)} style={{ minHeight: 160 }} />
            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {content.length}자
            </div>
          </div>

          <button className="btn btn-primary btn-lg btn-full" onClick={handleSubmit} disabled={loading}>
            {loading ? '저장 중...' : '📔 일기 저장하기'}
          </button>
        </div>
      )}

      {activeTab === 'list' && (
        <div>
          {fetching ? (
            <div className="empty-state"><div className="empty-icon">⏳</div><p>불러오는 중...</p></div>
          ) : diaries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📔</div>
              <p>아직 작성된 일기가 없어요</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('write')}>첫 일기 쓰기</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {Object.entries(grouped).map(([date, items]) => (
                <div key={date}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{date}</div>
                    <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {items.map(d => {
                      const em = emotions.find(e => e.value === d.emotion);
                      return (
                        <div key={d.id} className="card card-sm" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 'var(--radius-md)',
                            background: `${em?.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.4rem', flexShrink: 0
                          }}>{em?.emoji || '😐'}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                              <span className="badge" style={{ background: `${em?.color}18`, color: em?.color, fontWeight: 600 }}>{em?.label || d.emotion}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>강도 {d.emotion_score}/5</span>
                              {d.updated_at && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>수정됨</span>}
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{d.content}</p>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => { setEditTarget(d); setShowModal(true); }}>✏️</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id)}>🗑️</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 수정 모달 */}
      {showModal && editTarget && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">일기 수정</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">감정</label>
                <div className="emotion-grid">
                  {emotions.map(e => (
                    <button key={e.value} type="button"
                      className={`emotion-btn ${editTarget.emotion === e.value ? 'selected' : ''}`}
                      onClick={() => setEditTarget({ ...editTarget, emotion: e.value })}>
                      <span className="emoji">{e.emoji}</span>
                      <span className="label">{e.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">내용</label>
                <textarea className="form-textarea" rows={5} value={editTarget.content}
                  onChange={e => setEditTarget({ ...editTarget, content: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary btn-full" onClick={() => setShowModal(false)}>취소</button>
                <button className="btn btn-primary btn-full" onClick={handleUpdate} disabled={loading}>저장</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast success`}>{toast}</div>}
    </div>
  );
}
