'use client';
import { useState, useEffect } from 'react';
import { useLangStore } from '@/store/langStore';
import { API_BASE } from '@/lib/apiClient';

// ─── 다국어 번역 사전 ──────────────────────────────────────────────
const i18n: Record<string, any> = {
  ko: {
    hero_title: '📔 감정 일기',
    hero_sub: '오늘의 감정을 솔직하게 기록하고 마음을 돌봐보세요.',
    tab_write: '✏️ 오늘 일기 쓰기',
    tab_list: '📋 내 일기 목록 ({count})',
    tab_calendar: '📅 감정 캘린더',
    write_title: '오늘의 감정 기록',
    question_feel: '지금 기분은 어때요?',
    feel_happy: '행복해요', feel_sad: '슬퍼요', feel_angry: '화가나요', feel_anxious: '불안해요', feel_neutral: '보통이에요', feel_tired: '피곤해요',
    emotion_intensity: '감정 강도',
    intensity_weak: '아주 약함', intensity_normal: '보통', intensity_strong: '매우 강함',
    content_label: '오늘 있었던 일을 자유롭게 적어보세요',
    placeholder_text: '오늘 어떤 일이 있었나요? 생각과 감정을 솔직하게 써보세요...',
    char_count: '{count}자',
    save_btn: '📔 일기 저장하기',
    saving: '저장 중...',
    empty_fetching: '불러오는 중...',
    empty_title: '아직 작성된 일기가 없어요',
    empty_btn: '첫 일기 쓰기',
    date_group_format: 'ko-KR',
    intensity_badge: '강도 {score}/5',
    edited_badge: '수정됨',
    delete_confirm: '일기를 삭제할까요?',
    edit_modal_title: '일기 수정',
    cancel: '취소',
    save: '저장',
    month_emotions_title: '이번 달 주요 감정',
    times: '{count}회',
    cal_weeks: ['일', '월', '화', '수', '목', '금', '토'],
    cal_title: '{year}년 {month}월'
  },
  en: {
    hero_title: '📔 Emotion Diary',
    hero_sub: 'Honestly record your emotions today and take care of your mind.',
    tab_write: "✏️ Write Today's Diary",
    tab_list: '📋 My Diaries ({count})',
    tab_calendar: '📅 Emotion Calendar',
    write_title: "Today's Emotion Record",
    question_feel: 'How do you feel right now?',
    feel_happy: 'Happy', feel_sad: 'Sad', feel_angry: 'Angry', feel_anxious: 'Anxious', feel_neutral: 'Neutral', feel_tired: 'Tired',
    emotion_intensity: 'Emotion Intensity',
    intensity_weak: 'Very Weak', intensity_normal: 'Normal', intensity_strong: 'Very Strong',
    content_label: 'Write freely about what happened today',
    placeholder_text: 'What happened today? Write down your thoughts and feelings honestly...',
    char_count: '{count} chars',
    save_btn: '📔 Save Diary',
    saving: 'Saving...',
    empty_fetching: 'Loading...',
    empty_title: 'No diaries written yet.',
    empty_btn: 'Write First Diary',
    date_group_format: 'en-US',
    intensity_badge: 'Intensity {score}/5',
    edited_badge: 'Edited',
    delete_confirm: 'Do you want to delete this diary?',
    edit_modal_title: 'Edit Diary',
    cancel: 'Cancel',
    save: 'Save',
    month_emotions_title: 'Top Emotions This Month',
    times: '{count} times',
    cal_weeks: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    cal_title: '{month}/{year}'
  },
  ja: {
    hero_title: '📔 感情日記',
    hero_sub: '今日の感情を素直に記録し、心をケアしましょう。',
    tab_write: '✏️ 今日の日記を書く',
    tab_list: '📋 日記リスト ({count})',
    tab_calendar: '📅 感情カレンダー',
    write_title: '今日の感情記録',
    question_feel: '今の気分はどうですか？',
    feel_happy: '幸せ', feel_sad: '悲しい', feel_angry: '怒り', feel_anxious: '不安', feel_neutral: '普通', feel_tired: '疲れた',
    emotion_intensity: '感情の強さ',
    intensity_weak: 'とても弱い', intensity_normal: '普通', intensity_strong: 'とても強い',
    content_label: '今日あった出来事を自由に書いてみてください',
    placeholder_text: '今日どんなことがありましたか？考えや感情を素直に書いてみてください...',
    char_count: '{count}文字',
    save_btn: '📔 日記を保存する',
    saving: '保存中...',
    empty_fetching: '読み込み中...',
    empty_title: 'まだ書かれた日記がありません',
    empty_btn: '最初の日記を書く',
    date_group_format: 'ja-JP',
    intensity_badge: '強さ {score}/5',
    edited_badge: '修正済み',
    delete_confirm: '日記を削除しますか？',
    edit_modal_title: '日記を修正',
    cancel: 'キャンセル',
    save: '保存',
    month_emotions_title: '今月の主な感情',
    times: '{count}回',
    cal_weeks: ['日', '月', '火', '水', '木', '金', '土'],
    cal_title: '{year}년 {month}월'
  },
  zh: {
    hero_title: '📔 情绪日记',
    hero_sub: '真实地记录下你今天的感受，好好照顾你的心灵。',
    tab_write: '✏️ 写今日日记',
    tab_list: '📋 我的日记列表 ({count})',
    tab_calendar: '📅 情绪日历',
    write_title: '今日情绪记录',
    question_feel: '你现在的感受如何？',
    feel_happy: '开心', feel_sad: '悲伤', feel_angry: '生气', feel_anxious: '焦虑', feel_neutral: '一般', feel_tired: '疲惫',
    emotion_intensity: '情绪强度',
    intensity_weak: '非常弱', intensity_normal: '适中', intensity_strong: '非常强',
    content_label: '自由地写下今天发生的事情吧',
    placeholder_text: '今天发生了什么？真实地写下你的想法和感受吧...',
    char_count: '{count}字',
    save_btn: '📔 保存日记',
    saving: '保存中...',
    empty_fetching: '加载中...',
    empty_title: '还没有写过日记',
    empty_btn: '写第一篇日记',
    date_group_format: 'zh-CN',
    intensity_badge: '强度 {score}/5',
    edited_badge: '已修改',
    delete_confirm: '要删除这篇日记吗？',
    edit_modal_title: '修改日记',
    cancel: '取消',
    save: '保存',
    month_emotions_title: '本月主要情绪',
    times: '{count}次',
    cal_weeks: ['日', '一', '二', '三', '四', '五', '六'],
    cal_title: '{year}年 {month}월'
  }
};

