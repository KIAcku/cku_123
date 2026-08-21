'use client';
import { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Tooltip,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend,
} from 'recharts';
import { useLangStore } from '@/store/langStore';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://studentcare-production.up.railway.app/api/v1';

const i18n: Record<string, Record<string, any>> = {
  ko: {
    page_title: '📊 감정 패턴 분석', page_sub: '나의 감정 흐름을 한눈에',
    card_trend: '📈 감정 점수 추이', card_trend_sub: '일별 평균 감정 점수',
    card_day: '📅 요일별 감정 패턴', card_day_sub: '요일별 평균 감정 점수',
    card_dist: '🎯 감정 분포', card_dist_sub: '전체 감정 비율',
    card_test: '🧠 심리 검사 점수 이력', card_test_sub: '검사 점수 변화',
    card_peak: '🏆 감정 피크', card_peak_sub: '최근 30일 최고 감정 강도',
    empty_diary: '데이터가 없습니다. 일기를 작성해보세요!',
    empty_test: '심리검사를 받아보세요!',
    trend_improving: '↓ 개선 중', trend_warning: '↑ 주의',
    score_name: '감정점수', avg_score_name: '평균 점수',
    day_labels: ['월','화','수','목','금','토','일'],
    emotion_labels: { happy:'행복',sad:'슬픔',anxious:'불안',neutral:'보통',angry:'분노',tired:'피곤' },
    test_labels: { phq9:'PHQ-9(우울)',gad7:'GAD-7(불안)',stress:'스트레스',rses:'자존감',ego:'자아경계',ders:'정서조절' },
    date_locale: 'ko-KR',
    range_7: '7일', range_30: '30일',
    peak_date: '{date} ({emotion}) — 강도 {score}/5',
    no_peak: '데이터 없음',
  },
  en: {
    page_title: '📊 Emotion Pattern Analysis', page_sub: 'See your emotional flow at a glance',
    card_trend: '📈 Emotion Score Trend', card_trend_sub: 'Daily average emotion score',
    card_day: '📅 Day-of-Week Pattern', card_day_sub: 'Average by day of week',
    card_dist: '🎯 Emotion Distribution', card_dist_sub: 'Overall ratio',
    card_test: '🧠 Psychological Test History', card_test_sub: 'Score changes over time',
    card_peak: '🏆 Emotion Peak', card_peak_sub: 'Highest emotion intensity (30 days)',
    empty_diary: 'No data yet. Write a diary!',
    empty_test: 'Take a psychological test!',
    trend_improving: '↓ Improving', trend_warning: '↑ Caution',
    score_name: 'Score', avg_score_name: 'Avg Score',
    day_labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    emotion_labels: { happy:'Happy',sad:'Sad',anxious:'Anxious',neutral:'Neutral',angry:'Angry',tired:'Tired' },
    test_labels: { phq9:'PHQ-9(Dep)',gad7:'GAD-7(Anx)',stress:'Stress',rses:'Self-Esteem',ego:'Ego',ders:'Emotion Reg.' },
    date_locale: 'en-US',
    range_7: '7D', range_30: '30D',
    peak_date: '{date} ({emotion}) — {score}/5',
    no_peak: 'No data',
  },
  ja: {
    page_title: '📊 感情パターン分析', page_sub: '感情の流れを一目で',
    card_trend: '📈 感情スコア推移', card_trend_sub: '日別平均感情スコア',
    card_day: '📅 曜日別パターン', card_day_sub: '曜日別平均スコア',
    card_dist: '🎯 感情分布', card_dist_sub: '全体比率',
    card_test: '🧠 心理検査スコア履歴', card_test_sub: 'スコア変化',
    card_peak: '🏆 感情ピーク', card_peak_sub: '直近30日最高感情強度',
    empty_diary: 'データなし。日記を書きましょう！',
    empty_test: '心理検査を受けましょう！',
    trend_improving: '↓ 改善中', trend_warning: '↑ 注意',
    score_name: '感情スコア', avg_score_name: '平均スコア',
    day_labels: ['月','火','水','木','金','土','日'],
    emotion_labels: { happy:'嬉しい',sad:'悲しい',anxious:'不安',neutral:'普通',angry:'怒り',tired:'疲れた' },
    test_labels: { phq9:'PHQ-9(うつ)',gad7:'GAD-7(不安)',stress:'ストレス',rses:'自尊感情',ego:'自我境界',ders:'感情調節' },
    date_locale: 'ja-JP',
    range_7: '7日', range_30: '30日',
    peak_date: '{date}({emotion}) — {score}/5',
    no_peak: 'データなし',
  },
  zh: {
    page_title: '📊 情绪模式分析', page_sub: '一眼看清情绪流向',
    card_trend: '📈 情绪分数趋势', card_trend_sub: '每日平均情绪分数',
    card_day: '📅 按星期规律', card_day_sub: '各星期平均分数',
    card_dist: '🎯 情绪分布', card_dist_sub: '整体比例',
    card_test: '🧠 心理测试历史', card_test_sub: '分数变化',
    card_peak: '🏆 情绪高峰', card_peak_sub: '近30天最高情绪强度',
    empty_diary: '暂无数据，写日记吧！',
    empty_test: '去做心理测试！',
    trend_improving: '↓ 改善中', trend_warning: '↑ 注意',
    score_name: '情绪分数', avg_score_name: '平均分数',
    day_labels: ['周一','周二','周三','周四','周五','周六','周日'],
    emotion_labels: { happy:'开心',sad:'悲伤',anxious:'焦虑',neutral:'一般',angry:'生气',tired:'疲惫' },
    test_labels: { phq9:'PHQ-9(抑郁)',gad7:'GAD-7(焦虑)',stress:'压力',rses:'自尊',ego:'自我边界',ders:'情绪调节' },
    date_locale: 'zh-CN',
    range_7: '7天', range_30: '30天',
    peak_date: '{date}({emotion}) — {score}/5',
    no_peak: '无数据',
  },
};

