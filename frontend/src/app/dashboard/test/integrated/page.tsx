'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/apiClient';
import { useLangStore } from '@/store/langStore';

// ─── 다국어 사전 ─────────────────────────────────────────────────
const i18n: Record<string, any> = {
  ko: {
    title: '통합 심리 프로파일',
    subtitle: '완료한 검사들을 분석하여 나만의 심리 패턴을 도출합니다.',
    loading: '분석 중...',
    no_data_title: '아직 완료한 검사가 없습니다',
    no_data_sub: '심리 자가진단 검사를 먼저 완료해주세요.',
    go_test: '검사 하러 가기 →',
    radar_title: '심리 영역별 건강 지수',
    radar_desc: '0~100점 (높을수록 건강)',
    domains: {
      emotional_health:    '정서 건강',
      stress_resilience:   '스트레스 회복력',
      self_esteem:         '자존감',
      attachment_security: '애착 안정성',
      relationship_health: '관계 건강',
      emotion_regulation:  '정서 조절',
    },
    completed_tests: '완료한 검사',
    weak_areas: '⚠️ 취약 영역',
    strong_areas: '✨ 강점 영역',
    weak_desc: '아래 영역에서 상대적으로 어려움을 겪고 있습니다.',
    strong_desc: '아래 영역에서 높은 강점을 보이고 있습니다.',
    integrated_analysis: '🔍 통합 심리 분석',
    solutions_title: '💊 맞춤 솔루션',
    pattern_label: '발견된 패턴',
    test_names: {
      phq9: 'PHQ-9 우울', gad7: 'GAD-7 불안', stress: '학업 스트레스',
      ecr: 'ECR 성인 애착', rses: '로젠버그 자존감', relationship: '연애 패턴',
      ders: 'DERS 정서조절', ego: '자아 경계',
    },
    score_label: '점수',
    level_label: '단계',
    retake: '재검사',
    not_done: '미완료',
    counseling_btn: '💬 전문 상담 받기',
    domains_todo: '더 정확한 분석을 위해 나머지 검사도 완료해보세요.',
  },
  en: {
    title: 'Integrated Psychological Profile',
    subtitle: 'Your completed assessments are analyzed to reveal your unique psychological patterns.',
    loading: 'Analyzing...',
    no_data_title: 'No assessments completed yet',
    no_data_sub: 'Please complete at least one psychological self-assessment first.',
    go_test: 'Go to Assessments →',
    radar_title: 'Psychological Domain Health Index',
    radar_desc: 'Score 0–100 (higher = healthier)',
    domains: {
      emotional_health:    'Emotional Health',
      stress_resilience:   'Stress Resilience',
      self_esteem:         'Self-Esteem',
      attachment_security: 'Attachment Security',
      relationship_health: 'Relationship Health',
      emotion_regulation:  'Emotion Regulation',
    },
    completed_tests: 'Completed Tests',
    weak_areas: '⚠️ Weak Areas',
    strong_areas: '✨ Strong Areas',
    weak_desc: 'You may be experiencing difficulties in these domains.',
    strong_desc: 'You show strong health in these domains.',
    integrated_analysis: '🔍 Integrated Analysis',
    solutions_title: '💊 Personalized Solutions',
    pattern_label: 'Pattern Detected',
    test_names: {
      phq9: 'PHQ-9 Depression', gad7: 'GAD-7 Anxiety', stress: 'Academic Stress',
      ecr: 'ECR Attachment', rses: 'Self-Esteem (RSES)', relationship: 'Relationship',
      ders: 'DERS Emotion Reg.', ego: 'Ego Strength',
    },
    score_label: 'Score',
    level_label: 'Level',
    retake: 'Retake',
    not_done: 'Not done',
    counseling_btn: '💬 Get Counseling',
    domains_todo: 'Complete more assessments for a fuller picture.',
  },
  ja: {
    title: '統合心理プロファイル',
    subtitle: '完了した検査を分析して、あなただけの心理パターンを導き出します。',
    loading: '分析中...',
    no_data_title: 'まだ完了した検査がありません',
    no_data_sub: 'まず心理自己診断検査を完了してください。',
    go_test: '検査に行く →',
    radar_title: '心理領域別健康指数',
    radar_desc: '0〜100点（高いほど健康）',
    domains: {
      emotional_health:    '感情的健康',
      stress_resilience:   'ストレス回復力',
      self_esteem:         '自尊感情',
      attachment_security: '愛着安定性',
      relationship_health: '関係健康',
      emotion_regulation:  '感情調節',
    },
    completed_tests: '完了した検査',
    weak_areas: '⚠️ 弱い領域',
    strong_areas: '✨ 強い領域',
    weak_desc: '以下の領域で相対的に困難を経験しています。',
    strong_desc: '以下の領域で高い強みを示しています。',
    integrated_analysis: '🔍 統合心理分析',
    solutions_title: '💊 カスタムソリューション',
    pattern_label: '検出されたパターン',
    test_names: {
      phq9: 'PHQ-9 うつ', gad7: 'GAD-7 不安', stress: '学業ストレス',
      ecr: 'ECR 愛着', rses: '自尊感情尺度', relationship: '恋愛パターン',
      ders: 'DERS 感情調節', ego: '自我境界',
    },
    score_label: 'スコア',
    level_label: 'レベル',
    retake: '再検査',
    not_done: '未完了',
    counseling_btn: '💬 カウンセリングを受ける',
    domains_todo: 'より正確な分析のために残りの検査も完了してみてください。',
  },
  zh: {
    title: '综合心理档案',
    subtitle: '分析您完成的测试，揭示您独特的心理模式。',
    loading: '分析中...',
    no_data_title: '尚未完成任何测试',
    no_data_sub: '请先完成至少一项心理自我诊断测试。',
    go_test: '去做测试 →',
    radar_title: '心理领域健康指数',
    radar_desc: '0-100分（越高越健康）',
    domains: {
      emotional_health:    '情绪健康',
      stress_resilience:   '压力恢复力',
      self_esteem:         '自尊',
      attachment_security: '依恋安全感',
      relationship_health: '关系健康',
      emotion_regulation:  '情绪调节',
    },
    completed_tests: '已完成测试',
    weak_areas: '⚠️ 薄弱领域',
    strong_areas: '✨ 优势领域',
    weak_desc: '您可能在以下领域遇到困难。',
    strong_desc: '您在以下领域表现出较高的优势。',
    integrated_analysis: '🔍 综合心理分析',
    solutions_title: '💊 个性化解决方案',
    pattern_label: '检测到的模式',
    test_names: {
      phq9: 'PHQ-9 抑郁', gad7: 'GAD-7 焦虑', stress: '学业压力',
      ecr: 'ECR 依恋', rses: '罗森伯格自尊量表', relationship: '恋爱模式',
      ders: 'DERS 情绪调节', ego: '自我边界',
    },
    score_label: '分数',
    level_label: '等级',
    retake: '重测',
    not_done: '未完成',
    counseling_btn: '💬 接受咨询',
    domains_todo: '完成更多测试以获得更全面的分析。',
  },
};

