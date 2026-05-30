'use client';
import { useEffect, useState } from 'react';

const i18n: Record<string, {
  title: string; subtitle: string; faq: string; guide: string; crisis: string;
  steps: { icon: string; title: string; desc: string }[];
  faqs: { q: string; a: string }[];
  hotlines: { name: string; number: string; hours: string; icon: string }[];
}> = {
  ko: {
    title: '도움말 센터', subtitle: '마음이음 사용법과 자주 묻는 질문을 확인하세요.',
    faq: '자주 묻는 질문', guide: '이용 가이드', crisis: '위기 지원',
    steps: [
      { icon: '🏠', title: '로그인', desc: '학교 이메일로 로그인하세요.' },
      { icon: '📔', title: '감정 일기', desc: '오늘의 감정을 기록하세요.' },
      { icon: '🧠', title: '자가진단', desc: '정기적으로 자가진단을 해보세요.' },
      { icon: '💬', title: '익명 상담', desc: '고민이 있으면 익명으로 상담받으세요.' },
      { icon: '🆘', title: '위기 지원', desc: '위급 상황엔 위기 지원 센터를 이용하세요.' },
    ],
    faqs: [
      { q: '상담은 정말 익명인가요?', a: '네, 완전히 익명입니다. 상담사는 학생의 이름이나 학번을 알 수 없습니다.' },
      { q: '신고하면 누가 알게 되나요?', a: '신고 내용은 담당 선생님만 확인할 수 있습니다. 학생 정보는 일절 저장되지 않습니다.' },
      { q: '상담사가 누군지 알 수 있나요?', a: '아니요, 상담사의 실제 신원은 공개되지 않습니다.' },
      { q: '일기 내용이 다른 사람에게 보이나요?', a: '절대 아닙니다. 일기는 본인만 볼 수 있습니다.' },
      { q: '자가진단 결과가 다른 곳에 공유되나요?', a: '아니요, 자가진단 결과는 본인만 확인할 수 있습니다.' },
      { q: '비밀번호를 잊었어요.', a: '로그인 페이지에서 비밀번호 찾기를 이용해주세요. 이메일 인증으로 재설정 가능합니다.' },
      { q: '앱을 어떻게 사용하나요?', a: '홈 → 원하는 기능 선택. 도움이 필요하면 위기 지원 센터를 이용해 주세요.' },
    ],
    hotlines: [
      { name: '청소년상담1388', number: '1388', hours: '24시간', icon: '📞' },
      { name: '자살예방상담전화', number: '1393', hours: '24시간', icon: '🆘' },
      { name: '학교폭력신고', number: '117', hours: '24시간', icon: '🚨' },
      { name: '정신건강위기상담', number: '1577-0199', hours: '24시간', icon: '💚' },
    ],
  },
  en: {
    title: 'Help Center', subtitle: 'Learn how to use MaumIeum and find answers to common questions.',
    faq: 'FAQ', guide: 'User Guide', crisis: 'Crisis Support',
    steps: [
      { icon: '🏠', title: 'Login', desc: 'Log in with your school email.' },
      { icon: '📔', title: 'Emotion Diary', desc: 'Record how you feel today.' },
      { icon: '🧠', title: 'Self-Assessment', desc: 'Take regular mental health check-ins.' },
      { icon: '💬', title: 'Anonymous Counsel', desc: 'Talk to a counselor anonymously.' },
      { icon: '🆘', title: 'Crisis Support', desc: 'Use the crisis support center in emergencies.' },
    ],
    faqs: [
      { q: 'Is counseling really anonymous?', a: 'Yes, completely. Counselors cannot see your name or student ID.' },
      { q: 'Who can see my report?', a: 'Only the designated teacher can view reports. No student info is stored.' },
      { q: 'Can I find out who the counselor is?', a: 'No, the real identity of counselors is not disclosed.' },
      { q: 'Can others see my diary?', a: 'Absolutely not. Your diary is private to you only.' },
      { q: 'Is my self-assessment shared?', a: 'No, only you can see your self-assessment results.' },
      { q: "I forgot my password.", a: "Use the 'Find Password' link on the login page to reset via email." },
      { q: 'How do I use the app?', a: 'Go Home → Choose a feature. Use the crisis center if you need help.' },
    ],
    hotlines: [
      { name: 'Youth Counseling', number: '1388', hours: '24/7', icon: '📞' },
      { name: 'Suicide Prevention', number: '1393', hours: '24/7', icon: '🆘' },
      { name: 'School Violence', number: '117', hours: '24/7', icon: '🚨' },
      { name: 'Mental Health Crisis', number: '1577-0199', hours: '24/7', icon: '💚' },
    ],
  },
  ja: {
    title: 'ヘルプセンター', subtitle: 'マウムイウムの使い方とよくある質問を確認してください。',
    faq: 'よくある質問', guide: '利用ガイド', crisis: '危機支援',
    steps: [
      { icon: '🏠', title: 'ログイン', desc: '学校のメールでログインしてください。' },
      { icon: '📔', title: '感情日記', desc: '今日の感情を記録しましょう。' },
      { icon: '🧠', title: 'セルフ診断', desc: '定期的に自己診断を行いましょう。' },
      { icon: '💬', title: '匿名相談', desc: '悩みがあれば匿名で相談できます。' },
      { icon: '🆘', title: '危機支援', desc: '緊急時には危機支援センターを利用してください。' },
    ],
    faqs: [
      { q: '相談は本当に匿名ですか？', a: 'はい、完全に匿名です。カウンセラーは学生の名前や学籍番号を知ることができません。' },
      { q: '報告したら誰が知ることになりますか？', a: '報告内容は担当の先生のみが確認できます。学生情報は一切保存されません。' },
      { q: 'カウンセラーが誰か分かりますか？', a: 'いいえ、カウンセラーの実際の身元は公開されません。' },
      { q: '日記は他の人に見られますか？', a: '絶対にありません。日記は本人のみ閲覧できます。' },
      { q: 'セルフ診断結果は共有されますか？', a: 'いいえ、セルフ診断結果は本人のみ確認できます。' },
      { q: 'パスワードを忘れました。', a: 'ログインページの「パスワード再設定」からメール認証でリセットできます。' },
      { q: 'アプリの使い方は？', a: 'ホーム→機能を選択。サポートが必要な場合は危機支援センターをご利用ください。' },
    ],
    hotlines: [
      { name: '青少年相談', number: '1388', hours: '24時間', icon: '📞' },
      { name: '自殺防止相談', number: '1393', hours: '24時間', icon: '🆘' },
      { name: '学校暴力申告', number: '117', hours: '24時間', icon: '🚨' },
      { name: '精神健康危機相談', number: '1577-0199', hours: '24時間', icon: '💚' },
    ],
  },
  zh: {
    title: '帮助中心', subtitle: '了解如何使用마음이음并找到常见问题的答案。',
    faq: '常见问题', guide: '使用指南', crisis: '危机支援',
    steps: [
      { icon: '🏠', title: '登录', desc: '使用学校邮箱登录。' },
      { icon: '📔', title: '情绪日记', desc: '记录今天的心情。' },
      { icon: '🧠', title: '自我评估', desc: '定期进行心理健康自测。' },
      { icon: '💬', title: '匿名咨询', desc: '有烦恼可以匿名咨询。' },
      { icon: '🆘', title: '危机支援', desc: '紧急情况请使用危机支援中心。' },
    ],
    faqs: [
      { q: '咨询真的是匿名的吗？', a: '是的，完全匿名。咨询师无法知道您的姓名或学号。' },
      { q: '举报后谁会知道？', a: '举报内容只有负责老师才能查看。不会保存任何学生信息。' },
      { q: '可以知道咨询师是谁吗？', a: '不可以，咨询师的真实身份不会公开。' },
      { q: '日记会被别人看到吗？', a: '绝对不会。日记只有本人可以查看。' },
      { q: '自我评估结果会被分享吗？', a: '不会，自我评估结果只有本人可以查看。' },
      { q: '忘记密码了怎么办？', a: '请在登录页面使用"找回密码"功能，通过邮箱验证重置密码。' },
      { q: '如何使用该应用？', a: '首页→选择功能。如需帮助，请使用危机支援中心。' },
    ],
    hotlines: [
      { name: '青少年咨询', number: '1388', hours: '24小时', icon: '📞' },
      { name: '防自杀咨询', number: '1393', hours: '24小时', icon: '🆘' },
      { name: '校园暴力举报', number: '117', hours: '24小时', icon: '🚨' },
      { name: '心理健康危机咨询', number: '1577-0199', hours: '24小时', icon: '💚' },
    ],
  },
};

