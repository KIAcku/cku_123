'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/apiClient';

// PHQ-9 기반 우울증 자가진단
const TESTS: Record<string, { title: string; desc: string; color: string; icon: string; questions: string[]; levels: { max: number; level: string; label: string; desc: string; action: string }[] }> = {
  phq9: {
    title: 'PHQ-9 우울증 자가진단',
    desc: '지난 2주 동안 다음과 같은 문제들이 얼마나 자주 있었나요?',
    color: '#4F8EF7',
    icon: '💙',
    questions: [
      '일에 대한 흥미나 즐거움이 거의 없다',
      '기분이 다운되거나, 우울하거나, 희망이 없다고 느낀다',
      '잠들기가 어렵거나 자주 깬다. 또는 너무 많이 잔다',
      '피곤하거나 기운이 거의 없다',
      '식욕이 없거나 너무 많이 먹는다',
      '자신이 실패자라고 느끼거나, 자신 또는 가족을 실망시켰다고 느낀다',
      '신문을 읽거나 TV를 보는 것과 같은 일에 집중하기가 어렵다',
      '다른 사람들이 알아챌 정도로 너무 느리게 말하거나 행동하거나, 반대로 너무 안절부절 못하거나 들떠있다',
      '자신이 죽는 것이 더 낫겠다거나, 어떤 식으로든 자신을 해치고 싶다는 생각이 든다',
    ],
    levels: [
      { max: 4,  level: 'minimal',  label: '정상 범위',   desc: '현재 우울 증상이 거의 없습니다.',                 action: '지속적인 자기 돌봄으로 건강한 마음을 유지하세요.' },
      { max: 9,  level: 'mild',     label: '경미한 우울', desc: '가벼운 우울 증상이 있습니다.',                   action: '규칙적인 운동, 충분한 수면, 사회적 교류를 늘려보세요.' },
      { max: 14, level: 'moderate', label: '중등도 우울', desc: '중간 정도의 우울 증상이 있습니다.',               action: '전문가 상담을 권장합니다. 1:1 상담을 시도해보세요.' },
      { max: 19, level: 'moderate_severe', label: '중증 우울', desc: '상당한 수준의 우울 증상이 있습니다.', action: '즉시 전문 상담사 또는 정신건강의학과 방문을 권장합니다.' },
      { max: 27, level: 'severe',   label: '심한 우울',   desc: '심각한 수준의 우울 증상이 있습니다.',             action: '지금 바로 전문가의 도움을 받으세요. 위기상담 1393으로 전화하세요.' },
    ]
  },
  gad7: {
    title: 'GAD-7 불안 자가진단',
    desc: '지난 2주 동안 다음과 같은 문제들이 얼마나 자주 있었나요?',
    color: '#6c63ff',
    icon: '💜',
    questions: [
      '초조하거나 불안하거나 조마조마하게 느낀다',
      '걱정하는 것을 멈추거나 조절할 수가 없다',
      '여러 가지 것들에 대해 너무 많이 걱정한다',
      '편안하게 있기가 어렵다',
      '너무 안절부절 못해서 가만히 있기가 힘들다',
      '쉽게 짜증이 나거나 신경질적이 된다',
      '마치 끔찍한 일이 일어날 것 같아 두렵다',
    ],
    levels: [
      { max: 4,  level: 'minimal',  label: '정상 범위',   desc: '불안 증상이 거의 없습니다.',           action: '현재 상태를 잘 유지하고 있어요!' },
      { max: 9,  level: 'mild',     label: '경미한 불안', desc: '가벼운 불안 증상이 있습니다.',         action: '깊은 호흡 연습과 마음챙김 명상이 도움이 될 수 있어요.' },
      { max: 14, level: 'moderate', label: '중등도 불안', desc: '중간 정도의 불안 증상이 있습니다.',     action: '전문 상담을 받아보세요. 인지행동치료(CBT)가 효과적입니다.' },
      { max: 21, level: 'severe',   label: '심한 불안',   desc: '심각한 불안 증상이 있습니다.',         action: '즉시 전문가의 도움을 받으세요. 정신건강 위기상담 1577-0199' },
    ]
  },
  stress: {
    title: '학업 스트레스 자가진단',
    desc: '현재 학교생활과 관련하여 다음 항목을 체크해주세요.',
    color: '#20c997',
    icon: '💚',
    questions: [
      '공부에 집중하기가 힘들다',
      '성적이나 학점 때문에 불안하다',
      '과제와 시험이 너무 많아 버겁게 느껴진다',
      '학교에 가기 싫은 날이 많다',
      '친구나 교우 관계가 스트레스다',
      '미래(진로, 취업)가 막막하게 느껴진다',
      '충분한 수면을 취하지 못하고 있다',
      '식사를 거르거나 불규칙하게 먹는다',
      '혼자 있고 싶거나 아무도 만나고 싶지 않다',
      '모든 게 귀찮고 의욕이 없다',
    ],
    levels: [
      { max: 9,  level: 'minimal',  label: '낮은 스트레스', desc: '스트레스를 잘 관리하고 있어요!', action: '지금처럼 건강한 생활 습관을 유지하세요.' },
      { max: 19, level: 'mild',     label: '보통 스트레스', desc: '적당한 수준의 스트레스가 있습니다.', action: '휴식과 취미 활동으로 스트레스를 해소해보세요.' },
      { max: 24, level: 'moderate', label: '높은 스트레스', desc: '스트레스가 상당히 높습니다.', action: '상담사 또는 믿을 수 있는 어른과 이야기해보세요.' },
      { max: 30, level: 'severe',   label: '매우 높은 스트레스', desc: '번아웃 위험이 높습니다.', action: '전문 상담을 즉시 받으시길 권장합니다.' },
    ]
  }
};

