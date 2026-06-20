'use client';
import { useEffect, useState } from 'react';
import { useLangStore } from '@/store/langStore';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://studentcare-production.up.railway.app/api/v1';

// ─── 다국어 사전 ───────────────────────────────────────────────────
const i18n: Record<string, Record<string, any>> = {
  ko: {
    page_title: '🧩 CBT 자기성찰',
    page_sub: '인지행동치료(CBT) 기반의 셀프 케어 도구',
    tab_distortion: '🧩 인지 왜곡 체크',
    tab_reflection: '📝 자기성찰 일지',
    tab_coping: '🛡️ 코핑 카드',
    dist_hint: '오늘 경험한 인지왜곡 패턴을 클릭해보세요.',
    dist_found: (n: number) => `오늘 ${n}가지 인지왜곡 패턴을 발견했어요.${n >= 3 ? ' 아래 자기성찰 일지를 작성해보세요.' : ''}`,
    dist_step: '인지왜곡 패턴을 인식하는 것 자체가 치료의 첫 걸음입니다 💜',
    reflect_title: '📝 오늘의 자기성찰',
    reflect_fields: [
      { key: 'situation', label: '어떤 상황이었나요?', placeholder: '구체적인 상황을 적어주세요.' },
      { key: 'automatic_thought', label: '그 때 어떤 생각이 들었나요?', placeholder: '자동적으로 떠오른 생각을 적어주세요.' },
      { key: 'evidence_for', label: '그 생각이 사실이라는 증거는?', placeholder: '생각을 지지하는 증거를 적어주세요.' },
      { key: 'evidence_against', label: '그 생각이 사실이 아니라는 증거는?', placeholder: '생각에 반하는 증거를 적어주세요.' },
      { key: 'balanced_thought', label: '좀 더 균형잡힌 생각은?', placeholder: '균형잡힌 관점으로 다시 생각해보세요.' },
    ],
    emotion_before: '감정 변화: 이전',
    emotion_after: '감정 변화: 이후',
    save: '💾 저장하기',
    saving: '저장 중...',
    saved_reflection: '성찰 일지가 저장되었습니다!',
    past_records: '지난 기록',
    loading: '불러오는 중...',
    no_records: '아직 작성된 기록이 없어요.',
    coping_hint: '나만의 대처 전략 카드를 만들어보세요.',
    coping_create: '+ 카드 만들기',
    coping_empty: '아직 코핑 카드가 없어요. 첫 카드를 만들어보세요!',
    coping_fav_add: '즐겨찾기',
    coping_fav_remove: '즐겨찾기 해제',
    coping_delete: '삭제',
    coping_delete_confirm: '이 카드를 삭제할까요?',
    coping_saved: '코핑 카드가 추가되었습니다!',
    modal_title: '🛡️ 새 코핑 카드',
    modal_title_label: '제목',
    modal_title_placeholder: '예: 4-7-8 호흡법',
    modal_content_label: '내용',
    modal_content_placeholder: '대처 전략을 자세히 적어주세요.',
    modal_category_label: '카테고리',
    modal_cancel: '취소',
    modal_create: '✨ 만들기',
    emotions: [
      { value: 'happy', label: '😊 행복' }, { value: 'sad', label: '😢 슬픔' },
      { value: 'anxious', label: '😰 불안' }, { value: 'angry', label: '😠 분노' },
      { value: 'tired', label: '😴 피곤' }, { value: 'neutral', label: '😐 보통' },
    ],
    coping_categories: ['호흡법', '인지재구성', '행동활성화', '사회적지지', '마음챙김', '기타'],
    distortions: [
      { id: 1, title: '흑백논리', desc: '"모 아니면 도"로 생각하는 패턴' },
      { id: 2, title: '과잉일반화', desc: '"항상", "절대로" 같은 단어를 자주 쓰는 패턴' },
      { id: 3, title: '정신적 필터링', desc: '부정적인 것만 골라서 보는 패턴' },
      { id: 4, title: '긍정 무시', desc: '좋은 일을 "운이었을 뿐"이라고 치부하는 패턴' },
      { id: 5, title: '성급한 결론', desc: '충분한 근거 없이 나쁜 결론을 내리는 패턴' },
      { id: 6, title: '확대/축소', desc: '실수는 크게, 성공은 작게 평가하는 패턴' },
      { id: 7, title: '감정적 추론', desc: '"이렇게 느끼니까 사실일 것이다"라고 생각하는 패턴' },
      { id: 8, title: '~해야 한다', desc: '자신에게 엄격한 규칙을 적용하는 패턴' },
      { id: 9, title: '딱지 붙이기', desc: '"나는 패배자야" 같이 자신을 정의하는 패턴' },
      { id: 10, title: '개인화', desc: '모든 나쁜 일이 자신의 탓이라고 생각하는 패턴' },
    ],
    date_locale: 'ko-KR',
  },
  en: {
    page_title: '🧩 CBT Self-Reflection',
    page_sub: 'A self-care tool based on Cognitive Behavioral Therapy (CBT)',
    tab_distortion: '🧩 Cognitive Distortion Check',
    tab_reflection: '📝 Reflection Journal',
    tab_coping: '🛡️ Coping Cards',
    dist_hint: 'Click on cognitive distortion patterns you experienced today.',
    dist_found: (n: number) => `You found ${n} cognitive distortion pattern(s) today.${n >= 3 ? ' Try writing a reflection journal below.' : ''}`,
    dist_step: 'Recognizing cognitive distortions is the first step to healing 💜',
    reflect_title: '📝 Today\'s Self-Reflection',
    reflect_fields: [
      { key: 'situation', label: 'What was the situation?', placeholder: 'Describe the specific situation.' },
      { key: 'automatic_thought', label: 'What thought came to mind?', placeholder: 'Write the automatic thought that arose.' },
      { key: 'evidence_for', label: 'Evidence that the thought is true?', placeholder: 'Write evidence supporting the thought.' },
      { key: 'evidence_against', label: 'Evidence that the thought is NOT true?', placeholder: 'Write evidence against the thought.' },
      { key: 'balanced_thought', label: 'A more balanced thought?', placeholder: 'Rethink from a more balanced perspective.' },
    ],
    emotion_before: 'Emotion: Before',
    emotion_after: 'Emotion: After',
    save: '💾 Save',
    saving: 'Saving...',
    saved_reflection: 'Reflection journal saved!',
    past_records: 'Past Records',
    loading: 'Loading...',
    no_records: 'No records yet.',
    coping_hint: 'Create your own personal coping strategy cards.',
    coping_create: '+ Create Card',
    coping_empty: 'No coping cards yet. Create your first one!',
    coping_fav_add: 'Add to Favorites',
    coping_fav_remove: 'Remove from Favorites',
    coping_delete: 'Delete',
    coping_delete_confirm: 'Delete this coping card?',
    coping_saved: 'Coping card added!',
    modal_title: '🛡️ New Coping Card',
    modal_title_label: 'Title',
    modal_title_placeholder: 'e.g. 4-7-8 Breathing',
    modal_content_label: 'Content',
    modal_content_placeholder: 'Describe your coping strategy in detail.',
    modal_category_label: 'Category',
    modal_cancel: 'Cancel',
    modal_create: '✨ Create',
    emotions: [
      { value: 'happy', label: '😊 Happy' }, { value: 'sad', label: '😢 Sad' },
      { value: 'anxious', label: '😰 Anxious' }, { value: 'angry', label: '😠 Angry' },
      { value: 'tired', label: '😴 Tired' }, { value: 'neutral', label: '😐 Neutral' },
    ],
    coping_categories: ['Breathing', 'Cognitive Restructuring', 'Behavioral Activation', 'Social Support', 'Mindfulness', 'Other'],
    distortions: [
      { id: 1, title: 'All-or-Nothing Thinking', desc: 'Thinking in black and white terms, no middle ground.' },
      { id: 2, title: 'Overgeneralization', desc: 'Using words like "always" or "never".' },
      { id: 3, title: 'Mental Filter', desc: 'Focusing only on negative details.' },
      { id: 4, title: 'Disqualifying the Positive', desc: 'Dismissing good things as "just luck".' },
      { id: 5, title: 'Jumping to Conclusions', desc: 'Drawing negative conclusions without enough evidence.' },
      { id: 6, title: 'Magnification/Minimization', desc: 'Exaggerating mistakes, minimizing successes.' },
      { id: 7, title: 'Emotional Reasoning', desc: 'Assuming something is true because it feels true.' },
      { id: 8, title: 'Should Statements', desc: 'Applying rigid rules to yourself.' },
      { id: 9, title: 'Labeling', desc: 'Defining yourself with labels like "I\'m a failure".' },
      { id: 10, title: 'Personalization', desc: 'Blaming yourself for everything that goes wrong.' },
    ],
    date_locale: 'en-US',
  },
  ja: {
    page_title: '🧩 CBT 自己省察',
    page_sub: '認知行動療法（CBT）に基づくセルフケアツール',
    tab_distortion: '🧩 認知の歪みチェック',
    tab_reflection: '📝 自己省察日誌',
    tab_coping: '🛡️ コーピングカード',
    dist_hint: '今日経験した認知の歪みパターンをクリックしてみましょう。',
    dist_found: (n: number) => `今日${n}つの認知の歪みパターンを発見しました。${n >= 3 ? ' 以下の自己省察日誌を書いてみましょう。' : ''}`,
    dist_step: '認知の歪みパターンに気づくこと自体が治療の第一歩です 💜',
    reflect_title: '📝 今日の自己省察',
    reflect_fields: [
      { key: 'situation', label: 'どんな状況でしたか？', placeholder: '具体的な状況を書いてください。' },
      { key: 'automatic_thought', label: 'そのとき何を思いましたか？', placeholder: '自動的に浮かんだ考えを書いてください。' },
      { key: 'evidence_for', label: 'その考えが事実という証拠は？', placeholder: '考えを支持する証拠を書いてください。' },
      { key: 'evidence_against', label: 'その考えが事実でないという証拠は？', placeholder: '考えに反する証拠を書いてください。' },
      { key: 'balanced_thought', label: 'もっとバランスの取れた考えは？', placeholder: 'バランスの取れた視点で考え直してみましょう。' },
    ],
    emotion_before: '感情の変化: 前',
    emotion_after: '感情の変化: 後',
    save: '💾 保存する',
    saving: '保存中...',
    saved_reflection: '省察日誌が保存されました！',
    past_records: '過去の記録',
    loading: '読み込み中...',
    no_records: 'まだ記録がありません。',
    coping_hint: '自分だけの対処戦略カードを作ってみましょう。',
    coping_create: '+ カードを作る',
    coping_empty: 'まだコーピングカードがありません。最初のカードを作りましょう！',
    coping_fav_add: 'お気に入りに追加',
    coping_fav_remove: 'お気に入りから削除',
    coping_delete: '削除',
    coping_delete_confirm: 'このカードを削除しますか？',
    coping_saved: 'コーピングカードが追加されました！',
    modal_title: '🛡️ 新しいコーピングカード',
    modal_title_label: 'タイトル',
    modal_title_placeholder: '例：4-7-8呼吸法',
    modal_content_label: '内容',
    modal_content_placeholder: '対処戦略を詳しく書いてください。',
    modal_category_label: 'カテゴリ',
    modal_cancel: 'キャンセル',
    modal_create: '✨ 作成',
    emotions: [
      { value: 'happy', label: '😊 嬉しい' }, { value: 'sad', label: '😢 悲しい' },
      { value: 'anxious', label: '😰 不安' }, { value: 'angry', label: '😠 怒り' },
      { value: 'tired', label: '😴 疲れた' }, { value: 'neutral', label: '😐 普通' },
    ],
    coping_categories: ['呼吸法', '認知再構成', '行動活性化', '社会的サポート', 'マインドフルネス', 'その他'],
    distortions: [
      { id: 1, title: '二分法思考', desc: '「白か黒か」で考えるパターン' },
      { id: 2, title: '過度の一般化', desc: '「いつも」「絶対に」という言葉を多用するパターン' },
      { id: 3, title: 'こころの読み取り', desc: '否定的なことだけを取り上げるパターン' },
      { id: 4, title: 'ポジティブの否定', desc: '良いことを「ただの運」と片付けるパターン' },
      { id: 5, title: '早まった結論', desc: '十分な根拠なく悪い結論を出すパターン' },
      { id: 6, title: '拡大解釈/過小評価', desc: '失敗を大きく、成功を小さく評価するパターン' },
      { id: 7, title: '感情的な決めつけ', desc: '「こう感じるから事実だ」と思うパターン' },
      { id: 8, title: '～すべき思考', desc: '自分に厳しいルールを適用するパターン' },
      { id: 9, title: 'レッテル貼り', desc: '「私はダメ人間だ」のように自己定義するパターン' },
      { id: 10, title: '個人化', desc: 'すべての悪いことが自分のせいだと思うパターン' },
    ],
    date_locale: 'ja-JP',
  },
  zh: {
    page_title: '🧩 CBT 自我反思',
    page_sub: '基于认知行为疗法（CBT）的自我护理工具',
    tab_distortion: '🧩 认知扭曲检查',
    tab_reflection: '📝 自我反思日志',
    tab_coping: '🛡️ 应对卡片',
    dist_hint: '点击你今天经历过的认知扭曲模式。',
    dist_found: (n: number) => `你今天发现了${n}种认知扭曲模式。${n >= 3 ? ' 请在下方填写自我反思日志。' : ''}`,
    dist_step: '能够识别认知扭曲本身就是治疗的第一步 💜',
    reflect_title: '📝 今天的自我反思',
    reflect_fields: [
      { key: 'situation', label: '是什么情况？', placeholder: '请描述具体情况。' },
      { key: 'automatic_thought', label: '当时有什么想法？', placeholder: '请写下自动浮现的想法。' },
      { key: 'evidence_for', label: '支持该想法的证据？', placeholder: '请写下支持该想法的证据。' },
      { key: 'evidence_against', label: '反驳该想法的证据？', placeholder: '请写下反驳该想法的证据。' },
      { key: 'balanced_thought', label: '更平衡的想法是？', placeholder: '请从更平衡的角度重新思考。' },
    ],
    emotion_before: '情绪变化：之前',
    emotion_after: '情绪变化：之后',
    save: '💾 保存',
    saving: '保存中...',
    saved_reflection: '反思日志已保存！',
    past_records: '历史记录',
    loading: '加载中...',
    no_records: '暂无记录。',
    coping_hint: '创建你自己的应对策略卡片。',
    coping_create: '+ 创建卡片',
    coping_empty: '还没有应对卡片，创建第一张吧！',
    coping_fav_add: '收藏',
    coping_fav_remove: '取消收藏',
    coping_delete: '删除',
    coping_delete_confirm: '要删除这张卡片吗？',
    coping_saved: '应对卡片已添加！',
    modal_title: '🛡️ 新建应对卡片',
    modal_title_label: '标题',
    modal_title_placeholder: '例：4-7-8呼吸法',
    modal_content_label: '内容',
    modal_content_placeholder: '请详细描述应对策略。',
    modal_category_label: '类别',
    modal_cancel: '取消',
    modal_create: '✨ 创建',
    emotions: [
      { value: 'happy', label: '😊 开心' }, { value: 'sad', label: '😢 悲伤' },
      { value: 'anxious', label: '😰 焦虑' }, { value: 'angry', label: '😠 生气' },
      { value: 'tired', label: '😴 疲惫' }, { value: 'neutral', label: '😐 一般' },
    ],
    coping_categories: ['呼吸法', '认知重构', '行为激活', '社会支持', '正念', '其他'],
    distortions: [
      { id: 1, title: '非此即彼思维', desc: '用"全或无"的方式思考的模式' },
      { id: 2, title: '过度概括', desc: '频繁使用"总是"、"从不"等词语的模式' },
      { id: 3, title: '心理过滤', desc: '只关注负面细节的模式' },
      { id: 4, title: '否定积极面', desc: '将好事归结为"只是运气"的模式' },
      { id: 5, title: '仓促下结论', desc: '在没有足够证据的情况下得出负面结论的模式' },
      { id: 6, title: '放大/缩小', desc: '放大失误、缩小成功的模式' },
      { id: 7, title: '情绪化推理', desc: '"因为我有这种感觉，所以一定是真的"的模式' },
      { id: 8, title: '"应该"陈述', desc: '对自己施加严格规则的模式' },
      { id: 9, title: '贴标签', desc: '用"我是个失败者"等方式定义自己的模式' },
      { id: 10, title: '个人化', desc: '认为所有坏事都是自己的错的模式' },
    ],
    date_locale: 'zh-CN',
  },
};

