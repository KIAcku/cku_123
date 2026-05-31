'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const i18n: Record<string, Record<string, any>> = {
  ko: {
    brand: '마음이음',
    login: '로그인',
    start_free: '무료 시작하기',
    hero_tag: '✨ 학생 심리 케어 플랫폼',
    hero_title1: '학교생활의 모든 어려움을',
    hero_title2: '함께 해결해요',
    hero_sub: '감정 일기, 익명 신고, 학생 커뮤니티까지. 마음이음이 당신의 학교생활 곁에 있을게요.',
    start_free_btn: '무료로 시작하기 →',
    happy: '행복해요',
    monthly_diary: '이번 달 일기',
    community_post: '커뮤니티 글',
    anonymity: '익명성 보장',
    always_open: '언제든 접속 가능',
    free_service: '완전 무료 서비스',
    encryption: '데이터 암호화',
    feature_title: '필요한 모든 기능이 한 곳에',
    feature_sub: '마음이음 하나로 학교생활의 모든 어려움을 해결하세요',
    feature_diary_title: '감정 일기',
    feature_diary_desc: '매일 감정을 이모지로 기록하고 나의 마음 흐름을 한눈에 파악해보세요.',
    feature_report_title: '익명 신고',
    feature_report_desc: '학교폭력, 차별 등 부당한 상황을 완전 익명으로 안전하게 신고할 수 있어요.',
    feature_community_title: '학생 커뮤니티',
    feature_community_desc: '비슷한 고민을 가진 친구들과 익명으로 소통하고 위로를 주고받아요.',
    feature_stats_title: '감정 통계',
    feature_stats_desc: '일주일, 한 달간의 감정 패턴을 분석해 스스로 마음을 돌볼 수 있어요.',
    feature_anon_title: '완전 익명 보장',
    feature_anon_desc: '개인 정보를 철저히 보호하며 어떤 데이터도 제3자에게 공유되지 않아요.',
    feature_growth_title: '성장 기록',
    feature_growth_desc: '감정 일기와 활동 이력을 통해 나의 심리적 성장 과정을 확인하세요.',
    target_title: '누구를 위한 서비스인가요?',
    target_sub: '학생, 선생님, 학교 모두를 위한 통합 케어 솔루션',
    target_student: '학생',
    target_student_items: ['감정 일기로 마음 정리', '익명 고민 상담', '친구들과 커뮤니티'],
    target_teacher: '선생님',
    target_teacher_items: ['학생 적응 모니터링', '익명 신고 접수 확인', '학급 분위기 파악'],
    target_school: '학교',
    target_school_items: ['학교폭력 조기 감지', '학생 심리 케어 체계', '체계적 보고 시스템'],
    cta_title: '지금 바로 시작해보세요',
    cta_sub: '회원가입 3분, 완전 무료',
    footer_desc: '학생 심리 케어 및 학교 적응 지원 플랫폼'
  },
  en: {
    brand: 'Maumium',
    login: 'Login',
    start_free: 'Get Started',
    hero_tag: '✨ Student Mental Care Platform',
    hero_title1: 'Solve all difficulties of',
    hero_title2: 'school life together',
    hero_sub: 'From emotion diary, anonymous report, to student community. Maumium will be by your side.',
    start_free_btn: 'Start for Free →',
    happy: 'Happy',
    monthly_diary: 'Monthly Diaries',
    community_post: 'Community Posts',
    anonymity: 'Anonymity Guaranteed',
    always_open: '24/7 Access',
    free_service: 'Fully Free Service',
    encryption: 'Data Encrypted',
    feature_title: 'All features in one place',
    feature_sub: 'Solve all school difficulties with Maumium',
    feature_diary_title: 'Emotion Diary',
    feature_diary_desc: 'Record emotions daily with emojis and check your mental flow at a glance.',
    feature_report_title: 'Anonymous Report',
    feature_report_desc: 'Report bullying or discrimination safely and completely anonymously.',
    feature_community_title: 'Student Community',
    feature_community_desc: 'Connect anonymously and share support with friends facing similar worries.',
    feature_stats_title: 'Emotion Statistics',
    feature_stats_desc: 'Analyze weekly/monthly emotion patterns to take care of your own heart.',
    feature_anon_title: '100% Anonymity',
    feature_anon_desc: 'Strictly protect privacy. None of your data will be shared with third parties.',
    feature_growth_title: 'Growth Record',
    feature_growth_desc: 'Track your mental growth process via emotion diaries and activity logs.',
    target_title: 'Who is this for?',
    target_sub: 'Integrated care solution for students, teachers, and schools',
    target_student: 'Students',
    target_student_items: ['Clear mind with emotion diaries', 'Anonymous counseling', 'Connect in community'],
    target_teacher: 'Teachers',
    target_teacher_items: ['Monitor student adaptation', 'Check anonymous reports', 'Understand class atmosphere'],
    target_school: 'Schools',
    target_school_items: ['Early detection of violence', 'Student mental care system', 'Systematic reporting'],
    cta_title: 'Get Started Today',
    cta_sub: '3 minutes to sign up, fully free',
    footer_desc: 'Student mental care & school adaptation support platform'
  },
  ja: {
    brand: 'マウムイウム',
    login: 'ログイン',
    start_free: '無料で始める',
    hero_tag: '✨ 学生メンタルケアプラットフォーム',
    hero_title1: '学校生活のすべての悩みを',
    hero_title2: '一緒に解決しましょう',
    hero_sub: '感情日記、匿名通報、コミュニティ까지。マウムイウムがあなたの学校生活に寄り添います。',
    start_free_btn: '無料で始める →',
    happy: '嬉しい',
    monthly_diary: '今月の日記',
    community_post: 'コミュニティ投稿',
    anonymity: '匿名性の保証',
    always_open: 'いつでもアクセス可能',
    free_service: '完全無料サービス',
    encryption: 'データ暗号化',
    feature_title: '必要なすべての機能を一つに',
    feature_sub: 'マウムイウム一つで学校生活のすべての悩みを解決しましょう',
    feature_diary_title: '感情日記',
    feature_diary_desc: '毎日の感情を絵文字で記録し、心の変化の流れを一目で把握できます。',
    feature_report_title: '匿名通報',
    feature_report_desc: 'いじめや差別などの不当な状況を完全匿名で安全に通報できます。',
    feature_community_title: '学生コミュニティ',
    feature_community_desc: '似たような悩みを持つ友達と匿名で交流し、お互い励まし合えます。',
    feature_stats_title: '感情統計',
    feature_stats_desc: '一週間、一ヶ月間の感情パターンを分析し、セルフケアを行えます。',
    feature_anon_title: '完全な匿名性保証',
    feature_anon_desc: '個人情報を徹底的に保護し、いかなるデータも第三者と共有されません。',
    feature_growth_title: '成長の記録',
    feature_growth_desc: '感情日記と活動履歴を通じて、心理的な成長過程を確認できます。',
    target_title: '誰のためのサービスですか？',
    target_sub: '学生、先生、学校みんなのための統合ケアソリューション',
    target_student: '学生',
    target_student_items: ['感情日記で心を整理', '匿名での悩み相談', '友達とのコミュニティ'],
    target_teacher: '先生',
    target_teacher_items: ['学生の適応状態のモニタリング', '匿名通報の受付確認', 'クラスの雰囲気把握'],
    target_school: '学校',
    target_school_items: ['いじめの早期検知', '生徒의 メンタルケア体制', '体系的な報告システム'],
    cta_title: '今すぐ始めましょう',
    cta_sub: '会員登録は3分、完全無料',
    footer_desc: '生徒のメンタルケアおよび学校生活適応支援プラットフォーム'
  },
  zh: {
    brand: '心连心',
    login: '登录',
    start_free: '免费开始',
    hero_tag: '✨ 学生心理关怀平台',
    hero_title1: '共同解决学校生活的',
    hero_title2: '所有困难',
    hero_sub: '从心情日记、匿名举报到学生社区。心连心将陪伴您的学校生活。',
    start_free_btn: '免费开始使用 →',
    happy: '开心',
    monthly_diary: '本月日记',
    community_post: '社区帖子',
    anonymity: '保障匿名性',
    always_open: '随时可以访问',
    free_service: '完全免费服务',
    encryption: '数据加密保护',
    feature_title: '所有功能，一应俱全',
    feature_sub: '只需心连心，即可解决学校生活的所有难题',
    feature_diary_title: '心情日记',
    feature_diary_desc: '每天用表情符号记录心情，一目了然地掌握自己的心理变化趋势。',
    feature_report_title: '匿名举报',
    feature_report_desc: '完全匿名、安全地举报校园暴力、歧视等不公情况。',
    feature_community_title: '学生社区',
    feature_community_desc: '与面临类似烦恼的朋友匿名交流，互相给予安慰和鼓励。',
    feature_stats_title: '情绪统计',
    feature_stats_desc: '分析一周或一个月的心情模式，学会自我关怀与调节。',
    feature_anon_title: '完全匿名保障',
    feature_anon_desc: '严格保护个人隐私，绝不与任何第三方共享您的数据。',
    feature_growth_title: '成长记录',
    feature_growth_desc: '通过情绪日记和活动历史，查看自己的心理成长历程。',
    target_title: '这是为谁设计的？',
    target_sub: '面向学生、老师和学校的一体化关怀解决方案',
    target_student: '学生',
    target_student_items: ['用情绪日记整理思绪', '匿名烦恼咨询', '与朋友们社区互动'],
    target_teacher: '老师',
    target_teacher_items: ['监测学生适应情况', '确认匿名举报接获', '了解班级氛围动向'],
    target_school: '学校',
    target_school_items: ['校园暴力早期预警', '学生心理关怀体系', '系统化的报告机制'],
    cta_title: '今天就立即开始吧',
    cta_sub: '注册只需3分钟，完全免费',
    footer_desc: '学生心理关怀与学校生活适应支持平台'
  }
};

