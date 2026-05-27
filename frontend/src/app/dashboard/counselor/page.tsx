'use client';
import { useState, useEffect } from 'react';
import { API_BASE, authHeaders } from '@/lib/apiClient';

type Session = { id: string; concern: string; status: string; created_at: string; counselor_name: string };
type Message = { id: string; sender_role: string; content: string; created_at: string };

export default function CounselorPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [user, setUser] = useState<any>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed);
      if (!['COUNSELOR', 'TEACHER', 'ADMIN'].includes(parsed.role)) {
        window.location.href = '/dashboard';
      }
    }
    loadAllSessions();
  }, []);

  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => loadSessionMessages(activeSession.id), 3000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const loadAllSessions = async () => {
    const res = await fetch(`${API_BASE}/counsel/counselor/sessions`, { headers: authHeaders(false) });
    if (res.ok) setSessions(await res.json());
  };

  const loadSessionMessages = async (sessionId: string) => {
    const res = await fetch(`${API_BASE}/counsel/counselor/sessions/${sessionId}/messages`, { headers: authHeaders(false) });
    if (res.ok) setMessages(await res.json());
  };

  const openSession = async (session: Session) => {
    setActiveSession(session);
    await loadSessionMessages(session.id);
  };

  const sendReply = async () => {
    if (!reply.trim() || !activeSession) return;
    setLoading(true);
    const res = await fetch(`${API_BASE}/counsel/counselor/sessions/${activeSession.id}/reply`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ content: reply }),
    });
    if (res.ok) {
      setReply('');
      await loadSessionMessages(activeSession.id);
      showToast('답변을 전송했습니다 ✅');
    }
    setLoading(false);
  };

  return (
    <div className="page-content">
      {/* 헤더 */}
      <div style={{ marginBottom: 28 }}>
        <h2 className="page-title">📨 학생 상담 관리</h2>
        <p className="page-subtitle">현재 진행 중인 학생 상담 세션을 확인하고 답변할 수 있어요.</p>
      </div>

      {/* 상담사 정보 배너 */}
      <div style={{
        background: 'linear-gradient(135deg, #20c997 0%, #0891b2 100%)',
        borderRadius: 16, padding: '20px 24px', color: 'white', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 16
      }}>
        <div style={{ fontSize: '2.5rem' }}>👩‍💼</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.nickname || '상담사'}님, 환영합니다</div>
          <div style={{ opacity: 0.85, fontSize: '0.875rem', marginTop: 4 }}>
            학생들의 익명 상담 요청에 직접 답변할 수 있습니다. 현재 {sessions.length}개의 진행 중인 상담이 있습니다.
          </div>
        </div>
        <button onClick={loadAllSessions} style={{
          marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
          color: 'white', padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
        }}>🔄 새로고침</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
        {/* 세션 목록 */}
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14, color: 'var(--text-secondary)' }}>
            진행 중인 상담 ({sessions.length})
          </h3>
          {sessions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>💬</div>
              <p>현재 진행 중인 상담이 없습니다</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sessions.map(s => (
                <div key={s.id}
                  onClick={() => openSession(s)}
                  style={{
                    background: 'white', borderRadius: 12, padding: '16px',
                    border: `2px solid ${activeSession?.id === s.id ? '#20c997' : 'var(--border)'}`,
                    cursor: 'pointer', transition: 'all .2s',
                    boxShadow: activeSession?.id === s.id ? '0 4px 16px rgba(32,201,151,0.2)' : '0 1px 4px rgba(0,0,0,0.04)',
                  }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.concern}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{new Date(s.created_at).toLocaleDateString('ko-KR')}</span>
                    <span style={{ color: '#20c997', fontWeight: 600 }}>진행 중</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 채팅 영역 */}
        {activeSession ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: 600 }}>
            {/* 채팅 헤더 */}
            <div style={{ background: '#20c997', color: 'white', padding: '14px 20px', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeSession.concern}
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>학생 익명 상담 · 상담 진행 중</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>🟢 활성</div>
            </div>

            {/* 메시지 영역 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#F8F9FA', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ textAlign: 'center', padding: '10px 20px', background: '#e8f8f4', borderRadius: 12, fontSize: '0.8rem', color: '#20c997' }}>
                📋 상담 주제: {activeSession.concern}
              </div>
              {messages.map(msg => {
                const isMe = msg.sender_role === 'counselor';
                return (
                  <div key={msg.id} style={{ display: 'flex', gap: 10, flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: isMe ? '#20c997' : '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
                      {isMe ? '👩‍💼' : '🙋'}
                    </div>
                    <div style={{ maxWidth: '65%' }}>
                      <div style={{ fontSize: '0.7rem', color: '#adb5bd', marginBottom: 4, textAlign: isMe ? 'right' : 'left', fontWeight: 600 }}>
                        {isMe ? '나 (상담사)' : '학생 (익명)'}
                      </div>
                      <div style={{
                        padding: '11px 15px', borderRadius: isMe ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                        background: isMe ? '#20c997' : 'white',
                        color: isMe ? 'white' : '#1a1a2e',
                        fontSize: '0.875rem', lineHeight: 1.65,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                        border: isMe ? 'none' : '1px solid #e9ecef',
                        whiteSpace: 'pre-wrap'
                      }}>{msg.content}</div>
                      <div style={{ fontSize: '0.68rem', color: '#adb5bd', marginTop: 3, textAlign: isMe ? 'right' : 'left' }}>
                        {new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 답변 입력 */}
            <div style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '14px 16px', display: 'flex', gap: 10, borderRadius: '0 0 12px 12px' }}>
              <textarea
                style={{ flex: 1, border: '1px solid #dee2e6', borderRadius: 12, padding: '10px 14px', fontSize: '0.875rem', resize: 'none', outline: 'none', fontFamily: 'inherit', minHeight: 60 }}
                placeholder="학생에게 답변을 입력하세요... (Enter: 줄바꿈, Ctrl+Enter: 전송)"
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); sendReply(); } }}
                onFocus={e => e.target.style.borderColor = '#20c997'}
                onBlur={e => e.target.style.borderColor = '#dee2e6'}
              />
              <button onClick={sendReply} disabled={loading || !reply.trim()} style={{
                background: '#20c997', color: 'white', border: 'none', borderRadius: 12,
                padding: '0 20px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                opacity: !reply.trim() ? 0.5 : 1, transition: 'all .15s',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                {loading ? '⏳' : '📤 전송'}
              </button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📨</div>
            <p style={{ fontSize: '0.9rem' }}>왼쪽에서 상담 세션을 선택하면 대화 내용이 표시됩니다</p>
          </div>
        )}
      </div>

      {toast && <div className="toast success">{toast}</div>}
    </div>
  );
}
