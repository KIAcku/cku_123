'use client';
import { useState, useEffect } from 'react';
import { useLangStore } from '@/store/langStore';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://studentcare-production.up.railway.app/api/v1';

// ─── 다국어 사전 ───────────────────────────────────────────────────
const i18n: Record<string, Record<string, any>> = {
  ko: {
    btn_open: '📋 주간 리포트',
    modal_title: '📋 이번 주 마음 리포트',
    modal_sub: '주간 분석',
    loading: '리포트를 불러오는 중...',
    no_data: '이번 주 데이터가 없어요. 일기를 써보세요!',
    label_diary: '일기 작성',
    label_avg_emotion: '평균 감정',
    label_dominant: '주요 감정',
    label_tests: '🧠 최근 검사 점수',
    label_phq9: 'PHQ-9 (우울)',
    label_gad7: 'GAD-7 (불안)',
    label_stress: '스트레스',
    share_toast: '상담사에게 공유되었습니다!',
    btn_close: '닫기',
    btn_share: '📤 상담사에게 공유',
    summary_week: (count: number, emo: string) => `이번 주에 일기를 ${count}개 작성하셨어요. 주요 감정은 ${emo}이었습니다.`,
    summary_phq9_high: (score: number) => `PHQ-9 점수(${score})가 다소 높습니다. 상담을 받아보세요.`,
    summary_gad7_high: (score: number) => `GAD-7 점수(${score})가 다소 높습니다. 호흡 연습이 도움될 수 있어요.`,
    summary_ok: '검사 점수는 양호한 편이에요. 계속 잘 관리해나가요! 💪',
    emotion_labels: { happy: '행복', sad: '슬픔', anxious: '불안', angry: '분노', tired: '피곤', neutral: '보통', excited: '설렘' },
    date_locale: 'ko-KR',
  },
  en: {
    btn_open: '📋 Weekly Report',
    modal_title: '📋 This Week\'s Mind Report',
    modal_sub: 'Weekly Analysis',
    loading: 'Loading report...',
    no_data: 'No data this week. Try writing a diary!',
    label_diary: 'Diaries Written',
    label_avg_emotion: 'Avg Emotion',
    label_dominant: 'Main Emotion',
    label_tests: '🧠 Recent Test Scores',
    label_phq9: 'PHQ-9 (Depression)',
    label_gad7: 'GAD-7 (Anxiety)',
    label_stress: 'Stress',
    share_toast: 'Shared with counselor!',
    btn_close: 'Close',
    btn_share: '📤 Share with Counselor',
    summary_week: (count: number, emo: string) => `You wrote ${count} diaries this week. The main emotion was ${emo}.`,
    summary_phq9_high: (score: number) => `Your PHQ-9 score (${score}) is somewhat high. Consider seeking counseling.`,
    summary_gad7_high: (score: number) => `Your GAD-7 score (${score}) is somewhat high. Breathing exercises may help.`,
    summary_ok: 'Your test scores look good. Keep taking care of yourself! 💪',
    emotion_labels: { happy: 'Happy', sad: 'Sad', anxious: 'Anxious', angry: 'Angry', tired: 'Tired', neutral: 'Neutral', excited: 'Excited' },
    date_locale: 'en-US',
  },
  ja: {
    btn_open: '📋 週間レポート',
    modal_title: '📋 今週のマインドレポート',
    modal_sub: '週間分析',
    loading: 'レポートを読み込み中...',
    no_data: '今週のデータがありません。日記を書いてみましょう！',
    label_diary: '日記作成',
    label_avg_emotion: '平均感情',
    label_dominant: '主な感情',
    label_tests: '🧠 最近の検査スコア',
    label_phq9: 'PHQ-9 (うつ)',
    label_gad7: 'GAD-7 (不安)',
    label_stress: 'ストレス',
    share_toast: 'カウンセラーに共有されました！',
    btn_close: '閉じる',
    btn_share: '📤 カウンセラーに共有',
    summary_week: (count: number, emo: string) => `今週は日記を${count}件書きました。主な感情は${emo}でした。`,
    summary_phq9_high: (score: number) => `PHQ-9スコア(${score})がやや高いです。カウンセリングを受けてみましょう。`,
    summary_gad7_high: (score: number) => `GAD-7スコア(${score})がやや高いです。呼吸練習が役立つかもしれません。`,
    summary_ok: '検査スコアは良好です。引き続き頑張りましょう！ 💪',
    emotion_labels: { happy: '嬉しい', sad: '悲しい', anxious: '不安', angry: '怒り', tired: '疲れた', neutral: '普通', excited: 'ワクワク' },
    date_locale: 'ja-JP',
  },
  zh: {
    btn_open: '📋 周报',
    modal_title: '📋 本周心理报告',
    modal_sub: '周度分析',
    loading: '正在加载报告...',
    no_data: '本周暂无数据，试着写日记吧！',
    label_diary: '日记数',
    label_avg_emotion: '平均情绪',
    label_dominant: '主要情绪',
    label_tests: '🧠 最近测试分数',
    label_phq9: 'PHQ-9 (抑郁)',
    label_gad7: 'GAD-7 (焦虑)',
    label_stress: '压力',
    share_toast: '已分享给咨询师！',
    btn_close: '关闭',
    btn_share: '📤 分享给咨询师',
    summary_week: (count: number, emo: string) => `本周您写了${count}篇日记，主要情绪是${emo}。`,
    summary_phq9_high: (score: number) => `您的PHQ-9分数(${score})偏高，建议寻求咨询。`,
    summary_gad7_high: (score: number) => `您的GAD-7分数(${score})偏高，呼吸练习可能有帮助。`,
    summary_ok: '测试分数良好，继续保持！ 💪',
    emotion_labels: { happy: '开心', sad: '悲伤', anxious: '焦虑', angry: '生气', tired: '疲惫', neutral: '一般', excited: '兴奋' },
    date_locale: 'zh-CN',
  },
};

