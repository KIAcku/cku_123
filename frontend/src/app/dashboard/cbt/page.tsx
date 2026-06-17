'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://studentcare-production.up.railway.app/api/v1';

// ── 인지왜곡 목록 ─────────────────────────────────────────────
const DISTORTIONS = [
  { id: 1, title: '흑백논리', desc: '"모 아니면 도"로 생각하는 패턴' },
  { id: 2, title: '과잉일반화', desc: '"항상", "절대로" 같은 단어를 자주 쓰는 패턴' },
  { id: 3, title: '정신적 필터링', desc: '부정적인 것만 골라서 보는 패턴' },
  { id: 4, title: '긍정 무시', desc: '좋은 일을 "운이었을 뿐"이라고 치부하는 패턴' },
  { id: 5, title: '성급한 결론', desc: '충분한 근거 없이 나쁜 결론을 내리는 패턴' },
  { id: 6, title: '확대/축소', desc: '실수는 크게, 성공은 작게 평가하는 패턴' },
  { id: 7, title: '감정적 추론', desc: '"이렇게 느끼니까 사실일 것이다"라고 생각하는 패턴' },
  { id: 8, title: '~해야 한다', desc: '자신에게 엄격한 규칙을 적용하는 패턴' },
  { id: 9, title: '딱지 붙이기', desc: '"나는 패배자야" 같이 자신을 정의하는 패턴' },
  { id: 10, title: '개인화', desc: '모든 나쁜 일이 자신의 탓이라고 생각하는 패턴' },
];

const EMOTIONS = [
  { value: 'happy', label: '😊 행복' },
  { value: 'sad', label: '😢 슬픔' },
  { value: 'anxious', label: '😰 불안' },
  { value: 'angry', label: '😠 분노' },
  { value: 'tired', label: '😴 피곤' },
  { value: 'neutral', label: '😐 보통' },
];

const COPING_CATEGORIES = [
  { value: '호흡법', color: '#60a5fa' },
  { value: '인지재구성', color: '#a78bfa' },
  { value: '행동활성화', color: '#34d399' },
  { value: '사회적지지', color: '#fbbf24' },
  { value: '마음챙김', color: '#f87171' },
  { value: '기타', color: '#94a3b8' },
];

const TAB_STYLES = (active: boolean) => ({
  padding: '10px 20px',
  borderRadius: 'var(--radius-full)',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.875rem',
  transition: 'all 0.2s',
  background: active
    ? 'linear-gradient(135deg, #9333ea, #6d28d9)'
    : 'var(--glass-bg)',
  color: active ? '#fff' : 'var(--text-muted)',
  boxShadow: active ? '0 4px 15px rgba(147,51,234,0.4)' : 'none',
});

// ── Toast 컴포넌트 ─────────────────────────────────────────────
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--success-bg)',
        border: '1px solid rgba(52,211,153,0.3)',
        borderRadius: 'var(--radius-full)',
        padding: '12px 24px',
        color: 'var(--success)',
        fontWeight: 600,
        fontSize: '0.875rem',
        zIndex: 9999,
        boxShadow: 'var(--glass-shadow)',
      }}
    >
      ✅ {msg}
    </div>
  );
}

// ── GlassCard ─────────────────────────────────────────────────
function GlassCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        backdropFilter: 'blur(24px)',
        boxShadow: 'var(--glass-shadow)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── 인지왜곡 탭 ───────────────────────────────────────────────
function DistortionTab() {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const count = selected.size;

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 20 }}>
        오늘 경험한 인지왜곡 패턴을 클릭해보세요.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {DISTORTIONS.map((d) => {
          const isSelected = selected.has(d.id);
          return (
            <div
              key={d.id}
              onClick={() => toggle(d.id)}
              style={{
                padding: '16px 18px',
                borderRadius: 'var(--radius-lg)',
                border: `1px solid ${isSelected ? 'rgba(251,191,36,0.5)' : 'var(--glass-border)'}`,
                background: isSelected
                  ? 'rgba(251,191,36,0.08)'
                  : 'var(--glass-bg)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isSelected ? '0 0 20px rgba(251,191,36,0.15)' : 'none',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: '1.1rem',
                    opacity: isSelected ? 1 : 0.4,
                  }}
                >
                  {isSelected ? '⚠️' : '○'}
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: isSelected ? 'var(--warning)' : 'var(--text-primary)',
                  }}
                >
                  {d.title}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {d.desc}
              </p>
            </div>
          );
        })}
      </div>

      {count > 0 && (
        <GlassCard
          style={{
            background: 'rgba(251,191,36,0.06)',
            border: '1px solid rgba(251,191,36,0.2)',
          }}
        >
          <p style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '0.9rem' }}>
            오늘 {count}가지 인지왜곡 패턴을 발견했어요.
            {count >= 3 && ' 아래 자기성찰 일지를 작성해보세요.'}
          </p>
          {count >= 3 && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>
              인지왜곡 패턴을 인식하는 것 자체가 치료의 첫 걸음입니다 💜
            </p>
          )}
        </GlassCard>
      )}
    </div>
  );
}

