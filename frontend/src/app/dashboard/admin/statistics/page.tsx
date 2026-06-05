'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLangStore } from '@/store/langStore';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://studentcare-production.up.railway.app/api/v1';

const i18n: Record<string, Record<string, string>> = {
  ko: {
    title: '통계 대시보드', subtitle: '학생 케어 플랫폼 현황을 한눈에 확인합니다.',
    total_reports: '전체 신고', monthly_reports: '이번 달 신고',
    total_students: '전체 학생', active_sessions: '활성 상담 세션', active_alerts: '활성 경고',
    category_dist: '카테고리별 분포', emotion_dist: '감정 분포 (최근 7일)',
    monthly_compare: '월별 비교', this_month: '이번 달', last_month: '지난 달',
    loading: '통계를 불러오는 중...', change: '변화',
    bullying: '학교폭력', discrimination: '차별', harassment: '괴롭힘', other: '기타',
    increase: '증가', decrease: '감소', same: '변화 없음',
    at_risk: '🚨 관심 필요 학생', at_risk_desc: '최근 7일간 부정적 감정을 3회 이상 기록한 학생입니다.',
    risk_high: '고위험', risk_medium: '관심',
    negative_count: '회 부정 감정',
    weekly_trend: '주간 감정 트렌드',
    no_at_risk: '현재 특별히 관심이 필요한 학생이 없습니다 🎉',
    total_sessions: '전체 상담',
  },
  en: {
    title: 'Statistics Dashboard', subtitle: 'Get an overview of the Student Care Platform.',
    total_reports: 'Total Reports', monthly_reports: 'Monthly Reports',
    total_students: 'Students', active_sessions: 'Active Sessions', active_alerts: 'Alerts',
    category_dist: 'Category Distribution', emotion_dist: 'Emotion Distribution (Last 7 Days)',
    monthly_compare: 'Monthly Comparison', this_month: 'This Month', last_month: 'Last Month',
    loading: 'Loading statistics...', change: 'Change',
    bullying: 'Bullying', discrimination: 'Discrimination', harassment: 'Harassment', other: 'Other',
    increase: 'Increase', decrease: 'Decrease', same: 'No Change',
    at_risk: '🚨 At-Risk Students', at_risk_desc: 'Students who recorded 3+ negative emotions in the last 7 days.',
    risk_high: 'High Risk', risk_medium: 'Watch',
    negative_count: ' negative emotions',
    weekly_trend: 'Weekly Emotion Trend',
    no_at_risk: 'No students need special attention right now 🎉',
    total_sessions: 'Total Sessions',
  },
  ja: {
    title: '統計ダッシュボード', subtitle: '学生ケアプラットフォームの状況を一目で確認できます。',
    total_reports: '総報告数', monthly_reports: '今月の報告数',
    total_students: '全学生数', active_sessions: 'アクティブセッション', active_alerts: 'アクティブアラート',
    category_dist: 'カテゴリ別分布', emotion_dist: '感情分布（直近7日）',
    monthly_compare: '月別比較', this_month: '今月', last_month: '先月',
    loading: '統計を読み込み中...', change: '変化',
    bullying: 'いじめ', discrimination: '差別', harassment: '嫌がらせ', other: 'その他',
    increase: '増加', decrease: '減少', same: '変化なし',
    at_risk: '🚨 注意が必要な学生', at_risk_desc: '直近7日間でネガティブ感情を3回以上記録した学生です。',
    risk_high: '高リスク', risk_medium: '注意',
    negative_count: ' 回ネガティブ感情',
    weekly_trend: '週次感情トレンド',
    no_at_risk: '現在特別な注意が必要な学生はいません 🎉',
    total_sessions: '総相談数',
  },
  zh: {
    title: '统计仪表板', subtitle: '一目了然地查看学生关怀平台的现状。',
    total_reports: '总举报数', monthly_reports: '本月举报数',
    total_students: '学生总数', active_sessions: '活跃咨询', active_alerts: '活跃警告',
    category_dist: '类别分布', emotion_dist: '情绪分布（近7天）',
    monthly_compare: '月度比较', this_month: '本月', last_month: '上月',
    loading: '正在加载统计数据...', change: '变化',
    bullying: '校园暴力', discrimination: '歧视', harassment: '骚扰', other: '其他',
    increase: '增加', decrease: '减少', same: '无变化',
    at_risk: '🚨 需要关注的学生', at_risk_desc: '近7天记录了3次以上负面情绪的学生。',
    risk_high: '高风险', risk_medium: '关注',
    negative_count: ' 次负面情绪',
    weekly_trend: '每周情绪趋势',
    no_at_risk: '目前没有需要特别关注的学生 🎉',
    total_sessions: '总咨询数',
  },
};