const EMOTION_COLORS: Record<string,string> = {
  happy:'#fbbf24',sad:'#60a5fa',anxious:'#f87171',neutral:'#94a3b8',angry:'#fb7185',tired:'#a78bfa',
};
const TEST_COLORS: Record<string,string> = {
  phq9:'#f87171',gad7:'#a78bfa',stress:'#fbbf24',rses:'#34d399',ego:'#60a5fa',ders:'#f97316',
};

function SkeletonCard() {
  return (
    <div style={{background:'var(--glass-bg)',border:'1px solid var(--glass-border)',borderRadius:'var(--radius-xl)',padding:24}}>
      <div style={{height:20,width:'40%',borderRadius:8,background:'rgba(255,255,255,0.06)',marginBottom:16}}/>
      <div style={{height:200,borderRadius:12,background:'rgba(255,255,255,0.04)'}}/>
    </div>
  );
}
function EmptyState({msg}:{msg:string}){return(<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'48px 0',color:'var(--text-muted)',gap:12}}><span style={{fontSize:'3rem'}}>📭</span><p style={{fontSize:'0.9rem',textAlign:'center'}}>{msg}</p></div>);}
function GlassCard({children,title,subtitle,extra}:{children:React.ReactNode;title:string;subtitle?:string;extra?:React.ReactNode}){
  return(
    <div style={{background:'var(--glass-bg)',border:'1px solid var(--glass-border)',borderRadius:'var(--radius-xl)',padding:'24px 28px',backdropFilter:'blur(24px)',boxShadow:'var(--glass-shadow)'}}>
      <div style={{marginBottom:20,display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12}}>
        <div><h3 style={{fontWeight:700,fontSize:'1rem',color:'var(--text-primary)',marginBottom:4}}>{title}</h3>{subtitle&&<p style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>{subtitle}</p>}</div>
        {extra}
      </div>
      {children}
    </div>
  );
}
const CustomTooltip=({active,payload,label}:any)=>{
  if(!active||!payload?.length)return null;
  return(<div style={{background:'var(--bg-layer3)',border:'1px solid var(--glass-border)',borderRadius:'var(--radius-md)',padding:'10px 14px',fontSize:'0.82rem',boxShadow:'var(--glass-shadow)'}}><p style={{color:'var(--text-muted)',marginBottom:4}}>{label}</p>{payload.map((p:any)=>(<p key={p.dataKey} style={{color:p.color,fontWeight:600}}>{p.name}: {typeof p.value==='number'?p.value.toFixed(2):p.value}</p>))}</div>);
};