const OPTIONS = ['전혀 아니다 (0)', '며칠 (1)', '일주일의 절반 이상 (2)', '거의 매일 (3)'];

export default function TestPage() {
  const router = useRouter();
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [step, setStep] = useState(0); // 0=intro, 1=questions, 2=result
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const test = selectedTest ? TESTS[selectedTest] : null;

  const startTest = (key: string) => {
    setSelectedTest(key);
    setAnswers(new Array(TESTS[key].questions.length).fill(-1));
    setStep(1);
    setResult(null);
  };

  const selectAnswer = (qIdx: number, val: number) => {
    const next = [...answers];
    next[qIdx] = val;
    setAnswers(next);
  };

  const submitTest = async () => {
    if (!test || !selectedTest) return;
    const score = answers.reduce((a, b) => a + b, 0);
    const level = test.levels.find(l => score <= l.max) || test.levels[test.levels.length - 1];
    const resultData = { score, level, test };
    setResult(resultData);
    setStep(2);

    // DB 저장
    setLoading(true);
    try {
      await fetch(`${API_BASE}/counsel/tests`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_type: selectedTest, score, answers, level: level.level }),
      });
    } catch {}
    setLoading(false);
  };

  const progress = answers.filter(a => a >= 0).length;
  const total = test?.questions.length || 0;
  const allAnswered = progress === total && total > 0;

  const levelColors: Record<string, string> = {
    minimal: '#20c997', mild: '#F59E0B', moderate: '#fd7e14', moderate_severe: '#EF4444', severe: '#DC2626'
  };

  return (
    <div>
      {/* 히어로 */}
      <div style={{ background: 'linear-gradient(135deg, #4F8EF7 0%, #6c63ff 100%)', padding: '36px 28px', color: 'white' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,.2)', borderRadius: 20, padding: '4px 14px', fontSize: 13, marginBottom: 12 }}>
            표준 심리 자가진단 도구
          </div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 700, marginBottom: 8 }}>🧠 심리 자가진단 테스트</h2>
          <p style={{ opacity: .88, fontSize: '.9rem' }}>
            임상에서 사용하는 표준 검사 도구(PHQ-9, GAD-7)를 기반으로 나의 심리 상태를 확인해보세요.<br />
            결과는 참고용이며, 전문 진단을 대체하지 않습니다.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px' }}>

        {/* Step 0: 테스트 선택 */}
        {step === 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#4F8EF7', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>검사 선택</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>어떤 검사를 받으시겠어요?</h3>
            <p style={{ color: '#6c757d', fontSize: '.875rem', marginBottom: 24 }}>각 검사는 5~10분 소요됩니다</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {Object.entries(TESTS).map(([key, t]) => (
                <div key={key} onClick={() => startTest(key)} style={{
                  background: 'white', borderRadius: 16, padding: '28px 20px', textAlign: 'center',
                  border: `2px solid #e9ecef`, cursor: 'pointer', transition: 'all .2s',
                  boxShadow: '0 1px 4px rgba(0,0,0,.04)'
                }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = t.color; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${t.color}22`; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e9ecef'; (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,.04)'; }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{t.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: 8, color: t.color }}>{t.title}</div>
                  <div style={{ fontSize: '.78rem', color: '#6c757d', marginBottom: 12 }}>{t.questions.length}개 문항</div>
                  <div style={{ background: `${t.color}12`, color: t.color, padding: '6px 14px', borderRadius: 20, fontSize: '.75rem', fontWeight: 600, display: 'inline-block' }}>
                    검사 시작 →
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 10, padding: '12px 16px', fontSize: '.82rem', color: '#856404', marginTop: 24 }}>
              ⚠️ 본 검사는 전문적인 심리 진단을 대체하지 않습니다. 심각한 증상이 있다면 전문가를 찾아주세요.
            </div>
          </div>
        )}

        {/* Step 1: 문항 */}
        {step === 1 && test && (
          <div>
            {/* 진행바 */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', color: '#6c757d', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: test.color }}>{test.title}</span>
                <span>{progress} / {total} 완료</span>
              </div>
              <div style={{ height: 8, background: '#e9ecef', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(progress / total) * 100}%`, background: test.color, borderRadius: 8, transition: 'width .3s' }} />
              </div>
            </div>

            <p style={{ color: '#6c757d', fontSize: '.875rem', marginBottom: 24, background: '#f8f9fa', padding: '10px 14px', borderRadius: 8 }}>
              📋 {test.desc}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {test.questions.map((q, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 14, padding: '20px', border: `1px solid ${answers[i] >= 0 ? test.color : '#e9ecef'}`, transition: 'all .2s', boxShadow: answers[i] >= 0 ? `0 2px 12px ${test.color}15` : '0 1px 4px rgba(0,0,0,.04)' }}>
                  <div style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: 14, display: 'flex', gap: 8 }}>
                    <span style={{ background: test.color, color: 'white', width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                    {q}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {OPTIONS.map((opt, val) => (
                      <button key={val} onClick={() => selectAnswer(i, val)} style={{
                        padding: '9px 12px', borderRadius: 8, fontSize: '.8rem', cursor: 'pointer',
                        border: `1.5px solid ${answers[i] === val ? test.color : '#dee2e6'}`,
                        background: answers[i] === val ? `${test.color}12` : 'white',
                        color: answers[i] === val ? test.color : '#495057',
                        fontWeight: answers[i] === val ? 700 : 400, transition: 'all .15s',
                        textAlign: 'left'
                      }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setStep(0)} style={{ background: '#F8F9FA', color: '#6c757d', padding: '12px 20px', borderRadius: 10, border: '1px solid #dee2e6', cursor: 'pointer', fontWeight: 500 }}>← 돌아가기</button>
              <button onClick={submitTest} disabled={!allAnswered} style={{
                flex: 1, background: test.color, color: 'white', padding: '12px 20px', borderRadius: 10,
                border: 'none', cursor: allAnswered ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '1rem',
                opacity: allAnswered ? 1 : 0.5, transition: 'all .2s'
              }}>
                {allAnswered ? '결과 확인하기 →' : `${total - progress}개 문항을 더 답해주세요`}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 결과 */}
        {step === 2 && result && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 12 }}>{result.test.icon}</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>{result.test.title}</h3>
            <p style={{ color: '#6c757d', fontSize: '.875rem', marginBottom: 28 }}>검사 결과</p>

            {/* 점수 카드 */}
            <div style={{
              background: `${levelColors[result.level.level] || '#4F8EF7'}10`,
              border: `2px solid ${levelColors[result.level.level] || '#4F8EF7'}`,
              borderRadius: 20, padding: '28px 24px', marginBottom: 24, textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: levelColors[result.level.level] || '#4F8EF7', marginBottom: 4 }}>
                {result.score}점
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: levelColors[result.level.level] || '#4F8EF7', marginBottom: 12 }}>
                {result.level.label}
              </div>
              <p style={{ fontSize: '.9rem', color: '#495057', lineHeight: 1.7 }}>{result.level.desc}</p>
            </div>

            {/* 추천 행동 */}
            <div style={{ background: 'white', borderRadius: 14, padding: '20px', border: '1px solid #e9ecef', marginBottom: 24, textAlign: 'left' }}>
              <div style={{ fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#4F8EF7' }}>💡</span> 권장 행동
              </div>
              <p style={{ fontSize: '.875rem', color: '#495057', lineHeight: 1.7 }}>{result.level.action}</p>
            </div>

            {/* 레벨별 점수 바 */}
            <div style={{ background: 'white', borderRadius: 14, padding: '20px', border: '1px solid #e9ecef', marginBottom: 28, textAlign: 'left' }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '.9rem' }}>점수 범위</div>
              {result.test.levels.map((l: any, i: number) => {
                const prev = i > 0 ? result.test.levels[i - 1].max + 1 : 0;
                return (
                  <div key={l.level} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: levelColors[l.level] || '#adb5bd', flexShrink: 0 }} />
                    <div style={{ fontSize: '.8rem', flex: 1, color: l.level === result.level.level ? '#1a1a2e' : '#6c757d', fontWeight: l.level === result.level.level ? 700 : 400 }}>
                      {l.label} ({prev}~{l.max}점)
                    </div>
                    {l.level === result.level.level && (
                      <span style={{ background: `${levelColors[l.level]}18`, color: levelColors[l.level], padding: '2px 8px', borderRadius: 20, fontSize: '.72rem', fontWeight: 700 }}>현재</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setStep(0)} style={{ background: '#F8F9FA', color: '#6c757d', padding: '11px 22px', borderRadius: 10, border: '1px solid #dee2e6', cursor: 'pointer', fontWeight: 500 }}>
                다른 검사 하기
              </button>
              <button onClick={() => router.push('/dashboard/counsel')} style={{ background: '#4F8EF7', color: 'white', padding: '11px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                💬 상담 받기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
