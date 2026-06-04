'use client';
import { useState, useEffect } from 'react';
import { useLangStore } from '@/store/langStore';
import { API_BASE } from '@/lib/apiClient';

const i18n: Record<string, any> = {
  ko: {
    hero_title: '🚨 익명 신고',
    hero_sub: '모든 신고는 완전 익명으로 처리되며 접수자 정보는 절대 공개되지 않습니다.',
    step1: '카테고리 선택',
    step2: '상세 내용',
    step3: '제출 완료',
    anonymous_badge: '🔒 완전 익명 보장 — 신고자 정보는 어디에도 저장되지 않으며 추적이 불가능합니다.',
    select_type: '신고 유형을 선택해주세요',
    next_step: '다음 단계 →',
    prev_step: '← 이전',
    report_title_cat: '{cat} 신고',
    report_desc_help: '가능한 자세히 작성할수록 도움이 됩니다',
    label_title: '신고 제목 *',
    title_ph: '간단히 상황을 요약해주세요',
    label_location: '발생 장소 (선택)',
    location_ph: '예: 3학년 2반 교실',
    label_date: '발생 날짜 (선택)',
    label_content: '상세 내용 *',
    content_ph: '구체적인 상황, 관련 인물(실명 불필요), 피해 내용 등을 자세히 작성해주세요. 작성자 정보는 절대 공개되지 않습니다.',
    char_count: '{count}자',
    warning_text: '⚠️ 허위 신고는 신뢰 기반을 해칠 수 있습니다. 사실에 근거하여 신고해주세요.',
    submit_btn: '🚨 신고 제출하기',
    submitting: '제출 중...',
    success_title: '신고가 접수되었습니다',
    success_sub: '담당자가 검토 후 조치할 예정입니다. 신고자 정보는 공개되지 않습니다.',
    receipt_no: '접수 번호',
    memo_receipt: '이 번호를 메모해두세요',
    another_report: '다른 신고하기',
    categories: {
      bullying: '학교폭력',
      discrimination: '차별/혐오',
      sexual: '성희롱/성폭력',
      mental: '심리적 폭력',
      digital: '사이버 폭력',
      other: '기타'
    }
  },
  en: {
    hero_title: '🚨 Anonymous Report',
    hero_sub: 'All reports are processed completely anonymously, and reporter information is never disclosed.',
    step1: 'Select Category',
    step2: 'Details',
    step3: 'Completed',
    anonymous_badge: '🔒 Complete Anonymity Guaranteed — Reporter information is not stored anywhere and cannot be tracked.',
    select_type: 'Please select a report type',
    next_step: 'Next Step →',
    prev_step: '← Back',
    report_title_cat: '{cat} Report',
    report_desc_help: 'Providing as much detail as possible is helpful',
    label_title: 'Report Title *',
    title_ph: 'Briefly summarize the situation',
    label_location: 'Location (Optional)',
    location_ph: 'e.g. Grade 3 Class 2 Classroom',
    label_date: 'Date (Optional)',
    label_content: 'Details *',
    content_ph: 'Please write down the specific situation, people involved (real names not required), and damage details. Reporter info will never be disclosed.',
    char_count: '{count} chars',
    warning_text: '⚠️ False reports can damage the foundation of trust. Please report based on facts.',
    submit_btn: '🚨 Submit Report',
    submitting: 'Submitting...',
    success_title: 'Report Submitted',
    success_sub: 'A representative will review and take action. Reporter info remains private.',
    receipt_no: 'Receipt Number',
    memo_receipt: 'Please write down this number',
    another_report: 'Submit Another Report',
    categories: {
      bullying: 'School Violence/Bullying',
      discrimination: 'Discrimination/Hate',
      sexual: 'Sexual Harassment/Violence',
      mental: 'Psychological Abuse',
      digital: 'Cyber Bullying',
      other: 'Other'
    }
  },
  ja: {
    hero_title: '🚨 匿名通報',
    hero_sub: 'すべての通報は完全に匿名で処理され、通報者の情報は一切公開されません。',
    step1: 'カテゴリ選択',
    step2: '詳細内容',
    step3: '提出完了',
    anonymous_badge: '🔒 完全匿名保証 — 通報者の情報はどこにも保存されず、追跡不可能です。',
    select_type: '通報の種類を選択してください',
    next_step: '次の段階 →',
    prev_step: '← 戻る',
    report_title_cat: '{cat} 通報',
    report_desc_help: 'できるだけ詳細に書いていただくと助かります',
    label_title: '通報タイトル *',
    title_ph: '状況を簡単に要約してください',
    label_location: '発生場所 (任意)',
    location_ph: '例：3年2組の教室',
    label_date: '発生日 (任意)',
    label_content: '詳細内容 *',
    content_ph: '具体的な状況、関係者（実名は不要）、被害内容などを詳細に記入してください。作成者の情報は絶対に公開されません。',
    char_count: '{count}文字',
    warning_text: '⚠️ 虚偽の通報は信頼関係を損なう可能性があります。事実に基いて通報してください。',
    submit_btn: '🚨 通報を提出する',
    submitting: '提出中...',
    success_title: '通报が受け付けられました',
    success_sub: '担当者が検討の上、対処いたします。通報者の情報は公開されません。',
    receipt_no: '受付番号',
    memo_receipt: 'この番号をメモしておいてください',
    another_report: '他の通報を行う',
    categories: {
      bullying: '学校暴力・いじめ',
      discrimination: '差別・ヘイト',
      sexual: 'セクハラ・性暴力',
      mental: '心理的暴力',
      digital: 'サイバー暴力',
      other: 'その他'
    }
  },
  zh: {
    hero_title: '🚨 匿名举报',
    hero_sub: '所有举报将完全匿名处理，举报人的信息绝不会公开。',
    step1: '选择分类',
    step2: '详细内容',
    step3: '提交完成',
    anonymous_badge: '🔒 完全匿名保证 — 举报人信息不会保存在任何地方，且无法追踪。',
    select_type: '请选择举报类型',
    next_step: '下一步 →',
    prev_step: '← 上一步',
    report_title_cat: '{cat} 举报',
    report_desc_help: '填写得越详细对处理越有帮助',
    label_title: '举报标题 *',
    title_ph: '请简要概括情况',
    label_location: '发生地点 (选填)',
    location_ph: '例如：3年级2班教室',
    label_date: '发生日期 (选填)',
    label_content: '详细内容 *',
    content_ph: '请详细描述具体情况、相关人员（无需实名）以及受害内容等。作者的信息绝不会公开。',
    char_count: '{count}字',
    warning_text: '⚠️ 虚假举报可能会破坏信任基础。请根据事实进行举报。',
    submit_btn: '🚨 提交举报',
    submitting: '提交中...',
    success_title: '举报已受理',
    success_sub: '相关负责人将在审核后采取措施。举报人信息将保持保密。',
    receipt_no: '受理编号',
    memo_receipt: '请记下此编号',
    another_report: '进行其他举报',
    categories: {
      bullying: '校园暴力/欺凌',
      discrimination: '歧视/仇恨',
      sexual: '性骚扰/性侵害',
      mental: '心理暴力',
      digital: '网络暴力',
      other: '其他'
    }
  }
};

