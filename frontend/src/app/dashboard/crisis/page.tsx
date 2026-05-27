'use client';
import { useState } from 'react';

const HOTLINES = [
  { name: '정신건강 위기상담 전화', number: '1577-0199', desc: '24시간, 전국 어디서나', color: '#4F8EF7', icon: '🆘' },
  { name: '자살예방상담전화', number: '1393', desc: '24시간 무료', color: '#EF4444', icon: '❤️' },
  { name: '학교폭력 신고상담', number: '117', desc: '24시간, 문자도 가능', color: '#fd7e14', icon: '🛡️' },
  { name: '청소년 전화', number: '1388', desc: '24시간 청소년 전용', color: '#6c63ff', icon: '📞' },
  { name: '성폭력 상담소', number: '1366', desc: '24시간 여성긴급전화', color: '#e83e8c', icon: '🔒' },
  { name: '정신건강복지센터', number: '지역번호+1577-0199', desc: '지역 기반 전문 상담', color: '#20c997', icon: '🏥' },
];

const BREATHING_STEPS = [
  { label: '들이쉬기', duration: 4, color: '#4F8EF7', scale: 1.4 },
  { label: '참기', duration: 7, color: '#6c63ff', scale: 1.4 },
  { label: '내쉬기', duration: 8, color: '#20c997', scale: 1.0 },
];

const GROUNDING = [
  { n: 5, label: '보이는 것 5가지', icon: '👁️', color: '#4F8EF7', ex: '책상, 창문, 시계, 핸드폰, 물컵' },
  { n: 4, label: '들리는 소리 4가지', icon: '👂', color: '#6c63ff', ex: '차 소리, 에어컨, 발소리, 바람' },
  { n: 3, label: '만져지는 것 3가지', icon: '🤚', color: '#20c997', ex: '옷감, 의자, 책상 표면' },
  { n: 2, label: '냄새 맡기 2가지', icon: '👃', color: '#fd7e14', ex: '커피 향, 공기 냄새' },
  { n: 1, label: '맛 느끼기 1가지', icon: '👅', color: '#e83e8c', ex: '음료, 껌, 사탕' },
];

export default function CrisisPage() {
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathStep, setBreathStep] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [breathTimer, setBreathTimer] = useState<any>(null);

  const startBreathing = () => {
    setBreathingActive(true);
    setBreathStep(0);
    setBreathCount(0);
    runBreathCycle(0, 0);
  };

  const runBreathCycle = (stepIdx: number, count: number) => {
    const step = BREATHING_STEPS[stepIdx];
    const nextStep = (stepIdx + 1) % BREATHING_STEPS.length;
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

  const currentBreath = BREATHING_STEPS[breathStep];

  return (
    <div>
      {/* 히어로 */}
      <div style={{ background: 'linear-gradient(135deg, #EF4444 0%, #6c63ff 100%)', padding: '36px 28px', color: 'white' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 700, marginBottom: 8 }}>🆘 위기 지원 센터</h2>
          <p style={{ opacity: .88, fontSize: '.9rem', maxWidth: 500 }}>
            지금 많이 힘드신가요? 혼자 감당하지 않아도 돼요.<br />
            24시간 전문가가 여러분 곁에 있습니다.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* 긴급 배너 */}
        <div style={{ background: '#FEF2F2', border: '2px solid #EF4444', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>🚨</div>
          <div>
            <div style={{ fontWeight: 700, color: '#DC2626', fontSize: '1rem', marginBottom: 4 }}>지금 당장 위험하다면</div>
            <div style={{ fontSize: '.875rem', color: '#7F1D1D' }}>자해·자살 충동이 있거나 위험한 상황이라면 지금 바로 <strong>1393</strong> 또는 <strong>119</strong>에 전화하세요.</div>
          </div>
          <a href="tel:1393" style={{ marginLeft: 'auto', background: '#EF4444', color: 'white', padding: '10px 20px', borderRadius: 50, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
            📞 1393 전화
          </a>
        </div>

        {/* 긴급 핫라인 */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4F8EF7', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>긴급 전화</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 18 }}>24시간 도움받을 수 있어요</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {HOTLINES.map(h => (
              <a key={h.number} href={`tel:${h.number.replace(/\D/g, '')}`}
                style={{
                  background: 'white', borderRadius: 14, padding: '18px 20px',
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
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4F8EF7', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>즉각 진정 기법</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 18 }}>지금 당장 마음을 진정시켜보세요</h3>

          {/* 호흡법 */}
          <div style={{ background: 'white', borderRadius: 16, padding: '24px', border: '1px solid #e9ecef', marginBottom: 16 }}>
            <h4 style={{ fontWeight: 700, marginBottom: 4 }}>🌬️ 4-7-8 호흡법</h4>
            <p style={{ fontSize: '.82rem', color: '#6c757d', marginBottom: 20 }}>불안·패닉 즉시 완화에 효과적인 호흡 기법입니다</p>

            {!breathingActive ? (
              <button onClick={startBreathing} style={{
                background: '#4F8EF7', color: 'white', padding: '12px 28px',
                borderRadius: 50, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem'
              }}>
                호흡 시작하기
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
                  <div style={{ fontSize: '.8rem', color: '#6c757d' }}>{currentBreath.duration}초</div>
                </div>
                <div style={{ fontSize: '.85rem', color: '#6c757d', marginBottom: 12 }}>
                  {breathCount + 1} / 4회 반복
                </div>
                <button onClick={stopBreathing} style={{ background: '#f8f9fa', color: '#6c757d', padding: '8px 20px', borderRadius: 50, border: '1px solid #dee2e6', cursor: 'pointer' }}>
                  중지
                </button>
              </div>
            )}
          </div>

          {/* 5-4-3-2-1 그라운딩 */}
          <div style={{ background: 'white', borderRadius: 16, padding: '24px', border: '1px solid #e9ecef' }}>
            <h4 style={{ fontWeight: 700, marginBottom: 4 }}>🌍 5-4-3-2-1 그라운딩 기법</h4>
            <p style={{ fontSize: '.82rem', color: '#6c757d', marginBottom: 20 }}>현재 순간에 집중해 불안을 낮추는 기법 — 오감을 하나씩 의식해보세요</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {GROUNDING.map(g => (
                <div key={g.n} style={{ display: 'flex', alignItems: 'center', gap: 14, background: `${g.color}08`, borderRadius: 12, padding: '14px 18px', border: `1px solid ${g.color}20` }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${g.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>{g.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.875rem', color: g.color }}>{g.n}가지 — {g.label}</div>
                    <div style={{ fontSize: '.78rem', color: '#6c757d' }}>예) {g.ex}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 1:1 상담 CTA */}
        <div style={{ background: 'linear-gradient(135deg, #4F8EF7 0%, #6c63ff 100%)', borderRadius: 20, padding: '28px 32px', color: 'white', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>더 자세한 이야기가 필요하다면</h3>
          <p style={{ opacity: .88, fontSize: '.875rem', marginBottom: 20 }}>전문 상담사와 1:1로 안전하게 대화해보세요. 완전 익명 보장.</p>
          <a href="/dashboard/counsel" style={{ display: 'inline-block', background: 'white', color: '#4F8EF7', padding: '12px 28px', borderRadius: 50, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.15)' }}>
            💬 1:1 상담 시작하기
          </a>
        </div>
      </div>
    </div>
  );
}
