'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLangStore } from '@/store/langStore';
import Link from 'next/link';
import { API_BASE } from '@/lib/apiClient';

const i18n: Record<string, Record<string, string>> = {
  ko: {
    greeting_morning: '좋은 아침이에요', greeting_afternoon: '좋은 오후에요', greeting_evening: '좋은 저녁이에요',
    welcome: '{nickname}님, 환영합니다!',
    banner_desc: '오늘 마음은 어떠신가요? 감정을 기록하고 스스로를 돌봐보세요.',
    write_diary: '일기 쓰기',
    total_diary: '전체 일기', monthly_diary: '이번 달 일기', streak: '연속 기록',
    quick_menu: '빠른 메뉴',
    diary_write: '감정 일기 쓰기', diary_write_desc: '오늘의 감정을 기록해보세요',
    counsel_btn: '1:1 상담 신청', counsel_desc: '익명으로 상담을 받아보세요',
    view_community: '커뮤니티 보기', view_community_desc: '친구들과 소통해요',
    anon_report: '익명 신고', anon_report_desc: '안전하게 신고하세요',
    recent_diary: '최근 감정 일기', recent_post: '최근 커뮤니티 글',
    view_all: '전체 보기 →', loading: '불러오는 중...',
    no_diary: '아직 작성된 일기가 없어요', write_first_diary: '첫 일기 쓰기',
    no_post: '아직 글이 없어요', write_first_post: '첫 글 쓰기',
    days: '일'
  },
  en: {
    greeting_morning: 'Good morning', greeting_afternoon: 'Good afternoon', greeting_evening: 'Good evening',
    welcome: 'Welcome, {nickname}!',
    banner_desc: 'How is your heart today? Record your emotions and take care of yourself.',
    write_diary: 'Write Diary',
    total_diary: 'Total Diaries', monthly_diary: 'Monthly Diaries', streak: 'Streak',
    quick_menu: 'Quick Menu',
    diary_write: 'Write Diary', diary_write_desc: 'Record your feelings today',
    counsel_btn: 'Start Counseling', counsel_desc: 'Get anonymous counseling',
    view_community: 'View Community', view_community_desc: 'Connect with friends',
    anon_report: 'Anonymous Report', anon_report_desc: 'Report safely',
    recent_diary: 'Recent Diaries', recent_post: 'Recent Posts',
    view_all: 'View All →', loading: 'Loading...',
    no_diary: 'No diaries written yet', write_first_diary: 'Write First Diary',
    no_post: 'No posts yet', write_first_post: 'Write First Post',
    days: 'Days'
  },
  ja: {
    greeting_morning: 'おはようございます', greeting_afternoon: 'こんにちは', greeting_evening: 'こんばんは',
    welcome: 'ようこそ、{nickname}さん！',
    banner_desc: '今日の心境はいかがですか？感情を記録し、セルフケアをしましょう。',
    write_diary: '日記を書く',
    total_diary: '全体の記録', monthly_diary: '今月の記録', streak: '連続記録',
    quick_menu: 'クイックメニュー',
    diary_write: '感情日記を書く', diary_write_desc: '今日の感情を記録しましょう',
    counsel_btn: '相談を申し込む', counsel_desc: '匿名で相談を受けましょう',
    view_community: 'コミュニティを見る', view_community_desc: '友達と交流しましょう',
    anon_report: '匿名通報', anon_report_desc: '安全に通報してください',
    recent_diary: '最近の日記', recent_post: '最近の投稿',
    view_all: 'すべて見る →', loading: '読み込み中...',
    no_diary: 'まだ日記がありません', write_first_diary: '最初の日記を書く',
    no_post: 'まだ投稿がありません', write_first_post: '最初の投稿を書く',
    days: '日'
  },
  zh: {
    greeting_morning: '早上好', greeting_afternoon: '下午好', greeting_evening: '晚上好',
    welcome: '欢迎你，{nickname}！',
    banner_desc: '你今天的心情怎么样？记录你的情绪，照顾好自己。',
    write_diary: '写日记',
    total_diary: '全部日记', monthly_diary: '本月日记', streak: '连续记录',
    quick_menu: '快捷菜单',
    diary_write: '写心情日记', diary_write_desc: '记录你今天的感受',
    counsel_btn: '申请咨询', counsel_desc: '匿名接受心理咨询',
    view_community: '查看社区', view_community_desc: '与朋友们交流',
    anon_report: '匿名举报', anon_report_desc: '安全地进行举报',
    recent_diary: '最近日记', recent_post: '最近帖子',
    view_all: '查看全部 →', loading: '加载中...',
    no_diary: '还没有写过日记', write_first_diary: '写第一篇日记',
    no_post: '还没有帖子', write_first_post: '写第一个帖子',
    days: '天'
  }
};

