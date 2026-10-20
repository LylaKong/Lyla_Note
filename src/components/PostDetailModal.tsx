'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Post, Comment, RSVP } from '@/types/database';
import { formatDate } from '@/lib/utils';
import {
  X,
  Calendar,
  MapPin,
  Gauge,
  Users,
  Trash2,
  CheckCircle2,
  Heart,
  Send,
  Pin,
} from 'lucide-react';

interface PostDetailModalProps {
  postId: string | null;
  onClose: () => void;
  onPostUpdated: () => void;
}

export function PostDetailModal({ postId, onClose, onPostUpdated }: PostDetailModalProps) {
  const { user, profile } = useAuth();
  const supabase = createClient();

  const [post, setPost] = useState<Post | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const fetchPostDetails = async () => {
    if (!postId) return;
    setLoading(true);

    try {
      // 1. Fetch Post
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*, author:profiles(*)')
        .eq('id', postId)
        .single();

      if (postError) throw postError;
      setPost(postData as Post);

      // 2. Fetch RSVPs
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvps')
        .select('*, user:profiles(*)')
        .eq('post_id', postId);

      if (!rsvpError && rsvpData) {
        setRsvps(rsvpData as RSVP[]);
      }

      // 3. Fetch Comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*, author:profiles(*)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (!commentsError && commentsData) {
        setComments(commentsData as Comment[]);
      }
    } catch (err: any) {
      console.error('Error fetching post details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  if (!postId) return null;

  const isApproved = profile?.is_approved || profile?.role === 'admin';
  const isAdmin = profile?.role === 'admin';
  const isAuthor = user && post && user.id === post.author_id;

  const currentRsvp = user ? rsvps.find(r => r.user_id === user.id) : null;
  const attendingList = rsvps.filter(r => r.status === 'attending');
  const cheeringList = rsvps.filter(r => r.status === 'cheering');

  // Handle RSVP
  const handleToggleRsvp = async (status: 'attending' | 'cheering') => {
    if (!user || !profile) {
      setActionMsg('구글 로그인 후 참석 투표가 가능합니다.');
      return;
    }
    if (!isApproved) {
      setActionMsg('운영진 승인 완료 후 참석 신청이 가능합니다.');
      return;
    }

    setRsvpLoading(true);
    setActionMsg('');

    try {
      if (currentRsvp) {
        if (currentRsvp.status === status) {
          // Cancel RSVP
          await supabase.from('rsvps').delete().eq('id', currentRsvp.id);
        } else {
          // Switch RSVP status
          await supabase.from('rsvps').update({ status }).eq('id', currentRsvp.id);
        }
      } else {
        // Insert new RSVP
        await supabase.from('rsvps').insert({
          post_id: postId,
          user_id: user.id,
          status,
        });
      }
      await fetchPostDetails();
      onPostUpdated();
    } catch (err: any) {
      setActionMsg(err.message || '참석 처리 중 오류가 발생했습니다.');
    } finally {
      setRsvpLoading(false);
    }
  };

  // Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !newComment.trim()) return;

    if (!isApproved) {
      setActionMsg('운영진 승인 완료 후 댓글 작성이 가능합니다.');
      return;
    }

    setSubmittingComment(true);
    try {
      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        author_id: user.id,
        content: newComment.trim(),
      });

      if (error) throw error;
      setNewComment('');
      await fetchPostDetails();
      onPostUpdated();
    } catch (err: any) {
      setActionMsg(err.message || '댓글 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete Post
  const handleDeletePost = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      onPostUpdated();
      onClose();
    } catch (err: any) {
      alert(err.message || '삭제 권한이 없거나 오류가 발생했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-crew-border bg-crew-card p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header Close */}
        <div className="flex items-center justify-between border-b border-crew-border pb-3 mb-4">
          <div className="flex items-center gap-2">
            {post?.is_pinned && (
              <span className="flex items-center gap-1 rounded bg-crew-volt/10 border border-crew-volt/30 px-2 py-0.5 text-[10px] font-mono font-bold text-crew-volt">
                <Pin className="h-3 w-3 fill-current rotate-45" /> PINNED
              </span>
            )}
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-crew-muted">
              {post?.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {(isAuthor || isAdmin) && (
              <button
                onClick={handleDeletePost}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors p-1"
                title="게시글 삭제"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">삭제</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-crew-muted hover:bg-crew-bg hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading || !post ? (
          <div className="py-20 text-center text-xs text-crew-muted font-mono animate-pulse">
            LOADING RUN DETAILS...
          </div>
        ) : (
          <div className="overflow-y-auto pr-1 flex-1 space-y-6">
            {/* Title & Author Info */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug mb-3">
                {post.title}
              </h2>

              <div className="flex items-center justify-between text-xs text-crew-muted">
                <div className="flex items-center gap-2">
                  {post.author?.avatar_url ? (
                    <img
                      src={post.author.avatar_url}
                      alt=""
                      className="h-6 w-6 rounded-full object-cover border border-crew-border"
                    />
                  ) : null}
                  <span className="font-semibold text-zinc-300">
                    {post.author?.full_name || post.author?.email}
                  </span>
                  {post.author?.role === 'admin' && (
                    <span className="rounded bg-crew-volt/20 text-crew-volt text-[9px] font-mono px-1 font-bold">
                      ADMIN
                    </span>
                  )}
                </div>
                <span className="font-mono text-[11px]">{formatDate(post.created_at)}</span>
              </div>
            </div>

            {/* Running Specs Box */}
            {(post.run_date || post.location || post.distance_km || post.target_pace) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-xl border border-crew-border bg-crew-bg/70 p-3.5 text-xs font-mono">
                {post.run_date && (
                  <div>
                    <span className="text-[10px] text-crew-muted uppercase block mb-0.5">러닝 일시</span>
                    <span className="text-zinc-200 font-bold">{formatDate(post.run_date)}</span>
                  </div>
                )}
                {post.location && (
                  <div>
                    <span className="text-[10px] text-crew-muted uppercase block mb-0.5">집결지</span>
                    <span className="text-zinc-200 font-bold truncate block">{post.location}</span>
                  </div>
                )}
                {post.distance_km && (
                  <div>
                    <span className="text-[10px] text-crew-muted uppercase block mb-0.5">목표 거리</span>
                    <span className="text-crew-volt font-black">{post.distance_km} KM</span>
                  </div>
                )}
                {post.target_pace && (
                  <div>
                    <span className="text-[10px] text-crew-muted uppercase block mb-0.5">목표 페이스</span>
                    <span className="text-crew-orange font-bold">{post.target_pace}</span>
                  </div>
                )}
              </div>
            )}

            {/* Content Body */}
            <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap py-2 border-b border-crew-border/60">
              {post.content}
            </div>

            {/* RSVP Section (Attending / Cheering) */}
            <div className="rounded-xl border border-crew-border bg-crew-bg/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-crew-volt" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    참석자 명단 ({attendingList.length} / {post.max_participants}명)
                  </span>
                </div>

                {/* RSVP Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRsvp('attending')}
                    disabled={rsvpLoading}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      currentRsvp?.status === 'attending'
                        ? 'bg-crew-volt text-black shadow'
                        : 'border border-crew-border bg-crew-card text-crew-text hover:border-crew-volt hover:text-crew-volt'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{currentRsvp?.status === 'attending' ? '참석 완료' : '참석하기'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleRsvp('cheering')}
                    disabled={rsvpLoading}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      currentRsvp?.status === 'cheering'
                        ? 'bg-crew-orange text-white'
                        : 'border border-crew-border bg-crew-card text-crew-muted hover:text-white'
                    }`}
                  >
                    <Heart className="h-3.5 w-3.5 fill-current" />
                    <span>응원</span>
                  </button>
                </div>
              </div>

              {actionMsg && (
                <div className="mb-3 rounded bg-crew-orange/10 border border-crew-orange/30 p-2 text-xs text-crew-orange">
                  {actionMsg}
                </div>
              )}

              {/* Attending Member Avatars */}
              <div className="flex flex-wrap gap-2 pt-1">
                {attendingList.length === 0 ? (
                  <span className="text-xs text-crew-muted">아직 참석 신청자가 없습니다. 가장 먼저 합류해 보세요!</span>
                ) : (
                  attendingList.map(rsvp => (
                    <div
                      key={rsvp.id}
                      className="flex items-center gap-1.5 rounded-full border border-crew-border bg-crew-card px-2.5 py-1 text-xs"
                    >
                      {rsvp.user?.avatar_url ? (
                        <img
                          src={rsvp.user.avatar_url}
                          alt=""
                          className="h-4 w-4 rounded-full object-cover"
                        />
                      ) : null}
                      <span className="text-zinc-200 font-medium">
                        {rsvp.user?.full_name || rsvp.user?.email.split('@')[0]}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-crew-muted mb-3">
                댓글 ({comments.length})
              </h4>

              {/* Comment List */}
              <div className="space-y-3 mb-4">
                {comments.length === 0 ? (
                  <p className="text-xs text-crew-muted py-2">등록된 댓글이 없습니다.</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="rounded-lg border border-crew-border/40 bg-crew-bg/40 p-3 text-xs">
                      <div className="flex items-center justify-between text-crew-muted mb-1.5">
                        <span className="font-semibold text-zinc-300">
                          {c.author?.full_name || c.author?.email.split('@')[0]}
                        </span>
                        <span className="font-mono text-[10px]">{formatDate(c.created_at)}</span>
                      </div>
                      <p className="text-zinc-200 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              {user && (
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder={
                      isApproved
                        ? '응원 한마디나 러닝 관련 질문을 남겨주세요.'
                        : '운영진 승인 완료 후 댓글 작성이 가능합니다.'
                    }
                    disabled={!isApproved || submittingComment}
                    className="flex-1 rounded-lg border border-crew-border bg-crew-bg px-3 py-2 text-xs text-white placeholder-crew-muted/60 focus:border-crew-volt focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!isApproved || submittingComment || !newComment.trim()}
                    className="flex items-center gap-1 rounded-lg bg-crew-volt px-4 py-2 text-xs font-bold text-black hover:bg-lime-400 disabled:opacity-40 transition-colors"
                  >
                    <Send className="h-3 w-3 stroke-[3]" />
                    <span>작성</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
