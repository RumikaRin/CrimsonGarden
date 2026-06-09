'use client';

import { useExamStore } from '@/store/useExamStore';
import { getThemeTokens, type ThemeTokens, type AppTheme } from '@/lib/theme';
import { useMemo } from 'react';

export function useThemeTokens(): ThemeTokens {
  const { theme } = useExamStore();
  return useMemo(() => getThemeTokens(theme), [theme]);
}

export function useIsGreen(): boolean {
  const { theme } = useExamStore();
  return theme === 'neon';
}

// Legacy helper — returns accent class pairs from theme
export function useAccentClasses() {
  const isGreen = useIsGreen();
  return useMemo(() => ({
    accentBg: isGreen ? 'bg-[#224334]' : 'bg-[#DC143C]',
    accentText: isGreen ? 'text-[#224334]' : 'text-[#DC143C]',
    accentBorder: isGreen ? 'border-[#224334]' : 'border-[#DC143C]',
    accentLight: isGreen ? 'bg-[#9ce5c1]/15' : 'bg-[#DC143C]/8',
    hoverBg: isGreen ? 'hover:bg-[#1A3327]' : 'hover:bg-[#c91236]',
    accent: isGreen ? '#224334' : '#DC143C',
    pageBg: isGreen ? '#f4faf0' : '#F2EFE7',
    cardBg: isGreen ? 'bg-white' : 'bg-[#FFF5F7]',
  }), [isGreen]);
}
