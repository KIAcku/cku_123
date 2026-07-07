'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/apiClient';
import { useLangStore } from '@/store/langStore';

// ─── 다국어 번역 사전 ──────────────────────────────────────────────
const i18n: Record<string, any> = {
  ko: {
    hero_tag: '표준 심리 자가진단 도구',
    hero_title: '🧠 심리 자가진단 테스트',
    hero_sub: '임상에서 사용하는 표준 검사 도구를 기반으로 나의 심리 상태를 확인해보세요. 결과는 참고용이며, 전문 진단을 대체하지 않습니다.',
    select_test: '검사 선택',
    select_test_title: '어떤 검사를 받으시겠어요?',
    select_test_sub: '각 검사는 5~10분 소요됩니다',
    questions_count: '{count}개 문항',
    start_btn: '검사 시작 →',
    warning_text: '⚠️ 본 검사는 전문적인 심리 진단을 대체하지 않습니다. 심각한 증상이 있다면 전문가를 찾아주세요.',
    progress_text: '{progress} / {total} 완료',
    back_btn: '← 돌아가기',
    confirm_result: '결과 확인하기 →',
    remain_questions: '{count}개 문항을 더 답해주세요',
    test_result_title: '검사 결과',
    recommended_action: '💡 권장 행동',
    score_range: '점수 범위',
    current_label: '현재',
    other_test_btn: '다른 검사 하기',
    counsel_btn: '💬 상담 받기',
    integrated_btn: '📊 통합 결과 보기',
    integrated_hint: '모든 검사를 완료하면 통합 심리 프로파일을 확인할 수 있어요.',
    categories: {
      clinical: '임상 심리',
      attachment: '애착 & 관계',
      selfgrowth: '자기 성장',
    },
    options_4: ['전혀 아니다 (0)', '며칠 (1)', '일주일의 절반 이상 (2)', '거의 매일 (3)'],
    options_6: ['전혀 해당 없음 (1)', '거의 아니다 (2)', '가끔 (3)', '자주 (4)', '거의 항상 (5)', '항상 (6)'],
    options_likert5: ['매우 아니다 (1)', '아니다 (2)', '보통 (3)', '그렇다 (4)', '매우 그렇다 (5)'],
    options_agree4: ['매우 동의 (4)', '동의 (3)', '비동의 (2)', '매우 비동의 (1)'],
    tests: {
      phq9: {
        title: 'PHQ-9 우울증 자가진단',
        desc: '지난 2주 동안 다음과 같은 문제들이 얼마나 자주 있었나요?',
        options_key: 'options_4',
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
          { level: 'minimal',         label: '정상 범위',   desc: '현재 우울 증상이 거의 없습니다.', action: '지속적인 자기 돌봄으로 건강한 마음을 유지하세요.' },
          { level: 'mild',            label: '경미한 우울', desc: '가벼운 우울 증상이 있습니다.', action: '규칙적인 운동, 충분한 수면, 사회적 교류를 늘려보세요.' },
          { level: 'moderate',        label: '중등도 우울', desc: '중간 정도의 우울 증상이 있습니다.', action: '전문가 상담을 권장합니다.' },
          { level: 'moderate_severe', label: '중증 우울',   desc: '상당한 수준의 우울 증상이 있습니다.', action: '즉시 전문 상담사 또는 정신건강의학과 방문을 권장합니다.' },
          { level: 'severe',          label: '심한 우울',   desc: '심각한 수준의 우울 증상이 있습니다.', action: '지금 바로 전문가의 도움을 받으세요. 위기상담 1393으로 전화하세요.' },
        ],
      },
      gad7: {
        title: 'GAD-7 불안 자가진단',
        desc: '지난 2주 동안 다음과 같은 문제들이 얼마나 자주 있었나요?',
        options_key: 'options_4',
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
          { level: 'minimal',  label: '정상 범위',   desc: '불안 증상이 거의 없습니다.', action: '현재 상태를 잘 유지하고 있어요!' },
          { level: 'mild',     label: '경미한 불안', desc: '가벼운 불안 증상이 있습니다.', action: '깊은 호흡 연습과 마음챙김 명상이 도움이 될 수 있어요.' },
          { level: 'moderate', label: '중등도 불안', desc: '중간 정도의 불안 증상이 있습니다.', action: '전문 상담을 받아보세요. 인지행동치료(CBT)가 효과적입니다.' },
          { level: 'severe',   label: '심한 불안',   desc: '심각한 불안 증상이 있습니다.', action: '즉시 전문가의 도움을 받으세요. 정신건강 위기상담 1577-0199' },
        ],
      },
      stress: {
        title: '학업 스트레스 자가진단',
        desc: '현재 학교생활과 관련하여 다음 항목을 체크해주세요.',
        options_key: 'options_4',
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
          { level: 'minimal',  label: '낮은 스트레스',      desc: '스트레스를 잘 관리하고 있어요!', action: '지금처럼 건강한 생활 습관을 유지하세요.' },
          { level: 'mild',     label: '보통 스트레스',      desc: '적당한 수준의 스트레스가 있습니다.', action: '휴식과 취미 활동으로 스트레스를 해소해보세요.' },
          { level: 'moderate', label: '높은 스트레스',      desc: '스트레스가 상당히 높습니다.', action: '상담사 또는 믿을 수 있는 어른과 이야기해보세요.' },
          { level: 'severe',   label: '매우 높은 스트레스', desc: '번아웃 위험이 높습니다.', action: '전문 상담을 즉시 받으시길 권장합니다.' },
        ],
      },
      ecr: {
        title: 'ECR-12 성인 애착 유형',
        desc: '친밀한 관계(연인, 가까운 친구)에서 자신이 어떻게 느끼는지 응답해주세요.',
        options_key: 'options_6',
        note: '※ 1~6번: 불안 차원, 7~12번: 회피 차원',
        questions: [
          '파트너가 나를 사랑하지 않게 될까봐 걱정된다',
          '파트너와 가까워지는 것이 불편하다',
          '파트너가 나를 버릴까봐 두렵다',
          '파트너에게 너무 의존하는 것이 불편하다',
          '파트너가 진정으로 나를 원하지 않을까봐 불안하다',
          '파트너에게 내 감정을 드러내는 것이 불편하다',
          '파트너가 나를 떠날까봐 자주 걱정된다',
          '친밀한 관계를 피하려고 한다',
          '파트너가 내 곁에 없을 때 매우 불안하다',
          '파트너와 감정적으로 가까워지기 어렵다',
          '파트너가 나만큼 관계에 헌신하지 않을까봐 걱정된다',
          '내 감정과 느낌을 파트너와 나누는 것을 좋아하지 않는다',
        ],
        levels: [
          { level: 'secure',         label: '안정형', desc: '친밀한 관계에서 안정감을 느끼며 건강한 애착을 형성합니다.', action: '현재의 건강한 관계 패턴을 유지하세요. 상대방과의 소통을 더욱 풍부하게 해보세요.' },
          { level: 'anxious',        label: '불안형', desc: '관계에서 버림받을 것에 대한 두려움이 강하고 상대방의 사랑을 확인하려는 경향이 있습니다.', action: '자기 자신을 사랑하는 연습을 해보세요. 자존감 향상 훈련과 마음챙김 명상이 도움됩니다.' },
          { level: 'avoidant',       label: '회피형', desc: '친밀감을 불편하게 느끼고 감정 표현을 어려워하며 독립성을 강조합니다.', action: '작은 취약성 공유 연습을 해보세요. 신뢰할 수 있는 사람에게 감정을 조금씩 표현해보세요.' },
          { level: 'disorganized',   label: '혼란형', desc: '친밀감을 원하지만 두렵기도 한 혼란스러운 패턴을 보입니다.', action: '전문 상담가와 함께 애착 트라우마를 탐색해보세요. 안정된 관계 경험이 중요합니다.' },
        ],
      },
      rses: {
        title: '로젠버그 자존감 척도 (RSES)',
        desc: '각 항목이 현재 자신의 상태와 얼마나 일치하는지 응답해주세요.',
        options_key: 'options_agree4',
        questions: [
          '나는 내 자신이 적어도 다른 사람들만큼은 가치있는 사람이라고 느낀다',
          '나는 좋은 성품을 가졌다고 생각한다',
          '나는 대체로 실패한 사람이라는 느낌이 든다',
          '나는 대부분의 다른 사람들과 같이 일을 잘 할 수가 있다',
          '나는 자랑할 것이 별로 없다',
          '나는 내 자신에 대해 긍정적인 태도를 가지고 있다',
          '나는 내 자신에 대해 대체로 만족한다',
          '나는 내 자신을 좀 더 존경할 수 있으면 좋겠다',
          '나는 때때로 내 자신이 쓸모없는 사람이라는 느낌이 든다',
          '나는 때때로 내가 좋지 않은 사람이라고 생각한다',
        ],
        levels: [
          { level: 'high',   label: '높은 자존감', desc: '자신을 긍정적으로 바라보며 건강한 자아상을 가지고 있습니다.', action: '현재의 긍정적인 자아관을 유지하면서 타인에게도 따뜻함을 나눠보세요.' },
          { level: 'medium', label: '보통 자존감', desc: '상황에 따라 자존감의 기복이 있을 수 있습니다.', action: '자기 자신의 강점을 기록하는 감사 일기를 써보세요. 작은 성취를 인정해주세요.' },
          { level: 'low',    label: '낮은 자존감', desc: '자신에 대한 부정적 평가가 많고 자신감이 부족합니다.', action: '자기연민(Self-compassion) 훈련과 CBT 기반 자동적 사고 교정이 도움됩니다. 상담을 권장합니다.' },
        ],
      },
      relationship: {
        title: '연애 & 친밀감 패턴 검사',
        desc: '연인 관계 또는 친밀한 관계에서의 자신의 패턴을 응답해주세요.',
        options_key: 'options_likert5',
        questions: [
          '연인(또는 가까운 사람)과 갈등이 생기면 쉽게 감정이 격해진다',
          '연인에게 내 감정이나 필요를 솔직하게 말하기 어렵다',
          '연인이 나를 정말로 이해해 준다고 느낀다 (역채점)',
          '혼자 있을 때 외로움을 자주 느낀다',
          '연인과 함께 있어도 완전히 연결된 느낌이 들지 않는다',
          '연인이 내 기대를 충족시키지 못하면 크게 실망하거나 화가 난다',
          '관계에서 항상 내가 더 많이 노력하는 것 같다',
          '연인과의 관계가 전반적으로 만족스럽다 (역채점)',
          '친밀한 관계에서 자주 상처를 받는다',
          '이별이나 관계 종료가 매우 두렵다',
        ],
        levels: [
          { level: 'healthy',     label: '건강한 관계 패턴', desc: '서로 존중하고 소통하는 건강한 관계 패턴을 가지고 있습니다.', action: '현재의 건강한 패턴을 유지하고, 파트너와의 깊은 대화를 더욱 늘려보세요.' },
          { level: 'moderate',    label: '개선 여지 있음',    desc: '관계에서 일부 어려움이 있지만 개선 가능합니다.', action: '관계 심리 책을 읽거나 커플 상담을 고려해보세요. 비폭력대화(NVC) 연습이 도움됩니다.' },
          { level: 'challenging', label: '관계 패턴 점검 필요', desc: '반복되는 관계 패턴이 있어 전문적 도움이 필요합니다.', action: '개인 상담을 통해 관계 패턴의 근원을 탐색해보세요. 애착 트라우마 치료가 도움될 수 있습니다.' },
        ],
      },
      ders: {
        title: '정서조절 어려움 척도 (DERS-10)',
        desc: '평소 감정을 느끼고 다루는 방식에 대해 응답해주세요.',
        options_key: 'options_likert5',
        questions: [
          '나는 내가 어떤 감정을 느끼고 있는지 잘 모를 때가 많다',
          '감정이 격해지면 그것을 조절하기 어렵다',
          '기분이 나쁠 때 그 감정에서 빠져나오기 힘들다',
          '슬프거나 화가 날 때 나 자신이 창피하게 느껴진다',
          '기분이 나쁠 때 집중하기 어렵다',
          '감정이 격해지면 충동적으로 행동하게 된다',
          '화가 났을 때 상황을 통제하기 어렵다',
          '부정적인 감정에 대해 잘 대처하지 못한다고 느낀다',
          '내 감정이 너무 강해서 감당하기 힘들다',
          '감정이 생기면 그것이 내 행동을 지배하게 된다',
        ],
        levels: [
          { level: 'good',     label: '양호한 정서조절', desc: '감정을 효과적으로 인식하고 조절할 수 있습니다.', action: '마음챙김 연습을 통해 현재의 정서조절 능력을 더욱 강화해보세요.' },
          { level: 'moderate', label: '중간 수준의 어려움', desc: '일부 상황에서 감정 조절에 어려움을 느낍니다.', action: 'DBT(변증법적 행동치료) 기술 연습, 특히 고통 감내 기술이 도움됩니다.' },
          { level: 'high',     label: '높은 정서조절 어려움', desc: '감정 조절에 상당한 어려움이 있습니다.', action: '전문가의 도움을 받으세요. DBT나 정서 중심 치료(EFT)가 매우 효과적입니다.' },
        ],
      },
      ego: {
        title: '자아 경계 & 강도 척도',
        desc: '자신의 정체성과 자기표현에 관한 항목에 응답해주세요.',
        options_key: 'options_likert5',
        questions: [
          '나는 내가 무엇을 원하는지 명확히 알고 있다',
          '타인의 의견에 쉽게 흔들리지 않는 나만의 가치관이 있다',
          '다른 사람의 부탁을 거절하기가 매우 어렵다',
          '내 감정과 타인의 감정을 구분하기 어려울 때가 있다',
          '내가 어떤 사람인지에 대한 뚜렷한 정체성이 있다',
          '주변 사람들의 기대에 맞춰 나를 바꾸는 경향이 있다',
          '나의 경계(경계선)를 타인에게 분명히 표현할 수 있다',
          '갈등 상황에서 내 입장을 명확하게 표현할 수 있다',
        ],
        levels: [
          { level: 'strong',   label: '강한 자아 경계', desc: '뚜렷한 자기 정체성과 건강한 경계선을 가지고 있습니다.', action: '현재의 자아 강도를 유지하면서 타인과의 관계에서도 유연함을 발휘해보세요.' },
          { level: 'moderate', label: '보통 수준',      desc: '상황에 따라 자기 경계가 흔들릴 수 있습니다.', action: '"아니오"라고 말하는 연습을 해보세요. 나의 가치관 목록을 작성해보세요.' },
          { level: 'weak',     label: '약한 자아 경계', desc: '자신의 정체성이 불분명하고 타인에게 휩쓸리기 쉽습니다.', action: '정체성 탐구 저널링과 경계 설정 훈련을 해보세요. 상담을 통한 자아 발견을 권장합니다.' },
        ],
      },
    },
  },
  en: {
    hero_tag: 'Standard Psychological Self-Assessment',
    hero_title: '🧠 Psychological Self-Assessment',
    hero_sub: 'Assess your mental health using clinically validated tools. Results are for reference only and do not replace professional diagnosis.',
    select_test: 'Select Test',
    select_test_title: 'Which assessment would you like to take?',
    select_test_sub: 'Each test takes 5-10 minutes',
    questions_count: '{count} questions',
    start_btn: 'Start →',
    warning_text: '⚠️ This assessment does not replace professional psychological diagnosis.',
    progress_text: '{progress} / {total} done',
    back_btn: '← Back',
    confirm_result: 'View Results →',
    remain_questions: '{count} more to go',
    test_result_title: 'Result',
    recommended_action: '💡 Recommendations',
    score_range: 'Score Range',
    current_label: 'You',
    other_test_btn: 'Take Another',
    counsel_btn: '💬 Get Counseling',
    integrated_btn: '📊 View Integrated Profile',
    integrated_hint: 'Complete all assessments to unlock your integrated psychological profile.',
    categories: {
      clinical: 'Clinical',
      attachment: 'Attachment & Relationships',
      selfgrowth: 'Self-Growth',
    },
    options_4: ['Not at all (0)', 'Several days (1)', 'More than half the days (2)', 'Nearly every day (3)'],
    options_6: ['Strongly disagree (1)', 'Disagree (2)', 'Somewhat disagree (3)', 'Somewhat agree (4)', 'Agree (5)', 'Strongly agree (6)'],
    options_likert5: ['Strongly disagree (1)', 'Disagree (2)', 'Neutral (3)', 'Agree (4)', 'Strongly agree (5)'],
    options_agree4: ['Strongly agree (4)', 'Agree (3)', 'Disagree (2)', 'Strongly disagree (1)'],
    tests: {
      phq9: {
        title: 'PHQ-9 Depression Screen',
        desc: 'Over the past 2 weeks, how often have you been bothered by the following?',
        options_key: 'options_4',
        questions: [
          'Little interest or pleasure in doing things',
          'Feeling down, depressed, or hopeless',
          'Trouble falling or staying asleep, or sleeping too much',
          'Feeling tired or having little energy',
          'Poor appetite or overeating',
          'Feeling bad about yourself, or that you are a failure',
          'Trouble concentrating on things',
          'Moving or speaking so slowly that others could have noticed, or being fidgety',
          'Thoughts that you would be better off dead, or of hurting yourself',
        ],
        levels: [
          { level: 'minimal',         label: 'Minimal',          desc: 'Minimal or no depressive symptoms.', action: 'Maintain your self-care routine.' },
          { level: 'mild',            label: 'Mild',             desc: 'Mild depressive symptoms.', action: 'Regular exercise, sleep hygiene, and social connection.' },
          { level: 'moderate',        label: 'Moderate',         desc: 'Moderate depressive symptoms.', action: 'Consider professional counseling.' },
          { level: 'moderate_severe', label: 'Mod. Severe',      desc: 'Moderately severe depressive symptoms.', action: 'Please see a mental health professional soon.' },
          { level: 'severe',          label: 'Severe',           desc: 'Severe depressive symptoms.', action: 'Please seek help immediately.' },
        ],
      },
      gad7: {
        title: 'GAD-7 Anxiety Screen',
        desc: 'Over the past 2 weeks, how often have you been bothered by the following?',
        options_key: 'options_4',
        questions: [
          'Feeling nervous, anxious, or on edge',
          'Not being able to stop or control worrying',
          'Worrying too much about different things',
          'Trouble relaxing',
          'Being so restless that it is hard to sit still',
          'Becoming easily annoyed or irritable',
          'Feeling afraid as if something awful might happen',
        ],
        levels: [
          { level: 'minimal',  label: 'Minimal',  desc: 'Minimal anxiety symptoms.',  action: 'Keep up your current routine!' },
          { level: 'mild',     label: 'Mild',     desc: 'Mild anxiety symptoms.',     action: 'Try deep breathing and mindfulness.' },
          { level: 'moderate', label: 'Moderate', desc: 'Moderate anxiety symptoms.', action: 'Consider CBT-based counseling.' },
          { level: 'severe',   label: 'Severe',   desc: 'Severe anxiety symptoms.',   action: 'Please seek professional help immediately.' },
        ],
      },
      stress: {
        title: 'Academic Stress Assessment',
        desc: 'Rate the following regarding your current school life.',
        options_key: 'options_4',
        questions: [
          'Hard to concentrate on studying',
          'Anxious about grades or GPA',
          'Overwhelmed by assignments and exams',
          'Frequently not wanting to go to school',
          'Stressed about friendships or peer relationships',
          'Feeling lost about the future',
          'Not getting enough sleep',
          'Skipping meals or eating irregularly',
          'Wanting to be alone and not see anyone',
          'Lacking motivation for everything',
        ],
        levels: [
          { level: 'minimal',  label: 'Low Stress',       desc: 'Managing stress well!',            action: 'Maintain your healthy habits.' },
          { level: 'mild',     label: 'Moderate Stress',  desc: 'Normal level of stress.',          action: 'Use relaxation and hobbies to decompress.' },
          { level: 'moderate', label: 'High Stress',      desc: 'Stress is significantly high.',    action: 'Talk to a counselor or trusted adult.' },
          { level: 'severe',   label: 'Very High Stress', desc: 'High risk of burnout.',            action: 'Seek professional counseling immediately.' },
        ],
      },
      ecr: {
        title: 'ECR-12 Adult Attachment Style',
        desc: 'Think about how you feel in close relationships (romantic partners or close friends) and respond.',
        options_key: 'options_6',
        note: '※ Q1–6: Anxiety dimension, Q7–12: Avoidance dimension',
        questions: [
          'I worry that my partner will stop caring about me',
          'I find it difficult to get close to my partner',
          'I fear that my partner will abandon me',
          'I feel uncomfortable depending on my partner',
          'I worry that my partner doesn\'t really want to be with me',
          'I am uncomfortable showing my feelings to my partner',
          'I frequently worry my partner will leave me',
          'I try to avoid getting too close to my partner',
          'I feel very anxious when my partner is not around',
          'I find it hard to connect emotionally with my partner',
          'I worry my partner isn\'t as committed as I am',
          'I don\'t like sharing my feelings with my partner',
        ],
        levels: [
          { level: 'secure',       label: 'Secure',       desc: 'You form healthy attachments with comfort in closeness.', action: 'Maintain your secure base and nurture deeper communication.' },
          { level: 'anxious',      label: 'Anxious',      desc: 'You tend to fear abandonment and seek reassurance.', action: 'Practice self-compassion and build self-esteem independently.' },
          { level: 'avoidant',     label: 'Avoidant',     desc: 'You feel uncomfortable with closeness and emotional expression.', action: 'Practice gradual vulnerability with trusted people.' },
          { level: 'disorganized', label: 'Disorganized', desc: 'You experience conflicting desires for closeness and distance.', action: 'Explore attachment trauma with a professional therapist.' },
        ],
      },
      rses: {
        title: 'Rosenberg Self-Esteem Scale',
        desc: 'Indicate how much you agree with each statement about yourself.',
        options_key: 'options_agree4',
        questions: [
          'I feel that I am a person of worth, at least on an equal basis with others',
          'I feel that I have a number of good qualities',
          'All in all, I am inclined to feel that I am a failure',
          'I am able to do things as well as most other people',
          'I feel I do not have much to be proud of',
          'I take a positive attitude toward myself',
          'On the whole, I am satisfied with myself',
          'I wish I could have more respect for myself',
          'I certainly feel useless at times',
          'At times I think I am no good at all',
        ],
        levels: [
          { level: 'high',   label: 'High Self-Esteem',   desc: 'You have a positive self-image.', action: 'Maintain your positive self-view and share your warmth with others.' },
          { level: 'medium', label: 'Medium Self-Esteem', desc: 'Self-esteem may fluctuate.', action: 'Keep a gratitude and strengths journal. Celebrate small wins.' },
          { level: 'low',    label: 'Low Self-Esteem',    desc: 'Frequent self-criticism and low confidence.', action: 'Self-compassion training and CBT for negative self-talk are recommended.' },
        ],
      },
      relationship: {
        title: 'Relationship & Intimacy Patterns',
        desc: 'Reflect on your patterns in romantic or close relationships.',
        options_key: 'options_likert5',
        questions: [
          'When conflict arises, I easily become emotionally overwhelmed',
          'It is hard to honestly express my needs to my partner',
          'My partner truly understands me (reverse scored)',
          'I frequently feel lonely even when not alone',
          'Even with my partner, I don\'t feel fully connected',
          'When my partner doesn\'t meet my expectations, I feel greatly disappointed',
          'In relationships, I feel like I always put in more effort',
          'Overall, I am satisfied with my relationship (reverse scored)',
          'I often feel hurt in close relationships',
          'I am very afraid of breakups or relationship endings',
        ],
        levels: [
          { level: 'healthy',     label: 'Healthy Patterns',   desc: 'You have mutually respectful, communicative relationships.', action: 'Keep nurturing your healthy patterns and deepen your conversations.' },
          { level: 'moderate',    label: 'Room for Growth',    desc: 'Some difficulties, but improvement is possible.', action: 'Consider couples counseling or Nonviolent Communication (NVC) practice.' },
          { level: 'challenging', label: 'Patterns to Address', desc: 'Recurring relationship patterns warrant professional support.', action: 'Explore attachment roots through individual therapy.' },
        ],
      },
      ders: {
        title: 'Emotion Regulation Difficulties (DERS-10)',
        desc: 'Respond to how you typically experience and manage your emotions.',
        options_key: 'options_likert5',
        questions: [
          'I often don\'t know what emotion I\'m feeling',
          'When emotions intensify, it\'s hard to control them',
          'When I\'m upset, it\'s hard to get out of it',
          'When I\'m sad or angry, I feel ashamed of myself',
          'When I\'m in a bad mood, I have trouble focusing',
          'When emotions surge, I act impulsively',
          'When angry, I find it hard to stay in control',
          'I feel I can\'t cope well with negative emotions',
          'My emotions feel too overwhelming to handle',
          'When an emotion arises, it ends up controlling my behavior',
        ],
        levels: [
          { level: 'good',     label: 'Good Regulation',     desc: 'You can recognize and regulate emotions effectively.', action: 'Mindfulness practice will further strengthen your emotional skills.' },
          { level: 'moderate', label: 'Moderate Difficulty', desc: 'Some difficulty in certain emotional situations.', action: 'Practice DBT distress tolerance and emotion regulation skills.' },
          { level: 'high',     label: 'High Difficulty',     desc: 'Significant difficulty with emotional regulation.', action: 'DBT or Emotion-Focused Therapy (EFT) with a professional is strongly recommended.' },
        ],
      },
      ego: {
        title: 'Ego Strength & Boundary Scale',
        desc: 'Reflect on your sense of identity and self-expression.',
        options_key: 'options_likert5',
        questions: [
          'I have a clear sense of what I want in life',
          'I have my own values that are not easily swayed by others',
          'I find it very hard to say no to others\' requests',
          'I sometimes struggle to distinguish my emotions from others\'',
          'I have a distinct sense of who I am',
          'I tend to change myself to meet others\' expectations',
          'I can clearly communicate my boundaries to others',
          'I can assert my position clearly in conflict situations',
        ],
        levels: [
          { level: 'strong',   label: 'Strong Ego',    desc: 'You have a clear identity and healthy personal boundaries.', action: 'Maintain your strong sense of self while staying flexible in relationships.' },
          { level: 'moderate', label: 'Moderate',      desc: 'Boundaries may waver depending on the situation.', action: 'Practice saying "no." Write your personal values list.' },
          { level: 'weak',     label: 'Weak Ego',      desc: 'Identity is unclear and you may be easily influenced by others.', action: 'Identity journaling and boundary-setting training are recommended. Therapy can help.' },
        ],
      },
    },
  },
  ja: {
    hero_tag: '標準心理自己診断ツール',
    hero_title: '🧠 心理自己診断テスト',
    hero_sub: '臨床で使用される標準検査ツールを基に、あなたの心理状態を確認してください。結果は参考用であり、専門的な診断に代わるものではありません。',
    select_test: '検査選択',
    select_test_title: 'どの検査を受けますか？',
    select_test_sub: '各検査は5〜10分かかります',
    questions_count: '{count}問',
    start_btn: '開始 →',
    warning_text: '⚠️ 本検査は専門的な心理診断に代わるものではありません。',
    progress_text: '{progress} / {total} 完了',
    back_btn: '← 戻る',
    confirm_result: '結果を確認する →',
    remain_questions: 'あと{count}問',
    test_result_title: '検査結果',
    recommended_action: '💡 推奨される行動',
    score_range: 'スコア範囲',
    current_label: '現在',
    other_test_btn: '他の検査を受ける',
    counsel_btn: '💬 カウンセリングを受ける',
    integrated_btn: '📊 統合プロファイルを見る',
    integrated_hint: '全ての検査を完了すると、統合心理プロファイルが確認できます。',
    categories: { clinical: '臨床心理', attachment: '愛着・関係', selfgrowth: '自己成長' },
    options_4: ['全くない (0)', '数日 (1)', '半分以上 (2)', 'ほぼ毎日 (3)'],
    options_6: ['全く違う (1)', '違う (2)', 'やや違う (3)', 'やや当てはまる (4)', '当てはまる (5)', '非常に当てはまる (6)'],
    options_likert5: ['全く違う (1)', '違う (2)', '普通 (3)', '当てはまる (4)', '非常に当てはまる (5)'],
    options_agree4: ['強く同意 (4)', '同意 (3)', '不同意 (2)', '強く不同意 (1)'],
    tests: {
      phq9: { title: 'PHQ-9 うつ病自己診断', desc: '過去2週間、次の問題にどのくらい頻繁に悩まされましたか？', options_key: 'options_4', questions: ['物事に対する興味や楽しさがほとんどない', '気分が落ち込んだり、うつな気分になったり、絶望を感じたりする', '寝つきが悪い、途中で目が覚める、または逆に眠りすぎる', '疲れた感じがする、または気力がない', '食欲がない、または食べすぎる', '自分が失格者であると感じる、または家族を失望させたと思う', '新聞を読むことやテレビを見るなど、物事に集中することが難しい', '他人が気づくほど話し方や動作が遅い、または逆に落ち着きなく動き回る', '自分が死んだほうがましだ、または自分を傷つけようと思ったことがある'], levels: [{ level: 'minimal', label: '正常範囲', desc: '現在、うつの症状はほとんどありません。', action: '健康的な心を維持するために自己管理を続けてください。' }, { level: 'mild', label: '軽度のうつ', desc: '軽いうつの症状があります。', action: '定期的な運動や十分な睡眠を取り、人との関わりを増やしてみましょう。' }, { level: 'moderate', label: '中等度のうつ', desc: '中程度のうつの症状があります。', action: '専門家によるカウンセリングをお勧めします。' }, { level: 'moderate_severe', label: '中等度重症のうつ', desc: 'かなりのうつの症状があります。', action: '専門のカウンセラーまたは精神科クリニックへの受診を強くお勧めします。' }, { level: 'severe', label: '重度のうつ', desc: '深刻なうつの症状があります。', action: '今すぐ専門家の助けを借りてください。' }] },
      gad7: { title: 'GAD-7 不安自己診断', desc: '過去2週間、次の問題にどのくらい頻繁に悩まされましたか？', options_key: 'options_4', questions: ['神経質、不安、またはイライラを感じる', '心配するのをやめたり、コントロールしたりできない', 'さまざまなことについて心配しすぎる', 'リラックスするのが難しい', 'じっとしていられないほど落ち着かない', '怒りっぽくなったり、イライラしやすくなったりする', '恐ろしいことが起こるのではないかと恐れる'], levels: [{ level: 'minimal', label: '正常範囲', desc: '不安の症状はほとんどありません。', action: '現在の状態をよく維持できています！' }, { level: 'mild', label: '軽度の不安', desc: '軽い不安の症状があります。', action: '深呼吸のエクササイズやマインドフルネス瞑想が効果的です。' }, { level: 'moderate', label: '中等度の不安', desc: '中程度の不安の症状があります。', action: '専門的な相談を検討してください。' }, { level: 'severe', label: '重度の不安', desc: '深刻な不安の症状があります。', action: 'すぐに専門家の治療を受けてください。' }] },
      stress: { title: '学業ストレス自己診断', desc: '現在の学校生活について、次の項目をチェックしてください。', options_key: 'options_4', questions: ['勉強に集中するのが難しい', '成績や単位のことで不安がある', '課題や試験が多くて負担に感じる', '学校に行きたくない日が多い', '友達や対人関係がストレスだ', '将来（進路、就職）が不安で途方に暮れる', '十分な睡眠が取れていない', '食事を抜いたり不規則に食べたりする', '一人になりたい、誰にも会いたくない', 'すべてが面倒でやる気が出ない'], levels: [{ level: 'minimal', label: '低いストレス', desc: 'ストレスをうまく管理できています！', action: 'この調子で健康的な生活習慣を維持しましょう。' }, { level: 'mild', label: '通常のストレス', desc: '適度なレベルのストレスがあります。', action: '休息や趣味の活動でストレスを解消してみましょう。' }, { level: 'moderate', label: '高いストレス', desc: 'ストレスがかなり高い状態です。', action: 'スクールカウンセラーや信頼できる大人に話してみてください。' }, { level: 'severe', label: '非常に高いストレス', desc: 'バーンアウトの危険性が高いです。', action: '専門的なカウンセリングをすぐに受けることを強くお勧めします。' }] },
      ecr: { title: 'ECR-12 成人愛着スタイル', desc: '親密な関係（恋人、親友）でどのように感じるかを答えてください。', options_key: 'options_6', note: '※ Q1〜6: 不安次元、Q7〜12: 回避次元', questions: ['パートナーが私を好きではなくなるのが心配だ', 'パートナーと近くなることが不快だ', 'パートナーが私を捨てるのが怖い', 'パートナーに依存するのが不快だ', 'パートナーが本当に私を必要としていないのではと不安だ', 'パートナーに自分の感情を見せるのが不快だ', 'パートナーが去るのではと頻繁に心配する', '親密な関係を避けようとする', 'パートナーがいないと非常に不安だ', 'パートナーと感情的に近づくのが難しい', 'パートナーが自分ほど関係に献身していないのではと心配する', '自分の感情や気持ちをパートナーと共有するのが好きではない'], levels: [{ level: 'secure', label: '安定型', desc: '親密な関係で安心感を持ち、健全な愛着を形成します。', action: '健康的な関係パターンを維持し、コミュニケーションをより豊かにしてみましょう。' }, { level: 'anxious', label: '不安型', desc: '関係で見捨てられることへの恐怖が強く、愛情確認の傾向があります。', action: '自己愛の練習をしてみましょう。自尊感情向上トレーニングが役立ちます。' }, { level: 'avoidant', label: '回避型', desc: '親密さを不快に感じ、感情表現が苦手で独立性を強調します。', action: '小さな脆弱性の共有練習をしてみましょう。' }, { level: 'disorganized', label: '混乱型', desc: '親密さを求めつつも恐れる混乱したパターンを示します。', action: '専門カウンセラーと愛着トラウマを探索してみましょう。' }] },
      rses: { title: 'ローゼンバーグ自尊感情尺度', desc: '各項目が現在の自分の状態とどの程度一致しているか答えてください。', options_key: 'options_agree4', questions: ['私は少なくとも他の人と同じくらい価値ある人間だと感じる', '私はよい素質をたくさん持っている', '私は全体的に失敗した人間だと感じる', '私はほとんどの人と同じようにことをうまくやることができる', '私には誇りに思えるものがあまりない', '私は自分に対して好意的な態度をもっている', '私は自分自身に対して満足している', '私はもっと自分を尊重できたらと思う', '私はときどき自分がまったく無力だと感じる', '私はときどき自分がよくない人間だと思う'], levels: [{ level: 'high', label: '高い自尊感情', desc: '自分を肯定的に見ており、健全な自己像を持っています。', action: '現在の肯定的な自己観を維持しながら、他者にも温かさを分けてあげてください。' }, { level: 'medium', label: '普通の自尊感情', desc: '状況によって自尊感情の波があります。', action: '感謝日記を書いてみましょう。小さな成果を認めてあげてください。' }, { level: 'low', label: '低い自尊感情', desc: '自己批判が多く、自信が不足しています。', action: 'セルフコンパッションとCBTによる自動思考修正が役立ちます。相談をお勧めします。' }] },
      relationship: { title: '恋愛・親密さパターン検査', desc: '恋愛または親密な関係でのパターンを答えてください。', options_key: 'options_likert5', questions: ['恋人と対立が生じると感情的になりやすい', '恋人に自分の感情やニーズを正直に言うのが難しい', '恋人は私をよく理解してくれていると感じる（逆採点）', '一人でいるとき、よく孤独を感じる', '恋人と一緒でも完全につながっていると感じない', '恋人が期待に応えないと大きく失望したり怒ったりする', '関係でいつも自分の方が多く努力している感じがする', '恋人との関係は全体的に満足している（逆採点）', '親密な関係でよく傷つく', '別れや関係終了が非常に怖い'], levels: [{ level: 'healthy', label: '健全な関係パターン', desc: 'お互いを尊重し、コミュニケーションをとる健全な関係パターンを持っています。', action: '現在の健全なパターンを維持し、パートナーとの深い対話をもっと増やしてみましょう。' }, { level: 'moderate', label: '改善の余地あり', desc: '関係に一部困難がありますが、改善可能です。', action: '関係心理の本を読んだり、カップルカウンセリングを検討してみましょう。' }, { level: 'challenging', label: '関係パターンの見直しが必要', desc: '繰り返す関係パターンがあり、専門的な助けが必要です。', action: '個人カウンセリングを通じて関係パターンの根源を探索してみましょう。' }] },
      ders: { title: '感情調節困難度尺度（DERS-10）', desc: '普段、感情を感じて対処する方法について答えてください。', options_key: 'options_likert5', questions: ['自分がどんな感情を感じているのかよくわからないことが多い', '感情が激しくなると、コントロールするのが難しい', '気分が悪いとき、その感情から抜け出すのが難しい', '悲しんだり怒ったりすると、自分が恥ずかしく感じる', '気分が悪いとき、集中するのが難しい', '感情が激しくなると、衝動的に行動してしまう', '怒ったとき、状況をコントロールするのが難しい', '否定的な感情にうまく対処できていないと感じる', '自分の感情が強すぎて対処しきれない', '感情が生じると、それが自分の行動を支配してしまう'], levels: [{ level: 'good', label: '良好な感情調節', desc: '感情を効果的に認識し、コントロールできます。', action: 'マインドフルネス練習で現在の感情調節能力をさらに強化してみましょう。' }, { level: 'moderate', label: '中程度の困難', desc: '一部の状況で感情調節に困難を感じます。', action: 'DBTのスキル（苦痛耐性スキルなど）の練習が役立ちます。' }, { level: 'high', label: '高い感情調節困難', desc: '感情調節にかなりの困難があります。', action: '専門家の助けを借りてください。DBTや感情焦点化療法（EFT）が非常に効果的です。' }] },
      ego: { title: '自我境界・強度尺度', desc: '自分のアイデンティティと自己表現について答えてください。', options_key: 'options_likert5', questions: ['自分が何を求めているかを明確に知っている', '他者の意見に簡単に流されない自分だけの価値観がある', '他人からの頼みを断るのが非常に難しい', '自分の感情と他者の感情を区別するのが難しいことがある', '自分がどんな人間かについての明確なアイデンティティがある', '周囲の人の期待に合わせて自分を変える傾向がある', '自分の境界線を他者に明確に伝えることができる', '対立状況で自分の立場を明確に表現できる'], levels: [{ level: 'strong', label: '強い自我境界', desc: '明確な自己アイデンティティと健全な境界線を持っています。', action: '現在の自我の強さを維持しながら、関係における柔軟性も発揮してみましょう。' }, { level: 'moderate', label: '普通のレベル', desc: '状況によって自己境界が揺らぐことがあります。', action: '「いいえ」と言う練習をしてみましょう。自分の価値観リストを作成してみましょう。' }, { level: 'weak', label: '弱い自我境界', desc: 'アイデンティティが不明確で、他者に流されやすいです。', action: 'アイデンティティ探索のジャーナリングと境界設定トレーニングをしてみましょう。' }] },
    },
  },
  zh: {
    hero_tag: '标准心理自我诊断工具',
    hero_title: '🧠 心理自我诊断测试',
    hero_sub: '基于临床使用的标准检测工具了解您的心理状态。结果仅供参考，不能代替专业诊断。',
    select_test: '选择测试',
    select_test_title: '您想进行哪项测试？',
    select_test_sub: '每项测试需要5-10分钟',
    questions_count: '{count}个题目',
    start_btn: '开始 →',
    warning_text: '⚠️ 本测试不能代替专业心理诊断。',
    progress_text: '{progress} / {total} 完成',
    back_btn: '← 返回',
    confirm_result: '查看结果 →',
    remain_questions: '还需回答{count}题',
    test_result_title: '测试结果',
    recommended_action: '💡 建议行动',
    score_range: '分数范围',
    current_label: '当前',
    other_test_btn: '进行其他测试',
    counsel_btn: '💬 接受咨询',
    integrated_btn: '📊 查看综合报告',
    integrated_hint: '完成所有测试后，即可查看综合心理档案。',
    categories: { clinical: '临床心理', attachment: '依恋与关系', selfgrowth: '自我成长' },
    options_4: ['完全没有 (0)', '有几天 (1)', '一半以上天数 (2)', '几乎天天 (3)'],
    options_6: ['强烈不同意 (1)', '不同意 (2)', '有些不同意 (3)', '有些同意 (4)', '同意 (5)', '强烈同意 (6)'],
    options_likert5: ['强烈不同意 (1)', '不同意 (2)', '中立 (3)', '同意 (4)', '强烈同意 (5)'],
    options_agree4: ['非常同意 (4)', '同意 (3)', '不同意 (2)', '非常不同意 (1)'],
    tests: {
      phq9: { title: 'PHQ-9 抑郁自我诊断', desc: '在过去两周里，您被以下问题困扰的频率如何？', options_key: 'options_4', questions: ['做事时提不起劲或没有乐趣', '感到心情低落、沮丧或绝望', '入睡困难、易醒或睡得太多', '感到疲倦或没有活力', '食欲不振或吃得太多', '觉得自己很糟——或是一个失败者，让自己或家人失望', '对事物专注困难', '说话或行动缓慢，以致其他人能够注意到，或烦躁不安、动来动去', '觉得死了更好，或想要以某种方式伤害自己'], levels: [{ level: 'minimal', label: '正常范围', desc: '目前几乎没有抑郁症状。', action: '保持自我调适，维持健康的心理状态。' }, { level: 'mild', label: '轻度抑郁', desc: '有轻微的抑郁症状。', action: '尝试规律运动、充足睡眠并增加社交互动。' }, { level: 'moderate', label: '中度抑郁', desc: '有中等程度的抑郁症状。', action: '建议进行咨询。' }, { level: 'moderate_severe', label: '中重度抑郁', desc: '有相当严重的抑郁症状。', action: '强烈建议前往专业心理咨询机构或精神科门诊就诊。' }, { level: 'severe', label: '重度抑郁', desc: '有严重的抑郁症状。', action: '请立即寻求专业医生的帮助。' }] },
      gad7: { title: 'GAD-7 焦虑自我诊断', desc: '在过去两周里，您被以下问题困扰的频率如何？', options_key: 'options_4', questions: ['感到紧张、焦虑或急躁', '无法停止或控制担忧', '对各种不同的事情担忧过多', '很难放松下来', '坐立不安，难以保持安静', '容易烦躁或易怒', '感到害怕，好像有什么可怕的事情要发生'], levels: [{ level: 'minimal', label: '正常范围', desc: '目前几乎没有焦虑症状。', action: '保持当前状态，你做得很好！' }, { level: 'mild', label: '轻度焦虑', desc: '有轻微的焦虑症状。', action: '深呼吸练习和正念冥想会有所帮助。' }, { level: 'moderate', label: '中度焦虑', desc: '有中等程度的焦虑症状。', action: '可以考虑接受心理咨询。' }, { level: 'severe', label: '重度焦虑', desc: '有严重的焦虑症状。', action: '请立即寻求专业医生的帮助。' }] },
      stress: { title: '学业压力自我诊断', desc: '请根据您当前的学校生活勾选以下项目。', options_key: 'options_4', questions: ['难以集中注意力学习', '因成绩或学分感到焦虑', '繁重的作业和考试让我感到吃力', '经常不想去学校', '朋友或同学关系让我感到压力', '对未来（出路、就业）感到迷茫和焦虑', '睡眠不足', '不吃早饭或饮食不规律', '想一个人呆着，谁也不想见', '什么都觉得麻烦，缺乏动力'], levels: [{ level: 'minimal', label: '低度压力', desc: '你把压力管理得很好！', action: '请继续保持健康的生活习惯。' }, { level: 'mild', label: '中度压力', desc: '有适度的压力。', action: '尝试通过休息和兴趣爱好来释放压力。' }, { level: 'moderate', label: '高度压力', desc: '压力明显偏高。', action: '尝试与心理咨询师或信任的长辈沟通。' }, { level: 'severe', label: '极度压力', desc: '有很高的职业倦怠风险。', action: '建议立即接受专业心理咨询。' }] },
      ecr: { title: 'ECR-12 成人依恋类型', desc: '请根据您在亲密关系中的感受作答。', options_key: 'options_6', note: '※ 第1-6题：焦虑维度，第7-12题：回避维度', questions: ['我担心伴侣会不再爱我', '我觉得和伴侣亲密让我不舒服', '我害怕伴侣会抛弃我', '我觉得依赖伴侣让我不舒服', '我担心伴侣并不真正想要我', '我觉得向伴侣表达感情让我不舒服', '我经常担心伴侣会离开我', '我会尽量避免和伴侣太亲密', '伴侣不在身边时我会非常焦虑', '我难以在情感上和伴侣亲近', '我担心伴侣不像我那样投入这段关系', '我不喜欢和伴侣分享我的感情'], levels: [{ level: 'secure', label: '安全型', desc: '在亲密关系中有安全感，形成健康的依恋。', action: '维持健康的关系模式，与伴侣进行更深入的沟通。' }, { level: 'anxious', label: '焦虑型', desc: '在关系中对被抛弃有强烈的恐惧，倾向于寻求爱的确认。', action: '练习爱自己。自尊心提升训练和正念冥想有帮助。' }, { level: 'avoidant', label: '回避型', desc: '对亲密感感到不舒服，难以表达情感，强调独立性。', action: '尝试练习小步骤的脆弱性分享。' }, { level: 'disorganized', label: '混乱型', desc: '渴望亲密但同时感到恐惧的混乱模式。', action: '与专业咨询师一起探索依恋创伤。' }] },
      rses: { title: '罗森伯格自尊量表', desc: '请指出您对以下每个陈述的同意程度。', options_key: 'options_agree4', questions: ['我感到自己是一个有价值的人，至少与他人相当', '我觉得我有许多优良品质', '总体来说，我倾向于认为自己是个失败者', '我能把大多数事情做得和别人一样好', '我感到没有多少值得我自豪的地方', '我对自己持肯定的态度', '总体而言，我对自己感到满意', '我希望我能对自己有更多的尊重', '我确实有时感到自己毫无用处', '我有时认为自己一点都不好'], levels: [{ level: 'high', label: '高自尊', desc: '你对自己持积极的看法，有健康的自我形象。', action: '保持积极的自我观，同时也向他人传递温暖。' }, { level: 'medium', label: '中等自尊', desc: '自尊可能因情况而波动。', action: '写感恩日记，记录自己的优点和小成就。' }, { level: 'low', label: '低自尊', desc: '对自己有较多负面评价，缺乏自信。', action: '建议进行自我关怀训练和CBT认知重构。' }] },
      relationship: { title: '恋爱与亲密关系模式测试', desc: '请反思您在恋爱或亲密关系中的模式。', options_key: 'options_likert5', questions: ['当与伴侣发生冲突时，我容易情绪激动', '我很难向伴侣坦诚表达我的情感或需求', '我感到伴侣真正理解我（反向计分）', '我经常感到孤独', '即使和伴侣在一起，也感觉没有完全连接', '当伴侣未达到我的期望时，我会非常失望或愤怒', '在关系中，我总感觉自己付出更多', '总体而言，我对与伴侣的关系感到满意（反向计分）', '在亲密关系中我经常感到受伤', '我非常害怕分手或关系结束'], levels: [{ level: 'healthy', label: '健康的关系模式', desc: '你有相互尊重、善于沟通的健康关系模式。', action: '继续维持健康的模式，与伴侣进行更深入的交流。' }, { level: 'moderate', label: '有改善空间', desc: '关系中有一些困难，但可以改善。', action: '考虑阅读关系心理书籍或进行伴侣咨询。' }, { level: 'challenging', label: '需要检视关系模式', desc: '有反复出现的关系模式，需要专业帮助。', action: '通过个人咨询探索关系模式的根源。' }] },
      ders: { title: '情绪调节困难量表（DERS-10）', desc: '请回答您通常体验和处理情绪的方式。', options_key: 'options_likert5', questions: ['我经常不知道自己在感受什么情绪', '当情绪激动时，很难控制它', '当心情不好时，很难从中解脱', '当我悲伤或愤怒时，我会感到羞耻', '心情不好时，很难集中注意力', '当情绪涌上来时，会冲动地行动', '当我生气时，很难控制局面', '我觉得自己不能很好地应对负面情绪', '我的情绪太强烈，让我难以承受', '当情绪产生时，它会支配我的行为'], levels: [{ level: 'good', label: '情绪调节良好', desc: '你能有效识别和调节情绪。', action: '通过正念练习进一步强化情绪调节能力。' }, { level: 'moderate', label: '中等程度困难', desc: '在某些情况下有情绪调节困难。', action: '练习DBT技能（痛苦耐受技能等）有所帮助。' }, { level: 'high', label: '情绪调节困难较高', desc: '在情绪调节方面有相当大的困难。', action: '请寻求专业帮助。DBT或情绪聚焦疗法（EFT）非常有效。' }] },
      ego: { title: '自我边界与强度量表', desc: '请反思您的身份认同和自我表达。', options_key: 'options_likert5', questions: ['我清楚地知道自己想要什么', '我有不容易被他人意见左右的价值观', '我很难拒绝别人的请求', '有时我很难区分自己的情绪和他人的情绪', '我对自己是什么样的人有清晰的身份认同', '我倾向于改变自己以符合他人的期望', '我能够清楚地向他人表达我的界限', '在冲突情况下，我能清楚地表达自己的立场'], levels: [{ level: 'strong', label: '自我边界强', desc: '你有清晰的自我认同和健康的个人边界。', action: '维持强大的自我意识，同时在关系中也保持灵活性。' }, { level: 'moderate', label: '中等水平', desc: '根据情况，自我边界可能会动摇。', action: '练习说"不"。列出你的个人价值观清单。' }, { level: 'weak', label: '自我边界弱', desc: '身份认同不清晰，容易受他人影响。', action: '推荐进行身份探索日记和边界设定训练。' }] },
    },
  },
};

