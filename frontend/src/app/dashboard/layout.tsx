'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const navSections = [
  {
    label: '주요 메뉴',
    items: [
      { href: '/dashboard', icon: '🏠', label: '홈' },
      { href: '/dashboard/diary', icon: '📔', label: '감정 일기' },
      { href: '/dashboard/test', icon: '🧠', label: '자가진단 테스트' },
    ]
  },
  {
    label: '상담 & 소통',
    items: [
      { href: '/dashboard/counsel', icon: '💬', label: '1:1 익명 상담' },
      { href: '/dashboard/community', icon: '👥', label: '커뮤니티' },
      { href: '/dashboard/report', icon: '🚨', label: '익명 신고' },
    ]
  },
  {
    label: '지원',
    items: [
      { href: '/dashboard/crisis', icon: '🆘', label: '위기 지원 센터' },
      { href: '/dashboard/resources', icon: '📚', label: '마음건강 자료실' },
    ]
  },
  {
    label: '설정',
    items: [
      { href: '/dashboard/profile', icon: '👤', label: '내 프로필' },
    ]
  }
];

const roleLabel: Record<string, string> = {
  STUDENT: '학생', TEACHER: '선생님', COUNSELOR: '상담사'
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [pageTitle, setPageTitle] = useState('홈');
  const [lang, setLang] = useState('ko');
  const [showLang, setShowLang] = useState(false);

  const langs = [{ code: 'ko', label: '한국어', flag: '🇰🇷' }, { code: 'en', label: 'English', flag: '🇺🇸' }, { code: 'zh', label: '中文', flag: '🇨🇳' }, { code: 'ja', label: '日本語', flag: '🇯🇵' }];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    const savedLang = localStorage.getItem('lang') || 'ko';
    setLang(savedLang);
  }, []);

  useEffect(() => {
    const titles: Record<string, string> = {
      '/dashboard': '홈',
      '/dashboard/diary': '감정 일기',
      '/dashboard/test': '자가진단 테스트',
      '/dashboard/counsel': '1:1 익명 상담',
      '/dashboard/community': '학생 커뮤니티',
      '/dashboard/report': '익명 신고',
      '/dashboard/crisis': '위기 지원 센터',
      '/dashboard/resources': '마음건강 자료실',
      '/dashboard/profile': '내 프로필',
    };
    setPageTitle(titles[pathname] || '마음이음');
  }, [pathname]);

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

  return (
    <div className="dashboard-layout">
      {/* 사이드바 */}
      <aside className="sidebar">
        {/* 로고 */}
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">💚</span>
          <span className="sidebar-logo-text">마음이음</span>
        </div>

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
              <div className="sidebar-user-role">{roleLabel[user?.role] || '학생'}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{
              width: '100%', marginTop: 8, padding: '8px', borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem', color: 'var(--text-muted)', background: 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'var(--transition)'
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--danger-light)', e.currentTarget.style.color = 'var(--danger)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <span>🚪</span> 로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 영역 */}
      <div className="main-content">
        {/* 상단 헤더 */}
        <header className="top-header">
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{pageTitle}</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>
              {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* 언어 전환 */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowLang(!showLang)} style={{
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
                  boxShadow: 'var(--shadow-lg)', zIndex: 200, minWidth: 130, overflow: 'hidden'
                }}>
                  {langs.map(l => (
                    <button key={l.code} onClick={() => switchLang(l.code)} style={{
                      width: '100%', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: '0.85rem', cursor: 'pointer', background: lang === l.code ? 'var(--primary-light)' : 'transparent',
                      color: lang === l.code ? 'var(--primary)' : 'var(--text-primary)', fontWeight: lang === l.code ? 600 : 400,
                      borderBottom: '1px solid var(--border)', transition: 'var(--transition)'
                    }}>
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* 위기 지원 빠른 버튼 */}
            <button onClick={() => router.push('/dashboard/crisis')} style={{
              height: 36, padding: '0 12px', borderRadius: 'var(--radius-full)',
              background: 'var(--danger-light)', border: '1px solid var(--danger)',
              fontSize: '0.75rem', fontWeight: 700, color: 'var(--danger)', cursor: 'pointer'
            }}>🆘 위기</button>
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
