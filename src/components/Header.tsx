'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Shield, Plus, LogOut, Flame } from 'lucide-react';

interface HeaderProps {
  onOpenCreateModal?: () => void;
}

export function Header({ onOpenCreateModal }: HeaderProps) {
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-crew-border bg-crew-bg/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-crew-volt text-black font-black tracking-tighter">
            <Flame className="h-5 w-5 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black uppercase tracking-wider text-white group-hover:text-crew-volt transition-colors">
              PaceMaker <span className="text-xs text-crew-volt font-mono font-normal">RC</span>
            </span>
            <span className="text-[10px] tracking-widest uppercase text-crew-muted font-mono">
              Running Crew
            </span>
          </div>
        </Link>

        {/* Right Navigation */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-24 rounded bg-crew-card animate-pulse" />
          ) : user && profile ? (
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Write Post Button (Approved members or Admin only) */}
              {profile.is_approved && onOpenCreateModal && (
                <button
                  onClick={onOpenCreateModal}
                  className="flex items-center gap-1.5 rounded-lg bg-crew-volt px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-black hover:bg-lime-400 transition-colors"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span className="hidden sm:inline">새 런 등록</span>
                </button>
              )}

              {/* Admin Link (Only for admins) */}
              {profile.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-lg border border-crew-border bg-crew-card px-3 py-1.5 text-xs font-medium text-crew-text hover:border-crew-volt hover:text-crew-volt transition-colors"
                >
                  <Shield className="h-3.5 w-3.5 text-crew-volt" />
                  <span className="hidden sm:inline">크루원 승인 관리</span>
                  <span className="sm:hidden">관리</span>
                </Link>
              )}

              {/* User Profile Badge */}
              <div className="flex items-center gap-2.5 rounded-lg border border-crew-border bg-crew-card/60 px-2.5 py-1">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Profile'}
                    className="h-6 w-6 rounded-full object-cover border border-crew-border"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-crew-border text-[11px] font-bold text-crew-muted font-mono">
                    {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white max-w-[90px] sm:max-w-[120px] truncate">
                    {profile.full_name || profile.email.split('@')[0]}
                  </span>
                  <div className="flex items-center gap-1">
                    {profile.role === 'admin' ? (
                      <span className="text-[9px] font-mono font-bold uppercase text-crew-volt">
                        CREW ADMIN
                      </span>
                    ) : profile.is_approved ? (
                      <span className="text-[9px] font-mono uppercase text-zinc-400">
                        CREW MEMBER
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono uppercase text-crew-orange font-bold">
                        승인 대기
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={signOut}
                  title="로그아웃"
                  className="ml-1 p-1 text-crew-muted hover:text-white transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Google Sign In Button */
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 rounded-lg border border-crew-border bg-crew-card px-3.5 py-1.5 text-xs font-semibold text-white hover:border-crew-volt hover:text-crew-volt transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.3c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.3C3.7 20 7.5 23.3 12 23.3z"
                />
              </svg>
              <span>구글로 로그인</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
