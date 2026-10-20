'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Clock, AlertCircle } from 'lucide-react';

export function ApprovalNoticeBanner() {
  const { user, profile } = useAuth();

  if (!user || !profile) return null;

  // 이미 승인되었거나 관리자인 경우 표시하지 않음
  if (profile.is_approved || profile.role === 'admin') return null;

  return (
    <div className="w-full border-b border-crew-orange/30 bg-crew-orange/10 px-4 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-crew-orange">
          <Clock className="h-4 w-4 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
          <span>
            <strong>운영진 승인 대기 중:</strong> 현재 게스트 모드입니다. 관리자가 승인한 후 러닝 번개/정기런 글 작성 및 참석 투표가 가능합니다.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>승인 문의: crew-admin</span>
        </div>
      </div>
    </div>
  );
}
