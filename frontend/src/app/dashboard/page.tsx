'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE } from '@/lib/apiClient';

const i18n: Record<string, Record<string, string>> = {
  ko: {
    greeting_morning: '좋은 아침이에요', greeting_afternoon: '좋은 오후에요', greeting_evening: '좋은 저녁이에요',
    welcome: '{nickname}님, 환영합니다!',
    banner_desc: '오늘 마음은 어떠신가요? 감정을 기록하고 스스로를 돌봐보세요.',
    total_diary: '전체 일기', monthly_diary: '이번 달 일기', streak: '연속 기록',
    quick_menu: '빠른 메뉴',
    diary_write: '감정 일기 쓰기', diary_write_desc: '오늘의 감정을 기록해보세요',
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
    total_diary: 'Total Diaries', monthly_diary: 'Monthly Diaries', streak: 'Streak',
    quick_menu: 'Quick Menu',
    diary_write: 'Write Diary', diary_write_desc: 'Record your feelings today',
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
    banner_desc: '今日の心境はいかがですか？ 感情を記録し、セルフケアをしましょう。',
    total_diary: '全体の記録', monthly_diary: '今月の記録', streak: '連続記録',
    quick_menu: 'クイックメニュー',
    diary_write: '感情日記を書く', diary_write_desc: '今日の感情を記録しましょう',
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
    total_diary: '全部日记', monthly_diary: '本月日记', streak: '连续记录',
    quick_menu: '快捷菜单',
    diary_write: '写心情日记', diary_write_desc: '记录你今天的感受',
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

export default function DashboardHome() {
  const [user, setUser] = useState<any>(null);
  const [diaries, setDiaries] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('ko');

  const t = i18n[lang] || i18n.ko;

  // 감정 라벨 다국어화
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
    const savedLang = localStorage.getItem('lang') || 'ko';
    setLang(savedLang);
    loadData();

    // 언어 변경 감지 이벤트 리스너 추가 (Header 등에서 강제 전환 시 반영용)
    const handleLangChange = () => {
      const updatedLang = localStorage.getItem('lang') || 'ko';
      setLang(updatedLang);
    };
    window.addEventListener('storage', handleLangChange);
    window.addEventListener('langChange', handleLangChange);
    return () => {
      window.removeEventListener('storage', handleLangChange);
      window.removeEventListener('langChange', handleLangChange);
    };
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
    { href: '/dashboard/diary', icon: '📔', label: t.diary_write, desc: t.diary_write_desc, bg: 'var(--primary-light)', color: 'var(--primary)' },
    { href: '/dashboard/community', icon: '👥', label: t.view_community, desc: t.view_community_desc, bg: 'var(--secondary-light)', color: 'var(--secondary)' },
    { href: '/dashboard/report', icon: '🚨', label: t.anon_report, desc: t.anon_report_desc, bg: 'var(--danger-light)', color: 'var(--danger)' },
  ];

  return (
    <div className="page-content">
      {/* 환영 배너 */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #7C3AED 100%)',
        borderRadius: 'var(--radius-xl)', padding: '28px 32px', color: 'white',
        marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div>
          <p style={{ opacity: 0.85, fontSize: '0.875rem', marginBottom: 6 }}>{greeting} 👋</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>
            {t.welcome.replace('{nickname}', user?.nickname || (lang === 'ko' ? '익명학생' : 'Anonymous'))}
          </h2>
          <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>{t.banner_desc}</p>
        </div>
        <div style={{ fontSize: '4rem', opacity: 0.9 }}>💚</div>
      </div>

      {/* 통계 카드 */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        {[
          { label: t.total_diary, value: stats?.total ?? '-', icon: '📔', color: 'var(--primary-light)', iconColor: 'var(--primary)' },
          { label: t.monthly_diary, value: stats?.this_month ?? '-', icon: '📅', color: 'var(--secondary-light)', iconColor: 'var(--secondary)' },
          { label: t.streak, value: stats ? `${stats.streak_days}${t.days}` : '-', icon: '🔥', color: 'var(--warning-light)', iconColor: 'var(--warning)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>
              <span>{s.icon}</span>
            </div>
            <div>
              <div className="stat-value" style={{ color: s.iconColor }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 빠른 메뉴 */}
      <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 14 }}>{t.quick_menu}</h3>
      <div className="grid-3" style={{ marginBottom: 32 }}>
        {quickMenus.map(m => (
          <Link key={m.href} href={m.href} style={{ textDecoration: 'none' }}>
            <div className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                {m.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: m.color }}>{m.label}</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 최근 일기 & 커뮤니티 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* 최근 일기 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{t.recent_diary}</h3>
            <Link href="/dashboard/diary" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{t.view_all}</Link>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>{t.loading}</div>
          ) : diaries.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>📔</div>
              <p style={{ fontSize: '0.875rem' }}>{t.no_diary}</p>
              <Link href="/dashboard/diary" className="btn btn-primary btn-sm" style={{ marginTop: 12, display: 'inline-flex' }}>{t.write_first_diary}</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {diaries.map((d: any) => (
                <div key={d.id} className="card card-sm" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem' }}>{emotionEmoji[d.emotion] || '😐'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{emotionLabels[d.emotion] || d.emotion}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(d.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : 'ko-KR')}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 최근 커뮤니티 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{t.recent_post}</h3>
            <Link href="/dashboard/community" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{t.view_all}</Link>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>{t.loading}</div>
          ) : posts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>💬</div>
              <p style={{ fontSize: '0.875rem' }}>{t.no_post}</p>
              <Link href="/dashboard/community" className="btn btn-primary btn-sm" style={{ marginTop: 12, display: 'inline-flex' }}>{t.write_first_post}</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {posts.map((p: any) => (
                <div key={p.id} className="card card-sm">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>{p.category}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.author_nickname}</span>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                  <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 4 }}>❤️ {p.likes}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
