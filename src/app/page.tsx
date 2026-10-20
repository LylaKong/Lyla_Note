'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Post, PostCategory } from '@/types/database';
import { Header } from '@/components/Header';
import { ApprovalNoticeBanner } from '@/components/ApprovalNoticeBanner';
import { PostFilter } from '@/components/PostFilter';
import { PostCard } from '@/components/PostCard';
import { CreatePostModal } from '@/components/CreatePostModal';
import { PostDetailModal } from '@/components/PostDetailModal';
import { Flame, Compass, Plus, Trophy, Zap } from 'lucide-react';

export default function HomePage() {
  const { user, profile, signInWithGoogle } = useAuth();
  const supabase = createClient();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(*),
          rsvps(*)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data || []) as Post[]);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Category counts
  const categoryCounts = posts.reduce<Record<string, number>>(
    (acc, post) => {
      acc['all'] = (acc['all'] || 0) + 1;
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    },
    { all: posts.length }
  );

  // Filtered posts
  const filteredPosts =
    currentCategory === 'all'
      ? posts
      : posts.filter(p => p.category === currentCategory);

  const isApproved = profile?.is_approved || profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-crew-bg text-white flex flex-col selection:bg-crew-volt selection:text-black">
      {/* Header */}
      <Header onOpenCreateModal={() => setIsCreateOpen(true)} />

      {/* Approval Status Alert Banner */}
      <ApprovalNoticeBanner />

      {/* Hero Section (Athletic High-Contrast Running Crew Identity) */}
      <section className="border-b border-crew-border bg-gradient-to-b from-crew-card/40 to-crew-bg py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 font-mono text-xs text-crew-volt uppercase tracking-wider">
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>SEOUL PACEMAKER RUNNING CREW</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
                Together We Run Further.
              </h1>
              <p className="mt-2.5 text-xs sm:text-sm text-crew-muted max-w-xl leading-relaxed">
                정기 세션, 퇴근 후 번개런, 마라톤 훈련 기록까지. 크루원들과 호흡을 맞추며 달리는 우리만의 러닝 보드입니다.
              </p>
            </div>

            {/* Quick Metrics & CTA */}
            <div className="flex items-center gap-3">
              {!user ? (
                <button
                  onClick={signInWithGoogle}
                  className="flex items-center gap-2 rounded-xl bg-crew-volt px-5 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-lime-400 transition-all shadow-lg"
                >
                  <Flame className="h-4 w-4 fill-current" />
                  <span>크루 합류 (구글 로그인)</span>
                </button>
              ) : isApproved ? (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-crew-volt px-5 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-lime-400 transition-all shadow-lg"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>새 러닝 등록</span>
                </button>
              ) : (
                <div className="rounded-xl border border-crew-orange/40 bg-crew-orange/10 px-4 py-2.5 text-xs text-crew-orange font-mono">
                  운영진 승인 대기 중
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Board Content */}
      <main className="mx-auto max-w-6xl w-full flex-1 px-4 sm:px-6 py-8">
        {/* Filter Tabs */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <PostFilter
            currentCategory={currentCategory}
            onSelectCategory={setCurrentCategory}
            counts={categoryCounts}
          />

          <span className="hidden sm:inline-block text-xs font-mono text-crew-muted">
            {filteredPosts.length}개의 세션 및 포스트
          </span>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="h-56 rounded-xl border border-crew-border bg-crew-card/40 animate-pulse"
              />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-crew-border bg-crew-card/30 p-12 text-center">
            <Compass className="mx-auto h-10 w-10 text-crew-muted mb-3" />
            <h3 className="text-base font-bold text-white mb-1">
              아직 등록된 러닝 세션이 없습니다.
            </h3>
            <p className="text-xs text-crew-muted max-w-sm mx-auto mb-5">
              이번 주 정기런이나 가벼운 번개 세션을 가장 먼저 개설해 보세요!
            </p>
            {isApproved && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-crew-volt px-4 py-2 text-xs font-bold uppercase text-black hover:bg-lime-400 transition-colors"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>첫 러닝 등록하기</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => setSelectedPostId(post.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-crew-border bg-crew-card/40 py-6 px-4 text-center text-xs text-crew-muted font-mono">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PACEMAKER RUNNING CLUB // EST. 2026</span>
          <span>POWERED BY NEXT.JS, SUPABASE & VERCEL</span>
        </div>
      </footer>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPostCreated={fetchPosts}
      />

      {/* Post Detail Modal */}
      <PostDetailModal
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
        onPostUpdated={fetchPosts}
      />
    </div>
  );
}