// ─── 검사 메타 데이터 ───────────────────────────────────────────
const TEST_META: Record<string, { color: string; icon: string; category: string; levelMaxes: number[] }> = {
  phq9:         { color: '#4F8EF7', icon: '💙', category: 'clinical',    levelMaxes: [4, 9, 14, 19, 27] },
  gad7:         { color: '#6c63ff', icon: '💜', category: 'clinical',    levelMaxes: [4, 9, 14, 21] },
  stress:       { color: '#20c997', icon: '💚', category: 'clinical',    levelMaxes: [9, 19, 24, 30] },
  ecr:          { color: '#f472b6', icon: '💗', category: 'attachment',  levelMaxes: [24, 36, 48, 72] },
  rses:         { color: '#fbbf24', icon: '⭐', category: 'selfgrowth',  levelMaxes: [25, 35, 40] },
  relationship: { color: '#f97316', icon: '💕', category: 'attachment',  levelMaxes: [22, 33, 50] },
  ders:         { color: '#a78bfa', icon: '🌊', category: 'selfgrowth',  levelMaxes: [22, 33, 50] },
  ego:          { color: '#34d399', icon: '🧱', category: 'selfgrowth',  levelMaxes: [19, 26, 32] },
};

const CATEGORY_COLORS: Record<string, string> = {
  clinical:   '#4F8EF7',
  attachment: '#f472b6',
  selfgrowth: '#fbbf24',
};

