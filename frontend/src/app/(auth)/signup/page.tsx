'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { API_BASE } from '@/lib/apiClient';

const roles = [
  { value: 'STUDENT', label: '학생', icon: '🎓', desc: '학업/학교생활 지원', grad: 'linear-gradient(135deg,#FF6B35,#FF2D78)' },
  { value: 'TEACHER', label: '선생님', icon: '👩‍🏫', desc: '학생 관리 및 모니터링', grad: 'linear-gradient(135deg,#3B82F6,#6366F1)' },
  { value: 'COUNSELOR', label: '상담사', icon: '💬', desc: '전문 상담 서비스', grad: 'linear-gradient(135deg,#9333EA,#6D28D9)' },
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
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, nickname: form.nickname || '익명학생', role: form.role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || '회원가입 실패');
      const loginForm = new FormData();
      loginForm.append('username', form.email);
      loginForm.append('password', form.password);
      const loginRes = await fetch(`${API_BASE}/auth/login`, { method: 'POST', body: loginForm });
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
    <div className="auth-bg">
      <div className="aurora-bg">
        <div className="aurora-blob-center" />
      </div>

      <Link href="/" style={{
        position: 'fixed', top: 24, left: 24, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: '0.85rem', color: 'var(--text-muted)',
        background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-full)', padding: '8px 16px',
        backdropFilter: 'blur(12px)',
      }}>
        ← 홈으로
      </Link>

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ maxWidth: 460 }}
      >
        <div className="glass-card-lg" style={{ padding: '40px 36px' }}>
          {/* 로고 + 헤더 */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg,#FF6B35,#FF2D78,#9333EA)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', margin: '0 auto 14px',
              boxShadow: '0 6px 24px rgba(255,45,120,0.4)',
            }}>💜</div>
            <h2 className="auth-title" style={{ color: 'var(--text-primary)' }}>
              {step === 1 ? '계정 만들기' : '프로필 설정'}
            </h2>
            <p className="auth-subtitle">
              {step === 1 ? '기본 정보를 입력해주세요' : '닉네임과 역할을 선택해주세요'}
            </p>
          </div>

          {/* 스텝 인디케이터 */}
          <div className="steps" style={{ marginBottom: 28 }}>
            {[1, 2].map((n, i) => (
              <div key={n} className="step-item">
                <div className={`step-circle ${step > n ? 'done' : step === n ? 'active' : ''}`}>
                  {step > n ? '✓' : n}
                </div>
                {i < 1 && <div className={`step-line ${step > n ? 'done' : ''}`} />}
              </div>
            ))}
          </div>

          {/* 폼 내용 */}
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                onSubmit={nextStep}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
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
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(255,77,109,0.2)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                    ⚠️ {error}
                  </motion.div>
                )}
                <motion.button type="submit" className="btn btn-sunset btn-full" style={{ height: 52, marginTop: 4 }}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  다음 단계 →
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
              >
                <div className="form-group">
                  <label className="form-label">닉네임 (선택)</label>
                  <input className="form-input" type="text" placeholder="사용할 닉네임"
                    value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>미입력 시 "익명학생"으로 설정됩니다</span>
                </div>
                <div className="form-group">
                  <label className="form-label">역할 선택</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {roles.map(r => (
                      <motion.div
                        key={r.value}
                        onClick={() => setForm({ ...form, role: r.value })}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                          border: `1.5px solid ${form.role === r.value ? 'rgba(255,45,120,0.4)' : 'var(--glass-border)'}`,
                          borderRadius: 'var(--radius-md)', cursor: 'pointer',
                          background: form.role === r.value ? 'rgba(255,45,120,0.08)' : 'var(--glass-bg)',
                          backdropFilter: 'blur(8px)',
                          transition: 'var(--transition)',
                        }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div style={{
                          width: 40, height: 40, borderRadius: 10, background: r.grad,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.3rem', flexShrink: 0,
                          boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
                        }}>
                          {r.icon}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{r.label}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.desc}</div>
                        </div>
                        {form.role === r.value && (
                          <span style={{
                            marginLeft: 'auto', width: 22, height: 22,
                            borderRadius: '50%', background: 'var(--grad-sunset)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', color: 'white', fontWeight: 700,
                          }}>✓</span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(255,77,109,0.2)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                    ⚠️ {error}
                  </motion.div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-glass" onClick={() => setStep(1)}
                    style={{ flexShrink: 0 }}>← 이전</button>
                  <motion.button type="submit" className="btn btn-sunset btn-full" disabled={loading}
                    whileHover={!loading ? { scale: 1.01 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}>
                    {loading ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="spinner" />처리 중...</span> : '가입 완료 🎉'}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="divider" style={{ margin: '20px 0' }} />
          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            이미 계정이 있으신가요?{' '}
            <Link href="/login" style={{
              background: 'linear-gradient(135deg,#FF6B35,#FF2D78)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              fontWeight: 700,
            }}>로그인</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
