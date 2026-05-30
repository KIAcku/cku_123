'use client';
import { useState, useEffect, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://studentcare-production.up.railway.app/api/v1';
const getHeaders = (json = true) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const h: Record<string, string> = {};
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (json) h['Content-Type'] = 'application/json';
  return h;
};

// ─── 다국어 번역 ──────────────────────────────────────────────
const i18n: Record<string, Record<string, string>> = {
  ko: {
    title: '상담 관리', subtitle: '학생들의 익명 상담 요청에 답변할 수 있습니다.',
    welcome: '님, 환영합니다', refresh: '🔄 새로고침',
    waiting: '대기중', active: '진행중', closed: '종료됨',
    assign: '배정 받기', end_counsel: '상담 종료', report_btn: '상담 결과 보고서',
    student_anon: '학생 (익명)', me_counselor: '나 (상담사)',
    type_reply: '학생에게 답변을 입력하세요... (Enter: 줄바꿈, Ctrl+Enter: 전송)',
    send_reply: '📤 전송', sending: '⏳',
    select_session: '왼쪽에서 상담 세션을 선택하면 대화 내용이 표시됩니다',
    no_sessions: '해당하는 상담이 없습니다',
    topic: '📋 상담 주제', sent_ok: '답변을 전송했습니다 ✅',
    assign_ok: '상담이 배정되었습니다 ✅', close_ok: '상담이 종료되었습니다',
    report_ok: '보고서가 제출되었습니다 ✅', confirm_close: '이 상담을 종료하시겠습니까?',
    report_title: '상담 결과 보고서', report_summary: '상담 요약',
    report_summary_ph: '이번 상담의 주요 내용을 요약해 주세요...',
    risk_level: '위험도 수준', risk_low: '낮음', risk_medium: '보통', risk_high: '높음', risk_critical: '위급',
    submit_report: '보고서 제출', cancel: '취소',
    status_waiting: '⏳ 대기중', status_active: '🟢 진행중', status_closed: '⚫ 종료',
    sessions_count: '개 세션',
  },
  en: {
    title: 'Counsel Management', subtitle: 'Respond to anonymous student counseling requests.',
    welcome: ', welcome', refresh: '🔄 Refresh',
    waiting: 'Waiting', active: 'Active', closed: 'Closed',
    assign: 'Assign Me', end_counsel: 'End Counsel', report_btn: 'Counsel Report',
    student_anon: 'Student (Anon)', me_counselor: 'Me (Counselor)',
    type_reply: 'Type your reply... (Enter: newline, Ctrl+Enter: send)',
    send_reply: '📤 Send', sending: '⏳',
    select_session: 'Select a session on the left to view the conversation',
    no_sessions: 'No sessions found',
    topic: '📋 Topic', sent_ok: 'Reply sent ✅',
    assign_ok: 'Session assigned ✅', close_ok: 'Session closed',
    report_ok: 'Report submitted ✅', confirm_close: 'End this counseling session?',
    report_title: 'Counsel Report', report_summary: 'Session Summary',
    report_summary_ph: 'Summarize the main points of this session...',
    risk_level: 'Risk Level', risk_low: 'Low', risk_medium: 'Medium', risk_high: 'High', risk_critical: 'Critical',
    submit_report: 'Submit Report', cancel: 'Cancel',
    status_waiting: '⏳ Waiting', status_active: '🟢 Active', status_closed: '⚫ Closed',
    sessions_count: ' sessions',
  },
  ja: {
    title: '相談管理', subtitle: '学生の匿名相談に返答できます。',
    welcome: 'さん、ようこそ', refresh: '🔄 更新',
    waiting: '待機中', active: '進行中', closed: '終了',
    assign: '配置する', end_counsel: '相談終了', report_btn: '相談報告書',
    student_anon: '学生 (匿名)', me_counselor: '私 (カウンセラー)',
    type_reply: '学生への返答を入力... (Enter: 改行, Ctrl+Enter: 送信)',
    send_reply: '📤 送信', sending: '⏳',
    select_session: '左のセッションを選択してください',
    no_sessions: 'セッションがありません',
    topic: '📋 テーマ', sent_ok: '返答を送信しました ✅',
    assign_ok: '相談が配置されました ✅', close_ok: '相談が終了しました',
    report_ok: '報告書を提出しました ✅', confirm_close: 'この相談を終了しますか？',
    report_title: '相談報告書', report_summary: '相談まとめ',
    report_summary_ph: '今回の相談の主要な内容をまとめてください...',
    risk_level: 'リスクレベル', risk_low: '低', risk_medium: '普通', risk_high: '高', risk_critical: '緊急',
    submit_report: '報告書提出', cancel: 'キャンセル',
    status_waiting: '⏳ 待機中', status_active: '🟢 進行中', status_closed: '⚫ 終了',
    sessions_count: ' セッション',
  },
  zh: {
    title: '咨询管理', subtitle: '可以回应学生的匿名咨询请求。',
    welcome: '，欢迎', refresh: '🔄 刷新',
    waiting: '等待中', active: '进行中', closed: '已结束',
    assign: '接受分配', end_counsel: '结束咨询', report_btn: '咨询报告',
    student_anon: '学生 (匿名)', me_counselor: '我 (咨询师)',
    type_reply: '输入回复... (Enter: 换行, Ctrl+Enter: 发送)',
    send_reply: '📤 发送', sending: '⏳',
    select_session: '在左侧选择一个会话以查看对话',
    no_sessions: '没有找到会话',
    topic: '📋 主题', sent_ok: '回复已发送 ✅',
    assign_ok: '已分配会话 ✅', close_ok: '会话已结束',
    report_ok: '报告已提交 ✅', confirm_close: '结束此咨询？',
    report_title: '咨询报告', report_summary: '会话摘要',
    report_summary_ph: '请总结本次咨询的主要内容...',
    risk_level: '风险等级', risk_low: '低', risk_medium: '中', risk_high: '高', risk_critical: '紧急',
    submit_report: '提交报告', cancel: '取消',
    status_waiting: '⏳ 等待中', status_active: '🟢 进行中', status_closed: '⚫ 已结束',
    sessions_count: ' 个会话',
  },
};

