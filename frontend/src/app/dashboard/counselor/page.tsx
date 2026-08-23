'use client';
import { useState, useEffect, useRef } from 'react';
import { useLangStore } from '@/store/langStore';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://studentcare-production.up.railway.app/api/v1';
const getHeaders = (json = true) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const h: Record<string, string> = {};
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (json) h['Content-Type'] = 'application/json';
  return h;
};

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
    // 일기 탭
    tab_counsel: '💬 상담 관리', tab_diary: '📔 학생 일기',
    diary_title: '학생 감정 일기 열람', diary_sub: '학생을 선택하면 감정 일기를 열람하고 날씨 태그를 달 수 있습니다.',
    select_student: '학생을 선택하세요', no_students: '학생 목록이 없습니다',
    diary_count: '일기 {n}건', no_diaries: '작성된 일기가 없습니다',
    weather_tag_title: '날씨 태그 달기', counselor_note_ph: '상담사 메모를 입력하세요 (선택)...',
    tag_save: '태그 저장', tag_saved: '태그가 저장되었습니다 ✅', tag_remove: '태그 제거',
    emotion_intensity: '강도', diary_loading: '일기를 불러오는 중...',
    student_search: '학생 이름 검색...',
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
    tab_counsel: '💬 Counsel', tab_diary: '📔 Student Diary',
    diary_title: 'Student Emotion Diary', diary_sub: 'Select a student to view their diary and add weather tags.',
    select_student: 'Select a student', no_students: 'No students found',
    diary_count: '{n} entries', no_diaries: 'No diary entries',
    weather_tag_title: 'Weather Tag', counselor_note_ph: 'Enter counselor note (optional)...',
    tag_save: 'Save Tag', tag_saved: 'Tag saved ✅', tag_remove: 'Remove Tag',
    emotion_intensity: 'Intensity', diary_loading: 'Loading diaries...',
    student_search: 'Search students...',
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
    tab_counsel: '💬 相談管理', tab_diary: '📔 学生日記',
    diary_title: '学生感情日記閲覧', diary_sub: '学生を選択して日記を閲覧し天気タグをつけましょう。',
    select_student: '学生を選択', no_students: '学生がいません',
    diary_count: '{n}件', no_diaries: '日記がありません',
    weather_tag_title: '天気タグ', counselor_note_ph: 'カウンセラーメモを入力...',
    tag_save: '保存', tag_saved: 'タグを保存しました ✅', tag_remove: '削除',
    emotion_intensity: '強さ', diary_loading: '読み込み中...',
    student_search: '学生名で検索...',
  },
  zh: {
    title: '咨询管理', subtitle: '可以回应学生的匿名咨询请求。',
    welcome: '，欢迎', refresh: '🔄 刷新',
    waiting: '等待中', active: '进行中', closed: '已结束',
    assign: '接受分配', end_counsel: '结束咨询', report_btn: '咨询报告',
    student_anon: '学生（匿名）', me_counselor: '我（咨询师）',
    type_reply: '输入回复... (Enter: 换行, Ctrl+Enter: 发送)',
    send_reply: '📤 发送', sending: '⏳',
    select_session: '从左侧选择会话',
    no_sessions: '没有会话',
    topic: '📋 主题', sent_ok: '回复已发送 ✅',
    assign_ok: '已接受分配 ✅', close_ok: '咨询已结束',
    report_ok: '报告已提交 ✅', confirm_close: '结束这次咨询？',
    report_title: '咨询报告', report_summary: '咨询摘要',
    report_summary_ph: '请总结本次咨询要点...',
    risk_level: '风险等级', risk_low: '低', risk_medium: '中', risk_high: '高', risk_critical: '紧急',
    submit_report: '提交报告', cancel: '取消',
    status_waiting: '⏳ 等待中', status_active: '🟢 进行中', status_closed: '⚫ 已结束',
    sessions_count: ' 个会话',
    tab_counsel: '💬 咨询管理', tab_diary: '📔 学生日记',
    diary_title: '学生情绪日记', diary_sub: '选择学生查看日记并添加天气标签。',
    select_student: '选择学生', no_students: '没有学生',
    diary_count: '{n}篇', no_diaries: '没有日记',
    weather_tag_title: '天气标签', counselor_note_ph: '输入咨询师备注...',
    tag_save: '保存标签', tag_saved: '标签已保存 ✅', tag_remove: '删除标签',
    emotion_intensity: '强度', diary_loading: '加载中...',
    student_search: '搜索学生...',
  },
};

