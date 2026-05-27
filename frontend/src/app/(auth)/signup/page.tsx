'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const roles = [
  { value: 'STUDENT', label: '학생', icon: '🎓', desc: '학업/학교생활 지원' },
  { value: 'TEACHER', label: '선생님', icon: '👩‍🏫', desc: '학생 관리 및 모니터링' },
  { value: 'COUNSELOR', label: '상담사', icon: '💬', desc: '전문 상담 서비스' },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', password: '', confirm: '', nickname: '', role: 'STUDENT' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (form.password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return; }
    setError(''); setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('https://cku-123.onrender.com/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, nickname: form.nickname || '익명학생', role: form.role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || '회원가입 실패');
      // 자동 로그인
      const loginForm = new FormData();
      loginForm.append('username', form.email);
      loginForm.append('password', form.password);
      const loginRes = await fetch('http://localhost:8000/api/v1/auth/login', { method: 'POST', body: loginForm });
      const loginData = await loginRes.json();
      if (loginRes.ok) {
        localStorage.setItem('token', loginData.access_token);
        localStorage.setItem('user', JSON.stringify(loginData.user));
      }
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
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>💚</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>마음이음</h1>
          <p style={{ opacity: 0.85, lineHeight: 1.7 }}>함께라면 어떤 어려움도<br />극복할 수 있어요</p>
        </div>
        {/* 스텝 미리보기 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 260 }}>
          {[
            { n: 1, label: '기본 정보 입력', desc: '이메일과 비밀번호' },
            { n: 2, label: '프로필 설정', desc: '닉네임과 역할 선택' },
          ].map(s => (
            <div key={s.n} style={{
              background: step >= s.n ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
              borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
              border: step === s.n ? '1px solid rgba(255,255,255,0.5)' : '1px solid transparent',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: step > s.n ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                color: step > s.n ? 'var(--primary)' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0
              }}>{step > s.n ? '✓' : s.n}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.label}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 오른쪽 폼 */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          <Link href="/" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
            ← 홈으로
          </Link>

          {step === 1 ? (
            <>
              <h2 className="auth-title">계정 만들기</h2>
              <p className="auth-subtitle">기본 정보를 입력해주세요 (1/2)</p>
              <form onSubmit={nextStep} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">이메일</label>
                  <input className="form-input" type="email" placeholder="student@school.edu"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">비밀번호</label>
                  <input className="form-input" type="password" placeholder="6자 이상 입력"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">비밀번호 확인</label>
                  <input className="form-input" type="password" placeholder="비밀번호를 다시 입력"
                    value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
                </div>
                {error && <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>⚠️ {error}</div>}
                <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 8 }}>다음 단계 →</button>
              </form>
            </>
          ) : (
            <>
              <h2 className="auth-title">프로필 설정</h2>
              <p className="auth-subtitle">닉네임과 역할을 선택해주세요 (2/2)</p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="form-group">
                  <label className="form-label">닉네임</label>
                  <input className="form-input" type="text" placeholder="사용할 닉네임 (선택)"
                    value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>미입력 시 "익명학생"으로 설정됩니다</span>
                </div>
                <div className="form-group">
                  <label className="form-label">역할 선택</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {roles.map(r => (
                      <div key={r.value}
                        onClick={() => setForm({ ...form, role: r.value })}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                          border: `2px solid ${form.role === r.value ? 'var(--primary)' : 'var(--border)'}`,
                          borderRadius: 'var(--radius-md)', cursor: 'pointer',
                          background: form.role === r.value ? 'var(--primary-light)' : 'white',
                          transition: 'var(--transition)'
                        }}>
                        <span style={{ fontSize: '1.4rem' }}>{r.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: form.role === r.value ? 'var(--primary)' : 'var(--text-primary)' }}>{r.label}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.desc}</div>
                        </div>
                        {form.role === r.value && <span style={{ marginLeft: 'auto', color: 'var(--primary)', fontWeight: 700 }}>✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
                {error && <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>⚠️ {error}</div>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>← 이전</button>
                  <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                    {loading ? '처리 중...' : '가입 완료 🎉'}
                  </button>
                </div>
              </form>
            </>
          )}
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            이미 계정이 있으신가요?{' '}
            <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>로그인</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
