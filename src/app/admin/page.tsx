'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { formatDate } from '@/lib/utils';
import {
  Shield,
  ShieldCheck,
  Check,
  X,
  Users,
  Clock,
  ArrowLeft,
  Trash2,
  RefreshCw,
  Search,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // 관리자 권한 확인
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/');
      } else if (profile && profile.role !== 'admin') {
        alert('관리자 권한이 필요합니다.');
        router.push('/');
      }
    }
  }, [user, profile, authLoading, router]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers((data || []) as Profile[]);
    } catch (err: any) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchMembers();
    }
  }, [profile]);

  // 승인 상태 토글
  const handleToggleApproval = async (targetId: string, currentStatus: boolean) => {
    setUpdatingId(targetId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: !currentStatus })
        .eq('id', targetId);

      if (error) throw error;

      setMembers(prev =>
        prev.map(m => (m.id === targetId ? { ...m, is_approved: !currentStatus } : m))
      );
    } catch (err: any) {
      alert(err.message || '승인 상태 변경 실패');
    } finally {
      setUpdatingId(null);
    }
  };

  // 역할(Admin / Member) 변경 토글
  const handleToggleRole = async (targetId: string, currentRole: string) => {
    if (targetId === user?.id) {
      alert('본인의 관리자 권한은 해제할 수 없습니다.');
      return;
    }

    const nextRole = currentRole === 'admin' ? 'member' : 'admin';
    const confirmMsg =
      nextRole === 'admin'
        ? '이 회원에게 관리자(크루장) 권한을 부여하시겠습니까?'
        : '관리자 권한을 회수하시겠습니까?';

    if (!confirm(confirmMsg)) return;

    setUpdatingId(targetId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: nextRole })
        .eq('id', targetId);

      if (error) throw error;

      setMembers(prev =>
        prev.map(m => (m.id === targetId ? { ...m, role: nextRole as any } : m))
      );
    } catch (err: any) {
      alert(err.message || '역할 변경 실패');
    } finally {
      setUpdatingId(null);
    }
  };

  // 회원 삭제/강퇴
  const handleDeleteMember = async (targetId: string, email: string) => {
    if (targetId === user?.id) {
      alert('본인은 삭제할 수 없습니다.');
      return;
    }
    if (!confirm(`'${email}' 회원을 크루에서 삭제하시겠습니까?`)) return;

    setUpdatingId(targetId);
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', targetId);
      if (error) throw error;

      setMembers(prev => prev.filter(m => m.id !== targetId));
    } catch (err: any) {
      alert(err.message || '회원 삭제 실패');
    } finally {
      setUpdatingId(null);
    }
  };

  // 검색 필터
  const filteredMembers = members.filter(m => {
    const term = searchTerm.toLowerCase();
    return (
      m.email.toLowerCase().includes(term) ||
      (m.full_name && m.full_name.toLowerCase().includes(term))
    );
  });

  const totalCount = members.length;
  const approvedCount = members.filter(m => m.is_approved).length;
  const pendingCount = members.filter(m => !m.is_approved).length;

  if (authLoading || (!profile && user)) {
    return (
      <div className="flex h-screen items-center justify-center bg-crew-bg text-crew-muted font-mono text-xs">
        VERIFYING ADMIN CREDENTIALS...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crew-bg text-white pb-20">
      {/* Top Bar */}
      <header className="border-b border-crew-border bg-crew-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-crew-border bg-crew-bg px-2.5 py-1.5 text-xs text-crew-muted hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>게시판 홈</span>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-crew-volt" />
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white uppercase font-mono">
                크루원 승인 및 권한 관리 센터
              </h1>
            </div>
          </div>

          <button
            onClick={fetchMembers}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-crew-border bg-crew-card px-3 py-1.5 text-xs text-crew-text hover:border-crew-volt hover:text-crew-volt transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>새로고침</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-8">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-crew-border bg-crew-card/60 p-4">
            <div className="flex items-center justify-between text-xs text-crew-muted font-mono mb-1">
              <span>총 가입자 수</span>
              <Users className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-black text-white font-stat">{totalCount}명</div>
          </div>

          <div className="rounded-xl border border-crew-volt/30 bg-crew-card/60 p-4">
            <div className="flex items-center justify-between text-xs text-crew-muted font-mono mb-1">
              <span>승인 완료 (정식 크루원)</span>
              <ShieldCheck className="h-4 w-4 text-crew-volt" />
            </div>
            <div className="text-2xl font-black text-crew-volt font-stat">{approvedCount}명</div>
            <span className="text-[10px] text-crew-muted">글쓰기, 댓글, 참석 투표 가능</span>
          </div>

          <div className="rounded-xl border border-crew-orange/30 bg-crew-card/60 p-4">
            <div className="flex items-center justify-between text-xs text-crew-muted font-mono mb-1">
              <span>승인 대기 중</span>
              <Clock className="h-4 w-4 text-crew-orange" />
            </div>
            <div className="text-2xl font-black text-crew-orange font-stat">{pendingCount}명</div>
            <span className="text-[10px] text-crew-muted">운영진 승인 대기 게스트</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-crew-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="이름 또는 이메일 검색..."
              className="w-full rounded-xl border border-crew-border bg-crew-card pl-9 pr-4 py-2 text-xs text-white placeholder-crew-muted/60 focus:border-crew-volt focus:outline-none"
            />
          </div>
          <span className="text-xs text-crew-muted font-mono">
            {filteredMembers.length}명의 회원
          </span>
        </div>

        {/* Member Table */}
        <div className="rounded-xl border border-crew-border bg-crew-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-crew-border bg-crew-bg/60 text-crew-muted font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">회원 정보</th>
                  <th className="px-4 py-3">구글 이메일</th>
                  <th className="px-4 py-3">가입 일시</th>
                  <th className="px-4 py-3">역할</th>
                  <th className="px-4 py-3">승인 상태</th>
                  <th className="px-4 py-3 text-right">권한 관리 액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-crew-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-crew-muted font-mono">
                      가입자 명단을 불러오는 중...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-crew-muted">
                      검색 조건에 맞는 회원이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map(m => {
                    const isSelf = m.id === user?.id;
                    const isUpdating = updatingId === m.id;

                    return (
                      <tr key={m.id} className="hover:bg-crew-bg/40 transition-colors">
                        {/* Member Profile */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            {m.avatar_url ? (
                              <img
                                src={m.avatar_url}
                                alt=""
                                className="h-7 w-7 rounded-full object-cover border border-crew-border"
                              />
                            ) : (
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-crew-border font-bold font-mono text-zinc-300">
                                {m.full_name?.charAt(0) || m.email.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">
                                {m.full_name || '이름 없음'}
                              </span>
                              {isSelf && (
                                <span className="text-[10px] text-crew-volt font-mono font-bold">
                                  (본인 계정)
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3.5 font-mono text-zinc-300">
                          {m.email}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 font-mono text-crew-muted text-[11px]">
                          {formatDate(m.created_at)}
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3.5">
                          {m.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 rounded bg-crew-volt/10 border border-crew-volt/30 px-2 py-0.5 text-[10px] font-mono font-bold text-crew-volt">
                              <ShieldCheck className="h-3 w-3" /> ADMIN
                            </span>
                          ) : (
                            <span className="rounded bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                              MEMBER
                            </span>
                          )}
                        </td>

                        {/* Approval Status */}
                        <td className="px-4 py-3.5">
                          {m.is_approved ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-crew-volt font-mono">
                              <Check className="h-3.5 w-3.5 stroke-[3]" /> 승인 완료
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-crew-orange font-mono">
                              <Clock className="h-3.5 w-3.5" /> 승인 대기
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Toggle Approval Button */}
                            <button
                              onClick={() => handleToggleApproval(m.id, m.is_approved)}
                              disabled={isUpdating}
                              className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all ${
                                m.is_approved
                                  ? 'border-crew-border bg-crew-bg text-crew-muted hover:border-red-500/40 hover:text-red-400'
                                  : 'border-crew-volt bg-crew-volt text-black font-bold hover:bg-lime-400'
                              }`}
                            >
                              {m.is_approved ? '승인 취소' : '승인하기'}
                            </button>

                            {/* Toggle Admin Role Button */}
                            {!isSelf && (
                              <button
                                onClick={() => handleToggleRole(m.id, m.role)}
                                disabled={isUpdating}
                                title={m.role === 'admin' ? '일반 크루원으로 변경' : '관리자로 지정'}
                                className="rounded-lg border border-crew-border bg-crew-bg px-2.5 py-1 text-xs text-crew-muted hover:text-white hover:border-crew-borderHover transition-colors"
                              >
                                {m.role === 'admin' ? '관리자 해제' : '관리자 지정'}
                              </button>
                            )}

                            {/* Delete Member Button */}
                            {!isSelf && (
                              <button
                                onClick={() => handleDeleteMember(m.id, m.email)}
                                disabled={isUpdating}
                                title="회원 삭제"
                                className="rounded-lg p-1 text-crew-muted hover:bg-red-500/10 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
