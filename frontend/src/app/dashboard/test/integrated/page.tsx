'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/apiClient';
import { useLangStore } from '@/store/langStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { INTEGRATED_I18N, generatePatterns, daysAgo, TEST_HISTORY_COLORS, ALL_TEST_KEYS } from './i18n';

function RadarChart({data,labels}:{data:(number|null)[];labels:string[]}){
  const N=data.length,cx=160,cy=160,r=110;
  const angles=data.map((_,i)=>(Math.PI*2*i)/N-Math.PI/2);
  const toXY=(a:number,rad:number)=>({x:cx+rad*Math.cos(a),y:cy+rad*Math.sin(a)});
  const rings=[20,40,60,80,100];
  const colors=['#4F8EF7','#6c63ff','#f472b6','#20c997','#fbbf24','#a78bfa'];
  const filled=data.map(v=>v===null?0:v);
  const points=filled.map((v,i)=>{const pt=toXY(angles[i],(v/100)*r);return `${pt.x},${pt.y}`;}).join(' ');
  return(
    <svg viewBox="0 0 320 320" style={{width:'100%',maxWidth:320,display:'block',margin:'0 auto'}}>
      {rings.map((ring,ri)=>{const pts=angles.map(a=>{const pt=toXY(a,(ring/100)*r);return `${pt.x},${pt.y}`;}).join(' ');return <polygon key={ri} points={pts} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>;})}
      {angles.map((a,i)=>{const outer=toXY(a,r);return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>;} )}
      <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4F8EF7"/><stop offset="50%" stopColor="#6c63ff"/><stop offset="100%" stopColor="#f472b6"/></linearGradient></defs>
      <polygon points={points} fill="rgba(99,102,241,0.25)" stroke="url(#rg)" strokeWidth="2.5" strokeLinejoin="round"/>
      {filled.map((v,i)=>{const pt=toXY(angles[i],(v/100)*r);return <g key={i}><circle cx={pt.x} cy={pt.y} r="5" fill={colors[i%colors.length]} stroke="white" strokeWidth="1.5"/></g>;})}
      {labels.map((lbl,i)=>{const pt=toXY(angles[i],r+22);return(<text key={i} x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="middle" fontSize="9.5" fill="rgba(255,255,255,0.75)" fontWeight="600">{lbl.split(' ').map((w,wi)=>(<tspan key={wi} x={pt.x} dy={wi===0?'0':'12'}>{w}</tspan>))}</text>);})}
    </svg>
  );
}

function domainColor(s:number|null){if(s===null)return'#6c757d';if(s>=65)return'#20c997';if(s>=45)return'#fbbf24';return'#EF4444';}

