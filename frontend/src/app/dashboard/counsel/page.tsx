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
    title: '1:1 익명 상담', subtitle: '학업, 진로, 인간관계, 심리까지 — 익명으로 안전하게 상담하세요.',
    start_counsel: '상담 시작하기', instant: '즉시 상담', booking: '예약 상담',
    online_counselors: '온라인 상담사', people: '명',
    how_title: '상담, 이렇게 진행돼요', category: '카테고리 선택', concern: '어떤 고민이 있으신가요?',
    concern_placeholder: '상담받고 싶은 내용을 자유롭게 적어주세요. 익명으로 처리됩니다.',
    new_counsel: '+ 새 상담', my_sessions: '내 상담 내역',
    active: '진행 중 →', closed: '종료됨',
    cancel: '취소', apply: '상담 신청',
    connecting: '연결 중...', session_closed: '상담이 종료된 세션입니다',
    type_message: '메시지를 입력하세요...', send: '전송',
    end_counsel: '상담 종료', in_progress: '🟢 상담 진행 중',
    counsel_ended: '상담 종료됨', topic: '상담 주제',
    anonymous_protect: '🔒 모든 상담 내용은 익명으로 안전하게 보호됩니다',
    step1_title: '카테고리 선택', step1_desc: '고민 유형을 선택하고 상담 주제를 입력하세요.',
    step2_title: '상담사 배정', step2_desc: '마음이음 상담사가 즉시 배정되어 대화를 시작합니다.',
    step3_title: '익명 채팅', step3_desc: '안전하고 비밀이 보장되는 환경에서 이야기해요.',
    counselor: '상담사', booking_notice: '예약 상담은 준비 중입니다. 즉시 상담을 이용해 주세요.',
    started: '상담이 시작되었습니다 💬', ended_msg: '상담이 종료되었습니다',
    enter_topic: '상담 주제를 입력해주세요',
  },
  en: {
    title: '1:1 Anonymous Counsel', subtitle: 'Study, career, relationships, mental health — consult anonymously.',
    start_counsel: 'Start Consultation', instant: 'Instant Counsel', booking: 'Scheduled Counsel',
    online_counselors: 'Online Counselors', people: '',
    how_title: 'How counseling works', category: 'Select Category', concern: 'What\'s on your mind?',
    concern_placeholder: 'Feel free to write anything. It\'s completely anonymous.',
    new_counsel: '+ New Counsel', my_sessions: 'My Sessions',
    active: 'In Progress →', closed: 'Ended',
    cancel: 'Cancel', apply: 'Start Counsel',
    connecting: 'Connecting...', session_closed: 'This session has ended',
    type_message: 'Type a message...', send: 'Send',
    end_counsel: 'End Counsel', in_progress: '🟢 In Progress',
    counsel_ended: 'Counsel Ended', topic: 'Topic',
    anonymous_protect: '🔒 All conversations are protected anonymously',
    step1_title: 'Select Category', step1_desc: 'Choose a concern type and enter your topic.',
    step2_title: 'Counselor Assigned', step2_desc: 'A counselor is assigned immediately.',
    step3_title: 'Anonymous Chat', step3_desc: 'Talk safely in a confidential environment.',
    counselor: 'Counselor', booking_notice: 'Scheduled counseling is coming soon. Please use instant counsel.',
    started: 'Counseling started 💬', ended_msg: 'Counseling ended',
    enter_topic: 'Please enter a topic',
  },
  ja: {
    title: '1:1 匿名相談', subtitle: '学業、進路、人間関係、心理 — 匿名で安全に相談できます。',
    start_counsel: '相談を始める', instant: '即時相談', booking: '予約相談',
    online_counselors: 'オンラインカウンセラー', people: '名',
    how_title: '相談の流れ', category: 'カテゴリ選択', concern: 'どんな悩みがありますか？',
    concern_placeholder: '相談したいことを自由に書いてください。匿名で処理されます。',
    new_counsel: '+ 新規相談', my_sessions: '相談履歴',
    active: '進行中 →', closed: '終了',
    cancel: 'キャンセル', apply: '相談申請',
    connecting: '接続中...', session_closed: 'この相談は終了しています',
    type_message: 'メッセージを入力...', send: '送信',
    end_counsel: '相談終了', in_progress: '🟢 相談中',
    counsel_ended: '相談終了', topic: '相談テーマ',
    anonymous_protect: '🔒 すべての相談内容は匿名で保護されます',
    step1_title: 'カテゴリ選択', step1_desc: '悩みの種類を選んでテーマを入力してください。',
    step2_title: 'カウンセラー配置', step2_desc: 'カウンセラーがすぐに配置されます。',
    step3_title: '匿名チャット', step3_desc: '安全な環境で話しましょう。',
    counselor: 'カウンセラー', booking_notice: '予約相談は準備中です。即時相談をご利用ください。',
    started: '相談が始まりました 💬', ended_msg: '相談が終了しました',
    enter_topic: 'テーマを入力してください',
  },
  zh: {
    title: '1对1匿名咨询', subtitle: '学习、职业、人际关系、心理 — 匿名安全咨询。',
    start_counsel: '开始咨询', instant: '即时咨询', booking: '预约咨询',
    online_counselors: '在线咨询师', people: '名',
    how_title: '咨询流程', category: '选择类别', concern: '您有什么烦恼？',
    concern_placeholder: '请自由写下想咨询的内容，将匿名处理。',
    new_counsel: '+ 新咨询', my_sessions: '我的咨询记录',
    active: '进行中 →', closed: '已结束',
    cancel: '取消', apply: '申请咨询',
    connecting: '连接中...', session_closed: '此咨询已结束',
    type_message: '输入消息...', send: '发送',
    end_counsel: '结束咨询', in_progress: '🟢 咨询中',
    counsel_ended: '咨询已结束', topic: '咨询主题',
    anonymous_protect: '🔒 所有咨询内容均匿名保护',
    step1_title: '选择类别', step1_desc: '选择烦恼类型并输入主题。',
    step2_title: '分配咨询师', step2_desc: '咨询师立即分配并开始对话。',
    step3_title: '匿名聊天', step3_desc: '在安全保密的环境中交流。',
    counselor: '咨询师', booking_notice: '预约咨询即将推出，请使用即时咨询。',
    started: '咨询已开始 💬', ended_msg: '咨询已结束',
    enter_topic: '请输入咨询主题',
  },
};

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
  const [sending, setSending] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [toast, setToast] = useState('');
  const [onlineCounselors, setOnlineCounselors] = useState(0);
  const [counselTab, setCounselTab] = useState<'instant' | 'booking'>('instant');
  const [lang, setLang] = useState('ko');
  const bottomRef = useRef<HTMLDivElement>(null);

  const t = i18n[lang] || i18n.ko;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') || 'ko';
    setLang(savedLang);
    loadSessions();
    // Fetch online counselors
    fetch(`${API}/counselors/online`, { headers: getHeaders(false) })
      .then(r => r.json())
      .then(data => setOnlineCounselors(Array.isArray(data) ? data.length : (data?.count || 0)))
      .catch(() => {});
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Poll messages every 3 seconds when in active session
  useEffect(() => {
    if (!activeSession) return;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`${API}/counsel/sessions/${activeSession.id}/messages`, { headers: getHeaders(false) });
        if (res.ok) setMessages(await res.json());
      } catch {}
    }, 3000);
    return () => clearInterval(poll);
  }, [activeSession]);

  const loadSessions = async () => {
    try {
      const res = await fetch(`${API}/counsel/sessions`, { headers: getHeaders(false) });
      if (res.ok) setSessions(await res.json());
    } catch {}
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const res = await fetch(`${API}/counsel/sessions/${sessionId}/messages`, { headers: getHeaders(false) });
      if (res.ok) setMessages(await res.json());
    } catch {}
  };

  const startSession = async () => {
    if (!concern.trim()) { showToast(t.enter_topic); return; }
    setLoading(true);
    const fullConcern = `[${CONCERN_CATEGORIES.find(c => c.id === selectedCat)?.name || '기타'}] ${concern}`;
    try {
      const res = await fetch(`${API}/counsel/sessions`, {
        method: 'POST', headers: getHeaders(),
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
        showToast(t.started);
      }
    } catch {}
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !activeSession) return;
    const text = inputText;
    setInputText('');
    setSending(true);
    try {
      await fetch(`${API}/counsel/sessions/${activeSession.id}/messages`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ content: text }),
      });
      // Immediately fetch updated messages
      const res = await fetch(`${API}/counsel/sessions/${activeSession.id}/messages`, { headers: getHeaders(false) });
      if (res.ok) setMessages(await res.json());
    } catch {}
    setSending(false);
  };

  const closeSession = async () => {
    if (!activeSession) return;
    if (!confirm('상담을 종료하시겠습니까?')) return;
    await fetch(`${API}/counsel/sessions/${activeSession.id}/close`, {
      method: 'PATCH', headers: getHeaders(false),
    });
    setActiveSession(null);
    setView('home');
    await loadSessions();
    showToast(t.ended_msg);
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
        background: 'linear-gradient(135deg, #4F8EF7 0%, #6c63ff 100%)', color: 'white',
        padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
        boxShadow: '0 2px 12px rgba(79,142,247,0.3)'
      }}>
        <button onClick={() => { setView('home'); setActiveSession(null); }} style={{
          background: 'rgba(255,255,255,.2)', border: 'none', color: 'white',
          width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 14
        }}>←</button>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👩‍💼</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{activeSession?.counselor_name || '마음이음 상담사'}</div>
          <div style={{ fontSize: '.75rem', opacity: .8 }}>
            {activeSession?.status === 'active' ? t.in_progress : t.counsel_ended}
          </div>
        </div>
        {activeSession?.status === 'active' && (
          <button onClick={closeSession} style={{ background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.4)', color: 'white', padding: '6px 14px', borderRadius: 20, fontSize: '.78rem', cursor: 'pointer', fontWeight: 600 }}>
            {t.end_counsel}
          </button>
        )}
      </div>

      {/* 메시지 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#F8F9FA', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ textAlign: 'center', padding: '12px 20px', background: '#e8f4fd', borderRadius: 12, fontSize: '.82rem', color: '#4F8EF7', margin: '0 auto', maxWidth: 480 }}>
          📋 {t.topic}: {activeSession?.concern}
        </div>

        {messages.map(msg => {
          const isUser = msg.sender_role === 'user' || msg.sender_role === 'STUDENT';
          return (
            <div key={msg.id} style={{ display: 'flex', gap: 10, flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
              {!isUser && (
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #4F8EF7, #6c63ff)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                  👩‍💼
                </div>
              )}
              <div style={{ maxWidth: '70%' }}>
                {!isUser && <div style={{ fontSize: '.72rem', color: '#adb5bd', marginBottom: 4, fontWeight: 600 }}>{t.counselor}</div>}
                <div style={{
                  padding: '12px 16px', borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                  background: isUser ? 'linear-gradient(135deg, #4F8EF7, #6c63ff)' : 'white',
                  color: isUser ? 'white' : '#1a1a2e',
                  fontSize: '.88rem', lineHeight: 1.7,
                  boxShadow: '0 2px 8px rgba(0,0,0,.08)',
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
          style={{ flex: 1, border: '1.5px solid #dee2e6', borderRadius: 24, padding: '10px 18px', fontSize: '.9rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
          placeholder={activeSession?.status === 'closed' ? t.session_closed : t.type_message}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          disabled={activeSession?.status === 'closed' || sending}
          onFocus={e => e.target.style.borderColor = '#4F8EF7'}
          onBlur={e => e.target.style.borderColor = '#dee2e6'}
        />
        <button onClick={sendMessage} disabled={sending || !inputText.trim() || activeSession?.status === 'closed'} style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #4F8EF7, #6c63ff)', color: 'white',
          border: 'none', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: (!inputText.trim() || activeSession?.status === 'closed') ? 0.5 : 1,
          transition: 'all .15s', flexShrink: 0
        }}>
          {sending ? '⏳' : '→'}
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
          <p style={{ opacity: .88, fontSize: '.95rem', marginBottom: 20, maxWidth: 480 }}>
            학업, 진로, 인간관계, 심리까지 — 익명으로 안전하게 상담할 수 있어요.
          </p>
          {/* 온라인 상담사 상태 */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 16px', fontSize: '0.875rem', marginBottom: 24, backdropFilter: 'blur(8px)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: onlineCounselors > 0 ? '#4ade80' : '#9ca3af', display: 'inline-block', boxShadow: onlineCounselors > 0 ? '0 0 8px #4ade80' : 'none' }} />
            🟢 {t.online_counselors} {onlineCounselors}{t.people}
          </div>
          <div style={{ display: 'block' }}>
            <button onClick={() => setShowNewModal(true)} style={{
              background: 'white', color: '#4F8EF7', padding: '13px 28px', borderRadius: 50,
              fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
              transition: 'all .2s', boxShadow: '0 4px 20px rgba(0,0,0,.15)'
            }}>
              {t.start_counsel} →
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px' }}>
        {/* 탭: 즉시상담 / 예약상담 */}
        <div className="tabs" style={{ marginBottom: 24 }}>
          <button
            className={`tab ${counselTab === 'instant' ? 'active' : ''}`}
            onClick={() => setCounselTab('instant')}
          >
            ⚡ {t.instant}
          </button>
          <button
            className={`tab ${counselTab === 'booking' ? 'active' : ''}`}
            onClick={() => setCounselTab('booking')}
          >
            📅 {t.booking}
          </button>
        </div>

        {counselTab === 'booking' ? (
          /* 예약 상담 탭 */
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📅</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{t.booking}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.booking_notice}</p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setCounselTab('instant')}>
              ⚡ {t.instant}으로 이동
            </button>
          </div>
        ) : (
          <>
            {/* 이용 방법 */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#4F8EF7', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>이용 방법</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 20 }}>{t.how_title}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                  { n: 1, title: t.step1_title, desc: t.step1_desc },
                  { n: 2, title: t.step2_title, desc: t.step2_desc },
                  { n: 3, title: t.step3_title, desc: t.step3_desc },
                ].map(s => (
                  <div key={s.n} style={{ background: 'white', borderRadius: 14, padding: '22px 20px', border: '1px solid #e9ecef', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
                    <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #4F8EF7, #6c63ff)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, margin: '0 auto 12px' }}>{s.n}</div>
                    <h4 style={{ fontSize: '.9rem', fontWeight: 700, marginBottom: 6 }}>{s.title}</h4>
                    <p style={{ fontSize: '.8rem', color: '#6c757d' }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 카테고리 그리드 */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{t.concern}</h3>
                <button onClick={() => setShowNewModal(true)} className="btn btn-primary btn-sm">{t.new_counsel}</button>
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
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>{t.my_sessions}</h3>
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
                        {s.status === 'active' ? t.active : t.closed}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
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
              <label style={{ fontSize: '.83rem', fontWeight: 600, display: 'block', marginBottom: 6, color: '#444' }}>{t.category}</label>
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
                style={{ width: '100%', border: '1.5px solid #dee2e6', borderRadius: 8, padding: '12px', fontFamily: 'inherit', fontSize: '.88rem', resize: 'vertical', minHeight: 100, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                placeholder={t.concern_placeholder}
                value={concern} onChange={e => setConcern(e.target.value)}
                onFocus={e => e.target.style.borderColor = '#4F8EF7'}
                onBlur={e => e.target.style.borderColor = '#dee2e6'}
              />
            </div>
            <div style={{ background: '#e8f4fd', borderRadius: 10, padding: '10px 14px', fontSize: '.82rem', color: '#4F8EF7', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              {t.anonymous_protect}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowNewModal(false)} style={{ background: '#F8F9FA', color: '#6c757d', padding: '10px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500, border: '1px solid #dee2e6', cursor: 'pointer' }}>{t.cancel}</button>
              <button onClick={startSession} disabled={loading || !concern.trim()} style={{ background: 'linear-gradient(135deg, #4F8EF7, #6c63ff)', color: 'white', padding: '10px 22px', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: !concern.trim() ? 0.6 : 1 }}>
                {loading ? t.connecting : t.apply}
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