export default function AnalysisPage(){
  const {lang}=useLangStore();
  const t=i18n[lang]||i18n.ko;
  const [trendData,setTrendData]=useState<any[]>([]);
  const [dayData,setDayData]=useState<any[]>([]);
  const [distData,setDistData]=useState<any[]>([]);
  const [testData,setTestData]=useState<any[]>([]);
  const [rawTrend,setRawTrend]=useState<any[]>([]);
  const [trendRange,setTrendRange]=useState<7|30>(30);
  const [loading,setLoading]=useState({trend:true,day:true,dist:true,test:true});

  const fetchData=async()=>{
    const token=localStorage.getItem('token');
    const headers={Authorization:`Bearer ${token}`};

    try {
      const res=await fetch(`${API}/analysis/emotion-trend`,{headers});
      if(res.ok){
        const raw=await res.json();
        const list=Array.isArray(raw)?raw:(raw.trend??[]);
        const mapped=list.map((d:any)=>({
          date:d.date?new Date(d.date).toLocaleDateString(t.date_locale,{month:'2-digit',day:'2-digit'}).replace('. ','/').replace('.',''):d.date,
          rawDate:d.date,
          score:parseFloat(d.avg_score??d.score??0),
        }));
        setRawTrend(mapped);
        setTrendData(mapped.slice(-30));
      }
    } catch {}
    setLoading(prev=>({...prev,trend:false}));

    try {
      const res=await fetch(`${API}/analysis/emotion-by-day`,{headers});
      if(res.ok){
        const raw=await res.json();
        const list=Array.isArray(raw)?raw:(raw.by_day??[]);
        setDayData(list.map((d:any,i:number)=>({day:typeof d.day==='string'?d.day:(t.day_labels[d.day_of_week??i]??d.day),score:parseFloat(d.avg_score??d.score??0)})));
      }
    } catch {}
    setLoading(prev=>({...prev,day:false}));

    try {
      const res=await fetch(`${API}/analysis/emotion-dist`,{headers});
      if(res.ok){
        const raw=await res.json();
        const list:any[]=Array.isArray(raw)?raw:(raw.distribution??[]);
        setDistData(list.map((item:any)=>({name:t.emotion_labels[item.emotion]??item.emotion??item.name,value:typeof item.ratio==='number'?item.ratio:parseFloat(item.ratio??item.value??0),color:EMOTION_COLORS[item.emotion??item.name]??'#94a3b8',emotion:item.emotion??item.name})));
      }
    } catch {}
    setLoading(prev=>({...prev,dist:false}));

    try {
      const res=await fetch(`${API}/analysis/test-history`,{headers});
      if(res.ok){
        const raw=await res.json();
        let normalized:any[]=[];
        if(Array.isArray(raw)&&raw.length>0&&'test_type'in raw[0]){
          const byDate:Record<string,any>={};
          raw.forEach((r:any)=>{if(!byDate[r.date])byDate[r.date]={date:r.date};byDate[r.date][r.test_type]=r.score;});
          normalized=Object.values(byDate);
        } else normalized=raw;
        setTestData(normalized.map((d:any)=>({...d,date:d.date?new Date(d.date).toLocaleDateString(t.date_locale,{month:'2-digit',day:'2-digit'}).replace('. ','/').replace('.',''):d.date})));
      }
    } catch {}
    setLoading(prev=>({...prev,test:false}));
  };

  useEffect(()=>{sessionStorage.removeItem('analysis_needs_refresh');fetchData();},[]);
  useEffect(()=>{setDistData(prev=>prev.map(d=>({...d,name:t.emotion_labels[d.emotion]??d.name})));setDayData(prev=>prev.map((d,i)=>({...d,day:t.day_labels[i]??d.day})));},[lang]);
  useEffect(()=>{setTrendData(rawTrend.slice(-trendRange));},[trendRange,rawTrend]);

  // P2: 피크 감정 — rawTrend에서 score 최고값
  const peakEntry = rawTrend.length>0 ? rawTrend.reduce((a,b)=>b.score>a.score?b:a,rawTrend[0]) : null;

  return(
    <div className="page-content" style={{maxWidth:1100}}>
      <div style={{marginBottom:32}}>
        <h1 style={{fontSize:'1.75rem',fontWeight:800,background:'linear-gradient(135deg,#a78bfa,#60a5fa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',marginBottom:6}}>{t.page_title}</h1>
        <p style={{color:'var(--text-muted)',fontSize:'0.9rem'}}>{t.page_sub}</p>
      </div>

      <div style={{display:'grid',gap:24}}>
        {/* P2: 피크 인사이트 */}
        {!loading.trend&&peakEntry&&(
          <div style={{background:'linear-gradient(135deg,rgba(251,191,36,0.12),rgba(167,139,250,0.12))',border:'1px solid rgba(251,191,36,0.25)',borderRadius:'var(--radius-xl)',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
            <span style={{fontSize:'2rem'}}>🏆</span>
            <div>
              <div style={{fontWeight:700,fontSize:'0.85rem',color:'var(--text-primary)',marginBottom:2}}>{t.card_peak}</div>
              <div style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>
                {t.peak_date.replace('{date}',peakEntry.date).replace('{emotion}',peakEntry.date).replace('{score}',String(peakEntry.score.toFixed(1)))}
                {' '}— score <strong style={{color:'#fbbf24'}}>{peakEntry.score.toFixed(1)}</strong>/5
              </div>
            </div>
          </div>
        )}

        {/* ① P1: 감정 추이 AreaChart + 7일/30일 토글 */}
        {loading.trend?<SkeletonCard/>:(
          <GlassCard title={t.card_trend} subtitle={t.card_trend_sub} extra={
            <div style={{display:'flex',gap:6,flexShrink:0}}>
              {([7,30] as const).map(r=>(
                <button key={r} onClick={()=>setTrendRange(r)} style={{padding:'4px 12px',borderRadius:'var(--radius-full)',border:'1.5px solid',borderColor:trendRange===r?'#a78bfa':'var(--glass-border)',background:trendRange===r?'rgba(167,139,250,0.15)':'transparent',color:trendRange===r?'#a78bfa':'var(--text-muted)',fontSize:'0.75rem',fontWeight:700,cursor:'pointer'}}>
                  {r===7?t.range_7:t.range_30}
                </button>
              ))}
            </div>
          }>
            {trendData.length===0?<EmptyState msg={t.empty_diary}/>:(
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
                  <XAxis dataKey="date" tick={{fill:'var(--text-muted)',fontSize:11}} tickLine={false} axisLine={{stroke:'rgba(255,255,255,0.08)'}}/>
                  <YAxis domain={[1,5]} tick={{fill:'var(--text-muted)',fontSize:11}} tickLine={false} axisLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Area type="monotone" dataKey="score" name={t.score_name} stroke="#a78bfa" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{fill:'#a78bfa',r:3,strokeWidth:0}} activeDot={{r:5,fill:'#a78bfa',stroke:'var(--bg-layer2)',strokeWidth:2}}/>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </GlassCard>
        )}

        {/* ② ③ 요일별 + 감정 분포 */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
          {loading.day?<SkeletonCard/>:(
            <GlassCard title={t.card_day} subtitle={t.card_day_sub}>
              {dayData.length===0?<EmptyState msg={t.empty_diary}/>:(
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dayData} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false}/>
                    <XAxis dataKey="day" tick={{fill:'var(--text-muted)',fontSize:12}} tickLine={false} axisLine={{stroke:'rgba(255,255,255,0.08)'}}/>
                    <YAxis domain={[0,5]} tick={{fill:'var(--text-muted)',fontSize:11}} tickLine={false} axisLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="score" name={t.avg_score_name} radius={[6,6,0,0]}>
                      {dayData.map((_,i)=><Cell key={i} fill={`hsl(${260+i*15},70%,65%)`}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </GlassCard>
          )}
          {loading.dist?<SkeletonCard/>:(
            <GlassCard title={t.card_dist} subtitle={t.card_dist_sub}>
              {distData.length===0?<EmptyState msg={t.empty_diary}/>:(
                <div style={{display:'flex',alignItems:'center',gap:20}}>
                  <ResponsiveContainer width={180} height={220}>
                    <PieChart>
                      <Pie data={distData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {distData.map((entry,i)=><Cell key={i} fill={entry.color}/>)}
                      </Pie>
                      <Tooltip content={({active,payload})=>{if(!active||!payload?.length)return null;const d=payload[0];return(<div style={{background:'var(--bg-layer3)',border:'1px solid var(--glass-border)',borderRadius:'var(--radius-md)',padding:'8px 12px',fontSize:'0.8rem'}}><p style={{color:d.payload.color,fontWeight:700}}>{d.name}: {d.value}%</p></div>);}}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{display:'flex',flexDirection:'column',gap:8,flex:1}}>
                    {distData.map(d=>(<div key={d.name} style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:10,height:10,borderRadius:'50%',background:d.color,flexShrink:0}}/><span style={{fontSize:'0.8rem',color:'var(--text-secondary)',flex:1}}>{d.name}</span><span style={{fontSize:'0.82rem',fontWeight:700,color:d.color}}>{d.value}%</span></div>))}
                  </div>
                </div>
              )}
            </GlassCard>
          )}
        </div>

        {/* P3: 심리검사 점수 이력 (확장: rses/ego/ders 추가) */}
        {loading.test?<SkeletonCard/>:(
          <GlassCard title={t.card_test} subtitle={t.card_test_sub}>
            {testData.length===0?<EmptyState msg={t.empty_test}/>:(
              <>
                <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
                  {Object.keys(t.test_labels).map(key=>{
                    const vals=testData.filter(d=>d[key]!==undefined).map(d=>d[key]);
                    if(vals.length<2)return null;
                    const trend=vals[vals.length-1]-vals[vals.length-2];
                    const improving=trend<0;
                    return(<div key={key} style={{display:'flex',alignItems:'center',gap:6,padding:'4px 12px',borderRadius:'var(--radius-full)',background:improving?'var(--success-bg)':'var(--danger-bg)',border:`1px solid ${improving?'rgba(52,211,153,0.2)':'rgba(255,77,109,0.2)'}`,fontSize:'0.78rem',fontWeight:600,color:improving?'var(--success)':'var(--danger)'}}>{improving?t.trend_improving:t.trend_warning} {t.test_labels[key]}</div>);
                  })}
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={testData}>
                    <defs>
                      {Object.keys(TEST_COLORS).map(key=>(
                        <linearGradient key={key} id={`tg_${key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={TEST_COLORS[key]} stopOpacity={0.2}/>
                          <stop offset="95%" stopColor={TEST_COLORS[key]} stopOpacity={0}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
                    <XAxis dataKey="date" tick={{fill:'var(--text-muted)',fontSize:11}} tickLine={false} axisLine={{stroke:'rgba(255,255,255,0.08)'}}/>
                    <YAxis tick={{fill:'var(--text-muted)',fontSize:11}} tickLine={false} axisLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend wrapperStyle={{fontSize:'0.78rem',color:'var(--text-muted)'}}/>
                    {Object.keys(t.test_labels).map(key=>(
                      <Area key={key} type="monotone" dataKey={key} name={t.test_labels[key]} stroke={TEST_COLORS[key]||'#94a3b8'} strokeWidth={2} fill={`url(#tg_${key})`} dot={{fill:TEST_COLORS[key]||'#94a3b8',r:3,strokeWidth:0}} activeDot={{r:5,stroke:'var(--bg-layer2)',strokeWidth:2}} connectNulls/>
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  );
}
