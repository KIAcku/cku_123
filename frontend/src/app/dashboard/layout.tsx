'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// ─── 다국어 번역 ──────────────────────────────────────────────
const i18n: Record<string, Record<string, string>> = {
  ko: {
    home: '홈', diary: '감정 일기', test: '자가진단 테스트',
    counsel: '1:1 익명 상담', community: '커뮤니티', report: '익명 신고',
    crisis: '위기 지원 센터', resources: '마음건강 자료실', profile: '내 프로필',
    main_menu: '주요 메뉴', counseling: '상담 & 소통', support: '지원', settings: '설정',
    logout: '로그아웃', student: '학생', teacher: '선생님', counselor: '상담사',
    crisis_btn: '🆘 위기',
  },
  en: {
    home: 'Home', diary: 'Emotion Diary', test: 'Self-Assessment',
    counsel: '1:1 Anonymous Counsel', community: 'Community', report: 'Anonymous Report',
    crisis: 'Crisis Support Center', resources: 'Mental Health Resources', profile: 'My Profile',
    main_menu: 'Main Menu', counseling: 'Counseling & Connect', support: 'Support', settings: 'Settings',
    logout: 'Logout', student: 'Student', teacher: 'Teacher', counselor: 'Counselor',
    crisis_btn: '🆘 Crisis',
  },
  ja: {
    home: 'ホーム', diary: '感情日記', test: 'セルフ診断',
    counsel: '1:1 匿名相談', community: 'コミュニティ', report: '匿名報告',
    crisis: '危機支援センター', resources: 'メンタルヘルス資料', profile: 'マイプロフィール',
    main_menu: 'メインメニュー', counseling: '相談＆交流', support: 'サポート', settings: '設定',
    logout: 'ログアウト', student: '学生', teacher: '先生', counselor: 'カウンセラー',
    crisis_btn: '🆘 危機',
  },
  zh: {
    home: '首页', diary: '情绪日记', test: '自我评估',
    counsel: '1对1匿名咨询', community: '社区', report: '匿名举报',
    crisis: '危机支援中心', resources: '心理健康资料', profile: '我的资料',
    main_menu: '主菜单', counseling: '咨询与交流', support: '支持', settings: '设置',
    logout: '退出登录', student: '学生', teacher: '教师', counselor: '咨询师',
    crisis_btn: '🆘 危机',
  },
};

// ─── 테마 정의 ────────────────────────────────────────────────
const themes = [
  { id: 'light', label: '라이트', icon: '☀️', bg: '#F8F9FA', sidebar: '#1a1a2e', primary: '#5B5FEF' },
  { id: 'dark', label: '다크', icon: '🌙', bg: '#0f0f23', sidebar: '#0a0a1a', primary: '#7C6FFF' },
  { id: 'green', label: '그린', icon: '🌿', bg: '#F0FDF4', sidebar: '#14532d', primary: '#16A34A' },
  { id: 'purple', label: '퍼플', icon: '💜', bg: '#FAF5FF', sidebar: '#3b0764', primary: '#7C3AED' },
];

const getNavSections = (t: Record<string, string>) => [
  {
    label: t.main_menu,
    items: [
      { href: '/dashboard', icon: '🏠', label: t.home },
      { href: '/dashboard/diary', icon: '📔', label: t.diary },
      { href: '/dashboard/test', icon: '🧠', label: t.test },
    ]
  },
  {
    label: t.counseling,
    items: [
      { href: '/dashboard/counsel', icon: '💬', label: t.counsel },
      { href: '/dashboard/community', icon: '👥', label: t.community },
      { href: '/dashboard/report', icon: '🚨', label: t.report },
    ]
  },
  {
    label: t.support,
    items: [
      { href: '/dashboard/crisis', icon: '🆘', label: t.crisis },
      { href: '/dashboard/resources', icon: '📚', label: t.resources },
    ]
  },
  {
    label: t.settings,
    items: [
      { href: '/dashboard/profile', icon: '👤', label: t.profile },
    ]
  }
];

// 상담사 전용 메뉴 추가
const getCounselorSections = (t: Record<string, string>) => [
  {
    label: '상담사 메뉴',
    items: [
      { href: '/dashboard', icon: '🏠', label: t.home },
      { href: '/dashboard/counselor', icon: '📨', label: '학생 상담 관리' },
      { href: '/dashboard/profile', icon: '👤', label: t.profile },
    ]
  }
];

const langs = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