interface AtRiskStudent {
  id: string;
  nickname: string;
  negative_count: number;
  dominant_emotion: string;
  risk_level: 'high' | 'medium';
}

interface Statistics {
  total_reports?: number;
  this_month_reports?: number;
  prev_month_reports?: number;
  total_students?: number;
  total_sessions?: number;
  this_month_sessions?: number;
  active_alerts?: number;
  category_distribution?: { category: string; count: number }[];
  emotion_distribution?: { emotion: string; count: number }[];
  weekly_trend?: { week: string; [key: string]: string | number }[];
}

const categoryGradients: Record<string, string> = {
  bullying:       'linear-gradient(90deg, #EF4444, #F87171)',
  discrimination: 'linear-gradient(90deg, #F97316, #FB923C)',
  harassment:     'linear-gradient(90deg, #8B5CF6, #A78BFA)',
  other:          'linear-gradient(90deg, #6B7280, #9CA3AF)',
};

const emotionEmoji: Record<string, string> = {
  happy: '😊', sad: '😢', angry: '😤', anxious: '😰', neutral: '😐',
  tired: '😔', excited: '🤩', scared: '😨',
  // 한국어 감정명도 매핑
  '행복': '😊', '슬픔': '😢', '분노': '😤', '불안': '😰', '평온': '😐',
  '피로': '😔', '설렘': '🤩', '두려움': '😨',
};

const NEGATIVE_EMOTIONS = ['sad', 'angry', 'anxious', 'tired', '슬픔', '분노', '불안', '피로'];

