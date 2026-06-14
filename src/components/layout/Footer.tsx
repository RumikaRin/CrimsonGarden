'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-default)] bg-[var(--card-bg)]/70 backdrop-blur-sm mt-20 mb-20 md:mb-0 md:pl-64 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[var(--text-secondary)] font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-center md:text-left">
          <span className="font-bold font-serif text-[var(--text-primary)] tracking-wide text-sm">
            CRIMSON ACADEMY
          </span>
          <span className="hidden sm:inline text-[var(--text-primary)]/20">|</span>
          <span>&copy; 2026. All Rights Reserved.</span>
        </div>
        <p className="text-center md:text-right text-[11px] leading-relaxed max-w-md">
          Nền tảng ôn luyện trắc nghiệm và từ vựng tiếng Anh tương tác.
        </p>
        <nav aria-label="Liên kết cuối trang" className="flex gap-5 font-sans font-bold uppercase tracking-wider text-[10px]">
          <Link
            href="/leaderboard"
            className={cn(
              'transition-colors cursor-pointer hover:opacity-80',
              'text-[var(--accent)]',
            )}
          >
            Bảng xếp hạng
          </Link>
          <Link
            href="/settings"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Cài đặt
          </Link>
        </nav>
      </div>
    </footer>
  );
}
