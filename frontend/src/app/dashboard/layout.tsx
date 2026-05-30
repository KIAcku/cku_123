'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://studentcare-production.up.railway.app/api/v1';
const BACKEND_BASE = API.replace('/api/v1', '');

// ─── 다국어 번역 ──────────────────────────────────────────────
const i18n: Record<string, Record<string, string>> = {
  ko: {
    home: '홈', diary: '감정 일기', test: '자가진단 테스트',
    counsel: '1:1 익명 상담', community: '커뮤니티', report: '익명 신고',
    crisis: '위기 지원 센터', resources: '마음건강 자료실', profile: '내 프로필',
    main_menu: '주요 메뉴', counseling: '상담 & 소통', support: '지원', settings: '설정',
    logout: '로그아웃', student: '학생', teacher: '선생님', counselor: '상담사',
    crisis_btn: '🆘 위기',
    report_mgmt: '신고 내역 관리', counsel_reports: '상담 결과 보고서',
    statistics: '통계 대시보드', students: '학생 목록', notices: '공지사항 관리',
    counsel_mgmt: '상담 관리', help: '도움말', teacher_menu: '선생님 메뉴', counselor_menu: '상담사 메뉴',
  },
  en: {
    home: 'Home', diary: 'Emotion Diary', test: 'Self-Assessment',
    counsel: '1:1 Anonymous Counsel', community: 'Community', report: 'Anonymous Report',
    crisis: 'Crisis Support Center', resources: 'Mental Health Resources', profile: 'My Profile',
    main_menu: 'Main Menu', counseling: 'Counseling & Connect', support: 'Support', settings: 'Settings',
    logout: 'Logout', student: 'Student', teacher: 'Teacher', counselor: 'Counselor',
    crisis_btn: '🆘 Crisis',
    report_mgmt: 'Report Management', counsel_reports: 'Counsel Reports',
    statistics: 'Statistics', students: 'Student List', notices: 'Notice Board',
    counsel_mgmt: 'Counsel Management', help: 'Help', teacher_menu: 'Teacher Menu', counselor_menu: 'Counselor Menu',
  },
  ja: {
    home: 'ホーム', diary: '感情日記', test: 'セルフ診断',
    counsel: '1:1 匿名相談', community: 'コミュニティ', report: '匿名報告',
    crisis: '危機支援センター', resources: 'メンタルヘルス資料', profile: 'マイプロフィール',
    main_menu: 'メインメニュー', counseling: '相談＆交流', support: 'サポート', settings: '設定',
    logout: 'ログアウト', student: '学生', teacher: '先生', counselor: 'カウンセラー',
    crisis_btn: '🆘 危機',
    report_mgmt: '通報管理', counsel_reports: 'カウンセル報告',
    statistics: '統計ダッシュボード', students: '学生リスト', notices: 'お知らせ管理',
    counsel_mgmt: '相談管理', help: 'ヘルプ', teacher_menu: '先生メニュー', counselor_menu: 'カウンセラーメニュー',
  },
  zh: {
    home: '首页', diary: '情绪日记', test: '自我评估',
    counsel: '1对1匿名咨询', community: '社区', report: '匿名举报',
    crisis: '危机支援中心', resources: '心理健康资料', profile: '我的资料',
    main_menu: '主菜单', counseling: '咨询与交流', support: '支持', settings: '设置',
    logout: '退出登录', student: '学生', teacher: '教师', counselor: '咨询师',
    crisis_btn: '🆘 危机',
    report_mgmt: '举报管理', counsel_reports: '咨询报告',
    statistics: '统计仪表板', students: '学生名单', notices: '公告管理',
    counsel_mgmt: '咨询管理', help: '帮助',
  },
};

// ─── 테마 정의 ────────────────────────────────────────────────
const themes = [
  { id: 'light', label: '라이트', icon: '☀️', bg: '#F8F9FA', sidebar: '#1a1a2e', primary: '#5B5FEF' },
  { id: 'dark', label: '다크', icon: '🌙', bg: '#0f0f23', sidebar: '#0a0a1a', primary: '#7C6FFF' },
  { id: 'green', label: '그린', icon: '🌿', bg: '#F0FDF4', sidebar: '#14532d', primary: '#16A34A' },
  { id: 'purple', label: '퍼플', icon: '💜', bg: '#FAF5FF', sidebar: '#3b0764', primary: '#7C3AED' },
];

// 학생 메뉴
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
      { href: '/dashboard/help', icon: '❓', label: t.help || '도움말' },
    ]
  },
  {
    label: t.settings,
    items: [
      { href: '/dashboard/profile', icon: '👤', label: t.profile },
    ]
  }
];

