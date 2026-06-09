'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLangStore } from '@/store/langStore';
import { useThemeStore } from '@/store/themeStore';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://studentcare-production.up.railway.app/api/v1';

// ─── 다국어 ──────────────────────────────────────────────────
const i18n: Record<string, Record<string, string>> = {
  ko: {
    title: '시스템 설정',
    subtitle: '언어, 화면, 알림 등 개인 환경을 설정하세요.',
    lang_section: '🌐 언어 및 지역',
    lang_desc: '서비스 전체에 적용될 언어를 선택하세요.',
    display_section: '🎨 디스플레이',
    display_desc: '화면 테마와 표시 방식을 설정합니다.',
    notif_section: '🔔 알림 설정',
    notif_desc: '수신할 알림 유형을 선택하세요.',
    security_section: '🔒 보안',
    security_desc: '계정 보안과 개인정보를 관리합니다.',
    dark_mode: '다크 모드',
    light_mode: '라이트 모드',
    dark_desc: '어두운 배경으로 눈의 피로를 줄여줍니다.',
    light_desc: '밝은 배경으로 주간 사용에 적합합니다.',
    notif_notice: '새 공지사항 알림',
    notif_notice_desc: '새로운 공지사항이 등록되면 알림을 받습니다.',
    notif_counsel: '상담 답변 알림',
    notif_counsel_desc: '상담사가 답변을 남기면 알림을 받습니다.',
    notif_report: '신고 처리 알림',
    notif_report_desc: '신고가 처리되면 결과를 알림받습니다.',
    change_pw: '비밀번호 변경',
    change_pw_desc: '프로필 페이지에서 비밀번호를 변경할 수 있습니다.',
    go_profile: '프로필로 이동 →',
    export_data: '내 데이터 내보내기',
    export_desc: '감정 일기, 상담 기록 등을 JSON 형식으로 다운로드합니다.',
    export_btn: '📥 내보내기',
    delete_account: '계정 삭제',
    delete_desc: '계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.',
    delete_btn: '계정 삭제 요청',
    saved: '설정이 저장됐습니다 ✅',
    current_lang: '현재 언어',
    on: '켜짐', off: '꺼짐',
  },
  en: {
    title: 'System Settings',
    subtitle: 'Configure your language, display, and notification preferences.',
    lang_section: '🌐 Language & Region',
    lang_desc: 'Choose the language for the entire service.',
    display_section: '🎨 Display',
    display_desc: 'Set the theme and display options.',
    notif_section: '🔔 Notifications',
    notif_desc: 'Select the types of notifications you want to receive.',
    security_section: '🔒 Security',
    security_desc: 'Manage your account security and privacy.',
    dark_mode: 'Dark Mode',
    light_mode: 'Light Mode',
    dark_desc: 'Reduces eye strain with a dark background.',
    light_desc: 'Bright background, ideal for daytime use.',
    notif_notice: 'New Notice Alerts',
    notif_notice_desc: 'Get notified when a new notice is posted.',
    notif_counsel: 'Counsel Reply Alerts',
    notif_counsel_desc: 'Get notified when a counselor replies.',
    notif_report: 'Report Update Alerts',
    notif_report_desc: 'Get notified when your report is processed.',
    change_pw: 'Change Password',
    change_pw_desc: 'You can change your password from the Profile page.',
    go_profile: 'Go to Profile →',
    export_data: 'Export My Data',
    export_desc: 'Download your diary entries and counsel records as JSON.',
    export_btn: '📥 Export',
    delete_account: 'Delete Account',
    delete_desc: 'Deleting your account will permanently remove all your data.',
    delete_btn: 'Request Account Deletion',
    saved: 'Settings saved ✅',
    current_lang: 'Current language',
    on: 'On', off: 'Off',
  },
  ja: {
    title: 'システム設定',
    subtitle: '言語、画面、通知などの個人設定を行います。',
    lang_section: '🌐 言語と地域',
    lang_desc: 'サービス全体に適用する言語を選択してください。',
    display_section: '🎨 ディスプレイ',
    display_desc: '画面テーマと表示方法を設定します。',
    notif_section: '🔔 通知設定',
    notif_desc: '受け取る通知の種類を選択してください。',
    security_section: '🔒 セキュリティ',
    security_desc: 'アカウントのセキュリティとプライバシーを管理します。',
    dark_mode: 'ダークモード',
    light_mode: 'ライトモード',
    dark_desc: '暗い背景で目の疲れを軽減します。',
    light_desc: '明るい背景で昼間の使用に適しています。',
    notif_notice: '新しいお知らせ通知',
    notif_notice_desc: '新しいお知らせが投稿されたときに通知を受け取ります。',
    notif_counsel: '相談返答通知',
    notif_counsel_desc: 'カウンセラーが返答したときに通知を受け取ります。',
    notif_report: '報告処理通知',
    notif_report_desc: '報告が処理されたときに通知を受け取ります。',
    change_pw: 'パスワード変更',
    change_pw_desc: 'プロフィールページからパスワードを変更できます。',
    go_profile: 'プロフィールへ →',
    export_data: 'データのエクスポート',
    export_desc: '日記や相談記録をJSON形式でダウンロードします。',
    export_btn: '📥 エクスポート',
    delete_account: 'アカウント削除',
    delete_desc: 'アカウントを削除すると、すべてのデータが永久に削除されます。',
    delete_btn: 'アカウント削除申請',
    saved: '設定が保存されました ✅',
    current_lang: '現在の言語',
    on: 'オン', off: 'オフ',
  },
  zh: {
    title: '系统设置',
    subtitle: '配置您的语言、显示和通知偏好。',
    lang_section: '🌐 语言和地区',
    lang_desc: '选择适用于整个服务的语言。',
    display_section: '🎨 显示',
    display_desc: '设置主题和显示方式。',
    notif_section: '🔔 通知设置',
    notif_desc: '选择您要接收的通知类型。',
    security_section: '🔒 安全',
    security_desc: '管理您的账户安全和隐私。',
    dark_mode: '深色模式',
    light_mode: '浅色模式',
    dark_desc: '深色背景，减轻眼睛疲劳。',
    light_desc: '明亮背景，适合白天使用。',
    notif_notice: '新公告通知',
    notif_notice_desc: '发布新公告时接收通知。',
    notif_counsel: '咨询回复通知',
    notif_counsel_desc: '咨询师回复时接收通知。',
    notif_report: '举报处理通知',
    notif_report_desc: '举报处理完成时接收通知。',
    change_pw: '修改密码',
    change_pw_desc: '您可以在个人资料页面修改密码。',
    go_profile: '前往个人资料 →',
    export_data: '导出我的数据',
    export_desc: '以JSON格式下载日记和咨询记录。',
    export_btn: '📥 导出',
    delete_account: '删除账户',
    delete_desc: '删除账户将永久删除所有数据。',
    delete_btn: '申请删除账户',
    saved: '设置已保存 ✅',
    current_lang: '当前语言',
    on: '开', off: '关',
  },
};