const COPING_COLORS: Record<string, string> = {
  '호흡법': '#60a5fa', '인지재구성': '#a78bfa', '행동활성화': '#34d399',
  '사회적지지': '#fbbf24', '마음챙김': '#f87171', '기타': '#94a3b8',
  'Breathing': '#60a5fa', 'Cognitive Restructuring': '#a78bfa', 'Behavioral Activation': '#34d399',
  'Social Support': '#fbbf24', 'Mindfulness': '#f87171', 'Other': '#94a3b8',
  '呼吸法': '#60a5fa', '認知再構成': '#a78bfa', '行動活性化': '#34d399',
  '社会的サポート': '#fbbf24', 'マインドフルネス': '#f87171', 'その他': '#94a3b8',
  '认知重构': '#a78bfa', '行为激活': '#34d399', '社会支持': '#fbbf24', '正念': '#f87171', '其他': '#94a3b8',
};
const getCopingColor = (cat: string) => COPING_COLORS[cat] ?? '#94a3b8';

const TAB_STYLES = (active: boolean): React.CSSProperties => ({
  padding: '10px 20px',
  borderRadius: 'var(--radius-full)',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.875rem',
  transition: 'all 0.2s',
  background: active ? 'linear-gradient(135deg, #9333ea, #6d28d9)' : 'var(--glass-bg)',
  color: active ? '#fff' : 'var(--text-muted)',
  boxShadow: active ? '0 4px 15px rgba(147,51,234,0.4)' : 'none',
});

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: 'var(--success-bg)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 'var(--radius-full)', padding: '12px 24px', color: 'var(--success)', fontWeight: 600, fontSize: '0.875rem', zIndex: 9999, boxShadow: 'var(--glass-shadow)' }}>
      ✅ {msg}
    </div>
  );
}

function GlassCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)', padding: '24px', backdropFilter: 'blur(24px)', boxShadow: 'var(--glass-shadow)', ...style }}>
      {children}
    </div>
  );
}

// ── 인지왜곡 탭 ───────────────────────────────────────────────
function DistortionTab({ t }: { t: Record<string, any> }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const toggle = (id: number) => {
    setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };
  const count = selected.size;

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 20 }}>{t.dist_hint}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 24 }}>
        {t.distortions.map((d: any) => {
          const isSelected = selected.has(d.id);
          return (
            <div key={d.id} onClick={() => toggle(d.id)} style={{ padding: '16px 18px', borderRadius: 'var(--radius-lg)', border: `1px solid ${isSelected ? 'rgba(251,191,36,0.5)' : 'var(--glass-border)'}`, background: isSelected ? 'rgba(251,191,36,0.08)' : 'var(--glass-bg)', cursor: 'pointer', transition: 'all 0.2s', boxShadow: isSelected ? '0 0 20px rgba(251,191,36,0.15)' : 'none', transform: isSelected ? 'scale(1.02)' : 'scale(1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: '1.1rem', opacity: isSelected ? 1 : 0.4 }}>{isSelected ? '⚠️' : '○'}</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? 'var(--warning)' : 'var(--text-primary)' }}>{d.title}</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{d.desc}</p>
            </div>
          );
        })}
      </div>
      {count > 0 && (
        <GlassCard style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <p style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '0.9rem' }}>{t.dist_found(count)}</p>
          {count >= 3 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>{t.dist_step}</p>}
        </GlassCard>
      )}
    </div>
  );
}