// ─── 날씨 태그 메타 ──────────────────────────────────────────────
const WEATHER_TAGS = [
  { icon: '☀️', label: { ko:'매우 좋음', en:'Very Good', ja:'とても良い', zh:'非常好' }, color: '#F59E0B' },
  { icon: '🌤️', label: { ko:'좋음', en:'Good', ja:'良い', zh:'良好' }, color: '#34D399' },
  { icon: '⛅', label: { ko:'보통', en:'Neutral', ja:'普通', zh:'一般' }, color: '#94A3B8' },
  { icon: '🌧️', label: { ko:'우울/슬픔', en:'Sad/Down', ja:'悲しい', zh:'悲伤' }, color: '#60A5FA' },
  { icon: '⛈️', label: { ko:'위기/주의', en:'Crisis', ja:'危機', zh:'危机' }, color: '#EF4444' },
  { icon: '🌈', label: { ko:'회복 중', en:'Recovering', ja:'回復中', zh:'恢复中' }, color: '#A78BFA' },
];

const EMOTION_META: Record<string, { emoji: string; color: string }> = {
  happy:   { emoji: '😊', color: '#F59E0B' },
  sad:     { emoji: '😢', color: '#3B82F6' },
  angry:   { emoji: '😠', color: '#EF4444' },
  anxious: { emoji: '😰', color: '#8B5CF6' },
  neutral: { emoji: '😐', color: '#6B7280' },
  tired:   { emoji: '😴', color: '#EC4899' },
};

type Session = { id: string; concern: string; status: string; created_at: string; counselor_name: string; counselor_id?: string };
type Message = { id: string; sender_role: string; content: string; created_at: string };
type Student = { id: string; nickname: string; email: string; diary_count: number };
type Diary = { id: string; content: string; emotion: string; emotion_score: string; created_at: string; weather_tag?: string; counselor_note?: string; tagged_by?: string };