const roleLabel = (lang: string, role: string) => {
  const t = i18n[lang] || i18n.ko;
  const map: Record<string, string> = { STUDENT: t.student, TEACHER: t.teacher, COUNSELOR: t.counselor, ADMIN: '관리자' };
  return map[role] || t.student;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [pageTitle, setPageTitle] = useState('홈');
  const [lang, setLang] = useState('ko');
  const [showLang, setShowLang] = useState(false);
  const [theme, setTheme] = useState('light');
  const [showTheme, setShowTheme] = useState(false);

  const t = i18n[lang] || i18n.ko;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    const savedLang = localStorage.getItem('lang') || 'ko';
    setLang(savedLang);
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  useEffect(() => {
    const titles: Record<string, string> = {
      '/dashboard': t.home,
      '/dashboard/diary': t.diary,
      '/dashboard/test': t.test,
      '/dashboard/counsel': t.counsel,
      '/dashboard/community': t.community,
      '/dashboard/report': t.report,
      '/dashboard/crisis': t.crisis,
      '/dashboard/resources': t.resources,
      '/dashboard/profile': t.profile,
      '/dashboard/counselor': '학생 상담 관리',
    };
    setPageTitle(titles[pathname] || '마음이음');
  }, [pathname, lang]);

  const applyTheme = (themeId: string) => {
    const t = themes.find(t => t.id === themeId) || themes[0];
    document.documentElement.style.setProperty('--page-bg', t.bg);
    if (themeId === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const switchLang = (code: string) => {
    setLang(code);
    localStorage.setItem('lang', code);
    setShowLang(false);
  };

  const switchTheme = (id: string) => {
    setTheme(id);
    localStorage.setItem('theme', id);
    applyTheme(id);
    setShowTheme(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const initials = user?.nickname ? user.nickname.slice(0, 1) : '익';
  const isCounselor = user?.role === 'COUNSELOR' || user?.role === 'TEACHER';
  const navSections = isCounselor ? getCounselorSections(t) : getNavSections(t);
  const currentTheme = themes.find(th => th.id === theme) || themes[0];

  return (
    <div className="dashboard-layout">
      {/* 사이드바 */}
      <aside className="sidebar" style={{ background: currentTheme.sidebar }}>
        {/* 로고 */}
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">💚</span>
          <span className="sidebar-logo-text">마음이음</span>
        </div>

        {/* 상담사 배지 */}
        {isCounselor && (
          <div style={{ margin: '0 16px 12px', background: 'rgba(255,200,0,0.2)', borderRadius: 8, padding: '6px 10px', fontSize: '0.75rem', color: '#FFD700', fontWeight: 700, textAlign: 'center' }}>
            👩‍💼 {roleLabel(lang, user?.role)} 계정
          </div>
        )}

        {/* 네비게이션 */}
        <nav style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
          {navSections.map(section => (
            <div key={section.label} className="sidebar-section">
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map(item => {
                const isActive = item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                    <span className="sidebar-nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* 하단 프로필 */}
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => router.push('/dashboard/profile')}>
            <div className="avatar avatar-md">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name truncate">{user?.nickname || '익명학생'}</div>
              <div className="sidebar-user-role">{roleLabel(lang, user?.role || 'STUDENT')}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{
              width: '100%', marginTop: 8, padding: '8px', borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', background: 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'var(--transition)'
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)', e.currentTarget.style.color = '#ff6b6b')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          >
            <span>🚪</span> {t.logout}
          </button>
        </div>
      </aside>

      {/* 메인 영역 */}
      <div className="main-content" style={{ background: currentTheme.bg }}>
        {/* 상단 헤더 */}
        <header className="top-header">
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{pageTitle}</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>
              {new Date().toLocaleDateString(lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {/* 언어 선택 */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setShowLang(!showLang); setShowTheme(false); }} style={{
                height: 36, padding: '0 12px', borderRadius: 'var(--radius-full)',
                background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                fontWeight: 600, color: 'var(--text-secondary)'
              }}>
                {langs.find(l => l.code === lang)?.flag} {lang.toUpperCase()}
              </button>
              {showLang && (
                <div style={{
                  position: 'absolute', right: 0, top: 44, background: 'white',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)', zIndex: 200, minWidth: 140, overflow: 'hidden'
                }}>
                  {langs.map(l => (
                    <button key={l.code} onClick={() => switchLang(l.code)} style={{
                      width: '100%', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: '0.85rem', cursor: 'pointer',
                      background: lang === l.code ? 'var(--primary-light)' : 'transparent',
                      color: lang === l.code ? 'var(--primary)' : 'var(--text-primary)',
                      fontWeight: lang === l.code ? 600 : 400,
                      borderBottom: '1px solid var(--border)',
                    }}>
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 테마 선택 */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setShowTheme(!showTheme); setShowLang(false); }} style={{
                height: 36, padding: '0 12px', borderRadius: 'var(--radius-full)',
                background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                fontWeight: 600, color: 'var(--text-secondary)'
              }}>
                {currentTheme.icon} 테마
              </button>
              {showTheme && (
                <div style={{
                  position: 'absolute', right: 0, top: 44, background: 'white',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)', zIndex: 200, overflow: 'hidden', minWidth: 130
                }}>
                  {themes.map(th => (
                    <button key={th.id} onClick={() => switchTheme(th.id)} style={{
                      width: '100%', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: '0.85rem', cursor: 'pointer',
                      background: theme === th.id ? 'var(--primary-light)' : 'transparent',
                      color: theme === th.id ? 'var(--primary)' : 'var(--text-primary)',
                      fontWeight: theme === th.id ? 600 : 400,
                      borderBottom: '1px solid var(--border)',
                    }}>
                      {th.icon} {th.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 위기 지원 버튼 */}
            <button onClick={() => router.push('/dashboard/crisis')} style={{
              height: 36, padding: '0 12px', borderRadius: 'var(--radius-full)',
              background: 'var(--danger-light)', border: '1px solid var(--danger)',
              fontSize: '0.75rem', fontWeight: 700, color: 'var(--danger)', cursor: 'pointer'
            }}>{t.crisis_btn}</button>

            <div className="avatar avatar-md" style={{ cursor: 'pointer' }}
              onClick={() => router.push('/dashboard/profile')}>
              {initials}
            </div>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
