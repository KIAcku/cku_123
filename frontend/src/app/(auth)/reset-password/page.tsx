'use client';
import { useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://studentcare-production.up.railway.app/api/v1';

const i18n: Record<string, Record<string, string>> = {
  ko: {
    title: '비밀번호 찾기', subtitle: '이메일 인증으로 비밀번호를 재설정하세요.',
    step1: '이메일 입력', step2: '인증 코드 확인', step3: '새 비밀번호 설정',
    email: '이메일', email_ph: 'student@school.edu',
    send_code: '인증 코드 발송', sending: '발송 중...',
    code: '인증 코드 (6자리)', code_ph: '123456',
    verify: '인증 확인', verifying: '확인 중...',
    new_pw: '새 비밀번호', confirm_pw: '새 비밀번호 확인',
    pw_ph: '새 비밀번호 입력 (8자 이상)', confirm_ph: '비밀번호 다시 입력',
    reset: '비밀번호 재설정', resetting: '재설정 중...',
    back_login: '로그인으로 돌아가기', find_id: '아이디 찾기',
    code_sent: '인증 코드가 이메일로 발송되었습니다.',
    code_verified: '인증이 완료되었습니다.',
    success_title: '비밀번호가 재설정되었습니다!',
    success_msg: '새 비밀번호로 로그인하세요.',
    go_login: '로그인하기',
    pw_mismatch: '새 비밀번호가 일치하지 않습니다.',
    pw_short: '비밀번호는 8자 이상이어야 합니다.',
    error_email: '이메일을 입력해주세요.',
    error_code: '인증 코드를 입력해주세요.',
  },
  en: {
    title: 'Find Password', subtitle: 'Reset your password via email verification.',
    step1: 'Enter Email', step2: 'Verify Code', step3: 'Set New Password',
    email: 'Email', email_ph: 'student@school.edu',
    send_code: 'Send Code', sending: 'Sending...',
    code: 'Verification Code (6 digits)', code_ph: '123456',
    verify: 'Verify', verifying: 'Verifying...',
    new_pw: 'New Password', confirm_pw: 'Confirm New Password',
    pw_ph: 'Enter new password (8+ chars)', confirm_ph: 'Re-enter password',
    reset: 'Reset Password', resetting: 'Resetting...',
    back_login: 'Back to Login', find_id: 'Find ID',
    code_sent: 'Verification code sent to your email.',
    code_verified: 'Verification successful.',
    success_title: 'Password Reset Successful!',
    success_msg: 'Login with your new password.',
    go_login: 'Go to Login',
    pw_mismatch: 'Passwords do not match.',
    pw_short: 'Password must be at least 8 characters.',
    error_email: 'Please enter your email.',
    error_code: 'Please enter the verification code.',
  },
  ja: {
    title: 'パスワード再設定', subtitle: 'メール認証でパスワードをリセットしてください。',
    step1: 'メール入力', step2: '認証コード確認', step3: '新しいパスワード設定',
    email: 'メールアドレス', email_ph: 'student@school.edu',
    send_code: '認証コード送信', sending: '送信中...',
    code: '認証コード（6桁）', code_ph: '123456',
    verify: '認証確認', verifying: '確認中...',
    new_pw: '新しいパスワード', confirm_pw: 'パスワード確認',
    pw_ph: '新しいパスワード（8文字以上）', confirm_ph: 'パスワードを再入力',
    reset: 'パスワードをリセット', resetting: 'リセット中...',
    back_login: 'ログインに戻る', find_id: 'ID検索',
    code_sent: '認証コードをメールに送信しました。',
    code_verified: '認証が完了しました。',
    success_title: 'パスワードがリセットされました！',
    success_msg: '新しいパスワードでログインしてください。',
    go_login: 'ログイン',
    pw_mismatch: 'パスワードが一致しません。',
    pw_short: 'パスワードは8文字以上必要です。',
    error_email: 'メールアドレスを入力してください。',
    error_code: '認証コードを入力してください。',
  },
  zh: {
    title: '找回密码', subtitle: '通过邮箱验证重置密码。',
    step1: '输入邮箱', step2: '验证码确认', step3: '设置新密码',
    email: '邮箱', email_ph: 'student@school.edu',
    send_code: '发送验证码', sending: '发送中...',
    code: '验证码（6位数字）', code_ph: '123456',
    verify: '验证确认', verifying: '验证中...',
    new_pw: '新密码', confirm_pw: '确认新密码',
    pw_ph: '输入新密码（8位以上）', confirm_ph: '再次输入密码',
    reset: '重置密码', resetting: '重置中...',
    back_login: '返回登录', find_id: '找回账号',
    code_sent: '验证码已发送至您的邮箱。',
    code_verified: '验证成功。',
    success_title: '密码重置成功！',
    success_msg: '请使用新密码登录。',
    go_login: '去登录',
    pw_mismatch: '密码不匹配。',
    pw_short: '密码至少需要8个字符。',
    error_email: '请输入邮箱地址。',
    error_code: '请输入验证码。',
  },
};

const inputStyle = {
  width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 12,
  padding: '12px 16px', fontSize: '0.95rem', outline: 'none',
  boxSizing: 'border-box' as const, fontFamily: 'inherit',
};

export default function ResetPasswordPage() {
  const lang = typeof window !== 'undefined' ? (localStorage.getItem('lang') || 'ko') : 'ko';
  const t = i18n[lang] || i18n.ko;

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const sendCode = async () => {
    if (!email.trim()) { setError(t.error_email); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/auth/send-code`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'reset_password' }),
      });
      if (res.ok) { setMessage(t.code_sent); setStep(2); }
      else { const d = await res.json(); setError(d.detail || '오류가 발생했습니다.'); }
    } catch { setError('네트워크 오류가 발생했습니다.'); }
    setLoading(false);
  };

  const verifyCode = async () => {
    if (!code.trim()) { setError(t.error_code); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/auth/verify-code`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, purpose: 'reset_password' }),
      });
      if (res.ok) { setMessage(t.code_verified); setStep(3); }
      else { const d = await res.json(); setError(d.detail || '코드가 올바르지 않습니다.'); }
    } catch { setError('네트워크 오류가 발생했습니다.'); }
    setLoading(false);
  };

  const resetPassword = async () => {
    if (newPw !== confirmPw) { setError(t.pw_mismatch); return; }
    if (newPw.length < 8) { setError(t.pw_short); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, new_password: newPw }),
      });
      if (res.ok) setStep(4);
      else { const d = await res.json(); setError(d.detail || '오류가 발생했습니다.'); }
    } catch { setError('네트워크 오류가 발생했습니다.'); }
    setLoading(false);
  };

  const btnStyle = (disabled: boolean = false) => ({
    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white',
    padding: '14px', borderRadius: 12, border: 'none', fontWeight: 700,
    fontSize: '1rem', cursor: disabled ? 'not-allowed' as const : 'pointer' as const, opacity: disabled ? 0.7 : 1, width: '100%',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '48px 40px', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔑</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a2e' }}>{t.title}</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: 6 }}>{t.subtitle}</p>
        </div>

        {/* 진행 바 */}
        {step < 4 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 32 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ width: s === step ? 32 : 10, height: 10, borderRadius: 5, background: s <= step ? '#7c3aed' : '#e5e7eb', transition: 'all 0.3s' }} />
            ))}
          </div>
        )}

        {/* 스텝 1 */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📧</div>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{t.step1}</h2>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: '#374151' }}>{t.email}</label>
              <input type="email" placeholder={t.email_ph} value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendCode()} style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: '0.85rem' }}>⚠️ {error}</div>}
            <button onClick={sendCode} disabled={loading} style={btnStyle(loading)}>{loading ? t.sending : t.send_code}</button>
          </div>
        )}

        {/* 스텝 2 */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📨</div>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{t.step2}</h2>
              {message && <p style={{ color: '#059669', fontSize: '0.85rem', marginTop: 6 }}>✅ {message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: '#374151' }}>{t.code}</label>
              <input type="text" placeholder={t.code_ph} value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && verifyCode()} maxLength={6}
                style={{ ...inputStyle, fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.3em', fontFamily: 'monospace' }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: '0.85rem' }}>⚠️ {error}</div>}
            <button onClick={verifyCode} disabled={loading} style={btnStyle(loading)}>{loading ? t.verifying : t.verify}</button>
            <button onClick={() => { setStep(1); setError(''); setMessage(''); }} style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>← 이메일 다시 입력</button>
          </div>
        )}

        {/* 스텝 3 */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🔐</div>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{t.step3}</h2>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: '#374151' }}>{t.new_pw}</label>
              <input type="password" placeholder={t.pw_ph} value={newPw} onChange={e => setNewPw(e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: '#374151' }}>{t.confirm_pw}</label>
              <input type="password" placeholder={t.confirm_ph} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && resetPassword()} style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: '0.85rem' }}>⚠️ {error}</div>}
            <button onClick={resetPassword} disabled={loading || !newPw || !confirmPw} style={btnStyle(loading || !newPw || !confirmPw)}>{loading ? t.resetting : t.reset}</button>
          </div>
        )}

        {/* 스텝 4: 성공 */}
        {step === 4 && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ fontSize: '4rem' }}>🎉</div>
            <div>
              <h2 style={{ fontWeight: 800, color: '#059669', marginBottom: 8 }}>{t.success_title}</h2>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{t.success_msg}</p>
            </div>
            <Link href="/login" style={{ display: 'block', ...btnStyle(), textDecoration: 'none', textAlign: 'center' }}>{t.go_login}</Link>
          </div>
        )}

        {/* 하단 링크 */}
        {step < 4 && (
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: '#6b7280' }}>
            <Link href="/login" style={{ color: '#7c3aed', marginRight: 16 }}>{t.back_login}</Link>
            <Link href="/find-id" style={{ color: '#7c3aed' }}>{t.find_id}</Link>
          </div>
        )}
      </div>
    </div>
  );
}