// ─── 교차 패턴 분석 규칙 ─────────────────────────────────────────
function generatePatterns(radar: Record<string, number | null>, lang: string) {
  const patterns: { icon: string; title: string; desc: string; solutions: string[] }[] = [];

  const eh  = radar.emotional_health;
  const sr  = radar.stress_resilience;
  const se  = radar.self_esteem;
  const as_ = radar.attachment_security;
  const rh  = radar.relationship_health;
  const er  = radar.emotion_regulation;

  const low  = (v: number | null) => v !== null && v < 40;
  const mid  = (v: number | null) => v !== null && v >= 40 && v < 65;
  const high = (v: number | null) => v !== null && v >= 65;

  const db: Record<string, { icon: string; title: string; desc: string; solutions: string[] }[]> = {
    ko: [
      ...(low(eh) && low(se) && low(as_) ? [{ icon: '🌑', title: '자기비하-의존형', desc: '우울 및 낮은 자존감과 함께 애착 불안이 높아, 관계에서 과도하게 의존하거나 버림받을 것을 두려워하는 패턴이 나타납니다.', solutions: ['자기연민(Self-Compassion) 훈련 — Kristin Neff의 MSC 프로그램을 검색해보세요', 'CBT 기반 자동적 사고 기록지 작성', '주 1회 이상 긍정적 자기 대화 일지 작성', '심리 상담을 통한 내면 아이 치유 작업'] }] : []),
      ...(low(as_) && low(rh) && high(er) ? [{ icon: '🧊', title: '고립-방어형', desc: '친밀감을 회피하고 감정 표현을 억제하는 경향이 있습니다. 독립적이지만 깊은 연결감을 어려워합니다.', solutions: ['점진적 취약성 훈련 — 신뢰하는 1명에게 작은 감정부터 나누기', '감정 일기 쓰기 (무엇을 느꼈는지, 왜인지)', '개인 상담을 통한 애착 패턴 탐색', '비폭력 대화(NVC) 기초 배우기'] }] : []),
      ...(low(eh) && low(er) ? [{ icon: '🌊', title: '감정 과부하형', desc: '우울 또는 불안 증상과 함께 감정 조절의 어려움이 겹쳐 있습니다. 작은 자극에도 쉽게 감정이 격해질 수 있습니다.', solutions: ['DBT(변증법적 행동치료) — TIPP 기술(온도·격렬한 운동·호흡·이완)', '감정 온도계 기록: 하루 3번 감정 강도(0~10) 체크', '마음챙김 명상 앱 활용 (최소 5분/일)', '정신건강 전문가 상담 권장'] }] : []),
      ...(low(sr) && low(se) ? [{ icon: '🔥', title: '번아웃 위험형', desc: '높은 스트레스와 낮은 자존감이 결합되어 번아웃 위험이 높습니다. 스스로를 몰아붙이는 경향이 있습니다.', solutions: ['즉각적인 휴식 계획 수립 (일상에서 최소 2가지 스트레스 원인 제거)', '성취 기준 낮추기 연습 — "충분히 잘 했다"는 태도', '신체 활동 루틴 만들기 (산책 20분/일)', '번아웃 회복 전문 상담 권장'] }] : []),
      ...(low(rh) && mid(as_) ? [{ icon: '💔', title: '반복 관계 상처형', desc: '관계 패턴에서 반복적으로 상처를 받거나 실망하는 경향이 있습니다. 높은 기대와 소통 방식 개선이 필요합니다.', solutions: ['기대 현실화 훈련 — 기대를 명시적으로 표현하는 연습', '커플 상담 또는 관계 심리 독서', '비폭력 대화(NVC): 관찰·감정·필요·요청 4단계 훈련', '자기 욕구 명확히 파악하기 (욕구 카드 활용)'] }] : []),
      ...(high(eh) && high(se) && high(as_) ? [{ icon: '🌟', title: '심리적 강인형', desc: '전반적으로 건강한 심리 상태를 유지하고 있습니다. 정서적으로 안정적이고 관계에서도 안정적인 패턴을 보입니다.', solutions: ['현재 상태 유지를 위한 마음챙김 실천', '관계에서의 공감 능력 더욱 키우기', '타인을 돕는 봉사 활동으로 의미 확장', '심리적 강점을 주변에 나눠보세요'] }] : []),
    ],
    en: [
      ...(low(eh) && low(se) && low(as_) ? [{ icon: '🌑', title: 'Self-Critical & Dependent', desc: 'Depression, low self-esteem, and high attachment anxiety combine into a pattern of excessive reliance on others and fear of abandonment.', solutions: ['Self-Compassion training (MSC by Kristin Neff)', 'CBT thought records for automatic negative thoughts', 'Daily positive self-talk journaling (min. 3 entries/week)', 'Inner child healing work with a therapist'] }] : []),
      ...(low(as_) && low(rh) && high(er) ? [{ icon: '🧊', title: 'Isolated & Guarded', desc: 'You tend to avoid intimacy and suppress emotional expression. Independent, but deep connection feels difficult.', solutions: ['Gradual vulnerability practice — share small feelings with one trusted person', 'Emotion journaling (what did I feel, and why?)', 'Explore attachment patterns in therapy', 'Learn Nonviolent Communication (NVC)'] }] : []),
      ...(low(eh) && low(er) ? [{ icon: '🌊', title: 'Emotional Overload', desc: 'Depressive/anxious symptoms combined with emotion regulation difficulties. Small triggers can escalate quickly.', solutions: ['DBT TIPP skills (Temperature, Intense exercise, Paced breathing, Progressive relaxation)', 'Emotion thermometer: check intensity (0–10) 3x/day', 'Mindfulness app (min. 5 min/day)', 'Professional mental health consultation recommended'] }] : []),
      ...(low(sr) && low(se) ? [{ icon: '🔥', title: 'Burnout Risk', desc: 'High stress combined with low self-esteem — you may be pushing yourself too hard.', solutions: ['Immediate rest plan: remove at least 2 stressors from daily life', 'Practice "good enough" — lower achievement bar', 'Physical activity routine (20-min walk/day)', 'Burnout recovery counseling recommended'] }] : []),
      ...(low(rh) && mid(as_) ? [{ icon: '💔', title: 'Repeated Relationship Hurt', desc: 'A pattern of recurring hurt or disappointment in relationships. High expectations and communication style need attention.', solutions: ['Expectation calibration: practice expressing needs explicitly', 'Couples counseling or relationship psychology reading', 'NVC: Observation, Feeling, Need, Request (4-step practice)', 'Clarify your own needs (needs inventory cards)'] }] : []),
      ...(high(eh) && high(se) && high(as_) ? [{ icon: '🌟', title: 'Psychologically Resilient', desc: 'You demonstrate overall healthy psychological functioning with emotional stability and secure relationships.', solutions: ['Continue mindfulness practice to maintain your state', 'Deepen empathy skills in relationships', 'Expand meaning through volunteering or mentoring', 'Share your psychological strengths with those around you'] }] : []),
    ],
    ja: [
      ...(low(eh) && low(se) && low(as_) ? [{ icon: '🌑', title: '自己卑下・依存型', desc: 'うつや低い自尊感情、高い愛着不安が組み合わさり、関係に過度に依存したり見捨てられることを恐れるパターンがあります。', solutions: ['セルフコンパッション(自己思いやり)トレーニング', 'CBT自動思考記録ワーク', '週1回以上のポジティブ自己対話日記', 'カウンセリングを通じたインナーチャイルド癒し'] }] : []),
      ...(low(as_) && low(rh) && high(er) ? [{ icon: '🧊', title: '孤立・防衛型', desc: '親密さを回避し感情表現を抑える傾向があります。独立的ですが、深いつながりが難しいです。', solutions: ['段階的な脆弱性練習 — 信頼できる1人に小さな感情から共有する', '感情日記を書く（何を感じたか、なぜか）', '愛着パターンをカウンセリングで探索する', '非暴力コミュニケーション(NVC)の基礎を学ぶ'] }] : []),
      ...(low(eh) && low(er) ? [{ icon: '🌊', title: '感情過負荷型', desc: 'うつ/不安症状と感情調節困難が重なっています。小さな刺激でも感情が激しくなりやすいです。', solutions: ['DBT TIPPスキル練習', '感情温度計: 1日3回感情強度(0〜10)を記録', 'マインドフルネスアプリ活用（最低5分/日）', '精神科または心理相談を強く推奨'] }] : []),
      ...(low(sr) && low(se) ? [{ icon: '🔥', title: 'バーンアウトリスク型', desc: '高いストレスと低い自尊感情が組み合わさり、バーンアウトリスクが高いです。', solutions: ['即時の休息計画 — 日常から最低2つのストレス原因を除く', '「十分うまくできた」という姿勢の練習', '身体活動ルーティン作成（散歩20分/日）', 'バーンアウト回復専門相談を推奨'] }] : []),
      ...(low(rh) && mid(as_) ? [{ icon: '💔', title: '繰り返す関係傷つき型', desc: '関係で繰り返し傷ついたり失望するパターンがあります。', solutions: ['期待を明示的に表現する練習', 'カップルカウンセリングまたは関係心理の読書', '非暴力コミュニケーション(NVC)の4段階練習', '自分のニーズを明確にする'] }] : []),
      ...(high(eh) && high(se) && high(as_) ? [{ icon: '🌟', title: '心理的強靭型', desc: '全体的に健康な心理状態を維持しており、情動的に安定した関係パターンを示しています。', solutions: ['マインドフルネス実践を継続する', '関係における共感能力をさらに深める', 'ボランティア活動などで意味を広げる', '心理的強みを周囲と分かち合う'] }] : []),
    ],
    zh: [
      ...(low(eh) && low(se) && low(as_) ? [{ icon: '🌑', title: '自我贬低-依赖型', desc: '抑郁、低自尊和高度依恋焦虑相结合，形成在关系中过度依赖或害怕被抛弃的模式。', solutions: ['自我关怀（Self-Compassion）训练', 'CBT自动思维记录练习', '每周至少一次积极自我对话日记', '通过咨询进行内在小孩治愈工作'] }] : []),
      ...(low(as_) && low(rh) && high(er) ? [{ icon: '🧊', title: '孤立-防御型', desc: '倾向于回避亲密感并压制情感表达。独立但难以建立深度连接。', solutions: ['渐进式脆弱性练习 — 从与一个可信赖的人分享小感受开始', '情绪日记（我感到了什么，为什么）', '通过咨询探索依恋模式', '学习非暴力沟通（NVC）基础'] }] : []),
      ...(low(eh) && low(er) ? [{ icon: '🌊', title: '情绪过载型', desc: '抑郁/焦虑症状与情绪调节困难相叠加，容易被小刺激激发强烈情绪。', solutions: ['DBT TIPP技能练习', '情绪温度计：每天3次记录情绪强度(0-10)', '正念冥想APP（至少5分钟/天）', '强烈建议咨询心理健康专业人士'] }] : []),
      ...(low(sr) && low(se) ? [{ icon: '🔥', title: '倦怠风险型', desc: '高压力和低自尊相结合，有倦怠风险，可能过于自我苛责。', solutions: ['立即制定休息计划：从日常生活中消除至少2个压力源', '练习"足够好"的心态', '建立身体活动习惯（每天步行20分钟）', '建议寻求倦怠恢复专业咨询'] }] : []),
      ...(low(rh) && mid(as_) ? [{ icon: '💔', title: '重复关系受伤型', desc: '在关系中反复受伤或失望的模式，需要调整期望和沟通方式。', solutions: ['期望校准训练 — 练习明确表达需求', '伴侣咨询或关系心理阅读', '非暴力沟通（NVC）四步练习', '明确自己的需求'] }] : []),
      ...(high(eh) && high(se) && high(as_) ? [{ icon: '🌟', title: '心理强韧型', desc: '整体维持健康的心理状态，在情感和关系上都表现稳定。', solutions: ['继续正念练习以维持当前状态', '在关系中进一步培养共情能力', '通过志愿活动拓展意义', '与周围人分享您的心理优势'] }] : []),
    ],
  };

  return (db[lang] || db.ko).filter(p => p.title); // 비어있는 것 제거
}

