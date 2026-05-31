'use client';
import { useState, useEffect } from 'react';
import { useLangStore } from '@/store/langStore';
import { API_BASE, authHeaders, getCurrentUserId } from '@/lib/apiClient';

// ─── 다국어 번역 사전 ──────────────────────────────────────────────
const i18n: Record<string, any> = {
  ko: {
    hero_title: '👥 학생 커뮤니티',
    hero_sub: '같은 고민을 가진 친구들과 익명으로 소통해요.',
    btn_close: '✕ 닫기',
    btn_write: '✏️ 글쓰기',
    write_title: '새 글 작성',
    category: '카테고리',
    title: '제목',
    content: '내용',
    title_ph: '제목을 입력하세요',
    content_ph: '내용을 입력하세요...',
    cancel: '취소',
    submit: '게시글 등록',
    submitting: '등록 중...',
    edit_title: '✏️ 게시글 수정',
    edit_submit: '수정 완료',
    edit_submitting: '수정 중...',
    tab_all: '전체',
    empty_fetching: '불러오는 중...',
    empty_title: '아직 게시글이 없어요. 첫 번째 글을 작성해보세요!',
    empty_btn: '글쓰기',
    liked_badge: '클릭하여 전체 보기 →',
    btn_edit: '✏️ 수정',
    btn_delete: '🗑️ 삭제',
    comment_count: '댓글 {count}개',
    comment_empty: '첫 댓글을 작성해보세요',
    comment_ph: '댓글 입력...',
    comment_submit: '등록',
    toast_input: '제목과 내용을 입력해주세요',
    toast_success: '게시글이 등록되었습니다! 🎉',
    toast_edited: '게시글이 수정되었습니다 ✅',
    toast_deleted: '삭제되었습니다',
    toast_comment_success: '댓글이 등록되었습니다',
    toast_comment_deleted: '댓글이 삭제되었습니다',
    toast_login: '로그인이 필요합니다',
    delete_confirm: '게시글을 삭제할까요?',
    comment_delete: '삭제',
    categories: {
      general: '일반',
      study: '공부/학업',
      life: '학교생활',
      counseling: '고민상담',
      hobby: '취미/관심사'
    }
  },
  en: {
    hero_title: '👥 Student Community',
    hero_sub: 'Communicate anonymously with friends who share similar concerns.',
    btn_close: '✕ Close',
    btn_write: '✏️ Write',
    write_title: 'Create New Post',
    category: 'Category',
    title: 'Title',
    content: 'Content',
    title_ph: 'Enter title',
    content_ph: 'Enter content...',
    cancel: 'Cancel',
    submit: 'Post',
    submitting: 'Posting...',
    edit_title: '✏️ Edit Post',
    edit_submit: 'Save Changes',
    edit_submitting: 'Saving...',
    tab_all: 'All',
    empty_fetching: 'Loading...',
    empty_title: 'No posts yet. Be the first to write one!',
    empty_btn: 'Write Post',
    liked_badge: 'Click to view details →',
    btn_edit: '✏️ Edit',
    btn_delete: '🗑️ Delete',
    comment_count: '{count} Comments',
    comment_empty: 'Be the first to comment',
    comment_ph: 'Add a comment...',
    comment_submit: 'Post',
    toast_input: 'Please fill in both title and content',
    toast_success: 'Post created successfully! 🎉',
    toast_edited: 'Post updated successfully ✅',
    toast_deleted: 'Deleted successfully',
    toast_comment_success: 'Comment added successfully',
    toast_comment_deleted: 'Comment deleted successfully',
    toast_login: 'Login required',
    delete_confirm: 'Do you want to delete this post?',
    comment_delete: 'Delete',
    categories: {
      general: 'General',
      study: 'Academics',
      life: 'School Life',
      counseling: 'Counseling',
      hobby: 'Hobbies'
    }
  },
  ja: {
    hero_title: '👥 学生コミュニティ',
    hero_sub: '同じ悩みを持つ仲間と匿名で話し合いましょう。',
    btn_close: '✕ 閉じる',
    btn_write: '✏️ 投稿する',
    write_title: '新規投稿作成',
    category: 'カテゴリー',
    title: 'タイトル',
    content: '本文',
    title_ph: 'タイトルを入力してください',
    content_ph: '内容を入力してください...',
    cancel: 'キャンセル',
    submit: '投稿する',
    submitting: '送信中...',
    edit_title: '✏️ 投稿の編集',
    edit_submit: '編集完了',
    edit_submitting: '更新中...',
    tab_all: 'すべて',
    empty_fetching: '読み込み中...',
    empty_title: 'まだ投稿がありません。最初の投稿を書きましょう！',
    empty_btn: '新規投稿',
    liked_badge: 'クリックして詳細を表示 →',
    btn_edit: '✏️ 編集',
    btn_delete: '🗑️ 削除',
    comment_count: 'コメント {count}件',
    comment_empty: '最初のコメントを書いてみましょう',
    comment_ph: 'コメントを入力...',
    comment_submit: '登録',
    toast_input: 'タイトルと内容を入力してください',
    toast_success: '投稿が登録されました！ 🎉',
    toast_edited: '投稿が修正されました ✅',
    toast_deleted: '削除されました',
    toast_comment_success: 'コメントが登録されました',
    toast_comment_deleted: 'コメントが削除されました',
    toast_login: 'ログインが必要です',
    delete_confirm: '投稿を削除しますか？',
    comment_delete: '削除',
    categories: {
      general: '一般',
      study: '勉強/学業',
      life: '学校生活',
      counseling: '悩み相談',
      hobby: '趣味/関心'
    }
  },
  zh: {
    hero_title: '👥 学生社区',
    hero_sub: '与有相似烦恼的同学匿名交流。',
    btn_close: '✕ 关闭',
    btn_write: '✏️ 发帖',
    write_title: '发布新帖',
    category: '板块',
    title: '标题',
    content: '正文',
    title_ph: '请输入标题',
    content_ph: '请输入正文内容...',
    cancel: '取消',
    submit: '发布',
    submitting: '发布中...',
    edit_title: '✏️ 编辑帖子',
    edit_submit: '完成编辑',
    edit_submitting: '保存中...',
    tab_all: '全部',
    empty_fetching: '加载中...',
    empty_title: '目前还没有帖子。发布第一条帖子吧！',
    empty_btn: '去发帖',
    liked_badge: '点击查看全文 →',
    btn_edit: '✏️ 编辑',
    btn_delete: '🗑️ 删除',
    comment_count: '{count}条评论',
    comment_empty: '来写第一条评论吧',
    comment_ph: '输入评论...',
    comment_submit: '提交',
    toast_input: '请填写标题和内容',
    toast_success: '发帖成功！ 🎉',
    toast_edited: '帖子已修改 ✅',
    toast_deleted: '已删除',
    toast_comment_success: '评论已发表',
    toast_comment_deleted: '评论已删除',
    toast_login: '需要登录',
    delete_confirm: '要删除这篇帖子吗？',
    comment_delete: '删除',
    categories: {
      general: '普通',
      study: '学习/学业',
      life: '学校生活',
      counseling: '心理压力',
      hobby: '兴趣爱好'
    }
  }
};

