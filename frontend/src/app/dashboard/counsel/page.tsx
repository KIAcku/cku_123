'use client';
import { useState, useEffect, useRef } from 'react';
import { API_BASE, authHeaders } from '@/lib/apiClient';

const CONCERN_CATEGORIES = [
  { id: 'study',  icon: '📚', name: '학업·공부',  desc: '시험 스트레스, 학점 관리', color: '#4F8EF7' },
  { id: 'career', icon: '💼', name: '진로·취업',  desc: '진로 고민, 미래 불안',    color: '#6c63ff' },
  { id: 'social', icon: '🤝', name: '인간관계',   desc: '친구, 교우, 따돌림',     color: '#20c997' },
  { id: 'mental', icon: '💆', name: '심리·멘탈',  desc: '번아웃, 우울, 불안',     color: '#e83e8c' },
  { id: 'family', icon: '🏠', name: '가족·가정',  desc: '가족 갈등, 가정 문제',   color: '#fd7e14' },
  { id: 'etc',    icon: '💬', name: '기타 고민',  desc: '무엇이든 털어놓으세요',  color: '#adb5bd' },
];

type Session = { id: string; concern: string; status: string; created_at: string; counselor_name: string };
type Message = { id: string; sender_role: string; content: string; created_at: string };

export default function CounselPage() {
  const [view, setView] = useState<'home' | 'chat'>('home');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [concern, setConcern] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [toast, setToast] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => { loadSessions(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // 폴링 — 2초마다 새 메시지 확인
  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => loadMessages(activeSession.id), 2000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const loadSessions = async () => {
    const res = await fetch(`${API_BASE}/counsel/sessions`, { headers: authHeaders(false) });
    if (res.ok) setSessions(await res.json());
  };

  const loadMessages = async (sessionId: string) => {
    const res = await fetch(`${API_BASE}/counsel/sessions/${sessionId}/messages`, { headers: authHeaders(false) });
    if (res.ok) setMessages(await res.json());
  };

  const startSession = async () => {
    if (!concern.trim()) { showToast('상담 주제를 입력해주세요'); return; }
    setLoading(true);
    const fullConcern = `[${CONCERN_CATEGORIES.find(c => c.id === selectedCat)?.name || '기타'}] ${concern}`;
    const res = await fetch(`${API_BASE}/counsel/sessions`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ concern: fullConcern }),
    });
    if (res.ok) {
      const session = await res.json();
      setSessions(prev => [session, ...prev]);
      setActiveSession(session);
      await loadMessages(session.id);
      setView('chat');
      setShowNewModal(false);
      setConcern(''); setSelectedCat('');
      showToast('상담이 시작되었습니다 💬');
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !activeSession) return;
    const text = inputText;
    setInputText('');
    setLoading(true);
    const res = await fetch(`${API_BASE}/counsel/sessions/${activeSession.id}/messages`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ content: text }),
    });
    if (res.ok) setMessages(await res.json());
    setLoading(false);
  };

  const closeSession = async () => {
    if (!activeSession) return;
    if (!confirm('상담을 종료하시겠습니까?')) return;
    await fetch(`${API_BASE}/counsel/sessions/${activeSession.id}/close`, {
      method: 'PATCH', headers: authHeaders(false),
    });
    setActiveSession(null);
    setView('home');
    await loadSessions();
    showToast('상담이 종료되었습니다');
  };

  const openExistingSession = async (session: Session) => {
    setActiveSession(session);
    await loadMessages(session.id);
    setView('chat');
  };

  // ── 채팅 뷰 ─────────────────────────────────────────────────
  if (view === 'chat') return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* 채팅 헤더 */}
      <div style={{
        background: '#4F8EF7', color: 'white',
        padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0
      }}>
        <button onClick={() => { setView('home'); setActiveSession(null); }} style={{
          background: 'rgba(255,255,255,.2)', border: 'none', color: 'white',
          width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 14
        }}>←</button>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👩‍💼</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{activeSession?.counselor_name || '마음이음 상담사'}</div>
          <div style={{ fontSize: '.75rem', opacity: .8 }}>
            {activeSession?.status === 'active' ? '🟢 상담 진행 중' : '상담 종료됨'}
          </div>
        </div>
        {activeSession?.status === 'active' && (
          <button onClick={closeSession} style={{ background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.4)', color: 'white', padding: '6px 14px', borderRadius: 20, fontSize: '.78rem', cursor: 'pointer', fontWeight: 600 }}>
            상담 종료
          </button>
        )}
      </div>

      {/* 메시지 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#F8F9FA', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ textAlign: 'center', padding: '12px 20px', background: '#e8f4fd', borderRadius: 12, fontSize: '.82rem', color: '#4F8EF7', margin: '0 auto', maxWidth: 480 }}>
          📋 상담 주제: {activeSession?.concern}
        </div>

        {messages.map(msg => {
          const isUser = msg.sender_role === 'user';
          return (
            <div key={msg.id} style={{ display: 'flex', gap: 10, flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
              {!isUser && (
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#4F8EF7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                  👩‍💼
                </div>
              )}
              <div style={{ maxWidth: '70%' }}>
                {!isUser && <div style={{ fontSize: '.72rem', color: '#adb5bd', marginBottom: 4, fontWeight: 600 }}>상담사</div>}
                <div style={{
                  padding: '12px 16px', borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                  background: isUser ? '#4F8EF7' : 'white',
                  color: isUser ? 'white' : '#1a1a2e',
                  fontSize: '.88rem', lineHeight: 1.7,
                  boxShadow: '0 1px 4px rgba(0,0,0,.08)',
                  border: isUser ? 'none' : '1px solid #e9ecef',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: '.68rem', color: '#adb5bd', marginTop: 4, textAlign: isUser ? 'right' : 'left' }}>
                  {new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div style={{ background: 'white', borderTop: '1px solid #e9ecef', padding: '14px 20px', display: 'flex', gap: 10, flexShrink: 0 }}>
        <input
          style={{ flex: 1, border: '1px solid #dee2e6', borderRadius: 24, padding: '10px 18px', fontSize: '.9rem', outline: 'none', fontFamily: 'inherit' }}
          placeholder={activeSession?.status === 'closed' ? '상담이 종료된 세션입니다' : '메시지를 입력하세요...'}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          disabled={activeSession?.status === 'closed'}
          onFocus={e => e.target.style.borderColor = '#4F8EF7'}
          onBlur={e => e.target.style.borderColor = '#dee2e6'}
        />
        <button onClick={sendMessage} disabled={loading || !inputText.trim() || activeSession?.status === 'closed'} style={{
          width: 44, height: 44, borderRadius: '50%', background: '#4F8EF7', color: 'white',
          border: 'none', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: (!inputText.trim() || activeSession?.status === 'closed') ? 0.5 : 1,
          transition: 'all .15s', flexShrink: 0
        }}>
          {loading ? '⏳' : '→'}
        </button>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: '#1a1a2e', color: 'white', padding: '13px 24px', borderRadius: 40, fontSize: '.88rem', fontWeight: 500, zIndex: 300, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>
          {toast}
        </div>
      )}
    </div>
  );

  // ── 홈 뷰 ───────────────────────────────────────────────────
  return (
    <div>
      {/* 히어로 배너 */}
      <div style={{ background: 'linear-gradient(135deg, #4F8EF7 0%, #6c63ff 100%)', padding: '40px 28px 36px', color: 'white' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,.2)', borderRadius: 20, padding: '4px 14px', fontSize: 13, marginBottom: 16 }}>전문 상담사와 1:1 익명 상담</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 10, lineHeight: 1.3 }}>
            혼자 감당하지 않아도 돼요<br />
            <span style={{ color: '#ffe066' }}>마음이음</span>이 옆에 있을게요
          </h2>
          <p style={{ opacity: .88, fontSize: '.95rem', marginBottom: 24, maxWidth: 480 }}>
            학업, 진로, 인간관계, 심리까지 — 익명으로 안전하게 상담할 수 있어요.
            모든 대화는 철저히 비밀이 보장됩니다.
          </p>
          <button onClick={() => setShowNewModal(true)} style={{
            background: 'white', color: '#4F8EF7', padding: '13px 28px', borderRadius: 50,
            fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
            transition: 'all .2s', boxShadow: '0 4px 20px rgba(0,0,0,.15)'
          }}>
            상담 시작하기 →
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px' }}>
        {/* 이용 방법 */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4F8EF7', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>이용 방법</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 20 }}>상담, 이렇게 진행돼요</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { n: 1, title: '카테고리 선택', desc: '고민 유형을 선택하고 상담 주제를 입력하세요.' },
              { n: 2, title: '상담사 배정', desc: '마음이음 상담사가 즉시 배정되어 대화를 시작합니다.' },
              { n: 3, title: '익명 채팅', desc: '안전하고 비밀이 보장되는 환경에서 이야기해요.' },
            ].map(s => (
              <div key={s.n} style={{ background: 'white', borderRadius: 14, padding: '22px 20px', border: '1px solid #e9ecef', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
                <div style={{ width: 36, height: 36, background: '#4F8EF7', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, margin: '0 auto 12px' }}>{s.n}</div>
                <h4 style={{ fontSize: '.9rem', fontWeight: 700, marginBottom: 6 }}>{s.title}</h4>
                <p style={{ fontSize: '.8rem', color: '#6c757d' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 카테고리 그리드 */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4F8EF7', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>상담 채널</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>어떤 고민이 있으신가요?</h3>
            <button onClick={() => setShowNewModal(true)} className="btn btn-primary btn-sm">+ 새 상담</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {CONCERN_CATEGORIES.map(cat => (
              <div key={cat.id}
                onClick={() => { setSelectedCat(cat.id); setShowNewModal(true); }}
                style={{ background: '#F8F9FA', borderRadius: 14, padding: '24px 16px', textAlign: 'center', cursor: 'pointer', border: '2px solid transparent', transition: 'all .2s', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}
                onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = cat.color; el.style.transform = 'translateY(-4px)'; el.style.background = 'white'; }}
                onMouseOut={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'transparent'; el.style.transform = ''; el.style.background = '#F8F9FA'; }}>
                <div style={{ fontSize: '2.2rem', marginBottom: 10 }}>{cat.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 6 }}>{cat.name}</div>
                <div style={{ fontSize: '.75rem', color: '#6c757d' }}>{cat.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 상담 내역 */}
        {sessions.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>내 상담 내역</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sessions.map(s => (
                <div key={s.id}
                  onClick={() => s.status !== 'closed' ? openExistingSession(s) : undefined}
                  style={{
                    background: 'white', borderRadius: 12, padding: '18px 20px',
                    border: '1px solid #e9ecef', cursor: s.status !== 'closed' ? 'pointer' : 'default',
                    transition: 'all .2s', boxShadow: '0 1px 4px rgba(0,0,0,.04)',
                    display: 'flex', alignItems: 'center', gap: 14,
                    borderLeft: s.status === 'active' ? '4px solid #4F8EF7' : '4px solid #e9ecef'
                  }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.concern}</div>
                    <div style={{ fontSize: '.78rem', color: '#adb5bd' }}>
                      {new Date(s.created_at).toLocaleDateString('ko-KR')} · {s.counselor_name}
                    </div>
                  </div>
                  <div style={{
                    background: s.status === 'active' ? '#e8f4fd' : '#f8f9fa',
                    color: s.status === 'active' ? '#4F8EF7' : '#adb5bd',
                    padding: '3px 10px', borderRadius: 20, fontSize: '.75rem', fontWeight: 600, flexShrink: 0
                  }}>
                    {s.status === 'active' ? '진행 중 →' : '종료됨'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 새 상담 모달 */}
      {showNewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
          onClick={() => setShowNewModal(false)}>
          <div style={{ background: 'white', borderRadius: 20, padding: 36, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.18)' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 22 }}>상담 신청하기</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '.83rem', fontWeight: 600, display: 'block', marginBottom: 6, color: '#444' }}>상담 카테고리</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {CONCERN_CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCat(cat.id)} style={{
                    padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                    border: `2px solid ${selectedCat === cat.id ? cat.color : '#dee2e6'}`,
                    background: selectedCat === cat.id ? `${cat.color}12` : 'white',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    transition: 'all .15s', fontSize: '1.2rem'
                  }}>
                    <span>{cat.icon}</span>
                    <span style={{ fontSize: '.7rem', fontWeight: 600, color: selectedCat === cat.id ? cat.color : '#495057' }}>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: '.83rem', fontWeight: 600, display: 'block', marginBottom: 6, color: '#444' }}>오늘 어떤 고민이 있으신가요?</label>
              <textarea
                style={{ width: '100%', border: '1px solid #dee2e6', borderRadius: 8, padding: '12px', fontFamily: 'inherit', fontSize: '.88rem', resize: 'vertical', minHeight: 100, outline: 'none', boxSizing: 'border-box' }}
                placeholder="상담받고 싶은 내용을 자유롭게 적어주세요. 익명으로 처리됩니다."
                value={concern} onChange={e => setConcern(e.target.value)}
                onFocus={e => e.target.style.borderColor = '#4F8EF7'}
                onBlur={e => e.target.style.borderColor = '#dee2e6'}
              />
            </div>
            <div style={{ background: '#e8f4fd', borderRadius: 10, padding: '10px 14px', fontSize: '.82rem', color: '#4F8EF7', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              🔒 모든 상담 내용은 익명으로 안전하게 보호됩니다
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowNewModal(false)} style={{ background: '#F8F9FA', color: '#6c757d', padding: '10px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500, border: '1px solid #dee2e6', cursor: 'pointer' }}>취소</button>
              <button onClick={startSession} disabled={loading || !concern.trim()} style={{ background: '#4F8EF7', color: 'white', padding: '10px 22px', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: !concern.trim() ? 0.6 : 1 }}>
                {loading ? '연결 중...' : '상담 시작하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: '#1a1a2e', color: 'white', padding: '13px 24px', borderRadius: 40, fontSize: '.88rem', fontWeight: 500, zIndex: 300, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