// ─── SVG 레이더 차트 ─────────────────────────────────────────────
function RadarChart({ data, labels }: { data: (number | null)[]; labels: string[] }) {
  const N = data.length;
  const cx = 160, cy = 160, r = 110;
  const angles = data.map((_, i) => (Math.PI * 2 * i) / N - Math.PI / 2);

  const toXY = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  });

  const rings = [20, 40, 60, 80, 100];
  const colors = ['#4F8EF7', '#6c63ff', '#f472b6', '#20c997', '#fbbf24', '#a78bfa'];

  const filledData = data.map(v => (v === null ? 0 : v));
  const points = filledData.map((v, i) => {
    const pt = toXY(angles[i], (v / 100) * r);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 320 320" style={{ width: '100%', maxWidth: 320, display: 'block', margin: '0 auto' }}>
      {/* 배경 링 */}
      {rings.map((ring, ri) => {
        const pts = angles.map(a => {
          const pt = toXY(a, (ring / 100) * r);
          return `${pt.x},${pt.y}`;
        }).join(' ');
        return (
          <polygon key={ri} points={pts}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        );
      })}
      {/* 축 */}
      {angles.map((a, i) => {
        const outer = toXY(a, r);
        return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
      })}
      {/* 데이터 영역 */}
      <polygon points={points}
        fill="rgba(99,102,241,0.25)" stroke="url(#radarGrad)" strokeWidth="2.5" strokeLinejoin="round" />
      {/* 그라데이션 */}
      <defs>
        <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F8EF7" />
          <stop offset="50%" stopColor="#6c63ff" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      {/* 데이터 포인트 */}
      {filledData.map((v, i) => {
        const pt = toXY(angles[i], (v / 100) * r);
        return (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r="5" fill={colors[i % colors.length]} stroke="white" strokeWidth="1.5" />
          </g>
        );
      })}
      {/* 레이블 */}
      {labels.map((lbl, i) => {
        const pt = toXY(angles[i], r + 22);
        return (
          <text key={i} x={pt.x} y={pt.y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="9.5" fill="rgba(255,255,255,0.75)" fontWeight="600">
            {lbl.split(' ').map((word, wi) => (
              <tspan key={wi} x={pt.x} dy={wi === 0 ? '0' : '12'}>{word}</tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}

// ─── 도메인 점수 색상 ─────────────────────────────────────────────
function domainColor(score: number | null) {
  if (score === null) return '#6c757d';
  if (score >= 65) return '#20c997';
  if (score >= 45) return '#fbbf24';
  return '#EF4444';
}

const ALL_TEST_KEYS = ['phq9', 'gad7', 'stress', 'ecr', 'rses', 'relationship', 'ders', 'ego'];

export default function IntegratedPage() {
  const router = useRouter();
  const { lang } = useLangStore();
  const t = i18n[lang] || i18n.ko;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/counsel/tests/integrated-report`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (res.ok) setData(await res.json());
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--text-muted)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
        <p>{t.loading}</p>
      </div>
    </div>
  );

  const hasData = data && Object.keys(data.latest_tests || {}).length > 0;

  if (!hasData) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🧠</div>
        <h3 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>{t.no_data_title}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{t.no_data_sub}</p>
        <button onClick={() => router.push('/dashboard/test')} style={{ background: 'linear-gradient(135deg, #4F8EF7, #6c63ff)', color: 'white', padding: '12px 28px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 20px rgba(79,142,247,0.4)' }}>
          {t.go_test}
        </button>
      </div>
    </div>
  );

  const radar = data.radar as Record<string, number | null>;
  const domainKeys = Object.keys(radar);
  const radarValues = domainKeys.map(k => radar[k]);
  const radarLabels = domainKeys.map(k => (t.domains as any)[k] || k);
  const patterns = generatePatterns(radar, lang);
  const completedTypes = data.completed_types as string[];
  const latestTests = data.latest_tests as Record<string, any>;

  return (
    <div>
      {/* 히어로 */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a3e 0%, #2d1b69 50%, #4a1942 100%)', padding: '40px 28px', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(167,139,250,0.3) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 150, height: 150, background: 'radial-gradient(circle, rgba(244,114,182,0.25) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ maxWidth: 780, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-block', background: 'rgba(167,139,250,0.25)', border: '1px solid rgba(167,139,250,0.4)', borderRadius: 20, padding: '4px 14px', fontSize: 12, marginBottom: 12, fontWeight: 700, letterSpacing: '.04em' }}>
            {lang === 'ko' ? '🔬 AI 심리 분석' : lang === 'ja' ? '🔬 AI 心理分析' : lang === 'zh' ? '🔬 AI 心理分析' : '🔬 AI Psychological Analysis'}
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 8, letterSpacing: '-.01em' }}>{t.title}</h1>
          <p style={{ opacity: .8, fontSize: '.9rem', lineHeight: 1.6, maxWidth: 500 }}>{t.subtitle}</p>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '28px' }}>

        {/* 완료 현황 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--text-muted)', marginBottom: 12, letterSpacing: '.04em', textTransform: 'uppercase' }}>{t.completed_tests}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ALL_TEST_KEYS.map(key => {
              const done = completedTypes.includes(key);
              return (
                <div key={key} onClick={() => !done && router.push('/dashboard/test')} style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${done ? '#20c997' : 'var(--glass-border)'}`, background: done ? 'rgba(32,201,151,0.12)' : 'var(--glass-bg)', color: done ? '#20c997' : 'var(--text-muted)', fontSize: '.78rem', fontWeight: 700, cursor: done ? 'default' : 'pointer', backdropFilter: 'blur(8px)', transition: 'all .2s' }}>
                  {done ? '✓ ' : '○ '}{(t.test_names as any)[key]}
                </div>
              );
            })}
          </div>
          {completedTypes.length < ALL_TEST_KEYS.length && (
            <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: 10 }}>{t.domains_todo}</p>
          )}
        </div>

        {/* 레이더 차트 */}
        <div style={{ background: 'linear-gradient(135deg, rgba(79,142,247,0.08) 0%, rgba(108,99,255,0.08) 50%, rgba(244,114,182,0.08) 100%)', borderRadius: 20, border: '1px solid rgba(167,139,250,0.2)', padding: '24px', marginBottom: 24, backdropFilter: 'blur(12px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>{t.radar_title}</h3>
            <p style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{t.radar_desc}</p>
          </div>
          <RadarChart data={radarValues} labels={radarLabels} />
          {/* 수치 그리드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 20 }}>
            {domainKeys.map(k => {
              const v = radar[k];
              return (
                <div key={k} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: domainColor(v) }}>
                    {v !== null ? Math.round(v) : '—'}
                  </div>
                  <div style={{ fontSize: '.68rem', color: 'var(--text-muted)', marginTop: 2, wordBreak: 'keep-all', lineHeight: 1.3 }}>
                    {(t.domains as any)[k]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 취약 / 강점 영역 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {/* 취약 영역 */}
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: '18px' }}>
            <div style={{ fontWeight: 800, color: '#EF4444', marginBottom: 8, fontSize: '.9rem' }}>{t.weak_areas}</div>
            <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>{t.weak_desc}</p>
            {data.weak_areas.length === 0
              ? <div style={{ fontSize: '.8rem', color: '#20c997', fontWeight: 600 }}>✓ 취약 영역 없음</div>
              : data.weak_areas.map((a: any) => (
                <div key={a.domain} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '.8rem', color: 'var(--text-secondary)', wordBreak: 'keep-all' }}>{(t.domains as any)[a.domain]}</span>
                  <span style={{ fontWeight: 800, fontSize: '.85rem', color: '#EF4444' }}>{Math.round(a.score)}</span>
                </div>
              ))}
          </div>
          {/* 강점 영역 */}
          <div style={{ background: 'rgba(32,201,151,0.08)', border: '1px solid rgba(32,201,151,0.2)', borderRadius: 16, padding: '18px' }}>
            <div style={{ fontWeight: 800, color: '#20c997', marginBottom: 8, fontSize: '.9rem' }}>{t.strong_areas}</div>
            <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>{t.strong_desc}</p>
            {data.strong_areas.length === 0
              ? <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>—</div>
              : data.strong_areas.map((a: any) => (
                <div key={a.domain} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '.8rem', color: 'var(--text-secondary)', wordBreak: 'keep-all' }}>{(t.domains as any)[a.domain]}</span>
                  <span style={{ fontWeight: 800, fontSize: '.85rem', color: '#20c997' }}>{Math.round(a.score)}</span>
                </div>
              ))}
          </div>
        </div>

        {/* 통합 심리 분석 패턴 */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>{t.integrated_analysis}</h3>
          <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            {lang === 'ko' ? '여러 검사 결과를 교차 분석하여 도출한 심리 패턴입니다.' : lang === 'ja' ? '複数の検査結果を交差分析して導き出した心理パターンです。' : lang === 'zh' ? '交叉分析多项测试结果得出的心理模式。' : 'Psychological patterns derived from cross-analyzing multiple assessment results.'}
          </p>
          {patterns.length === 0 ? (
            <div style={{ background: 'var(--glass-bg)', borderRadius: 16, padding: '20px', border: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.875rem' }}>
              {lang === 'ko' ? '아직 패턴을 도출하기 위한 데이터가 부족합니다. 더 많은 검사를 완료해주세요.' : 'Complete more assessments to generate psychological patterns.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {patterns.map((p, i) => (
                <div key={i} style={{ background: 'var(--glass-bg)', borderRadius: 16, padding: '20px', border: '1px solid var(--glass-border)', backdropFilter: 'blur(12px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: '1.8rem' }}>{p.icon}</span>
                    <div>
                      <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 2 }}>{t.pattern_label}</div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{p.title}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 0 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 맞춤 솔루션 */}
        {patterns.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 16 }}>{t.solutions_title}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {patterns.flatMap((p, pi) =>
                p.solutions.map((sol, si) => (
                  <div key={`${pi}-${si}`} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: 'var(--glass-bg)', borderRadius: 12, padding: '14px 18px', border: '1px solid var(--glass-border)', backdropFilter: 'blur(8px)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, #4F8EF7, #a78bfa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '.75rem', flexShrink: 0 }}>
                      {pi * p.solutions.length + si + 1}
                    </div>
                    <p style={{ fontSize: '.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{sol}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 개별 검사 결과 요약 */}
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 16 }}>
            {lang === 'ko' ? '📋 개별 검사 결과' : lang === 'ja' ? '📋 個別検査結果' : lang === 'zh' ? '📋 个别测试结果' : '📋 Individual Test Results'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {ALL_TEST_KEYS.map(key => {
              const r = latestTests[key];
              const testColors: Record<string, string> = { phq9: '#4F8EF7', gad7: '#6c63ff', stress: '#20c997', ecr: '#f472b6', rses: '#fbbf24', relationship: '#f97316', ders: '#a78bfa', ego: '#34d399' };
              const color = testColors[key] || '#6c757d';
              return (
                <div key={key} style={{ background: 'var(--glass-bg)', borderRadius: 14, padding: '16px', border: `1px solid ${r ? color + '40' : 'var(--glass-border)'}`, backdropFilter: 'blur(8px)', opacity: r ? 1 : 0.6 }}>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>{(t.test_names as any)[key]}</div>
                  {r ? (
                    <>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{r.score}<span style={{ fontSize: '.75rem', marginLeft: 2 }}>{lang === 'ko' ? '점' : lang === 'ja' ? '点' : lang === 'zh' ? '分' : 'pts'}</span></div>
                      <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)', marginTop: 4, fontWeight: 600 }}>{r.level}</div>
                    </>
                  ) : (
                    <div style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginTop: 4 }}>{t.not_done}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/dashboard/test')} style={{ background: 'var(--glass-bg)', color: 'var(--text-secondary)', padding: '12px 24px', borderRadius: 10, border: '1px solid var(--glass-border)', cursor: 'pointer', fontWeight: 600, fontSize: '.9rem' }}>
            {lang === 'ko' ? '← 검사 목록으로' : lang === 'ja' ? '← 検査一覧へ' : lang === 'zh' ? '← 返回测试列表' : '← Back to Tests'}
          </button>
          <button onClick={() => router.push('/dashboard/counsel')} style={{ background: 'linear-gradient(135deg, #4F8EF7, #6c63ff)', color: 'white', padding: '12px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '.9rem', boxShadow: '0 4px 20px rgba(79,142,247,0.4)' }}>
            {t.counseling_btn}
          </button>
        </div>
      </div>
    </div>
  );
}