// ── 자기성찰 일지 탭 ───────────────────────────────────────────
function ReflectionTab() {
  const [form, setForm] = useState({
    situation: '',
    automatic_thought: '',
    evidence_for: '',
    evidence_against: '',
    balanced_thought: '',
    emotion_before: 'anxious',
    emotion_after: 'neutral',
  });
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/cbt/records`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setRecords(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/cbt/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setToast('성찰 일지가 저장되었습니다!');
        setForm({
          situation: '',
          automatic_thought: '',
          evidence_for: '',
          evidence_against: '',
          balanced_thought: '',
          emotion_before: 'anxious',
          emotion_after: 'neutral',
        });
        fetchRecords();
      }
    } catch {}
    setSubmitting(false);
  };

  const fields = [
    { key: 'situation', label: '어떤 상황이었나요?', placeholder: '구체적인 상황을 적어주세요.' },
    { key: 'automatic_thought', label: '그 때 어떤 생각이 들었나요?', placeholder: '자동적으로 떠오른 생각을 적어주세요.' },
    { key: 'evidence_for', label: '그 생각이 사실이라는 증거는?', placeholder: '생각을 지지하는 증거를 적어주세요.' },
    { key: 'evidence_against', label: '그 생각이 사실이 아니라는 증거는?', placeholder: '생각에 반하는 증거를 적어주세요.' },
    { key: 'balanced_thought', label: '좀 더 균형잡힌 생각은?', placeholder: '균형잡힌 관점으로 다시 생각해보세요.' },
  ];

  return (
    <div>
      {toast && <Toast msg={toast} onClose={() => setToast('')} />}

      <GlassCard style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20, color: 'var(--text-primary)' }}>
          📝 오늘의 자기성찰
        </h3>
        <form onSubmit={handleSubmit}>
          {fields.map((f) => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 6,
                }}
              >
                {f.label}
              </label>
              <textarea
                value={(form as any)[f.key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                rows={3}
                style={{
                  width: '100%',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ))}

          {/* 감정 변화 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 6,
                }}
              >
                감정 변화: 이전
              </label>
              <select
                value={form.emotion_before}
                onChange={(e) => setForm((prev) => ({ ...prev, emotion_before: e.target.value }))}
                style={{
                  width: '100%',
                  background: 'var(--bg-layer2)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              >
                {EMOTIONS.map((em) => (
                  <option key={em.value} value={em.value}>
                    {em.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 6,
                }}
              >
                감정 변화: 이후
              </label>
              <select
                value={form.emotion_after}
                onChange={(e) => setForm((prev) => ({ ...prev, emotion_after: e.target.value }))}
                style={{
                  width: '100%',
                  background: 'var(--bg-layer2)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              >
                {EMOTIONS.map((em) => (
                  <option key={em.value} value={em.value}>
                    {em.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !form.situation}
            style={{
              padding: '12px 28px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: 'linear-gradient(135deg, #9333ea, #6d28d9)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: submitting || !form.situation ? 'not-allowed' : 'pointer',
              opacity: submitting || !form.situation ? 0.6 : 1,
              boxShadow: '0 4px 15px rgba(147,51,234,0.4)',
            }}
          >
            {submitting ? '저장 중...' : '💾 저장하기'}
          </button>
        </form>
      </GlassCard>

      {/* 이전 기록 */}
      <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
        지난 기록
      </h3>
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>불러오는 중...</div>
      ) : records.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: 24 }}>
          아직 작성된 기록이 없어요.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {records.map((r: any) => (
            <GlassCard key={r.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {new Date(r.created_at).toLocaleDateString('ko-KR')}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)',
                    }}
                  >
                    {EMOTIONS.find((e) => e.value === r.emotion_before)?.label} →{' '}
                    {EMOTIONS.find((e) => e.value === r.emotion_after)?.label}
                  </span>
                </div>
              </div>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {r.situation}
              </p>
              {r.balanced_thought && (
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--success)',
                    marginTop: 8,
                    fontStyle: 'italic',
                  }}
                >
                  💡 {r.balanced_thought}
                </p>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 코핑 카드 탭 ──────────────────────────────────────────────
function CopingTab() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: '호흡법' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const fetchCards = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/cbt/coping-cards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // 즐겨찾기 먼저
        setCards(data.sort((a: any, b: any) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0)));
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/cbt/coping-cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setToast('코핑 카드가 추가되었습니다!');
        setShowModal(false);
        setForm({ title: '', content: '', category: '호흡법' });
        fetchCards();
      }
    } catch {}
    setSubmitting(false);
  };

  const toggleFavorite = async (id: string, current: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API}/cbt/coping-cards/${id}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_favorite: !current }),
      });
      fetchCards();
    } catch {}
  };

  const deleteCard = async (id: string) => {
    if (!confirm('이 카드를 삭제할까요?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API}/cbt/coping-cards/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCards();
    } catch {}
  };

  const catColor = (cat: string) =>
    COPING_CATEGORIES.find((c) => c.value === cat)?.color ?? '#94a3b8';

  return (
    <div>
      {toast && <Toast msg={toast} onClose={() => setToast('')} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          나만의 대처 전략 카드를 만들어보세요.
        </p>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '10px 20px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            background: 'linear-gradient(135deg, #9333ea, #6d28d9)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(147,51,234,0.4)',
          }}
        >
          + 카드 만들기
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>불러오는 중...</div>
      ) : cards.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 0',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🛡️</div>
          <p>아직 코핑 카드가 없어요. 첫 카드를 만들어보세요!</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {cards.map((card: any) => (
            <GlassCard
              key={card.id}
              style={{
                position: 'relative',
                border: card.is_favorite
                  ? '1px solid rgba(251,191,36,0.4)'
                  : '1px solid var(--glass-border)',
                background: card.is_favorite ? 'rgba(251,191,36,0.04)' : 'var(--glass-bg)',
              }}
            >
              {/* 카테고리 배지 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: `${catColor(card.category)}20`,
                    color: catColor(card.category),
                    border: `1px solid ${catColor(card.category)}40`,
                  }}
                >
                  {card.category}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => toggleFavorite(card.id, card.is_favorite)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      padding: 0,
                    }}
                    title={card.is_favorite ? '즐겨찾기 해제' : '즐겨찾기'}
                  >
                    {card.is_favorite ? '⭐' : '☆'}
                  </button>
                  <button
                    onClick={() => deleteCard(card.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      padding: 0,
                      opacity: 0.5,
                    }}
                    title="삭제"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <h4
                style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                  marginBottom: 8,
                }}
              >
                {card.title}
              </h4>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                }}
              >
                {card.content}
              </p>
            </GlassCard>
          ))}
        </div>
      )}

      {/* 카드 생성 모달 */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              background: 'var(--bg-layer2)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-2xl)',
              padding: 32,
              boxShadow: 'var(--glass-shadow)',
            }}
          >
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 24 }}>
              🛡️ 새 코핑 카드
            </h3>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  제목
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="예: 4-7-8 호흡법"
                  required
                  style={{
                    width: '100%',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  내용
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  placeholder="대처 전략을 자세히 적어주세요."
                  rows={4}
                  required
                  style={{
                    width: '100%',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  카테고리
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  style={{
                    width: '100%',
                    background: 'var(--bg-layer2)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                >
                  {COPING_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.value}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    background: 'linear-gradient(135deg, #9333ea, #6d28d9)',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.6 : 1,
                    boxShadow: '0 4px 15px rgba(147,51,234,0.4)',
                  }}
                >
                  {submitting ? '저장 중...' : '✨ 만들기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 메인 CBT 페이지 ───────────────────────────────────────────
export default function CBTPage() {
  const [tab, setTab] = useState<'distortion' | 'reflection' | 'coping'>('distortion');

  const tabs = [
    { key: 'distortion', label: '🧩 인지 왜곡 체크' },
    { key: 'reflection', label: '📝 자기성찰 일지' },
    { key: 'coping', label: '🛡️ 코핑 카드' },
  ] as const;

  return (
    <div className="page-content" style={{ maxWidth: 1100 }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #9333ea, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 6,
          }}
        >
          🧩 CBT 자기성찰
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          인지행동치료(CBT) 기반의 셀프 케어 도구
        </p>
      </div>

      {/* 탭 */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 28,
          flexWrap: 'wrap',
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={TAB_STYLES(tab === t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <GlassCard>
        {tab === 'distortion' && <DistortionTab />}
        {tab === 'reflection' && <ReflectionTab />}
        {tab === 'coping' && <CopingTab />}
      </GlassCard>
    </div>
  );
}