export default function IntegratedPage(){
  const router=useRouter();
  const {lang}=useLangStore();
  const t=INTEGRATED_I18N[lang]||INTEGRATED_I18N.ko;
  const [data,setData]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [historyData,setHistoryData]=useState<Record<string,any[]>>({});
  const [selectedHistTest,setSelectedHistTest]=useState<string>('phq9');

  useEffect(()=>{
    (async()=>{
      try{
        const res=await fetch(`${API_BASE}/counsel/tests/integrated-report`,{headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}});
        if(res.ok){
          const d=await res.json();
          setData(d);
          const completed=(d.completed_types||[]) as string[];
          if(completed.length>0){
            const histMap: Record<string,any[]>={};
            await Promise.all(completed.map(async(tt:string)=>{
              try{
                const r=await fetch(`${API_BASE}/counsel/tests/history/${tt}`,{headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}});
                if(r.ok){const h=await r.json();if(h.length>1)histMap[tt]=h;}
              }catch{}
            }));
            setHistoryData(histMap);
            const first=Object.keys(histMap)[0];
            if(first)setSelectedHistTest(first);
          }
        }
      }catch{}
      setLoading(false);
    })();
  },[]);

  if(loading)return(<div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh',color:'var(--text-muted)'}}><div style={{textAlign:'center'}}><div style={{fontSize:'3rem',marginBottom:16}}>🔍</div><p>{t.loading}</p></div></div>);

  const hasData=data&&Object.keys(data.latest_tests||{}).length>0;
  if(!hasData)return(<div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh'}}><div style={{textAlign:'center'}}><div style={{fontSize:'4rem',marginBottom:16}}>🧠</div><h3 style={{fontWeight:800,color:'var(--text-primary)',marginBottom:8}}>{t.no_data_title}</h3><p style={{color:'var(--text-muted)',marginBottom:24}}>{t.no_data_sub}</p><button onClick={()=>router.push('/dashboard/test')} style={{background:'linear-gradient(135deg,#4F8EF7,#6c63ff)',color:'white',padding:'12px 28px',borderRadius:'var(--radius-full)',border:'none',cursor:'pointer',fontWeight:700,fontSize:'1rem'}}>{t.go_test}</button></div></div>);

  const radar=data.radar as Record<string,number|null>;
  const domainKeys=Object.keys(radar);
  const radarValues=domainKeys.map(k=>radar[k]);
  const radarLabels=domainKeys.map(k=>(t.domains as any)[k]||k);
  const patterns=generatePatterns(radar,lang);
  const completedTypes=data.completed_types as string[];
  const latestTests=data.latest_tests as Record<string,any>;
  const riskFlags=data.risk_flags||{};
  const hasHistory=Object.keys(historyData).length>0;
  const chartHistData=(historyData[selectedHistTest]||[]).map((r:any)=>({
    date:new Date(r.created_at).toLocaleDateString(lang==='ko'?'ko-KR':'en-US',{month:'2-digit',day:'2-digit'}),
    score:r.score,
  }));

  return(
    <div>
      <div style={{background:'linear-gradient(135deg,#1a1a3e 0%,#2d1b69 50%,#4a1942 100%)',padding:'40px 28px',color:'white',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-60,right:-60,width:200,height:200,background:'radial-gradient(circle,rgba(167,139,250,0.3) 0%,transparent 70%)',borderRadius:'50%'}}/>
        <div style={{position:'absolute',bottom:-40,left:-40,width:150,height:150,background:'radial-gradient(circle,rgba(244,114,182,0.25) 0%,transparent 70%)',borderRadius:'50%'}}/>
        <div style={{maxWidth:780,margin:'0 auto',position:'relative'}}>
          <div style={{display:'inline-block',background:'rgba(167,139,250,0.25)',border:'1px solid rgba(167,139,250,0.4)',borderRadius:20,padding:'4px 14px',fontSize:12,marginBottom:12,fontWeight:700}}>🔬 {lang==='ko'?'심리 분석':lang==='ja'?'心理分析':lang==='zh'?'心理分析':'Psychological Analysis'}</div>
          <h1 style={{fontSize:'1.8rem',fontWeight:900,marginBottom:8}}>{t.title}</h1>
          <p style={{opacity:.8,fontSize:'.9rem',lineHeight:1.6,maxWidth:500}}>{t.subtitle}</p>
        </div>
      </div>

      <div style={{maxWidth:780,margin:'0 auto',padding:'28px'}}>

        {/* A2: 위험 신호 배너 */}
        {(riskFlags.phq9_high||riskFlags.gad7_high||riskFlags.stress_high)&&(
          <div style={{background:'rgba(239,68,68,0.1)',border:'1.5px solid rgba(239,68,68,0.35)',borderRadius:16,padding:'16px 20px',marginBottom:24}}>
            <div style={{fontWeight:800,color:'#EF4444',marginBottom:8,fontSize:'0.95rem'}}>{t.risk_banner_title}</div>
            <div style={{display:'flex',flexDirection:'column',gap:4,marginBottom:12}}>
              {riskFlags.phq9_high&&<div style={{fontSize:'0.82rem',color:'var(--text-secondary)'}}>• {t.risk_phq9}</div>}
              {riskFlags.gad7_high&&<div style={{fontSize:'0.82rem',color:'var(--text-secondary)'}}>• {t.risk_gad7}</div>}
              {riskFlags.stress_high&&<div style={{fontSize:'0.82rem',color:'var(--text-secondary)'}}>• {t.risk_stress}</div>}
            </div>
            <button onClick={()=>router.push('/dashboard/counsel')} style={{background:'#EF4444',color:'white',padding:'8px 18px',borderRadius:10,border:'none',cursor:'pointer',fontWeight:700,fontSize:'0.82rem'}}>{t.risk_cta}</button>
          </div>
        )}

        {/* 완료 현황 + A5 n일 전 */}
        <div style={{marginBottom:28}}>
          <div style={{fontWeight:700,fontSize:'.85rem',color:'var(--text-muted)',marginBottom:12,letterSpacing:'.04em',textTransform:'uppercase'}}>{t.completed_tests}</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {ALL_TEST_KEYS.map(key=>{
              const done=completedTypes.includes(key);
              const r=latestTests[key];
              const dayStr=done&&r?.created_at?daysAgo(r.created_at,t):'';
              const isOld=done&&r?.created_at&&((Date.now()-new Date(r.created_at).getTime())>90*86400000);
              return(
                <div key={key} style={{position:'relative'}}>
                  <div onClick={()=>!done&&router.push('/dashboard/test')} style={{padding:'6px 14px',borderRadius:'var(--radius-full)',border:`1.5px solid ${done?'#20c997':'var(--glass-border)'}`,background:done?'rgba(32,201,151,0.12)':'var(--glass-bg)',color:done?'#20c997':'var(--text-muted)',fontSize:'.78rem',fontWeight:700,cursor:done?'default':'pointer',backdropFilter:'blur(8px)'}}>
                    {done?'✓ ':'○ '}{(t.test_names as any)[key]}
                    {dayStr&&<span style={{marginLeft:6,fontSize:'.68rem',opacity:0.7}}>{dayStr}</span>}
                  </div>
                  {isOld&&<div style={{position:'absolute',top:-4,right:-4,width:10,height:10,borderRadius:'50%',background:'#fbbf24',border:'2px solid var(--bg-layer2)'}} title={t.retake_suggest}/>}
                </div>
              );
            })}
          </div>
          {completedTypes.length<ALL_TEST_KEYS.length&&<p style={{fontSize:'.78rem',color:'var(--text-muted)',marginTop:10}}>{t.domains_todo}</p>}
        </div>

        {/* 레이더 차트 */}
        <div style={{background:'linear-gradient(135deg,rgba(79,142,247,0.08),rgba(108,99,255,0.08),rgba(244,114,182,0.08))',borderRadius:20,border:'1px solid rgba(167,139,250,0.2)',padding:'24px',marginBottom:24,backdropFilter:'blur(12px)'}}>
          <div style={{textAlign:'center',marginBottom:16}}>
            <h3 style={{fontWeight:800,fontSize:'1rem',color:'var(--text-primary)',marginBottom:4}}>{t.radar_title}</h3>
            <p style={{fontSize:'.78rem',color:'var(--text-muted)'}}>{t.radar_desc}</p>
          </div>
          <RadarChart data={radarValues} labels={radarLabels}/>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginTop:20}}>
            {domainKeys.map(k=>{const v=radar[k];return(<div key={k} style={{textAlign:'center',background:'rgba(255,255,255,0.04)',borderRadius:10,padding:'10px 8px',border:'1px solid rgba(255,255,255,0.06)'}}><div style={{fontSize:'1.3rem',fontWeight:800,color:domainColor(v)}}>{v!==null?Math.round(v):'—'}</div><div style={{fontSize:'.68rem',color:'var(--text-muted)',marginTop:2,wordBreak:'keep-all',lineHeight:1.3}}>{(t.domains as any)[k]}</div></div>);})}
          </div>
        </div>

        {/* 취약/강점 */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>
          <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:16,padding:'18px'}}>
            <div style={{fontWeight:800,color:'#EF4444',marginBottom:8,fontSize:'.9rem'}}>{t.weak_areas}</div>
            <p style={{fontSize:'.75rem',color:'var(--text-muted)',marginBottom:12}}>{t.weak_desc}</p>
            {data.weak_areas.length===0?<div style={{fontSize:'.8rem',color:'#20c997',fontWeight:600}}>✓ {lang==='ko'?'취약 영역 없음':'No weak areas'}</div>
            :data.weak_areas.map((a:any)=>(<div key={a.domain} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}><span style={{fontSize:'.8rem',color:'var(--text-secondary)',wordBreak:'keep-all'}}>{(t.domains as any)[a.domain]}</span><span style={{fontWeight:800,fontSize:'.85rem',color:'#EF4444'}}>{Math.round(a.score)}</span></div>))}
          </div>
          <div style={{background:'rgba(32,201,151,0.08)',border:'1px solid rgba(32,201,151,0.2)',borderRadius:16,padding:'18px'}}>
            <div style={{fontWeight:800,color:'#20c997',marginBottom:8,fontSize:'.9rem'}}>{t.strong_areas}</div>
            <p style={{fontSize:'.75rem',color:'var(--text-muted)',marginBottom:12}}>{t.strong_desc}</p>
            {data.strong_areas.length===0?<div style={{fontSize:'.8rem',color:'var(--text-muted)',fontWeight:600}}>—</div>
            :data.strong_areas.map((a:any)=>(<div key={a.domain} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}><span style={{fontSize:'.8rem',color:'var(--text-secondary)',wordBreak:'keep-all'}}>{(t.domains as any)[a.domain]}</span><span style={{fontWeight:800,fontSize:'.85rem',color:'#20c997'}}>{Math.round(a.score)}</span></div>))}
          </div>
        </div>

        {/* A1: 검사 점수 시계열 이력 */}
        {hasHistory&&(
          <div style={{background:'var(--glass-bg)',border:'1px solid var(--glass-border)',borderRadius:16,padding:'20px',marginBottom:24}}>
            <div style={{fontWeight:800,fontSize:'1rem',color:'var(--text-primary)',marginBottom:4}}>{t.score_history_title}</div>
            <p style={{fontSize:'.78rem',color:'var(--text-muted)',marginBottom:16}}>{t.score_history_sub}</p>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
              {Object.keys(historyData).map(tt=>(
                <button key={tt} onClick={()=>setSelectedHistTest(tt)} style={{padding:'5px 12px',borderRadius:'var(--radius-full)',border:'1.5px solid',borderColor:selectedHistTest===tt?(TEST_HISTORY_COLORS[tt]||'#a78bfa'):'var(--glass-border)',background:selectedHistTest===tt?`${TEST_HISTORY_COLORS[tt]||'#a78bfa'}20`:'transparent',color:selectedHistTest===tt?(TEST_HISTORY_COLORS[tt]||'#a78bfa'):'var(--text-muted)',fontSize:'.75rem',fontWeight:700,cursor:'pointer'}}>
                  {(t.test_names as any)[tt]||tt}
                </button>
              ))}
            </div>
            {chartHistData.length>1?(
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartHistData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
                  <XAxis dataKey="date" tick={{fill:'var(--text-muted)',fontSize:11}} tickLine={false}/>
                  <YAxis tick={{fill:'var(--text-muted)',fontSize:11}} tickLine={false} axisLine={false}/>
                  <Tooltip contentStyle={{background:'var(--bg-layer3)',border:'1px solid var(--glass-border)',borderRadius:8,fontSize:'0.82rem'}}/>
                  <Line type="monotone" dataKey="score" name={(t.test_names as any)[selectedHistTest]||selectedHistTest} stroke={TEST_HISTORY_COLORS[selectedHistTest]||'#a78bfa'} strokeWidth={2.5} dot={{r:4,fill:TEST_HISTORY_COLORS[selectedHistTest]||'#a78bfa'}} activeDot={{r:6}}/>
                </LineChart>
              </ResponsiveContainer>
            ):<div style={{textAlign:'center',color:'var(--text-muted)',padding:'24px 0',fontSize:'0.82rem'}}>{t.no_history}</div>}
          </div>
        )}

        {/* 통합 패턴 */}
        <div style={{marginBottom:24}}>
          <h3 style={{fontWeight:800,fontSize:'1rem',color:'var(--text-primary)',marginBottom:4}}>{t.integrated_analysis}</h3>
          <p style={{fontSize:'.8rem',color:'var(--text-muted)',marginBottom:16}}>{lang==='ko'?'여러 검사 결과를 교차 분석하여 도출한 패턴입니다.':lang==='ja'?'複数検査の交差分析パターンです。':lang==='zh'?'多项测试交叉分析模式。':'Patterns from cross-analysis of multiple assessments.'}</p>
          {patterns.length===0?(
            <div style={{background:'var(--glass-bg)',borderRadius:16,padding:'20px',border:'1px solid var(--glass-border)',textAlign:'center',color:'var(--text-muted)',fontSize:'.875rem'}}>{lang==='ko'?'데이터가 부족합니다. 더 많은 검사를 완료해주세요.':'Complete more assessments to generate patterns.'}</div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {patterns.map((p,i)=>(
                <div key={i} style={{background:'var(--glass-bg)',borderRadius:16,padding:'20px',border:'1px solid var(--glass-border)',backdropFilter:'blur(12px)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                    <span style={{fontSize:'1.8rem'}}>{p.icon}</span>
                    <div>
                      <div style={{fontSize:'.7rem',color:'var(--text-muted)',fontWeight:600,letterSpacing:'.04em',textTransform:'uppercase',marginBottom:2}}>{t.pattern_label}</div>
                      <div style={{fontWeight:800,fontSize:'1rem',color:'var(--text-primary)'}}>{p.title}</div>
                    </div>
                  </div>
                  <p style={{fontSize:'.875rem',color:'var(--text-secondary)',lineHeight:1.7}}>{p.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* A4: 솔루션 단기/중기/장기 */}
        {patterns.length>0&&(
          <div style={{marginBottom:28}}>
            <h3 style={{fontWeight:800,fontSize:'1rem',color:'var(--text-primary)',marginBottom:16}}>{t.solutions_title}</h3>
            {(['short','mid','long'] as const).map(phase=>{
              const phaseLabel={short:t.sol_short,mid:t.sol_mid,long:t.sol_long}[phase];
              const phaseColor={short:'#20c997',mid:'#fbbf24',long:'#a78bfa'}[phase];
              const sols=patterns.flatMap((p,pi)=>p.solutions.map((sol:string,si:number)=>({sol,pi,si}))).filter(({si})=>{
                if(phase==='short')return si<2;
                if(phase==='mid')return si===2;
                return si>=3;
              });
              if(!sols.length)return null;
              return(
                <div key={phase} style={{marginBottom:18}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                    <div style={{width:4,height:20,borderRadius:2,background:phaseColor}}/>
                    <span style={{fontWeight:700,fontSize:'0.82rem',color:phaseColor}}>{phaseLabel}</span>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {sols.map(({sol,pi,si})=>(
                      <div key={`${pi}-${si}`} style={{display:'flex',gap:14,alignItems:'flex-start',background:'var(--glass-bg)',borderRadius:12,padding:'12px 16px',border:'1px solid var(--glass-border)'}}>
                        <div style={{width:24,height:24,borderRadius:'50%',background:`linear-gradient(135deg,${phaseColor},${phaseColor}88)`,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:'.72rem',flexShrink:0}}>{si+1}</div>
                        <p style={{fontSize:'.875rem',color:'var(--text-secondary)',lineHeight:1.6,margin:0}}>{sol}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 개별 검사 결과 */}
        <div style={{marginBottom:28}}>
          <h3 style={{fontWeight:800,fontSize:'1rem',color:'var(--text-primary)',marginBottom:16}}>{lang==='ko'?'📋 개별 검사 결과':lang==='ja'?'📋 個別検査結果':lang==='zh'?'📋 个别测试结果':'📋 Individual Test Results'}</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
            {ALL_TEST_KEYS.map(key=>{
              const r=latestTests[key];
              const color=TEST_HISTORY_COLORS[key]||'#6c757d';
              const isOld=r?.created_at&&((Date.now()-new Date(r.created_at).getTime())>90*86400000);
              return(
                <div key={key} style={{background:'var(--glass-bg)',borderRadius:14,padding:'16px',border:`1px solid ${r?color+'40':'var(--glass-border)'}`,opacity:r?1:0.6,position:'relative'}}>
                  <div style={{fontSize:'.72rem',color:'var(--text-muted)',marginBottom:6,fontWeight:600}}>{(t.test_names as any)[key]}</div>
                  {r?(
                    <>
                      <div style={{fontSize:'1.5rem',fontWeight:800,color}}>{r.score}<span style={{fontSize:'.75rem',marginLeft:2}}>{lang==='ko'?'점':lang==='zh'?'分':'pts'}</span></div>
                      <div style={{fontSize:'.78rem',color:'var(--text-secondary)',marginTop:4,fontWeight:600}}>{r.level}</div>
                      <div style={{fontSize:'.68rem',color:'var(--text-muted)',marginTop:4}}>{daysAgo(r.created_at,t)}</div>
                      {isOld&&<div style={{marginTop:6,fontSize:'.68rem',color:'#fbbf24',fontWeight:700}}>⚠️ {t.retake_suggest}</div>}
                    </>
                  ):<div style={{fontSize:'.82rem',color:'var(--text-muted)',marginTop:4}}>{t.not_done}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={()=>router.push('/dashboard/test')} style={{background:'var(--glass-bg)',color:'var(--text-secondary)',padding:'12px 24px',borderRadius:10,border:'1px solid var(--glass-border)',cursor:'pointer',fontWeight:600,fontSize:'.9rem'}}>{lang==='ko'?'← 검사 목록':lang==='ja'?'← 検査一覧':lang==='zh'?'← 测试列表':'← Back to Tests'}</button>
          <button onClick={()=>router.push('/dashboard/counsel')} style={{background:'linear-gradient(135deg,#4F8EF7,#6c63ff)',color:'white',padding:'12px 24px',borderRadius:10,border:'none',cursor:'pointer',fontWeight:700,fontSize:'.9rem'}}>{t.counseling_btn}</button>
        </div>
      </div>
    </div>
  );
}
