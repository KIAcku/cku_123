'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const emotionColors: Record<string, string> = {
  happy: '#F59E0B', sad: '#3B82F6', angry: '#EF4444',
  anxious: '#8B5CF6', neutral: '#6B7280', tired: '#EC4899', excited: '#10B981',
};
const emotionLabels: Record<string, string> = {
  happy: '행복해요', sad: '슬퍼요', angry: '화가나요',
  anxious: '불안해요', neutral: '보통이에요', tired: '피곤해요', excited: '설레요',
};
const emotionEmoji: Record<string, string> = {
  happy: '😊', sad: '😢', angry: '😠', anxious: '😰', neutral: '😐', tired: '😴', excited: '🤩',
};

const quickMenus = [
  { href: '/dashboard/diary', icon: '📔', label: '감정 일기 쓰기', desc: '오늘의 감정을 기록해보세요', bg: 'var(--primary-light)', color: 'var(--primary)' },
  { href: '/dashboard/community', icon: '👥', label: '커뮤니티 보기', desc: '친구들과 소통해요', bg: 'var(--secondary-light)', color: 'var(--secondary)' },
  { href: '/dashboard/report', icon: '🚨', label: '익명 신고', desc: '안전하게 신고하세요', bg: 'var(--danger-light)', color: 'var(--danger)' },
];

export default function DashboardHome() {
  const [user, setUser] = useState<any>(null);
  const [diaries, setDiaries] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [diaryRes, postRes, statsRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/diaries?limit=3', { headers }),
        fetch('http://localhost:8000/api/v1/posts?limit=3'),
        fetch('http://localhost:8000/api/v1/diaries/stats', { headers }),
      ]);
      if (diaryRes.ok) { const d = await diaryRes.json(); setDiaries(d.slice(0, 3)); }
      if (postRes.ok) { const p = await postRes.json(); setPosts(p.slice(0, 3)); }
      if (statsRes.ok) setStats(await statsRes.json());
    } catch { }
    setLoading(false);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '좋은 오후에요' : '좋은 저녁이에요';

  return (
    <div className="page-content">
      {/* 환영 배너 */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #7C3AED 100%)',
        borderRadius: 'var(--radius-xl)', padding: '28px 32px', color: 'white',
        marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div>
          <p style={{ opacity: 0.85, fontSize: '0.875rem', marginBottom: 6 }}>{greeting} 👋</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>
            {user?.nickname || '익명학생'}님, 환영합니다!
          </h2>
          <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>오늘 마음은 어떠신가요? 감정을 기록하고 스스로를 돌봐보세요.</p>
        </div>
        <div style={{ fontSize: '4rem', opacity: 0.9 }}>💚</div>
      </div>

      {/* 통계 카드 */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        {[
          { label: '전체 일기', value: stats?.total ?? '-', icon: '📔', color: 'var(--primary-light)', iconColor: 'var(--primary)' },
          { label: '이번 달 일기', value: stats?.this_month ?? '-', icon: '📅', color: 'var(--secondary-light)', iconColor: 'var(--secondary)' },
          { label: '연속 기록', value: stats ? `${stats.streak_days}일` : '-', icon: '🔥', color: 'var(--warning-light)', iconColor: 'var(--warning)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>
              <span>{s.icon}</span>
            </div>
            <div>
              <div className="stat-value" style={{ color: s.iconColor }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 빠른 메뉴 */}
      <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 14 }}>빠른 메뉴</h3>
      <div className="grid-3" style={{ marginBottom: 32 }}>
        {quickMenus.map(m => (
          <Link key={m.href} href={m.href} style={{ textDecoration: 'none' }}>
            <div className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                {m.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: m.color }}>{m.label}</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 최근 일기 & 커뮤니티 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* 최근 일기 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>최근 감정 일기</h3>
            <Link href="/dashboard/diary" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>전체 보기 →</Link>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>불러오는 중...</div>
          ) : diaries.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>📔</div>
              <p style={{ fontSize: '0.875rem' }}>아직 작성된 일기가 없어요</p>
              <Link href="/dashboard/diary" className="btn btn-primary btn-sm" style={{ marginTop: 12, display: 'inline-flex' }}>첫 일기 쓰기</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {diaries.map((d: any) => (
                <div key={d.id} className="card card-sm" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem' }}>{emotionEmoji[d.emotion] || '😐'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{emotionLabels[d.emotion] || d.emotion}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(d.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 최근 커뮤니티 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>최근 커뮤니티 글</h3>
            <Link href="/dashboard/community" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>전체 보기 →</Link>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>불러오는 중...</div>
          ) : posts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>💬</div>
              <p style={{ fontSize: '0.875rem' }}>아직 글이 없어요</p>
              <Link href="/dashboard/community" className="btn btn-primary btn-sm" style={{ marginTop: 12, display: 'inline-flex' }}>첫 글 쓰기</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {posts.map((p: any) => (
                <div key={p.id} className="card card-sm">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>{p.category}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.author_nickname}</span>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                  <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 4 }}>❤️ {p.likes}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
