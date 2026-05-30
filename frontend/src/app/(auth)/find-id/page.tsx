'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://studentcare-production.up.railway.app/api/v1';

const i18n: Record<string, Record<string, string>> = {
  ko: {
    title: '아이디 찾기', subtitle: '가입 시 사용한 이메일로 계정을 찾을 수 있어요.',
    step1: '이메일 입력', step2: '인증 코드 확인', step3: '계정 정보',
    email: '이메일', email_ph: 'student@school.edu',
    send_code: '인증 코드 발송', sending: '발송 중...',
    code: '인증 코드 (6자리)', code_ph: '123456',
    verify: '인증 확인', verifying: '확인 중...',
    find_account: '계정 찾기', finding: '찾는 중...',
    back_login: '로그인으로 돌아가기', find_pw: '비밀번호 찾기',
    code_sent: '인증 코드가 이메일로 발송되었습니다.',
    code_verified: '인증이 완료되었습니다.',
    found: '아래 계정 정보를 확인하세요.',
    nickname: '닉네임', joined: '가입일',
    error_email: '이메일을 입력해주세요.',
    error_code: '인증 코드를 입력해주세요.',
  },
  en: {
    title: 'Find Account', subtitle: 'Find your account with the email used during registration.',
    step1: 'Enter Email', step2: 'Verify Code', step3: 'Account Info',
    email: 'Email', email_ph: 'student@school.edu',
    send_code: 'Send Verification Code', sending: 'Sending...',
    code: 'Verification Code (6 digits)', code_ph: '123456',
    verify: 'Verify', verifying: 'Verifying...',
    find_account: 'Find Account', finding: 'Finding...',
    back_login: 'Back to Login', find_pw: 'Find Password',
    code_sent: 'Verification code sent to your email.',
    code_verified: 'Verification successful.',
    found: 'Your account information is below.',
    nickname: 'Nickname', joined: 'Joined',
    error_email: 'Please enter your email.',
    error_code: 'Please enter the verification code.',
  },
  ja: {
    title: 'ID検索', subtitle: '登録時に使用したメールでアカウントを見つけられます。',
    step1: 'メール入力', step2: '認証コード確認', step3: 'アカウント情報',
    email: 'メールアドレス', email_ph: 'student@school.edu',
    send_code: '認証コード送信', sending: '送信中...',
    code: '認証コード（6桁）', code_ph: '123456',
    verify: '認証確認', verifying: '確認中...',
    find_account: 'アカウント検索', finding: '検索中...',
    back_login: 'ログインに戻る', find_pw: 'パスワード再設定',
    code_sent: '認証コードをメールに送信しました。',
    code_verified: '認証が完了しました。',
    found: '以下のアカウント情報を確認してください。',
    nickname: 'ニックネーム', joined: '登録日',
    error_email: 'メールアドレスを入力してください。',
    error_code: '認証コードを入力してください。',
  },
  zh: {
    title: '找回账号', subtitle: '通过注册时使用的邮箱找回账号。',
    step1: '输入邮箱', step2: '验证码确认', step3: '账号信息',
    email: '邮箱', email_ph: 'student@school.edu',
    send_code: '发送验证码', sending: '发送中...',
    code: '验证码（6位数字）', code_ph: '123456',
    verify: '验证确认', verifying: '验证中...',
    find_account: '查找账号', finding: '查找中...',
    back_login: '返回登录', find_pw: '找回密码',
    code_sent: '验证码已发送至您的邮箱。',
    code_verified: '验证成功。',
    found: '请查看以下账号信息。',
    nickname: '昵称', joined: '注册日期',
    error_email: '请输入邮箱地址。',
    error_code: '请输入验证码。',
  },
};

export default function FindIdPage() {
  const router = useRouter();
  const lang = typeof window !== 'undefined' ? (localStorage.getItem('lang') || 'ko') : 'ko';
  const t = i18n[lang] || i18n.ko;

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const sendCode = async () => {
    if (!email.trim()) { setError(t.error_email); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/auth/send-code`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'find_id' }),
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
        body: JSON.stringify({ email, code, purpose: 'find_id' }),
      });
      if (res.ok) { setMessage(t.code_verified); await findAccount(); }
      else { const d = await res.json(); setError(d.detail || '코드가 올바르지 않습니다.'); }
    } catch { setError('네트워크 오류가 발생했습니다.'); }
    setLoading(false);
  };

  const findAccount = async () => {
    try {
      const res = await fetch(`${API}/auth/find-id`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) { const data = await res.json(); setAccountInfo(data); setStep(3); }
      else { const d = await res.json(); setError(d.detail || '계정을 찾을 수 없습니다.'); }
    } catch { setError('네트워크 오류가 발생했습니다.'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '48px 40px', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        {/* 로고 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔍</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a2e' }}>{t.title}</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: 6 }}>{t.subtitle}</p>
        </div>

        {/* 스텝 인디케이터 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              width: s === step ? 32 : 10, height: 10, borderRadius: 5,
              background: s <= step ? '#667eea' : '#e5e7eb',
              transition: 'all 0.3s'
            }} />
          ))}
        </div>

        {/* 스텝 1: 이메일 입력 */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📧</div>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{t.step1}</h2>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: '#374151' }}>{t.email}</label>
              <input type="email" placeholder={t.email_ph} value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendCode()}
                style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '12px 16px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = '#667eea'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: '0.85rem' }}>⚠️ {error}</div>}
            <button onClick={sendCode} disabled={loading} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', padding: '14px', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? t.sending : t.send_code}
            </button>
          </div>
        )}

        {/* 스텝 2: 코드 확인 */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📨</div>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{t.step2}</h2>
              {message && <p style={{ color: '#059669', fontSize: '0.85rem', marginTop: 6 }}>✅ {message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: '#374151' }}>{t.code}</label>
              <input type="text" placeholder={t.code_ph} value={code} onChange={e => setCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && verifyCode()}
                maxLength={6} style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '12px 16px', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.3em', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
                onFocus={e => e.target.style.borderColor = '#667eea'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: '0.85rem' }}>⚠️ {error}</div>}
            <button onClick={verifyCode} disabled={loading} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', padding: '14px', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? t.verifying : t.verify}
            </button>
            <button onClick={() => { setStep(1); setError(''); setMessage(''); }} style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>
              ← 이메일 다시 입력
            </button>
          </div>
        )}

        {/* 스텝 3: 결과 */}
        {step === 3 && accountInfo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 8 }}>🎉</div>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#059669' }}>{t.found}</h2>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div><span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block' }}>{t.email}</span><span style={{ fontWeight: 700 }}>{accountInfo.email}</span></div>
                <div><span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block' }}>{t.nickname}</span><span style={{ fontWeight: 700 }}>{accountInfo.nickname}</span></div>
                <div><span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block' }}>{t.joined}</span><span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{accountInfo.created_at ? new Date(accountInfo.created_at).toLocaleDateString('ko-KR') : '-'}</span></div>
              </div>
            </div>
            <Link href="/login" style={{ display: 'block', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', padding: '14px', borderRadius: 12, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
              {t.back_login}
            </Link>
          </div>
        )}

        {/* 하단 링크 */}
        {step !== 3 && (
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: '#6b7280' }}>
            <Link href="/login" style={{ color: '#667eea', marginRight: 16 }}>{t.back_login}</Link>
            <Link href="/reset-password" style={{ color: '#667eea' }}>{t.find_pw}</Link>
          </div>
        )}
      </div>
    </div>
  );
}
