export const INTEGRATED_I18N: Record<string, any> = {
  ko: {
    title: '통합 심리 프로파일', subtitle: '완료한 검사들을 분석하여 나만의 심리 패턴을 도출합니다.',
    loading: '분석 중...', no_data_title: '아직 완료한 검사가 없습니다', no_data_sub: '심리 자가진단 검사를 먼저 완료해주세요.',
    go_test: '검사 하러 가기 →', radar_title: '심리 영역별 건강 지수', radar_desc: '0~100점 (높을수록 건강)',
    domains: { emotional_health:'정서 건강', stress_resilience:'스트레스 회복력', self_esteem:'자존감', attachment_security:'애착 안정성', relationship_health:'관계 건강', emotion_regulation:'정서 조절' },
    completed_tests: '완료한 검사', weak_areas: '⚠️ 취약 영역', strong_areas: '✨ 강점 영역',
    weak_desc: '아래 영역에서 어려움을 겪고 있습니다.', strong_desc: '아래 영역에서 강점을 보입니다.',
    integrated_analysis: '🔍 통합 심리 분석', solutions_title: '💊 맞춤 솔루션', pattern_label: '발견된 패턴',
    test_names: { phq9:'PHQ-9 우울', gad7:'GAD-7 불안', stress:'학업 스트레스', ecr:'ECR 성인 애착', rses:'로젠버그 자존감', relationship:'연애 패턴', ders:'DERS 정서조절', ego:'자아 경계' },
    score_label: '점수', level_label: '단계', retake: '재검사', not_done: '미완료', counseling_btn: '💬 전문 상담 받기',
    domains_todo: '더 정확한 분석을 위해 나머지 검사도 완료해보세요.',
    score_history_title: '📈 검사 점수 변화 이력', score_history_sub: '동일 검사를 여러 번 응시했을 때 점수 변화입니다.',
    no_history: '아직 반복 응시 이력이 없습니다.',
    risk_banner_title: '⚠️ 전문 상담을 권장합니다',
    risk_phq9: 'PHQ-9 점수 10점 이상 — 중등도 우울 위험이 감지되었습니다.',
    risk_gad7: 'GAD-7 점수 10점 이상 — 중등도 불안 위험이 감지되었습니다.',
    risk_stress: '학업 스트레스 점수가 높습니다.',
    risk_cta: '지금 상담 예약하기 →',
    diary_insight_title: '📔 일기-검사 교차 분석',
    sol_short: '이번 주', sol_mid: '이번 달', sol_long: '장기',
    days_ago: '{n}일 전', today: '오늘', retake_suggest: '90일 경과. 재검사를 권장합니다.',
  },
  en: {
    title: 'Integrated Psychological Profile', subtitle: 'Analyze your completed assessments to reveal your unique psychological patterns.',
    loading: 'Analyzing...', no_data_title: 'No assessments completed yet', no_data_sub: 'Please complete at least one assessment first.',
    go_test: 'Go to Assessments →', radar_title: 'Psychological Domain Health Index', radar_desc: 'Score 0-100 (higher = healthier)',
    domains: { emotional_health:'Emotional Health', stress_resilience:'Stress Resilience', self_esteem:'Self-Esteem', attachment_security:'Attachment Security', relationship_health:'Relationship Health', emotion_regulation:'Emotion Regulation' },
    completed_tests: 'Completed Tests', weak_areas: '⚠️ Weak Areas', strong_areas: '✨ Strong Areas',
    weak_desc: 'You may be experiencing difficulties in these domains.', strong_desc: 'You show high strength in these domains.',
    integrated_analysis: '🔍 Integrated Analysis', solutions_title: '💊 Personalized Solutions', pattern_label: 'Pattern Detected',
    test_names: { phq9:'PHQ-9 Depression', gad7:'GAD-7 Anxiety', stress:'Academic Stress', ecr:'ECR Attachment', rses:'Self-Esteem (RSES)', relationship:'Relationship', ders:'DERS Emotion Reg.', ego:'Ego Strength' },
    score_label: 'Score', level_label: 'Level', retake: 'Retake', not_done: 'Not done', counseling_btn: '💬 Get Counseling',
    domains_todo: 'Complete more assessments for a fuller picture.',
    score_history_title: '📈 Test Score History', score_history_sub: 'Track how your scores change over repeated assessments.',
    no_history: 'No repeated assessment history yet.',
    risk_banner_title: '⚠️ Professional Counseling Recommended',
    risk_phq9: 'PHQ-9 score ≥10: moderate depression risk detected.',
    risk_gad7: 'GAD-7 score ≥10: moderate anxiety risk detected.',
    risk_stress: 'High academic stress score detected.',
    risk_cta: 'Book Counseling Now →',
    diary_insight_title: '📔 Diary × Test Cross Analysis',
    sol_short: 'This Week', sol_mid: 'This Month', sol_long: 'Long-term',
    days_ago: '{n} days ago', today: 'Today', retake_suggest: 'Over 90 days. Retake recommended.',
  },
  ja: {
    title: '統合心理プロファイル', subtitle: '完了した検査を分析してパターンを導き出します。',
    loading: '分析中...', no_data_title: 'まだ検査がありません', no_data_sub: '心理自己診断検査を完了してください。',
    go_test: '検査へ →', radar_title: '心理領域健康指数', radar_desc: '0~100点（高いほど健康）',
    domains: { emotional_health:'感情的健康', stress_resilience:'ストレス回復力', self_esteem:'自尊感情', attachment_security:'愛着安定性', relationship_health:'関係健康', emotion_regulation:'感情調節' },
    completed_tests: '完了検査', weak_areas: '⚠️ 弱い領域', strong_areas: '✨ 強い領域',
    weak_desc: '以下の領域で困難があります。', strong_desc: '以下の領域で強みがあります。',
    integrated_analysis: '🔍 統合分析', solutions_title: '💊 カスタムソリューション', pattern_label: '検出パターン',
    test_names: { phq9:'PHQ-9 うつ', gad7:'GAD-7 不安', stress:'学業ストレス', ecr:'ECR 愛着', rses:'自尊感情尺度', relationship:'恋愛パターン', ders:'DERS 感情調節', ego:'自我境界' },
    score_label: 'スコア', level_label: 'レベル', retake: '再検査', not_done: '未完了', counseling_btn: '💬 カウンセリング',
    domains_todo: 'より正確な分析のため残りの検査を完了してください。',
    score_history_title: '📈 検査スコア変化履歴', score_history_sub: '繰り返し受けた検査のスコア変化を確認します。',
    no_history: 'まだ繰り返し履歴がありません。',
    risk_banner_title: '⚠️ 専門カウンセリングをお勧めします',
    risk_phq9: 'PHQ-9が10以上 — 中等度うつリスク。', risk_gad7: 'GAD-7が10以上 — 中等度不安リスク。', risk_stress: '学業ストレスが高い。',
    risk_cta: 'カウンセリング予約 →',
    diary_insight_title: '📔 日記×検査クロス分析',
    sol_short: '今週', sol_mid: '今月', sol_long: '長期',
    days_ago: '{n}日前', today: '今日', retake_suggest: '90日経過。再検査をお勧めします。',
  },
  zh: {
    title: '综合心理档案', subtitle: '分析您完成的测试，揭示心理模式。',
    loading: '分析中...', no_data_title: '尚未完成任何测试', no_data_sub: '请先完成至少一项测试。',
    go_test: '去做测试 →', radar_title: '心理领域健康指数', radar_desc: '0-100分（越高越健康）',
    domains: { emotional_health:'情绪健康', stress_resilience:'压力恢复力', self_esteem:'自尊', attachment_security:'依恋安全感', relationship_health:'关系健康', emotion_regulation:'情绪调节' },
    completed_tests: '已完成测试', weak_areas: '⚠️ 薄弱领域', strong_areas: '✨ 优势领域',
    weak_desc: '您可能在以下领域遇到困难。', strong_desc: '您在以下领域表现优秀。',
    integrated_analysis: '🔍 综合分析', solutions_title: '💊 个性化方案', pattern_label: '检测到的模式',
    test_names: { phq9:'PHQ-9 抑郁', gad7:'GAD-7 焦虑', stress:'学业压力', ecr:'ECR 依恋', rses:'罗森伯格自尊', relationship:'恋爱模式', ders:'DERS 情绪调节', ego:'自我边界' },
    score_label: '分数', level_label: '等级', retake: '重测', not_done: '未完成', counseling_btn: '💬 接受咨询',
    domains_todo: '完成更多测试以获得更全面的分析。',
    score_history_title: '📈 测试分数变化历史', score_history_sub: '追踪多次测试的分数变化。',
    no_history: '尚无重复测试记录。',
    risk_banner_title: '⚠️ 建议寻求专业咨询',
    risk_phq9: 'PHQ-9≥10 — 检测到中度抑郁风险。', risk_gad7: 'GAD-7≥10 — 检测到中度焦虑风险。', risk_stress: '学业压力较高。',
    risk_cta: '立即预约咨询 →',
    diary_insight_title: '📔 日记×测试交叉分析',
    sol_short: '本周', sol_mid: '本月', sol_long: '长期',
    days_ago: '{n}天前', today: '今天', retake_suggest: '已超90天，建议重测。',
  },
};

