'use client';

import React from 'react';
import { PostCategory } from '@/types/database';

interface PostFilterProps {
  currentCategory: string;
  onSelectCategory: (cat: string) => void;
  counts: Record<string, number>;
}

export function PostFilter({ currentCategory, onSelectCategory, counts }: PostFilterProps) {
  const tabs = [
    { id: 'all', label: '전체 피드' },
    { id: 'regular', label: '정기런' },
    { id: 'flash', label: '번개런' },
    { id: 'log', label: '러닝 후기' },
    { id: 'notice', label: '공지사항' },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {tabs.map(tab => {
        const isActive = currentCategory === tab.id;
        const count = counts[tab.id] ?? 0;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectCategory(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-crew-volt text-black font-bold shadow-sm'
                : 'bg-crew-card/80 text-crew-muted hover:text-white hover:bg-crew-card border border-crew-border'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded px-1.5 py-0.2 text-[10px] font-mono ${
                isActive ? 'bg-black/20 text-black' : 'bg-crew-bg text-crew-muted'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
