'use client';
import { useState, useEffect } from 'react';
import { useLangStore } from '@/store/langStore';
import { useRouter } from 'next/navigation';

// ─── 다국어 번역 사전 ──────────────────────────────────────────────
const i18n: Record<string, any> = {
  ko: {
    hero_tag: '마음건강 가이드',
    hero_title: '📚 마음건강 자료실',
    hero_sub: '전문가가 검증한 심리 건강 가이드와 실전 팁을 만나보세요.',
    list_btn: '← 목록으로',
    counsel_btn: '💬 상담사와 이야기하기',
    read_time: '📖 {time} 읽기',
    categories: {
      all: '전체',
      stress: '스트레스',
      study: '학업',
      relation: '인간관계',
      career: '진로',
      mindfulness: '마음챙김'
    },
    articles: [
      {
        id: 1,
        title: '번아웃에서 회복하는 5가지 방법',
        desc: '쉬지 못하고 달려온 당신에게. 번아웃의 신호를 알아채고 회복하는 실전 가이드입니다.',
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
        id: 2,
        title: '시험 불안 극복하기 — 과학적 방법',
        desc: '시험만 되면 머리가 하얘지거나 몸이 굳어버리는 당신을 위한 인지행동치료 기반 가이드.',
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
        id: 3,
        title: '건강한 경계선 만들기 — NO 라고 말하는 법',
        desc: '모든 부탁을 들어주다 지쳐버린 당신. 건강한 관계를 위한 경계선 설정 가이드.',
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
        id: 4,
        title: '진로 불안, 이렇게 다루세요',
        desc: '"나만 뒤처지는 것 같아서" — 비교와 불안에서 벗어나 자신만의 속도를 찾는 법.',
        tags: ['진로', '비교', '자기발견'],
        content: `## 진로 불안은 누구나 경험해요

SNS에서 친구들의 스펙과 취업 소식을 보며 불안해진 적 있나요? 이건 매우 자연스러운 반응입니다.

### 비교에서 벗어나는 법

**1. SNS 사용 시간 줄이기**
하루 30분으로 제한하는 것만으로도 불안이 크게 줄어든다는 연구가 있습니다.

**2. \'지금 내가 할 수 있는 것\' 에 집중하기**
미래는 통제할 수 없지만 오늘은 통제할 수 있습니다.

### 자신의 방향 찾기

**가치 기반 질문들:**
- 돈보다 중요한 것이 무엇인가?
- 어떤 활동을 할 때 시간이 빨리 가는가?
- 10년 후 어떤 삶을 살고 싶은가?

이 질문들에 답하다 보면 자신만의 방향이 보이기 시작합니다.`
      },
      {
        id: 5,
        title: '마음챙김 명상 5분 시작하기',
        desc: '명상이 어렵다고요? 딱 5분, 앉아서 숨만 쉬어도 됩니다. 초보자를 위한 가이드.',
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
        id: 6,
        title: '학업 스트레스를 이기는 시간 관리법',
        desc: '할 일이 너무 많아 무엇부터 해야 할지 모르겠다면? 뽀모도로와 아이젠하워 매트릭스.',
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
      }
    ]
  },
  en: {
    hero_tag: 'Mental Health Guide',
    hero_title: '📚 Mental Health Resources',
    hero_sub: 'Discover expert-validated mental health guides and practical tips.',
    list_btn: '← Back to List',
    counsel_btn: '💬 Talk to a Counselor',
    read_time: '📖 {time} read',
    categories: {
      all: 'All',
      stress: 'Stress',
      study: 'Academics',
      relation: 'Relationships',
      career: 'Career',
      mindfulness: 'Mindfulness'
    },
    articles: [
      {
        id: 1,
        title: '5 Ways to Recover from Burnout',
        desc: 'For you who have been running without rest. A practical guide to recognizing and recovering from burnout.',
        tags: ['Burnout', 'Recovery', 'Rest'],
        content: `## What is Burnout?

Burnout is a state of total physical and mental exhaustion caused by accumulated excessive stress.

### Signs of Burnout

- Not wanting to wake up in the morning and avoiding school
- No longer enjoying things you used to love
- Easily getting annoyed by minor things
- Trouble concentrating and spacing out frequently

### 5 Recovery Methods

**1. Intentionally Do Nothing**
It\'s okay not to be productive. Spend 30 minutes a day just spacing out or listening to music.

**2. Reduce One Activity**
Temporarily stop one of your current tasks for 2 weeks. It doesn\'t have to be perfect.

**3. Walk in Nature**
Just a 20-minute walk daily reduces the stress hormone cortisol.

**4. Create a Sleep Routine**
Going to sleep and waking up at the same time twice increases recovery speed.

**5. Talk to a Professional**
You don\'t have to handle this alone. Visit the school counseling center.`
      },
      {
        id: 2,
        title: 'Overcoming Test Anxiety: A Scientific Method',
        desc: 'A guide based on cognitive behavioral therapy for those whose minds go blank or freeze during exams.',
        tags: ['Test Anxiety', 'CBT', 'Focus'],
        content: `## Why Does Test Anxiety Happen?

Test anxiety is physical and cognitive reactions triggered by the fear of being evaluated.

### Immediate Calming Techniques

**1. 4-7-8 Breathing Technique**
Breathe in 4s → Hold 7s → Breathe out 8s
Repeating this 3 times before the test stabilizes your heart rate.

**2. Cognitive Restructuring**
"This one test does not define my life."
"I can do as much as I prepared."
Repeat these thoughts consciously.

**3. Day Before the Exam**
Do not study new materials. Reviewing what you know helps the brain feel safe.

### Long-term Solutions

- Practice retrieval by taking small tests frequently
- Get enough sleep (more than 6 hours the night before)
- Avoid excessive caffeine`
      },
      {
        id: 3,
        title: 'Setting Healthy Boundaries: How to Say NO',
        desc: 'Exhausted from saying yes to every request? A guide to setting boundaries for healthy relationships.',
        tags: ['Boundaries', 'Relationships', 'Self-esteem'],
        content: `## Why Boundaries Matter

Healthy boundaries protect yourself while making relationships deeper and more authentic.

### Practicing Saying NO

**Step 1: You don\'t have to refuse immediately**
It\'s okay to buy time by saying, "Let me think about it."

**Step 2: You don\'t need a long explanation**
Simply saying, "I can\'t do that right now" is enough.

**Step 3: Don\'t feel guilty**
Refusal is rejecting the request, not rejecting the person.

### Setting Boundaries at School

- Unreasonable demands in team projects: "I can\'t handle that part because..."
- Running low on energy: "I want to rest today."
- Private info requests: "That\'s a bit personal..."`
      },
      {
        id: 4,
        title: 'How to Manage Career Anxiety',
        desc: '"Fearing that I am falling behind" — How to break free from comparison and find your own pace.',
        tags: ['Career', 'Comparison', 'Self-discovery'],
        content: `## Everyone Experiences Career Anxiety

Have you ever felt anxious checking friends\' specs and job updates on SNS? This is highly natural.

### Breaking Free from Comparison

**1. Limit SNS Usage**
Limiting it to 30 minutes a day significantly reduces anxiety.

**2. Focus on "What I can do right now"**
You cannot control the future, but you can control today.

### Finding Your Direction

**Value-based Questions:**
- What is more important to you than money?
- What activities make you lose track of time?
- What kind of life do you want in 10 years?

Answering these will help you see your direction.`
      },
      {
        id: 5,
        title: 'Start a 5-Minute Mindfulness Meditation',
        desc: 'Is meditation hard? Just sit and breathe for 5 minutes. A guide for beginners.',
        tags: ['Meditation', 'Mindfulness', 'Present'],
        content: `## What is Meditation?

Meditation is practicing focusing on the present moment. It\'s not erasing thoughts, but recognizing and letting them go.

### 5-Minute Mindfulness Meditation

**Preparation:**
Sit or lie down in a comfortable position. You may close or open your eyes.

**Step 1 (1 min): Body Scan**
Direct your attention to parts of your body: feet → legs → stomach → chest → shoulders → face.

**Step 2 (3 min): Observe Breathing**
Observe the breath going in and out of your nose. If thoughts arise, just note them and return to breathing.

**Step 3 (1 min): Wrap-up**
Slowly open your eyes and return to the present.

### Best Times to Meditate

- Right after waking up
- Before a stressful exam
- Before going to sleep`
      },
      {
        id: 6,
        title: 'Time Management to Overcome Academic Stress',
        desc: 'Overwhelmed by too many tasks? Learn Pomodoro and the Eisenhower Matrix.',
        tags: ['Time Management', 'Productivity', 'Pomodoro'],
        content: `## Why Do We Always Lack Time?

It\'s often not a lack of time, but a lack of priority and focus.

### The Pomodoro Technique

25 mins focus → 5 mins rest → Repeat 4 times → 30 mins rest

**Why it works:**
Splitting work into short segments reduces psychological resistance.

### The Eisenhower Matrix

| | Urgent | Not Urgent |
|---|---|---|
| **Important** | Do immediately | Plan & Schedule |
| **Not Important** | Delegate | Eliminate |

Placing tasks into these 4 boxes makes your priorities clear.

### Actions for Today

1. Pick just 3 things to do tomorrow
2. Do the hardest one first
3. Mark it as 'done' even if it\'s not perfect`
      }
    ]
  },
  ja: {
    hero_tag: '心の健康ガイド',
    hero_title: '📚 心の健康資料室',
    hero_sub: '専門家が検証した心の健康ガイドと実践的なヒントをご覧ください。',
    list_btn: '← リストへ',
    counsel_btn: '💬 カウンセラーと話す',
    read_time: '📖 {time} 読了',
    categories: {
      all: '全体',
      stress: 'ストレス',
      study: '学業',
      relation: '人間関係',
      career: '進路',
      mindfulness: 'マインドフルネス'
    },
    articles: [
      {
        id: 1,
        title: 'バーンアウトから回復する5つの方法',
        desc: '休む間もなく走り続けてきたあなたへ。バーンアウトのサインを察知し回復するための実践ガイド。',
        tags: ['バーンアウト', '回復', '休息'],
        content: `## バーンアウトとは？

バーンアウト（Burnout）は、過度なストレスが蓄積され、身体的・精神的に完全に消耗した状態です。

### バーンアウトの兆候

- 朝起きるのが嫌で、学校に行きたくない
- 好きだったことが楽しめなくなった
- 些細なことでイライラしやすくなった
- 集中力が低下し、ボーッとする時間が増えた

### 5つの回復方法

**1. 意図的に「何もしない時間」を作る**
生産的でなくても大丈夫です。1日30分はボーッとしたり、音楽を聴いたりしましょう。

**2. 活動を一つ減らす**
今やっていることのうち一つを、2週間休止してみてください。完璧でなくても構いません。

**3. 自然の中を歩く**
毎日20分の散歩だけで、ストレスホルモンのコルチゾールが減少します。

**4. 睡眠ルーティンを作る**
毎日同じ時間に寝て起きるだけで、回復速度が2倍になります。

**5. 専門家に相談する**
一人で抱え込まないでください。学校の相談窓口を訪ねてみましょう。`
      },
      {
        id: 2,
        title: '試験不安を克服する — 科学的なアプローチ',
        desc: '試験になると頭が真っ白になったり体が硬直してしまうあなたへ。認知行動療法に基づくガイド。',
        tags: ['試験不安', '認知行動', '集中力'],
        content: `## 試験不安はなぜ起こる？

試験不安は、評価に対する恐怖が身体的・認知的な反応として現れるものです。

### 即座に落ち着くための技法

**1. 4-7-8 呼吸法**
4秒吸う → 7秒止める → 8秒吐く
試験前に3回繰り返すと心拍数が安定します。

**2. 認知的再構成**
「この試験一つで人生が決まるわけではない」
「準備した分だけやればいい」
このような考えを意識的に繰り返します。

**3. 試験前日の行動**
新しい内容の勉強は避けましょう。すでに知っている内容の復習は脳に安心感を与えます。

### 長期的な解決策

- 小さなテストを頻繁に行う「検索練習」
- 十分な睡眠（前日は6時間以上）
- カフェインの過剰摂取を避ける`
      },
      {
        id: 3,
        title: '健康的な境界線の作り方 — 「NO」と言う技術',
        desc: 'すべての頼み事を引き受けて疲れ果てていませんか？健康的な関係のための境界線設定ガイド。',
        tags: ['境界線', '人間関係', '自己肯定感'],
        content: `## 境界線が必要な理由

健康的な境界線は、自分を守ると同時に関係をより深く誠実なものにします。

### 「NO」と言う練習

**ステップ 1: すぐに返事をしなくても良い**
「一度考えてみます」と時間を稼ぐのも有効です。

**ステップ 2: 理由を長々と説明する必要はない**
「今は難しいです」だけで十分です。

**ステップ 3: 罪悪感を持たない**
断ることは相手を拒絶するのではなく、その「要求」を断っているだけです。

### 学校での境界線設定

- 共同作業での不当な要求: 「その部分は私の担当ではないので…」
- 体力がない時: 「今日はちょっと休みたいんだ」
- プライベートな質問: 「それはちょっと個人的なことなので…」`
      },
      {
        id: 4,
        title: '進路の不安に対処する方法',
        desc: '「自分だけが遅れている気がして」 — 他人との比較から抜け出し、自分のペースを見つける方法。',
        tags: ['進路', '比較', '自己発見'],
        content: `## 進路の不安は誰にでもあります

SNSで友人たちの活躍や就職活動の様子を見て不安になったことはありませんか？これは自然な反応です。

### 比較から抜け出す方法

**1. SNSの使用時間を減らす**
1日30分に制限するだけで不安が大幅に減少するという研究結果があります。

**2. 「今できること」に集中する**
未来はコントロールできませんが、今日という日はコントロールできます。

### 自分の方向性を見つける

**価値観に基づく質問:**
- お金よりも大切なものは何か？
- どんな活動をしている時に時間が経つのが早いか？
- 10年後、どのような生活を送っていたいか？

これらの質問に向き合うことで、自分の進むべき方向が見えてきます。`
      },
      {
        id: 5,
        title: '5分で始めるマインドフルネス瞑想',
        desc: '瞑想は難しい？たった5分、座って息をするだけで十分です。初心者のためのガイド。',
        tags: ['瞑想', 'マインドフルネス', '今この瞬間'],
        content: `## 瞑想とは？

瞑想は、今この瞬間に意識を向ける練習です。雑念を消すのではなく、雑念に気づいて手放すことです。

### 5分マインドフルネス瞑想

**準備:**
楽な姿勢で座るか横になります。目は閉じても開けても構いません。

**Step 1 (1分): ボディスキャン**
足 → 脚 → お腹 → 胸 → 肩 → 顔の順に、各部位に意識を向けます。

**Step 2 (3分): 呼吸の観察**
鼻を出入りする息の感覚に注目します。雑念が浮かんだら「あ、考えているな」と気づき、また呼吸に意識を戻します。

**Step 3 (1分): 終了**
ゆっくりと目を開け、今ここに戻ってきます。

### おすすめのタイミング

- 朝起きた直後
- 試験前の緊張する時
- 就寝前`
      },
      {
        id: 6,
        title: '学業ストレスに勝つ時間管理術',
        desc: 'やることが多すぎて何から手をつければいいか分からない？ポモドーロとアイゼンハワーマトリクス。',
        tags: ['時間管理', '生産性', 'ポモドーロ'],
        content: `## なぜいつも時間が足りないのか？

実際に時間が足りないのではなく、優先順位と集中力が不足している場合が多いです。

### ポモドーロ・テクニック

25分集中 → 5分休憩 → 4回繰り返す → 30分休憩

**効果的な理由:**
終わりが見える短い時間に区切ることで、心理的ハードルが下がります。

### アイゼンハワーマトリクス

| | 緊急 | 緊急ではない |
|---|---|---|
| **重要** | すぐに実行 | 計画を立てる |
| **重要ではない**| 他の人に任せる | やめる |

すべてのタスクをこの4つの枠に分類することで、優先順位が明確になります。

### 今日の実践ステップ

1. 明日やることを3つだけ決める
2. 最も難しいタスクを最初にやる
3. 完璧でなくても「完了」させる`
      }
    ]
  },
  zh: {
    hero_tag: '心理健康指南',
    hero_title: '📚 心理健康资料室',
    hero_sub: '了解经专家验证的心理健康指南和实用建议。',
    list_btn: '← 返回列表',
    counsel_btn: '💬 与咨询师交谈',
    read_time: '📖 阅读时间 {time}',
    categories: {
      all: '全部',
      stress: '压力',
      study: '学业',
      relation: '人际关系',
      career: '职业生涯',
      mindfulness: '正念'
    },
    articles: [
      {
        id: 1,
        title: '从职业倦怠（崩溃）中恢复 occur 的5种方法',
        desc: '送给没有休息、一直奔跑的你。识别职业倦怠信号并恢复的实操指南。',
        tags: ['倦怠', '恢复', '休息'],
        content: `## 什么是职业倦怠？

职业倦怠（Burnout）是由于长期积累的过度压力导致身体和心理彻底透支的状态。

### 职业倦怠的信号

- 早上不想起床，排斥去学校
- 以前喜欢的事情现在不再觉得有趣
- 容易为鸡毛蒜皮的小事发脾气
- 注意力难以集中，发呆时间变长

### 5种恢复方法

**1. 有意识地让自己“无所事事”**
不需要时时刻刻保持高效。每天花30分钟纯粹发呆或听听喜欢的音乐。

**2. 减少一项活动**
把目前在做的一件事情暂停2周。不需要事事追求完美。

**3. 在自然中散步**
每天散步20分钟就能有效降低压力激素皮质醇。

**4. 建立睡眠规律**
每天在相同的时间睡觉和起床，能让身体恢复速度翻倍。

**5. 寻求专业人士的帮助**
你不需要独自承受这一切。去学校的心理咨询室看看吧。`
      },
      {
        id: 2,
        title: '如何克服考试焦虑 — 科学方法',
        desc: '专为一遇到考试就大脑一片空白或身体僵硬的你准备的认知行为疗法指南。',
        tags: ['考试焦虑', '认知行为', '注意力'],
        content: `## 为什么会产生考试焦虑？

考试焦虑是对评估的恐惧在身体和认知上产生的连锁反应。

### 即刻冷静下来的技巧

**1. 4-7-8 呼吸法**
吸气4秒 → 憋气7秒 → 呼气8秒
考试开始前重复3次能有效平复心率。

**2. 认知重构**
“这一场考试决定不了我的人生。”
“我只要发挥出我准备的水平就好。”
有意识地在脑海中重复这些话。

**3. 考试前一天的准备**
不要学习新的内容。复习已知内容能给大脑带来安全感。

### 长期解决方案

- 通过经常进行小测试来进行“检索练习”
- 充足的睡眠（考试前一天保证6小时以上）
- 避免摄入过多咖啡因`
      },
      {
        id: 3,
        title: '建立健康的人际边界线 — 学会说 NO',
        desc: '因无法拒绝所有请求而疲惫不堪？为健康人际关系设立边界线的指南。',
        tags: ['边界线', '人际关系', '自尊心'],
        content: `## 为什么需要边界线

健康的边界线能保护自己，同时让关系变得更加深厚和真诚。

### 练习说 NO

**第一步：不需要立刻拒绝**
可以说“让我考虑一下”来争取思考的时间。

**第二步：不需要长篇大论地解释理由**
简单地回答“我现在不方便”就已经足够了。

**第三步：不要感到内疚**
拒绝只是拒绝这件事情，而不是否定这个人。

### 在学校中设立边界线

- 小组作业中的无理要求：“这部分不属于我的分工，所以……”
- 精力不足时：“今天我想好好休息一下。”
- 被索要隐私时：“这涉及我个人的一些隐私，不太方便……”`
      },
      {
        id: 4,
        title: '如何应对职业生涯焦虑',
        desc: '“总觉得只有自己落后了” — 摆脱比较与焦虑，寻找属于自己的节奏。',
        tags: ['前途', '比较', '自我发现'],
        content: `## 每个人都会经历前途焦虑

在社交媒体上看到朋友们的优秀履历和就业消息时，你是否也感到焦虑？这非常正常。

### 摆脱比较的方法

**1. 减少社交媒体的使用**
有研究表明，每天限制使用社交媒体30分钟能显著降低焦虑感。

**2. 专注于“当前我能做的事情”**
你无法控制未来，但你可以把握今天。

### 寻找自己的方向

**基于价值观的提问：**
- 对你来说，有什么是比钱更重要的？
- 做什么事情时，你会觉得时间过得特别快？
- 10年后你向往过上什么样的生活？

回答这些问题，你会开始看清属于自己的方向。`
      },
      {
        id: 5,
        title: '开启5分钟正念冥想',
        desc: '觉得冥想很难？只要坐下来呼吸5分钟就足够了。初学者入门指南。',
        tags: ['冥想', '正念', '当下'],
        content: `## 什么是冥想？

冥想是专注于当下的练习。它不是为了消除杂念，而是去察觉杂念并放手。

### 5分钟正念冥想

**开始前的准备：**
选择舒适的姿势坐下或躺下。闭眼或睁眼均可。

**第一步 (1分钟): 身体扫描**
依次关注你的身体部位：双脚 → 腿部 → 腹部 → 胸部 → 肩部 → 面部。

**第二步 (3分钟): 观察呼吸**
感受空气从鼻腔进出的过程。如果有杂念闪过，只需察觉“我想到了其他事”，然后重新回到呼吸上。

**第三步 (1分钟): 结束**
慢慢睁开眼睛，将意识带回当下。

### 什么时候适合做冥想？

- 早上刚起床时
- 考试前感到紧张时
- 睡觉前`
      },
      {
        id: 6,
        title: '战胜学业压力的时间管理法',
        desc: '事情太多不知道从何下手？学习番茄工作法和艾森豪威尔矩阵。',
        tags: ['时间管理', '高效', '番茄工作法'],
        content: `## 为什么总觉得时间不够用？

很多时候并不是时间真的不够，而是缺乏优先级和专注力。

### 番茄工作法

专注25分钟 → 休息5分钟 → 重复4次 → 休息30分钟

**为什么有效？**
将任务拆解为看得见终点的短时间模块，能有效减少拖延的心理阻力。

### 艾森豪威尔矩阵

| | 紧急 | 不紧急 |
|---|---|---|
| **重要** | 立即处理 | 制定计划 |
| **不重要** | 委托他人 | 排除/放弃 |

将所有任务放进这四个象限，轻重缓急便一目了然。

### 从今天开始实践

1. 决定明天要做的3件重要事情
2. 把最困难的事情放在第一位去做
3. 即使不完美，也要坚持把事情“做完”`
      }
    ]
  }
};