// ─── 디자인 및 이모지 메타 데이터 ──────────────────────────────────
const EMOTION_META = [
  { value: 'happy', emoji: '😊', color: '#F59E0B' },
  { value: 'sad', emoji: '😢', color: '#3B82F6' },
  { value: 'angry', emoji: '😠', color: '#EF4444' },
  { value: 'anxious', emoji: '😰', color: '#8B5CF6' },
  { value: 'neutral', emoji: '😐', color: '#6B7280' },
  { value: 'tired', emoji: '😴', color: '#EC4899' },
];

type Diary = { id: string; content: string; emotion: string; emotion_score: string; created_at: string; updated_at?: string };

function groupByDate(diaries: Diary[], dateLocale: string) {
  const groups: Record<string, Diary[]> = {};
  diaries.forEach(d => {
    const date = new Date(d.created_at).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(d);
  });
  return groups;
}

export default function DiaryPage() {
  const { lang } = useLangStore();
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [emotion, setEmotion] = useState('neutral');
  const [score, setScore] = useState(3);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState('');
  const [editTarget, setEditTarget] = useState<Diary | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'list' | 'calendar'>('write');
  const [calendarData, setCalendarData] = useState<{ date: string; emotion: string }[]>([]);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);



  const t = i18n[lang] || i18n.ko;

  const emotions = EMOTION_META.map(e => {
    const labelMap: Record<string, string> = {
      happy: t.feel_happy, sad: t.feel_sad, angry: t.feel_angry,
      anxious: t.feel_anxious, neutral: t.feel_neutral, tired: t.feel_tired
    };
    return {
      ...e,
      label: labelMap[e.value] || e.value
    };
  });

  const token = () => localStorage.getItem('token') || '';
  const headers = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

  const fetchDiaries = async () => {
    setFetching(true);
    const res = await fetch(`${API_BASE}/diaries`, { headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) setDiaries(await res.json());
    setFetching(false);
  };

  useEffect(() => { fetchDiaries(); }, []);

  const fetchCalendar = async (year: number, month: number) => {
    try {
      const res = await fetch(`${API_BASE}/diaries/calendar?year=${year}&month=${month}`, { headers: { Authorization: `Bearer ${token()}` } });
      if (res.ok) setCalendarData(await res.json());
    } catch {}
  };

  useEffect(() => {
    if (activeTab === 'calendar') fetchCalendar(calYear, calMonth);
  }, [activeTab, calYear, calMonth]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSubmit = async () => {
    if (!content.trim()) { showToast(lang === 'ko' ? '내용을 입력해주세요' : 'Please enter content'); return; }
    setLoading(true);
    const res = await fetch(`${API_BASE}/diaries`, {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ content, emotion, emotion_score: String(score) }),
    });
    if (res.ok) {
      setContent(''); setEmotion('neutral'); setScore(3);
      await fetchDiaries();
      showToast(lang === 'ko' ? '일기가 저장되었습니다 📔' : 'Diary saved successfully 📔');
      setActiveTab('list');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.delete_confirm)) return;
    await fetch(`${API_BASE}/diaries/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    await fetchDiaries();
    showToast(lang === 'ko' ? '삭제되었습니다' : 'Deleted successfully');
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
    showToast(lang === 'ko' ? '수정되었습니다 ✏️' : 'Updated successfully ✏️');
    setLoading(false);
  };

  const grouped = groupByDate(diaries, t.date_group_format);
  const selectedEmotion = emotions.find(e => e.value === emotion);

  return (
    <div className="page-content">
      <div className="page-header">
        <h2 className="page-title">{t.hero_title}</h2>
        <p className="page-subtitle">{t.hero_sub}</p>
      </div>

      {/* 탭 */}
      <div className="tabs-glass" style={{ marginBottom: 24, maxWidth: 600 }}>
        <button className={`tab-glass ${activeTab === 'write' ? 'active' : ''}`} onClick={() => setActiveTab('write')}>{t.tab_write}</button>
        <button className={`tab-glass ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>{t.tab_list.replace('{count}', String(diaries.length))}</button>
        <button className={`tab-glass ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>{t.tab_calendar}</button>
      </div>

      {activeTab === 'write' && (
        <div className="glass-card" style={{ maxWidth: 680, padding: 32 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>{t.write_title}</h3>

          {/* 감정 선택 */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">{t.question_feel}</label>
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
              {t.emotion_intensity}: <span style={{ color: selectedEmotion?.color, fontWeight: 700 }}>{score} / 5</span>
            </label>
            <input type="range" className="range-slider" min={1} max={5} value={score}
              onChange={e => setScore(Number(e.target.value))} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              <span>{t.intensity_weak}</span><span>{t.intensity_normal}</span><span>{t.intensity_strong}</span>
            </div>
          </div>

          {/* 내용 입력 */}
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">{t.content_label}</label>
            <textarea className="form-textarea" rows={6}
              placeholder={`${selectedEmotion?.emoji || '😐'} ${t.placeholder_text}`}
              value={content} onChange={e => setContent(e.target.value)} style={{ minHeight: 160 }} />
            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {t.char_count.replace('{count}', String(content.length))}
            </div>
          </div>

          <button className="btn btn-sunset btn-lg btn-full" onClick={handleSubmit} disabled={loading}>
            {loading ? t.saving : t.save_btn}
          </button>
        </div>
      )}

      {activeTab === 'list' && (
        <div>
          {fetching ? (
            <div className="empty-state"><div className="empty-icon">⏳</div><p>{t.empty_fetching}</p></div>
          ) : diaries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📔</div>
              <p>{t.empty_title}</p>
              <button className="btn btn-sunset" onClick={() => setActiveTab('write')}>{t.empty_btn}</button>
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
                        <div key={d.id} className="glass-card-sm" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px', marginBottom: 0 }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 'var(--radius-md)',
                            background: `${em?.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.4rem', flexShrink: 0
                          }}>{em?.emoji || '😐'}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                              <span className="badge" style={{ background: `${em?.color}18`, color: em?.color, fontWeight: 600 }}>{em?.label || d.emotion}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.intensity_badge.replace('{score}', d.emotion_score)}</span>
                              {d.updated_at && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.edited_badge}</span>}
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{d.content}</p>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button className="btn btn-glass btn-sm" onClick={() => { setEditTarget(d); setShowModal(true); }}>✏️</button>
                            <button className="btn btn-danger-glass btn-sm" onClick={() => handleDelete(d.id)}>🗑️</button>
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
              <span className="modal-title">{t.edit_modal_title}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">{t.question_feel}</label>
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
                <label className="form-label">{t.content_label}</label>
                <textarea className="form-textarea" rows={5} value={editTarget.content}
                  onChange={e => setEditTarget({ ...editTarget, content: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-glass btn-full" onClick={() => setShowModal(false)}>{t.cancel}</button>
                <button className="btn btn-sunset btn-full" onClick={handleUpdate} disabled={loading}>{t.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 감정 캘린더 탭 */}
      {activeTab === 'calendar' && (() => {
        const emotionEmoji: Record<string, string> = {
          happy: '😊', sad: '😢', angry: '😠', anxious: '😰', neutral: '😐',
          tired: '😴', excited: '🤩', grateful: '🥰', lonely: '😔', hopeful: '🌟'
        };
        const emotionColor: Record<string, string> = {
          happy: '#fef08a', sad: '#bfdbfe', angry: '#fecaca', anxious: '#fde68a',
          neutral: '#e5e7eb', tired: '#d1d5db', excited: '#fbcfe8', grateful: '#bbf7d0',
          lonely: '#c7d2fe', hopeful: '#fed7aa'
        };
        const calMap: Record<string, string> = {};
        calendarData.forEach(e => { calMap[e.date] = e.emotion; });
        const firstDay = new Date(calYear, calMonth - 1, 1).getDay();
        const daysInMonth = new Date(calYear, calMonth, 0).getDate();
        const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

        // Top emotions this month
        const emotionCount: Record<string, number> = {};
        calendarData.forEach(e => { emotionCount[e.emotion] = (emotionCount[e.emotion] || 0) + 1; });
        const topEmotions = Object.entries(emotionCount).sort((a, b) => b[1] - a[1]).slice(0, 3);

        return (
          <div>
            {/* 월 네비게이션 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <button onClick={() => { if (calMonth === 1) { setCalYear(y => y - 1); setCalMonth(12); } else setCalMonth(m => m - 1); }}
                style={{ background: 'var(--bg-subtle)', border: 'none', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontSize: '1rem' }}>←</button>
              <h3 style={{ fontWeight: 700, fontSize: '1.2rem' }}>
                {t.cal_title.replace('{year}', String(calYear)).replace('{month}', String(calMonth))}
              </h3>
              <button onClick={() => { if (calMonth === 12) { setCalYear(y => y + 1); setCalMonth(1); } else setCalMonth(m => m + 1); }}
                style={{ background: 'var(--bg-subtle)', border: 'none', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontSize: '1rem' }}>→</button>
            </div>

            {/* 이번 달 감정 통계 */}
            {topEmotions.length > 0 && (
              <div className="glass-card-sm" style={{ padding: '16px 20px', marginBottom: 20 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>{t.month_emotions_title}</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {topEmotions.map(([emotion, count]) => (
                    <div key={emotion} style={{ display: 'flex', alignItems: 'center', gap: 6, background: emotionColor[emotion] || '#e5e7eb', borderRadius: 20, padding: '6px 14px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{emotionEmoji[emotion] || '😐'}</span>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.times.replace('{count}', String(count))}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 캘린더 그리드 */}
            <div className="glass-card-sm" style={{ padding: 20 }}>
              {/* 요일 헤더 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                {t.cal_weeks.map((w: string, i: number) => (
                  <div key={w} style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: i === 0 ? '#ef4444' : i === 6 ? '#3b82f6' : 'var(--text-muted)', padding: '6px 0' }}>{w}</div>
                ))}
              </div>
              {/* 날짜 셀 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {cells.map((day, idx) => {
                  if (day === null) return <div key={`empty-${idx}`} />;
                  const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const emotion = calMap[dateStr];
                  const isToday = dateStr === new Date().toISOString().slice(0, 10);
                  return (
                    <div key={dateStr} style={{
                      aspectRatio: '1', borderRadius: 10, padding: 4,
                      background: emotion ? emotionColor[emotion] : 'var(--bg-subtle)',
                      border: isToday ? '2px solid var(--primary)' : '2px solid transparent',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s', cursor: emotion ? 'pointer' : 'default',
                    }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: isToday ? 800 : 500, color: isToday ? 'var(--primary)' : 'var(--text-secondary)' }}>{day}</div>
                      {emotion && <div style={{ fontSize: '1.1rem', lineHeight: 1 }}>{emotionEmoji[emotion] || '😐'}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {toast && <div className={`toast success`}>{toast}</div>}
    </div>
  );
}