// ─── 날씨 태그 패널 컴포넌트 ────────────────────────────────────
function WeatherTagPanel({ diary, lang, t, onSaved }: { diary: Diary; lang: string; t: any; onSaved: (id: string, tag: string, note: string) => void }) {
  const [selectedTag, setSelectedTag] = useState(diary.weather_tag || '');
  const [note, setNote] = useState(diary.counselor_note || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/diaries/counselor/${diary.id}/tag`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ weather_tag: selectedTag || null, counselor_note: note || null }),
      });
      if (res.ok) {
        onSaved(diary.id, selectedTag, note);
      }
    } catch {}
    setSaving(false);
  };

  return (
    <div style={{ marginTop: 12, background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 12, padding: '14px' }}>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t.weather_tag_title}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {WEATHER_TAGS.map(w => (
          <button key={w.icon} onClick={() => setSelectedTag(selectedTag === w.icon ? '' : w.icon)}
            title={(w.label as any)[lang] || w.label.ko}
            style={{
              fontSize: '1.4rem', width: 40, height: 40, borderRadius: 10,
              border: `2px solid ${selectedTag === w.icon ? w.color : 'var(--glass-border)'}`,
              background: selectedTag === w.icon ? `${w.color}20` : 'var(--glass-bg)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >{w.icon}</button>
        ))}
        {selectedTag && (
          <button onClick={() => setSelectedTag('')}
            style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
            {t.tag_remove}
          </button>
        )}
      </div>
      <textarea
        placeholder={t.counselor_note_ph}
        value={note}
        onChange={e => setNote(e.target.value)}
        style={{ width: '100%', minHeight: 60, resize: 'vertical', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 8, padding: '8px 10px', fontSize: '0.8rem', color: 'var(--text-primary)', fontFamily: 'inherit', boxSizing: 'border-box' }}
      />
      <button onClick={save} disabled={saving}
        style={{ marginTop: 8, padding: '7px 18px', borderRadius: 8, background: 'linear-gradient(135deg,#a78bfa,#6366f1)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', opacity: saving ? 0.6 : 1 }}>
        {saving ? '...' : t.tag_save}
      </button>
    </div>
  );
}

// ─── 학생 일기 탭 컴포넌트 ──────────────────────────────────────
function StudentDiaryTab({ t, lang }: { t: any; lang: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [diaryLoading, setDiaryLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/diaries/counselor/students`, { headers: getHeaders(false) });
        if (res.ok) setStudents(await res.json());
      } catch {}
    })();
  }, []);

  const loadDiaries = async (student: Student) => {
    setSelectedStudent(student);
    setDiaryLoading(true);
    setDiaries([]);
    setExpandedId(null);
    try {
      const res = await fetch(`${API}/diaries/counselor/student/${student.id}`, { headers: getHeaders(false) });
      if (res.ok) setDiaries(await res.json());
    } catch {}
    setDiaryLoading(false);
  };

  const handleTagSaved = (id: string, tag: string, note: string) => {
    setDiaries(prev => prev.map(d => d.id === id ? { ...d, weather_tag: tag, counselor_note: note } : d));
    showToast(t.tag_saved);
  };

  const filtered = students.filter(s => s.nickname.includes(search) || s.email.includes(search));

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* 좌측: 학생 목록 */}
      <div style={{ width: '32%', minWidth: 240, borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-layer1)' }}>
        <div style={{ padding: '12px', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-layer2)', flexShrink: 0 }}>
          <input
            type="text" placeholder={t.student_search} value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: '0.82rem', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: '0.85rem' }}>{t.no_students}</div>
          ) : filtered.map(s => (
            <div key={s.id} onClick={() => loadDiaries(s)}
              style={{
                padding: '12px 14px', borderRadius: 10, marginBottom: 6, cursor: 'pointer',
                background: selectedStudent?.id === s.id ? 'rgba(167,139,250,0.15)' : 'var(--glass-bg)',
                border: `1.5px solid ${selectedStudent?.id === s.id ? '#a78bfa' : 'var(--glass-border)'}`,
                transition: 'all 0.15s',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: selectedStudent?.id === s.id ? 'linear-gradient(135deg,#a78bfa,#6366f1)' : 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                  🎓
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.nickname}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.diary_count.replace('{n}', String(s.diary_count))}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 우측: 일기 목록 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selectedStudent ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: 12 }}>
            <div style={{ fontSize: '4rem' }}>📔</div>
            <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>{t.select_student}</p>
          </div>
        ) : (
          <>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-layer2)', flexShrink: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>🎓 {selectedStudent.nickname}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{selectedStudent.email} · {t.diary_count.replace('{n}', String(selectedStudent.diary_count))}</div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              {diaryLoading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>{t.diary_loading}</div>
              ) : diaries.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: '0.875rem' }}>{t.no_diaries}</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {diaries.map(d => {
                    const em = EMOTION_META[d.emotion] || { emoji: '😐', color: '#6B7280' };
                    const isExpanded = expandedId === d.id;
                    const wTag = WEATHER_TAGS.find(w => w.icon === d.weather_tag);
                    return (
                      <div key={d.id} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 14, padding: '16px', backdropFilter: 'blur(8px)' }}>
                        {/* 일기 헤더 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <div style={{ fontSize: '1.4rem' }}>{em.emoji}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                              <span style={{ background: `${em.color}18`, color: em.color, padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>{d.emotion}</span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.emotion_intensity}: {d.emotion_score}/5</span>
                              {d.weather_tag && (
                                <span title={(wTag?.label as any)?.[lang] || ''} style={{ fontSize: '1.2rem' }}>{d.weather_tag}</span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>
                              {new Date(d.created_at).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <button onClick={() => setExpandedId(isExpanded ? null : d.id)}
                            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--glass-border)', borderRadius: 8, padding: '5px 12px', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {isExpanded ? '▲ 접기' : '▼ 태그'}
                          </button>
                        </div>
                        {/* 일기 내용 */}
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0, maxHeight: isExpanded ? 'none' : 80, overflow: 'hidden', position: 'relative' }}>
                          {d.content}
                        </p>
                        {/* 상담사 메모 표시 */}
                        {d.counselor_note && !isExpanded && (
                          <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(167,139,250,0.08)', borderRadius: 8, fontSize: '0.75rem', color: '#a78bfa', borderLeft: '3px solid #a78bfa' }}>
                            📝 {d.counselor_note}
                          </div>
                        )}
                        {/* 확장: 날씨 태그 패널 */}
                        {isExpanded && (
                          <WeatherTagPanel diary={d} lang={lang} t={t} onSaved={handleTagSaved} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {toast && <div className="toast success" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>{toast}</div>}
    </div>
  );
}

