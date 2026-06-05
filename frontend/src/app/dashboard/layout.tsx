'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLangStore } from '@/store/langStore';
import { useThemeStore } from '@/store/themeStore';
import NoticePopup from '@/components/NoticePopup';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://studentcare-production.up.railway.app/api/v1';
const BACKEND_BASE = API.replace('/api/v1', '');

// ─── 다국어 번역 ──────────────────────────────────────────────
const i18n: Record<string, Record<string, string>> = {
  ko: {
    home: '홈', diary: '감정 일기', test: '자가진단',
    counsel: '1:1 상담', community: '커뮤니티', report: '익명 신고',
    crisis: '위기 지원', resources: '자료실', profile: '내 프로필',
    main_menu: '메인', counseling: '소통', support: '지원', settings: '설정',
    logout: '로그아웃', student: '학생', teacher: '선생님', counselor: '상담사',
    report_mgmt: '신고 관리', counsel_reports: '상담 보고서',
    statistics: '통계', students: '학생 목록', notices: '공지 관리',
    counsel_mgmt: '상담 관리', help: '도움말',
  },
  en: {
    home: 'Home', diary: 'Emotion Diary', test: 'Self-Check',
    counsel: '1:1 Counsel', community: 'Community', report: 'Report',
    crisis: 'Crisis', resources: 'Resources', profile: 'Profile',
    main_menu: 'Main', counseling: 'Connect', support: 'Support', settings: 'Settings',
    logout: 'Logout', student: 'Student', teacher: 'Teacher', counselor: 'Counselor',
    report_mgmt: 'Reports', counsel_reports: 'Counsel Reports',
    statistics: 'Statistics', students: 'Students', notices: 'Notices',
    counsel_mgmt: 'Counseling', help: 'Help',
  },
  ja: {
    home: 'ホーム', diary: '感情日記', test: '自己診断',
    counsel: '1:1相談', community: 'コミュニティ', report: '匿名報告',
    crisis: '危機支援', resources: '資料室', profile: 'プロフィール',
    main_menu: 'メイン', counseling: '交流', support: 'サポート', settings: '設定',
    logout: 'ログアウト', student: '学生', teacher: '先生', counselor: 'カウンセラー',
    report_mgmt: '通報管理', counsel_reports: '相談報告',
    statistics: '統計', students: '学生一覧', notices: 'お知らせ',
    counsel_mgmt: '相談管理', help: 'ヘルプ',
  },
  zh: {
    home: '首页', diary: '情绪日记', test: '自评',
    counsel: '1:1咨询', community: '社区', report: '举报',
    crisis: '危机支援', resources: '资料室', profile: '我的资料',
    main_menu: '主页', counseling: '交流', support: '支持', settings: '设置',
    logout: '退出', student: '学生', teacher: '教师', counselor: '咨询师',
    report_mgmt: '举报管理', counsel_reports: '咨询报告',
    statistics: '统计', students: '学生列表', notices: '公告',
    counsel_mgmt: '咨询管理', help: '帮助',
  },
};

const getNavSections = (t: Record<string, string>) => [
  {
    label: t.main_menu,
    items: [
      { href: '/dashboard',           icon: '🏠', label: t.home },
      { href: '/dashboard/diary',     icon: '📔', label: t.diary },
      { href: '/dashboard/test',      icon: '🧠', label: t.test },
    ]
  },
  {
    label: t.counseling,
    items: [
      { href: '/dashboard/counsel',   icon: '💬', label: t.counsel },
      { href: '/dashboard/community', icon: '👥', label: t.community },
      { href: '/dashboard/report',    icon: '🚨', label: t.report },
    ]
  },
  {
    label: t.support,
    items: [
      { href: '/dashboard/crisis',    icon: '🆘', label: t.crisis },
      { href: '/dashboard/resources', icon: '📚', label: t.resources },
      { href: '/dashboard/help',      icon: '❓', label: t.help },
    ]
  },
  {
    label: t.settings,
    items: [
      { href: '/dashboard/profile',   icon: '👤', label: t.profile },
    ]
  }
];

const getCounselorSections = (t: Record<string, string>) => [
  {
    label: '상담사',
    items: [
      { href: '/dashboard',             icon: '🏠', label: t.home },
      { href: '/dashboard/counselor',   icon: '📨', label: t.counsel_mgmt },
      { href: '/dashboard/diary',       icon: '📔', label: t.diary },
      { href: '/dashboard/resources',   icon: '📚', label: t.resources },
      { href: '/dashboard/crisis',      icon: '🆘', label: t.crisis },
      { href: '/dashboard/help',        icon: '❓', label: t.help },
      { href: '/dashboard/profile',     icon: '👤', label: t.profile },
    ]
  }
];

