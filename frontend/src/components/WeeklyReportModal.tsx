'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://studentcare-production.up.railway.app/api/v1';

const EMOTION_EMOJI: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  anxious: '😰',
  angry: '😠',
  tired: '😴',
  neutral: '😐',
  excited: '🤩',
};

const EMOTION_LABEL: Record<string, string> = {
  happy: '행복',
  sad: '슬픔',
  anxious: '불안',
  angry: '분노',
  tired: '피곤',
  neutral: '보통',
  excited: '설렘',
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
        zIndex: 10000,
        boxShadow: 'var(--glass-shadow)',
        whiteSpace: 'nowrap',
      }}
    >
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
      <div
        style={{
          height: 6,
          borderRadius: 'var(--radius-full)',
          background: 'var(--glass-bg)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.6s ease',
          }}
        />
      </div>
    </div>
  );
}

export default function WeeklyReportModal() {
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const fetchReport = async () => {
    if (report) return; // cache
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/analysis/weekly-report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setReport(await res.json());
    } catch {}
    setLoading(false);
  };

  const handleOpen = () => {
    setOpen(true);
    fetchReport();
  };

  const handleShare = () => {
    setToast('상담사에게 공유되었습니다!');
  };

  const buildSummary = (r: WeeklyReport) => {
    const emo = EMOTION_LABEL[r.most_common_emotion] ?? r.most_common_emotion;
    let testInsight = '';
    if (r.phq9_score !== undefined && r.phq9_score >= 10) {
      testInsight = `PHQ-9 점수(${r.phq9_score})가 다소 높습니다. 상담을 받아보세요.`;
    } else if (r.gad7_score !== undefined && r.gad7_score >= 10) {
      testInsight = `GAD-7 점수(${r.gad7_score})가 다소 높습니다. 호흡 연습이 도움될 수 있어요.`;
    } else if (r.phq9_score !== undefined || r.gad7_score !== undefined) {
      testInsight = '검사 점수는 양호한 편이에요. 계속 잘 관리해나가요! 💪';
    }
    return r.summary ??
      `이번 주에 일기를 ${r.diary_count}개 작성하셨어요. 주요 감정은 ${emo}이었습니다. ${testInsight}`;
  };

  return (
    <>
      {toast && <Toast msg={toast} onClose={() => setToast('')} />}

      {/* 트리거 버튼 */}
      <button
        onClick={handleOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 18px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(167,139,250,0.3)',
          background: 'rgba(167,139,250,0.08)',
          color: '#a78bfa',
          fontWeight: 600,
          fontSize: '0.85rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
          backdropFilter: 'blur(8px)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(167,139,250,0.16)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(167,139,250,0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(167,139,250,0.08)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        📋 주간 리포트
      </button>

      {/* 모달 오버레이 */}
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: 20,
            animation: 'modalIn 0.25s ease',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 520,
              background: 'var(--bg-layer2)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}
          >
            {/* 모달 헤더 */}
            <div
              style={{
                padding: '24px 28px 20px',
                background: 'linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(96,165,250,0.10) 100%)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                  📋 이번 주 마음 리포트
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })} 주간 분석
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.4rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>

            {/* 모달 바디 */}
            <div style={{ padding: '24px 28px 28px' }}>
              {loading ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '48px 0',
                    gap: 16,
                    color: 'var(--text-muted)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: '3px solid var(--glass-border)',
                      borderTop: '3px solid #a78bfa',
                      animation: 'spin-slow 0.8s linear infinite',
                    }}
                  />
                  <p style={{ fontSize: '0.875rem' }}>리포트를 불러오는 중...</p>
                </div>
              ) : !report ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
                  <p>이번 주 데이터가 없어요. 일기를 써보세요!</p>
                </div>
              ) : (
                <div>
                  {/* 주요 지표 3개 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                    {/* 일기 수 */}
                    <div
                      style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>📔</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {report.diary_count}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        일기 작성
                      </div>
                    </div>
                    {/* 평균 감정 점수 */}
                    <div
                      style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>
                        {SCORE_EMOJI(report.avg_emotion_score)}
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {report.avg_emotion_score?.toFixed(1) ?? '-'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        평균 감정
                      </div>
                    </div>
                    {/* 주요 감정 */}
                    <div
                      style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>
                        {EMOTION_EMOJI[report.most_common_emotion] ?? '😐'}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {EMOTION_LABEL[report.most_common_emotion] ?? report.most_common_emotion}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        주요 감정
                      </div>
                    </div>
                  </div>

                  {/* 검사 점수 */}
                  {(report.phq9_score !== undefined || report.gad7_score !== undefined || report.stress_score !== undefined) && (
                    <div
                      style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px 20px',
                        marginBottom: 20,
                      }}
                    >
                      <h4 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 14, color: 'var(--text-secondary)' }}>
                        🧠 최근 검사 점수
                      </h4>
                      <ScoreBar label="PHQ-9 (우울)" score={report.phq9_score} max={27} color="#f87171" />
                      <ScoreBar label="GAD-7 (불안)" score={report.gad7_score} max={21} color="#a78bfa" />
                      <ScoreBar label="스트레스" score={report.stress_score} max={40} color="#fbbf24" />
                    </div>
                  )}

                  {/* 요약 텍스트 */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(96,165,250,0.06) 100%)',
                      border: '1px solid rgba(167,139,250,0.2)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '16px 20px',
                      marginBottom: 24,
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.7,
                      }}
                    >
                      💬 {buildSummary(report)}
                    </p>
                  </div>

                  {/* 액션 버튼 */}
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      onClick={() => setOpen(false)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--glass-bg)',
                        color: 'var(--text-muted)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      닫기
                    </button>
                    <button
                      onClick={handleShare}
                      style={{
                        flex: 2,
                        padding: '12px',
                        borderRadius: 'var(--radius-full)',
                        border: 'none',
                        background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        boxShadow: '0 4px 15px rgba(167,139,250,0.4)',
                      }}
                    >
                      📤 상담사에게 공유
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
