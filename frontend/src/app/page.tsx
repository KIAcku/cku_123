import Link from 'next/link';

const features = [
  { icon: '📔', title: '감정 일기', desc: '매일 감정을 이모지로 기록하고 나의 마음 흐름을 한눈에 파악해보세요.', color: '#EEF0FF' },
  { icon: '🚨', title: '익명 신고', desc: '학교폭력, 차별 등 부당한 상황을 완전 익명으로 안전하게 신고할 수 있어요.', color: '#FEF2F2' },
  { icon: '👥', title: '학생 커뮤니티', desc: '비슷한 고민을 가진 친구들과 익명으로 소통하고 위로를 주고받아요.', color: '#ECFDF5' },
  { icon: '📊', title: '감정 통계', desc: '일주일, 한 달간의 감정 패턴을 분석해 스스로 마음을 돌볼 수 있어요.', color: '#FFFBEB' },
  { icon: '🔒', title: '완전 익명 보장', desc: '개인 정보를 철저히 보호하며 어떤 데이터도 제3자에게 공유되지 않아요.', color: '#EFF6FF' },
  { icon: '🌱', title: '성장 기록', desc: '감정 일기와 활동 이력을 통해 나의 심리적 성장 과정을 확인하세요.', color: '#F0FDF4' },
];

const stats = [
  { value: '98%', label: '익명성 보장' },
  { value: '24/7', label: '언제든 접속 가능' },
  { value: '0원', label: '완전 무료 서비스' },
  { value: '100%', label: '데이터 암호화' },
];

const targets = [
  { icon: '🎓', title: '학생', items: ['감정 일기로 마음 정리', '익명 고민 상담', '친구들과 커뮤니티'] },
  { icon: '👩‍🏫', title: '선생님', items: ['학생 적응 모니터링', '익명 신고 접수 확인', '학급 분위기 파악'] },
  { icon: '🏫', title: '학교', items: ['학교폭력 조기 감지', '학생 심리 케어 체계', '체계적 보고 시스템'] },
];

export default function LandingPage() {
  return (
    <div style={{ background: 'white' }}>
      {/* 네비게이션 */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.4rem' }}>💚</span>
          <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary)' }}>마음이음</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/login" className="btn btn-ghost btn-sm">로그인</Link>
          <Link href="/signup" className="btn btn-primary btn-sm">무료 시작하기</Link>
        </div>
      </nav>

      {/* 히어로 */}
      <section className="landing-hero">
        <div className="hero-tag">✨ 학생 심리 케어 플랫폼</div>
        <h1 className="hero-title">
          학교생활의 모든 어려움을<br />
          <span>함께 해결해요</span>
        </h1>
        <p className="hero-sub">
          감정 일기, 익명 신고, 학생 커뮤니티까지.<br />
          마음이음이 당신의 학교생활 곁에 있을게요.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" className="btn btn-primary btn-lg">
            무료로 시작하기 →
          </Link>
          <Link href="/login" className="btn btn-outline btn-lg">
            로그인
          </Link>
        </div>
        {/* 히어로 이미지 자리 */}
        <div style={{
          marginTop: 56, maxWidth: 820, margin: '56px auto 0',
          background: 'white', borderRadius: 20, border: '1px solid var(--border)',
          boxShadow: '0 20px 60px rgba(91,95,239,0.12)',
          padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20
        }}>
          {[
            { emoji: '😊', label: '행복해요', count: '142회' },
            { emoji: '📔', label: '이번 달 일기', count: '23개' },
            { emoji: '👥', label: '커뮤니티 글', count: '89개' },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>{item.emoji}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{item.count}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 통계 바 */}
      <div className="stats-bar">
        {stats.map(s => (
          <div key={s.label} className="stat-bar-item">
            <div className="stat-bar-value">{s.value}</div>
            <div className="stat-bar-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 기능 소개 */}
      <section className="feature-section">
        <h2 className="section-title">필요한 모든 기능이 한 곳에</h2>
        <p className="section-sub">마음이음 하나로 학교생활의 모든 어려움을 해결하세요</p>
        <div className="feature-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-card-icon"
                style={{ background: f.color, display: 'inline-flex', padding: '10px', borderRadius: 12 }}>
                {f.icon}
              </div>
              <h3 className="feature-card-title">{f.title}</h3>
              <p className="feature-card-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 대상별 섹션 */}
      <section style={{ padding: '80px 5%', background: 'var(--bg)' }}>
        <h2 className="section-title">누구를 위한 서비스인가요?</h2>
        <p className="section-sub">학생, 선생님, 학교 모두를 위한 통합 케어 솔루션</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, maxWidth: 900, margin: '0 auto' }}>
          {targets.map(t => (
            <div key={t.title} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{t.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>{t.title}</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {t.items.map(item => (
                  <li key={item} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                    <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 5%', textAlign: 'center', background: 'var(--primary)', color: 'white' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>지금 바로 시작해보세요</h2>
        <p style={{ fontSize: '1rem', opacity: 0.85, marginBottom: 32 }}>회원가입 3분, 완전 무료</p>
        <Link href="/signup" style={{
          display: 'inline-block', background: 'white', color: 'var(--primary)',
          padding: '14px 36px', borderRadius: 'var(--radius-lg)',
          fontWeight: 700, fontSize: '1rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          transition: 'var(--transition)'
        }}>
          무료로 시작하기 →
        </Link>
      </section>

      {/* 푸터 */}
      <footer className="landing-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <span>💚</span>
          <span style={{ fontWeight: 700, color: 'white' }}>마음이음</span>
        </div>
        <p>학생 심리 케어 및 학교 적응 지원 플랫폼</p>
        <p style={{ marginTop: 8 }}>© 2026 마음이음. All rights reserved.</p>
      </footer>
    </div>
  );
}
