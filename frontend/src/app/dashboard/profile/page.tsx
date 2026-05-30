'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/apiClient';

const API = API_BASE;
const BACKEND = API.replace('/api/v1', '');

// ─── 다국어 번역 ──────────────────────────────────────────────
const i18n: Record<string, Record<string, string>> = {
  ko: {
    title: '내 프로필', subtitle: '계정 정보와 활동 내역을 확인하고 관리하세요.',
    account_settings: '⚙️ 계정 설정', my_diaries: '📔 내 일기',
    edit_profile: '프로필 수정', email: '이메일', email_hint: '이메일은 변경할 수 없습니다',
    nickname: '닉네임', nickname_ph: '닉네임 입력', language: '언어',
    save_changes: '변경 사항 저장', saving: '저장 중...',
    avatar_hint: '클릭하여 프로필 사진 변경',
    photo_uploading: '업로드 중...', photo_changed: '프로필 사진이 변경되었습니다 ✅',
    change_password: '🔑 비밀번호 변경', current_pw: '현재 비밀번호', new_pw: '새 비밀번호',
    confirm_pw: '새 비밀번호 확인', change_pw_btn: '비밀번호 변경',
    pw_mismatch: '새 비밀번호가 일치하지 않습니다.', pw_changed: '✅ 비밀번호가 변경되었습니다.',
    guardian_email: '👨‍👩‍👧 보호자 이메일', guardian_ph: '보호자 이메일 입력',
    guardian_hint: '위급 상황 시 보호자에게 알림이 전송됩니다.', guardian_save: '보호자 이메일 저장',
    danger_zone: '⚠️ 위험 구역', delete_account: '계정 삭제', delete_hint: '계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.',
    delete_confirm_title: '정말 계정을 삭제하시겠습니까?',
    delete_confirm_msg: '이 작업은 취소할 수 없습니다. 모든 일기, 상담 내역, 게시글이 영구적으로 삭제됩니다.',
    enter_pw_to_delete: '비밀번호를 입력하여 확인하세요', confirm_delete: '계정 영구 삭제',
    cancel: '취소', logout: '🚪 로그아웃',
    diary_count: '감정 일기', post_count: '커뮤니티 글', comment_count: '댓글', report_count: '익명 신고',
    no_diaries: '아직 작성한 일기가 없어요', intensity: '강도',
    profile_saved: '프로필이 저장되었습니다 ✅',
  },
  en: {
    title: 'My Profile', subtitle: 'View and manage your account information and activity.',
    account_settings: '⚙️ Account Settings', my_diaries: '📔 My Diaries',
    edit_profile: 'Edit Profile', email: 'Email', email_hint: 'Email cannot be changed',
    nickname: 'Nickname', nickname_ph: 'Enter nickname', language: 'Language',
    save_changes: 'Save Changes', saving: 'Saving...',
    avatar_hint: 'Click to change profile photo',
    photo_uploading: 'Uploading...', photo_changed: 'Profile photo updated ✅',
    change_password: '🔑 Change Password', current_pw: 'Current Password', new_pw: 'New Password',
    confirm_pw: 'Confirm New Password', change_pw_btn: 'Change Password',
    pw_mismatch: 'New passwords do not match.', pw_changed: '✅ Password changed successfully.',
    guardian_email: '👨‍👩‍👧 Guardian Email', guardian_ph: 'Enter guardian email',
    guardian_hint: 'Guardian will be notified in emergency situations.', guardian_save: 'Save Guardian Email',
    danger_zone: '⚠️ Danger Zone', delete_account: 'Delete Account', delete_hint: 'Deleting your account permanently removes all your data.',
    delete_confirm_title: 'Are you sure you want to delete your account?',
    delete_confirm_msg: 'This cannot be undone. All diaries, counseling records, and posts will be permanently deleted.',
    enter_pw_to_delete: 'Enter your password to confirm', confirm_delete: 'Permanently Delete Account',
    cancel: 'Cancel', logout: '🚪 Logout',
    diary_count: 'Diaries', post_count: 'Posts', comment_count: 'Comments', report_count: 'Reports',
    no_diaries: 'No diaries yet', intensity: 'Intensity',
    profile_saved: 'Profile saved ✅',
  },
  ja: {
    title: 'マイプロフィール', subtitle: 'アカウント情報と活動履歴を確認・管理してください。',
    account_settings: '⚙️ アカウント設定', my_diaries: '📔 私の日記',
    edit_profile: 'プロフィール編集', email: 'メール', email_hint: 'メールは変更できません',
    nickname: 'ニックネーム', nickname_ph: 'ニックネームを入力', language: '言語',
    save_changes: '変更を保存', saving: '保存中...',
    avatar_hint: 'クリックしてプロフィール写真を変更',
    photo_uploading: 'アップロード中...', photo_changed: 'プロフィール写真が変更されました ✅',
    change_password: '🔑 パスワード変更', current_pw: '現在のパスワード', new_pw: '新しいパスワード',
    confirm_pw: '新しいパスワードの確認', change_pw_btn: 'パスワード変更',
    pw_mismatch: '新しいパスワードが一致しません。', pw_changed: '✅ パスワードが変更されました。',
    guardian_email: '👨‍👩‍👧 保護者メール', guardian_ph: '保護者のメールを入力',
    guardian_hint: '緊急時に保護者に通知が送られます。', guardian_save: '保護者メールを保存',
    danger_zone: '⚠️ 危険ゾーン', delete_account: 'アカウント削除', delete_hint: 'アカウントを削除するとすべてのデータが永久に削除されます。',
    delete_confirm_title: '本当にアカウントを削除しますか？',
    delete_confirm_msg: 'この操作は元に戻せません。すべての日記、相談履歴、投稿が永久に削除されます。',
    enter_pw_to_delete: 'パスワードを入力して確認', confirm_delete: 'アカウントを完全に削除',
    cancel: 'キャンセル', logout: '🚪 ログアウト',
    diary_count: '感情日記', post_count: 'コミュニティ投稿', comment_count: 'コメント', report_count: '匿名報告',
    no_diaries: 'まだ日記がありません', intensity: '強度',
    profile_saved: 'プロフィールが保存されました ✅',
  },
  zh: {
    title: '我的资料', subtitle: '查看和管理您的账户信息和活动记录。',
    account_settings: '⚙️ 账户设置', my_diaries: '📔 我的日记',
    edit_profile: '编辑资料', email: '电子邮件', email_hint: '电子邮件无法更改',
    nickname: '昵称', nickname_ph: '输入昵称', language: '语言',
    save_changes: '保存更改', saving: '保存中...',
    avatar_hint: '点击更改头像',
    photo_uploading: '上传中...', photo_changed: '头像已更新 ✅',
    change_password: '🔑 修改密码', current_pw: '当前密码', new_pw: '新密码',
    confirm_pw: '确认新密码', change_pw_btn: '修改密码',
    pw_mismatch: '新密码不匹配。', pw_changed: '✅ 密码已成功更改。',
    guardian_email: '👨‍👩‍👧 监护人邮件', guardian_ph: '输入监护人邮件',
    guardian_hint: '紧急情况时将通知监护人。', guardian_save: '保存监护人邮件',
    danger_zone: '⚠️ 危险区域', delete_account: '删除账户', delete_hint: '删除账户将永久删除所有数据。',
    delete_confirm_title: '确定要删除账户吗？',
    delete_confirm_msg: '此操作无法撤销。所有日记、咨询记录和帖子将被永久删除。',
    enter_pw_to_delete: '输入密码确认', confirm_delete: '永久删除账户',
    cancel: '取消', logout: '🚪 退出登录',
    diary_count: '情绪日记', post_count: '社区帖子', comment_count: '评论', report_count: '匿名举报',
    no_diaries: '还没有日记', intensity: '强度',
    profile_saved: '资料已保存 ✅',
  },
};