const langs = [
  { code: 'ko', label: '한국어', flag: '🇰🇷', desc: 'Korean' },
  { code: 'en', label: 'English', flag: '🇺🇸', desc: 'English' },
  { code: 'ja', label: '日本語', flag: '🇯🇵', desc: 'Japanese' },
  { code: 'zh', label: '中文', flag: '🇨🇳', desc: 'Chinese' },
];

interface NotifSettings {
  notice: boolean;
  counsel: boolean;
  report: boolean;
}

function ToggleSwitch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 48, height: 26, borderRadius: 999,
        background: on ? 'var(--grad-sunset)' : 'var(--glass-border)',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s ease', flexShrink: 0,
        boxShadow: on ? '0 2px 12px rgba(255,45,120,0.4)' : 'none',
      }}
    >
      <motion.span
        animate={{ x: on ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          display: 'block', width: 20, height: 20, borderRadius: '50%',
          background: 'white', position: 'absolute', top: 3,
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { lang, setLang } = useLangStore();
  const { theme, toggleTheme } = useThemeStore();
  const [toast, setToast] = useState('');
  const [notif, setNotif] = useState<NotifSettings>({ notice: true, counsel: true, report: true });

  const t = i18n[lang] || i18n.ko;

  useEffect(() => {
    // 알림 설정 로드
    try {
      const saved = localStorage.getItem('notif_settings');
      if (saved) setNotif(JSON.parse(saved));
    } catch {}
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const switchLang = (code: string) => {
    setLang(code);
    localStorage.setItem('lang', code);
    showToast((i18n[code] || i18n.ko).saved);
  };

  const updateNotif = (key: keyof NotifSettings, val: boolean) => {
    const next = { ...notif, [key]: val };
    setNotif(next);
    localStorage.setItem('notif_settings', JSON.stringify(next));
    showToast(t.saved);
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const [diaryRes] = await Promise.all([
        fetch(`${API}/diaries`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const diary = diaryRes.ok ? await diaryRes.json() : [];
      const blob = new Blob([JSON.stringify({ diary }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `maumium_export_${Date.now()}.json`;
      a.click(); URL.revokeObjectURL(url);
      showToast('📥 내보내기 완료!');
    } catch { showToast('오류가 발생했습니다.'); }
  };

  // ─── 섹션 카드 스타일 ────────────────────────────────────
  const sectionStyle: React.CSSProperties = {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(24px)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-xl)',
    padding: '28px 32px',
    marginBottom: 20,
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 0', borderBottom: '1px solid var(--glass-border)',
  };

  const rowLastStyle: React.CSSProperties = {
    ...rowStyle, borderBottom: 'none',
  };

  return (
    <div className="page-content" style={{ maxWidth: 760 }}>
      {/* 헤더 배너 */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 32px',
          marginBottom: 24,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: -40, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: 180, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <span style={{ fontSize: '1.8rem' }}>⚙️</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t.title}</h1>
          </div>
          <p style={{ opacity: 0.85, fontSize: '0.88rem' }}>{t.subtitle}</p>
        </div>
      </motion.div>

      {/* ─── 언어 섹션 ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={sectionStyle}
      >
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>{t.lang_section}</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t.lang_desc}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {langs.map((l) => {
            const isSelected = lang === l.code;
            return (
              <motion.button
                key={l.code}
                onClick={() => switchLang(l.code)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 18px',
                  background: isSelected ? 'var(--glass-bg-active)' : 'var(--glass-bg)',
                  border: `2px solid ${isSelected ? 'var(--sunset-pink)' : 'var(--glass-border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? '0 0 20px rgba(255,45,120,0.2)' : 'none',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: '2rem', lineHeight: 1 }}>{l.flag}</span>
                <div>
                  <div style={{
                    fontSize: '0.92rem', fontWeight: 700,
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}>
                    {l.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{l.desc}</div>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      marginLeft: 'auto', width: 20, height: 20,
                      background: 'var(--grad-sunset)', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', color: 'white', fontWeight: 800, flexShrink: 0,
                    }}
                  >
                    ✓
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ─── 디스플레이 섹션 ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.10 }}
        style={sectionStyle}
      >
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>{t.display_section}</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t.display_desc}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* 다크 모드 카드 */}
          <motion.button
            onClick={() => theme !== 'dark' && toggleTheme()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '20px',
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(109,40,217,0.3), rgba(255,45,120,0.2))'
                : 'var(--glass-bg)',
              border: `2px solid ${theme === 'dark' ? 'var(--sunset-purple)' : 'var(--glass-border)'}`,
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              transition: 'all 0.18s ease',
              boxShadow: theme === 'dark' ? '0 0 24px rgba(109,40,217,0.25)' : 'none',
            }}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: 10 }}>🌙</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>
              {t.dark_mode}
              {theme === 'dark' && (
                <span style={{
                  marginLeft: 8, background: 'var(--grad-sunset)', color: 'white',
                  borderRadius: 999, padding: '1px 8px', fontSize: '0.65rem', fontWeight: 800,
                }}>현재</span>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.dark_desc}</div>
          </motion.button>

          {/* 라이트 모드 카드 */}
          <motion.button
            onClick={() => theme !== 'light' && toggleTheme()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '20px',
              background: theme === 'light'
                ? 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(255,107,53,0.10))'
                : 'var(--glass-bg)',
              border: `2px solid ${theme === 'light' ? '#FBBF24' : 'var(--glass-border)'}`,
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              transition: 'all 0.18s ease',
              boxShadow: theme === 'light' ? '0 0 24px rgba(251,191,36,0.2)' : 'none',
            }}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: 10 }}>☀️</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>
              {t.light_mode}
              {theme === 'light' && (
                <span style={{
                  marginLeft: 8, background: 'linear-gradient(135deg,#FBBF24,#F97316)', color: 'white',
                  borderRadius: 999, padding: '1px 8px', fontSize: '0.65rem', fontWeight: 800,
                }}>현재</span>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.light_desc}</div>
          </motion.button>
        </div>
      </motion.div>

      {/* ─── 알림 섹션 ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={sectionStyle}
      >
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>{t.notif_section}</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t.notif_desc}</p>
        </div>

        {([
          { key: 'notice' as const, label: t.notif_notice, desc: t.notif_notice_desc },
          { key: 'counsel' as const, label: t.notif_counsel, desc: t.notif_counsel_desc },
          { key: 'report'  as const, label: t.notif_report,  desc: t.notif_report_desc },
        ]).map((item, i, arr) => (
          <div key={item.key} style={i === arr.length - 1 ? rowLastStyle : rowStyle}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 16 }}>
              <span style={{ fontSize: '0.75rem', color: notif[item.key] ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                {notif[item.key] ? t.on : t.off}
              </span>
              <ToggleSwitch on={notif[item.key]} onChange={(v) => updateNotif(item.key, v)} />
            </div>
          </div>
        ))}
      </motion.div>

      {/* ─── 보안 섹션 ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.20 }}
        style={sectionStyle}
      >
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>{t.security_section}</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t.security_desc}</p>
        </div>

        {/* 비밀번호 변경 */}
        <div style={rowStyle}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 3 }}>{t.change_pw}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.change_pw_desc}</div>
          </div>
          <button
            onClick={() => router.push('/dashboard/profile')}
            style={{
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)', padding: '8px 14px',
              fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)',
              cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: 16,
              transition: 'var(--transition)',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--sunset-pink)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            {t.go_profile}
          </button>
        </div>

        {/* 데이터 내보내기 */}
        <div style={rowStyle}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 3 }}>{t.export_data}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.export_desc}</div>
          </div>
          <button
            onClick={handleExport}
            style={{
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)', padding: '8px 14px',
              fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)',
              cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: 16,
              transition: 'var(--transition)', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--info)'; e.currentTarget.style.color = 'var(--info)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            {t.export_btn}
          </button>
        </div>

        {/* 계정 삭제 */}
        <div style={rowLastStyle}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 3, color: 'var(--danger)' }}>{t.delete_account}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.delete_desc}</div>
          </div>
          <button
            onClick={() => {
              if (confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                alert('관리자에게 문의해주세요 (support@maumium.kr)');
              }
            }}
            style={{
              background: 'var(--danger-bg)', border: '1px solid rgba(255,77,109,0.25)',
              borderRadius: 'var(--radius-md)', padding: '8px 14px',
              fontSize: '0.8rem', fontWeight: 600, color: 'var(--danger)',
              cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: 16,
              transition: 'var(--transition)', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)'; }}
          >
            {t.delete_btn}
          </button>
        </div>
      </motion.div>

      {/* 버전 정보 */}
      <div style={{ textAlign: 'center', paddingBottom: 32, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
        마음이음 v2.0 · © 2025 CKU
      </div>

      {/* 토스트 */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--bg-layer3)', color: 'var(--text-primary)',
            padding: '13px 24px', borderRadius: 40,
            fontSize: '0.88rem', fontWeight: 500, zIndex: 300,
            whiteSpace: 'nowrap', boxShadow: 'var(--glass-shadow)',
            border: '1px solid var(--glass-border)', backdropFilter: 'blur(16px)',
          }}
        >
          {toast}
        </motion.div>
      )}
    </div>
  );
}
