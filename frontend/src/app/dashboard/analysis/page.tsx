'use client';
import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Tooltip,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend,
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://studentcare-production.up.railway.app/api/v1';

const EMOTION_COLORS: Record<string, string> = {
  happy: '#fbbf24',
  sad: '#60a5fa',
  anxious: '#f87171',
  neutral: '#94a3b8',
  angry: '#fb7185',
  tired: '#a78bfa',
};

const EMOTION_LABELS: Record<string, string> = {
  happy: '행복',
  sad: '슬픔',
  anxious: '불안',
  neutral: '보통',
  angry: '분노',
  tired: '피곤',
};

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

const TEST_COLORS: Record<string, string> = {
  phq9: '#f87171',
  gad7: '#a78bfa',
  stress: '#fbbf24',
};
const TEST_LABELS: Record<string, string> = {
  phq9: 'PHQ-9 (우울)',
  gad7: 'GAD-7 (불안)',
  stress: '스트레스',
};

function SkeletonCard() {
  return (
    <div
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 24,
      }}
    >
      <div
        style={{
          height: 20,
          width: '40%',
          borderRadius: 8,
          background: 'rgba(255,255,255,0.06)',
          marginBottom: 16,
        }}
      />
      <div style={{ height: 200, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }} />
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 0',
        color: 'var(--text-muted)',
        gap: 12,
      }}
    >
      <span style={{ fontSize: '3rem' }}>📭</span>
      <p style={{ fontSize: '0.9rem', textAlign: 'center' }}>{msg}</p>
    </div>
  );
}

