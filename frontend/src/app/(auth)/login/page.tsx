'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

const i18n: Record<string, Record<string, string>> = {
  ko: {
    back: '← 홈으로', greeting: '다시 오셨군요! 👋', subtitle: '이메일과 비밀번호로 로그인하세요',
    email: '이메일', password: '비밀번호', email_ph: 'student@school.edu', pass_ph: '비밀번호 입력',
    login: '로그인', logging_in: '로그인 중...', find_id: '아이디 찾기', find_pw: '비밀번호 찾기',
    no_account: '아직 계정이 없으신가요?', signup: '회원가입',
  },
  en: {
    back: '← Home', greeting: 'Welcome back! 👋', subtitle: 'Log in with your email and password',
    email: 'Email', password: 'Password', email_ph: 'student@school.edu', pass_ph: 'Enter password',
    login: 'Login', logging_in: 'Logging in...', find_id: 'Find ID', find_pw: 'Forgot Password',
    no_account: "Don't have an account?", signup: 'Sign Up',
  },
  ja: {
    back: '← ホームへ', greeting: 'おかえりなさい！👋', subtitle: 'メールとパスワードでログインしてください',
    email: 'メールアドレス', password: 'パスワード', email_ph: 'student@school.edu', pass_ph: 'パスワードを入力',
    login: 'ログイン', logging_in: 'ログイン中...', find_id: 'ID検索', find_pw: 'パスワード再設定',
    no_account: 'アカウントをお持ちでないですか？', signup: '新規登録',
  },
  zh: {
    back: '← 首页', greeting: '欢迎回来！👋', subtitle: '使用邮箱和密码登录',
    email: '邮箱', password: '密码', email_ph: 'student@school.edu', pass_ph: '请输入密码',
    login: '登录', logging_in: '登录中...', find_id: '找回账号', find_pw: '忘记密码',
    no_account: '还没有账号？', signup: '注册',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState('ko');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') || 'ko';
    setLang(savedLang);
  }, []);

  const t = i18n[lang] || i18n.ko;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      const res = await fetch('https://cku-123.onrender.com/api/v1/auth/login', { method: 'POST', body: formData });
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
    <div className="auth-bg">
      {/* 오로라 배경 */}
      <div className="aurora-bg">
        <div className="aurora-blob-center" />
      </div>

      {/* 홈 링크 */}
      <Link href="/" style={{
        position: 'fixed', top: 24, left: 24, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: '0.85rem', color: 'var(--text-muted)',
        background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-full)', padding: '8px 16px',
        backdropFilter: 'blur(12px)',
        transition: 'var(--transition)',
      }}>
        {t.back}
      </Link>

      {/* 로그인 카드 */}
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className="glass-card-lg" style={{ padding: '40px 36px' }}>
          {/* 로고 */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 2, delay: 0.5 }}
              style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'linear-gradient(135deg,#FF6B35,#FF2D78,#9333EA)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem', margin: '0 auto 16px',
                boxShadow: '0 8px 30px rgba(255,45,120,0.4)',
              }}
            >
              💜
            </motion.div>
            <h2 className="auth-title" style={{ color: 'var(--text-primary)' }}>{t.greeting}</h2>
            <p className="auth-subtitle">{t.subtitle}</p>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">{t.email}</label>
              <input
                className="form-input"
                type="email"
                placeholder={t.email_ph}
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
                style={{
                  boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(255,45,120,0.15)' : undefined,
                }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t.password}</label>
              <input
                className="form-input"
                type="password"
                placeholder={t.pass_ph}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                required
                style={{
                  boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(255,45,120,0.15)' : undefined,
                }}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'var(--danger-bg)', color: 'var(--danger)',
                  border: '1px solid rgba(255,77,109,0.2)',
                  padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                }}
              >
                ⚠️ {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              className="btn btn-sunset btn-full"
              style={{ height: 52, fontSize: '1rem', marginTop: 4 }}
              disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="spinner" />
                  {t.logging_in}
                </span>
              ) : t.login}
            </motion.button>
          </form>

          {/* 부가 링크 */}
          <div style={{ textAlign: 'center', marginTop: 14, fontSize: '0.8rem' }}>
            <Link href="/find-id" style={{ color: 'var(--text-muted)', marginRight: 16, transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--sunset-pink)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >{t.find_id}</Link>
            <Link href="/reset-password" style={{ color: 'var(--text-muted)', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--sunset-pink)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >{t.find_pw}</Link>
          </div>

          <div className="divider" style={{ margin: '20px 0' }} />

          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {t.no_account}{' '}
            <Link href="/signup" style={{
              background: 'linear-gradient(135deg,#FF6B35,#FF2D78)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              fontWeight: 700,
            }}>{t.signup}</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
