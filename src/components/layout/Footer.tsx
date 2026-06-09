'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useIsGreen } from '@/lib/useThemeTokens';

export function Footer() {
  const isGreenTheme = useIsGreen();

  return (
    <footer className="border-t border-[#1A1814]/10 bg-white/40 backdrop-blur-sm mt-20 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#78716C] font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-center md:text-left">
          <span className="font-bold font-serif text-[#1A1814] tracking-wide text-sm">
            CRIMSON ACADEMY
          </span>
          <span className="hidden sm:inline text-[#1A1814]/20">|</span>
          <span>&copy; 2026. All Rights Reserved.</span>
        </div>
        <p className="text-center md:text-right text-[11px] leading-relaxed max-w-md">
          Nền tảng ôn luyện trắc nghiệm và từ vựng tiếng Anh tương tác.
        </p>
        <div className="flex gap-5 font-sans font-bold uppercase tracking-wider text-[10px]">
          <Link
            href="/leaderboard"
            className={cn(
              'transition-colors cursor-pointer hover:opacity-80',
              isGreenTheme ? 'text-[#224334]' : 'text-[#DC143C]',
            )}
          >
            Bảng xếp hạng
          </Link>
          <Link
            href="/settings"
            className="text-[#78716C] hover:text-[#1A1814] transition-colors cursor-pointer"
          >
            Cài đặt
          </Link>
        </div>
      </div>
    </footer>
  );
}
