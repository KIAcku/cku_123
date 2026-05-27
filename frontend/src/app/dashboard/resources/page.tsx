'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { id: 'all', label: '전체', icon: '📋' },
  { id: 'stress', label: '스트레스', icon: '💆' },
  { id: 'study', label: '학업', icon: '📚' },
  { id: 'relation', label: '인간관계', icon: '🤝' },
  { id: 'career', label: '진로', icon: '💼' },
  { id: 'mindfulness', label: '마음챙김', icon: '🧘' },
];

const ARTICLES = [
  {
    id: 1, category: 'stress',
    title: '번아웃에서 회복하는 5가지 방법',
    desc: '쉬지 못하고 달려온 당신에게. 번아웃의 신호를 알아채고 회복하는 실전 가이드입니다.',
    readTime: '5분', emoji: '🔋', color: '#4F8EF7',
    tags: ['번아웃', '회복', '휴식'],
    content: `## 번아웃이란?

번아웃(Burnout)은 과도한 스트레스가 누적되어 신체적·정신적으로 완전히 지친 상태입니다. 

### 번아웃의 신호들

- 아침에 일어나기가 싫고 학교 가기 싫다
- 좋아했던 것들이 더 이상 즐겁지 않다
- 사소한 일에도 쉽게 짜증이 난다
- 집중력이 떨어지고 멍하니 있는 시간이 늘었다

### 5가지 회복 방법

**1. 의도적으로 아무것도 하지 않는 시간 만들기**
생산적이지 않아도 괜찮습니다. 하루 30분은 그냥 멍하게 있거나 좋아하는 음악을 들어보세요.

**2. 활동 하나 줄이기**
지금 하는 일 중 하나를 2주 동안 잠시 멈춰보세요. 완벽하지 않아도 됩니다.

**3. 자연 속 걷기**
매일 20분 산책만으로도 스트레스 호르몬 코르티솔이 감소합니다.

**4. 수면 루틴 만들기**
매일 같은 시간에 자고 일어나는 것만으로 회복 속도가 2배 빨라집니다.

**5. 전문가에게 이야기하기**
혼자 감당하지 않아도 됩니다. 학교 상담센터를 방문해보세요.`
  },
  {
    id: 2, category: 'study',
    title: '시험 불안 극복하기 — 과학적 방법',
    desc: '시험만 되면 머리가 하얘지거나 몸이 굳어버리는 당신을 위한 인지행동치료 기반 가이드.',
    readTime: '7분', emoji: '📝', color: '#6c63ff',
    tags: ['시험불안', '인지행동', '집중력'],
    content: `## 시험 불안은 왜 생길까?

시험 불안은 평가에 대한 두려움이 신체적·인지적 반응으로 나타나는 것입니다.

### 즉각적인 진정 기법

**1. 4-7-8 호흡법**
4초 들이쉬기 → 7초 참기 → 8초 내쉬기
시험 시작 전 3회 반복하면 심박수가 안정됩니다.

**2. 인지 재구성**
"이 시험 하나가 내 인생을 결정하지 않는다"
"나는 준비한 만큼 할 수 있다"
이런 생각을 의식적으로 반복하세요.

**3. 시험 전날 행동**
새로운 내용을 공부하지 마세요. 아는 것을 복습하면 뇌가 안정감을 느낍니다.

### 장기적인 해결책

- 평소에 작은 테스트를 자주 보는 '검색 연습'
- 충분한 수면 (시험 전날 6시간 이상)
- 과도한 카페인 피하기`
  },
  {
    id: 3, category: 'relation',
    title: '건강한 경계선 만들기 — NO 라고 말하는 법',
    desc: '모든 부탁을 들어주다 지쳐버린 당신. 건강한 관계를 위한 경계선 설정 가이드.',
    readTime: '6분', emoji: '🤲', color: '#20c997',
    tags: ['경계선', '인간관계', '자존감'],
    content: `## 경계선이 필요한 이유

건강한 경계선은 자기 자신을 지키는 동시에 관계를 더 깊고 진실되게 만듭니다.

### NO 라고 말하는 연습

**단계 1: 즉시 거절하지 않아도 된다**
"한번 생각해볼게요"라고 시간을 버는 것도 괜찮습니다.

**단계 2: 이유를 장황하게 설명하지 않아도 된다**
"지금은 어렵겠어요"만으로 충분합니다.

**단계 3: 죄책감을 느끼지 않기**
거절은 사람을 거부하는 것이 아니라 행동을 거부하는 것입니다.

### 학교에서 경계선 설정하기

- 팀플에서 불합리한 요구: "그 부분은 담당이 아니라서..."
- 에너지가 없을 때: "오늘은 좀 쉬고 싶어"
- 개인 정보 요구: "그건 좀 사적인 부분이라..."`
  },
  {
    id: 4, category: 'career',
    title: '진로 불안, 이렇게 다루세요',
    desc: '"나만 뒤처지는 것 같아서" — 비교와 불안에서 벗어나 자신만의 속도를 찾는 법.',
    readTime: '8분', emoji: '🌱', color: '#fd7e14',
    tags: ['진로', '비교', '자기발견'],
    content: `## 진로 불안은 누구나 경험해요

SNS에서 친구들의 스펙과 취업 소식을 보며 불안해진 적 있나요? 이건 매우 자연스러운 반응입니다.

### 비교에서 벗어나는 법

**1. SNS 사용 시간 줄이기**
하루 30분으로 제한하는 것만으로도 불안이 크게 줄어든다는 연구가 있습니다.

**2. '지금 내가 할 수 있는 것' 에 집중하기**
미래는 통제할 수 없지만 오늘은 통제할 수 있습니다.

### 자신의 방향 찾기

**가치 기반 질문들:**
- 돈보다 중요한 것이 무엇인가?
- 어떤 활동을 할 때 시간이 빨리 가는가?
- 10년 후 어떤 삶을 살고 싶은가?

이 질문들에 답하다 보면 자신만의 방향이 보이기 시작합니다.`
  },
  {
    id: 5, category: 'mindfulness',
    title: '마음챙김 명상 5분 시작하기',
    desc: '명상이 어렵다고요? 딱 5분, 앉아서 숨만 쉬어도 됩니다. 초보자를 위한 가이드.',
    readTime: '4분', emoji: '🧘', color: '#e83e8c',
    tags: ['명상', '마음챙김', '현재'],
    content: `## 명상이란?

명상은 현재 순간에 집중하는 연습입니다. 생각을 없애는 게 아니라, 생각을 알아채고 놓아주는 것입니다.

### 5분 마음챙김 명상

**시작 전 준비:**
편한 자세로 앉거나 눕습니다. 눈을 감아도 좋고 열어도 좋습니다.

**Step 1 (1분): 몸 스캔**
발 → 다리 → 배 → 가슴 → 어깨 → 얼굴 순서로 각 부위에 잠시 주의를 둡니다.

**Step 2 (3분): 호흡 관찰**
코로 들어오고 나가는 숨을 관찰합니다. 생각이 떠오르면 "생각이 왔구나"하고 알아채고 다시 호흡으로 돌아옵니다.

**Step 3 (1분): 마무리**
천천히 눈을 뜨고 지금 이 순간으로 돌아옵니다.

### 언제 하면 좋을까?

- 아침에 일어난 직후
- 시험 전 긴장될 때  
- 잠들기 전`
  },
  {
    id: 6, category: 'stress',
    title: '학업 스트레스를 이기는 시간 관리법',
    desc: '할 일이 너무 많아 무엇부터 해야 할지 모르겠다면? 뽀모도로와 아이젠하워 매트릭스.',
    readTime: '6분', emoji: '⏱️', color: '#4F8EF7',
    tags: ['시간관리', '생산성', '뽀모도로'],
    content: `## 왜 시간이 늘 부족할까?

실제로 시간이 부족한 게 아니라 우선순위와 집중력이 부족한 경우가 많습니다.

### 뽀모도로 기법

25분 집중 → 5분 휴식 → 4번 반복 → 30분 휴식

**왜 효과적일까?**
끝이 보이는 짧은 단위로 쪼개면 심리적 저항이 줄어듭니다.

### 아이젠하워 매트릭스

|  | 긴급함 | 긴급하지 않음 |
|--|--------|-------------|
| **중요함** | 즉시 처리 | 계획 수립 |
| **중요하지 않음** | 위임 | 제거 |

모든 할 일을 이 4칸에 배치해보면 무엇을 먼저 해야 할지 명확해집니다.

### 오늘 당장 실천하기

1. 내일 할 일 3가지만 정한다
2. 가장 어려운 것을 첫 번째로 한다  
3. 완벽하지 않아도 '완료'로 표시한다`
  },
];