export default function LandingPage() {
  const [lang, setLang] = useState('ko');
  const t = i18n[lang] || i18n.ko;

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') || 'ko';
    setLang(savedLang);

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

  const features = [
    { icon: '📔', title: t.feature_diary_title, desc: t.feature_diary_desc, color: '#EEF0FF' },
    { icon: '🚨', title: t.feature_report_title, desc: t.feature_report_desc, color: '#FEF2F2' },
    { icon: '👥', title: t.feature_community_title, desc: t.feature_community_desc, color: '#ECFDF5' },
    { icon: '📊', title: t.feature_stats_title, desc: t.feature_stats_desc, color: '#FFFBEB' },
    { icon: '🔒', title: t.feature_anon_title, desc: t.feature_anon_desc, color: '#EFF6FF' },
    { icon: '🌱', title: t.feature_growth_title, desc: t.feature_growth_desc, color: '#F0FDF4' },
  ];

  const stats = [
    { value: '98%', label: t.anonymity },
    { value: '24/7', label: t.always_open },
    { value: '0원', label: t.free_service },
    { value: '100%', label: t.encryption },
  ];

  const targets = [
    { icon: '🎓', title: t.target_student, items: t.target_student_items },
    { icon: '👩‍🏫', title: t.target_teacher, items: t.target_teacher_items },
    { icon: '🏫', title: t.target_school, items: t.target_school_items },
  ];

  return (
    <div style={{ background: 'white' }}>
      {/* 네비게이션 */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.4rem' }}>💚</span>
          <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary)' }}>{t.brand}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/login" className="btn btn-ghost btn-sm">{t.login}</Link>
          <Link href="/signup" className="btn btn-primary btn-sm">{t.start_free}</Link>
        </div>
      </nav>

      {/* 히어로 */}
      <section className="landing-hero">
        <div className="hero-tag">{t.hero_tag}</div>
        <h1 className="hero-title">
          {t.hero_title1}<br />
          <span>{t.hero_title2}</span>
        </h1>
        <p className="hero-sub">{t.hero_sub}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" className="btn btn-primary btn-lg">
            {t.start_free_btn}
          </Link>
          <Link href="/login" className="btn btn-outline btn-lg">
            {t.login}
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
            { emoji: '😊', label: t.happy, count: lang === 'ko' ? '142회' : lang === 'zh' ? '142次' : '142' },
            { emoji: '📔', label: t.monthly_diary, count: lang === 'ko' ? '23개' : lang === 'zh' ? '23个' : '23' },
            { emoji: '👥', label: t.community_post, count: lang === 'ko' ? '89개' : lang === 'zh' ? '89个' : '89' },
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
        <h2 className="section-title">{t.feature_title}</h2>
        <p className="section-sub">{t.feature_sub}</p>
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
        <h2 className="section-title">{t.target_title}</h2>
        <p className="section-sub">{t.target_sub}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, maxWidth: 900, margin: '0 auto' }}>
          {targets.map(target => (
            <div key={target.title} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{target.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>{target.title}</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {target.items.map((item: string) => (
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
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>{t.cta_title}</h2>
        <p style={{ fontSize: '1rem', opacity: 0.85, marginBottom: 32 }}>{t.cta_sub}</p>
        <Link href="/signup" style={{
          display: 'inline-block', background: 'white', color: 'var(--primary)',
          padding: '14px 36px', borderRadius: 'var(--radius-lg)',
          fontWeight: 700, fontSize: '1rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          transition: 'var(--transition)'
        }}>
          {t.start_free_btn}
        </Link>
      </section>

      {/* 푸터 */}
      <footer className="landing-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <span>💚</span>
          <span style={{ fontWeight: 700, color: 'white' }}>{t.brand}</span>
        </div>
        <p>{t.footer_desc}</p>
        <p style={{ marginTop: 8 }}>© 2026 {t.brand}. All rights reserved.</p>
      </footer>
    </div>
  );
}