export function generatePatterns(radar: Record<string,number|null>, lang: string) {
  const eh=radar.emotional_health,sr=radar.stress_resilience,se=radar.self_esteem;
  const as_=radar.attachment_security,rh=radar.relationship_health,er=radar.emotion_regulation;
  const low=(v:number|null)=>v!==null&&v<40;
  const mid=(v:number|null)=>v!==null&&v>=40&&v<65;
  const high=(v:number|null)=>v!==null&&v>=65;
  const db: Record<string,{icon:string;title:string;desc:string;solutions:string[]}[]> = {
    ko:[
      ...(low(eh)&&low(se)&&low(as_)?[{icon:'🌑',title:'자기비하-의존형',desc:'우울 및 낮은 자존감과 함께 애착 불안이 높아 관계에서 과도하게 의존하거나 버림받을 것을 두려워합니다.',solutions:['자기연민(Self-Compassion) 훈련','CBT 기반 자동적 사고 기록지 작성','주 1회 이상 긍정적 자기 대화 일지','심리 상담을 통한 내면 아이 치유 작업']}]:[]),
      ...(low(as_)&&low(rh)&&high(er)?[{icon:'🧊',title:'고립-방어형',desc:'친밀감을 회피하고 감정 표현을 억제합니다.',solutions:['신뢰하는 1명에게 작은 감정부터 나누기','감정 일기 쓰기','개인 상담을 통한 애착 패턴 탐색','비폭력 대화(NVC) 기초 배우기']}]:[]),
      ...(low(eh)&&low(er)?[{icon:'🌊',title:'감정 과부하형',desc:'우울/불안 증상과 감정 조절의 어려움이 겹쳐 있습니다.',solutions:['DBT TIPP 기술(온도·격렬한 운동·호흡·이완)','감정 온도계 하루 3번 체크','마음챙김 명상 앱 활용(5분/일)','정신건강 전문가 상담 권장']}]:[]),
      ...(low(sr)&&low(se)?[{icon:'🔥',title:'번아웃 위험형',desc:'높은 스트레스와 낮은 자존감이 결합되어 번아웃 위험이 높습니다.',solutions:['즉각적인 휴식 계획 수립','성취 기준 낮추기 연습','신체 활동 루틴(산책 20분/일)','번아웃 회복 전문 상담 권장']}]:[]),
      ...(low(rh)&&mid(as_)?[{icon:'💔',title:'반복 관계 상처형',desc:'관계에서 반복적으로 상처받는 패턴이 있습니다.',solutions:['기대를 명시적으로 표현하는 연습','커플 상담 또는 관계 심리 독서','비폭력 대화(NVC) 4단계 훈련','자기 욕구 명확히 파악하기']}]:[]),
      ...(high(eh)&&high(se)&&high(as_)?[{icon:'🌟',title:'심리적 강인형',desc:'전반적으로 건강한 심리 상태를 유지하고 있습니다.',solutions:['현재 상태 유지를 위한 마음챙김 실천','관계에서의 공감 능력 키우기','봉사 활동으로 의미 확장','심리적 강점을 주변에 나눠보세요']}]:[]),
    ],
    en:[
      ...(low(eh)&&low(se)&&low(as_)?[{icon:'🌑',title:'Self-Critical & Dependent',desc:'Depression, low self-esteem, and attachment anxiety combine into over-reliance on others.',solutions:['Self-Compassion training (MSC)','CBT thought records','Daily positive self-talk journal','Inner child healing with a therapist']}]:[]),
      ...(low(as_)&&low(rh)&&high(er)?[{icon:'🧊',title:'Isolated & Guarded',desc:'Avoids intimacy and suppresses emotions. Independent but struggles with deep connection.',solutions:['Share small feelings with one trusted person','Emotion journaling','Explore attachment patterns in therapy','Learn Nonviolent Communication (NVC)']}]:[]),
      ...(low(eh)&&low(er)?[{icon:'🌊',title:'Emotional Overload',desc:'Depressive/anxious symptoms combined with emotion regulation difficulties.',solutions:['DBT TIPP skills','Emotion thermometer 3x/day','Mindfulness app (5 min/day)','Professional mental health consultation']}]:[]),
      ...(low(sr)&&low(se)?[{icon:'🔥',title:'Burnout Risk',desc:'High stress and low self-esteem — risk of burnout.',solutions:['Immediate rest plan','Practice good enough attitude','Physical activity routine (20 min walk/day)','Burnout recovery counseling']}]:[]),
      ...(low(rh)&&mid(as_)?[{icon:'💔',title:'Repeated Relationship Hurt',desc:'Pattern of recurring hurt in relationships.',solutions:['Express expectations explicitly','Couples counseling or reading','NVC 4-step practice','Clarify your own needs']}]:[]),
      ...(high(eh)&&high(se)&&high(as_)?[{icon:'🌟',title:'Psychologically Resilient',desc:'Overall healthy psychological functioning.',solutions:['Continue mindfulness practice','Deepen empathy in relationships','Volunteer or mentor others','Share your strengths']}]:[]),
    ],
    ja:[
      ...(low(eh)&&low(se)&&low(as_)?[{icon:'🌑',title:'自己卑下・依存型',desc:'うつ、低い自尊感情、高い愛着不安が組み合わさります。',solutions:['セルフコンパッション訓練','CBT自動思考記録','週1回ポジティブ自己対話日記','カウンセリングでインナーチャイルド癒し']}]:[]),
      ...(low(as_)&&low(rh)&&high(er)?[{icon:'🧊',title:'孤立・防衛型',desc:'親密さを回避し感情表現を抑えます。',solutions:['信頼できる人に小さな感情を共有','感情日記','カウンセリングで愛着パターン探索','NVC基礎を学ぶ']}]:[]),
      ...(low(eh)&&low(er)?[{icon:'🌊',title:'感情過負荷型',desc:'うつ/不安と感情調節困難が重なります。',solutions:['DBT TIPPスキル','感情温度計1日3回','マインドフルネス5分/日','精神科相談を強く推奨']}]:[]),
      ...(low(sr)&&low(se)?[{icon:'🔥',title:'バーンアウトリスク型',desc:'高ストレスと低自尊感情が重なります。',solutions:['即時休息計画','十分うまくできたの練習','身体活動ルーティン','専門相談推奨']}]:[]),
      ...(low(rh)&&mid(as_)?[{icon:'💔',title:'繰り返す関係傷つき型',desc:'関係で繰り返し傷つくパターンがあります。',solutions:['期待を明示的に表現','カップルカウンセリング','NVC4段階練習','自分のニーズを明確化']}]:[]),
      ...(high(eh)&&high(se)&&high(as_)?[{icon:'🌟',title:'心理的強靭型',desc:'全体的に健康な心理状態を維持しています。',solutions:['マインドフルネス継続','関係での共感能力を深める','ボランティア活動','強みを周囲と分かち合う']}]:[]),
    ],
    zh:[
      ...(low(eh)&&low(se)&&low(as_)?[{icon:'🌑',title:'自我贬低-依赖型',desc:'抑郁、低自尊和依恋焦虑相结合。',solutions:['自我关怀训练','CBT自动思维记录','每周积极自我对话日记','内在小孩治愈咨询']}]:[]),
      ...(low(as_)&&low(rh)&&high(er)?[{icon:'🧊',title:'孤立-防御型',desc:'回避亲密感并压制情感表达。',solutions:['与一人分享小感受','情绪日记','探索依恋模式','学习非暴力沟通']}]:[]),
      ...(low(eh)&&low(er)?[{icon:'🌊',title:'情绪过载型',desc:'抑郁/焦虑与情绪调节困难相叠加。',solutions:['DBT TIPP技能','情绪温度计每天3次','正念冥想5分钟/天','强烈建议专业咨询']}]:[]),
      ...(low(sr)&&low(se)?[{icon:'🔥',title:'倦怠风险型',desc:'高压力与低自尊相结合。',solutions:['立即制定休息计划','练习足够好的心态','每天步行20分钟','专业倦怠恢复咨询']}]:[]),
      ...(low(rh)&&mid(as_)?[{icon:'💔',title:'重复关系受伤型',desc:'关系中反复受伤的模式。',solutions:['练习明确表达期望','伴侣咨询或阅读','NVC四步练习','明确自己的需求']}]:[]),
      ...(high(eh)&&high(se)&&high(as_)?[{icon:'🌟',title:'心理强韧型',desc:'整体维持健康心理状态。',solutions:['继续正念练习','深化关系共情','志愿活动拓展意义','与他人分享心理优势']}]:[]),
    ],
  };
  return (db[lang]||db.ko).filter(p=>p.title);
}

export function daysAgo(dateStr: string, t: any): string {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return t.today;
  return t.days_ago.replace('{n}', String(diff));
}

export const TEST_HISTORY_COLORS: Record<string,string> = {
  phq9:'#f87171',gad7:'#a78bfa',stress:'#fbbf24',ecr:'#f472b6',
  rses:'#34d399',relationship:'#f97316',ders:'#60a5fa',ego:'#20c997',
};
export const ALL_TEST_KEYS = ['phq9','gad7','stress','ecr','rses','relationship','ders','ego'];
