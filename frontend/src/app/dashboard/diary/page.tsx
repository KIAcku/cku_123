'use client';
import { useState, useEffect, useMemo } from 'react';
import { useLangStore } from '@/store/langStore';
import { API_BASE } from '@/lib/apiClient';

const i18n: Record<string, any> = {
  ko: {
    hero_title: '📔 감정 일기', hero_sub: '오늘의 감정을 솔직하게 기록하고 마음을 돌봐보세요.',
    tab_write: '✏️ 오늘 일기 쓰기', tab_list: '📋 내 일기 목록 ({count})', tab_calendar: '📅 감정 캘린더',
    write_title: '오늘의 감정 기록', question_feel: '지금 기분은 어때요?',
    feel_happy: '행복해요', feel_sad: '슬퍼요', feel_angry: '화가나요', feel_anxious: '불안해요', feel_neutral: '보통이에요', feel_tired: '피곤해요',
    emotion_intensity: '감정 강도', intensity_weak: '아주 약함', intensity_normal: '보통', intensity_strong: '매우 강함',
    content_label: '오늘 있었던 일을 자유롭게 적어보세요', placeholder_text: '오늘 어떤 일이 있었나요? 생각과 감정을 솔직하게 써보세요...',
    char_count: '{count}자', save_btn: '📔 일기 저장하기', saving: '저장 중...', empty_fetching: '불러오는 중...',
    empty_title: '아직 작성된 일기가 없어요', empty_btn: '첫 일기 쓰기', date_group_format: 'ko-KR',
    intensity_badge: '강도 {score}/5', edited_badge: '수정됨', delete_confirm: '일기를 삭제할까요?',
    edit_modal_title: '일기 수정', cancel: '취소', save: '저장',
    month_emotions_title: '이번 달 주요 감정', times: '{count}회',
    cal_weeks: ['일','월','화','수','목','금','토'], cal_title: '{year}년 {month}월',
    weekly_insight: '📊 이번 주 인사이트', most_emotion: '가장 많은 감정', avg_intensity: '평균 강도', vs_last_week: '지난 주 대비',
    streak_days: '{n}일 연속 기록 중 🔥', streak_1: '오늘 기록 완료 ✅',
    filter_all: '전체', prompt_title: '글쓰기 도우미', trend_title: '최근 14일 감정 흐름', no_trend: '일기를 더 작성하면 그래프가 나타나요',
  },
  en: {
    hero_title: '📔 Emotion Diary', hero_sub: 'Honestly record your emotions today.',
    tab_write: "✏️ Write Today's Diary", tab_list: '📋 My Diaries ({count})', tab_calendar: '📅 Emotion Calendar',
    write_title: "Today's Emotion Record", question_feel: 'How do you feel right now?',
    feel_happy: 'Happy', feel_sad: 'Sad', feel_angry: 'Angry', feel_anxious: 'Anxious', feel_neutral: 'Neutral', feel_tired: 'Tired',
    emotion_intensity: 'Emotion Intensity', intensity_weak: 'Very Weak', intensity_normal: 'Normal', intensity_strong: 'Very Strong',
    content_label: 'Write freely about today', placeholder_text: 'What happened today?',
    char_count: '{count} chars', save_btn: '📔 Save Diary', saving: 'Saving...', empty_fetching: 'Loading...',
    empty_title: 'No diaries yet.', empty_btn: 'Write First Diary', date_group_format: 'en-US',
    intensity_badge: 'Intensity {score}/5', edited_badge: 'Edited', delete_confirm: 'Delete this diary?',
    edit_modal_title: 'Edit Diary', cancel: 'Cancel', save: 'Save',
    month_emotions_title: 'Top Emotions', times: '{count} times',
    cal_weeks: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], cal_title: '{month}/{year}',
    weekly_insight: '📊 Weekly Insight', most_emotion: 'Top Emotion', avg_intensity: 'Avg Intensity', vs_last_week: 'vs Last Week',
    streak_days: '{n}-day streak 🔥', streak_1: "Today's entry done ✅",
    filter_all: 'All', prompt_title: 'Writing Prompts', trend_title: 'Last 14 Days Trend', no_trend: 'Write more diaries to see chart',
  },
  ja: {
    hero_title: '📔 感情日記', hero_sub: '今日の感情を記録しましょう。',
    tab_write: '✏️ 今日の日記を書く', tab_list: '📋 日記リスト ({count})', tab_calendar: '📅 感情カレンダー',
    write_title: '今日の感情記録', question_feel: '今の気分はどうですか？',
    feel_happy: '幸せ', feel_sad: '悲しい', feel_angry: '怒り', feel_anxious: '不安', feel_neutral: '普通', feel_tired: '疲れた',
    emotion_intensity: '感情の強さ', intensity_weak: 'とても弱い', intensity_normal: '普通', intensity_strong: 'とても強い',
    content_label: '今日を自由に書いてください', placeholder_text: '今日どんなことがありましたか？',
    char_count: '{count}文字', save_btn: '📔 保存する', saving: '保存中...', empty_fetching: '読み込み中...',
    empty_title: 'まだ日記がありません', empty_btn: '最初の日記を書く', date_group_format: 'ja-JP',
    intensity_badge: '強さ {score}/5', edited_badge: '修正済み', delete_confirm: '日記を削除しますか？',
    edit_modal_title: '日記を修正', cancel: 'キャンセル', save: '保存',
    month_emotions_title: '今月の感情', times: '{count}回',
    cal_weeks: ['日','月','火','水','木','金','土'], cal_title: '{year}年{month}月',
    weekly_insight: '📊 今週インサイト', most_emotion: '最多感情', avg_intensity: '平均強度', vs_last_week: '先週比',
    streak_days: '{n}日連続 🔥', streak_1: '今日完了 ✅',
    filter_all: '全て', prompt_title: '書くヒント', trend_title: '直近14日推移', no_trend: '日記を書くとグラフが出ます',
  },
  zh: {
    hero_title: '📔 情绪日记', hero_sub: '真实记录今天的感受。',
    tab_write: '✏️ 写今日日记', tab_list: '📋 我的日记 ({count})', tab_calendar: '📅 情绪日历',
    write_title: '今日情绪记录', question_feel: '你现在的感受如何？',
    feel_happy: '开心', feel_sad: '悲伤', feel_angry: '生气', feel_anxious: '焦虑', feel_neutral: '一般', feel_tired: '疲惫',
    emotion_intensity: '情绪强度', intensity_weak: '非常弱', intensity_normal: '适中', intensity_strong: '非常强',
    content_label: '自由写下今天', placeholder_text: '今天发生了什么？',
    char_count: '{count}字', save_btn: '📔 保存日记', saving: '保存中...', empty_fetching: '加载中...',
    empty_title: '还没有日记', empty_btn: '写第一篇', date_group_format: 'zh-CN',
    intensity_badge: '强度 {score}/5', edited_badge: '已修改', delete_confirm: '要删除这篇日记吗？',
    edit_modal_title: '修改日记', cancel: '取消', save: '保存',
    month_emotions_title: '本月主要情绪', times: '{count}次',
    cal_weeks: ['日','一','二','三','四','五','六'], cal_title: '{year}年{month}月',
    weekly_insight: '📊 本周洞察', most_emotion: '最多情绪', avg_intensity: '平均强度', vs_last_week: '较上周',
    streak_days: '连续{n}天 🔥', streak_1: '今日完成 ✅',
    filter_all: '全部', prompt_title: '写作提示', trend_title: '近14天趋势', no_trend: '多写日记后可查看图表',
  }
};