export default function HelpPage() {
  const [lang, setLang] = useState('ko');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [tab, setTab] = useState<'faq' | 'guide' | 'crisis'>('faq');

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') || 'ko';
    setLang(savedLang);
  }, []);

  const d = i18n[lang] || i18n.ko;

  return (
    <div className="page-content" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #10B981 0%, #5B5FEF 100%)',
        borderRadius: 'var(--radius-xl)', padding: '40px 40px',
        marginBottom: 32, color: 'white', position: 'relative', overflow: 'hidden',
        textAlign: 'center',
      }}>
        <div style={{ position: 'absolute', top: -50, left: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 60, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>💚</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>{d.title}</h1>
          <p style={{ opacity: 0.85, fontSize: '0.95rem' }}>{d.subtitle}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)', marginBottom: 28 }}>
        {([['faq', `❓ ${d.faq}`], ['guide', `📖 ${d.guide}`], ['crisis', `🆘 ${d.crisis}`]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            style={{
              padding: '12px 24px', fontSize: '0.9rem', fontWeight: tab === key ? 700 : 500,
              color: tab === key ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: `2px solid ${tab === key ? 'var(--primary)' : 'transparent'}`,
              marginBottom: -2, cursor: 'pointer', background: 'transparent',
              borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* FAQ Tab */}
      {tab === 'faq' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {d.faqs.map((faq, i) => (
            <div key={i} style={{
              background: 'white', border: `1px solid ${openIndex === i ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              boxShadow: openIndex === i ? '0 0 0 3px rgba(91,95,239,0.1)' : 'none',
              transition: 'all 0.2s',
            }}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{
                  width: '100%', padding: '18px 20px', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: 12, textAlign: 'left',
                  background: 'transparent', cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 'var(--radius-full)',
                    background: openIndex === i ? 'var(--primary)' : 'var(--primary-light)',
                    color: openIndex === i ? 'white' : 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 800, flexShrink: 0,
                  }}>Q</span>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {faq.q}
                  </span>
                </div>
                <span style={{
                  fontSize: '1rem', color: 'var(--primary)',
                  transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s', flexShrink: 0,
                }}>▼</span>
              </button>
              {openIndex === i && (
                <div style={{
                  padding: '0 20px 18px 58px',
                  fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7,
                  animation: 'fadeIn 0.2s ease',
                }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: 'var(--radius-full)',
                      background: 'var(--secondary-light)', color: 'var(--secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 800, flexShrink: 0,
                    }}>A</span>
                    <p>{faq.a}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Guide Tab */}
      {tab === 'guide' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {d.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              {/* Step line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 'var(--radius-full)',
                  background: 'var(--primary)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.4rem',
                  boxShadow: '0 4px 12px rgba(91,95,239,0.3)',
                }}>
                  {step.icon}
                </div>
                {i < d.steps.length - 1 && (
                  <div style={{ width: 2, flex: 1, background: 'linear-gradient(to bottom, var(--primary), transparent)', minHeight: 40, marginTop: 4 }} />
                )}
              </div>
              <div className="card" style={{ flex: 1, marginBottom: i < d.steps.length - 1 ? 0 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 'var(--radius-full)',
                    background: 'var(--primary-light)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 800,
                  }}>{i + 1}</span>
                  <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{step.title}</h3>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Crisis Tab */}
      {tab === 'crisis' && (
        <div>
          <div style={{
            background: 'linear-gradient(135deg, var(--danger-light), #FEF2F2)',
            border: '1.5px solid var(--danger)', borderRadius: 'var(--radius-xl)',
            padding: '20px 24px', marginBottom: 24,
            display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: 4 }}>
                위급한 상황이라면 즉시 아래 번호로 연락하세요
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                24시간 전문 상담사가 도움을 드립니다. 혼자 힘들어하지 마세요.
              </p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {d.hotlines.map((h, i) => (
              <a key={i} href={`tel:${h.number}`} style={{
                textDecoration: 'none',
                display: 'block',
                background: 'white',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--danger)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{h.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>{h.name}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--danger)', marginBottom: 6 }}>
                  {h.number}
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '2px 10px', borderRadius: 'var(--radius-full)',
                  background: 'var(--secondary-light)', color: 'var(--secondary)',
                  fontSize: '0.75rem', fontWeight: 700,
                }}>
                  🕐 {h.hours}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
