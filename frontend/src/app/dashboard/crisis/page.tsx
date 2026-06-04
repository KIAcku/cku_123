'use client';
import { useState, useEffect } from 'react';
import { useLangStore } from '@/store/langStore';

// ─── 다국어 번역 사전 ──────────────────────────────────────────────
const i18n: Record<string, any> = {
  ko: {
    hero_title: '🆘 위기 지원 센터',
    hero_sub: '지금 많이 힘드신가요? 혼자 감당하지 않아도 돼요. 24시간 전문가가 여러분 곁에 있습니다.',
    warning_title: '지금 당장 위험하다면',
    warning_sub: '자해·자살 충동이 있거나 위험한 상황이라면 지금 바로 1393 또는 119에 전화하세요.',
    call_btn: '📞 1393 전화',
    hotline_title: '긴급 전화',
    hotline_sub: '24시간 도움받을 수 있어요',
    grounding_title: '즉각 진정 기법',
    grounding_sub: '지금 당장 마음을 진정시켜보세요',
    breathing_title: '🌬️ 4-7-8 호흡법',
    breathing_desc: '불안·패닉 즉시 완화에 효과적인 호흡 기법입니다',
    breathing_start: '호흡 시작하기',
    breathing_stop: '중지',
    breathing_count: '{count} / 4회 반복',
    grounding_sec_title: '🌍 5-4-3-2-1 그라운딩 기법',
    grounding_sec_sub: '현재 순간에 집중해 불안을 낮추는 기법 — 오감을 하나씩 의식해보세요',
    grounding_count_label: '{count}가지 — {label}',
    cta_title: '더 자세한 이야기가 필요하다면',
    cta_sub: '전문 상담사와 1:1로 안전하게 대화해보세요. 완전 익명 보장.',
    cta_btn: '💬 1:1 상담 시작하기',
    hotlines: [
      { name: '정신건강 위기상담 전화', desc: '24시간, 전국 어디서나' },
      { name: '자살예방상담전화', desc: '24시간 무료' },
      { name: '학교폭력 신고상담', desc: '24시간, 문자도 가능' },
      { name: '청소년 전화', desc: '24시간 청소년 전용' },
      { name: '성폭력 상담소', desc: '24시간 여성긴급전화' },
      { name: '정신건강복지센터', desc: '지역 기반 전문 상담' },
    ],
    breathing_steps: [
      { label: '들이쉬기' },
      { label: '참기' },
      { label: '내쉬기' }
    ],
    grounding: [
      { label: '보이는 것 5가지', ex: '책상, 창문, 시계, 핸드폰, 물컵' },
      { label: '들리는 소리 4가지', ex: '차 소리, 에어컨, 발소리, 바람' },
      { label: '만져지는 것 3가지', ex: '옷감, 의자, 책상 표면' },
      { label: '냄새 맡기 2가지', ex: '커피 향, 공기 냄새' },
      { label: '맛 느끼기 1가지', ex: '음료, 껌, 사탕' },
    ]
  },
  en: {
    hero_title: '🆘 Crisis Support Center',
    hero_sub: "Are you having a difficult time? You don't have to go through it alone. 24/7 experts are here for you.",
    warning_title: 'If you are in immediate danger',
    warning_sub: 'If you have thoughts of self-harm, suicide, or are in danger, call 1393 or 119 immediately.',
    call_btn: '📞 Call 1393',
    hotline_title: 'Emergency Hotlines',
    hotline_sub: 'Help is available 24 hours a day',
    grounding_title: 'Immediate Calming Tools',
    grounding_sub: 'Calm your mind right now',
    breathing_title: '🌬️ 4-7-8 Breathing Technique',
    breathing_desc: 'An effective breathing technique for immediate relief from anxiety and panic',
    breathing_start: 'Start Breathing',
    breathing_stop: 'Stop',
    breathing_count: 'Repeat {count} / 4 times',
    grounding_sec_title: '🌍 5-4-3-2-1 Grounding Method',
    grounding_sec_sub: 'A technique to lower anxiety by focusing on the present moment — become aware of your five senses one by one',
    grounding_count_label: '{count} Things — {label}',
    cta_title: 'Need a deeper conversation?',
    cta_sub: 'Talk safely 1:1 with a professional counselor. Complete anonymity guaranteed.',
    cta_btn: '💬 Start 1:1 Counseling',
    hotlines: [
      { name: 'Mental Health Crisis Hotline', desc: '24 Hours, Nationwide' },
      { name: 'Suicide Prevention Hotline', desc: '24 Hours, Free' },
      { name: 'School Violence Hotline', desc: '24 Hours, Texting Available' },
      { name: 'Youth Hotline', desc: '24 Hours, Youth Only' },
      { name: 'Sexual Violence Hotline', desc: "24 Hours, Women's Hotline" },
      { name: 'Mental Health Welfare Center', desc: 'Community-based expert counseling' },
    ],
    breathing_steps: [
      { label: 'Breathe In' },
      { label: 'Hold' },
      { label: 'Breathe Out' }
    ],
    grounding: [
      { label: 'things you can see', ex: 'Desk, window, clock, phone, cup' },
      { label: 'things you can hear', ex: 'Car sounds, A/C, footsteps, wind' },
      { label: 'things you can touch', ex: 'Fabric, chair, desk surface' },
      { label: 'things you can smell', ex: 'Coffee, smell of the air' },
      { label: 'thing you can taste', ex: 'Drink, gum, candy' },
    ]
  },
  ja: {
    hero_title: '🆘 危機支援センター',
    hero_sub: '今、とても辛いですか？一人で抱え込まなくても大丈夫です。24時間専門家があなたのそばにいます。',
    warning_title: '今すぐ危険な状態にある場合',
    warning_sub: '自傷・自殺の衝動がある場合、または危険な状況にある場合は、今すぐ1393または119にお電話ください。',
    call_btn: '📞 1393に発信',
    hotline_title: '緊急電話',
    hotline_sub: '24時間いつでも助けを受けられます',
    grounding_title: '即座に落ち着く方法',
    grounding_sub: '今すぐ心を落ち着かせてみてください',
    breathing_title: '🌬️ 4-7-8 呼吸法',
    breathing_desc: '不安やパニックを即座に和らげるのに効果的な呼吸法です',
    breathing_start: '呼吸を開始する',
    breathing_stop: '中止',
    breathing_count: '{count} / 4回繰り返す',
    grounding_sec_title: '🌍 5-4-3-2-1 グラウンディング技法',
    grounding_sec_sub: '現在の瞬間に集中して不安を和らげる技法 — 五感を一つずつ意識してください',
    grounding_count_label: '{count}個の — {label}',
    cta_title: 'より詳しい相談が必要な場合',
    cta_sub: '専門のカウンセラーと1:1で安全に話してみましょう。完全匿名保証。',
    cta_btn: '💬 1:1相談を開始する',
    hotlines: [
      { name: '精神健康危機相談電話', desc: '24時間、全国どこでも' },
      { name: '自殺予防相談電話', desc: '24時間無料' },
      { name: '学校暴力通報・相談', desc: '24時間、文字メッセージ可能' },
      { name: '青少年電話', desc: '24時間、青少年専用' },
      { name: '性暴力相談所', desc: '24時間、女性緊急電話' },
      { name: '精神健康福祉センター', desc: '地域ベースの専門相談' },
    ],
    breathing_steps: [
      { label: '吸う' },
      { label: '止める' },
      { label: '吐く' }
    ],
    grounding: [
      { label: '目に見えるもの', ex: '机、窓、時計、携帯電話、コップ' },
      { label: '耳に聞こえるもの', ex: '車の音、エアコン、足音、風の音' },
      { label: '体に触れるもの', ex: '衣類、椅子、机の表面' },
      { label: '鼻で嗅げるもの', ex: 'コーヒーの香り、空気の匂い' },
      { label: '口で味わえるもの', ex: '飲み物、ガム、アメ' },
    ]
  },
  zh: {
    hero_title: '🆘 危机支援中心',
    hero_sub: '现在感到非常痛苦吗？您不必独自承担。24小时专家陪伴在您身边。',
    warning_title: '如果您目前处于危险之中',
    warning_sub: '如果您有自残、自杀冲动或处于危险情况，请立即拨打 1393 或 119。',
    call_btn: '📞 拨打 1393',
    hotline_title: '紧急电话',
    hotline_sub: '24小时提供帮助',
    grounding_title: '即刻冷静法',
    grounding_sub: '现在就尝试让心静下来',
    breathing_title: '🌬️ 4-7-8 呼吸法',
    breathing_desc: '能迅速缓解焦虑和恐慌的呼吸法',
    breathing_start: '开始呼吸',
    breathing_stop: '停止',
    breathing_count: '重复 {count} / 4 次',
    grounding_sec_title: '🌍 5-4-3-2-1 着陆法',
    grounding_sec_sub: '通过专注于当下时刻来减轻焦虑的方法——逐一感受你的五感',
    grounding_count_label: '{count}个 — {label}',
    cta_title: '如果您需要更深入的交谈',
    cta_sub: '与专业咨询师进行安全的 1:1 对话。完全保证匿名。',
    cta_btn: '💬 开始 1:1 咨询',
    hotlines: [
      { name: '心理健康危机咨询热线', desc: '24小时，全国范围' },
      { name: '防自杀咨询热线', desc: '24小时免费' },
      { name: '学校暴力举报与咨询', desc: '24小时，支持短信' },
      { name: '青少年热线', desc: '24小时青少年专用' },
      { name: '性暴力咨询所', desc: '24小时女性紧急电话' },
      { name: '心理健康福利中心', desc: '基于社区的专业咨询' },
    ],
    breathing_steps: [
      { label: '吸气' },
      { label: '屏气' },
      { label: '呼气' }
    ],
    grounding: [
      { label: '看得见的事物', ex: '书桌、窗户、钟表、手机、水杯' },
      { label: '听得见的声音', ex: '车声、空调声、脚步声、风声' },
      { label: '摸得着的事物', ex: '衣服、椅子、书桌表面' },
      { label: '闻得到的味道', ex: '咖啡香、空气的味道' },
      { label: '尝得到的味道', ex: '饮料、口香糖、糖果' },
    ]
  }
};

