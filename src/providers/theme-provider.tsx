'use client';

import { useEffect, type ReactNode } from 'react';
import { useExamStore } from '@/store/useExamStore';
import { getThemeTokens } from '@/lib/theme';

export function ThemeProvider({ children }: { children: ReactNode; [key: string]: unknown }) {
  const theme = useExamStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    const tokens = getThemeTokens(theme);
    const isDark = theme === 'dark';
    const isGreen = theme === 'neon';

    root.classList.toggle('dark', isDark);
    root.classList.toggle('green', isGreen);
    root.classList.toggle('light', !isDark);
    root.style.setProperty('--page-bg', tokens.pageBg);
    root.style.setProperty('--card-bg', tokens.cardBg);
    root.style.setProperty('--card-frame-color', tokens.cardBorder);
    root.style.setProperty('--border-default', tokens.cardBorder);
    root.style.setProperty('--accent', tokens.accent);
    root.style.setProperty('--accent-hover', tokens.accentHover);
    root.style.setProperty('--accent-light', tokens.accentLight);
    root.style.setProperty('--accent-foreground', tokens.fgInverse);
    root.style.setProperty('--text-primary', tokens.fg);
    root.style.setProperty('--text-secondary', tokens.fgMuted);
    root.style.setProperty('--text-muted', isDark ? '#737373' : tokens.fgMuted);
    root.style.setProperty('--surface-soft', isDark ? '#191919' : isGreen ? '#EEF5EC' : '#F7EDEF');
    root.style.setProperty('--surface-raised', isDark ? '#161616' : tokens.cardBg);
    root.style.setProperty('--card-shadow', tokens.cardShadow);
    root.style.setProperty('--focus-ring', tokens.accentRing);
    root.style.setProperty('--dot-color', isDark ? 'rgba(255,255,255,0.045)' : 'rgba(26,24,20,0.035)');
  }, [theme]);

  return children;
}