const PROMPT_QUESTIONS: Record<string, Record<string, string[]>> = {
  ko: {
    happy:   ['오늘 가장 기뻤던 순간은?','그 기분이 든 이유는?','이 행복을 누구와 나누고 싶나요?','오늘 감사한 일 3가지를 써보세요'],
    sad:     ['지금 슬픈 이유를 한 문장으로?','이 슬픔에 이름을 붙인다면?','지금 나에게 필요한 것은?','나를 위로할 수 있는 것은?'],
    angry:   ['무엇이 가장 나를 화나게 했나요?','그 상황에서 내가 원했던 것은?','화를 가라앉힐 방법은?','이 감정 뒤에 숨겨진 상처는?'],
    anxious: ['지금 가장 걱정되는 것은?','이 불안이 현실이 될 확률은?','최악에도 내가 할 수 있는 것은?','지금 당장 작은 행동 하나는?'],
    neutral: ['오늘 하루를 한 단어로?','눈에 띄지 않았지만 좋았던 순간은?','내일 기대되는 것은?','오늘 나에게 잘해준 일은?'],
    tired:   ['어떤 종류의 피곤함인가요?','몸이 지쳤나요, 마음이 지쳤나요?','에너지를 소진시킨 것은?','지금 당장 쉴 수 있는 방법은?'],
  },
  en: {
    happy:   ['Happiest moment today?','What caused this feeling?','Who would you share this with?','3 things to be grateful for?'],
    sad:     ['Describe sadness in one sentence.','Name this sadness?','What do you need now?','What could comfort you?'],
    angry:   ['What made you most angry?','What did you want in that moment?','How to calm down?','What hurt hides behind this anger?'],
    anxious: ['What worries you most?','How likely is this worry?','Even worst case, what can you do?','One small action right now?'],
    neutral: ['Describe today in one word.','A small good thing that happened?','Looking forward to tomorrow?','How did you care for yourself?'],
    tired:   ['What kind of tired?','Body tired or mind tired?','What drained your energy?','How to rest right now?'],
  },
  ja: {
    happy:   ['今日一番嬉しかった瞬間は？','なぜその気持ちになりましたか？','誰かと分かち合いたいですか？','感謝できること3つ？'],
    sad:     ['悲しさを一文で？','この悲しみの名前は？','今必要なものは？','慰めてくれるものは？'],
    angry:   ['最も怒らせたことは？','その時望んでいたことは？','怒りを落ち着かせる方法は？','この感情の裏の傷は？'],
    anxious: ['最も心配なことは？','不安が現実になる確率は？','最悪でもできることは？','今すぐできる小さな一歩は？'],
    neutral: ['今日を一言で？','小さな良かった瞬間は？','明日楽しみなことは？','自分に優しくできたことは？'],
    tired:   ['どんな疲れ？','体？心？','エネルギーを消耗させたものは？','今すぐ休む方法は？'],
  },
  zh: {
    happy:   ['今天最开心的时刻？','是什么让你这样感受？','想和谁分享？','三件感恩的事？'],
    sad:     ['用一句话描述悲伤？','给这份悲伤起个名字？','现在需要什么？','什么能安慰你？'],
    angry:   ['什么最让你生气？','当时你想要什么？','怎么平静下来？','愤怒背后的伤痛？'],
    anxious: ['最担心什么？','担忧成真的可能性？','最坏情况下能做什么？','现在一个小行动？'],
    neutral: ['用一个词描述今天？','小小的美好瞬间？','明天期待什么？','今天为自己做了什么？'],
    tired:   ['哪种疲惫？','身体累还是心累？','什么耗尽了能量？','怎么休息一下？'],
  },
};

