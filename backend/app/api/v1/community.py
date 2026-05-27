from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.core.database import get_db
from app.models.community import Post, Comment, PostLike, CommentLike
from app.schemas.schemas import PostCreate, PostResponse, CommentCreate, CommentResponse
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

# ─── 추가 스키마 ─────────────────────────────────────────────

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None

class PostResponseWithLiked(PostResponse):
    liked_by_me: Optional[bool] = False
    updated_at: Optional[datetime] = None

class CommentResponseWithLiked(CommentResponse):
    liked_by_me: Optional[bool] = False

# ─── 게시글 ──────────────────────────────────────────────────

@router.post("", response_model=PostResponse, status_code=201)
async def create_post(
    post_in: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = Post(
        user_id=current_user.id,
        author_nickname=current_user.nickname or "익명",
        title=post_in.title,
        content=post_in.content,
        category=post_in.category,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post

@router.get("", response_model=List[PostResponse])
async def get_posts(
    category: str = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Post).order_by(Post.created_at.desc())
    if category and category != "all":
        query = query.where(Post.category == category)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    return post

@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: str,
    post_in: PostUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="수정 권한이 없습니다.")
    if post_in.title is not None:
        post.title = post_in.title
    if post_in.content is not None:
        post.content = post_in.content
    if post_in.category is not None:
        post.category = post_in.category
    post.updated_at = datetime.utcnow()
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post

@router.delete("/{post_id}", status_code=204)
async def delete_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="삭제 권한이 없습니다.")
    # 좋아요, 댓글도 함께 삭제
    likes_result = await db.execute(select(PostLike).where(PostLike.post_id == post_id))
    for like in likes_result.scalars().all():
        await db.delete(like)
    comments_result = await db.execute(select(Comment).where(Comment.post_id == post_id))
    for comment in comments_result.scalars().all():
        # 댓글 좋아요도 삭제
        clikes = await db.execute(select(CommentLike).where(CommentLike.comment_id == comment.id))
        for cl in clikes.scalars().all():
            await db.delete(cl)
        await db.delete(comment)
    await db.delete(post)
    await db.commit()

# ─── 좋아요 (중복 방지) ────────────────────────────────────────

@router.post("/{post_id}/like", status_code=200)
async def toggle_like_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")

    # 이미 좋아요 했는지 확인
    like_result = await db.execute(
        select(PostLike).where(PostLike.post_id == post_id, PostLike.user_id == current_user.id)
    )
    existing_like = like_result.scalars().first()

    if existing_like:
        # 좋아요 취소
        await db.delete(existing_like)
        post.likes = max(0, (post.likes or 0) - 1)
        liked = False
    else:
        # 좋아요 추가
        new_like = PostLike(post_id=post_id, user_id=current_user.id)
        db.add(new_like)
        post.likes = (post.likes or 0) + 1
        liked = True

    db.add(post)
    await db.commit()
    return {"likes": post.likes, "liked": liked}

@router.get("/{post_id}/liked", status_code=200)
async def check_liked(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """현재 유저가 이 게시글에 좋아요 했는지 확인"""
    like_result = await db.execute(
        select(PostLike).where(PostLike.post_id == post_id, PostLike.user_id == current_user.id)
    )
    return {"liked": like_result.scalars().first() is not None}

# ─── 댓글 ────────────────────────────────────────────────────

@router.post("/{post_id}/comments", response_model=CommentResponse, status_code=201)
async def create_comment(
    post_id: str,
    comment_in: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post_result = await db.execute(select(Post).where(Post.id == post_id))
    if not post_result.scalars().first():
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        author_nickname=current_user.nickname or "익명",
        content=comment_in.content,
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return comment

@router.get("/{post_id}/comments", response_model=List[CommentResponse])
async def get_comments(post_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Comment).where(Comment.post_id == post_id).order_by(Comment.created_at.asc())
    )
    return result.scalars().all()

@router.delete("/{post_id}/comments/{comment_id}", status_code=204)
async def delete_comment(
    post_id: str,
    comment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Comment).where(Comment.id == comment_id, Comment.post_id == post_id)
    )
    comment = result.scalars().first()
    if not comment:
        raise HTTPException(status_code=404, detail="댓글을 찾을 수 없습니다.")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="삭제 권한이 없습니다.")
    # 댓글 좋아요 삭제
    clikes = await db.execute(select(CommentLike).where(CommentLike.comment_id == comment_id))
    for cl in clikes.scalars().all():
        await db.delete(cl)
    await db.delete(comment)
    await db.commit()

@router.post("/{post_id}/comments/{comment_id}/like", status_code=200)
async def toggle_like_comment(
    post_id: str,
    comment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalars().first()
    if not comment:
        raise HTTPException(status_code=404, detail="댓글을 찾을 수 없습니다.")

    like_result = await db.execute(
        select(CommentLike).where(CommentLike.comment_id == comment_id, CommentLike.user_id == current_user.id)
    )
    existing_like = like_result.scalars().first()

    if existing_like:
        await db.delete(existing_like)
        comment.likes = max(0, (comment.likes or 0) - 1)
        liked = False
    else:
        new_like = CommentLike(comment_id=comment_id, user_id=current_user.id)
        db.add(new_like)
        comment.likes = (comment.likes or 0) + 1
        liked = True

    db.add(comment)
    await db.commit()
    return {"likes": comment.likes, "liked": liked}
