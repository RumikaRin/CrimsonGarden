'use client';

import React, { useState, useEffect } from 'react';
import { useExamStore } from '@/store/useExamStore';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import MainLayoutWrapper from '@/components/layout/MainLayoutWrapper';
import { AnimatePresence, motion } from 'motion/react';
import { Home, PenLine, Gamepad2, Brain, Trophy, UserRound, Settings, LogOut, X, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getThemeTokens } from '@/lib/theme';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const { theme, setTheme, currentUser, logout, syncOfflineData, isExamActive } = useExamStore();
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
  ] as const;

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((word) => word[0]).slice(-2).join('').toUpperCase()
    : '??';

  const navigateFromAccount = (path: string) => {
    setIsAccountOpen(false);
    router.push(path);
  };

  return (
    <>
      <div className={`min-h-[100dvh] ${bgClass} font-sans relative flex flex-col justify-between ${selectionClass} transition-colors duration-300`}>
        {!isFullWidthExam && <div className="hidden md:block"><Sidebar /></div>}
        {!isFullWidthExam && !isDarkTheme && <div className="fixed inset-0 pointer-events-none opacity-[0.015] bg-[radial-gradient(#1A1814_1px,transparent_1px)] [background-size:16px_16px] z-0" />}
        {!isFullWidthExam && isDarkTheme && <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:16px_16px] z-0" />}

        <div className={cn("relative z-10", !isFullWidthExam ? "md:pl-64 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0" : "w-full h-[100dvh] overflow-hidden flex flex-col")}>

          {!isFullWidthExam && (
            <nav aria-label="Điều hướng chính trên di động" className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              <div className="bg-[var(--card-bg)] border border-[var(--border-default)] rounded-2xl p-1 flex gap-0.5 shadow-[var(--card-shadow)]">
                {mobileTabs.map((t) => (
                  <button
                    key={t.path}
                    onClick={() => {
                      setIsAccountOpen(false);
                      router.push(t.path);
                    }}
                    aria-current={pathname === t.path && !isAdminPage ? 'page' : undefined}
                    className={cn(
                      'flex-1 min-h-12 px-0.5 py-1.5 rounded-xl font-sans font-semibold transition-all text-center',
                      pathname === t.path && !isAdminPage
                        ? 'bg-[var(--accent)] text-[var(--card-bg)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    <t.icon className="w-[18px] h-[18px] mx-auto" />
                    <span className="block text-[9px] mt-1 font-sans leading-none whitespace-nowrap">{t.label}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsAccountOpen(true)}
                  aria-expanded={isAccountOpen}
                  className={cn(
                    'flex-1 min-h-12 px-0.5 py-1.5 rounded-xl font-sans font-semibold transition-all text-center',
                    isAccountOpen || pathname === '/settings' || pathname === '/login'
                      ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  )}
                >
                  <UserRound className="w-[18px] h-[18px] mx-auto" />
                  <span className="block text-[9px] mt-1 font-sans leading-none whitespace-nowrap">Tài khoản</span>
                </button>
              </div>
            </nav>
          )}

          <AnimatePresence>
            {!isFullWidthExam && isAccountOpen && (
              <>
                <motion.button
                  type="button"
                  aria-label="Đóng tài khoản"
                  onClick={() => setIsAccountOpen(false)}
                  className="md:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <motion.section
                  aria-label="Tài khoản và giao diện"
                  className="md:hidden fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-2 right-2 z-[70] overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--card-bg)] shadow-2xl"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 24 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                >
                  <div className="flex items-center justify-between border-b border-[var(--border-default)] p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-light)] font-serif text-sm font-bold text-[var(--accent)]">
                        {initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-serif text-base font-bold text-[var(--text-primary)]">
                          {currentUser?.name || 'Khách học tập'}
                        </p>
                        <p className="truncate text-[10px] text-[var(--text-secondary)]">
                          {currentUser?.email || 'Đăng nhập để lưu tiến trình'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAccountOpen(false)}
                      aria-label="Đóng"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-default)] text-[var(--text-secondary)]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-4 p-4">
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Giao diện</p>
                      <div className="grid grid-cols-3 gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--page-bg)] p-1">
                        {(['cozy', 'neon', 'dark'] as const).map((themeOption) => (
                          <button
                            type="button"
                            key={themeOption}
                            onClick={() => setTheme(themeOption)}
                            className={cn(
                              'min-h-11 rounded-lg px-2 text-[10px] font-bold uppercase tracking-wider',
                              theme === themeOption
                                ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                                : 'text-[var(--text-secondary)]'
                            )}
                          >
                            {themeOption === 'cozy' ? 'Crimson' : themeOption === 'neon' ? 'Garden' : 'Night'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => navigateFromAccount('/leaderboard')} className="flex min-h-12 items-center gap-2 rounded-xl border border-[var(--border-default)] px-3 text-left text-xs font-semibold text-[var(--text-primary)]">
                        <Trophy className="h-4 w-4 text-[var(--accent)]" /> Bảng xếp hạng
                      </button>
                      {currentUser ? (
                        <button type="button" onClick={() => navigateFromAccount('/settings')} className="flex min-h-12 items-center gap-2 rounded-xl border border-[var(--border-default)] px-3 text-left text-xs font-semibold text-[var(--text-primary)]">
                          <Settings className="h-4 w-4 text-[var(--accent)]" /> Cài đặt
                        </button>
                      ) : (
                        <button type="button" onClick={() => navigateFromAccount('/login')} className="flex min-h-12 items-center justify-center rounded-xl bg-[var(--accent)] px-3 text-xs font-bold uppercase tracking-wider text-[var(--accent-foreground)]">
                          Đăng nhập
                        </button>
                      )}
                      {currentUser?.role === 'ADMIN' && (
                        <button type="button" onClick={() => navigateFromAccount('/admin')} className="col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--border-default)] px-3 text-xs font-semibold text-[var(--text-primary)]">
                          <ShieldCheck className="h-4 w-4 text-[var(--accent)]" /> Quản trị
                        </button>
                      )}
                    </div>

                    {currentUser && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountOpen(false);
                          logout();
                        }}
                        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 text-xs font-semibold text-red-500"
                      >
                        <LogOut className="h-4 w-4" /> Đăng xuất
                      </button>
                    )}
                  </div>
                </motion.section>
              </>
            )}
          </AnimatePresence>

          {!isFullWidthExam ? (
            <MainLayoutWrapper>
              <div className="w-full max-w-[1440px] mx-auto px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-5 sm:px-6 sm:pt-8 sm:pb-8 md:py-10">
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