export default function CounselorPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<'waiting' | 'active' | 'closed'>('active');
  const [pageTab, setPageTab] = useState<'counsel' | 'diary'>('counsel');
  const { lang, setLang } = useLangStore();
  const [showReport, setShowReport] = useState(false);
  const [reportSummary, setReportSummary] = useState('');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
  const [isOnline, setIsOnline] = useState(false);
  const [onlineLoading, setOnlineLoading] = useState(false);
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

  useEffect(() => {
    if (!isOnline) return;
    const beat = setInterval(async () => {
      try { await fetch(`${API}/counselors/me/heartbeat`, { method: 'POST', headers: getHeaders(false) }); } catch {}
    }, 30000);
    return () => clearInterval(beat);
  }, [isOnline]);

  const toggleOnline = async () => {
    setOnlineLoading(true);
    try {
      const endpoint = isOnline ? '/counselors/me/offline' : '/counselors/me/online';
      const res = await fetch(`${API}${endpoint}`, { method: 'POST', headers: getHeaders(false) });
      if (res.ok) {
        const data = await res.json();
        setIsOnline(data.is_online);
        showToast(data.is_online ? '🟢 온라인 상태로 변경됐습니다' : '⚫ 오프라인 상태로 변경됐습니다');
      }
    } catch {}
    setOnlineLoading(false);
  };

  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => loadSessionMessages(activeSession.id), 5000);
    return () => clearInterval(interval);
  }, [activeSession]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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
      const res = await fetch(`${API}/counsel/counselor/sessions/${sessionId}/assign`, { method: 'PATCH', headers: getHeaders(false) });
      if (res.ok) { showToast(t.assign_ok); await loadAllSessions(); setActiveSession(prev => prev ? { ...prev, status: 'active' } : null); }
    } catch {}
  };

  const sendReply = async () => {
    if (!reply.trim() || !activeSession) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/counsel/counselor/sessions/${activeSession.id}/reply`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify({ content: reply }),
      });
      if (res.ok) { setReply(''); await loadSessionMessages(activeSession.id); showToast(t.sent_ok); }
    } catch {}
    setLoading(false);
  };

  const closeSession = async () => {
    if (!activeSession || !confirm(t.confirm_close)) return;
    try {
      await fetch(`${API}/counsel/sessions/${activeSession.id}/close`, { method: 'PATCH', headers: getHeaders(false) });
      showToast(t.close_ok); setActiveSession(null); setMessages([]); await loadAllSessions();
    } catch {}
  };

  const submitReport = async () => {
    if (!activeSession || !reportSummary.trim()) return;
    try {
      const res = await fetch(`${API}/counsel/counselor/sessions/${activeSession.id}/report`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify({ summary: reportSummary, risk_level: riskLevel }),
      });
      if (res.ok) { showToast(t.report_ok); setShowReport(false); setReportSummary(''); setRiskLevel('low'); }
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
      <div style={{ background: 'var(--grad-sunset)', padding: '16px 24px', color: 'white', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(1px)' }} />
        <div style={{ fontSize: '2rem', position: 'relative', zIndex: 1 }}>👩‍💼</div>
        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.nickname || '상담사'}{t.welcome}</div>
          <div style={{ opacity: 0.85, fontSize: '0.8rem', marginTop: 2 }}>{t.subtitle} · 전체 {sessions.length}{t.sessions_count}</div>
        </div>
        <button onClick={loadAllSessions} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', padding: '7px 14px', borderRadius: 20, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, position: 'relative', zIndex: 1 }}>{t.refresh}</button>
        <button onClick={toggleOnline} disabled={onlineLoading} style={{ background: isOnline ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.15)', border: `1px solid ${isOnline ? 'rgba(74,222,128,0.6)' : 'rgba(255,255,255,0.3)'}`, color: 'white', padding: '7px 16px', borderRadius: 20, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: isOnline ? '#4ade80' : 'rgba(255,255,255,0.5)', display: 'inline-block', boxShadow: isOnline ? '0 0 6px #4ade80' : 'none' }} />
          {onlineLoading ? '...' : isOnline ? '온라인' : '오프라인'}
        </button>
      </div>

      {/* 페이지 탭 (상담관리 / 학생 일기) */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-layer2)', flexShrink: 0 }}>
        {(['counsel', 'diary'] as const).map(pt => (
          <button key={pt} onClick={() => setPageTab(pt)} style={{
            padding: '12px 24px', fontSize: '0.88rem', fontWeight: pageTab === pt ? 800 : 500,
            borderBottom: pageTab === pt ? '2.5px solid #a78bfa' : '2.5px solid transparent',
            color: pageTab === pt ? '#a78bfa' : 'var(--text-secondary)',
            background: 'transparent', cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {pt === 'counsel' ? t.tab_counsel : t.tab_diary}
          </button>
        ))}
      </div>

      {/* ─── 학생 일기 탭 ───────────────────────────────────────────── */}
      {pageTab === 'diary' && <StudentDiaryTab t={t} lang={lang} />}

      {/* ─── 상담 관리 탭 ───────────────────────────────────────────── */}
      {pageTab === 'counsel' && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* 왼쪽: 세션 목록 */}
          <div style={{ width: '35%', minWidth: 280, borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-layer1)' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-layer2)', flexShrink: 0 }}>
              {(['waiting', 'active', 'closed'] as const).map(tabKey => (
                <button key={tabKey} onClick={() => setTab(tabKey)} style={{
                  flex: 1, padding: '12px 8px', fontSize: '0.78rem', fontWeight: tab === tabKey ? 700 : 500,
                  borderBottom: tab === tabKey ? '2px solid var(--sunset-pink)' : '2px solid transparent',
                  color: tab === tabKey ? 'var(--sunset-pink)' : 'var(--text-secondary)',
                  background: 'transparent', cursor: 'pointer',
                }}>
                  {t[tabKey]} ({sessions.filter(s => {
                    if (tabKey === 'waiting') return s.status === 'waiting' || s.status === 'pending';
                    if (tabKey === 'active') return s.status === 'active';
                    return s.status === 'closed';
                  }).length})
                </button>
              ))}
            </div>
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
                      <div key={s.id} onClick={() => openSession(s)} className="glass-card-sm" style={{ padding: '14px 16px', marginBottom: 0, border: `2px solid ${isSelected ? 'var(--sunset-pink)' : 'var(--glass-border)'}`, cursor: 'pointer', background: isSelected ? 'rgba(255,45,120,0.06)' : 'var(--glass-bg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 8, color: 'var(--text-primary)' }}>{s.concern}</div>
                          <div style={{ background: badge.bg, color: badge.color, padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>{badge.text}</div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(s.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {(s.status === 'waiting' || s.status === 'pending') && isSelected && (
                          <button onClick={e => { e.stopPropagation(); assignSession(s.id); }} className="btn btn-sunset" style={{ marginTop: 10, width: '100%', fontSize: '0.8rem' }}>✅ {t.assign}</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 채팅 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'white' }}>
            {activeSession ? (
              <>
                <div style={{ background: 'linear-gradient(135deg, #20c997 0%, #0891b2 100%)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeSession.concern}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.85, color: 'white' }}>학생 익명 상담 · {statusBadge(activeSession.status).text}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {activeSession.status === 'active' && (
                      <>
                        <button onClick={() => setShowReport(true)} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', padding: '6px 12px', borderRadius: 20, fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>📋 {t.report_btn}</button>
                        <button onClick={closeSession} style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.5)', color: 'white', padding: '6px 12px', borderRadius: 20, fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>🔚 {t.end_counsel}</button>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#F8F9FA', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ textAlign: 'center', padding: '10px 20px', background: '#e8f8f4', borderRadius: 12, fontSize: '0.8rem', color: '#20c997', margin: '0 auto', maxWidth: 500 }}>{t.topic}: {activeSession.concern}</div>
                  {messages.map(msg => {
                    const isMe = msg.sender_role === 'counselor' || msg.sender_role === 'COUNSELOR';
                    return (
                      <div key={msg.id} style={{ display: 'flex', gap: 10, flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: isMe ? 'var(--grad-sunset)' : 'var(--glass-bg-hover)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>{isMe ? '👩‍💼' : '🙋'}</div>
                        <div style={{ maxWidth: '65%' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, textAlign: isMe ? 'right' : 'left', fontWeight: 600 }}>{isMe ? t.me_counselor : t.student_anon}</div>
                          <div style={{ padding: '11px 15px', borderRadius: isMe ? '18px 18px 4px 18px' : '4px 18px 18px 18px', background: isMe ? 'var(--grad-sunset)' : 'var(--glass-bg-hover)', color: isMe ? 'white' : 'var(--text-primary)', fontSize: '0.875rem', lineHeight: 1.65, boxShadow: isMe ? '0 4px 15px rgba(255,45,120,0.3)' : 'none', border: isMe ? 'none' : '1px solid var(--glass-border)', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 3, textAlign: isMe ? 'right' : 'left' }}>{new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                {activeSession.status === 'active' && (
                  <div style={{ background: 'var(--bg-layer2)', borderTop: '1px solid var(--glass-border)', padding: '14px 16px', display: 'flex', gap: 10, flexShrink: 0 }}>
                    <textarea className="form-textarea" style={{ flex: 1, minHeight: 60, resize: 'none' }} placeholder={t.type_reply} value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); sendReply(); } }} />
                    <button onClick={sendReply} disabled={loading || !reply.trim()} className="btn btn-sunset">{loading ? t.sending : t.send_reply}</button>
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
      )}

      {/* 상담 결과 보고서 모달 */}
      {showReport && (
        <div className="modal-overlay" onClick={() => setShowReport(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <span className="modal-title">📋 {t.report_title}</span>
              <button className="modal-close" onClick={() => setShowReport(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--bg-subtle)', borderRadius: 10, padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📋 {activeSession?.concern}</div>
              <div className="form-group">
                <label className="form-label">{t.report_summary}</label>
                <textarea className="form-textarea" rows={5} placeholder={t.report_summary_ph} value={reportSummary} onChange={e => setReportSummary(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.risk_level}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {([
                    { key: 'low', label: t.risk_low, color: '#16a34a', bg: 'rgba(22,163,74,0.12)' },
                    { key: 'medium', label: t.risk_medium, color: '#d97706', bg: 'rgba(217,119,6,0.12)' },
                    { key: 'high', label: t.risk_high, color: '#dc2626', bg: 'rgba(220,38,38,0.12)' },
                    { key: 'critical', label: t.risk_critical, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
                  ] as const).map(r => (
                    <button key={r.key} onClick={() => setRiskLevel(r.key)} style={{ padding: '8px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, border: `2px solid ${riskLevel === r.key ? r.color : 'var(--glass-border)'}`, background: riskLevel === r.key ? r.bg : 'var(--glass-bg)', color: riskLevel === r.key ? r.color : 'var(--text-secondary)', cursor: 'pointer' }}>{r.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn btn-glass btn-full" onClick={() => setShowReport(false)}>{t.cancel}</button>
                <button className="btn btn-sunset btn-full" onClick={submitReport} disabled={!reportSummary.trim()}>{t.submit_report}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast success">{toast}</div>}
    </div>
  );
}
