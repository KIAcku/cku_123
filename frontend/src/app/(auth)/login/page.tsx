'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const i18n: Record<string, Record<string, string>> = {
  ko: {
    back: '← 홈으로', greeting: '다시 오셨군요! 👋', subtitle: '이메일과 비밀번호로 로그인하세요',
    email: '이메일', password: '비밀번호', email_ph: 'student@school.edu', pass_ph: '비밀번호 입력',
    login: '로그인', logging_in: '로그인 중...', find_id: '아이디 찾기', find_pw: '비밀번호 찾기',
    no_account: '아직 계정이 없으신가요?', signup: '회원가입',
    panel_title: '마음이음', panel_sub: '당신의 마음을 안전하게 이어드립니다.\n감정 일기, 익명 신고, 학생 커뮤니티',
    menu: '📔 감정 일기 작성,🚨 익명 신고 접수,👥 학생 커뮤니티,📊 감정 통계 분석'
  },
  en: {
    back: '← Home', greeting: 'Welcome back! 👋', subtitle: 'Log in with your email and password',
    email: 'Email', password: 'Password', email_ph: 'student@school.edu', pass_ph: 'Enter password',
    login: 'Login', logging_in: 'Logging in...', find_id: 'Find ID', find_pw: 'Find Password',
    no_account: "Don't have an account?", signup: 'Sign Up',
    panel_title: 'MaumIeum', panel_sub: 'Connecting your heart safely.\nEmotion diary, anonymous report, student community',
    menu: '📔 Emotion Diary,🚨 Anonymous Report,👥 Student Community,📊 Emotion Statistics'
  },
  ja: {
    back: '← ホームへ', greeting: 'おかえりなさい！👋', subtitle: 'メールとパスワードでログインしてください',
    email: 'メールアドレス', password: 'パスワード', email_ph: 'student@school.edu', pass_ph: 'パスワードを入力',
    login: 'ログイン', logging_in: 'ログイン中...', find_id: 'ID検索', find_pw: 'パスワード再設定',
    no_account: 'アカウントをお持ちでないですか？', signup: '新規登録',
    panel_title: 'マウムイウム', panel_sub: 'あなたの心を安全につなぎます。\n感情日記、匿名報告、学生コミュニティ',
    menu: '📔 感情日記,🚨 匿名報告,👥 学生コミュニティ,📊 感情分析'
  },
  zh: {
    back: '← 首页', greeting: '欢迎回来！👋', subtitle: '使用邮箱和密码登录',
    email: '邮箱', password: '密码', email_ph: 'student@school.edu', pass_ph: '请输入密码',
    login: '登录', logging_in: '登录中...', find_id: '找回账号', find_pw: '找回密码',
    no_account: '还没有账号？', signup: '注册',
    panel_title: '마음이음', panel_sub: '安全连接您的内心。\n情绪日记、匿名举报、学生社区',
    menu: '📔 情绪日记,🚨 匿名举报,👥 学生社区,📊 情绪统计'
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState('ko');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const res = await fetch('https://cku-123.onrender.com/api/v1/auth/login',{ method: 'POST', body: formData });
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
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>{t.panel_title}</h1>
          <p style={{ opacity: 0.85, lineHeight: 1.7 }}>
            {t.panel_sub.split('\n').map((line, i) => (
              <span key={i}>{line}{i < t.panel_sub.split('\n').length - 1 && <br />}</span>
            ))}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 280 }}>
          {t.menu.split(',').map(item => (
            <div key={item} style={{
              background: 'rgba(255,255,255,0.15)', borderRadius: 10,
              padding: '12px 16px', fontSize: '0.9rem', backdropFilter: 'blur(4px)'
            }}>{item}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 32 }}>
          {(['ko', 'en', 'ja', 'zh'] as const).map(l => (
            <button key={l} onClick={() => { setLang(l); localStorage.setItem('lang', l); }} style={{
              padding: '4px 10px', borderRadius: 'var(--radius-full)',
              background: lang === l ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
              color: 'white', fontSize: '0.75rem', fontWeight: 700,
              border: lang === l ? '1px solid rgba(255,255,255,0.6)' : '1px solid transparent',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 오른쪽 폼 */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          <div style={{ marginBottom: 32 }}>
            <Link href="/" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
              {t.back}
            </Link>
            <h2 className="auth-title">{t.greeting}</h2>
            <p className="auth-subtitle">{t.subtitle}</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">{t.email}</label>
              <input className="form-input" type="email" placeholder={t.email_ph}
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t.password}</label>
              <input className="form-input" type="password" placeholder={t.pass_ph}
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && (
              <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                ⚠️ {error}
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 8 }} disabled={loading}>
              {loading ? t.logging_in : t.login}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Link href="/find-id" style={{ color: 'var(--primary)', marginRight: 16 }}>{t.find_id}</Link>
            <Link href="/reset-password" style={{ color: 'var(--primary)' }}>{t.find_pw}</Link>
          </div>
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {t.no_account}{' '}
            <Link href="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t.signup}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