const EMOTION_META = [
  { value: 'happy',   emoji: '😊', color: '#F59E0B' },
  { value: 'sad',     emoji: '😢', color: '#3B82F6' },
  { value: 'angry',   emoji: '😠', color: '#EF4444' },
  { value: 'anxious', emoji: '😰', color: '#8B5CF6' },
  { value: 'neutral', emoji: '😐', color: '#6B7280' },
  { value: 'tired',   emoji: '😴', color: '#EC4899' },
];

type Diary = { id: string; content: string; emotion: string; emotion_score: string; created_at: string; updated_at?: string };
type DiaryStats = { total: number; this_month: number; streak_days: number; emotion_distribution: { emotion: string; count: number }[] };

function groupByDate(diaries: Diary[], locale: string) {
  const groups: Record<string, Diary[]> = {};
  diaries.forEach(d => {
    const key = new Date(d.created_at).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(d);
  });
  return groups;
}

/* D1: Mini trend SVG */
function MiniTrendChart({ diaries, noLabel }: { diaries: Diary[]; noLabel: string }) {
  const W = 560, H = 80, P = 12;
  const recent = [...diaries].sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).slice(-14);
  if (recent.length < 2) return <div style={{textAlign:'center',color:'var(--text-muted)',fontSize:'0.78rem',padding:'20px 0'}}>{noLabel}</div>;
  const sc = recent.map(d => Number(d.emotion_score)||3);
  const mn = Math.min(...sc), mx = Math.max(...sc), rng = mx-mn||1;
  const pts = sc.map((s,i) => ({ x: P+(i/(sc.length-1))*(W-P*2), y: H-P-((s-mn)/rng)*(H-P*2) }));
  const poly = pts.map(p => `${p.x},${p.y}`).join(' ');
  const area = `M${pts[0].x},${H-P} `+pts.map(p=>`L${p.x},${p.y}`).join(' ')+` L${pts[pts.length-1].x},${H-P} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:80}}>
      <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa" stopOpacity="0.35"/><stop offset="100%" stopColor="#a78bfa" stopOpacity="0"/></linearGradient></defs>
      <path d={area} fill="url(#tg)"/>
      <polyline points={poly} fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#a78bfa" stroke="var(--bg-layer2)" strokeWidth="1.5"/>)}
    </svg>
  );
}

/* D2: Weekly insight */
function WeeklyInsight({ diaries, t, emotionLabels }: { diaries: Diary[]; t: any; emotionLabels: Record<string,string> }) {
  const now = Date.now();
  const thisW = diaries.filter(d => now - new Date(d.created_at).getTime() < 7*86400000);
  const lastW = diaries.filter(d => { const a=now-new Date(d.created_at).getTime(); return a>=7*86400000&&a<14*86400000; });
  if (!thisW.length) return null;
  const ec: Record<string,number> = {};
  thisW.forEach(d => { ec[d.emotion]=(ec[d.emotion]||0)+1; });
  const top = Object.entries(ec).sort((a,b)=>b[1]-a[1])[0];
  const topM = EMOTION_META.find(e=>e.value===top?.[0]);
  const avgT = thisW.reduce((s,d)=>s+(Number(d.emotion_score)||3),0)/thisW.length;
  const avgL = lastW.length ? lastW.reduce((s,d)=>s+(Number(d.emotion_score)||3),0)/lastW.length : null;
  const diff = avgL!==null ? avgT-avgL : null;
  return (
    <div style={{marginBottom:20}}>
      <div style={{fontSize:'0.78rem',fontWeight:700,color:'var(--text-muted)',marginBottom:10}}>{t.weekly_insight}</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
        <div style={{background:`${topM?.color}15`,border:`1px solid ${topM?.color}40`,borderRadius:12,padding:'12px 14px',textAlign:'center'}}>
          <div style={{fontSize:'0.7rem',color:'var(--text-muted)',marginBottom:4}}>{t.most_emotion}</div>
          <div style={{fontSize:'1.4rem'}}>{topM?.emoji||'😐'}</div>
          <div style={{fontSize:'0.78rem',fontWeight:700,color:topM?.color,marginTop:2}}>{emotionLabels[top?.[0]]||top?.[0]}</div>
          <div style={{fontSize:'0.68rem',color:'var(--text-muted)'}}>{top?.[1]}회</div>
        </div>
        <div style={{background:'var(--glass-bg)',border:'1px solid var(--glass-border)',borderRadius:12,padding:'12px 14px',textAlign:'center'}}>
          <div style={{fontSize:'0.7rem',color:'var(--text-muted)',marginBottom:4}}>{t.avg_intensity}</div>
          <div style={{fontSize:'1.5rem',fontWeight:800,color:'var(--text-primary)'}}>{avgT.toFixed(1)}</div>
          <div style={{fontSize:'0.68rem',color:'var(--text-muted)'}}>/ 5</div>
        </div>
        <div style={{background:'var(--glass-bg)',border:'1px solid var(--glass-border)',borderRadius:12,padding:'12px 14px',textAlign:'center'}}>
          <div style={{fontSize:'0.7rem',color:'var(--text-muted)',marginBottom:4}}>{t.vs_last_week}</div>
          {diff!==null ? (<><div style={{fontSize:'1.4rem',fontWeight:800,color:diff>=0?'#20c997':'#f87171'}}>{diff>=0?'+':''}{diff.toFixed(1)}</div><div style={{fontSize:'0.7rem',color:diff>=0?'#20c997':'#f87171'}}>{diff>=0?'↑':'↓'}</div></>) : <div style={{fontSize:'0.78rem',color:'var(--text-muted)',marginTop:8}}>—</div>}
        </div>
      </div>
    </div>
  );
}

export default function DiaryPage() {
  const { lang } = useLangStore();
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [stats, setStats] = useState<DiaryStats|null>(null);
  const [emotion, setEmotion] = useState('neutral');
  const [score, setScore] = useState(3);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState('');
  const [editTarget, setEditTarget] = useState<Diary|null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'write'|'list'|'calendar'>('write');
  const [calendarData, setCalendarData] = useState<{date:string;emotion:string}[]>([]);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth()+1);
  const [filterEmotion, setFilterEmotion] = useState('all');

  const t = i18n[lang]||i18n.ko;
  const emotions = EMOTION_META.map(e => {
    const lm: Record<string,string> = { happy:t.feel_happy,sad:t.feel_sad,angry:t.feel_angry,anxious:t.feel_anxious,neutral:t.feel_neutral,tired:t.feel_tired };
    return {...e, label: lm[e.value]||e.value };
  });
  const emotionLabels = Object.fromEntries(emotions.map(e=>[e.value,e.label]));
  const token = () => localStorage.getItem('token')||'';
  const hdrs = () => ({ Authorization:`Bearer ${token()}`,'Content-Type':'application/json' });
  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000); };

  const fetchDiaries = async () => {
    setFetching(true);
    try {
      const r = await fetch(`${API_BASE}/diaries`,{headers:{Authorization:`Bearer ${token()}`}});
      if (r.ok) setDiaries(await r.json());
      else if (r.status===401||r.status===403) showToast(lang==='ko'?'세션이 만료되었습니다. 다시 로그인해주세요.':'Session expired. Please log in again.');
      else showToast(lang==='ko'?`일기를 불러오지 못했습니다.(${r.status})`:`Failed to load.(${r.status})`);
    } catch { showToast(lang==='ko'?'네트워크 오류':'Network error'); }
    setFetching(false);
  };
  const fetchStats = async () => {
    try { const r=await fetch(`${API_BASE}/diaries/stats`,{headers:{Authorization:`Bearer ${token()}`}}); if(r.ok) setStats(await r.json()); } catch {}
  };
  useEffect(()=>{ fetchDiaries(); fetchStats(); },[]);

  const fetchCalendar = async (y:number,m:number) => {
    try { const r=await fetch(`${API_BASE}/diaries/calendar?year=${y}&month=${m}`,{headers:{Authorization:`Bearer ${token()}`}}); if(r.ok) setCalendarData(await r.json()); } catch {}
  };
  useEffect(()=>{ if(activeTab==='calendar') fetchCalendar(calYear,calMonth); },[activeTab,calYear,calMonth]);

  const handleSubmit = async () => {
    if(!content.trim()){showToast(lang==='ko'?'내용을 입력해주세요':'Please enter content');return;}
    setLoading(true);
    const r=await fetch(`${API_BASE}/diaries`,{method:'POST',headers:hdrs(),body:JSON.stringify({content,emotion,emotion_score:String(score)})});
    if(r.ok){setContent('');setEmotion('neutral');setScore(3);await fetchDiaries();await fetchStats();showToast(lang==='ko'?'일기가 저장되었습니다 📔':'Diary saved 📔');setActiveTab('list');}
    setLoading(false);
  };
  const handleDelete = async (id:string) => {
    if(!confirm(t.delete_confirm))return;
    await fetch(`${API_BASE}/diaries/${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${token()}`}});
    await fetchDiaries();await fetchStats();showToast(lang==='ko'?'삭제되었습니다':'Deleted');
  };
  const handleUpdate = async () => {
    if(!editTarget)return;setLoading(true);
    await fetch(`${API_BASE}/diaries/${editTarget.id}`,{method:'PUT',headers:hdrs(),body:JSON.stringify({content:editTarget.content,emotion:editTarget.emotion,emotion_score:editTarget.emotion_score})});
    await fetchDiaries();setShowModal(false);setEditTarget(null);showToast(lang==='ko'?'수정되었습니다 ✏️':'Updated ✏️');setLoading(false);
  };

  const filteredDiaries = useMemo(()=>filterEmotion==='all'?diaries:diaries.filter(d=>d.emotion===filterEmotion),[diaries,filterEmotion]);
  const grouped = groupByDate(filteredDiaries, t.date_group_format);
  const selEmo = emotions.find(e=>e.value===emotion);
  const prompts: string[] = ((PROMPT_QUESTIONS[lang]||PROMPT_QUESTIONS.ko)[emotion])||[];

  const emotionEmoji: Record<string,string> = {happy:'😊',sad:'😢',angry:'😠',anxious:'😰',neutral:'😐',tired:'😴',excited:'🤩',grateful:'🥰',lonely:'😔',hopeful:'🌟'};
  const emotionColor: Record<string,string> = {happy:'#fef08a',sad:'#bfdbfe',angry:'#fecaca',anxious:'#fde68a',neutral:'#e5e7eb',tired:'#d1d5db',excited:'#fbcfe8',grateful:'#bbf7d0',lonely:'#c7d2fe',hopeful:'#fed7aa'};

  return (
    <div className="page-content">
      <div className="page-header">
        <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <div><h2 className="page-title">{t.hero_title}</h2><p className="page-subtitle">{t.hero_sub}</p></div>
          {stats&&stats.streak_days>0&&(
            <div style={{marginLeft:'auto',padding:'6px 16px',borderRadius:'var(--radius-full)',background:'linear-gradient(135deg,#f97316,#ef4444)',color:'white',fontWeight:700,fontSize:'0.82rem',boxShadow:'0 2px 12px rgba(249,115,22,0.4)'}}>
              {stats.streak_days===1?t.streak_1:t.streak_days.replace('{n}',String(stats.streak_days))}
            </div>
          )}
        </div>
      </div>

      <div className="tabs-glass" style={{marginBottom:24,maxWidth:600}}>
        <button className={`tab-glass ${activeTab==='write'?'active':''}`} onClick={()=>setActiveTab('write')}>{t.tab_write}</button>
        <button className={`tab-glass ${activeTab==='list'?'active':''}`} onClick={()=>setActiveTab('list')}>{t.tab_list.replace('{count}',String(diaries.length))}</button>
        <button className={`tab-glass ${activeTab==='calendar'?'active':''}`} onClick={()=>setActiveTab('calendar')}>{t.tab_calendar}</button>
      </div>

      {activeTab==='write'&&(
        <div className="glass-card" style={{maxWidth:680,padding:32}}>
          <h3 style={{fontWeight:700,marginBottom:20,color:'var(--text-primary)'}}>{t.write_title}</h3>
          <div className="form-group" style={{marginBottom:20}}>
            <label className="form-label">{t.question_feel}</label>
            <div className="emotion-grid">
              {emotions.map(e=>(
                <button key={e.value} type="button" className={`emotion-btn ${emotion===e.value?'selected':''}`}
                  onClick={()=>setEmotion(e.value)} style={{borderColor:emotion===e.value?e.color:undefined,background:emotion===e.value?`${e.color}15`:undefined}}>
                  <span className="emoji">{e.emoji}</span><span className="label">{e.label}</span>
                </button>
              ))}
            </div>
          </div>

          {prompts.length>0&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:'0.72rem',color:'var(--text-muted)',fontWeight:600,marginBottom:8,letterSpacing:'0.04em',textTransform:'uppercase'}}>{t.prompt_title}</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {prompts.map((q:string,i:number)=>(
                  <button key={i} type="button" onClick={()=>setContent(p=>p?p+'\n\n'+q+'\n':q+'\n')}
                    style={{background:`${selEmo?.color}15`,border:`1px solid ${selEmo?.color}40`,borderRadius:'var(--radius-full)',padding:'5px 12px',fontSize:'0.75rem',color:selEmo?.color||'var(--text-secondary)',cursor:'pointer',fontWeight:600}}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-group" style={{marginBottom:20}}>
            <label className="form-label">{t.emotion_intensity}: <span style={{color:selEmo?.color,fontWeight:700}}>{score} / 5</span></label>
            <input type="range" className="range-slider" min={1} max={5} value={score} onChange={e=>setScore(Number(e.target.value))}/>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.75rem',color:'var(--text-muted)',marginTop:4}}>
              <span>{t.intensity_weak}</span><span>{t.intensity_normal}</span><span>{t.intensity_strong}</span>
            </div>
          </div>

          <div className="form-group" style={{marginBottom:24}}>
            <label className="form-label">{t.content_label}</label>
            <textarea className="form-textarea" rows={6} placeholder={`${selEmo?.emoji||'😐'} ${t.placeholder_text}`}
              value={content} onChange={e=>setContent(e.target.value)} style={{minHeight:160}}/>
            <div style={{textAlign:'right',fontSize:'0.75rem',color:'var(--text-muted)',marginTop:4}}>{t.char_count.replace('{count}',String(content.length))}</div>
          </div>
          <button className="btn btn-sunset btn-lg btn-full" onClick={handleSubmit} disabled={loading}>{loading?t.saving:t.save_btn}</button>
        </div>
      )}

      {activeTab==='list'&&(
        <div>
          {fetching?(<div className="empty-state"><div className="empty-icon">⏳</div><p>{t.empty_fetching}</p></div>)
          :diaries.length===0?(<div className="empty-state"><div className="empty-icon">📔</div><p>{t.empty_title}</p><button className="btn btn-sunset" onClick={()=>setActiveTab('write')}>{t.empty_btn}</button></div>)
          :(
            <>
              <div className="glass-card" style={{marginBottom:20,padding:'16px 20px'}}>
                <div style={{fontSize:'0.78rem',fontWeight:700,color:'var(--text-muted)',marginBottom:8}}>{t.trend_title}</div>
                <MiniTrendChart diaries={diaries} noLabel={t.no_trend}/>
              </div>
              <WeeklyInsight diaries={diaries} t={t} emotionLabels={emotionLabels}/>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
                <button onClick={()=>setFilterEmotion('all')} style={{padding:'5px 14px',borderRadius:'var(--radius-full)',border:'1.5px solid',borderColor:filterEmotion==='all'?'var(--primary)':'var(--glass-border)',background:filterEmotion==='all'?'rgba(99,102,241,0.15)':'var(--glass-bg)',color:filterEmotion==='all'?'var(--primary)':'var(--text-muted)',fontSize:'0.78rem',fontWeight:700,cursor:'pointer'}}>{t.filter_all}</button>
                {emotions.map(e=>(
                  <button key={e.value} onClick={()=>setFilterEmotion(filterEmotion===e.value?'all':e.value)} style={{padding:'5px 14px',borderRadius:'var(--radius-full)',border:'1.5px solid',borderColor:filterEmotion===e.value?e.color:'var(--glass-border)',background:filterEmotion===e.value?`${e.color}18`:'var(--glass-bg)',color:filterEmotion===e.value?e.color:'var(--text-muted)',fontSize:'0.78rem',fontWeight:700,cursor:'pointer'}}>{e.emoji} {e.label}</button>
                ))}
              </div>
              {filteredDiaries.length===0?(
                <div style={{textAlign:'center',color:'var(--text-muted)',padding:'40px 0',fontSize:'0.9rem'}}>{lang==='ko'?'해당 감정의 일기가 없어요':'No diaries with this emotion'}</div>
              ):(
                <div style={{display:'flex',flexDirection:'column',gap:28}}>
                  {Object.entries(grouped).map(([date,items])=>(
                    <div key={date}>
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                        <div style={{fontWeight:700,fontSize:'0.9rem',color:'var(--text-primary)'}}>{date}</div>
                        <hr style={{flex:1,border:'none',borderTop:'1px solid var(--border)'}}/>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:10}}>
                        {items.map(d=>{
                          const em=emotions.find(e=>e.value===d.emotion);
                          return(
                            <div key={d.id} className="glass-card-sm" style={{display:'flex',gap:14,alignItems:'flex-start',padding:'16px',marginBottom:0}}>
                              <div style={{width:44,height:44,borderRadius:'var(--radius-md)',background:`${em?.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem',flexShrink:0}}>{em?.emoji||'😐'}</div>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                                  <span className="badge" style={{background:`${em?.color}18`,color:em?.color,fontWeight:600}}>{em?.label||d.emotion}</span>
                                  <span style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{t.intensity_badge.replace('{score}',d.emotion_score)}</span>
                                  {d.updated_at&&<span style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>{t.edited_badge}</span>}
                                </div>
                                <p style={{fontSize:'0.875rem',color:'var(--text-primary)',lineHeight:1.6,whiteSpace:'pre-wrap'}}>{d.content}</p>
                              </div>
                              <div style={{display:'flex',gap:6,flexShrink:0}}>
                                <button className="btn btn-glass btn-sm" onClick={()=>{setEditTarget(d);setShowModal(true);}}>✏️</button>
                                <button className="btn btn-danger-glass btn-sm" onClick={()=>handleDelete(d.id)}>🗑️</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {showModal&&editTarget&&(
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title">{t.edit_modal_title}</span><button className="modal-close" onClick={()=>setShowModal(false)}>✕</button></div>
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div className="form-group">
                <label className="form-label">{t.question_feel}</label>
                <div className="emotion-grid">
                  {emotions.map(e=>(
                    <button key={e.value} type="button" className={`emotion-btn ${editTarget.emotion===e.value?'selected':''}`} onClick={()=>setEditTarget({...editTarget,emotion:e.value})}>
                      <span className="emoji">{e.emoji}</span><span className="label">{e.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t.content_label}</label>
                <textarea className="form-textarea" rows={5} value={editTarget.content} onChange={e=>setEditTarget({...editTarget,content:e.target.value})}/>
              </div>
              <div style={{display:'flex',gap:10}}>
                <button className="btn btn-glass btn-full" onClick={()=>setShowModal(false)}>{t.cancel}</button>
                <button className="btn btn-sunset btn-full" onClick={handleUpdate} disabled={loading}>{t.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab==='calendar'&&(()=>{
        const calMap: Record<string,string>={};
        calendarData.forEach(e=>{calMap[e.date]=e.emotion;});
        const firstDay=new Date(calYear,calMonth-1,1).getDay();
        const daysInMonth=new Date(calYear,calMonth,0).getDate();
        const cells:(number|null)[]=[...Array(firstDay).fill(null),...Array.from({length:daysInMonth},(_,i)=>i+1)];
        const ec2: Record<string,number>={};
        calendarData.forEach(e=>{ec2[e.emotion]=(ec2[e.emotion]||0)+1;});
        const topEmos=Object.entries(ec2).sort((a,b)=>b[1]-a[1]).slice(0,3);
        return(
          <div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <button onClick={()=>{if(calMonth===1){setCalYear(y=>y-1);setCalMonth(12);}else setCalMonth(m=>m-1);}} style={{background:'var(--bg-subtle)',border:'none',borderRadius:10,padding:'8px 16px',cursor:'pointer',fontSize:'1rem'}}>←</button>
              <h3 style={{fontWeight:700,fontSize:'1.2rem'}}>{t.cal_title.replace('{year}',String(calYear)).replace('{month}',String(calMonth))}</h3>
              <button onClick={()=>{if(calMonth===12){setCalYear(y=>y+1);setCalMonth(1);}else setCalMonth(m=>m+1);}} style={{background:'var(--bg-subtle)',border:'none',borderRadius:10,padding:'8px 16px',cursor:'pointer',fontSize:'1rem'}}>→</button>
            </div>
            {topEmos.length>0&&(
              <div className="glass-card-sm" style={{padding:'16px 20px',marginBottom:20}}>
                <div style={{fontSize:'0.8rem',fontWeight:700,color:'var(--text-muted)',marginBottom:10}}>{t.month_emotions_title}</div>
                <div style={{display:'flex',gap:12}}>
                  {topEmos.map(([emo,cnt])=>(
                    <div key={emo} style={{display:'flex',alignItems:'center',gap:6,background:emotionColor[emo]||'#e5e7eb',borderRadius:20,padding:'6px 14px'}}>
                      <span style={{fontSize:'1.2rem'}}>{emotionEmoji[emo]||'😐'}</span>
                      <span style={{fontWeight:600,fontSize:'0.85rem'}}>{t.times.replace('{count}',String(cnt))}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="glass-card-sm" style={{padding:20}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:8}}>
                {t.cal_weeks.map((w:string,i:number)=>(
                  <div key={w} style={{textAlign:'center',fontSize:'0.8rem',fontWeight:700,color:i===0?'#ef4444':i===6?'#3b82f6':'var(--text-muted)',padding:'6px 0'}}>{w}</div>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4}}>
                {cells.map((day,idx)=>{
                  if(day===null) return <div key={`e-${idx}`}/>;
                  const ds=`${calYear}-${String(calMonth).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                  const emo=calMap[ds]; const isT=ds===new Date().toISOString().slice(0,10);
                  return(
                    <div key={ds} style={{aspectRatio:'1',borderRadius:10,padding:4,background:emo?emotionColor[emo]:'var(--bg-subtle)',border:isT?'2px solid var(--primary)':'2px solid transparent',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',transition:'all 0.15s',cursor:emo?'pointer':'default'}}>
                      <div style={{fontSize:'0.7rem',fontWeight:isT?800:500,color:isT?'var(--primary)':'var(--text-secondary)'}}>{day}</div>
                      {emo&&<div style={{fontSize:'1.1rem',lineHeight:1}}>{emotionEmoji[emo]||'😐'}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {toast&&<div className="toast success">{toast}</div>}
    </div>
  );
}
