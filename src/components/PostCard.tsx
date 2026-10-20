'use client';

import React from 'react';
import { Post } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { Calendar, MapPin, Gauge, Users, MessageSquare, Pin } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onClick: () => void;
}

export function PostCard({ post, onClick }: PostCardProps) {
  const attendingCount = post.rsvps?.filter(r => r.status === 'attending').length || 0;

  const categoryConfig: Record<string, { label: string; tagClass: string }> = {
    regular: {
      label: 'REGULAR RUN',
      tagClass: 'text-crew-volt border-crew-volt/30 bg-crew-volt/10',
    },
    flash: {
      label: 'FLASH RUN',
      tagClass: 'text-crew-orange border-crew-orange/30 bg-crew-orange/10',
    },
    log: {
      label: 'RUN LOG',
      tagClass: 'text-sky-400 border-sky-400/30 bg-sky-400/10',
    },
    notice: {
      label: 'NOTICE',
      tagClass: 'text-red-400 border-red-400/30 bg-red-400/10',
    },
  };

  const currentCategory = categoryConfig[post.category] || categoryConfig.regular;

  return (
    <article
      onClick={onClick}
      className={`group relative flex flex-col justify-between rounded-xl border ${
        post.is_pinned ? 'border-crew-volt/40 bg-crew-card/90' : 'border-crew-border bg-crew-card/60'
      } p-5 hover:border-crew-borderHover hover:bg-crew-card transition-all cursor-pointer`}
    >
      <div>
        {/* Top Badges & Author */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded border ${currentCategory.tagClass}`}>
              {currentCategory.label}
            </span>
            {post.is_pinned && (
              <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-crew-volt">
                <Pin className="h-3 w-3 fill-current rotate-45" /> PINNED
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-crew-muted">
            {post.author?.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt=""
                className="h-4 w-4 rounded-full object-cover"
              />
            ) : null}
            <span className="truncate max-w-[100px]">
              {post.author?.full_name || post.author?.email?.split('@')[0] || '크루원'}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-crew-volt transition-colors line-clamp-2 mb-2">
          {post.title}
        </h3>

        {/* Snippet */}
        <p className="text-xs text-crew-muted line-clamp-2 leading-relaxed mb-4">
          {post.content}
        </p>

        {/* Running Key Metrics (if available) */}
        {(post.distance_km || post.target_pace || post.location || post.run_date) && (
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-crew-border/60 bg-crew-bg/60 p-2.5 mb-4 text-xs font-mono">
            {post.run_date && (
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Calendar className="h-3.5 w-3.5 text-crew-muted" />
                <span className="truncate">{formatDate(post.run_date)}</span>
              </div>
            )}
            {post.location && (
              <div className="flex items-center gap-1.5 text-zinc-300">
                <MapPin className="h-3.5 w-3.5 text-crew-muted" />
                <span className="truncate">{post.location}</span>
              </div>
            )}
            {post.distance_km && (
              <div className="flex items-center gap-1.5 text-crew-volt font-bold">
                <span className="text-[10px] text-crew-muted uppercase">DIST</span>
                <span>{post.distance_km} km</span>
              </div>
            )}
            {post.target_pace && (
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Gauge className="h-3.5 w-3.5 text-crew-muted" />
                <span>{post.target_pace}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-3 border-t border-crew-border/60 text-xs text-crew-muted font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
            <Users className="h-3.5 w-3.5 text-crew-volt" />
            <span>{attendingCount} / {post.max_participants || 20}명 참석</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{post.comments_count || 0}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