type Session = {
  id: string; concern: string; status: string; created_at: string;
  counselor_name: string; counselor_id?: string;
};
type Message = { id: string; sender_role: string; content: string; created_at: string };

export default function CounselorPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<'waiting' | 'active' | 'closed'>('active');
  const [lang, setLang] = useState('ko');
  const [showReport, setShowReport] = useState(false);
  const [reportSummary, setReportSummary] = useState('');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
  const bottomRef = useRef<HTMLDivElement>(null);

  const t = i18n[lang] || i18n.ko;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') || 'ko';
    setLang(savedLang);
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

  // Poll messages every 5 seconds
  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => loadSessionMessages(activeSession.id), 5000);
    return () => clearInterval(interval);
  }, [activeSession]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadAllSessions = async () => {
    try {
      const res = await fetch(`${API}/counsel/counselor/sessions`, { headers: getHeaders(false) });
      if (res.ok) setSessions(await res.json());
    } catch {}
  };

  const loadSessionMessages = async (sessionId: string) => {
    try {
      const res = await fetch(`${API}/counsel/counselor/sessions/${sessionId}/messages`, { headers: getHeaders(false) });
      if (res.ok) setMessages(await res.json());
    } catch {}
  };

  const openSession = async (session: Session) => {
    setActiveSession(session);
    await loadSessionMessages(session.id);
  };

  const assignSession = async (sessionId: string) => {
    try {
      const res = await fetch(`${API}/counsel/counselor/sessions/${sessionId}/assign`, {
        method: 'PATCH', headers: getHeaders(false),
      });
      if (res.ok) {
        showToast(t.assign_ok);
        await loadAllSessions();
        // Update active session status
        setActiveSession(prev => prev ? { ...prev, status: 'active' } : null);
      }
    } catch {}
  };

  const sendReply = async () => {
    if (!reply.trim() || !activeSession) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/counsel/counselor/sessions/${activeSession.id}/reply`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ content: reply }),
      });
      if (res.ok) {
        setReply('');
        await loadSessionMessages(activeSession.id);
        showToast(t.sent_ok);
      }
    } catch {}
    setLoading(false);
  };

  const closeSession = async () => {
    if (!activeSession) return;
    if (!confirm(t.confirm_close)) return;
    try {
      await fetch(`${API}/counsel/sessions/${activeSession.id}/close`, {
        method: 'PATCH', headers: getHeaders(false),
      });
      showToast(t.close_ok);
      setActiveSession(null);
      setMessages([]);
      await loadAllSessions();
    } catch {}
  };

  const submitReport = async () => {
    if (!activeSession || !reportSummary.trim()) return;
    try {
      const res = await fetch(`${API}/counsel/counselor/sessions/${activeSession.id}/report`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ summary: reportSummary, risk_level: riskLevel }),
      });
      if (res.ok) {
        showToast(t.report_ok);
        setShowReport(false);
        setReportSummary('');
        setRiskLevel('low');
      }
    } catch {}
  };

  const filteredSessions = sessions.filter(s => {
    if (tab === 'waiting') return s.status === 'waiting' || s.status === 'pending';
    if (tab === 'active') return s.status === 'active';
    if (tab === 'closed') return s.status === 'closed';
    return true;
  });

  const statusBadge = (status: string) => {
    if (status === 'active') return { text: t.status_active, bg: '#dcfce7', color: '#16a34a' };
    if (status === 'closed') return { text: t.status_closed, bg: '#f1f5f9', color: '#64748b' };
    return { text: t.status_waiting, bg: '#fef9c3', color: '#ca8a04' };
  };

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* 상단 배너 */}
      <div style={{
        background: 'linear-gradient(135deg, #20c997 0%, #0891b2 100%)',
        padding: '16px 24px', color: 'white', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 16
      }}>
        <div style={{ fontSize: '2rem' }}>👩‍💼</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.nickname || '상담사'}{t.welcome}</div>
          <div style={{ opacity: 0.85, fontSize: '0.8rem', marginTop: 2 }}>
            {t.subtitle} · 전체 {sessions.length}{t.sessions_count}
          </div>
        </div>
        <button onClick={loadAllSessions} style={{
          background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
          color: 'white', padding: '7px 14px', borderRadius: 20, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
        }}>{t.refresh}</button>
      </div>

      {/* 메인 스플릿 패널 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 왼쪽: 세션 목록 (35%) */}
        <div style={{
          width: '35%', minWidth: 280, borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          background: 'var(--bg-subtle)'
        }}>
          {/* 탭 */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'white', flexShrink: 0 }}>
            {(['waiting', 'active', 'closed'] as const).map(tabKey => (
              <button key={tabKey} onClick={() => setTab(tabKey)} style={{
                flex: 1, padding: '12px 8px', fontSize: '0.78rem', fontWeight: tab === tabKey ? 700 : 500,
                borderBottom: tab === tabKey ? '2px solid #20c997' : '2px solid transparent',
                color: tab === tabKey ? '#20c997' : 'var(--text-secondary)',
                background: 'transparent', cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {t[tabKey]} ({sessions.filter(s => {
                  if (tabKey === 'waiting') return s.status === 'waiting' || s.status === 'pending';
                  if (tabKey === 'active') return s.status === 'active';
                  return s.status === 'closed';
                }).length})
              </button>
            ))}
          </div>

          {/* 세션 리스트 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {filteredSessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>💬</div>
                <p style={{ fontSize: '0.875rem' }}>{t.no_sessions}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredSessions.map(s => {
                  const badge = statusBadge(s.status);
                  const isSelected = activeSession?.id === s.id;
                  return (
                    <div key={s.id}
                      onClick={() => openSession(s)}
                      style={{
                        background: isSelected ? 'white' : 'white',
                        borderRadius: 12,
                        padding: '14px 16px',
                        border: `2px solid ${isSelected ? '#20c997' : 'var(--border)'}`,
                        cursor: 'pointer', transition: 'all .18s',
                        boxShadow: isSelected ? '0 4px 16px rgba(32,201,151,0.18)' : '0 1px 3px rgba(0,0,0,0.04)',
                      }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 8 }}>
                          {s.concern}
                        </div>
                        <div style={{ background: badge.bg, color: badge.color, padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                          {badge.text}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(s.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {(s.status === 'waiting' || s.status === 'pending') && isSelected && (
                        <button
                          onClick={e => { e.stopPropagation(); assignSession(s.id); }}
                          style={{
                            marginTop: 10, width: '100%', padding: '7px', borderRadius: 8,
                            background: 'linear-gradient(135deg, #20c997, #0891b2)',
                            color: 'white', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer'
                          }}
                        >
                          ✅ {t.assign}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 채팅 (65%) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'white' }}>
          {activeSession ? (
            <>
              {/* 채팅 헤더 */}
              <div style={{
                background: 'linear-gradient(135deg, #20c997 0%, #0891b2 100%)',
                padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0
              }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activeSession.concern}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85, color: 'white' }}>학생 익명 상담 · {statusBadge(activeSession.status).text}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {activeSession.status === 'active' && (
                    <>
                      <button onClick={() => setShowReport(true)} style={{
                        background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
                        color: 'white', padding: '6px 12px', borderRadius: 20, fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600
                      }}>
                        📋 {t.report_btn}
                      </button>
                      <button onClick={closeSession} style={{
                        background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.5)',
                        color: 'white', padding: '6px 12px', borderRadius: 20, fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600
                      }}>
                        🔚 {t.end_counsel}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 메시지 영역 */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#F8F9FA', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ textAlign: 'center', padding: '10px 20px', background: '#e8f8f4', borderRadius: 12, fontSize: '0.8rem', color: '#20c997', margin: '0 auto', maxWidth: 500 }}>
                  {t.topic}: {activeSession.concern}
                </div>
                {messages.map(msg => {
                  const isMe = msg.sender_role === 'counselor' || msg.sender_role === 'COUNSELOR';
                  return (
                    <div key={msg.id} style={{ display: 'flex', gap: 10, flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: isMe ? 'linear-gradient(135deg, #20c997, #0891b2)' : '#e9ecef',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0
                      }}>
                        {isMe ? '👩‍💼' : '🙋'}
                      </div>
                      <div style={{ maxWidth: '65%' }}>
                        <div style={{ fontSize: '0.7rem', color: '#adb5bd', marginBottom: 4, textAlign: isMe ? 'right' : 'left', fontWeight: 600 }}>
                          {isMe ? t.me_counselor : t.student_anon}
                        </div>
                        <div style={{
                          padding: '11px 15px', borderRadius: isMe ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                          background: isMe ? 'linear-gradient(135deg, #20c997, #0891b2)' : 'white',
                          color: isMe ? 'white' : '#1a1a2e',
                          fontSize: '0.875rem', lineHeight: 1.65,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
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
                <div ref={bottomRef} />
              </div>

              {/* 답변 입력 */}
              {activeSession.status === 'active' && (
                <div style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '14px 16px', display: 'flex', gap: 10, flexShrink: 0 }}>
                  <textarea
                    style={{
                      flex: 1, border: '1.5px solid #dee2e6', borderRadius: 12,
                      padding: '10px 14px', fontSize: '0.875rem', resize: 'none',
                      outline: 'none', fontFamily: 'inherit', minHeight: 60, transition: 'border-color 0.15s'
                    }}
                    placeholder={t.type_reply}
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); sendReply(); } }}
                    onFocus={e => e.target.style.borderColor = '#20c997'}
                    onBlur={e => e.target.style.borderColor = '#dee2e6'}
                  />
                  <button onClick={sendReply} disabled={loading || !reply.trim()} style={{
                    background: 'linear-gradient(135deg, #20c997, #0891b2)',
                    color: 'white', border: 'none', borderRadius: 12,
                    padding: '0 20px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                    opacity: !reply.trim() ? 0.5 : 1, transition: 'all .15s',
                    display: 'flex', alignItems: 'center', gap: 6, minWidth: 80
                  }}>
                    {loading ? t.sending : t.send_reply}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: 16 }}>
              <div style={{ fontSize: '4rem' }}>📨</div>
              <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>{t.select_session}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>총 {sessions.length}개의 상담이 있습니다</p>
            </div>
          )}
        </div>
      </div>

      {/* 상담 결과 보고서 모달 */}
      {showReport && (
        <div className="modal-overlay" onClick={() => setShowReport(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <span className="modal-title">📋 {t.report_title}</span>
              <button className="modal-close" onClick={() => setShowReport(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--bg-subtle)', borderRadius: 10, padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                📋 {activeSession?.concern}
              </div>
              <div className="form-group">
                <label className="form-label">{t.report_summary}</label>
                <textarea
                  className="form-textarea"
                  rows={5}
                  placeholder={t.report_summary_ph}
                  value={reportSummary}
                  onChange={e => setReportSummary(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t.risk_level}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {([
                    { key: 'low', label: t.risk_low, color: '#16a34a', bg: '#dcfce7' },
                    { key: 'medium', label: t.risk_medium, color: '#d97706', bg: '#fef3c7' },
                    { key: 'high', label: t.risk_high, color: '#dc2626', bg: '#fee2e2' },
                    { key: 'critical', label: t.risk_critical, color: '#7c3aed', bg: '#ede9fe' },
                  ] as const).map(r => (
                    <button key={r.key} onClick={() => setRiskLevel(r.key)} style={{
                      padding: '8px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                      border: `2px solid ${riskLevel === r.key ? r.color : 'var(--border)'}`,
                      background: riskLevel === r.key ? r.bg : 'white',
                      color: riskLevel === r.key ? r.color : 'var(--text-secondary)',
                      cursor: 'pointer', transition: 'all 0.15s'
                    }}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn btn-secondary btn-full" onClick={() => setShowReport(false)}>{t.cancel}</button>
                <button
                  className="btn btn-primary btn-full"
                  onClick={submitReport}
                  disabled={!reportSummary.trim()}
                  style={{ background: 'linear-gradient(135deg, #20c997, #0891b2)' }}
                >
                  {t.submit_report}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast success">{toast}</div>}
    </div>
  );
}