const REVERSE_SCORED: Record<string, number[]> = {
  rses:         [2, 4, 7, 8, 9],   // 0-indexed
  relationship: [2, 7],
};

function computeScore(testKey: string, answers: number[], optionKey: string): number {
  const reverseIndices = REVERSE_SCORED[testKey] || [];
  // options_4: 0~3, options_6: 1~6, options_agree4: 1~4 (순서 반전), options_likert5: 1~5
  const maxVal = optionKey === 'options_6' ? 7 : optionKey === 'options_likert5' ? 6 : optionKey === 'options_agree4' ? 5 : 4;
  return answers.reduce((sum, val, idx) => {
    const v = reverseIndices.includes(idx) ? (maxVal - val) : val;
    return sum + v;
  }, 0);
}

export default function TestPage() {
  const router = useRouter();
  const { lang } = useLangStore();
  const t = i18n[lang] || i18n.ko;

  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [step, setStep] = useState(0); // 0=intro, 1=questions, 2=result
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filterCat, setFilterCat] = useState<string>('all');

  const test = selectedTest && t.tests[selectedTest] && TEST_META[selectedTest] ? {
    title: t.tests[selectedTest].title,
    desc: t.tests[selectedTest].desc,
    note: t.tests[selectedTest].note,
    color: TEST_META[selectedTest].color,
    icon: TEST_META[selectedTest].icon,
    options_key: t.tests[selectedTest].options_key,
    options: (t as any)[t.tests[selectedTest].options_key] as string[],
    questions: t.tests[selectedTest].questions as string[],
    levels: (t.tests[selectedTest].levels as any[]).map((lvl, idx) => ({
      max: TEST_META[selectedTest].levelMaxes[idx] || 999,
      ...lvl,
    })),
  } : null;

  const startTest = (key: string) => {
    setSelectedTest(key);
    const len = t.tests[key]?.questions?.length || 0;
    setAnswers(new Array(len).fill(-1));
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
    const score = computeScore(selectedTest, answers, test.options_key);
    const level = test.levels.find((l: any) => score <= l.max) || test.levels[test.levels.length - 1];
    setResult({ score, level, test });
    setStep(2);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/counsel/tests`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_type: selectedTest, score, answers, level: level.level }),
      });
      if (res.ok) sessionStorage.setItem('analysis_needs_refresh', '1');
    } catch {}
    setLoading(false);
  };

  const progress = answers.filter(a => a >= 0).length;
  const total = test?.questions.length || 0;
  const allAnswered = progress === total && total > 0;

  const levelColors: Record<string, string> = {
    minimal: '#20c997', mild: '#F59E0B', moderate: '#fd7e14',
    moderate_severe: '#EF4444', severe: '#DC2626',
    secure: '#20c997', anxious: '#f97316', avoidant: '#6c63ff', disorganized: '#EF4444',
    high: '#20c997', medium: '#F59E0B', low: '#EF4444',
    healthy: '#20c997', challenging: '#EF4444',
    good: '#20c997', strong: '#20c997', weak: '#EF4444',
  };

  const scoreUnit = lang === 'ko' ? '점' : lang === 'zh' ? '分' : lang === 'ja' ? '点' : ' pts';
  const categories = ['all', 'clinical', 'attachment', 'selfgrowth'];

  return (
    <div>
      {/* 히어로 */}
      <div style={{ background: 'linear-gradient(135deg, #4F8EF7 0%, #6c63ff 50%, #f472b6 100%)', padding: '36px 28px', color: 'white' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,.2)', borderRadius: 20, padding: '4px 14px', fontSize: 13, marginBottom: 12 }}>
            {t.hero_tag}
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>{t.hero_title}</h2>
          <p style={{ opacity: .88, fontSize: '.9rem', lineHeight: 1.6 }}>{t.hero_sub}</p>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '28px' }}>

        {/* Step 0: 검사 선택 */}
        {step === 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#4F8EF7', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4 }}>{t.select_test}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t.select_test_title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '.875rem' }}>{t.select_test_sub}</p>
              </div>
              <button
                onClick={() => router.push('/dashboard/test/integrated')}
                style={{ padding: '10px 18px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(167,139,250,0.4)', background: 'rgba(167,139,250,0.1)', color: '#a78bfa', fontWeight: 700, fontSize: '.82rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .2s' }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(167,139,250,0.2)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(167,139,250,0.1)'; }}
              >
                {t.integrated_btn}
              </button>
            </div>

            {/* 카테고리 필터 */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, marginTop: 16, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setFilterCat(cat)} style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${filterCat === cat ? (cat === 'all' ? '#4F8EF7' : CATEGORY_COLORS[cat]) : 'var(--glass-border)'}`, background: filterCat === cat ? `${cat === 'all' ? '#4F8EF7' : CATEGORY_COLORS[cat]}18` : 'var(--glass-bg)', color: filterCat === cat ? (cat === 'all' ? '#4F8EF7' : CATEGORY_COLORS[cat]) : 'var(--text-muted)', fontWeight: 600, fontSize: '.8rem', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                  {cat === 'all' ? (lang === 'ko' ? '전체' : lang === 'ja' ? '全て' : lang === 'zh' ? '全部' : 'All') : (t.categories as any)[cat]}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {Object.keys(TEST_META).filter(key => filterCat === 'all' || TEST_META[key].category === filterCat).map((key) => {
                const meta = TEST_META[key];
                const testData = t.tests[key];
                if (!testData) return null;
                return (
                  <div key={key} onClick={() => startTest(key)} style={{ background: 'var(--glass-bg)', borderRadius: 16, padding: '24px 18px', textAlign: 'center', border: `2px solid var(--glass-border)`, cursor: 'pointer', transition: 'all .2s', backdropFilter: 'blur(12px)', boxShadow: 'var(--glass-shadow)' }}
                    onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = meta.color; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${meta.color}44`; }}
                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)'; (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--glass-shadow)'; }}
                  >
                    <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: '.7rem', fontWeight: 700, background: `${CATEGORY_COLORS[meta.category]}18`, color: CATEGORY_COLORS[meta.category], marginBottom: 10 }}>
                      {(t.categories as any)[meta.category]}
                    </div>
                    <div style={{ fontSize: '2.2rem', marginBottom: 10 }}>{meta.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 6, color: meta.color, wordBreak: 'keep-all', lineHeight: 1.4 }}>{testData.title}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>{t.questions_count.replace('{count}', String(testData.questions.length))}</div>
                    <div style={{ background: `${meta.color}18`, color: meta.color, padding: '6px 14px', borderRadius: 20, fontSize: '.75rem', fontWeight: 700, display: 'inline-block' }}>{t.start_btn}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: 'rgba(255,193,7,0.12)', border: '1px solid rgba(255,193,7,0.4)', borderRadius: 10, padding: '12px 16px', fontSize: '.82rem', color: 'var(--text-secondary)', marginTop: 24 }}>
              {t.warning_text}
            </div>
          </div>
        )}

        {/* Step 1: 문항 */}
        {step === 1 && test && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, color: test.color }}>{test.title}</span>
                <span>{t.progress_text.replace('{progress}', String(progress)).replace('{total}', String(total))}</span>
              </div>
              <div style={{ height: 8, background: 'var(--glass-bg)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                <div style={{ height: '100%', width: `${(progress / total) * 100}%`, background: `linear-gradient(90deg, ${test.color}, ${test.color}cc)`, borderRadius: 8, transition: 'width .3s' }} />
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '.875rem', marginBottom: test.note ? 4 : 20, background: 'var(--glass-bg)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
              📋 {test.desc}
            </p>
            {test.note && (
              <p style={{ fontSize: '.78rem', color: test.color, marginBottom: 16, paddingLeft: 4, fontWeight: 600 }}>{test.note}</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {test.questions.map((q: string, i: number) => (
                <div key={i} style={{ background: 'var(--glass-bg)', borderRadius: 14, padding: '18px 20px', border: `1px solid ${answers[i] >= 0 ? test.color : 'var(--glass-border)'}`, transition: 'all .2s', backdropFilter: 'blur(12px)', boxShadow: answers[i] >= 0 ? `0 2px 12px ${test.color}25` : 'var(--glass-shadow)' }}>
                  <div style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: 14, display: 'flex', gap: 10, color: 'var(--text-primary)', alignItems: 'flex-start' }}>
                    <span style={{ background: test.color, color: 'white', width: 24, height: 24, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                    <span style={{ lineHeight: 1.5 }}>{q}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {test.options.map((opt: string, val: number) => (
                      <button key={val} onClick={() => selectAnswer(i, val)} style={{ padding: '8px 12px', borderRadius: 8, fontSize: '.78rem', cursor: 'pointer', border: `1.5px solid ${answers[i] === val ? test.color : 'var(--glass-border)'}`, background: answers[i] === val ? `${test.color}22` : 'var(--bg-layer2)', color: answers[i] === val ? test.color : 'var(--text-secondary)', fontWeight: answers[i] === val ? 700 : 400, transition: 'all .15s', textAlign: 'left', lineHeight: 1.4 }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setStep(0)} style={{ background: 'var(--glass-bg)', color: 'var(--text-muted)', padding: '12px 20px', borderRadius: 10, border: '1px solid var(--glass-border)', cursor: 'pointer', fontWeight: 500 }}>{t.back_btn}</button>
              <button onClick={submitTest} disabled={!allAnswered} style={{ flex: 1, background: allAnswered ? test.color : 'var(--glass-bg)', color: allAnswered ? 'white' : 'var(--text-muted)', padding: '12px 20px', borderRadius: 10, border: `1px solid ${allAnswered ? test.color : 'var(--glass-border)'}`, cursor: allAnswered ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '1rem', transition: 'all .2s' }}>
                {allAnswered ? t.confirm_result : t.remain_questions.replace('{count}', String(total - progress))}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 결과 */}
        {step === 2 && result && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 12 }}>{result.test.icon}</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 4, color: 'var(--text-primary)' }}>{result.test.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '.875rem', marginBottom: 28 }}>{t.test_result_title}</p>

            <div style={{ background: `${levelColors[result.level.level] || result.test.color}12`, border: `2px solid ${levelColors[result.level.level] || result.test.color}`, borderRadius: 20, padding: '28px 24px', marginBottom: 24 }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: levelColors[result.level.level] || result.test.color, marginBottom: 4 }}>
                {result.score}{scoreUnit}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: levelColors[result.level.level] || result.test.color, marginBottom: 12 }}>
                {result.level.label}
              </div>
              <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, textAlign: 'left' }}>{result.level.desc}</p>
            </div>

            <div style={{ background: 'var(--glass-bg)', borderRadius: 14, padding: '20px', border: '1px solid var(--glass-border)', marginBottom: 24, textAlign: 'left', backdropFilter: 'blur(12px)' }}>
              <div style={{ fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#4F8EF7' }}>💡</span> {t.recommended_action}
              </div>
              <p style={{ fontSize: '.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.level.action}</p>
            </div>

            <div style={{ background: 'var(--glass-bg)', borderRadius: 14, padding: '20px', border: '1px solid var(--glass-border)', marginBottom: 28, textAlign: 'left', backdropFilter: 'blur(12px)' }}>
              <div style={{ fontWeight: 700, marginBottom: 14, fontSize: '.9rem', color: 'var(--text-primary)' }}>{t.score_range}</div>
              {result.test.levels.map((l: any, i: number) => {
                const prev = i > 0 ? result.test.levels[i - 1].max + 1 : 0;
                return (
                  <div key={l.level} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: levelColors[l.level] || '#adb5bd', flexShrink: 0 }} />
                    <div style={{ fontSize: '.8rem', flex: 1, color: l.level === result.level.level ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: l.level === result.level.level ? 700 : 400 }}>
                      {l.label} ({prev}~{l.max}{scoreUnit})
                    </div>
                    {l.level === result.level.level && (
                      <span style={{ background: `${levelColors[l.level]}22`, color: levelColors[l.level], padding: '2px 10px', borderRadius: 20, fontSize: '.72rem', fontWeight: 700 }}>{t.current_label}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => { setStep(0); setResult(null); setSelectedTest(null); }} style={{ background: 'var(--glass-bg)', color: 'var(--text-muted)', padding: '11px 22px', borderRadius: 10, border: '1px solid var(--glass-border)', cursor: 'pointer', fontWeight: 600 }}>
                {t.other_test_btn}
              </button>
              <button onClick={() => router.push('/dashboard/test/integrated')} style={{ background: `linear-gradient(135deg, #a78bfa, #f472b6)`, color: 'white', padding: '11px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 15px rgba(167,139,250,0.4)' }}>
                {t.integrated_btn}
              </button>
              <button onClick={() => router.push('/dashboard/counsel')} style={{ background: '#4F8EF7', color: 'white', padding: '11px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                {t.counsel_btn}
              </button>
            </div>
            {loading && <p style={{ marginTop: 12, fontSize: '.8rem', color: 'var(--text-muted)' }}>저장 중...</p>}
          </div>
        )}
      </div>
    </div>
  );
}