// ── 자기성찰 일지 탭 ───────────────────────────────────────────
function ReflectionTab({ t }: { t: Record<string, any> }) {
  const [form, setForm] = useState({ situation: '', automatic_thought: '', evidence_for: '', evidence_against: '', balanced_thought: '', emotion_before: 'anxious', emotion_after: 'neutral' });
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/cbt/records`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setRecords(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/cbt/records`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      if (res.ok) {
        setToast(t.saved_reflection);
        setForm({ situation: '', automatic_thought: '', evidence_for: '', evidence_against: '', balanced_thought: '', emotion_before: 'anxious', emotion_after: 'neutral' });
        fetchRecords();
      }
    } catch {}
    setSubmitting(false);
  };

  return (
    <div>
      {toast && <Toast msg={toast} onClose={() => setToast('')} />}
      <GlassCard style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20, color: 'var(--text-primary)' }}>{t.reflect_title}</h3>
        <form onSubmit={handleSubmit}>
          {t.reflect_fields.map((f: any) => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{f.label}</label>
              <textarea value={(form as any)[f.key]} onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} rows={3} style={{ width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '12px 14px', color: 'var(--text-primary)', fontSize: '0.875rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {[{ key: 'emotion_before', label: t.emotion_before }, { key: 'emotion_after', label: t.emotion_after }].map(({ key, label }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</label>
                <select value={(form as any)[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} style={{ width: '100%', background: 'var(--bg-layer2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}>
                  {t.emotions.map((em: any) => <option key={em.value} value={em.value}>{em.label}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button type="submit" disabled={submitting || !form.situation} style={{ padding: '12px 28px', borderRadius: 'var(--radius-full)', border: 'none', background: 'linear-gradient(135deg, #9333ea, #6d28d9)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: submitting || !form.situation ? 'not-allowed' : 'pointer', opacity: submitting || !form.situation ? 0.6 : 1, boxShadow: '0 4px 15px rgba(147,51,234,0.4)' }}>
            {submitting ? t.saving : t.save}
          </button>
        </form>
      </GlassCard>
      <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{t.past_records}</h3>
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>{t.loading}</div>
      ) : records.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: 24 }}>{t.no_records}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {records.map((r: any) => (
            <GlassCard key={r.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(r.created_at).toLocaleDateString(t.date_locale)}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                    {t.emotions.find((e: any) => e.value === r.emotion_before)?.label} → {t.emotions.find((e: any) => e.value === r.emotion_after)?.label}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{r.situation}</p>
              {r.balanced_thought && <p style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: 8, fontStyle: 'italic' }}>💡 {r.balanced_thought}</p>}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 코핑 카드 탭 ──────────────────────────────────────────────
function CopingTab({ t }: { t: Record<string, any> }) {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    setForm((prev) => ({ ...prev, category: t.coping_categories[0] ?? '' }));
  }, [t]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/cbt/coping-cards`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setCards(data.sort((a: any, b: any) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0)));
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchCards(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/cbt/coping-cards`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      if (res.ok) { setToast(t.coping_saved); setShowModal(false); setForm({ title: '', content: '', category: t.coping_categories[0] ?? '' }); fetchCards(); }
    } catch {}
    setSubmitting(false);
  };

  const toggleFavorite = async (id: string, current: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API}/cbt/coping-cards/${id}/favorite`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ is_favorite: !current }) });
      fetchCards();
    } catch {}
  };

  const deleteCard = async (id: string) => {
    if (!confirm(t.coping_delete_confirm)) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API}/cbt/coping-cards/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchCards();
    } catch {}
  };

  return (
    <div>
      {toast && <Toast msg={toast} onClose={() => setToast('')} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t.coping_hint}</p>
        <button onClick={() => setShowModal(true)} style={{ padding: '10px 20px', borderRadius: 'var(--radius-full)', border: 'none', background: 'linear-gradient(135deg, #9333ea, #6d28d9)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(147,51,234,0.4)' }}>
          {t.coping_create}
        </button>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>{t.loading}</div>
      ) : cards.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🛡️</div>
          <p>{t.coping_empty}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {cards.map((card: any) => (
            <GlassCard key={card.id} style={{ position: 'relative', border: card.is_favorite ? '1px solid rgba(251,191,36,0.4)' : '1px solid var(--glass-border)', background: card.is_favorite ? 'rgba(251,191,36,0.04)' : 'var(--glass-bg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, background: `${getCopingColor(card.category)}20`, color: getCopingColor(card.category), border: `1px solid ${getCopingColor(card.category)}40` }}>
                  {card.category}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => toggleFavorite(card.id, card.is_favorite)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: 0 }} title={card.is_favorite ? t.coping_fav_remove : t.coping_fav_add}>
                    {card.is_favorite ? '⭐' : '☆'}
                  </button>
                  <button onClick={() => deleteCard(card.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: 0, opacity: 0.5 }} title={t.coping_delete}>🗑️</button>
                </div>
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 8 }}>{card.title}</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{card.content}</p>
            </GlassCard>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ width: '100%', maxWidth: 480, background: 'var(--bg-layer2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-2xl)', padding: 32, boxShadow: 'var(--glass-shadow)' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 24 }}>{t.modal_title}</h3>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{t.modal_title_label}</label>
                <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder={t.modal_title_placeholder} required style={{ width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '12px 14px', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{t.modal_content_label}</label>
                <textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} placeholder={t.modal_content_placeholder} rows={4} required style={{ width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '12px 14px', color: 'var(--text-primary)', fontSize: '0.875rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{t.modal_category_label}</label>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} style={{ width: '100%', background: 'var(--bg-layer2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '12px 14px', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}>
                  {t.coping_categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}>{t.modal_cancel}</button>
                <button type="submit" disabled={submitting} style={{ flex: 2, padding: '12px', borderRadius: 'var(--radius-full)', border: 'none', background: 'linear-gradient(135deg, #9333ea, #6d28d9)', color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1, boxShadow: '0 4px 15px rgba(147,51,234,0.4)' }}>
                  {submitting ? t.saving : t.modal_create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 메인 CBT 페이지 ───────────────────────────────────────────
export default function CBTPage() {
  const { lang } = useLangStore();
  const t = i18n[lang] || i18n.ko;
  const [tab, setTab] = useState<'distortion' | 'reflection' | 'coping'>('distortion');

  const tabs = [
    { key: 'distortion' as const, label: t.tab_distortion },
    { key: 'reflection' as const, label: t.tab_reflection },
    { key: 'coping' as const, label: t.tab_coping },
  ];

  return (
    <div className="page-content" style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg, #9333ea, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 6 }}>
          {t.page_title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.page_sub}</p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {tabs.map((tb) => (
          <button key={tb.key} onClick={() => setTab(tb.key)} style={TAB_STYLES(tab === tb.key)}>{tb.label}</button>
        ))}
      </div>
      <GlassCard>
        {tab === 'distortion' && <DistortionTab t={t} />}
        {tab === 'reflection' && <ReflectionTab t={t} />}
        {tab === 'coping' && <CopingTab t={t} />}
      </GlassCard>
    </div>
  );
}