// ─── 디자인 및 카테고리 메타 데이터 ──────────────────────────────────
const CATEGORIES_META = [
  { id: 'all', icon: '📋' },
  { id: 'stress', icon: '💆' },
  { id: 'study', icon: '📚' },
  { id: 'relation', icon: '🤝' },
  { id: 'career', icon: '💼' },
  { id: 'mindfulness', icon: '🧘' },
];

const ARTICLES_META = [
  { id: 1, category: 'stress', readTime: '5분', emoji: '🔋', color: '#4F8EF7' },
  { id: 2, category: 'study', readTime: '7분', emoji: '📝', color: '#6c63ff' },
  { id: 3, category: 'relation', readTime: '6분', emoji: '🤲', color: '#20c997' },
  { id: 4, category: 'career', readTime: '8분', emoji: '🌱', color: '#fd7e14' },
  { id: 5, category: 'mindfulness', readTime: '4분', emoji: '🧘', color: '#e83e8c' },
  { id: 6, category: 'stress', readTime: '6분', emoji: '⏱️', color: '#4F8EF7' },
];

export default function ResourcesPage() {
  const router = useRouter();
  const { lang } = useLangStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);



  const t = i18n[lang] || i18n.ko;

  // 번역 데이터와 메타 데이터 결합
  const categories = CATEGORIES_META.map(c => ({
    ...c,
    label: t.categories[c.id] || c.id
  }));

  const articles = ARTICLES_META.map((meta, i) => {
    const data = t.articles[i];
    return {
      ...meta,
      title: data?.title || '',
      desc: data?.desc || '',
      tags: data?.tags || [],
      content: data?.content || '',
      readTime: lang === 'ko' ? meta.readTime : lang === 'ja' ? `${meta.readTime.replace('분', '分')}` : lang === 'zh' ? `${meta.readTime.replace('분', '分钟')}` : `${meta.readTime.replace('분', 'm')}`,
    };
  });

  const filtered = activeCategory === 'all' ? articles : articles.filter(a => a.category === activeCategory);

  if (selectedArticle) {
    // 상세 페이지에서 실시간 번역 적용을 위해 selectedArticle 매핑 데이터 갱신
    const currentArticle = articles.find(a => a.id === selectedArticle.id) || selectedArticle;

    return (
      <div>
        {/* 아티클 히어로 */}
        <div style={{ background: `linear-gradient(135deg, ${currentArticle.color} 0%, ${currentArticle.color}99 100%)`, padding: '36px 28px', color: 'white' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.2)', borderRadius: 20, padding: '4px 14px', fontSize: 13, marginBottom: 14, cursor: 'pointer' }} onClick={() => setSelectedArticle(null)}>
              {t.list_btn}
            </div>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>{currentArticle.emoji}</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{currentArticle.title}</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <span style={{ background: 'rgba(255,255,255,.2)', padding: '3px 12px', borderRadius: 20, fontSize: '.78rem' }}>
                {t.read_time.replace('{time}', currentArticle.readTime)}
              </span>
              {currentArticle.tags.map((tag: string) => (
                <span key={tag} style={{ background: 'rgba(255,255,255,.15)', padding: '3px 12px', borderRadius: 20, fontSize: '.78rem' }}>#{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px' }}>
          <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ fontSize: '.95rem', lineHeight: 1.9, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
              {currentArticle.content.split('\n').map((line: string, i: number) => {
                if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 12px', color: currentArticle.color }}>{line.slice(3)}</h2>;
                if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: '1rem', fontWeight: 700, margin: '20px 0 10px', color: 'var(--text-primary)' }}>{line.slice(4)}</h3>;
                if (line.startsWith('**') && line.endsWith('**')) return <p key={i} style={{ fontWeight: 700, marginBottom: 6 }}>{line.slice(2, -2)}</p>;
                if (line.startsWith('- ')) return <li key={i} style={{ marginLeft: 20, marginBottom: 4, color: 'var(--text-secondary)' }}>{line.slice(2)}</li>;
                if (line === '') return <br key={i} />;
                return <p key={i} style={{ marginBottom: 6 }}>{line}</p>;
              })}
            </div>
          </div>

          {/* 하단 액션 */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button onClick={() => setSelectedArticle(null)} className="btn btn-glass">
              {t.list_btn}
            </button>
            <button onClick={() => router.push('/dashboard/counsel')} className="btn btn-sunset btn-full">
              {t.counsel_btn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 히어로 */}
      <div style={{ background: 'var(--grad-sunset)', padding: '36px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(1px)' }} />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,.2)', borderRadius: 20, padding: '4px 14px', fontSize: 13, marginBottom: 12, color: 'white' }}>
            {t.hero_tag}
          </div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 700, marginBottom: 8, color: 'white' }}>{t.hero_title}</h2>
          <p style={{ opacity: .88, fontSize: '.9rem', color: 'white' }}>{t.hero_sub}</p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px' }}>
        {/* 카테고리 탭 */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
              padding: '8px 18px', borderRadius: 50, fontSize: '.85rem', cursor: 'pointer',
              border: `1.5px solid ${activeCategory === cat.id ? 'var(--sunset-pink)' : 'var(--glass-border)'}`,
              background: activeCategory === cat.id ? 'rgba(255,45,120,0.12)' : 'var(--glass-bg)',
              color: activeCategory === cat.id ? 'var(--sunset-pink)' : 'var(--text-secondary)',
              fontWeight: activeCategory === cat.id ? 700 : 400, transition: 'all .15s',
              backdropFilter: 'blur(8px)',
            }}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* 아티클 그리드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {filtered.map(article => (
            <div key={article.id} onClick={() => setSelectedArticle(article)}
              className="glass-card"
              style={{ padding: '24px 22px', cursor: 'pointer' }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = article.color; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)'; (e.currentTarget as HTMLElement).style.transform = ''; }}>
              <div style={{ fontSize: '2.2rem', marginBottom: 14 }}>{article.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8, lineHeight: 1.4, color: 'var(--text-primary)' }}>{article.title}</div>
              <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {article.desc}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {article.tags.map((tag: string) => (
                    <span key={tag} style={{ background: `${article.color}18`, color: article.color, padding: '2px 8px', borderRadius: 20, fontSize: '.72rem', fontWeight: 600 }}>#{tag}</span>
                  ))}
                </div>
                <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                  {t.read_time.replace('{time}', article.readTime)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
