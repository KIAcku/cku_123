'use client';
import { useState, useEffect } from 'react';

const categories = [
  { value: 'general', label: '일반', color: 'var(--text-secondary)' },
  { value: 'study', label: '공부/학업', color: 'var(--info)' },
  { value: 'life', label: '학교생활', color: 'var(--secondary)' },
  { value: 'counseling', label: '고민상담', color: 'var(--primary)' },
  { value: 'hobby', label: '취미/관심사', color: 'var(--warning)' },
];

type Post = { id: string; title: string; content: string; category: string; author_nickname: string; likes: number; created_at: string };
type Comment = { id: string; author_nickname: string; content: string; created_at: string; user_id: string };

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showWrite, setShowWrite] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'general' });
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState('');
  const [myId, setMyId] = useState('');

  const token = () => localStorage.getItem('token') || '';
  const authHeaders = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setMyId(JSON.parse(u).id);
    loadPosts();
  }, []);

  useEffect(() => { loadPosts(); }, [activeCategory]);

  const loadPosts = async () => {
    setFetching(true);
    const url = activeCategory === 'all'
      ? 'http://localhost:8000/api/v1/posts'
      : `http://localhost:8000/api/v1/posts?category=${activeCategory}`;
    const res = await fetch(url);
    if (res.ok) setPosts(await res.json());
    setFetching(false);
  };

  const loadComments = async (postId: string) => {
    const res = await fetch(`http://localhost:8000/api/v1/posts/${postId}/comments`);
    if (res.ok) setComments(await res.json());
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openPost = async (post: Post) => {
    setSelectedPost(post);
    await loadComments(post.id);
  };

  const handleSubmitPost = async () => {
    if (!form.title.trim() || !form.content.trim()) { showToast('제목과 내용을 입력해주세요'); return; }
    setLoading(true);
    const res = await fetch('http://localhost:8000/api/v1/posts', {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ title: '', content: '', category: 'general' });
      setShowWrite(false);
      await loadPosts();
      showToast('게시글이 등록되었습니다! 🎉');
    }
    setLoading(false);
  };

  const handleLike = async (postId: string) => {
    await fetch(`http://localhost:8000/api/v1/posts/${postId}/like`, { method: 'POST' });
    await loadPosts();
    if (selectedPost?.id === postId) {
      const res = await fetch(`http://localhost:8000/api/v1/posts/${postId}`);
      if (res.ok) setSelectedPost(await res.json());
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('게시글을 삭제할까요?')) return;
    await fetch(`http://localhost:8000/api/v1/posts/${postId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setSelectedPost(null);
    await loadPosts();
    showToast('삭제되었습니다');
  };

  const handleComment = async () => {
    if (!commentText.trim() || !selectedPost) return;
    setLoading(true);
    const res = await fetch(`http://localhost:8000/api/v1/posts/${selectedPost.id}/comments`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify({ content: commentText }),
    });
    if (res.ok) { setCommentText(''); await loadComments(selectedPost.id); showToast('댓글이 등록되었습니다'); }
    setLoading(false);
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    await fetch(`http://localhost:8000/api/v1/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token()}` }
    });
    await loadComments(postId);
  };

  const catLabel = (v: string) => categories.find(c => c.value === v)?.label || v;
  const catColor = (v: string) => categories.find(c => c.value === v)?.color || 'var(--text-secondary)';

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 className="page-title">👥 학생 커뮤니티</h2>
          <p className="page-subtitle">같은 고민을 가진 친구들과 익명으로 소통해요.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowWrite(!showWrite); setSelectedPost(null); }}>
          {showWrite ? '✕ 닫기' : '✏️ 글쓰기'}
        </button>
      </div>

      {/* 글쓰기 폼 */}
      {showWrite && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>새 글 작성</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">카테고리</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {categories.map(c => (
                  <button key={c.value} type="button"
                    className={`badge ${form.category === c.value ? '' : 'badge-gray'}`}
                    style={{
                      cursor: 'pointer', padding: '6px 14px',
                      background: form.category === c.value ? `${c.color}18` : undefined,
                      color: form.category === c.value ? c.color : undefined,
                      border: `1.5px solid ${form.category === c.value ? c.color : 'var(--border)'}`,
                      borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.8rem'
                    }}
                    onClick={() => setForm({ ...form, category: c.value })}>{c.label}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">제목</label>
              <input className="form-input" placeholder="제목을 입력하세요"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">내용</label>
              <textarea className="form-textarea" rows={5} placeholder="내용을 입력하세요..."
                value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowWrite(false)}>취소</button>
              <button className="btn btn-primary" onClick={handleSubmitPost} disabled={loading}>
                {loading ? '등록 중...' : '게시글 등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedPost ? '1fr 380px' : '1fr', gap: 24 }}>
        {/* 게시글 목록 */}
        <div>
          {/* 카테고리 탭 */}
          <div className="tabs" style={{ marginBottom: 20 }}>
            <button className={`tab ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>전체</button>
            {categories.map(c => (
              <button key={c.value} className={`tab ${activeCategory === c.value ? 'active' : ''}`}
                onClick={() => setActiveCategory(c.value)}>{c.label}</button>
            ))}
          </div>

          {fetching ? (
            <div className="empty-state"><p>불러오는 중...</p></div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <p>아직 게시글이 없어요. 첫 번째 글을 작성해보세요!</p>
              <button className="btn btn-primary" onClick={() => setShowWrite(true)}>글쓰기</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {posts.map(p => (
                <div key={p.id} className="post-card"
                  style={{ borderColor: selectedPost?.id === p.id ? 'var(--primary)' : undefined }}
                  onClick={() => openPost(p)}>
                  <div className="post-meta" style={{ marginBottom: 8 }}>
                    <span className="badge" style={{ background: `${catColor(p.category)}18`, color: catColor(p.category), fontSize: '0.72rem' }}>{catLabel(p.category)}</span>
                    <span>{p.author_nickname}</span>
                    <span>·</span>
                    <span>{new Date(p.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 6 }}>{p.title}</h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.content}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>❤️ {p.likes}</span>
                    <span>클릭하여 전체 보기 →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 게시글 상세 */}
        {selectedPost && (
          <div className="card" style={{ alignSelf: 'flex-start', position: 'sticky', top: 80 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="post-meta" style={{ marginBottom: 8 }}>
                  <span className="badge" style={{ background: `${catColor(selectedPost.category)}18`, color: catColor(selectedPost.category), fontSize: '0.72rem' }}>{catLabel(selectedPost.category)}</span>
                  <span>{selectedPost.author_nickname}</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedPost.title}</h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedPost(null)}>✕</button>
            </div>

            <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-primary)', marginBottom: 16, whiteSpace: 'pre-wrap' }}>{selectedPost.content}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <button className="btn btn-sm btn-outline" onClick={() => handleLike(selectedPost.id)}>❤️ {selectedPost.likes}</button>
              {selectedPost.user_id === myId && (
                <button className="btn btn-danger btn-sm" onClick={() => handleDeletePost(selectedPost.id)}>🗑️ 삭제</button>
              )}
            </div>

            {/* 댓글 */}
            <h4 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 12 }}>댓글 {comments.length}개</h4>
            <div style={{ maxHeight: 240, overflowY: 'auto', marginBottom: 14 }}>
              {comments.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>첫 댓글을 작성해보세요</p>
              ) : comments.map(c => (
                <div key={c.id} className="comment-item">
                  <div className="avatar avatar-sm">{c.author_nickname?.slice(0, 1) || '익'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{c.author_nickname}</span>
                      {c.user_id === myId && (
                        <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                          onClick={() => handleDeleteComment(selectedPost.id, c.id)}>삭제</button>
                      )}
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: 3 }}>{c.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 댓글 입력 */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-input" style={{ flex: 1 }} placeholder="댓글 입력..."
                value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment()} />
              <button className="btn btn-primary btn-sm" onClick={handleComment} disabled={loading}>등록</button>
            </div>
          </div>
        )}
      </div>

      {toast && <div className="toast success">{toast}</div>}
    </div>
  );
}
