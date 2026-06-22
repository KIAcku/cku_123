'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/apiClient';
import { useLangStore } from '@/store/langStore';

// ─── 다국어 번역 사전 ──────────────────────────────────────────────
const i18n: Record<string, any> = {
  ko: {
    hero_tag: '표준 심리 자가진단 도구',
    hero_title: '🧠 심리 자가진단 테스트',
    hero_sub: '임상에서 사용하는 표준 검사 도구(PHQ-9, GAD-7)를 기반으로 나의 심리 상태를 확인해보세요. 결과는 참고용이며, 전문 진단을 대체하지 않습니다.',
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
    options: ['전혀 아니다 (0)', '며칠 (1)', '일주일의 절반 이상 (2)', '거의 매일 (3)'],
    tests: {
      phq9: {
        title: 'PHQ-9 우울증 자가진단',
        desc: '지난 2주 동안 다음과 같은 문제들이 얼마나 자주 있었나요?',
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
          { level: 'minimal',  label: '정상 범위',   desc: '현재 우울 증상이 거의 없습니다.',                 action: '지속적인 자기 돌봄으로 건강한 마음을 유지하세요.' },
          { level: 'mild',     label: '경미한 우울', desc: '가벼운 우울 증상이 있습니다.',                   action: '규칙적인 운동, 충분한 수면, 사회적 교류를 늘려보세요.' },
          { level: 'moderate', label: '중등도 우울', desc: '중간 정도의 우울 증상이 있습니다.',               action: '전문가 상담을 권장합니다. 1:1 상담을 시도해보세요.' },
          { level: 'moderate_severe', label: '중증 우울', desc: '상당한 수준의 우울 증상이 있습니다.', action: '즉시 전문 상담사 또는 정신건강의학과 방문을 권장합니다.' },
          { level: 'severe',   label: '심한 우울',   desc: '심각한 수준의 우울 증상이 있습니다.',             action: '지금 바로 전문가의 도움을 받으세요. 위기상담 1393으로 전화하세요.' }
        ]
      },
      gad7: {
        title: 'GAD-7 불안 자가진단',
        desc: '지난 2주 동안 다음과 같은 문제들이 얼마나 자주 있었나요?',
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
          { level: 'minimal',  label: '정상 범위',   desc: '불안 증상이 거의 없습니다.',           action: '현재 상태를 잘 유지하고 있어요!' },
          { level: 'mild',     label: '경미한 불안', desc: '가벼운 불안 증상이 있습니다.',         action: '깊은 호흡 연습과 마음챙김 명상이 도움이 될 수 있어요.' },
          { level: 'moderate', label: '중등도 불안', desc: '중간 정도의 불안 증상이 있습니다.',     action: '전문 상담을 받아보세요. 인지행동치료(CBT)가 효과적입니다.' },
          { level: 'severe',   label: '심한 불안',   desc: '심각한 불안 증상이 있습니다.',         action: '즉시 전문가의 도움을 받으세요. 정신건강 위기상담 1577-0199' }
        ]
      },
      stress: {
        title: '학업 스트레스 자가진단',
        desc: '현재 학교생활과 관련하여 다음 항목을 체크해주세요.',
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
          { level: 'minimal',  label: '낮은 스트레스', desc: '스트레스를 잘 관리하고 있어요!', action: '지금처럼 건강한 생활 습관을 유지하세요.' },
          { level: 'mild',     label: '보통 스트레스', desc: '적당한 수준의 스트레스가 있습니다.', action: '휴식과 취미 활동으로 스트레스를 해소해보세요.' },
          { level: 'moderate', label: '높은 스트레스', desc: '스트레스가 상당히 높습니다.', action: '상담사 또는 믿을 수 있는 어른과 이야기해보세요.' },
          { level: 'severe',   label: '매우 높은 스트레스', desc: '번아웃 위험이 높습니다.', action: '전문 상담을 즉시 받으시길 권장합니다.' }
        ]
      }
    }
  },
  en: {
    hero_tag: 'Standard Psychological Assessment Tool',
    hero_title: '🧠 Psychological Self-Assessment',
    hero_sub: 'Check your mental state based on standard test tools (PHQ-9, GAD-7) used in clinical practice. The results are for reference only and do not replace professional diagnosis.',
    select_test: 'Select Test',
    select_test_title: 'Which test would you like to take?',
    select_test_sub: 'Each test takes 5-10 minutes',
    questions_count: '{count} questions',
    start_btn: 'Start Test →',
    warning_text: '⚠️ This test does not replace a professional psychological diagnosis. If you have severe symptoms, please seek professional help.',
    progress_text: '{progress} / {total} Completed',
    back_btn: '← Go Back',
    confirm_result: 'Check Results →',
    remain_questions: 'Please answer {count} more questions',
    test_result_title: 'Test Result',
    recommended_action: '💡 Recommended Actions',
    score_range: 'Score Range',
    current_label: 'Current',
    other_test_btn: 'Take Another Test',
    counsel_btn: '💬 Get Counsel',
    options: ['Not at all (0)', 'Several days (1)', 'More than half the days (2)', 'Nearly every day (3)'],
    tests: {
      phq9: {
        title: 'PHQ-9 Depression Self-Assessment',
        desc: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
        questions: [
          'Little interest or pleasure in doing things',
          'Feeling down, depressed, or hopeless',
          'Trouble falling or staying asleep, or sleeping too much',
          'Feeling tired or having little energy',
          'Poor appetite or overeating',
          'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
          'Trouble concentrating on things, such as reading the newspaper or watching television',
          'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
          'Thoughts that you would be better off dead or of hurting yourself in some way',
        ],
        levels: [
          { level: 'minimal',  label: 'Minimal Depression', desc: 'You currently have minimal to no depressive symptoms.', action: 'Keep taking care of yourself to maintain a healthy mind.' },
          { level: 'mild',     label: 'Mild Depression', desc: 'You have mild depressive symptoms.', action: 'Try regular exercise, adequate sleep, and increasing social interactions.' },
          { level: 'moderate', label: 'Moderate Depression', desc: 'You have moderate depressive symptoms.', action: 'We recommend counseling. Try a 1:1 anonymous consultation.' },
          { level: 'moderate_severe', label: 'Moderately Severe Depression', desc: 'You have moderately severe depressive symptoms.', action: 'We strongly recommend visiting a professional counselor or psychiatrist.' },
          { level: 'severe',   label: 'Severe Depression', desc: 'You have severe depressive symptoms.', action: 'Please seek professional help immediately.' }
        ]
      },
      gad7: {
        title: 'GAD-7 Anxiety Self-Assessment',
        desc: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
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
          { level: 'minimal',  label: 'Minimal Anxiety', desc: 'You currently have minimal to no anxiety symptoms.', action: 'Keep up the good work and maintain your current routine!' },
          { level: 'mild',     label: 'Mild Anxiety', desc: 'You have mild anxiety symptoms.', action: 'Deep breathing exercises and mindfulness meditation can be helpful.' },
          { level: 'moderate', label: 'Moderate Anxiety', desc: 'You have moderate anxiety symptoms.', action: 'Consider seeking counseling. Cognitive Behavioral Therapy (CBT) is highly effective.' },
          { level: 'severe',   label: 'Severe Anxiety', desc: 'You have severe anxiety symptoms.', action: 'Please seek professional help immediately.' }
        ]
      },
      stress: {
        title: 'Academic Stress Assessment',
        desc: 'Please rate the following items regarding your current school life.',
        questions: [
          'Hard to concentrate on studying',
          'Anxious about grades or academic performance',
          'Overwhelmed by too many assignments and exams',
          'Frequently not wanting to go to school',
          'Stressed about friendships or peer relationships',
          'Feeling lost or anxious about the future (career, employment)',
          'Not getting enough sleep',
          'Skipping meals or eating irregularly',
          'Wanting to be alone or not wanting to see anyone',
          'Lacking motivation and feeling sluggish about everything',
        ],
        levels: [
          { level: 'minimal',  label: 'Low Stress', desc: 'You are managing your stress well!', action: 'Maintain your healthy lifestyle habits.' },
          { level: 'mild',     label: 'Moderate Stress', desc: 'You have a normal level of stress.', action: 'Try to relieve stress through relaxation and hobbies.' },
          { level: 'moderate', label: 'High Stress', desc: 'Your stress level is significantly high.', action: 'Talk to a counselor or a trusted adult.' },
          { level: 'severe',   label: 'Very High Stress', desc: 'High risk of burnout.', action: 'We highly recommend seeking professional counseling immediately.' }
        ]
      }
    }
  },
  ja: {
    hero_tag: '標準心理自己診断ツール',
    hero_title: '🧠 心理自己診断テスト',
    hero_sub: '臨床で使用される標準検査ツール（PHQ-9, GAD-7）を基に、あなたの心理状態を確認してください。結果は参考用であり、専門的な診断に代わるものではありません。',
    select_test: '検査選択',
    select_test_title: 'どの検査を受けますか？',
    select_test_sub: '各検査は5〜10分かかります',
    questions_count: '{count}問',
    start_btn: '検査開始 →',
    warning_text: '⚠️ 本検査は専門的な心理診断に代わるものではありません。深刻な症状がある場合は、専門家に相談してください。',
    progress_text: '{progress} / {total} 完了',
    back_btn: '← 戻る',
    confirm_result: '結果を確認する →',
    remain_questions: 'あと{count}問回答してください',
    test_result_title: '検査結果',
    recommended_action: '💡 推奨される行動',
    score_range: 'スコア範囲',
    current_label: '現在',
    other_test_btn: '他の検査を受ける',
    counsel_btn: '💬 カウンセリングを受ける',
    options: ['全くない (0)', '数日 (1)', '半分以上の日数 (2)', 'ほとんど毎日 (3)'],
    tests: {
      phq9: {
        title: 'PHQ-9 うつ病自己診断',
        desc: '過去2週間、次の問題にどのくらい頻繁に悩まされましたか？',
        questions: [
          '物事に対する興味や楽しさがほとんどない',
          '気分が落ち込んだり、うつな気分になったり、絶望を感じたりする',
          '寝つきが悪い、途中で目が覚める、または逆に眠りすぎる',
          '疲れた感じがする、または気力がない',
          '食欲がない、または食べすぎる',
          '自分が失格者であると感じる、または家族を失望させたと思う',
          '新聞を読むことやテレビを見るなど、物事に集中することが難しい',
          '他人が気づくほど話し方や動作が遅い、または逆に落ち着きなく動き回る',
          '自分が死んだほうがましだ、または自分を傷つけようと思ったことがある',
        ],
        levels: [
          { level: 'minimal',  label: '正常範囲',   desc: '現在、うつの症状はほとんどありません。', action: '健康的な心を維持するために自己管理を続けてください。' },
          { level: 'mild',     label: '軽度のうつ', desc: '軽いうつの症状があります。', action: '定期的な運動や十分な睡眠を取り、人との関わりを増やしてみましょう。' },
          { level: 'moderate', label: '中等度のうつ', desc: '中程度のうつの症状があります。', action: '専門家によるカウンセリングをお勧めします。1:1匿名相談をお試しください。' },
          { level: 'moderate_severe', label: '中等度重症のうつ', desc: 'かなりのうつの症状があります。', action: '専門のカウンセラーまたは精神科クリニックへの受診を強くお勧めします。' },
          { level: 'severe',   label: '重度のうつ', desc: '深刻なうつの症状があります。', action: '今すぐ専門家の助けを借りてください。' }
        ]
      },
      gad7: {
        title: 'GAD-7 不安自己診断',
        desc: '過去2週間、次の問題にどのくらい頻繁に悩まされましたか？',
        questions: [
          '神経質、不安、またはイライラを感じる',
          '心配するのをやめたり、コントロールしたりできない',
          'さまざまなことについて心配しすぎる',
          'リラックスするのが難しい',
          'じっとしていられないほど落ち着かない',
          '怒りっぽくなったり、イライラしやすくなったりする',
          '恐ろしいことが起こるのではないかと恐れる',
        ],
        levels: [
          { level: 'minimal',  label: '正常範囲',   desc: '不安の症状はほとんどありません。', action: '現在の状態をよく維持できています！' },
          { level: 'mild',     label: '軽度の不安', desc: '軽い不安の症状があります。', action: '深呼吸のエクササイズやマインドフルネス瞑想が効果的です。' },
          { level: 'moderate', label: '中等度の不安', desc: '中程度の不安の症状があります。', action: '専門的な相談を検討してください。認知行動療法（CBT）が効果的です。' },
          { level: 'severe',   label: '重度の不安', desc: '深刻な不安の症状があります。', action: 'すぐに専門家の治療を受けてください。' }
        ]
      },
      stress: {
        title: '学業ストレス自己診断',
        desc: '現在の学校生活について、次の項目をチェックしてください。',
        questions: [
          '勉強に集中するのが難しい',
          '成績や単位のことで不安がある',
          '課題や試験が多くて負担に感じる',
          '学校に行きたくない日が多い',
          '友達や対人関係がストレスだ',
          '将来（進路、就職）が不安で途方に暮れる',
          '十分な睡眠が取れていない',
          '食事を抜いたり不規則に食べたりする',
          '一人になりたい、誰にも会いたくない',
          'すべてが面倒でやる気が出ない',
        ],
        levels: [
          { level: 'minimal',  label: '低いストレス', desc: 'ストレスをうまく管理できています！', action: 'この調子で健康的な生活習慣を維持しましょう。' },
          { level: 'mild',     label: '通常のストレス', desc: '適度なレベルのストレスがあります。', action: '休息や趣味の活動でストレスを解消してみましょう。' },
          { level: 'moderate', label: '高いストレス', desc: 'ストレスがかなり高い状態です。', action: 'スクールカウンセラーや信頼できる大人に話してみてください。' },
          { level: 'severe',   label: '非常に高いストレス', desc: 'バーンアウト（燃え尽き）の危険性が高いです。', action: '専門的なカウンセリングをすぐに受けることを強くお勧めします。' }
        ]
      }
    }
  },
  zh: {
    hero_tag: '标准心理自我诊断工具',
    hero_title: '🧠 心理自我诊断测试',
    hero_sub: '基于临床使用的标准检测工具（PHQ-9，GAD-7）了解您的心理状态。结果仅供参考，不能代替专业诊断。',
    select_test: '选择测试',
    select_test_title: '您想进行哪项测试？',
    select_test_sub: '每项测试需要5-10分钟',
    questions_count: '{count}个题目',
    start_btn: '开始测试 →',
    warning_text: '⚠️ 本测试不能代替专业心理诊断。如果您有严重症状，请寻求专业人士的帮助。',
    progress_text: '{progress} / {total} 完成',
    back_btn: '← 返回',
    confirm_result: '查看结果 →',
    remain_questions: '请再回答 {count} 个问题',
    test_result_title: '测试结果',
    recommended_action: '💡 建议行动',
    score_range: '分数范围',
    current_label: '当前',
    other_test_btn: '进行其他测试',
    counsel_btn: '💬 接受咨询',
    options: ['完全没有 (0)', '有几天 (1)', '一半以上天数 (2)', '几乎天天 (3)'],
    tests: {
      phq9: {
        title: 'PHQ-9 抑郁自我诊断',
        desc: '在过去的两周里，您被以下问题困扰的频率如何？',
        questions: [
          '做事时提不起劲或没有乐趣',
          '感到心情低落、沮丧或绝望',
          '入睡困难、易醒或睡得太多',
          '感到疲倦或没有活力',
          '食欲不振或吃得太多',
          '觉得自己很糟——或是一个失败者，让自己或家人失望',
          '对事物专注困难，例如看报纸或看电视',
          '说话或行动缓慢，以致其他人能够注意到？或者相反——烦躁不安，动来动去的时间比平时多得多',
          '觉得死了更好，或想要以某种方式伤害自己',
        ],
        levels: [
          { level: 'minimal',  label: '正常范围',   desc: '目前几乎没有抑郁症状。', action: '保持自我调适，维持健康的心理状态。' },
          { level: 'mild',     label: '轻度抑郁', desc: '有轻微的抑郁症状。', action: '尝试规律运动、充足睡眠并增加社交互动。' },
          { level: 'moderate', label: '中度抑郁', desc: '有中等程度的抑郁症状。', action: '建议进行咨询。尝试进行1:1匿名咨询。' },
          { level: 'moderate_severe', label: '中重度抑郁', desc: '有相当严重的抑郁症状。', action: '强烈建议前往专业心理咨询机构或精神科门诊就诊。' },
          { level: 'severe',   label: '重度抑郁', desc: '有严重的抑郁症状。', action: '请立即寻求专业医生的帮助。' }
        ]
      },
      gad7: {
        title: 'GAD-7 焦虑自我诊断',
        desc: '在过去的两周里，您被以下问题困扰的频率如何？',
        questions: [
          '感到紧张、焦虑或急躁',
          '无法停止或控制担忧',
          '对各种不同的事情担忧过多',
          '很难放松下来',
          '坐立不安，难以保持安静',
          '容易烦躁或易怒',
          '感到害怕，好像有什么可怕的事情要发生',
        ],
        levels: [
          { level: 'minimal',  label: '正常范围',   desc: '目前几乎没有焦虑症状。', action: '保持当前状态，你做得很好！' },
          { level: 'mild',     label: '轻度焦虑', desc: '有轻微的焦虑症状。', action: '深呼吸练习和正念冥想会有所帮助。' },
          { level: 'moderate', label: '中度焦虑', desc: '有中等程度的焦虑症状。', action: '可以考虑接受心理咨询。认知行为疗法（CBT）很有效。' },
          { level: 'severe',   label: '重度焦虑', desc: '有严重的焦虑症状。', action: '请立即寻求专业医生的帮助。' }
        ]
      },
      stress: {
        title: '学业压力自我诊断',
        desc: '请根据您当前的学校生活勾选以下项目。',
        questions: [
          '难以集中注意力学习',
          '因成绩或学分感到焦虑',
          '繁重的作业和考试让我感到吃力',
          '经常不想去学校',
          '朋友或同学关系让我感到压力',
          '对未来（出路、就业）感到迷茫和焦虑',
          '睡眠不足',
          '不吃早饭或饮食不规律',
          '想一个人呆着，谁也不想见',
          '什么都觉得麻烦，缺乏动力',
        ],
        levels: [
          { level: 'minimal',  label: '低度压力', desc: '你把压力管理得很好！', action: '请继续保持健康的生活习惯。' },
          { level: 'mild',     label: '中度压力', desc: '有适度的压力。', action: '尝试通过休息和兴趣爱好来释放压力。' },
          { level: 'moderate', label: '高度压力', desc: '压力明显偏高。', action: '尝试与心理咨询师或信任的长辈沟通。' },
          { level: 'severe',   label: '极度压力', desc: '有很高的职业倦怠（崩溃）风险。', action: '建议立即接受专业心理咨询。' }
        ]
      }
    }
  }
};

