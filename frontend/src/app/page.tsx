'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const i18n: Record<string, Record<string, any>> = {
  ko: {
    brand: '마음이음', login: '로그인', start_free: '무료 시작하기',
    hero_tag: '✨ 학생 심리 케어 플랫폼',
    hero_title1: '학교생활의 모든 어려움을',
    hero_title2: '함께 해결해요',
    hero_sub: '감정 일기, 익명 신고, 학생 커뮤니티까지. 마음이음이 당신의 학교생활 곁에 있을게요.',
    start_free_btn: '무료로 시작하기',
    feature_title: '필요한 모든 기능이 한 곳에',
    feature_sub: '마음이음 하나로 학교생활의 모든 어려움을 해결하세요',
    feature_diary_title: '감정 일기',
    feature_diary_desc: '매일 감정을 이모지로 기록하고 나의 마음 흐름을 한눈에 파악해보세요.',
    feature_report_title: '익명 신고',
    feature_report_desc: '학교폭력, 차별 등 부당한 상황을 완전 익명으로 안전하게 신고할 수 있어요.',
    feature_community_title: '학생 커뮤니티',
    feature_community_desc: '비슷한 고민을 가진 친구들과 익명으로 소통하고 위로를 주고받아요.',
    feature_counsel_title: '1:1 익명 상담',
    feature_counsel_desc: '전문 상담사와 익명으로 대화하며 마음의 짐을 함께 덜어내요.',
    feature_anon_title: '완전 익명 보장',
    feature_anon_desc: '개인 정보를 철저히 보호하며 어떤 데이터도 제3자에게 공유되지 않아요.',
    feature_growth_title: '감정 통계',
    feature_growth_desc: '주간/월간 감정 패턴을 분석해 스스로 마음을 돌볼 수 있도록 도와드려요.',
    target_title: '누구를 위한 서비스인가요?',
    target_sub: '학생, 선생님, 학교 모두를 위한 통합 케어 솔루션',
    target_student: '학생', target_teacher: '선생님', target_school: '학교',
    target_student_items: ['감정 일기로 마음 정리', '익명 고민 상담', '친구들과 커뮤니티'],
    target_teacher_items: ['학생 적응 모니터링', '익명 신고 접수 확인', '학급 분위기 파악'],
    target_school_items: ['학교폭력 조기 감지', '학생 심리 케어 체계', '체계적 보고 시스템'],
    cta_title: '지금 바로 시작해보세요',
    cta_sub: '회원가입 3분, 완전 무료',
    footer_desc: '학생 심리 케어 및 학교 적응 지원 플랫폼',
    stat1: '98%', stat1l: '익명성 보장',
    stat2: '24/7', stat2l: '언제든 접속',
    stat3: '0원', stat3l: '완전 무료',
    stat4: '100%', stat4l: '데이터 암호화',
  },
  en: {
    brand: 'Maumium', login: 'Login', start_free: 'Get Started',
    hero_tag: '✨ Student Mental Care Platform',
    hero_title1: 'Solve all difficulties of',
    hero_title2: 'school life together',
    hero_sub: 'From emotion diary, anonymous reports, to student community. Maumium will be by your side.',
    start_free_btn: 'Start for Free',
    feature_title: 'All features in one place',
    feature_sub: 'Solve all school difficulties with Maumium',
    feature_diary_title: 'Emotion Diary',
    feature_diary_desc: 'Record daily emotions with emojis and see your mental flow at a glance.',
    feature_report_title: 'Anonymous Report',
    feature_report_desc: 'Report bullying and discrimination safely and completely anonymously.',
    feature_community_title: 'Student Community',
    feature_community_desc: 'Connect anonymously and share support with friends facing similar worries.',
    feature_counsel_title: '1:1 Anonymous Counsel',
    feature_counsel_desc: 'Talk with professional counselors anonymously and share your burdens.',
    feature_anon_title: '100% Anonymity',
    feature_anon_desc: 'Strictly protect personal data. None of your data is shared with third parties.',
    feature_growth_title: 'Emotion Statistics',
    feature_growth_desc: 'Analyze weekly/monthly patterns to take care of your own mental health.',
    target_title: 'Who is this for?',
    target_sub: 'Integrated care solution for students, teachers, and schools',
    target_student: 'Students', target_teacher: 'Teachers', target_school: 'Schools',
    target_student_items: ['Clear mind with diaries', 'Anonymous counseling', 'Connect in community'],
    target_teacher_items: ['Monitor student adaptation', 'Check anonymous reports', 'Understand class atmosphere'],
    target_school_items: ['Early violence detection', 'Student mental care system', 'Systematic reporting'],
    cta_title: 'Get Started Today',
    cta_sub: '3 minutes to sign up, fully free',
    footer_desc: 'Student mental care & school adaptation support platform',
    stat1: '98%', stat1l: 'Anonymity', stat2: '24/7', stat2l: 'Always Open',
    stat3: 'Free', stat3l: 'No Cost', stat4: '100%', stat4l: 'Encrypted',
  },
  ja: {
    brand: 'マウムイウム', login: 'ログイン', start_free: '無料で始める',
    hero_tag: '✨ 学生メンタルケアプラットフォーム',
    hero_title1: '学校生活のすべての悩みを',
    hero_title2: '一緒に解決しましょう',
    hero_sub: '感情日記、匿名通報、コミュニティまで。マウムイウムがあなたの学校生活に寄り添います。',
    start_free_btn: '無料で始める',
    feature_title: '必要なすべての機能を一つに',
    feature_sub: 'マウムイウム一つで学校生活のすべての悩みを解決しましょう',
    feature_diary_title: '感情日記', feature_diary_desc: '毎日の感情を絵文字で記録し、心の流れを把握できます。',
    feature_report_title: '匿名通報', feature_report_desc: 'いじめや差別を完全匿名で安全に通報できます。',
    feature_community_title: '学生コミュニティ', feature_community_desc: '悩みを持つ友達と匿名で交流し励まし合えます。',
    feature_counsel_title: '1:1匿名相談', feature_counsel_desc: '専門カウンセラーと匿名で相談できます。',
    feature_anon_title: '完全匿名保証', feature_anon_desc: '個人情報を徹底保護し、第三者と共有しません。',
    feature_growth_title: '感情統計', feature_growth_desc: '週次・月次の感情パターンを分析しセルフケアに活かせます。',
    target_title: '誰のためのサービスですか？',
    target_sub: '学生、先生、学校みんなのための統合ケアソリューション',
    target_student: '学生', target_teacher: '先生', target_school: '学校',
    target_student_items: ['感情日記で心を整理', '匿名での悩み相談', '友達とのコミュニティ'],
    target_teacher_items: ['学生の適応モニタリング', '匿名通報の確認', 'クラスの雰囲気把握'],
    target_school_items: ['いじめの早期検知', '生徒のメンタルケア', '体系的な報告システム'],
    cta_title: '今すぐ始めましょう',
    cta_sub: '会員登録は3分、完全無料',
    footer_desc: '生徒のメンタルケアおよび学校生活適応支援プラットフォーム',
    stat1: '98%', stat1l: '匿名性保証', stat2: '24/7', stat2l: 'いつでも',
    stat3: '無料', stat3l: 'コスト0円', stat4: '100%', stat4l: '暗号化',
  },
  zh: {
    brand: '心连心', login: '登录', start_free: '免费开始',
    hero_tag: '✨ 学生心理关怀平台',
    hero_title1: '共同解决学校生活的',
    hero_title2: '所有困难',
    hero_sub: '从心情日记、匿名举报到学生社区。心连心将陪伴您的学校生活。',
    start_free_btn: '免费开始使用',
    feature_title: '所有功能，一应俱全',
    feature_sub: '只需心连心，即可解决学校生活的所有难题',
    feature_diary_title: '心情日记', feature_diary_desc: '每天用表情符号记录心情，一目了然掌握心理变化。',
    feature_report_title: '匿名举报', feature_report_desc: '完全匿名、安全地举报校园暴力等不公情况。',
    feature_community_title: '学生社区', feature_community_desc: '与面临类似烦恼的朋友匿名交流互相鼓励。',
    feature_counsel_title: '1:1匿名咨询', feature_counsel_desc: '与专业咨询师匿名交流，共同减轻心理负担。',
    feature_anon_title: '完全匿名保障', feature_anon_desc: '严格保护个人隐私，绝不与任何第三方共享数据。',
    feature_growth_title: '情绪统计', feature_growth_desc: '分析周次/月次心情模式，学会自我关怀与调节。',
    target_title: '这是为谁设计的？',
    target_sub: '面向学生、老师和学校的一体化关怀解决方案',
    target_student: '学生', target_teacher: '老师', target_school: '学校',
    target_student_items: ['用情绪日记整理思绪', '匿名烦恼咨询', '与朋友们社区互动'],
    target_teacher_items: ['监测学生适应情况', '确认匿名举报', '了解班级氛围动向'],
    target_school_items: ['校园暴力早期预警', '学生心理关怀体系', '系统化的报告机制'],
    cta_title: '今天就立即开始吧',
    cta_sub: '注册只需3分钟，完全免费',
    footer_desc: '学生心理关怀与学校生活适应支持平台',
    stat1: '98%', stat1l: '匿名保障', stat2: '24/7', stat2l: '随时访问',
    stat3: '免费', stat3l: '完全免费', stat4: '100%', stat4l: '数据加密',
  }
};

