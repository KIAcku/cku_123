'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const i18n: Record<string, Record<string, string>> = {
  ko: {
    title: '학생 관리', subtitle: '등록된 학생 목록을 확인합니다.',
    coming_soon: '준비 중인 기능입니다',
    description: '현재 학생 목록 API가 준비 중입니다. 추후 업데이트 시 학생별 상세 정보, 감정 추이, 상담 기록 등을 확인할 수 있습니다.',
    your_role: '내 권한',
    features_coming: '제공 예정 기능',
    f1: '📋 전체 학생 목록 조회',
    f2: '📊 학생별 감정 추이 분석',
    f3: '💬 상담 기록 확인',
    f4: '🚨 위험 학생 알림',
    f5: '📤 데이터 내보내기',
    f6: '🔍 학생 검색 및 필터',
    update_notice: '다음 버전에서 지원 예정',
  },
  en: {
    title: 'Student Management', subtitle: 'View the list of registered students.',
    coming_soon: 'Feature Coming Soon',
    description: 'The student list API is currently being prepared. In a future update, you will be able to view detailed information for each student, emotional trends, and counseling records.',
    your_role: 'Your Role',
    features_coming: 'Upcoming Features',
    f1: '📋 Full Student List',
    f2: '📊 Per-Student Emotional Trends',
    f3: '💬 Counseling Records',
    f4: '🚨 At-Risk Student Alerts',
    f5: '📤 Data Export',
    f6: '🔍 Student Search & Filter',
    update_notice: 'Planned for next release',
  },
  ja: {
    title: '学生管理', subtitle: '登録された学生の一覧を確認します。',
    coming_soon: '準備中の機能です',
    description: '現在、学生リストAPIを準備中です。次回のアップデートで学生ごとの詳細情報、感情の推移、相談記録などが確認できるようになります。',
    your_role: '権限',
    features_coming: '予定機能',
    f1: '📋 全学生リスト',
    f2: '📊 学生別感情分析',
    f3: '💬 相談記録',
    f4: '🚨 危険学生アラート',
    f5: '📤 データエクスポート',
    f6: '🔍 学生検索＆フィルター',
    update_notice: '次バージョンで提供予定',
  },
  zh: {
    title: '学生管理', subtitle: '查看注册学生列表。',
    coming_soon: '即将推出的功能',
    description: '学生列表API目前正在准备中。未来版本中，您将能查看每位学生的详细信息、情绪趋势和咨询记录。',
    your_role: '我的权限',
    features_coming: '即将推出的功能',
    f1: '📋 完整学生列表',
    f2: '📊 每位学生的情绪趋势',
    f3: '💬 咨询记录',
    f4: '🚨 高风险学生警报',
    f5: '📤 数据导出',
    f6: '🔍 学生搜索和筛选',
    update_notice: '计划于下一版本支持',
  },
};

export default function StudentsPage() {
  const router = useRouter();
  const [lang, setLang] = useState('ko');
  const [user, setUser] = useState<any>(null);

  const t = i18n[lang] || i18n.ko;

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/dashboard'); return; }
    const parsedUser = JSON.parse(u);
    if (parsedUser.role !== 'TEACHER' && parsedUser.role !== 'ADMIN') {
      router.push('/dashboard'); return;
    }
    setUser(parsedUser);
    const savedLang = localStorage.getItem('lang') || 'ko';
    setLang(savedLang);
  }, []);

  const roleMap: Record<string, string> = { TEACHER: '선생님', ADMIN: '관리자' };

  const features = [t.f1, t.f2, t.f3, t.f4, t.f5, t.f6];

  return (
    <div className="page-content" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #F97316 0%, #F59E0B 100%)',
        borderRadius: 'var(--radius-xl)', padding: '32px 36px',
        marginBottom: 28, color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -20, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: '1.8rem' }}>🎓</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{t.title}</h1>
          </div>
          <p style={{ opacity: 0.85, fontSize: '0.9rem' }}>{t.subtitle}</p>
        </div>
      </div>

      {/* Role Badge */}
      {user && (
        <div className="card" style={{ marginBottom: 24, padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--radius-full)',
              background: 'var(--primary-light)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1.1rem',
            }}>
              {user.nickname?.slice(0, 1) || '?'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{user.nickname || user.email}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <span style={{
                  padding: '2px 10px', borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem', fontWeight: 700,
                  background: 'var(--primary-light)', color: 'var(--primary)',
                }}>
                  {t.your_role}: {roleMap[user.role] || user.role}
                </span>
                <span style={{
                  padding: '2px 10px', borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem', fontWeight: 700,
                  background: 'var(--secondary-light)', color: 'var(--secondary)',
                }}>
                  ✅ 접근 승인됨
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon */}
      <div className="card" style={{ textAlign: 'center', padding: '60px 40px', marginBottom: 24 }}>
        <div style={{ fontSize: '5rem', marginBottom: 20 }}>🚧</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>
          {t.coming_soon}
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 24px' }}>
          {t.description}
        </p>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 20px', borderRadius: 'var(--radius-full)',
          background: 'var(--warning-light)', color: 'var(--warning)',
          fontSize: '0.82rem', fontWeight: 700,
        }}>
          🔧 {t.update_notice}
        </span>
      </div>

      {/* Upcoming Features */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>
          ✨ {t.features_coming}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {features.map((f, i) => (
            <div key={i} style={{
              padding: '14px 16px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-subtle)', fontSize: '0.875rem',
              color: 'var(--text-secondary)', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 8,
              opacity: 0.7,
            }}>
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