const roleLabel: Record<string, string> = { STUDENT: '학생', TEACHER: '선생님', COUNSELOR: '상담사' };

const emotionEmoji: Record<string, string> = {
  happy: '😊', sad: '😢', angry: '😠', anxious: '😰', neutral: '😐', tired: '😴', excited: '🤩',
  grateful: '🥰', lonely: '😔', hopeful: '🌟',
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [diaries, setDiaries] = useState<any[]>([]);
  const [form, setForm] = useState({ nickname: '', language: 'ko' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'diaries'>('info');
  const [lang, setLang] = useState('ko');

  // Avatar upload
  const [uploadProgress, setUploadProgress] = useState(false);

  // Password change
  const [pwData, setPwData] = useState({ current: '', newPw: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');

  // Guardian email
  const [guardianEmail, setGuardianEmail] = useState('');

  // Account deletion modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const token = () => localStorage.getItem('token') || '';
  const authH = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') || 'ko';
    setLang(savedLang);
    const u = localStorage.getItem('user');
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed);
      setForm({ nickname: parsed.nickname || '', language: parsed.language || 'ko' });
      setGuardianEmail(parsed.guardian_email || '');
    }
    loadStats();
    loadDiaries();
  }, []);

  const t = i18n[lang] || i18n.ko;

  const loadStats = async () => {
    try {
      const res = await fetch(`${API}/auth/me/stats`, { headers: { Authorization: `Bearer ${token()}` } });
      if (res.ok) setStats(await res.json());
    } catch {}
  };

  const loadDiaries = async () => {
    try {
      const res = await fetch(`${API}/diaries`, { headers: { Authorization: `Bearer ${token()}` } });
      if (res.ok) setDiaries(await res.json());
    } catch {}
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/me`, {
        method: 'PUT', headers: authH(),
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        const newUser = { ...user, ...updated };
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        showToast(t.profile_saved);
      }
    } catch {}
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploadProgress(true);
    try {
      const res = await fetch(`${API}/upload/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        const updatedUser = { ...user, avatar_url: data.url };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        showToast(t.photo_changed);
      }
    } catch {}
    setUploadProgress(false);
  };

  const handlePasswordChange = async () => {
    if (pwData.newPw !== pwData.confirm) {
      setPwMsg(t.pw_mismatch);
      return;
    }
    try {
      const res = await fetch(`${API}/auth/me/password`, {
        method: 'PUT', headers: authH(),
        body: JSON.stringify({ current_password: pwData.current, new_password: pwData.newPw })
      });
      const data = await res.json();
      setPwMsg(res.ok ? t.pw_changed : `❌ ${data.detail || '오류가 발생했습니다.'}`);
      if (res.ok) setPwData({ current: '', newPw: '', confirm: '' });
    } catch {
      setPwMsg('❌ 오류가 발생했습니다.');
    }
  };

  const handleGuardianEmailSave = async () => {
    try {
      const res = await fetch(`${API}/auth/me`, {
        method: 'PUT', headers: authH(),
        body: JSON.stringify({ guardian_email: guardianEmail })
      });
      if (res.ok) {
        const updated = await res.json();
        const newUser = { ...user, ...updated };
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        showToast('✅ 보호자 이메일이 저장되었습니다.');
      }
    } catch {}
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch(`${API}/auth/me`, {
        method: 'DELETE', headers: authH(),
        body: JSON.stringify({ password: deletePassword })
      });
      if (res.ok) {
        localStorage.clear();
        router.push('/');
      }
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const initials = user?.nickname?.slice(0, 1) || '익';
  const isStudent = user?.role === 'STUDENT' || !user?.role;

  return (
    <div className="page-content">
      <div className="page-header">
        <h2 className="page-title">👤 {t.title}</h2>
        <p className="page-subtitle">{t.subtitle}</p>
      </div>

      {/* 프로필 헤더 카드 */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
        {/* 아바타 업로드 */}
        <div
          style={{ position: 'relative', display: 'inline-block', cursor: 'pointer', flexShrink: 0 }}
          onClick={() => document.getElementById('avatar-input')?.click()}
          title={t.avatar_hint}
        >
          {user?.avatar_url ? (
            <img
              src={`${BACKEND}${user.avatar_url}`}
              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', display: 'block' }}
              alt="profile"
            />
          ) : (
            <div className="avatar avatar-xl" style={{ fontSize: '2rem', width: 80, height: 80 }}>{initials}</div>
          )}
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            background: 'var(--primary)', borderRadius: '50%',
            width: 26, height: 26, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '0.75rem',
            boxShadow: '0 2px 6px rgba(91,95,239,0.4)'
          }}>
            {uploadProgress ? '⏳' : '📷'}
          </div>
          <input
            id="avatar-input" type="file" accept="image/*"
            style={{ display: 'none' }} onChange={handleAvatarUpload}
          />
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{user?.nickname || '익명학생'}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user?.email}</p>
          <span className="badge badge-primary" style={{ marginTop: 6 }}>{roleLabel[user?.role] || '학생'}</span>
        </div>
        <button className="btn btn-danger" onClick={handleLogout}>{t.logout}</button>
      </div>

      {/* 활동 통계 */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: t.diary_count, value: stats?.diary_count ?? '-', icon: '📔', color: 'var(--primary-light)', vc: 'var(--primary)' },
          { label: t.post_count, value: stats?.post_count ?? '-', icon: '✏️', color: 'var(--secondary-light)', vc: 'var(--secondary)' },
          { label: t.comment_count, value: stats?.comment_count ?? '-', icon: '💬', color: 'var(--info-light)', vc: 'var(--info)' },
          { label: t.report_count, value: stats?.report_count ?? '-', icon: '🚨', color: 'var(--danger-light)', vc: 'var(--danger)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div>
              <div className="stat-value" style={{ color: s.vc, fontSize: '1.4rem' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 탭 */}
      <div className="tabs" style={{ marginBottom: 24 }}>
        <button className={`tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>{t.account_settings}</button>
        <button className={`tab ${activeTab === 'diaries' ? 'active' : ''}`} onClick={() => setActiveTab('diaries')}>{t.my_diaries} ({diaries.length})</button>
      </div>

      {activeTab === 'info' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>
          {/* 기본 프로필 수정 */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>{t.edit_profile}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">{t.email}</label>
                <input className="form-input" value={user?.email || ''} disabled
                  style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.email_hint}</span>
              </div>
              <div className="form-group">
                <label className="form-label">{t.nickname}</label>
                <input className="form-input" placeholder={t.nickname_ph}
                  value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.language}</label>
                <select className="form-select" value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}>
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                  <option value="ja">日本語</option>
                </select>
              </div>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={loading}>
                {loading ? t.saving : t.save_changes}
              </button>
            </div>
          </div>

          {/* 비밀번호 변경 */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>{t.change_password}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">{t.current_pw}</label>
                <input className="form-input" type="password"
                  value={pwData.current} onChange={e => setPwData({ ...pwData, current: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.new_pw}</label>
                <input className="form-input" type="password"
                  value={pwData.newPw} onChange={e => setPwData({ ...pwData, newPw: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.confirm_pw}</label>
                <input className="form-input" type="password"
                  value={pwData.confirm} onChange={e => setPwData({ ...pwData, confirm: e.target.value })} />
              </div>
              {pwMsg && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem',
                  background: pwMsg.startsWith('✅') ? 'var(--secondary-light)' : 'var(--danger-light)',
                  color: pwMsg.startsWith('✅') ? 'var(--secondary)' : 'var(--danger)',
                  fontWeight: 500
                }}>
                  {pwMsg}
                </div>
              )}
              <button className="btn btn-primary" onClick={handlePasswordChange}
                disabled={!pwData.current || !pwData.newPw || !pwData.confirm}>
                {t.change_pw_btn}
              </button>
            </div>
          </div>

          {/* 보호자 이메일 (학생만) */}
          {isStudent && (
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{t.guardian_email}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>{t.guardian_hint}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group">
                  <input className="form-input" type="email"
                    placeholder={t.guardian_ph}
                    value={guardianEmail} onChange={e => setGuardianEmail(e.target.value)} />
                </div>
                <button className="btn btn-secondary" onClick={handleGuardianEmailSave}>
                  {t.guardian_save}
                </button>
              </div>
            </div>
          )}

          {/* 위험 구역: 계정 삭제 */}
          <div className="card" style={{ border: '1.5px solid var(--danger)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--danger)' }}>{t.danger_zone}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>{t.delete_hint}</p>
            <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
              🗑️ {t.delete_account}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'diaries' && (
        <div>
          {diaries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📔</div>
              <p>{t.no_diaries}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {diaries.map((d: any) => (
                <div key={d.id} className="card card-sm" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{emotionEmoji[d.emotion] || '😐'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                      {new Date(d.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <p style={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.content}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{d.emotion}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.intensity} {d.emotion_score}/5</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 계정 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <span className="modal-title" style={{ color: 'var(--danger)' }}>⚠️ {t.delete_confirm_title}</span>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--danger-light)', borderRadius: 10, padding: '14px', fontSize: '0.875rem', color: 'var(--danger)', lineHeight: 1.6 }}>
                {t.delete_confirm_msg}
              </div>
              <div className="form-group">
                <label className="form-label">{t.enter_pw_to_delete}</label>
                <input className="form-input" type="password"
                  value={deletePassword} onChange={e => setDeletePassword(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary btn-full" onClick={() => setShowDeleteModal(false)}>{t.cancel}</button>
                <button
                  className="btn btn-danger btn-full"
                  onClick={handleDeleteAccount}
                  disabled={!deletePassword}
                  style={{ background: 'var(--danger)', color: 'white' }}
                >
                  {t.confirm_delete}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast success">{toast}</div>}
    </div>
  );
}
