'use client';
import { useState } from 'react';
import { API_BASE } from '@/lib/apiClient';

const categories = [
  { value: 'bullying', label: '학교폭력', icon: '🚨', color: 'var(--danger)' },
  { value: 'discrimination', label: '차별/혐오', icon: '⚠️', color: 'var(--warning)' },
  { value: 'sexual', label: '성희롱/성폭력', icon: '🛑', color: '#DC2626' },
  { value: 'mental', label: '심리적 폭력', icon: '💔', color: '#7C3AED' },
  { value: 'digital', label: '사이버 폭력', icon: '💻', color: 'var(--info)' },
  { value: 'other', label: '기타', icon: '📋', color: 'var(--text-secondary)' },
];

export default function ReportPage() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [form, setForm] = useState({ title: '', content: '', location: '', date: '' });
  const [loading, setLoading] = useState(false);
  const [receiptId, setReceiptId] = useState('');

  const handleSubmit = async () => {
    if (!form.title || !form.content) return;
    setLoading(true);
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, title: form.title, content: `${form.content}\n\n장소: ${form.location || '미기재'}\n날짜: ${form.date || '미기재'}` }),
    });
    if (res.ok) {
      const data = await res.json();
      setReceiptId(data.id.slice(0, 8).toUpperCase());
      setStep(3);
    }
    setLoading(false);
  };

  const selectedCat = categories.find(c => c.value === category);

  return (
    <div className="page-content">
      <div className="page-header">
        <h2 className="page-title">🚨 익명 신고</h2>
        <p className="page-subtitle">모든 신고는 완전 익명으로 처리되며 접수자 정보는 절대 공개되지 않습니다.</p>
      </div>

      {/* 스텝 인디케이터 */}
      {step < 3 && (
        <div className="steps" style={{ maxWidth: 480, marginBottom: 32 }}>
          {['카테고리 선택', '상세 내용', '제출 완료'].map((label, i) => (
            <div key={label} className="step-item">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div className={`step-circle ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.72rem', color: step === i + 1 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: step === i + 1 ? 600 : 400, whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
              {i < 2 && <div className={`step-line ${step > i + 1 ? 'done' : ''}`} style={{ margin: '0 8px', marginBottom: 22 }} />}
            </div>
          ))}
        </div>
      )}

      {/* 익명 보장 배너 */}
      {step < 3 && (
        <div style={{
          background: 'var(--secondary-light)', border: '1px solid var(--secondary)', borderRadius: 'var(--radius-md)',
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24,
          fontSize: '0.85rem', color: 'var(--secondary)'
        }}>
          🔒 <strong>완전 익명 보장</strong> — 신고자 정보는 어디에도 저장되지 않으며 추적이 불가능합니다.
        </div>
      )}

      {/* Step 1: 카테고리 */}
      {step === 1 && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>신고 유형을 선택해주세요</h3>
          <div className="grid-3" style={{ marginBottom: 24 }}>
            {categories.map(c => (
              <button key={c.value} type="button" onClick={() => setCategory(c.value)}
                style={{
                  padding: '20px 16px', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                  border: `2px solid ${category === c.value ? c.color : 'var(--border)'}`,
                  background: category === c.value ? `${c.color}10` : 'white',
                  textAlign: 'center', transition: 'var(--transition)', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', gap: 8
                }}>
                <span style={{ fontSize: '2rem' }}>{c.icon}</span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: category === c.value ? c.color : 'var(--text-primary)' }}>{c.label}</span>
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-lg" disabled={!category} onClick={() => setStep(2)}>
            다음 단계 →
          </button>
        </div>
      )}

      {/* Step 2: 상세 내용 */}
      {step === 2 && (
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: '1.5rem' }}>{selectedCat?.icon}</span>
            <div>
              <h3 style={{ fontWeight: 700 }}>{selectedCat?.label} 신고</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>가능한 자세히 작성할수록 도움이 됩니다</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">신고 제목 *</label>
              <input className="form-input" placeholder="간단히 상황을 요약해주세요"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">발생 장소 (선택)</label>
                <input className="form-input" placeholder="예: 3학년 2반 교실"
                  value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">발생 날짜 (선택)</label>
                <input className="form-input" type="date"
                  value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">상세 내용 *</label>
              <textarea className="form-textarea" rows={7}
                placeholder="구체적인 상황, 관련 인물(실명 불필요), 피해 내용 등을 자세히 작성해주세요. 작성자 정보는 절대 공개되지 않습니다."
                value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>{form.content.length}자</div>
            </div>

            <div style={{ background: 'var(--warning-light)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: '0.825rem', color: '#92400E' }}>
              ⚠️ 허위 신고는 신뢰 기반을 해칠 수 있습니다. 사실에 근거하여 신고해주세요.
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>← 이전</button>
              <button className="btn btn-primary btn-full" onClick={handleSubmit}
                disabled={loading || !form.title || !form.content}>
                {loading ? '제출 중...' : '🚨 신고 제출하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: 완료 */}
      {step === 3 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12 }}>신고가 접수되었습니다</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>담당자가 검토 후 조치할 예정입니다. 신고자 정보는 공개되지 않습니다.</p>

          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 32px', display: 'inline-block', marginBottom: 32 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>접수 번호</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em' }}>#{receiptId}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>이 번호를 메모해두세요</div>
          </div>

          <div>
            <button className="btn btn-primary" onClick={() => { setStep(1); setCategory(''); setForm({ title: '', content: '', location: '', date: '' }); }}>
              다른 신고하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