export default function StatisticsPage() {
  const router = useRouter();
  const { lang, setLang } = useLangStore();
  const [stats, setStats] = useState<Statistics>({});
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [animated, setAnimated] = useState(false);

  const t = i18n[lang] || i18n.ko;

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/dashboard'); return; }
    const user = JSON.parse(u);
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      router.push('/dashboard'); return;
    }
    const savedLang = localStorage.getItem('lang') || 'ko';
    setLang(savedLang);
    fetchStats();
    fetchAtRisk();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/statistics/overview`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
      // 목업 데이터
      setStats({
        total_reports: 142, this_month_reports: 23, prev_month_reports: 18,
        total_students: 580, total_sessions: 67, this_month_sessions: 12,
        active_alerts: 3,
        category_distribution: [
          { category: 'bullying', count: 58 },
          { category: 'harassment', count: 41 },
          { category: 'discrimination', count: 27 },
          { category: 'other', count: 16 },
        ],
        emotion_distribution: [
          { emotion: 'sad', count: 120 },
          { emotion: 'anxious', count: 95 },
          { emotion: 'angry', count: 78 },
          { emotion: 'tired', count: 64 },
          { emotion: 'happy', count: 43 },
          { emotion: 'neutral', count: 31 },
        ],
        weekly_trend: [
          { week: '이번 주', sad: 18, anxious: 14, happy: 8 },
          { week: '1주 전', sad: 22, anxious: 16, happy: 6 },
          { week: '2주 전', sad: 15, anxious: 12, happy: 10 },
          { week: '3주 전', sad: 25, anxious: 18, happy: 5 },
        ],
      });
    } finally {
      setLoading(false);
      setTimeout(() => setAnimated(true), 100);
    }
  };

  const fetchAtRisk = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/statistics/at-risk-students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAtRiskStudents(await res.json());
      }
    } catch {
      // 목업
      setAtRiskStudents([
        { id: '1', nickname: '익명학생A', negative_count: 6, dominant_emotion: 'sad', risk_level: 'high' },
        { id: '2', nickname: '익명학생B', negative_count: 4, dominant_emotion: 'anxious', risk_level: 'medium' },
        { id: '3', nickname: '익명학생C', negative_count: 3, dominant_emotion: 'angry', risk_level: 'medium' },
      ]);
    }
  };

  const categoryData = stats.category_distribution || [];
  const maxCatCount = Math.max(...categoryData.map(d => d.count), 1);
  const emotionData = stats.emotion_distribution || [];
  const weeklyData = stats.weekly_trend || [];
  const monthDiff = (stats.this_month_reports ?? 0) - (stats.prev_month_reports ?? 0);

  const statCards = [
    { label: t.total_reports,    value: stats.total_reports ?? '-',    icon: '📋', color: '#5B5FEF', bg: 'linear-gradient(135deg, #EEF0FF, #E0E2FF)' },
    { label: t.monthly_reports,  value: stats.this_month_reports ?? '-',  icon: '📅', color: '#D97706', bg: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)' },
    { label: t.total_students,   value: stats.total_students ?? '-',   icon: '🎓', color: '#059669', bg: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' },
    { label: t.total_sessions,   value: stats.total_sessions ?? '-',   icon: '💬', color: '#2563EB', bg: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' },
    { label: t.active_alerts,    value: stats.active_alerts ?? '-',    icon: '🚨', color: '#EF4444', bg: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)' },
  ];

  const allEmotions = Array.from(new Set(weeklyData.flatMap(w => Object.keys(w).filter(k => k !== 'week'))));
  const weeklyMaxVal = Math.max(
    ...weeklyData.flatMap(w => allEmotions.map(e => Number(w[e] || 0))),
    1
  );

  const emotionColor: Record<string, string> = {
    sad: '#60a5fa', anxious: '#f472b6', angry: '#f87171', tired: '#94a3b8',
    happy: '#4ade80', neutral: '#a3e635', excited: '#fb923c',
    '슬픔': '#60a5fa', '불안': '#f472b6', '분노': '#f87171', '피로': '#94a3b8',
    '행복': '#4ade80', '평온': '#a3e635',
  };

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>📊</div>
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
        borderRadius: 'var(--radius-xl)', padding: '32px 36px',
        marginBottom: 28, color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 200, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: '1.8rem' }}>📊</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{t.title}</h1>
          </div>
          <p style={{ opacity: 0.85, fontSize: '0.9rem' }}>{t.subtitle}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            background: card.bg, borderRadius: 'var(--radius-lg)',
            padding: '20px', border: '1px solid transparent',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 6, fontWeight: 600 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* 🚨 위험 학생 섹션 */}
      <div className="glass-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{t.at_risk}</h3>
          {atRiskStudents.length > 0 && (
            <span style={{
              background: '#FEF2F2', color: '#EF4444', borderRadius: 999,
              padding: '2px 10px', fontSize: '0.72rem', fontWeight: 800, border: '1px solid #FCA5A5'
            }}>
              {atRiskStudents.length}명
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>{t.at_risk_desc}</p>
        {atRiskStudents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            {t.no_at_risk}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {atRiskStudents.map(s => (
              <div key={s.id} style={{
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                background: s.risk_level === 'high' ? 'rgba(239,68,68,0.06)' : 'rgba(251,146,60,0.06)',
                border: `1.5px solid ${s.risk_level === 'high' ? 'rgba(239,68,68,0.25)' : 'rgba(251,146,60,0.25)'}`,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: s.risk_level === 'high' ? 'rgba(239,68,68,0.15)' : 'rgba(251,146,60,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem', flexShrink: 0,
                }}>
                  {emotionEmoji[s.dominant_emotion] || '😔'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 700, fontSize: '0.85rem',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginBottom: 3,
                  }}>
                    {s.nickname}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      background: s.risk_level === 'high' ? '#FEF2F2' : '#FFF7ED',
                      color: s.risk_level === 'high' ? '#EF4444' : '#F97316',
                      borderRadius: 999, padding: '1px 7px',
                      fontSize: '0.65rem', fontWeight: 800,
                    }}>
                      {s.risk_level === 'high' ? t.risk_high : t.risk_medium}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {s.negative_count}{t.negative_count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Category Distribution */}
        <div className="glass-card">
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📊</span> {t.category_dist}
          </h3>
          {categoryData.map(item => (
            <div key={item.category} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {t[item.category as keyof typeof t] || item.category}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{item.count}</span>
              </div>
              <div style={{ background: 'var(--bg-subtle)', borderRadius: 999, height: 10, overflow: 'hidden' }}>
                <div style={{
                  background: categoryGradients[item.category] || 'var(--primary)',
                  width: animated ? `${(item.count / maxCatCount) * 100}%` : '0%',
                  height: '100%', borderRadius: 999,
                  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }} />
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {Math.round((item.count / (stats.total_reports || 1)) * 100)}%
              </div>
            </div>
          ))}
        </div>

        {/* Emotion Distribution */}
        <div className="glass-card">
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>😊</span> {t.emotion_dist}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {emotionData.map(item => {
              const maxEmotionCount = Math.max(...emotionData.map(e => e.count), 1);
              const pct = Math.round((item.count / maxEmotionCount) * 100);
              const isNegative = NEGATIVE_EMOTIONS.includes(item.emotion);
              return (
                <div key={item.emotion} style={{
                  textAlign: 'center', padding: '16px 8px',
                  borderRadius: 'var(--radius-md)', border: `1.5px solid ${isNegative ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
                  transition: 'all 0.2s ease',
                  background: isNegative ? `rgba(239,68,68,${pct / 800})` : `rgba(91,95,239,${pct / 600})`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = isNegative ? 'rgba(239,68,68,0.2)' : 'var(--border)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{emotionEmoji[item.emotion] || '😶'}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.emotion}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: isNegative ? 'var(--danger)' : 'var(--sunset-pink)', marginTop: 4 }}>{item.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 주간 감정 트렌드 바 차트 */}
      {weeklyData.length > 0 && (
        <div className="glass-card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📈</span> {t.weekly_trend}
          </h3>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', minHeight: 160 }}>
            {weeklyData.map((week, wi) => (
              <div key={wi} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 2, width: '100%', alignItems: 'center' }}>
                  {allEmotions.map(em => {
                    const val = Number(week[em] || 0);
                    if (!val) return null;
                    const barH = Math.max((val / weeklyMaxVal) * 120, 6);
                    return (
                      <div
                        key={em}
                        title={`${em}: ${val}`}
                        style={{
                          width: '80%', height: animated ? barH : 0,
                          background: emotionColor[em] || '#a3a3a3',
                          borderRadius: 4,
                          transition: 'height 0.7s ease',
                          opacity: 0.85,
                        }}
                      />
                    );
                  })}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6, textAlign: 'center', fontWeight: 600 }}>
                  {week.week}
                </div>
              </div>
            ))}
          </div>
          {/* 범례 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
            {allEmotions.filter(em => weeklyData.some(w => Number(w[em] || 0) > 0)).map(em => (
              <div key={em} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: 10, height: 10, background: emotionColor[em] || '#a3a3a3', borderRadius: 2, display: 'inline-block' }} />
                {emotionEmoji[em] || ''} {em}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Comparison */}
      <div className="glass-card">
        <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>📅</span> {t.monthly_compare}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          <div style={{
            background: 'rgba(255,45,120,0.1)', borderRadius: 'var(--radius-lg)',
            padding: '24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sunset-pink)', marginBottom: 8 }}>{t.this_month}</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--sunset-pink)' }}>{stats.this_month_reports ?? '-'}</div>
          </div>
          <div style={{
            background: monthDiff > 0 ? 'var(--danger-light)' : monthDiff < 0 ? 'var(--secondary-light)' : 'var(--bg-subtle)',
            borderRadius: 'var(--radius-lg)', padding: '24px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 4 }}>
              {monthDiff > 0 ? '📈' : monthDiff < 0 ? '📉' : '➡️'}
            </div>
            <div style={{
              fontSize: '1.4rem', fontWeight: 800,
              color: monthDiff > 0 ? 'var(--danger)' : monthDiff < 0 ? 'var(--secondary)' : 'var(--text-muted)',
            }}>
              {monthDiff > 0 ? '+' : ''}{monthDiff}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>{t.change}</div>
          </div>
          <div style={{
            background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)',
            padding: '24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>{t.last_month}</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{stats.prev_month_reports ?? '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
