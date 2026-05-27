from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List
from app.core.database import get_db
from app.models.community import Post, Comment
from app.schemas.schemas import PostCreate, PostResponse, CommentCreate, CommentResponse
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

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
    # 댓글도 함께 삭제
    comments_result = await db.execute(select(Comment).where(Comment.post_id == post_id))
    for comment in comments_result.scalars().all():
        await db.delete(comment)
    await db.delete(post)
    await db.commit()

@router.post("/{post_id}/like", status_code=200)
async def like_post(post_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    post.likes = (post.likes or 0) + 1
    db.add(post)
    await db.commit()
    return {"likes": post.likes}

@router.post("/{post_id}/comments", response_model=CommentResponse, status_code=201)
async def create_comment(
    post_id: str,
    comment_in: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 게시글 존재 확인
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
    await db.delete(comment)
    await db.commit()
