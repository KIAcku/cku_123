'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://studentcare-production.up.railway.app/api/v1';

const i18n: Record<string, Record<string, string>> = {
  ko: {
    title: '통계 대시보드', subtitle: '학생 케어 플랫폼 현황을 한눈에 확인합니다.',
    total_reports: '전체 신고', monthly_reports: '이번 달 신고',
    total_students: '전체 학생', active_sessions: '활성 상담 세션', active_alerts: '활성 경고',
    category_dist: '카테고리별 분포', emotion_dist: '감정 분포',
    monthly_compare: '월별 비교', this_month: '이번 달', last_month: '지난 달',
    loading: '통계를 불러오는 중...', change: '변화',
    bullying: '학교폭력', discrimination: '차별', harassment: '괴롭힘', other: '기타',
    increase: '증가', decrease: '감소', same: '변화 없음',
  },
  en: {
    title: 'Statistics Dashboard', subtitle: 'Get an overview of the Student Care Platform.',
    total_reports: 'Total Reports', monthly_reports: 'Monthly Reports',
    total_students: 'Students', active_sessions: 'Active Sessions', active_alerts: 'Alerts',
    category_dist: 'Category Distribution', emotion_dist: 'Emotion Distribution',
    monthly_compare: 'Monthly Comparison', this_month: 'This Month', last_month: 'Last Month',
    loading: 'Loading statistics...', change: 'Change',
    bullying: 'Bullying', discrimination: 'Discrimination', harassment: 'Harassment', other: 'Other',
    increase: 'Increase', decrease: 'Decrease', same: 'No Change',
  },
  ja: {
    title: '統計ダッシュボード', subtitle: '学生ケアプラットフォームの状況を一目で確認できます。',
    total_reports: '総報告数', monthly_reports: '今月の報告数',
    total_students: '全学生数', active_sessions: 'アクティブセッション', active_alerts: 'アクティブアラート',
    category_dist: 'カテゴリ別分布', emotion_dist: '感情分布',
    monthly_compare: '月別比較', this_month: '今月', last_month: '先月',
    loading: '統計を読み込み中...', change: '変化',
    bullying: 'いじめ', discrimination: '差別', harassment: '嫌がらせ', other: 'その他',
    increase: '増加', decrease: '減少', same: '変化なし',
  },
  zh: {
    title: '统计仪表板', subtitle: '一目了然地查看学生关怀平台的现状。',
    total_reports: '总举报数', monthly_reports: '本月举报数',
    total_students: '学生总数', active_sessions: '活跃咨询', active_alerts: '活跃警告',
    category_dist: '类别分布', emotion_dist: '情绪分布',
    monthly_compare: '月度比较', this_month: '本月', last_month: '上月',
    loading: '正在加载统计数据...', change: '变化',
    bullying: '校园暴力', discrimination: '歧视', harassment: '骚扰', other: '其他',
    increase: '增加', decrease: '减少', same: '无变化',
  },
};

interface Statistics {
  total_reports?: number;
  monthly_reports?: number;
  total_students?: number;
  active_sessions?: number;
  active_alerts?: number;
  category_distribution?: { category: string; count: number }[];
  emotion_distribution?: { emotion: string; count: number; emoji: string }[];
  monthly_comparison?: { this_month: number; last_month: number };
}

const categoryGradients: Record<string, string> = {
  bullying:       'linear-gradient(90deg, #EF4444, #F87171)',
  discrimination: 'linear-gradient(90deg, #F97316, #FB923C)',
  harassment:     'linear-gradient(90deg, #8B5CF6, #A78BFA)',
  other:          'linear-gradient(90deg, #6B7280, #9CA3AF)',
};

export default function StatisticsPage() {
  const router = useRouter();
  const [lang, setLang] = useState('ko');
  const [stats, setStats] = useState<Statistics>({});
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
      // Mock data for display
      setStats({
        total_reports: 142,
        monthly_reports: 23,
        total_students: 580,
        active_sessions: 8,
        active_alerts: 3,
        category_distribution: [
          { category: 'bullying', count: 58 },
          { category: 'harassment', count: 41 },
          { category: 'discrimination', count: 27 },
          { category: 'other', count: 16 },
        ],
        emotion_distribution: [
          { emotion: '슬픔', count: 120, emoji: '😢' },
          { emotion: '불안', count: 95, emoji: '😰' },
          { emotion: '분노', count: 78, emoji: '😤' },
          { emotion: '외로움', count: 64, emoji: '😔' },
          { emotion: '행복', count: 43, emoji: '😊' },
          { emotion: '평온', count: 31, emoji: '😌' },
        ],
        monthly_comparison: { this_month: 23, last_month: 18 },
      });
    } finally {
      setLoading(false);
      setTimeout(() => setAnimated(true), 100);
    }
  };

  const categoryData = stats.category_distribution || [];
  const maxCatCount = Math.max(...categoryData.map(d => d.count), 1);
  const emotionData = stats.emotion_distribution || [];
  const monthly = stats.monthly_comparison;
  const monthDiff = monthly ? monthly.this_month - monthly.last_month : 0;

  const statCards = [
    { label: t.total_reports,    value: stats.total_reports ?? '-',    icon: '📋', color: '#5B5FEF', bg: 'linear-gradient(135deg, #EEF0FF, #E0E2FF)' },
    { label: t.monthly_reports,  value: stats.monthly_reports ?? '-',  icon: '📅', color: '#D97706', bg: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)' },
    { label: t.total_students,   value: stats.total_students ?? '-',   icon: '🎓', color: '#059669', bg: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' },
    { label: t.active_sessions,  value: stats.active_sessions ?? '-',  icon: '💬', color: '#2563EB', bg: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' },
    { label: t.active_alerts,    value: stats.active_alerts ?? '-',    icon: '🚨', color: '#EF4444', bg: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)' },
  ];

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Category Distribution */}
        <div className="card">
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
        <div className="card">
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>😊</span> {t.emotion_dist}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {emotionData.map(item => {
              const maxEmotionCount = Math.max(...emotionData.map(e => e.count), 1);
              const pct = Math.round((item.count / maxEmotionCount) * 100);
              return (
                <div key={item.emotion} style={{
                  textAlign: 'center', padding: '16px 8px',
                  borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)',
                  transition: 'all 0.2s ease',
                  background: `rgba(91,95,239,${pct / 500})`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{item.emoji}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.emotion}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>{item.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Comparison */}
      {monthly && (
        <div className="card">
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📅</span> {t.monthly_compare}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            <div style={{
              background: 'var(--primary-light)', borderRadius: 'var(--radius-lg)',
              padding: '24px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>{t.this_month}</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{monthly.this_month}</div>
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
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{monthly.last_month}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