// ─── 디자인 및 기능 상수 ──────────────────────────────────────
const HOTLINE_META = [
  { number: '1577-0199', color: '#4F8EF7', icon: '🆘' },
  { number: '1393', color: '#EF4444', icon: '❤️' },
  { number: '117', color: '#fd7e14', icon: '🛡️' },
  { number: '1388', color: '#6c63ff', icon: '📞' },
  { number: '1366', color: '#e83e8c', icon: '🔒' },
  { number: '지역번호+1577-0199', color: '#20c997', icon: '🏥' },
];

const BREATHING_META = [
  { duration: 4, color: '#4F8EF7', scale: 1.4 },
  { duration: 7, color: '#6c63ff', scale: 1.4 },
  { duration: 8, color: '#20c997', scale: 1.0 },
];

const GROUNDING_META = [
  { n: 5, icon: '👁️', color: '#4F8EF7' },
  { n: 4, icon: '👂', color: '#6c63ff' },
  { n: 3, icon: '🤚', color: '#20c997' },
  { n: 2, icon: '👃', color: '#fd7e14' },
  { n: 1, icon: '👅', color: '#e83e8c' },
];

export default function CrisisPage() {
  const { lang } = useLangStore();
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathStep, setBreathStep] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [breathTimer, setBreathTimer] = useState<any>(null);



  const t = i18n[lang] || i18n.ko;

  // 번역 데이터와 메타 데이터 결합
  const hotlines = HOTLINE_META.map((h, i) => ({
    ...h,
    name: t.hotlines[i]?.name || 'Help',
    desc: t.hotlines[i]?.desc || '',
  }));

  const breathingSteps = BREATHING_META.map((b, i) => ({
    ...b,
    label: t.breathing_steps[i]?.label || '',
  }));

  const grounding = GROUNDING_META.map((g, i) => ({
    ...g,
    label: t.grounding[i]?.label || '',
    ex: t.grounding[i]?.ex || '',
  }));

  const startBreathing = () => {
    setBreathingActive(true);
    setBreathStep(0);
    setBreathCount(0);
    runBreathCycle(0, 0);
  };

  const runBreathCycle = (stepIdx: number, count: number) => {
    const step = breathingSteps[stepIdx];
    const nextStep = (stepIdx + 1) % breathingSteps.length;
    const nextCount = nextStep === 0 ? count + 1 : count;
    const timer = setTimeout(() => {
      setBreathStep(nextStep);
      setBreathCount(nextCount);
      if (nextCount < 4) {
        runBreathCycle(nextStep, nextCount);
      } else {
        setBreathingActive(false);
      }
    }, step.duration * 1000);
    setBreathTimer(timer);
  };

  const stopBreathing = () => {
    clearTimeout(breathTimer);
    setBreathingActive(false);
  };

  const currentBreath = breathingSteps[breathStep];

  return (
    <div>
      {/* 히어로 */}
      <div style={{ background: 'linear-gradient(135deg, #EF4444 0%, #6c63ff 100%)', padding: '36px 28px', color: 'white' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 700, marginBottom: 8 }}>{t.hero_title}</h2>
          <p style={{ opacity: .88, fontSize: '.9rem', maxWidth: 500 }}>
            {t.hero_sub}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* 긴급 배너 */}
        <div style={{ background: '#FEF2F2', border: '2px solid #EF4444', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>🚨</div>
          <div>
            <div style={{ fontWeight: 700, color: '#DC2626', fontSize: '1rem', marginBottom: 4 }}>{t.warning_title}</div>
            <div style={{ fontSize: '.875rem', color: '#7F1D1D' }}>{t.warning_sub}</div>
          </div>
          <a href="tel:1393" style={{ marginLeft: 'auto', background: '#EF4444', color: 'white', padding: '10px 20px', borderRadius: 50, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {t.call_btn}
          </a>
        </div>

        {/* 긴급 핫라인 */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4F8EF7', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>{t.hotline_title}</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 18 }}>{t.hotline_sub}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {hotlines.map(h => (
              <a key={h.number} href={`tel:${h.number.replace(/\D/g, '')}`}
                style={{
                  background: 'var(--bg-layer2)', borderRadius: 14, padding: '18px 20px',
                  border: `1px solid #e9ecef`, textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'all .2s', boxShadow: '0 1px 4px rgba(0,0,0,.04)',
                  cursor: 'pointer'
                }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = h.color; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${h.color}22`; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e9ecef'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,.04)'; }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${h.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>{h.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#1a1a2e' }}>{h.name}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: h.color }}>{h.number}</div>
                  <div style={{ fontSize: '.75rem', color: '#6c757d' }}>{h.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* 즉시 도움 도구 */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4F8EF7', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>{t.grounding_title}</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 18 }}>{t.grounding_sub}</h3>

          {/* 호흡법 */}
          <div style={{ background: 'var(--bg-layer2)', borderRadius: 16, padding: '24px', border: '1px solid #e9ecef', marginBottom: 16 }}>
            <h4 style={{ fontWeight: 700, marginBottom: 4 }}>{t.breathing_title}</h4>
            <p style={{ fontSize: '.82rem', color: '#6c757d', marginBottom: 20 }}>{t.breathing_desc}</p>

            {!breathingActive ? (
              <button onClick={startBreathing} style={{
                background: '#4F8EF7', color: 'white', padding: '12px 28px',
                borderRadius: 50, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem'
              }}>
                {t.breathing_start}
              </button>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 120, height: 120, borderRadius: '50%', margin: '0 auto 20px',
                  background: `${currentBreath.color}20`,
                  border: `3px solid ${currentBreath.color}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 1s ease',
                  transform: `scale(${currentBreath.scale})`,
                }}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: currentBreath.color }}>{currentBreath.label}</div>
                  <div style={{ fontSize: '.8rem', color: '#6c757d' }}>{currentBreath.duration}{lang === 'ko' ? '초' : lang === 'ja' ? '秒' : lang === 'zh' ? '秒' : 's'}</div>
                </div>
                <div style={{ fontSize: '.85rem', color: '#6c757d', marginBottom: 12 }}>
                  {t.breathing_count.replace('{count}', String(breathCount + 1))}
                </div>
                <button onClick={stopBreathing} style={{ background: '#f8f9fa', color: '#6c757d', padding: '8px 20px', borderRadius: 50, border: '1px solid #dee2e6', cursor: 'pointer' }}>
                  {t.breathing_stop}
                </button>
              </div>
            )}
          </div>

          {/* 5-4-3-2-1 그라운딩 */}
          <div style={{ background: 'var(--bg-layer2)', borderRadius: 16, padding: '24px', border: '1px solid #e9ecef' }}>
            <h4 style={{ fontWeight: 700, marginBottom: 4 }}>{t.grounding_sec_title}</h4>
            <p style={{ fontSize: '.82rem', color: '#6c757d', marginBottom: 20 }}>{t.grounding_sec_sub}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {grounding.map(g => (
                <div key={g.n} style={{ display: 'flex', alignItems: 'center', gap: 14, background: `${g.color}08`, borderRadius: 12, padding: '14px 18px', border: `1px solid ${g.color}20` }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${g.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>{g.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.875rem', color: g.color }}>
                      {t.grounding_count_label.replace('{count}', String(g.n)).replace('{label}', g.label)}
                    </div>
                    <div style={{ fontSize: '.78rem', color: '#6c757d' }}>{lang === 'ko' ? '예' : lang === 'ja' ? '例' : lang === 'zh' ? '例' : 'e.g.'}) {g.ex}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 1:1 상담 CTA */}
        <div style={{ background: 'linear-gradient(135deg, #4F8EF7 0%, #6c63ff 100%)', borderRadius: 20, padding: '28px 32px', color: 'white', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>{t.cta_title}</h3>
          <p style={{ opacity: .88, fontSize: '.875rem', marginBottom: 20 }}>{t.cta_sub}</p>
          <a href="/dashboard/counsel" style={{ display: 'inline-block', background: 'white', color: '#4F8EF7', padding: '12px 28px', borderRadius: 50, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.15)' }}>
            {t.cta_btn}
          </a>
        </div>
      </div>
    </div>
  );
}
