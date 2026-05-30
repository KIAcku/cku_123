'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://studentcare-production.up.railway.app/api/v1';

const i18n: Record<string, Record<string, string>> = {
  ko: {
    title: '상담 보고서 관리', subtitle: '상담사가 제출한 상담 보고서를 확인합니다.',
    session_id: '세션 ID', counselor: '상담사', risk: '위험도',
    summary: '요약', date: '날짜', detail: '상세 보기',
    low: '낮음', medium: '보통', high: '높음',
    export_csv: 'CSV 내보내기', loading: '불러오는 중...', no_data: '보고서가 없습니다.',
    close: '닫기', all: '전체', filter_risk: '위험도 필터',
    full_summary: '상세 내용',
  },
  en: {
    title: 'Counseling Reports', subtitle: 'Review counseling reports submitted by counselors.',
    session_id: 'Session ID', counselor: 'Counselor', risk: 'Risk Level',
    summary: 'Summary', date: 'Date', detail: 'View Detail',
    low: 'Low', medium: 'Medium', high: 'High',
    export_csv: 'Export CSV', loading: 'Loading...', no_data: 'No reports found.',
    close: 'Close', all: 'All', filter_risk: 'Risk Filter',
    full_summary: 'Full Summary',
  },
  ja: {
    title: '相談レポート管理', subtitle: 'カウンセラーが提出した相談レポートを確認します。',
    session_id: 'セッションID', counselor: 'カウンセラー', risk: 'リスクレベル',
    summary: '要約', date: '日付', detail: '詳細を見る',
    low: '低い', medium: '普通', high: '高い',
    export_csv: 'CSVエクスポート', loading: '読み込み中...', no_data: 'レポートがありません。',
    close: '閉じる', all: 'すべて', filter_risk: 'リスクフィルター',
    full_summary: '詳細内容',
  },
  zh: {
    title: '咨询报告管理', subtitle: '查看咨询师提交的咨询报告。',
    session_id: '会话ID', counselor: '咨询师', risk: '风险等级',
    summary: '摘要', date: '日期', detail: '查看详情',
    low: '低', medium: '中', high: '高',
    export_csv: '导出CSV', loading: '加载中...', no_data: '没有报告。',
    close: '关闭', all: '全部', filter_risk: '风险筛选',
    full_summary: '详细内容',
  },
};

interface CounselReport {
  id: string;
  session_id: string;
  counselor_name?: string;
  risk_level: 'low' | 'medium' | 'high';
  summary: string;
  created_at: string;
}

const riskConfig = {
  low:    { bg: '#ECFDF5', color: '#059669', icon: '🟢', label: '낮음' },
  medium: { bg: '#FFFBEB', color: '#D97706', icon: '🟡', label: '보통' },
  high:   { bg: '#FEF2F2', color: '#EF4444', icon: '🔴', label: '높음' },
};

export default function CounselReportsPage() {
  const router = useRouter();
  const [lang, setLang] = useState('ko');
  const [reports, setReports] = useState<CounselReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState('all');
  const [selected, setSelected] = useState<CounselReport | null>(null);

  const t = i18n[lang] || i18n.ko;

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/dashboard'); return; }
    const user = JSON.parse(u);
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      router.push('/dashboard'); return;
    }
    const savedLang = localStorage.getItem('lang') || 'ko';
    setLang(savedLang);
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/counsel/teacher/reports`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setReports(Array.isArray(data) ? data : data.reports || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = reports.filter(r => riskFilter === 'all' || r.risk_level === riskFilter);

  const exportCSV = () => {
    const headers = ['세션ID', '상담사', '위험도', '요약', '날짜'];
    const rows = filtered.map(r => [
      r.session_id,
      r.counselor_name || '-',
      r.risk_level,
      r.summary.replace(/,/g, '|').replace(/\n/g, ' '),
      r.created_at,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `counsel_reports_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const highCount = reports.filter(r => r.risk_level === 'high').length;
  const medCount = reports.filter(r => r.risk_level === 'medium').length;
  const lowCount = reports.filter(r => r.risk_level === 'low').length;

  return (
    <div className="page-content" style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #7C3AED 0%, #5B5FEF 100%)',
        borderRadius: 'var(--radius-xl)', padding: '32px 36px',
        marginBottom: 28, color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: 40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: '1.8rem' }}>📝</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{t.title}</h1>
          </div>
          <p style={{ opacity: 0.85, fontSize: '0.9rem' }}>{t.subtitle}</p>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        {[
          { ...riskConfig.high, label: t.high, value: highCount },
          { ...riskConfig.medium, label: t.medium, value: medCount },
          { ...riskConfig.low, label: t.low, value: lowCount },
        ].map(c => (
          <div key={c.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: c.color }}>{c.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.label} {t.risk}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter + Export */}
      <div className="card" style={{ marginBottom: 20, padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            🔽 {t.filter_risk}
          </span>
          {(['all', 'high', 'medium', 'low'] as const).map(r => {
            const cfg = r === 'all' ? { bg: 'var(--bg-subtle)', color: 'var(--text-secondary)', icon: '📋' } : riskConfig[r];
            const active = riskFilter === r;
            return (
              <button key={r} onClick={() => setRiskFilter(r)} style={{
                padding: '5px 14px', borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                border: `1.5px solid ${active ? cfg.color : 'var(--border)'}`,
                background: active ? cfg.bg : 'transparent',
                color: active ? cfg.color : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}>
                {cfg.icon} {r === 'all' ? t.all : t[r as keyof typeof t]}
              </button>
            );
          })}
          <button className="btn btn-outline btn-sm" onClick={exportCSV} style={{ marginLeft: 'auto' }}>
            📊 {t.export_csv}
          </button>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>📝</div>
          {t.loading}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">📭</div>
          <p>{t.no_data}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(report => {
            const rc = riskConfig[report.risk_level] || riskConfig.low;
            return (
              <div key={report.id}
                className="card card-hover"
                style={{ cursor: 'pointer', padding: '20px 24px', borderLeft: `4px solid ${rc.color}` }}
                onClick={() => setSelected(report)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        padding: '3px 12px', borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem', fontWeight: 700,
                        background: rc.bg, color: rc.color,
                      }}>
                        {rc.icon} {t[report.risk_level as keyof typeof t] || report.risk_level}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                        🆔 {report.session_id}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        👩‍💼 {report.counselor_name || '익명 상담사'}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    📅 {new Date(report.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>
                <p style={{
                  marginTop: 12, fontSize: '0.85rem', color: 'var(--text-secondary)',
                  lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {report.summary}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                {(() => {
                  const rc = riskConfig[selected.risk_level] || riskConfig.low;
                  return (
                    <span style={{ padding: '3px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, background: rc.bg, color: rc.color, marginBottom: 8, display: 'inline-block' }}>
                      {rc.icon} {t[selected.risk_level as keyof typeof t] || selected.risk_level}
                    </span>
                  );
                })()}
                <h2 className="modal-title" style={{ marginTop: 6 }}>세션: {selected.session_id}</h2>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <span>👩‍💼 {selected.counselor_name || '익명 상담사'}</span>
              <span>📅 {new Date(selected.created_at).toLocaleString('ko-KR')}</span>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>
              {t.full_summary}
            </div>
            <div style={{
              background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)',
              padding: '16px', fontSize: '0.9rem', lineHeight: 1.7,
              color: 'var(--text-primary)', whiteSpace: 'pre-wrap', minHeight: 120,
            }}>
              {selected.summary}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