const emotionEmoji: Record<string, string> = {
  happy: '😊', sad: '😢', angry: '😠', anxious: '😰', neutral: '😐', tired: '😴', excited: '🤩',
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const } }
};

export default function DashboardHome() {
  const [user, setUser] = useState<any>(null);
  const [diaries, setDiaries] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { lang } = useLangStore();
  const t = i18n[lang] || i18n.ko;

  const emotionLabels: Record<string, string> = {
    happy: lang === 'ja' ? '嬉しい' : lang === 'zh' ? '开心' : lang === 'en' ? 'Happy' : '행복해요',
    sad: lang === 'ja' ? '悲しい' : lang === 'zh' ? '悲伤' : lang === 'en' ? 'Sad' : '슬퍼요',
    angry: lang === 'ja' ? '怒り' : lang === 'zh' ? '生气' : lang === 'en' ? 'Angry' : '화가나요',
    anxious: lang === 'ja' ? '不安' : lang === 'zh' ? '焦虑' : lang === 'en' ? 'Anxious' : '불안해요',
    neutral: lang === 'ja' ? '普通' : lang === 'zh' ? '一般' : lang === 'en' ? 'Neutral' : '보통이에요',
    tired: lang === 'ja' ? '疲れた' : lang === 'zh' ? '疲惫' : lang === 'en' ? 'Tired' : '피곤해요',
    excited: lang === 'ja' ? 'わくわく' : lang === 'zh' ? '兴奋' : lang === 'en' ? 'Excited' : '설레요',
  };

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [diaryRes, postRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/diaries?limit=3`, { headers }),
        fetch(`${API_BASE}/posts?limit=3`),
        fetch(`${API_BASE}/diaries/stats`, { headers }),
      ]);
      if (diaryRes.ok) { const d = await diaryRes.json(); setDiaries(d.slice(0, 3)); }
      if (postRes.ok) { const p = await postRes.json(); setPosts(p.slice(0, 3)); }
      if (statsRes.ok) setStats(await statsRes.json());
    } catch { }
    setLoading(false);
  };

  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? 'greeting_morning' : hour < 18 ? 'greeting_afternoon' : 'greeting_evening';
  const greeting = t[greetingKey];

  const quickMenus = [
    { href: '/dashboard/diary',     icon: '📔', label: t.diary_write,   desc: t.diary_write_desc,   grad: 'linear-gradient(135deg,#FF6B35,#FF2D78)' },
    { href: '/dashboard/counsel',   icon: '💬', label: t.counsel_btn,   desc: t.counsel_desc,        grad: 'linear-gradient(135deg,#9333EA,#6D28D9)' },
    { href: '/dashboard/community', icon: '👥', label: t.view_community, desc: t.view_community_desc, grad: 'linear-gradient(135deg,#3B82F6,#6366F1)' },
    { href: '/dashboard/report',    icon: '🚨', label: t.anon_report,   desc: t.anon_report_desc,   grad: 'linear-gradient(135deg,#FF4D6D,#FF6B35)' },
  ];

  const statsData = [
    { label: t.total_diary,   value: stats?.total ?? '—',                         icon: '📔' },
    { label: t.monthly_diary, value: stats?.this_month ?? '—',                     icon: '📅' },
    { label: t.streak,        value: stats ? `${stats.streak_days}${t.days}` : '—', icon: '🔥' },
  ];

  return (
    <div className="page-content" style={{ maxWidth: 1100 }}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">

        {/* ── 환영 배너 ── */}
        <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
          <div style={{
            position: 'relative', overflow: 'hidden',
            borderRadius: 'var(--radius-2xl)', padding: '32px 36px',
            background: 'linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(255,45,120,0.20) 50%, rgba(147,51,234,0.15) 100%)',
            border: '1px solid rgba(255,45,120,0.2)',
            backdropFilter: 'blur(24px)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            {/* 배경 글로우 블롭 */}
            <div style={{
              position: 'absolute', top: -40, right: -20, width: 200, height: 200,
              background: 'radial-gradient(circle, rgba(255,45,120,0.25) 0%, transparent 70%)',
              borderRadius: '50%', pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                {greeting} 👋
              </p>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 10, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                {t.welcome.replace('{nickname}', user?.nickname || (lang === 'ko' ? '익명학생' : 'Anonymous'))}
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 20 }}>{t.banner_desc}</p>
              <Link href="/dashboard/diary">
                <button className="btn btn-sunset btn-sm">
                  ✨ {t.write_diary}
                </button>
              </Link>
            </div>
            <motion.div
              animate={{ y: [0, -12, 0], rotate: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: '5rem', opacity: 0.9, flexShrink: 0, position: 'relative', zIndex: 1 }}
            >
              💜
            </motion.div>
          </div>
        </motion.div>

        {/* ── 통계 카드 ── */}
        <motion.div variants={itemVariants}>
          <div className="grid-3" style={{ marginBottom: 24 }}>
            {statsData.map((s, i) => (
              <motion.div
                key={s.label}
                className="glass-card stat-card"
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="stat-icon">
                  <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
                </div>
                <div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── 빠른 메뉴 ── */}
        <motion.div variants={itemVariants} style={{ marginBottom: 28 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 14, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>
            {t.quick_menu}
          </h3>
          <div className="grid-4">
            {quickMenus.map((m, i) => (
              <Link key={m.href} href={m.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  className="glass-card"
                  style={{ padding: '20px', cursor: 'pointer', height: '100%' }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 'var(--radius-lg)',
                    background: m.grad, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1.5rem', marginBottom: 14,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                  }}>
                    {m.icon}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 5, color: 'var(--text-primary)' }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {m.desc}
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ── 최근 일기 & 커뮤니티 ── */}
        <motion.div variants={itemVariants}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* 최근 일기 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.recent_diary}</h3>
                <Link href="/dashboard/diary" style={{ fontSize: '0.8rem', color: 'var(--sunset-pink)', fontWeight: 600 }}>
                  {t.view_all}
                </Link>
              </div>
              {loading ? (
                <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
                </div>
              ) : diaries.length === 0 ? (
                <div className="glass-card" style={{ padding: '28px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📔</div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 14 }}>{t.no_diary}</p>
                  <Link href="/dashboard/diary">
                    <button className="btn btn-sunset btn-sm">{t.write_first_diary}</button>
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {diaries.map((d: any) => (
                    <motion.div
                      key={d.id}
                      className="glass-card-sm"
                      style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}
                      whileHover={{ x: 3 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{emotionEmoji[d.emotion] || '😐'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>
                            {emotionLabels[d.emotion] || d.emotion}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {new Date(d.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : 'ko-KR')}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.content}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* 최근 커뮤니티 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.recent_post}</h3>
                <Link href="/dashboard/community" style={{ fontSize: '0.8rem', color: 'var(--sunset-pink)', fontWeight: 600 }}>
                  {t.view_all}
                </Link>
              </div>
              {loading ? (
                <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
                </div>
              ) : posts.length === 0 ? (
                <div className="glass-card" style={{ padding: '28px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>💬</div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 14 }}>{t.no_post}</p>
                  <Link href="/dashboard/community">
                    <button className="btn btn-sunset btn-sm">{t.write_first_post}</button>
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {posts.map((p: any) => (
                    <motion.div
                      key={p.id}
                      className="glass-card-sm"
                      style={{ padding: '14px 16px' }}
                      whileHover={{ x: 3 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span className="badge badge-glass" style={{ fontSize: '0.68rem' }}>{p.category}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.author_nickname}</span>
                      </div>
                      <p style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                        {p.title}
                      </p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>❤️ {p.likes}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