// 상담사 전용 메뉴
const getCounselorSections = (t: Record<string, string>) => [
  {
    label: '상담사 메뉴',
    items: [
      { href: '/dashboard', icon: '🏠', label: t.home },
      { href: '/dashboard/counselor', icon: '📨', label: t.counsel_mgmt || '상담 관리' },
      { href: '/dashboard/diary', icon: '📔', label: t.diary },
      { href: '/dashboard/resources', icon: '📚', label: t.resources },
      { href: '/dashboard/crisis', icon: '🆘', label: t.crisis },
      { href: '/dashboard/help', icon: '❓', label: t.help || '도움말' },
      { href: '/dashboard/profile', icon: '👤', label: t.profile },
    ]
  }
];

// 선생님 전용 메뉴
const getTeacherSections = (t: Record<string, string>) => [
  {
    label: '선생님 메뉴',
    items: [
      { href: '/dashboard', icon: '🏠', label: t.home },
      { href: '/dashboard/admin/reports', icon: '🚨', label: t.report_mgmt || '신고 내역 관리' },
      { href: '/dashboard/admin/counsel-reports', icon: '📋', label: t.counsel_reports || '상담 결과 보고서' },
      { href: '/dashboard/admin/statistics', icon: '📊', label: t.statistics || '통계 대시보드' },
      { href: '/dashboard/admin/students', icon: '👥', label: t.students || '학생 목록' },
      { href: '/dashboard/admin/notices', icon: '📢', label: t.notices || '공지사항 관리' },
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
  const [unread, setUnread] = useState({ messages: 0, reports: 0, alerts: 0 });

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

  // Poll unread counts every 10 seconds for staff users
  useEffect(() => {
    if (!user || user.role === 'STUDENT') return;
    const fetchUnread = async () => {
      try {
        const res = await fetch(`${API}/notifications/unread`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) setUnread(await res.json());
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [user]);

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
      '/dashboard/counselor': t.counsel_mgmt || '상담 관리',
      '/dashboard/admin/reports': t.report_mgmt || '신고 내역 관리',
      '/dashboard/admin/counsel-reports': t.counsel_reports || '상담 결과 보고서',
      '/dashboard/admin/statistics': t.statistics || '통계 대시보드',
      '/dashboard/admin/students': t.students || '학생 목록',
      '/dashboard/admin/notices': t.notices || '공지사항 관리',
    };
    setPageTitle(titles[pathname] || '마음이음');
  }, [pathname, lang]);

  const applyTheme = (themeId: string) => {
    const th = themes.find(t => t.id === themeId) || themes[0];
    document.documentElement.style.setProperty('--page-bg', th.bg);
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
  const isTeacher = user?.role === 'TEACHER';
  const isCounselor = user?.role === 'COUNSELOR';
  const navSections = isTeacher
    ? getTeacherSections(t)
    : isCounselor
    ? getCounselorSections(t)
    : getNavSections(t);
  const currentTheme = themes.find(th => th.id === theme) || themes[0];
  const avatarUrl = user?.avatar_url;

  return (
    <div className="dashboard-layout">
      {/* 사이드바 */}
      <aside className="sidebar" style={{ background: currentTheme.sidebar }}>
        {/* 로고 */}
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">💚</span>
          <span className="sidebar-logo-text">마음이음</span>
        </div>

        {/* 역할 배지 */}
        {isTeacher && (
          <div style={{ margin: '0 16px 12px', background: 'rgba(59,130,246,0.2)', borderRadius: 8, padding: '6px 10px', fontSize: '0.75rem', color: '#60a5fa', fontWeight: 700, textAlign: 'center' }}>
            🏫 선생님 계정
          </div>
        )}
        {isCounselor && (
          <div style={{ margin: '0 16px 12px', background: 'rgba(255,200,0,0.2)', borderRadius: 8, padding: '6px 10px', fontSize: '0.75rem', color: '#FFD700', fontWeight: 700, textAlign: 'center' }}>
            👩‍💼 상담사 계정
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
                const badge = item.href === '/dashboard/counselor' ? unread.messages :
                              item.href === '/dashboard/admin/reports' ? unread.reports : 0;
                return (
                  <Link key={item.href} href={item.href}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                    <span className="sidebar-nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    {badge > 0 && (
                      <span style={{
                        background: '#ef4444', color: 'white', borderRadius: '50%',
                        width: 18, height: 18, fontSize: '0.65rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginLeft: 'auto', fontWeight: 700, flexShrink: 0
                      }}>
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* 하단 프로필 */}
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => router.push('/dashboard/profile')}>
            {avatarUrl ? (
              <img
                src={`${BACKEND_BASE}${avatarUrl}`}
                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                alt="avatar"
              />
            ) : (
              <div className="avatar avatar-md">{initials}</div>
            )}
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

            {/* 헤더 아바타 */}
            <div
              onClick={() => router.push('/dashboard/profile')}
              style={{ cursor: 'pointer', flexShrink: 0 }}
            >
              {avatarUrl ? (
                <img
                  src={`${BACKEND_BASE}${avatarUrl}`}
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                  alt="avatar"
                />
              ) : (
                <div className="avatar avatar-md">{initials}</div>
              )}
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
