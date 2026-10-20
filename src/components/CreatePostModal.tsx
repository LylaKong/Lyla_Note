'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { PostCategory } from '@/types/database';
import { X, Calendar, MapPin, Gauge, Users, Send } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
  const { user, profile } = useAuth();
  const supabase = createClient();

  const [category, setCategory] = useState<PostCategory>('regular');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [runDate, setRunDate] = useState('');
  const [location, setLocation] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [targetPace, setTargetPace] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('20');
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    if (!profile.is_approved && profile.role !== 'admin') {
      setErrorMsg('운영진 승인을 받은 크루원만 글을 작성할 수 있습니다.');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setErrorMsg('제목과 내용을 입력해 주세요.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.from('posts').insert({
        author_id: user.id,
        category,
        title: title.trim(),
        content: content.trim(),
        run_date: runDate ? new Date(runDate).toISOString() : null,
        location: location.trim() || null,
        distance_km: distanceKm ? parseFloat(distanceKm) : null,
        target_pace: targetPace.trim() || null,
        max_participants: parseInt(maxParticipants, 10) || 20,
        is_pinned: profile.role === 'admin' ? isPinned : false,
      });

      if (error) throw error;

      onPostCreated();
      onClose();
      // Reset form
      setTitle('');
      setContent('');
      setRunDate('');
      setLocation('');
      setDistanceKm('');
      setTargetPace('');
      setMaxParticipants('20');
      setIsPinned(false);
    } catch (err: any) {
      setErrorMsg(err.message || '게시글 작성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-crew-border bg-crew-card p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-crew-border pb-4 mb-5">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-white tracking-tight">새 러닝 / 게시글 등록</h2>
            <span className="text-xs text-crew-muted">크루원들과 함께 달릴 일정이나 러닝 일지를 공유하세요.</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-crew-muted hover:bg-crew-bg hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Tabs */}
          <div>
            <label className="block text-xs font-semibold text-crew-muted uppercase font-mono mb-2">
              카테고리 선택
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'regular', label: '정기런' },
                { id: 'flash', label: '번개런' },
                { id: 'log', label: '러닝 후기' },
                ...(isAdmin ? [{ id: 'notice', label: '크루 공지' }] : []),
              ].map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id as PostCategory)}
                  className={`rounded-lg py-2 text-xs font-semibold border transition-all ${
                    category === cat.id
                      ? 'border-crew-volt bg-crew-volt/10 text-crew-volt font-bold'
                      : 'border-crew-border bg-crew-bg/40 text-crew-muted hover:text-white hover:border-crew-borderHover'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-crew-muted uppercase font-mono mb-1">
              글 제목
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="예: [정기런] 목요일 반포 한강 달빛광장 7km 이지런"
              className="w-full rounded-lg border border-crew-border bg-crew-bg px-3.5 py-2.5 text-sm text-white placeholder-crew-muted/60 focus:border-crew-volt focus:outline-none"
              required
            />
          </div>

          {/* Running Specific Fields (For regular, flash runs) */}
          {(category === 'regular' || category === 'flash') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-crew-border/60 bg-crew-bg/40 p-3.5">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-crew-muted mb-1">
                  <Calendar className="h-3.5 w-3.5 text-crew-volt" /> 러닝 일시
                </label>
                <input
                  type="datetime-local"
                  value={runDate}
                  onChange={e => setRunDate(e.target.value)}
                  className="w-full rounded-lg border border-crew-border bg-crew-card px-3 py-2 text-xs text-white focus:border-crew-volt focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-crew-muted mb-1">
                  <MapPin className="h-3.5 w-3.5 text-crew-volt" /> 집결 장소
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="예: 반포한강공원 잠수교 남단"
                  className="w-full rounded-lg border border-crew-border bg-crew-card px-3 py-2 text-xs text-white placeholder-crew-muted/60 focus:border-crew-volt focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-crew-muted mb-1">
                  <Gauge className="h-3.5 w-3.5 text-crew-volt" /> 목표 거리 (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={distanceKm}
                  onChange={e => setDistanceKm(e.target.value)}
                  placeholder="예: 7.0"
                  className="w-full rounded-lg border border-crew-border bg-crew-card px-3 py-2 text-xs text-white placeholder-crew-muted/60 focus:border-crew-volt focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-crew-muted mb-1">
                  <Gauge className="h-3.5 w-3.5 text-crew-orange" /> 목표 페이스
                </label>
                <input
                  type="text"
                  value={targetPace}
                  onChange={e => setTargetPace(e.target.value)}
                  placeholder="예: 5'30~6'00"
                  className="w-full rounded-lg border border-crew-border bg-crew-card px-3 py-2 text-xs text-white placeholder-crew-muted/60 focus:border-crew-volt focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-crew-muted mb-1">
                  <Users className="h-3.5 w-3.5 text-crew-volt" /> 최대 모집 인원
                </label>
                <input
                  type="number"
                  value={maxParticipants}
                  onChange={e => setMaxParticipants(e.target.value)}
                  min="2"
                  max="100"
                  className="w-full rounded-lg border border-crew-border bg-crew-card px-3 py-2 text-xs text-white focus:border-crew-volt focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-crew-muted uppercase font-mono mb-1">
              상세 내용 및 코스 안내
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="코스 특징, 짐 보관 정보, 준비물, 주의사항 등을 편하게 작성해 주세요."
              className="w-full rounded-lg border border-crew-border bg-crew-bg px-3.5 py-2.5 text-sm text-white placeholder-crew-muted/60 focus:border-crew-volt focus:outline-none leading-relaxed"
              required
            />
          </div>

          {/* Admin Pin Option */}
          {isAdmin && (
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={e => setIsPinned(e.target.checked)}
                className="h-4 w-4 rounded border-crew-border text-crew-volt focus:ring-0"
              />
              <span className="text-xs text-zinc-300 font-medium">상단 공지로 고정 (Pinned Post)</span>
            </label>
          )}

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-crew-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-crew-border px-4 py-2 text-xs font-medium text-crew-muted hover:text-white transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-crew-volt px-5 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-lime-400 disabled:opacity-50 transition-colors"
            >
              <Send className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>{loading ? '등록 중...' : '등록하기'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
