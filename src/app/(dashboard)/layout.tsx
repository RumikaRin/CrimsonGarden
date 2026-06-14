'use client';

import React, { useState, useEffect } from 'react';
import { useExamStore } from '@/store/useExamStore';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import MainLayoutWrapper from '@/components/layout/MainLayoutWrapper';
import { Home, PenLine, Gamepad2, Brain, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getThemeTokens } from '@/lib/theme';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);
  const { theme, syncOfflineData, isExamActive } = useExamStore();
  const pathname = usePathname();
  const router = useRouter();

  const isGreenTheme = theme === 'neon';
  const isDarkTheme = theme === 'dark';
  const tokens = getThemeTokens(theme);

  useEffect(() => {
    setHasMounted(true);
    syncOfflineData();

    const handleOnline = () => {
      syncOfflineData();
    };
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncOfflineData]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--scrollbar-thumb', isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : isGreenTheme ? 'rgba(34, 67, 52, 0.35)' : 'rgba(220, 20, 60, 0.35)');
    root.style.setProperty('--scrollbar-thumb-hover', isDarkTheme ? 'rgba(255, 255, 255, 0.4)' : isGreenTheme ? 'rgba(34, 67, 52, 0.55)' : 'rgba(220, 20, 60, 0.55)');
    root.style.setProperty('--page-bg', tokens.pageBg);
    root.style.setProperty('--dot-color', isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : isGreenTheme ? 'rgba(34, 67, 52, 0.035)' : 'rgba(26, 24, 20, 0.035)');
    root.style.setProperty('--card-frame-color', tokens.cardBorder);
    root.style.setProperty('--card-bg', tokens.cardBg);
    root.style.setProperty('--accent', tokens.accent);
    root.style.setProperty('--accent-hover', tokens.accentHover);
    root.style.setProperty('--accent-light', tokens.accentLight);
    root.style.setProperty('--accent-foreground', tokens.fgInverse);
    root.style.setProperty('--surface-soft', isDarkTheme ? '#191919' : isGreenTheme ? '#EEF5EC' : '#F7EDEF');
    root.style.setProperty('--surface-raised', isDarkTheme ? '#161616' : tokens.cardBg);
    root.style.setProperty('--card-shadow', tokens.cardShadow);
    root.style.setProperty('--card-shadow-hover', tokens.cardShadow);
    root.style.setProperty('--focus-ring', tokens.accentRing);
    root.style.setProperty('--text-primary', tokens.fg);
    root.style.setProperty('--text-secondary', tokens.fgMuted);
    root.style.setProperty('--text-muted', isDarkTheme ? '#737373' : tokens.fgMuted);
    root.style.setProperty('--border-default', tokens.cardBorder);

    root.classList.toggle('green', isGreenTheme);
    root.classList.toggle('dark', isDarkTheme);
  }, [theme, isGreenTheme, isDarkTheme, tokens]);

  if (!hasMounted) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#F2EFE7]">
        <p className="font-serif text-[var(--text-primary)]/60 text-sm tracking-widest uppercase animate-pulse">Đang tải Crimson Garden...</p>
      </div>
    );
  }

  const bgClass = isDarkTheme
    ? 'bg-[#080808] text-[#F5F5F5]'
    : isGreenTheme
      ? 'bg-[#f4faf0] text-[#224334]'
      : 'bg-[#F2EFE7] text-[var(--text-primary)]';
  const selectionClass = isDarkTheme
    ? 'selection:bg-white/20 selection:text-white'
    : isGreenTheme
      ? 'selection:bg-[#9ce5c1]/50 selection:text-[#224334]'
      : 'selection:bg-[#DC143C]/20 selection:text-[#DC143C]';

  const isAdminPage = pathname === '/admin';
  const isFullWidthExam = isExamActive && pathname === '/quiz';

  const mobileTabs = [
    { path: '/', label: 'Trang Chủ', icon: Home },
    { path: '/quiz', label: 'Luyện Đề', icon: PenLine },
    { path: '/quick-quiz', label: 'Quiz', icon: Brain },
    { path: '/snake', label: 'Snake', icon: Gamepad2 },
    { path: '/leaderboard', label: 'Thi Đua', icon: Trophy },
  ] as const;

  return (
    <>
      <div className={`min-h-[100dvh] ${bgClass} font-sans relative flex flex-col justify-between ${selectionClass} transition-colors duration-300`}>
        {!isFullWidthExam && <Sidebar />}
        {!isFullWidthExam && !isDarkTheme && <div className="fixed inset-0 pointer-events-none opacity-[0.015] bg-[radial-gradient(#1A1814_1px,transparent_1px)] [background-size:16px_16px] z-0" />}
        {!isFullWidthExam && isDarkTheme && <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:16px_16px] z-0" />}

        <div className={cn("relative z-10", !isFullWidthExam ? "md:pl-64 pb-20 md:pb-0" : "w-full h-[100dvh] overflow-hidden flex flex-col")}>

          {!isFullWidthExam && (
            <nav aria-label="Điều hướng chính trên di động" className="md:hidden fixed bottom-2 left-2 right-2 z-50">
              <div className="bg-[var(--card-bg)]/95 backdrop-blur-xl border border-[var(--border-default)] rounded-2xl p-1.5 flex gap-1 shadow-[var(--card-shadow)]">
                {mobileTabs.map((t) => (
                  <button
                    key={t.path}
                    onClick={() => router.push(t.path)}
                    aria-current={pathname === t.path && !isAdminPage ? 'page' : undefined}
                    className={cn(
                      'flex-1 min-h-12 px-1 py-2 rounded-xl text-[11px] font-sans font-semibold transition-all text-center',
                      pathname === t.path && !isAdminPage
                        ? 'bg-[var(--accent)] text-[var(--card-bg)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    <t.icon className="w-4 h-4 mx-auto" />
                    <span className="block text-[9px] mt-1 font-sans leading-none">{t.label}</span>
                  </button>
                ))}
              </div>
            </nav>
          )}

          {!isFullWidthExam ? (
            <MainLayoutWrapper>
              <div className="w-full max-w-[1440px] mx-auto px-3 pt-20 pb-6 sm:px-6 sm:pt-24 sm:pb-8 md:py-10">
                {children}
              </div>
            </MainLayoutWrapper>
          ) : (
            <div className="w-full h-full flex-1 relative bg-[var(--page-bg)]">
              {children}
            </div>
          )}
        </div>

        {!isFullWidthExam && <Footer />}
      </div>
    </>
  );
}