const getTeacherSections = (t: Record<string, string>) => [
  {
    label: '선생님',
    items: [
      { href: '/dashboard',                        icon: '🏠', label: t.home },
      { href: '/dashboard/admin/reports',          icon: '🚨', label: t.report_mgmt },
      { href: '/dashboard/admin/counsel-reports',  icon: '📋', label: t.counsel_reports },
      { href: '/dashboard/admin/statistics',       icon: '📊', label: t.statistics },
      { href: '/dashboard/admin/students',         icon: '👥', label: t.students },
      { href: '/dashboard/admin/notices',          icon: '📢', label: t.notices },
      { href: '/dashboard/profile',                icon: '👤', label: t.profile },
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

const pageTitleMap = (t: Record<string, string>): Record<string, string> => ({
  '/dashboard': t.home,
  '/dashboard/diary': t.diary,
  '/dashboard/test': t.test,
  '/dashboard/counsel': t.counsel,
  '/dashboard/community': t.community,
  '/dashboard/report': t.report,
  '/dashboard/crisis': t.crisis,
  '/dashboard/resources': t.resources,
  '/dashboard/profile': t.profile,
  '/dashboard/counselor': t.counsel_mgmt,
  '/dashboard/admin/reports': t.report_mgmt,
  '/dashboard/admin/counsel-reports': t.counsel_reports,
  '/dashboard/admin/statistics': t.statistics,
  '/dashboard/admin/students': t.students,
  '/dashboard/admin/notices': t.notices,
  '/dashboard/help': t.help,
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang } = useLangStore();
  const { theme, toggleTheme } = useThemeStore();
  const [user, setUser] = useState<any>(null);
  const [showLang, setShowLang] = useState(false);
  const [unread, setUnread] = useState({ messages: 0, reports: 0, alerts: 0 });
  const [sidebarHovered, setSidebarHovered] = useState(false);

  const t = i18n[lang] || i18n.ko;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    const savedLang = localStorage.getItem('lang') || 'ko';
    setLang(savedLang);
  }, []);

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

  const switchLang = (code: string) => {
    setLang(code);
    localStorage.setItem('lang', code);
    setShowLang(false);
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

  const avatarUrl = user?.avatar_url;
  const pageTitle = pageTitleMap(t)[pathname] || '마음이음';
  const dateStr = new Date().toLocaleDateString(
    lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
  );

  return (
    <div className="dashboard-layout" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* 오로라 배경 */}
      <div className="aurora-bg">
        <div className="aurora-blob-center" />
      </div>

      {/* 나노 사이드바 */}
      <motion.aside
        className="nano-sidebar"
        onHoverStart={() => setSidebarHovered(true)}
        onHoverEnd={() => setSidebarHovered(false)}
        animate={{ width: sidebarHovered ? 240 : 64 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ overflow: 'hidden' }}
      >
        {/* 로고 */}
        <div className="nano-sidebar-logo">
          <div className="nano-logo-icon">💜</div>
          <motion.span
            className="nano-logo-text"
            animate={{ opacity: sidebarHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            마음이음
          </motion.span>
        </div>

        {/* 역할 배지 (확장 시 표시) */}
        <AnimatePresence>
          {sidebarHovered && (isTeacher || isCounselor) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                margin: '0 8px 8px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.72rem',
                fontWeight: 700,
                textAlign: 'center',
                background: isCounselor ? 'rgba(251,191,36,0.1)' : 'rgba(96,165,250,0.1)',
                color: isCounselor ? 'var(--warning)' : 'var(--info)',
                border: `1px solid ${isCounselor ? 'rgba(251,191,36,0.2)' : 'rgba(96,165,250,0.2)'}`,
                whiteSpace: 'nowrap',
              }}
            >
              {isCounselor ? '👩‍💼 상담사 계정' : '🏫 선생님 계정'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 네비게이션 */}
        <nav className="nano-nav">
          {navSections.map((section) => (
            <div key={section.label} style={{ marginBottom: 8 }}>
              <motion.div
                className="nano-section-label"
                animate={{ opacity: sidebarHovered ? 1 : 0 }}
                transition={{ duration: 0.15 }}
              >
                {section.label}
              </motion.div>
              {section.items.map((item) => {
                const isActive = item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);
                const badge = item.href === '/dashboard/counselor' ? unread.messages
                  : item.href === '/dashboard/admin/reports' ? unread.reports : 0;
                return (
                  <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                    <div className={`nano-nav-item ${isActive ? 'active' : ''}`}>
                      <div className="nano-nav-icon">{item.icon}</div>
                      <motion.span
                        className="nano-nav-label"
                        animate={{ opacity: sidebarHovered ? 1 : 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {item.label}
                      </motion.span>
                      {badge > 0 && (
                        <motion.span
                          className="nano-badge"
                          animate={{ opacity: sidebarHovered ? 1 : 0 }}
                        >
                          {badge > 99 ? '99+' : badge}
                        </motion.span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* 사이드바 하단 */}
        <div className="nano-sidebar-footer">
          {/* 프로필 */}
          <div className="nano-user-item" onClick={() => router.push('/dashboard/profile')}>
            {avatarUrl ? (
              <img
                src={`${BACKEND_BASE}${avatarUrl}`}
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                alt="avatar"
              />
            ) : (
              <div className="avatar avatar-sm">{initials}</div>
            )}
            <motion.div
              className="nano-user-info"
              animate={{ opacity: sidebarHovered ? 1 : 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="nano-user-name truncate">{user?.nickname || '익명학생'}</div>
              <div className="nano-user-role">{roleLabel(lang, user?.role || 'STUDENT')}</div>
            </motion.div>
          </div>

          {/* 로그아웃 */}
          <div
            className="nano-nav-item"
            onClick={handleLogout}
            style={{ marginTop: 4 }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--danger-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.background = ''}
          >
            <div className="nano-nav-icon" style={{ fontSize: '1rem' }}>🚪</div>
            <motion.span
              className="nano-nav-label"
              animate={{ opacity: sidebarHovered ? 1 : 0 }}
              transition={{ duration: 0.15 }}
              style={{ color: 'var(--danger)' }}
            >
              {t.logout}
            </motion.span>
          </div>
        </div>
      </motion.aside>

      {/* 메인 영역 */}
      <div className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        {/* 글래스 헤더 */}
        <header className="top-header">
          <div>
            <h1 className="header-title">{pageTitle}</h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{dateStr}</p>
          </div>
          <div className="header-actions">

            {/* 위기 버튼 */}
            <button
              onClick={() => router.push('/dashboard/crisis')}
              className="btn btn-sm"
              style={{
                background: 'var(--danger-bg)',
                color: 'var(--danger)',
                border: '1px solid rgba(255,77,109,0.25)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              🆘 위기
            </button>

            {/* 공지사항 팝업 */}
            <NoticePopup lang={lang} />

            {/* 언어 선택 */}
            <div style={{ position: 'relative' }}>
              <button
                className="header-icon-btn"
                onClick={() => setShowLang(!showLang)}
                title="언어 선택"
                style={{ fontSize: '0.75rem', fontWeight: 700, width: 'auto', padding: '0 10px', gap: 4 }}
              >
                {langs.find(l => l.code === lang)?.flag} {lang.toUpperCase()}
              </button>
              <AnimatePresence>
                {showLang && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute', right: 0, top: 46,
                      background: 'var(--bg-layer3)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-lg)',
                      backdropFilter: 'blur(24px)',
                      zIndex: 300, minWidth: 150,
                      overflow: 'hidden',
                      boxShadow: 'var(--glass-shadow)',
                    }}
                  >
                    {langs.map((l) => (
                      <button key={l.code} onClick={() => switchLang(l.code)} style={{
                        width: '100%', padding: '10px 16px',
                        display: 'flex', alignItems: 'center', gap: 10,
                        fontSize: '0.85rem', cursor: 'pointer', border: 'none',
                        background: lang === l.code ? 'var(--glass-bg-active)' : 'transparent',
                        color: lang === l.code ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: lang === l.code ? 700 : 400,
                        fontFamily: 'inherit',
                        transition: 'var(--transition)',
                        borderBottom: '1px solid var(--glass-border)',
                      }}>
                        {l.flag} {l.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 다크/라이트 토글 */}
            <button
              className="header-icon-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? '라이트 모드' : '다크 모드'}
            >
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                {theme === 'dark' ? '🌙' : '☀️'}
              </motion.span>
            </button>

            {/* 프로필 아바타 */}
            <div onClick={() => router.push('/dashboard/profile')} style={{ cursor: 'pointer' }}>
              {avatarUrl ? (
                <img
                  src={`${BACKEND_BASE}${avatarUrl}`}
                  style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', display: 'block', border: '2px solid var(--glass-border)' }}
                  alt="avatar"
                />
              ) : (
                <div className="avatar avatar-sm" style={{
                  width: 38, height: 38, fontSize: '0.95rem',
                  boxShadow: '0 0 0 2px var(--glass-border)',
                }}>
                  {initials}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main style={{ flex: 1 }} key={lang}>
          {children}
        </main>
      </div>

      {/* 드롭다운 외부 클릭 닫기 */}
      {showLang && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 250 }}
          onClick={() => setShowLang(false)}
        />
      )}
    </div>
  );
}