const CATEGORIES_META = [
  { value: 'bullying', icon: '🚨', color: 'var(--danger)' },
  { value: 'discrimination', icon: '⚠️', color: 'var(--warning)' },
  { value: 'sexual', icon: '🛑', color: '#DC2626' },
  { value: 'mental', icon: '💔', color: '#7C3AED' },
  { value: 'digital', icon: '💻', color: 'var(--info)' },
  { value: 'other', icon: '📋', color: 'var(--text-secondary)' },
];

export default function ReportPage() {
  const { lang } = useLangStore();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [form, setForm] = useState({ title: '', content: '', location: '', date: '' });
  const [loading, setLoading] = useState(false);
  const [receiptId, setReceiptId] = useState('');

  const t = i18n[lang] || i18n.ko;

  const categories = CATEGORIES_META.map(c => ({
    ...c,
    label: t.categories[c.value] || c.value
  }));

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
        <h2 className="page-title">{t.hero_title}</h2>
        <p className="page-subtitle">{t.hero_sub}</p>
      </div>

      {/* 스텝 인디케이터 */}
      {step < 3 && (
        <div className="steps" style={{ maxWidth: 480, marginBottom: 32 }}>
          {[t.step1, t.step2, t.step3].map((label, i) => (
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
          {t.anonymous_badge}
        </div>
      )}

      {/* Step 1: 카테고리 */}
      {step === 1 && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{t.select_type}</h3>
          <div className="grid-3" style={{ marginBottom: 24 }}>
            {categories.map(c => (
              <button key={c.value} type="button" onClick={() => setCategory(c.value)}
                style={{
                  padding: '20px 16px', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                  border: `2px solid ${category === c.value ? c.color : 'var(--border)'}`,
                  background: category === c.value ? `${c.color}10` : 'var(--bg-layer2)',
                  textAlign: 'center', transition: 'var(--transition)', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', gap: 8
                }}>
                <span style={{ fontSize: '2rem' }}>{c.icon}</span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: category === c.value ? c.color : 'var(--text-primary)' }}>{c.label}</span>
              </button>
            ))}
          </div>
          <button className="btn btn-sunset btn-lg" disabled={!category} onClick={() => setStep(2)}>
            {t.next_step}
          </button>
        </div>
      )}

      {/* Step 2: 상세 내용 */}
      {step === 2 && (
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: '1.5rem' }}>{selectedCat?.icon}</span>
            <div>
              <h3 style={{ fontWeight: 700 }}>{t.report_title_cat.replace('{cat}', selectedCat?.label || '')}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.report_desc_help}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">{t.label_title}</label>
              <input className="form-input" placeholder={t.title_ph}
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">{t.label_location}</label>
                <input className="form-input" placeholder={t.location_ph}
                  value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.label_date}</label>
                <input className="form-input" type="date"
                  value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t.label_content}</label>
              <textarea className="form-textarea" rows={7}
                placeholder={t.content_ph}
                value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>{t.char_count.replace('{count}', String(form.content.length))}</div>
            </div>

            <div style={{ background: 'var(--warning-light)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: '0.825rem', color: '#92400E' }}>
              {t.warning_text}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-glass" onClick={() => setStep(1)}>{t.prev_step}</button>
              <button className="btn btn-sunset btn-full" onClick={handleSubmit}
                disabled={loading || !form.title || !form.content}>
                {loading ? t.submitting : t.submit_btn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: 완료 */}
      {step === 3 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12 }}>{t.success_title}</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>{t.success_sub}</p>

          <div style={{ background: 'var(--bg-base)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '20px 32px', display: 'inline-block', marginBottom: 32 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>{t.receipt_no}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sunset-pink)', letterSpacing: '0.1em' }}>#{receiptId}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{t.memo_receipt}</div>
          </div>

          <div>
            <button className="btn btn-sunset" onClick={() => { setStep(1); setCategory(''); setForm({ title: '', content: '', location: '', date: '' }); }}>
              {t.another_report}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