const featureGrads = [
  'linear-gradient(135deg,#FF6B35,#FF2D78)',
  'linear-gradient(135deg,#FF2D78,#9333EA)',
  'linear-gradient(135deg,#3B82F6,#6366F1)',
  'linear-gradient(135deg,#9333EA,#6D28D9)',
  'linear-gradient(135deg,#10B981,#3B82F6)',
  'linear-gradient(135deg,#FBBF24,#FF6B35)',
];

const langs = [
  { code: 'ko', flag: '🇰🇷', label: '한국어' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'ja', flag: '🇯🇵', label: '日本語' },
  { code: 'zh', flag: '🇨🇳', label: '中文' },
];

export default function LandingPage() {
  const [lang, setLang] = useState('ko');
  const [showLang, setShowLang] = useState(false);
  const t = i18n[lang] || i18n.ko;

  useEffect(() => {
    const saved = localStorage.getItem('lang') || 'ko';
    setLang(saved);
  }, []);

  const switchLang = (code: string) => {
    setLang(code);
    localStorage.setItem('lang', code);
    setShowLang(false);
  };

  const features = [
    { icon: '📔', title: t.feature_diary_title, desc: t.feature_diary_desc },
    { icon: '🚨', title: t.feature_report_title, desc: t.feature_report_desc },
    { icon: '👥', title: t.feature_community_title, desc: t.feature_community_desc },
    { icon: '💬', title: t.feature_counsel_title, desc: t.feature_counsel_desc },
    { icon: '🔒', title: t.feature_anon_title, desc: t.feature_anon_desc },
    { icon: '📊', title: t.feature_growth_title, desc: t.feature_growth_desc },
  ];

  const targets = [
    { icon: '🎓', title: t.target_student, items: t.target_student_items, grad: 'linear-gradient(135deg,#FF6B35,#FF2D78)' },
    { icon: '👩‍🏫', title: t.target_teacher, items: t.target_teacher_items, grad: 'linear-gradient(135deg,#9333EA,#6D28D9)' },
    { icon: '🏫', title: t.target_school, items: t.target_school_items, grad: 'linear-gradient(135deg,#3B82F6,#6366F1)' },
  ];

  const stats = [
    { value: t.stat1, label: t.stat1l },
    { value: t.stat2, label: t.stat2l },
    { value: t.stat3, label: t.stat3l },
    { value: t.stat4, label: t.stat4l },
  ];

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* 오로라 배경 */}
      <div className="aurora-bg">
        <div className="aurora-blob-center" />
      </div>

      {/* ── 네비게이션 ── */}
      <nav className="landing-nav" style={{ position: 'sticky', top: 0, zIndex: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg,#FF6B35,#FF2D78,#9333EA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
          }}>💜</div>
          <span style={{
            fontWeight: 800, fontSize: '1.15rem',
            background: 'linear-gradient(135deg,#FF6B35,#FF2D78,#9333EA)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
          }}>{t.brand}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* 언어 선택 */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowLang(!showLang)}
              className="btn-glass btn btn-sm"
              style={{ fontSize: '0.75rem', fontWeight: 700 }}
            >
              {langs.find(l => l.code === lang)?.flag} {lang.toUpperCase()}
            </button>
            {showLang && (
              <div style={{
                position: 'absolute', right: 0, top: 42,
                background: 'var(--bg-layer3)', border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-lg)', backdropFilter: 'blur(24px)',
                zIndex: 300, minWidth: 140, overflow: 'hidden',
                boxShadow: 'var(--glass-shadow)',
              }}>
                {langs.map(l => (
                  <button key={l.code} onClick={() => switchLang(l.code)} style={{
                    width: '100%', padding: '9px 14px',
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: '0.85rem', cursor: 'pointer', border: 'none',
                    background: lang === l.code ? 'var(--glass-bg-active)' : 'transparent',
                    color: lang === l.code ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: lang === l.code ? 700 : 400, fontFamily: 'inherit',
                    borderBottom: '1px solid var(--glass-border)',
                  }}>
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link href="/login">
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--text-secondary)' }}>{t.login}</button>
          </Link>
          <Link href="/signup">
            <button className="btn btn-sunset btn-sm">{t.start_free}</button>
          </Link>
        </div>
      </nav>
      {showLang && <div style={{ position: 'fixed', inset: 0, zIndex: 250 }} onClick={() => setShowLang(false)} />}

      {/* ── 히어로 섹션 ── */}
      <section style={{ padding: '100px 6% 80px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* 태그 */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)',
            borderRadius: 'var(--radius-full)', padding: '8px 18px',
            fontSize: '0.82rem', fontWeight: 600, color: 'var(--sunset-pink)',
            marginBottom: 28,
          }}>
            {t.hero_tag}
          </div>

          {/* 제목 */}
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 900,
            lineHeight: 1.15, letterSpacing: '-0.03em',
            color: 'var(--text-primary)', marginBottom: 8,
          }}>
            {t.hero_title1}
            <br />
            <span style={{
              background: 'linear-gradient(135deg,#FF6B35,#FF2D78,#9333EA)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {t.hero_title2}
            </span>
          </h1>

          {/* 설명 */}
          <p style={{
            fontSize: '1.05rem', color: 'var(--text-secondary)',
            maxWidth: 540, margin: '20px auto 40px', lineHeight: 1.75,
          }}>
            {t.hero_sub}
          </p>

          {/* CTA 버튼 */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup">
              <motion.button
                className="btn btn-sunset btn-xl"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {t.start_free_btn} →
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button
                className="btn btn-glass btn-xl"
                whileHover={{ scale: 1.02 }}
              >
                {t.login}
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* 히어로 글래스 카드 위젯 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          style={{
            maxWidth: 860, margin: '60px auto 0',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(24px)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-2xl)',
            padding: '36px',
            display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20,
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              style={{ textAlign: 'center', padding: '16px 8px' }}
            >
              <div style={{
                fontSize: '2rem', fontWeight: 900, marginBottom: 6,
                background: 'linear-gradient(135deg,#FF6B35,#FF2D78,#9333EA)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── 기능 섹션 ── */}
      <section style={{ padding: '80px 6%', position: 'relative', zIndex: 1 }}>
        <h2 className="section-title" style={{ color: 'var(--text-primary)' }}>{t.feature_title}</h2>
        <p className="section-sub">{t.feature_sub}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="glass-card"
              style={{ padding: 28, cursor: 'default' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -6 }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 'var(--radius-lg)',
                background: featureGrads[i], display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.6rem', marginBottom: 18,
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 10, color: 'var(--text-primary)' }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 대상별 섹션 ── */}
      <section style={{ padding: '80px 6%', position: 'relative', zIndex: 1 }}>
        <h2 className="section-title" style={{ color: 'var(--text-primary)' }}>{t.target_title}</h2>
        <p className="section-sub">{t.target_sub}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, maxWidth: 900, margin: '0 auto' }}>
          {targets.map((tgt, i) => (
            <motion.div
              key={tgt.title}
              className="glass-card"
              style={{ padding: 32, textAlign: 'center' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              whileHover={{ y: -4 }}
            >
              <div style={{
                width: 60, height: 60, borderRadius: 'var(--radius-xl)',
                background: tgt.grad, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
              }}>
                {tgt.icon}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16, color: 'var(--text-primary)' }}>{tgt.title}</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tgt.items.map((item: string) => (
                  <li key={item} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <span style={{ color: 'var(--sunset-pink)', fontWeight: 700 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA 섹션 ── */}
      <section style={{ padding: '80px 6%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(255,45,120,0.15), rgba(147,51,234,0.15))',
          border: '1px solid rgba(255,45,120,0.2)',
          borderRadius: 'var(--radius-2xl)', padding: '64px 40px',
          backdropFilter: 'blur(24px)', maxWidth: 800, margin: '0 auto',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* 배경 글로우 */}
          <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 400, height: 200, background: 'radial-gradient(circle, rgba(255,45,120,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 900, marginBottom: 12, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
          >
            {t.cta_title}
          </motion.h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: 36 }}>{t.cta_sub}</p>
          <Link href="/signup">
            <motion.button
              className="btn btn-sunset btn-xl"
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              {t.start_free_btn} →
            </motion.button>
          </Link>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer style={{
        padding: '36px 6%', textAlign: 'center',
        borderTop: '1px solid var(--glass-border)',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg,#FF6B35,#FF2D78,#9333EA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>💜</div>
          <span style={{ fontWeight: 800, background: 'linear-gradient(135deg,#FF6B35,#FF2D78,#9333EA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t.brand}</span>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t.footer_desc}</p>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>© 2026 {t.brand}. All rights reserved.</p>
      </footer>
    </div>
  );
}
