'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      const res = await fetch('http://localhost:8000/api/v1/auth/login', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || '로그인 실패');
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* 왼쪽 패널 */}
      <div className="auth-panel">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>💚</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>마음이음</h1>
          <p style={{ opacity: 0.85, lineHeight: 1.7 }}>
            당신의 마음을 안전하게 이어드립니다.<br />감정 일기, 익명 신고, 학생 커뮤니티
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 280 }}>
          {['📔 감정 일기 작성', '🚨 익명 신고 접수', '👥 학생 커뮤니티', '📊 감정 통계 분석'].map(item => (
            <div key={item} style={{
              background: 'rgba(255,255,255,0.15)', borderRadius: 10,
              padding: '12px 16px', fontSize: '0.9rem', backdropFilter: 'blur(4px)'
            }}>{item}</div>
          ))}
        </div>
      </div>

      {/* 오른쪽 폼 */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          <div style={{ marginBottom: 32 }}>
            <Link href="/" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
              ← 홈으로
            </Link>
            <h2 className="auth-title">다시 오셨군요! 👋</h2>
            <p className="auth-subtitle">이메일과 비밀번호로 로그인하세요</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">이메일</label>
              <input className="form-input" type="email" placeholder="student@school.edu"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">비밀번호</label>
              <input className="form-input" type="password" placeholder="비밀번호 입력"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && (
              <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                ⚠️ {error}
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 8 }} disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            아직 계정이 없으신가요?{' '}
            <Link href="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>회원가입</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