const EMOTION_EMOJI: Record<string, string> = {
  happy: '😊', sad: '😢', anxious: '😰', angry: '😠', tired: '😴', neutral: '😐', excited: '🤩',
};

const SCORE_EMOJI = (score: number) => {
  if (score >= 4.5) return '😄';
  if (score >= 3.5) return '🙂';
  if (score >= 2.5) return '😐';
  if (score >= 1.5) return '😔';
  return '😢';
};

interface WeeklyReport {
  diary_count: number;
  avg_emotion_score: number;
  most_common_emotion: string;
  phq9_score?: number;
  gad7_score?: number;
  stress_score?: number;
  summary?: string;
}

// ── Toast ───────────────────────────────────────────
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: 'var(--success-bg)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 'var(--radius-full)', padding: '12px 24px', color: 'var(--success)', fontWeight: 600, fontSize: '0.875rem', zIndex: 10000, boxShadow: 'var(--glass-shadow)', whiteSpace: 'nowrap' }}>
      ✅ {msg}
    </div>
  );
}

// ── 스코어 미터 바 ─────────────────────────────────────────────
function ScoreBar({ label, score, max, color }: { label: string; score?: number; max: number; color: string }) {
  if (score === undefined) return null;
  const pct = Math.min((score / max) * 100, 100);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color }}>{score}</span>
      </div>
      <div style={{ height: 6, borderRadius: 'var(--radius-full)', background: 'var(--glass-bg)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 'var(--radius-full)', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

export default function WeeklyReportModal() {
  const { lang } = useLangStore();
  const t = i18n[lang] || i18n.ko;

  const [open, setOpen] = useState(false);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const fetchReport = async () => {
    if (report) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/analysis/weekly-report`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setReport(await res.json());
    } catch {}
    setLoading(false);
  };

  const handleOpen = () => { setOpen(true); fetchReport(); };
  const handleShare = () => setToast(t.share_toast);

  const buildSummary = (r: WeeklyReport) => {
    const emo = t.emotion_labels[r.most_common_emotion] ?? r.most_common_emotion;
    let testInsight = '';
    if (r.phq9_score !== undefined && r.phq9_score >= 10) {
      testInsight = t.summary_phq9_high(r.phq9_score);
    } else if (r.gad7_score !== undefined && r.gad7_score >= 10) {
      testInsight = t.summary_gad7_high(r.gad7_score);
    } else if (r.phq9_score !== undefined || r.gad7_score !== undefined) {
      testInsight = t.summary_ok;
    }
    return r.summary ?? `${t.summary_week(r.diary_count, emo)} ${testInsight}`;
  };

  return (
    <>
      {toast && <Toast msg={toast} onClose={() => setToast('')} />}

      {/* 트리거 버튼 */}
      <button
        onClick={handleOpen}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.08)', color: '#a78bfa', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(8px)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(167,139,250,0.16)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(167,139,250,0.25)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(167,139,250,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        {t.btn_open}
      </button>

      {/* 모달 오버레이 */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20, animation: 'modalIn 0.25s ease' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div style={{ width: '100%', maxWidth: 520, background: 'var(--bg-layer2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-2xl)', boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            {/* 모달 헤더 */}
            <div style={{ padding: '24px 28px 20px', background: 'linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(96,165,250,0.10) 100%)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 4 }}>{t.modal_title}</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date().toLocaleDateString(t.date_locale, { year: 'numeric', month: 'long' })} {t.modal_sub}
                </p>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: 'var(--text-muted)', lineHeight: 1, padding: 0 }}>×</button>
            </div>

            {/* 모달 바디 */}
            <div style={{ padding: '24px 28px 28px' }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: 16, color: 'var(--text-muted)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--glass-border)', borderTop: '3px solid #a78bfa', animation: 'spin-slow 0.8s linear infinite' }} />
                  <p style={{ fontSize: '0.875rem' }}>{t.loading}</p>
                </div>
              ) : !report ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
                  <p>{t.no_data}</p>
                </div>
              ) : (
                <div>
                  {/* 주요 지표 3개 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                    {/* 일기 수 */}
                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>📔</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{report.diary_count}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.label_diary}</div>
                    </div>
                    {/* 평균 감정 점수 */}
                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>{SCORE_EMOJI(report.avg_emotion_score)}</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{report.avg_emotion_score?.toFixed(1) ?? '-'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.label_avg_emotion}</div>
                    </div>
                    {/* 주요 감정 */}
                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>{EMOTION_EMOJI[report.most_common_emotion] ?? '😐'}</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {t.emotion_labels[report.most_common_emotion] ?? report.most_common_emotion}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.label_dominant}</div>
                    </div>
                  </div>

                  {/* 검사 점수 */}
                  {(report.phq9_score !== undefined || report.gad7_score !== undefined || report.stress_score !== undefined) && (
                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 20 }}>
                      <h4 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 14, color: 'var(--text-secondary)' }}>{t.label_tests}</h4>
                      <ScoreBar label={t.label_phq9} score={report.phq9_score} max={27} color="#f87171" />
                      <ScoreBar label={t.label_gad7} score={report.gad7_score} max={21} color="#a78bfa" />
                      <ScoreBar label={t.label_stress} score={report.stress_score} max={40} color="#fbbf24" />
                    </div>
                  )}

                  {/* 요약 텍스트 */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(96,165,250,0.06) 100%)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 24 }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                      💬 {buildSummary(report)}
                    </p>
                  </div>

                  {/* 액션 버튼 */}
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => setOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                      {t.btn_close}
                    </button>
                    <button onClick={handleShare} style={{ flex: 2, padding: '12px', borderRadius: 'var(--radius-full)', border: 'none', background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', boxShadow: '0 4px 15px rgba(167,139,250,0.4)' }}>
                      {t.btn_share}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