export default function ResourcesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<typeof ARTICLES[0] | null>(null);

  const filtered = activeCategory === 'all' ? ARTICLES : ARTICLES.filter(a => a.category === activeCategory);

  if (selectedArticle) {
    return (
      <div>
        {/* 아티클 히어로 */}
        <div style={{ background: `linear-gradient(135deg, ${selectedArticle.color} 0%, ${selectedArticle.color}99 100%)`, padding: '36px 28px', color: 'white' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.2)', borderRadius: 20, padding: '4px 14px', fontSize: 13, marginBottom: 14, cursor: 'pointer' }} onClick={() => setSelectedArticle(null)}>
              ← 목록으로
            </div>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>{selectedArticle.emoji}</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{selectedArticle.title}</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <span style={{ background: 'rgba(255,255,255,.2)', padding: '3px 12px', borderRadius: 20, fontSize: '.78rem' }}>📖 {selectedArticle.readTime} 읽기</span>
              {selectedArticle.tags.map(t => (
                <span key={t} style={{ background: 'rgba(255,255,255,.15)', padding: '3px 12px', borderRadius: 20, fontSize: '.78rem' }}>#{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '32px', border: '1px solid #e9ecef', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
            <div style={{ fontSize: '.95rem', lineHeight: 1.9, color: '#333', whiteSpace: 'pre-line' }}>
              {selectedArticle.content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 12px', color: selectedArticle.color }}>{line.slice(3)}</h2>;
                if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: '1rem', fontWeight: 700, margin: '20px 0 10px', color: '#1a1a2e' }}>{line.slice(4)}</h3>;
                if (line.startsWith('**') && line.endsWith('**')) return <p key={i} style={{ fontWeight: 700, marginBottom: 6 }}>{line.slice(2, -2)}</p>;
                if (line.startsWith('- ')) return <li key={i} style={{ marginLeft: 20, marginBottom: 4 }}>{line.slice(2)}</li>;
                if (line === '') return <br key={i} />;
                return <p key={i} style={{ marginBottom: 6 }}>{line}</p>;
              })}
            </div>
          </div>

          {/* 하단 액션 */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button onClick={() => setSelectedArticle(null)} style={{ background: '#F8F9FA', color: '#6c757d', padding: '11px 20px', borderRadius: 10, border: '1px solid #dee2e6', cursor: 'pointer', fontWeight: 500 }}>
              ← 목록으로
            </button>
            <button onClick={() => router.push('/dashboard/counsel')} style={{ background: selectedArticle.color, color: 'white', padding: '11px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, flex: 1 }}>
              💬 상담사와 이야기하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 히어로 */}
      <div style={{ background: 'linear-gradient(135deg, #4F8EF7 0%, #6c63ff 100%)', padding: '36px 28px', color: 'white' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,.2)', borderRadius: 20, padding: '4px 14px', fontSize: 13, marginBottom: 12 }}>마음건강 가이드</div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 700, marginBottom: 8 }}>📚 마음건강 자료실</h2>
          <p style={{ opacity: .88, fontSize: '.9rem' }}>전문가가 검증한 심리 건강 가이드와 실전 팁을 만나보세요.</p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px' }}>
        {/* 카테고리 탭 */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
              padding: '8px 16px', borderRadius: 50, fontSize: '.85rem', cursor: 'pointer',
              border: `1.5px solid ${activeCategory === cat.id ? '#4F8EF7' : '#dee2e6'}`,
              background: activeCategory === cat.id ? '#e8f4fd' : 'white',
              color: activeCategory === cat.id ? '#4F8EF7' : '#495057',
              fontWeight: activeCategory === cat.id ? 700 : 400, transition: 'all .15s'
            }}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* 아티클 그리드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {filtered.map(article => (
            <div key={article.id} onClick={() => setSelectedArticle(article)} style={{
              background: 'white', borderRadius: 16, padding: '24px 22px',
              border: '1px solid #e9ecef', cursor: 'pointer', transition: 'all .2s',
              boxShadow: '0 1px 4px rgba(0,0,0,.04)'
            }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = article.color; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${article.color}18`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e9ecef'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,.04)'; (e.currentTarget as HTMLElement).style.transform = ''; }}>
              <div style={{ fontSize: '2.2rem', marginBottom: 14 }}>{article.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8, lineHeight: 1.4 }}>{article.title}</div>
              <div style={{ fontSize: '.82rem', color: '#6c757d', marginBottom: 14, lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {article.desc}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {article.tags.map(t => (
                    <span key={t} style={{ background: `${article.color}12`, color: article.color, padding: '2px 8px', borderRadius: 20, fontSize: '.72rem', fontWeight: 600 }}>#{t}</span>
                  ))}
                </div>
                <span style={{ fontSize: '.75rem', color: '#adb5bd', flexShrink: 0 }}>📖 {article.readTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