function GlassCard({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        backdropFilter: 'blur(24px)',
        boxShadow: 'var(--glass-shadow)',
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
          {title}
        </h3>
        {subtitle && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'var(--bg-layer3)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        fontSize: '0.82rem',
        boxShadow: 'var(--glass-shadow)',
      }}
    >
      <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalysisPage() {
  const [trendData, setTrendData] = useState<any[]>([]);
  const [dayData, setDayData] = useState<any[]>([]);
  const [distData, setDistData] = useState<any[]>([]);
  const [testData, setTestData] = useState<any[]>([]);
  const [loading, setLoading] = useState({ trend: true, day: true, dist: true, test: true });

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const res = await fetch(`${API}/analysis/emotion-trend`, { headers });
      if (res.ok) {
        const raw = await res.json();
        setTrendData(
          raw.map((d: any) => ({
            date: d.date
              ? new Date(d.date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace('. ', '/').replace('.', '')
              : d.date,
            score: parseFloat(d.avg_score ?? d.score ?? 0),
          }))
        );
      }
    } catch {}
    setLoading((prev) => ({ ...prev, trend: false }));

    try {
      const res = await fetch(`${API}/analysis/emotion-by-day`, { headers });
      if (res.ok) {
        const raw = await res.json();
        setDayData(
          raw.map((d: any, i: number) => ({
            day: DAY_LABELS[d.day_of_week ?? i] ?? d.day,
            score: parseFloat(d.avg_score ?? d.score ?? 0),
          }))
        );
      }
    } catch {}
    setLoading((prev) => ({ ...prev, day: false }));

    try {
      const res = await fetch(`${API}/analysis/emotion-dist`, { headers });
      if (res.ok) {
        const raw = await res.json();
        setDistData(
          Object.entries(raw).map(([key, val]: [string, any]) => ({
            name: EMOTION_LABELS[key] ?? key,
            value: typeof val === 'number' ? val : parseFloat(val),
            color: EMOTION_COLORS[key] ?? '#94a3b8',
          }))
        );
      }
    } catch {}
    setLoading((prev) => ({ ...prev, dist: false }));

    try {
      const res = await fetch(`${API}/analysis/test-history`, { headers });
      if (res.ok) {
        const raw = await res.json();
        let normalized: any[] = [];
        if (Array.isArray(raw) && raw.length > 0 && 'test_type' in raw[0]) {
          const byDate: Record<string, any> = {};
          raw.forEach((r: any) => {
            if (!byDate[r.date]) byDate[r.date] = { date: r.date };
            byDate[r.date][r.test_type] = r.score;
          });
          normalized = Object.values(byDate);
        } else {
          normalized = raw;
        }
        setTestData(
          normalized.map((d: any) => ({
            ...d,
            date: d.date
              ? new Date(d.date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace('. ', '/').replace('.', '')
              : d.date,
          }))
        );
      }
    } catch {}
    setLoading((prev) => ({ ...prev, test: false }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const EMPTY_MSG = '데이터가 없습니다. 일기를 작성해보세요!';

  return (
    <div className="page-content" style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 6,
          }}
        >
          📊 감정 패턴 분석
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          나의 감정 흐름을 한눈에
        </p>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        {/* ① 감정 점수 추이 */}
        {loading.trend ? (
          <SkeletonCard />
        ) : (
          <GlassCard title="📈 감정 점수 추이" subtitle="최근 30일 일별 평균 감정 점수">
            {trendData.length === 0 ? (
              <EmptyState msg={EMPTY_MSG} />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  />
                  <YAxis
                    domain={[1, 5]}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="감정점수"
                    stroke="#a78bfa"
                    strokeWidth={2.5}
                    dot={{ fill: '#a78bfa', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#a78bfa', stroke: 'var(--bg-layer2)', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </GlassCard>
        )}

        {/* ② ③ 요일별 패턴 + 감정 분포 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {loading.day ? (
            <SkeletonCard />
          ) : (
            <GlassCard title="📅 요일별 감정 패턴" subtitle="요일별 평균 감정 점수">
              {dayData.length === 0 ? (
                <EmptyState msg={EMPTY_MSG} />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dayData} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                    />
                    <YAxis
                      domain={[0, 5]}
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" name="평균 점수" radius={[6, 6, 0, 0]}>
                      {dayData.map((_, i) => (
                        <Cell key={i} fill={`hsl(${260 + i * 15}, 70%, 65%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </GlassCard>
          )}

          {loading.dist ? (
            <SkeletonCard />
          ) : (
            <GlassCard title="🎯 감정 분포" subtitle="전체 감정 비율">
              {distData.length === 0 ? (
                <EmptyState msg={EMPTY_MSG} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <ResponsiveContainer width={180} height={220}>
                    <PieChart>
                      <Pie
                        data={distData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {distData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0];
                          return (
                            <div
                              style={{
                                background: 'var(--bg-layer3)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: 'var(--radius-md)',
                                padding: '8px 12px',
                                fontSize: '0.8rem',
                              }}
                            >
                              <p style={{ color: d.payload.color, fontWeight: 700 }}>
                                {d.name}: {d.value}%
                              </p>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    {distData.map((d) => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: d.color,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flex: 1 }}>
                          {d.name}
                        </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: d.color }}>
                          {d.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          )}
        </div>

        {/* ④ 심리검사 점수 이력 */}
        {loading.test ? (
          <SkeletonCard />
        ) : (
          <GlassCard title="🧠 심리 검사 점수 이력" subtitle="PHQ-9 · GAD-7 · 스트레스 점수 변화">
            {testData.length === 0 ? (
              <EmptyState msg="심리검사를 받아보세요!" />
            ) : (
              <>
                <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                  {Object.keys(TEST_LABELS).map((key) => {
                    const vals = testData
                      .filter((d) => d[key] !== undefined)
                      .map((d) => d[key]);
                    if (vals.length < 2) return null;
                    const trend = vals[vals.length - 1] - vals[vals.length - 2];
                    const isImproving = trend < 0;
                    return (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-full)',
                          background: isImproving ? 'var(--success-bg)' : 'var(--danger-bg)',
                          border: `1px solid ${isImproving ? 'rgba(52,211,153,0.2)' : 'rgba(255,77,109,0.2)'}`,
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: isImproving ? 'var(--success)' : 'var(--danger)',
                        }}
                      >
                        {isImproving ? '↓ 개선 중' : '↑ 주의'} {TEST_LABELS[key]}
                      </div>
                    );
                  })}
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={testData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                    />
                    <YAxis
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}
                    />
                    {Object.keys(TEST_LABELS).map((key) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        name={TEST_LABELS[key]}
                        stroke={TEST_COLORS[key]}
                        strokeWidth={2}
                        dot={{ fill: TEST_COLORS[key], r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, stroke: 'var(--bg-layer2)', strokeWidth: 2 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  );
}