// ─── 디자인 및 기능 메타 데이터 ──────────────────────────────────────
const CATEGORY_META = [
  { value: 'general', color: 'var(--text-secondary)' },
  { value: 'study', color: 'var(--info)' },
  { value: 'life', color: 'var(--secondary)' },
  { value: 'counseling', color: 'var(--primary)' },
  { value: 'hobby', color: 'var(--warning)' },
];

type Post = {
  id: string; title: string; content: string; category: string;
  author_nickname: string; likes: number; created_at: string;
  updated_at?: string; user_id?: string;
};
type Comment = {
  id: string; author_nickname: string; content: string;
  created_at: string; user_id: string; likes: number;
};

export default function CommunityPage() {
  const { lang } = useLangStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showWrite, setShowWrite] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [form, setForm] = useState({ title: '', content: '', category: 'general' });
  const [editForm, setEditForm] = useState({ title: '', content: '', category: 'general' });
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState('');
  const [myId, setMyId] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMyId(getCurrentUserId());
    loadPosts();
  }, []);

  useEffect(() => { loadPosts(); }, [activeCategory]);

  const t = i18n[lang] || i18n.ko;

  const categories = CATEGORY_META.map(c => ({
    ...c,
    label: t.categories[c.value] || c.value
  }));

  const loadPosts = async () => {
    setFetching(true);
    const url = activeCategory === 'all'
      ? `${API_BASE}/posts`
      : `${API_BASE}/posts?category=${activeCategory}`;
    const res = await fetch(url);
    if (res.ok) setPosts(await res.json());
    setFetching(false);
  };

  const loadComments = async (postId: string) => {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`);
    if (res.ok) setComments(await res.json());
  };

  const checkLiked = async (postId: string) => {
    const res = await fetch(`${API_BASE}/posts/${postId}/liked`, { headers: authHeaders(false) });
    if (res.ok) {
      const data = await res.json();
      setLikedPosts(prev => {
        const next = new Set(prev);
        if (data.liked) next.add(postId); else next.delete(postId);
        return next;
      });
    }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openPost = async (post: Post) => {
    setSelectedPost(post);
    setEditingPost(null);
    await loadComments(post.id);
    await checkLiked(post.id);
  };

  const handleSubmitPost = async () => {
    if (!form.title.trim() || !form.content.trim()) { showToast(t.toast_input); return; }
    setLoading(true);
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ title: '', content: '', category: 'general' });
      setShowWrite(false);
      await loadPosts();
      showToast(t.toast_success);
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.detail || t.toast_login);
    }
    setLoading(false);
  };

  const handleEditPost = async () => {
    if (!editingPost) return;
    if (!editForm.title.trim() || !editForm.content.trim()) { showToast(t.toast_input); return; }
    setLoading(true);
    const res = await fetch(`${API_BASE}/posts/${editingPost.id}`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify(editForm),
    });
    if (res.ok) {
      const updated = await res.json();
      setSelectedPost(updated);
      setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
      setEditingPost(null);
      showToast(t.toast_edited);
    }
    setLoading(false);
  };

  const handleLike = async (postId: string) => {
    const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
      method: 'POST', headers: authHeaders(false),
    });
    if (res.ok) {
      const data = await res.json();
      setLikedPosts(prev => {
        const next = new Set(prev);
        if (data.liked) next.add(postId); else next.delete(postId);
        return next;
      });
      await loadPosts();
      if (selectedPost?.id === postId) {
        const r = await fetch(`${API_BASE}/posts/${postId}`);
        if (r.ok) setSelectedPost(await r.json());
      }
    } else {
      showToast(t.toast_login);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm(t.delete_confirm)) return;
    await fetch(`${API_BASE}/posts/${postId}`, { method: 'DELETE', headers: authHeaders(false) });
    setSelectedPost(null);
    await loadPosts();
    showToast(t.toast_deleted);
  };

  const handleComment = async () => {
    if (!commentText.trim() || !selectedPost) return;
    setLoading(true);
    const res = await fetch(`${API_BASE}/posts/${selectedPost.id}/comments`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify({ content: commentText }),
    });
    if (res.ok) { setCommentText(''); await loadComments(selectedPost.id); showToast(t.toast_comment_success); }
    setLoading(false);
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    await fetch(`${API_BASE}/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE', headers: authHeaders(false),
    });
    await loadComments(postId);
    showToast(t.toast_comment_deleted);
  };

  const handleLikeComment = async (postId: string, commentId: string) => {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments/${commentId}/like`, {
      method: 'POST', headers: authHeaders(false),
    });
    if (res.ok) await loadComments(postId);
  };

  const startEdit = (post: Post) => {
    setEditForm({ title: post.title, content: post.content, category: post.category });
    setEditingPost(post);
  };

  const catLabel = (v: string) => categories.find(c => c.value === v)?.label || v;
  const catColor = (v: string) => categories.find(c => c.value === v)?.color || 'var(--text-secondary)';

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 className="page-title">{t.hero_title}</h2>
          <p className="page-subtitle">{t.hero_sub}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowWrite(!showWrite); setSelectedPost(null); setEditingPost(null); }}>
          {showWrite ? t.btn_close : t.btn_write}
        </button>
      </div>

      {/* 글쓰기 폼 */}
      {showWrite && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>{t.write_title}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">{t.category}</label>
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
              <label className="form-label">{t.title}</label>
              <input className="form-input" placeholder={t.title_ph}
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">{t.content}</label>
              <textarea className="form-textarea" rows={5} placeholder={t.content_ph}
                value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowWrite(false)}>{t.cancel}</button>
              <button className="btn btn-primary" onClick={handleSubmitPost} disabled={loading}>
                {loading ? t.submitting : t.submit}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 글 수정 폼 */}
      {editingPost && (
        <div className="card" style={{ marginBottom: 24, border: '2px solid var(--warning)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20, color: 'var(--warning)' }}>{t.edit_title}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">{t.category}</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {categories.map(c => (
                  <button key={c.value} type="button"
                    style={{
                      cursor: 'pointer', padding: '6px 14px',
                      background: editForm.category === c.value ? `${c.color}18` : undefined,
                      color: editForm.category === c.value ? c.color : 'var(--text-secondary)',
                      border: `1.5px solid ${editForm.category === c.value ? c.color : 'var(--border)'}`,
                      borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.8rem'
                    }}
                    onClick={() => setEditForm({ ...editForm, category: c.value })}>{c.label}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t.title}</label>
              <input className="form-input" value={editForm.title}
                onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">{t.content}</label>
              <textarea className="form-textarea" rows={5} value={editForm.content}
                onChange={e => setEditForm({ ...editForm, content: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setEditingPost(null)}>{t.cancel}</button>
              <button className="btn btn-primary" style={{ background: 'var(--warning)' }}
                onClick={handleEditPost} disabled={loading}>
                {loading ? t.edit_submitting : t.edit_submit}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedPost ? '1fr 400px' : '1fr', gap: 24 }}>
        {/* 게시글 목록 */}
        <div>
          <div className="tabs" style={{ marginBottom: 20 }}>
            <button className={`tab ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>{t.tab_all}</button>
            {categories.map(c => (
              <button key={c.value} className={`tab ${activeCategory === c.value ? 'active' : ''}`}
                onClick={() => setActiveCategory(c.value)}>{c.label}</button>
            ))}
          </div>

          {fetching ? (
            <div className="empty-state"><p>{t.empty_fetching}</p></div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <p>{t.empty_title}</p>
              <button className="btn btn-primary" onClick={() => setShowWrite(true)}>{t.empty_btn}</button>
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
                    <span>{new Date(p.created_at).toLocaleDateString(lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : 'en-US')}</span>
                    {p.updated_at && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({lang === 'ko' ? '수정됨' : lang === 'ja' ? '修正済み' : lang === 'zh' ? '已修改' : 'Edited'})</span>}
                  </div>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 6 }}>{p.title}</h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.content}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span style={{ color: likedPosts.has(p.id) ? '#e74c3c' : undefined }}>
                      {likedPosts.has(p.id) ? '❤️' : '🤍'} {p.likes}
                    </span>
                    <span>{t.liked_badge}</span>
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
                {selectedPost.updated_at && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {lang === 'ko' ? '수정됨' : lang === 'ja' ? '修正済み' : lang === 'zh' ? '已修改' : 'Edited'}: {new Date(selectedPost.updated_at).toLocaleString(lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : 'en-US')}
                  </p>
                )}
              </div>
              <button className="modal-close" onClick={() => { setSelectedPost(null); setEditingPost(null); }}>✕</button>
            </div>

            <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-primary)', marginBottom: 16, whiteSpace: 'pre-wrap' }}>{selectedPost.content}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => handleLike(selectedPost.id)}
                style={{
                  color: likedPosts.has(selectedPost.id) ? '#e74c3c' : undefined,
                  borderColor: likedPosts.has(selectedPost.id) ? '#e74c3c' : undefined,
                }}
              >
                {likedPosts.has(selectedPost.id) ? '❤️' : '🤍'} {selectedPost.likes}
              </button>
              {selectedPost.user_id === myId && (
                <>
                  <button className="btn btn-sm" style={{ background: 'var(--warning-light)', color: 'var(--warning)', border: '1px solid var(--warning)' }}
                    onClick={() => startEdit(selectedPost)}>{t.btn_edit}</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeletePost(selectedPost.id)}>{t.btn_delete}</button>
                </>
              )}
            </div>

            {/* 댓글 */}
            <h4 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 12 }}>{t.comment_count.replace('{count}', String(comments.length))}</h4>
            <div style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 14 }}>
              {comments.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>{t.comment_empty}</p>
              ) : comments.map(c => (
                <div key={c.id} className="comment-item">
                  <div className="avatar avatar-sm">{c.author_nickname?.slice(0, 1) || '익'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{c.author_nickname}</span>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-muted)' }}
                          onClick={() => handleLikeComment(selectedPost.id, c.id)}
                        >🤍 {c.likes || 0}</button>
                        {c.user_id === myId && (
                          <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                            onClick={() => handleDeleteComment(selectedPost.id, c.id)}>{t.comment_delete}</button>
                        )}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: 3 }}>{c.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 댓글 입력 */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-input" style={{ flex: 1 }} placeholder={t.comment_ph}
                value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment()} />
              <button className="btn btn-primary btn-sm" onClick={handleComment} disabled={loading}>{t.comment_submit}</button>
            </div>
          </div>
        )}
      </div>

      {toast && <div className="toast success">{toast}</div>}
    </div>
  );
}
