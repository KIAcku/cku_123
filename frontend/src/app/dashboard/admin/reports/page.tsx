'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://studentcare-production.up.railway.app/api/v1';

const i18n: Record<string, Record<string, string>> = {
  ko: {
    title: '익명 신고 관리', subtitle: '접수된 모든 신고 내역을 관리합니다.',
    total: '전체', pending: '접수 대기', reviewing: '검토 중', resolved: '처리 완료',
    category: '카테고리', status: '상태', date: '날짜', all: '전체',
    bullying: '학교폭력', discrimination: '차별', harassment: '괴롭힘', other: '기타',
    sort_newest: '최신순', sort_oldest: '오래된순',
    export_csv: 'CSV 내보내기', loading: '불러오는 중...', no_reports: '신고 내역이 없습니다.',
    detail: '상세 보기', update_status: '상태 변경', close: '닫기',
    created_at: '접수일', content: '내용', change_status: '상태 변경',
    access_denied: '접근 권한이 없습니다.',
    filter: '필터',
  },
  en: {
    title: 'Report Management', subtitle: 'Manage all received anonymous reports.',
    total: 'Total', pending: 'Pending', reviewing: 'Reviewing', resolved: 'Resolved',
    category: 'Category', status: 'Status', date: 'Date', all: 'All',
    bullying: 'Bullying', discrimination: 'Discrimination', harassment: 'Harassment', other: 'Other',
    sort_newest: 'Newest', sort_oldest: 'Oldest',
    export_csv: 'Export CSV', loading: 'Loading...', no_reports: 'No reports found.',
    detail: 'View Detail', update_status: 'Update Status', close: 'Close',
    created_at: 'Date', content: 'Content', change_status: 'Change Status',
    access_denied: 'Access denied.',
    filter: 'Filter',
  },
  ja: {
    title: '匿名報告管理', subtitle: '受け取ったすべての報告を管理します。',
    total: '合計', pending: '受付待ち', reviewing: '審査中', resolved: '処理済み',
    category: 'カテゴリ', status: 'ステータス', date: '日付', all: 'すべて',
    bullying: 'いじめ', discrimination: '差別', harassment: '嫌がらせ', other: 'その他',
    sort_newest: '新しい順', sort_oldest: '古い順',
    export_csv: 'CSVエクスポート', loading: '読み込み中...', no_reports: '報告がありません。',
    detail: '詳細を見る', update_status: 'ステータス変更', close: '閉じる',
    created_at: '受付日', content: '内容', change_status: 'ステータス変更',
    access_denied: 'アクセス権限がありません。',
    filter: 'フィルター',
  },
  zh: {
    title: '匿名举报管理', subtitle: '管理所有收到的匿名举报。',
    total: '总计', pending: '待处理', reviewing: '审查中', resolved: '已处理',
    category: '类别', status: '状态', date: '日期', all: '全部',
    bullying: '校园暴力', discrimination: '歧视', harassment: '骚扰', other: '其他',
    sort_newest: '最新', sort_oldest: '最旧',
    export_csv: '导出CSV', loading: '加载中...', no_reports: '没有举报记录。',
    detail: '查看详情', update_status: '更新状态', close: '关闭',
    created_at: '日期', content: '内容', change_status: '更改状态',
    access_denied: '没有访问权限。',
    filter: '筛选',
  },
};

interface Report {
  id: string;
  category: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
}

const categoryColor: Record<string, { bg: string; color: string }> = {
  bullying:       { bg: '#FEF2F2', color: '#EF4444' },
  discrimination: { bg: '#FFF7ED', color: '#F97316' },
  harassment:     { bg: '#F5F3FF', color: '#8B5CF6' },
  other:          { bg: '#F3F4F6', color: '#6B7280' },
};

const statusColor: Record<string, { bg: string; color: string; icon: string }> = {
  pending:   { bg: '#FFFBEB', color: '#D97706', icon: '⏳' },
  reviewing: { bg: '#EFF6FF', color: '#2563EB', icon: '🔍' },
  resolved:  { bg: '#ECFDF5', color: '#059669', icon: '✅' },
};