// ─── 검사 메타 데이터 (디자인 요소 & 점수 기준) ───────────────────
const TEST_META: Record<string, { color: string; icon: string; levelMaxes: number[] }> = {
  phq9: { color: '#4F8EF7', icon: '💙', levelMaxes: [4, 9, 14, 19, 27] },
  gad7: { color: '#6c63ff', icon: '💜', levelMaxes: [4, 9, 14, 21] },
  stress: { color: '#20c997', icon: '💚', levelMaxes: [9, 19, 24, 30] }
};

export default function TestPage() {
  const router = useRouter();
  const { lang } = useLangStore();
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [step, setStep] = useState(0); // 0=intro, 1=questions, 2=result
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const t = i18n[lang] || i18n.ko;

  // 선택한 검사의 다국어 텍스트와 디자인 메타 데이터를 결합
  const test = selectedTest && t.tests[selectedTest] && TEST_META[selectedTest] ? {
    title: t.tests[selectedTest].title,
    desc: t.tests[selectedTest].desc,
    color: TEST_META[selectedTest].color,
    icon: TEST_META[selectedTest].icon,
    questions: t.tests[selectedTest].questions,
    levels: t.tests[selectedTest].levels.map((lvl: any, idx: number) => ({
      max: TEST_META[selectedTest].levelMaxes[idx] || 99,
      level: lvl.level,
      label: lvl.label,
      desc: lvl.desc,
      action: lvl.action
    }))
  } : null;

  const startTest = (key: string) => {
    setSelectedTest(key);
    const questionsLength = t.tests[key]?.questions?.length || 0;
    setAnswers(new Array(questionsLength).fill(-1));
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
    const level = test.levels.find((l: any) => score <= l.max) || test.levels[test.levels.length - 1];
    const resultData = { score, level, test };
    setResult(resultData);
    setStep(2);

    // DB 저장
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/counsel/tests`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_type: selectedTest, score, answers, level: level.level }),
      });
      if (res.ok) {
        // 분석 페이지 캐시 무효화 플래그 설정
        sessionStorage.setItem('analysis_needs_refresh', '1');
      }
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
            {t.hero_tag}
          </div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 700, marginBottom: 8 }}>{t.hero_title}</h2>
          <p style={{ opacity: .88, fontSize: '.9rem' }}>
            {t.hero_sub}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px' }}>

        {/* Step 0: 테스트 선택 */}
        {step === 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#4F8EF7', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>{t.select_test}</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>{t.select_test_title}</h3>
            <p style={{ color: '#6c757d', fontSize: '.875rem', marginBottom: 24 }}>{t.select_test_sub}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {Object.keys(TEST_META).map((key) => {
                const meta = TEST_META[key];
                const testData = t.tests[key];
                if (!testData) return null;
                return (
                  <div key={key} onClick={() => startTest(key)} style={{
                    background: 'var(--glass-bg)', borderRadius: 16, padding: '28px 20px', textAlign: 'center',
                    border: `2px solid var(--glass-border)`, cursor: 'pointer', transition: 'all .2s',
                    backdropFilter: 'blur(12px)',
                    boxShadow: 'var(--glass-shadow)'
                  }}
                    onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = meta.color; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${meta.color}33`; }}
                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)'; (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--glass-shadow)'; }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{meta.icon}</div>
                     <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: 8, color: meta.color, wordBreak: 'keep-all' }}>{testData.title}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>{t.questions_count.replace('{count}', String(testData.questions.length))}</div>
                    <div style={{ background: `${meta.color}12`, color: meta.color, padding: '6px 14px', borderRadius: 20, fontSize: '.75rem', fontWeight: 600, display: 'inline-block' }}>
                      {t.start_btn}
                    </div>
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
            {/* 진행바 */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', color: '#6c757d', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: test.color }}>{test.title}</span>
                <span>{t.progress_text.replace('{progress}', String(progress)).replace('{total}', String(total))}</span>
              </div>
              <div style={{ height: 8, background: '#e9ecef', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(progress / total) * 100}%`, background: test.color, borderRadius: 8, transition: 'width .3s' }} />
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '.875rem', marginBottom: 24, background: 'var(--glass-bg)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
              📋 {test.desc}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {test.questions.map((q: string, i: number) => (
                <div key={i} style={{ background: 'var(--glass-bg)', borderRadius: 14, padding: '20px', border: `1px solid ${answers[i] >= 0 ? test.color : 'var(--glass-border)'}`, transition: 'all .2s', backdropFilter: 'blur(12px)', boxShadow: answers[i] >= 0 ? `0 2px 12px ${test.color}25` : 'var(--glass-shadow)' }}>
                  <div style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: 14, display: 'flex', gap: 8, color: 'var(--text-primary)' }}>
                    <span style={{ background: test.color, color: 'white', width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                    {q}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {t.options.map((opt: string, val: number) => (
                      <button key={val} onClick={() => selectAnswer(i, val)} style={{
                        padding: '9px 12px', borderRadius: 8, fontSize: '.8rem', cursor: 'pointer',
                        border: `1.5px solid ${answers[i] === val ? test.color : 'var(--glass-border)'}`,
                        background: answers[i] === val ? `${test.color}22` : 'var(--bg-layer2)',
                        color: answers[i] === val ? test.color : 'var(--text-secondary)',
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
              <button onClick={() => setStep(0)} style={{ background: 'var(--glass-bg)', color: 'var(--text-muted)', padding: '12px 20px', borderRadius: 10, border: '1px solid var(--glass-border)', cursor: 'pointer', fontWeight: 500 }}>{t.back_btn}</button>
              <button onClick={submitTest} disabled={!allAnswered} style={{
                flex: 1, background: test.color, color: 'white', padding: '12px 20px', borderRadius: 10,
                border: 'none', cursor: allAnswered ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '1rem',
                opacity: allAnswered ? 1 : 0.5, transition: 'all .2s'
              }}>
                {allAnswered ? t.confirm_result : t.remain_questions.replace('{count}', String(total - progress))}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 결과 */}
        {step === 2 && result && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 12 }}>{result.test.icon}</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>{result.test.title}</h3>
            <p style={{ color: '#6c757d', fontSize: '.875rem', marginBottom: 28 }}>{t.test_result_title}</p>

            {/* 점수 카드 */}
            <div style={{
              background: `${levelColors[result.level.level] || '#4F8EF7'}10`,
              border: `2px solid ${levelColors[result.level.level] || '#4F8EF7'}`,
              borderRadius: 20, padding: '28px 24px', marginBottom: 24, textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: levelColors[result.level.level] || '#4F8EF7', marginBottom: 4 }}>
                {result.score}{lang === 'ko' ? '점' : lang === 'zh' ? '分' : lang === 'ja' ? '点' : ' pts'}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: levelColors[result.level.level] || '#4F8EF7', marginBottom: 12 }}>
                {result.level.label}
              </div>
              <p style={{ fontSize: '.9rem', color: '#495057', lineHeight: 1.7 }}>{result.level.desc}</p>
            </div>

            {/* 추천 행동 */}
            <div style={{ background: 'var(--glass-bg)', borderRadius: 14, padding: '20px', border: '1px solid var(--glass-border)', marginBottom: 24, textAlign: 'left', backdropFilter: 'blur(12px)' }}>
              <div style={{ fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
                <span style={{ color: '#4F8EF7' }}>💡</span> {t.recommended_action}
              </div>
              <p style={{ fontSize: '.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.level.action}</p>
            </div>

            {/* 레벨별 점수 바 */}
            <div style={{ background: 'var(--glass-bg)', borderRadius: 14, padding: '20px', border: '1px solid var(--glass-border)', marginBottom: 28, textAlign: 'left', backdropFilter: 'blur(12px)' }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '.9rem', color: 'var(--text-primary)' }}>{t.score_range}</div>
              {result.test.levels.map((l: any, i: number) => {
                const prev = i > 0 ? result.test.levels[i - 1].max + 1 : 0;
                const scoreUnit = lang === 'ko' ? '점' : lang === 'zh' ? '分' : lang === 'ja' ? '点' : ' pts';
                return (
                  <div key={l.level} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: levelColors[l.level] || '#adb5bd', flexShrink: 0 }} />
                    <div style={{ fontSize: '.8rem', flex: 1, color: l.level === result.level.level ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: l.level === result.level.level ? 700 : 400 }}>
                      {l.label} ({prev}~{l.max}{scoreUnit})
                    </div>
                    {l.level === result.level.level && (
                      <span style={{ background: `${levelColors[l.level]}22`, color: levelColors[l.level], padding: '2px 8px', borderRadius: 20, fontSize: '.72rem', fontWeight: 700 }}>{t.current_label}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => { setStep(0); setResult(null); setSelectedTest(null); }} style={{ background: 'var(--glass-bg)', color: 'var(--text-muted)', padding: '11px 22px', borderRadius: 10, border: '1px solid var(--glass-border)', cursor: 'pointer', fontWeight: 500 }}>
                {t.other_test_btn}
              </button>
              <button onClick={() => router.push('/dashboard/counsel')} style={{ background: '#4F8EF7', color: 'white', padding: '11px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                {t.counsel_btn}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