export default function AdminReportsPage() {
  const router = useRouter();
  const [lang, setLang] = useState('ko');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [updating, setUpdating] = useState(false);

  const t = i18n[lang] || i18n.ko;

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/dashboard'); return; }
    const user = JSON.parse(u);
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    const savedLang = localStorage.getItem('lang') || 'ko';
    setLang(savedLang);
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/reports`, {
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

  const updateStatus = async (reportId: string, status: string) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API}/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
      if (selectedReport?.id === reportId) setSelectedReport(prev => prev ? { ...prev, status } : null);
    } finally {
      setUpdating(false);
    }
  };

  const filteredReports = reports
    .filter(r => catFilter === 'all' || r.category === catFilter)
    .filter(r => statusFilter === 'all' || r.status === statusFilter)
    .sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? db - da : da - db;
    });

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    reviewing: reports.filter(r => r.status === 'reviewing').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  const exportCSV = () => {
    const headers = ['ID', '카테고리', '제목', '내용', '상태', '접수일'];
    const rows = filteredReports.map(r => [
      r.id, r.category, r.title, r.content.replace(/,/g, '|'), r.status, r.created_at
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statCards = [
    { label: t.total,     value: stats.total,     icon: '📋', color: '#5B5FEF', bg: '#EEF0FF' },
    { label: t.pending,   value: stats.pending,   icon: '⏳', color: '#D97706', bg: '#FFFBEB' },
    { label: t.reviewing, value: stats.reviewing, icon: '🔍', color: '#2563EB', bg: '#EFF6FF' },
    { label: t.resolved,  value: stats.resolved,  icon: '✅', color: '#059669', bg: '#ECFDF5' },
  ];

  return (
    <div className="page-content" style={{ maxWidth: 1200 }}>
      {/* Gradient Header */}
      <div style={{
        background: 'linear-gradient(135deg, #5B5FEF 0%, #7C3AED 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 36px',
        marginBottom: 28,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, right: 80,
          width: 140, height: 140, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: '1.8rem' }}>🚨</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{t.title}</h1>
          </div>
          <p style={{ opacity: 0.85, fontSize: '0.9rem' }}>{t.subtitle}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {statCards.map(card => (
          <div key={card.label} className="card" style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 'var(--radius-md)',
              background: card.bg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0,
            }}>{card.icon}</div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>🔽 {t.filter}</span>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'bullying', 'discrimination', 'harassment', 'other'].map(c => (
              <button key={c} onClick={() => setCatFilter(c)} style={{
                padding: '5px 12px', borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                border: '1.5px solid',
                borderColor: catFilter === c ? (categoryColor[c]?.color || 'var(--primary)') : 'var(--border)',
                background: catFilter === c ? (categoryColor[c]?.bg || 'var(--primary-light)') : 'transparent',
                color: catFilter === c ? (categoryColor[c]?.color || 'var(--primary)') : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}>
                {t[c as keyof typeof t] || c}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

          {/* Status filter */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'pending', 'reviewing', 'resolved'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: '5px 12px', borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                border: '1.5px solid',
                borderColor: statusFilter === s ? (statusColor[s]?.color || 'var(--primary)') : 'var(--border)',
                background: statusFilter === s ? (statusColor[s]?.bg || 'var(--primary-light)') : 'transparent',
                color: statusFilter === s ? (statusColor[s]?.color || 'var(--primary)') : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}>
                {s === 'all' ? t.all : `${statusColor[s]?.icon || ''} ${t[s as keyof typeof t] || s}`}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {/* Sort */}
            <select
              className="form-select"
              style={{ width: 'auto', height: 36, padding: '0 32px 0 12px', fontSize: '0.82rem' }}
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')}
            >
              <option value="newest">{t.sort_newest}</option>
              <option value="oldest">{t.sort_oldest}</option>
            </select>

            {/* CSV Export */}
            <button className="btn btn-outline btn-sm" onClick={exportCSV}
              style={{ gap: 6, display: 'flex', alignItems: 'center' }}>
              📊 {t.export_csv}
            </button>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12, animation: 'spin 1s linear infinite' }}>⏳</div>
          {t.loading}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">📭</div>
          <p>{t.no_reports}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filteredReports.map(report => {
            const cat = categoryColor[report.category] || categoryColor.other;
            const sta = statusColor[report.status] || statusColor.pending;
            return (
              <div key={report.id}
                onClick={() => setSelectedReport(report)}
                className="card card-hover"
                style={{ cursor: 'pointer', padding: '20px', borderLeft: `4px solid ${cat.color}` }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 10px', borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem', fontWeight: 700,
                    background: cat.bg, color: cat.color,
                  }}>
                    {t[report.category as keyof typeof t] || report.category}
                  </span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 10px', borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem', fontWeight: 700,
                    background: sta.bg, color: sta.color,
                  }}>
                    {sta.icon} {t[report.status as keyof typeof t] || report.status}
                  </span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 8, lineHeight: 1.4 }}>
                  {report.title || '(제목 없음)'}
                </h3>
                <p style={{
                  fontSize: '0.82rem', color: 'var(--text-secondary)',
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5,
                }}>
                  {report.content}
                </p>
                <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                  📅 {new Date(report.created_at).toLocaleDateString('ko-KR')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  {(() => {
                    const cat = categoryColor[selectedReport.category] || categoryColor.other;
                    const sta = statusColor[selectedReport.status] || statusColor.pending;
                    return (
                      <>
                        <span style={{ padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, background: cat.bg, color: cat.color }}>
                          {t[selectedReport.category as keyof typeof t] || selectedReport.category}
                        </span>
                        <span style={{ padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, background: sta.bg, color: sta.color }}>
                          {sta.icon} {t[selectedReport.status as keyof typeof t] || selectedReport.status}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <h2 className="modal-title">{selectedReport.title || '(제목 없음)'}</h2>
              </div>
              <button className="modal-close" onClick={() => setSelectedReport(null)}>✕</button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                📅 {new Date(selectedReport.created_at).toLocaleString('ko-KR')}
              </div>
              <div style={{
                background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)',
                padding: '16px', fontSize: '0.9rem', lineHeight: 1.7,
                color: 'var(--text-primary)', whiteSpace: 'pre-wrap',
              }}>
                {selectedReport.content}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>
                {t.change_status}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['pending', 'reviewing', 'resolved'].map(s => {
                  const sc = statusColor[s];
                  const isActive = selectedReport.status === s;
                  return (
                    <button key={s}
                      disabled={updating || isActive}
                      onClick={() => updateStatus(selectedReport.id, s)}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 'var(--radius-md)',
                        fontSize: '0.82rem', fontWeight: 700,
                        border: `2px solid ${isActive ? sc.color : 'var(--border)'}`,
                        background: isActive ? sc.bg : 'transparent',
                        color: isActive ? sc.color : 'var(--text-secondary)',
                        cursor: isActive ? 'default' : 'pointer',
                        transition: 'all 0.15s',
                        opacity: updating ? 0.6 : 1,
                      }}
                    >
                      {sc.icon} {t[s as keyof typeof t] || s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
