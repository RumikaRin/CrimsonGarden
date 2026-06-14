'use client';

import React, { useState, useEffect } from 'react';
import { useExamStore, computeStreak } from '@/store/useExamStore';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useIsGreen } from '@/lib/useThemeTokens';
import { AnimatePresence, motion } from 'motion/react';
import {
  Home, PenLine, Gamepad2, Trophy, Upload, BookOpenCheck, Brain,
  ShieldCheck, LogOut, ChevronRight, Menu, X, Settings
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Trang Chủ', icon: Home },
  { path: '/quiz', label: 'Luyện Đề', icon: PenLine },
  { path: '/quick-quiz', label: 'Quiz Nhanh', icon: Brain },
  { path: '/review', label: 'Sổ Câu Sai', icon: BookOpenCheck },
  { path: '/snake', label: 'Săn Từ Vựng', icon: Gamepad2 },
  { path: '/leaderboard', label: 'Bảng Xếp Hạng', icon: Trophy },
  { path: '/generate', label: 'Bóc Tách Đề', icon: Upload },
];

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  hasUnsyncedData: boolean;
}

function MobileSidebarDrawer({ isOpen, onClose, isOnline, hasUnsyncedData }: MobileSidebarDrawerProps) {
  const { theme, setTheme, currentUser, activityDates, logout, isExamActive } = useExamStore();
  const pathname = usePathname();
  const router = useRouter();
  const streak = computeStreak(activityDates);
  const isAdminMode = currentUser?.role === 'ADMIN';

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((word) => word[0]).slice(-2).join('').toUpperCase()
    : '??';

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen, onClose]);

  const navigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Đóng menu"
            className="md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            aria-label="Menu điều hướng trên di động"
            className="md:hidden fixed left-2 top-2 bottom-2 z-[70] flex w-[calc(100%-1rem)] max-w-[320px] flex-col overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--card-bg)] shadow-2xl"
            initial={{ x: '-105%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-105%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 34 }}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-default)] px-4">
              <button type="button" onClick={() => navigate('/')} className="text-left">
                <span className="block font-serif text-xl font-bold tracking-tight text-[var(--accent)]">
                  Crimson <span className="font-normal italic">Garden</span>
                </span>
                <span className="block text-[8px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  Học viện thư thái
                </span>
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng menu"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-default)] text-[var(--text-primary)] transition-colors hover:bg-[var(--accent-light)]/30 active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive = pathname === path && !isAdminMode;
                return (
                  <button
                    type="button"
                    key={path}
                    onClick={() => navigate(path)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex min-h-12 w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all active:scale-[0.98]',
                      isActive
                        ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--accent-light)]/30 hover:text-[var(--text-primary)]'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                    {path === '/quiz' && isExamActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-current animate-ping" />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="shrink-0 space-y-3 border-t border-[var(--border-default)] p-3">
              <div className="flex items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--accent-light)]/10 px-3 py-2.5">
                <span className={cn(
                  'h-2 w-2 shrink-0 rounded-full',
                  !isOnline ? 'bg-orange-500' : hasUnsyncedData ? 'bg-amber-500' : 'bg-green-500'
                )} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  {!isOnline ? 'Chế độ ngoại tuyến' : hasUnsyncedData ? 'Đang đồng bộ...' : 'Đồng bộ đám mây'}
                </span>
                {currentUser && (
                  <span className="ml-auto text-[10px] font-bold uppercase text-[var(--accent)]">
                    {streak} ngày
                  </span>
                )}
              </div>

              <div className="flex items-center rounded-xl border border-[var(--border-default)] bg-[var(--page-bg)] p-1">
                {(['cozy', 'neon', 'dark'] as const).map((themeOption) => (
                  <button
                    type="button"
                    key={themeOption}
                    onClick={() => setTheme(themeOption)}
                    className={cn(
                      'flex-1 rounded-lg px-2 py-2 text-[9px] font-bold uppercase tracking-wider transition-all',
                      theme === themeOption
                        ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                        : 'text-[var(--text-secondary)]'
                    )}
                  >
                    {themeOption === 'cozy' ? 'Crimson' : themeOption === 'neon' ? 'Garden' : 'Night'}
                  </button>
                ))}
              </div>

              {currentUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/settings')}
                    className="flex w-full items-center gap-3 rounded-xl border border-[var(--border-default)] px-3 py-2.5 text-left transition-colors hover:bg-[var(--accent-light)]/30"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-light)] text-[10px] font-bold text-[var(--accent)]">
                      {initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-serif text-sm font-bold text-[var(--text-primary)]">{currentUser.name}</span>
                      <span className="block truncate text-[10px] text-[var(--text-muted)]">{currentUser.email}</span>
                    </span>
                    <Settings className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                  </button>
                  {isAdminMode && (
                    <button
                      type="button"
                      onClick={() => navigate('/admin')}
                      className="flex w-full items-center gap-2.5 rounded-xl bg-[var(--text-primary)] px-4 py-2.5 text-[11px] font-bold text-[var(--card-bg)]"
                    >
                      <ShieldCheck className="h-4 w-4" /> Mở quản trị giáo viên
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      logout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2 text-[11px] text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" /> Đăng xuất
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--accent-foreground)] active:scale-[0.98]"
                >
                  Đăng nhập / Đăng ký
                </button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function Sidebar() {
  const { theme, setTheme, currentUser, activityDates, logout, isExamActive, attempts, gameScores } = useExamStore();
  const pathname = usePathname();
  const router = useRouter();
  const isGreenTheme = useIsGreen();
  const streak = computeStreak(activityDates);

  const hasUnsyncedData = attempts.some((a) => !a.synced) || gameScores.some((g) => !g.synced);
  const [isOnline, setIsOnline] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOnline(window.navigator.onLine);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);
  const isAdminMode = currentUser?.role === 'ADMIN';

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase()
    : '??';

  if (!currentUser) {
    return (
      <>
        {/* Mobile header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 px-2 pt-2">
          <div className="rounded-2xl px-4 h-14 flex items-center justify-between border border-[var(--border-default)] bg-[var(--card-bg)] shadow-sm">
            <span className="font-serif text-lg font-bold">
              <span className="text-[var(--accent)]">Crimson</span>{' '}
              <span className="italic font-normal text-[var(--accent)]">Garden</span>
            </span>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Mở menu"
              aria-expanded={isMobileMenuOpen}
              className="flex h-10 items-center gap-2 rounded-xl border border-[var(--border-default)] px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-primary)] transition-colors hover:bg-[var(--accent-light)]/30 active:scale-95"
            >
              <Menu className="h-4 w-4" /> Menu
            </button>
          </div>
        </div>

        <MobileSidebarDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          isOnline={isOnline}
          hasUnsyncedData={hasUnsyncedData}
        />

        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 z-40 border-r transition-colors duration-300 bg-[var(--card-bg)] border-[var(--border-default)]">
          <div className="px-6 pt-8 pb-6 border-b border-[var(--border-default)]">
            <button onClick={() => router.push('/')} className="text-left cursor-pointer">
              <span className="font-serif text-2xl tracking-tight font-bold block">
                <span className="text-[var(--accent)]">Crimson</span>{' '}
                <span className="italic font-normal text-[var(--accent)]">Garden</span>
              </span>
              <p className="text-[9px] font-sans font-bold tracking-[0.25em] uppercase mt-1 text-[var(--text-muted)]">
                HỌ VIỆN THƯ THÁI
              </p>
            </button>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = pathname === path && !isAdminMode;
              return (
                <motion.button
                  key={path}
                  onClick={() => router.push(path)}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-sans font-medium transition-all text-left',
                    isActive
                      ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-light)]/30'
                  )}
                >
                  <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-[var(--accent-foreground)]' : '')} />
                  <span>{label}</span>
                </motion.button>
              );
            })}
          </nav>

          <div className="px-3 py-4 border-t border-[var(--border-default)]">
            <div className="flex items-center bg-[var(--page-bg)] p-0.5 rounded-lg border border-[var(--border-default)] mb-3">
              <button
                onClick={() => setTheme('cozy')}
                className={cn(
                  'flex-1 px-2 py-1.5 rounded-md text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider transition-all',
                  theme === 'cozy'
                    ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm'
                    : 'text-[var(--text-secondary)] opacity-60 hover:opacity-100'
                )}
              >Crimson</button>
              <button
                onClick={() => setTheme('neon')}
                className={cn(
                  'flex-1 px-2 py-1.5 rounded-md text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider transition-all',
                  theme === 'neon'
                    ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm'
                    : 'text-[var(--text-secondary)] opacity-60 hover:opacity-100'
                )}
              >Garden</button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  'flex-1 px-2 py-1.5 rounded-md text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider transition-all',
                  theme === 'dark'
                    ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm'
                    : 'text-[var(--text-secondary)] opacity-60 hover:opacity-100'
                )}
              >Night</button>
            </div>

            <button
              onClick={() => router.push('/login')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[11px] font-sans font-bold uppercase tracking-wider bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              Đăng nhập / Đăng ký
            </button>
          </div>
        </aside>
      </>
    );
  }

  return (
    <>
      {/* Mobile header (collapsed sidebar trigger) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 px-2 pt-2">
        <div className="rounded-2xl px-4 h-14 flex items-center justify-between border border-[var(--border-default)] bg-[var(--card-bg)] shadow-sm">
          <span className="font-serif text-lg font-bold">
            <span className="text-[var(--accent)]">Crimson</span>{' '}
            <span className="italic font-normal text-[var(--accent)]">Garden</span>
          </span>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2" title={!isOnline ? "Hoạt động ngoại tuyến" : hasUnsyncedData ? "Đang đồng bộ..." : "Đã đồng bộ đám mây"}>
              {!isOnline ? (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              ) : hasUnsyncedData ? (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              ) : null}
              <span className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                !isOnline ? "bg-orange-500" : hasUnsyncedData ? "bg-amber-500" : "bg-green-500"
              )} />
            </span>
            <div className={cn('px-2 py-1 rounded-lg text-[9px] font-bold uppercase', 'bg-[var(--accent-light)]/20 text-[var(--accent)]')}>
              {streak > 0 ? streak + ' ngày' : '0 ngày'}
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Mở menu"
              aria-expanded={isMobileMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-default)] text-[var(--text-primary)] transition-colors hover:bg-[var(--accent-light)]/30 active:scale-95"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <MobileSidebarDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isOnline={isOnline}
        hasUnsyncedData={hasUnsyncedData}
      />

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 z-40 border-r transition-colors duration-300 bg-[var(--card-bg)] border-[var(--border-default)]">
        {/* Logo */}
        <div className="px-6 pt-8 pb-6 border-b border-[var(--border-default)]">
          <button onClick={() => router.push('/')} className="text-left cursor-pointer">
            <span className="font-serif text-2xl tracking-tight font-bold block">
              <span className="text-[var(--accent)]">Crimson</span>{' '}
              <span className="italic font-normal text-[var(--accent)]">Garden</span>
            </span>
            <p className="text-[9px] font-sans font-bold tracking-[0.25em] uppercase mt-1 text-[var(--text-muted)]">
              HỌ VIỆN THƯ THÁI
            </p>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = pathname === path && !isAdminMode;
            return (
              <motion.button
                key={path}
                onClick={() => router.push(path)}
                aria-current={isActive ? 'page' : undefined}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-sans font-medium transition-all text-left',
                  isActive
                    ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-light)]/30'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-[var(--accent-foreground)]' : '')} />
                <span>{label}</span>
                {path === '/quiz' && isExamActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping ml-auto" />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Connection & Sync Status Indicator */}
        <div className="px-4 py-2 mx-3 mb-2 rounded-xl bg-[var(--accent-light)]/10 border border-[var(--border-default)] flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {!isOnline ? (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            ) : hasUnsyncedData ? (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            ) : null}
            <span className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              !isOnline
                ? "bg-orange-500"
                : hasUnsyncedData
                  ? "bg-amber-500"
                  : "bg-green-500"
            )} />
          </span>
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {!isOnline
              ? "Chế độ ngoại tuyến"
              : hasUnsyncedData
                ? "Đang đồng bộ..."
                : "Đồng bộ đám mây"}
          </span>
        </div>

        {/* Bottom: Theme + Profile */}
        <div className="px-3 py-4 border-t border-[var(--border-default)] space-y-3">
          {/* Theme toggle */}
          <div className="flex items-center bg-[var(--page-bg)] p-0.5 rounded-lg border border-[var(--border-default)]">
            <button
              onClick={() => setTheme('cozy')}
              className={cn(
                'flex-1 px-2 py-1.5 rounded-md text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider transition-all',
                theme === 'cozy'
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm'
                  : 'text-[var(--text-secondary)] opacity-60 hover:opacity-100'
              )}
            >Crimson</button>
            <button
              onClick={() => setTheme('neon')}
              className={cn(
                'flex-1 px-2 py-1.5 rounded-md text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider transition-all',
                theme === 'neon'
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm'
                  : 'text-[var(--text-secondary)] opacity-60 hover:opacity-100'
              )}
            >Garden</button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'flex-1 px-2 py-1.5 rounded-md text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider transition-all',
                theme === 'dark'
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm'
                  : 'text-[var(--text-secondary)] opacity-60 hover:opacity-100'
              )}
            >Night</button>
          </div>

          {/* Profile */}
          <button
            onClick={() => router.push('/settings')}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-sans font-medium transition-all',
              'text-[var(--text-primary)] hover:bg-[var(--accent-light)]/30'
            )}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
              style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
            >
              {initials}
            </div>
            <div className="text-left min-w-0 flex-1">
              <p className="font-serif font-bold text-sm truncate">{currentUser.name}</p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">{currentUser.email}</p>
            </div>
            <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
          </button>

          {/* Role destination */}
          <button
            onClick={() => router.push(isAdminMode ? '/admin' : '/')}
            className={cn(
              'w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[11px] font-sans font-bold transition-all',
              isAdminMode
                ? 'bg-[#1A1814] text-white'
                : 'bg-[var(--accent-light)]/30 text-[var(--accent)]'
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {isAdminMode ? 'Mở quản trị giáo viên' : 'Tài khoản học sinh'}
          </button>

          {/* Logout */}
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2.5 px-4 py-2 rounded-xl text-[11px] font-sans text-red-500 hover:bg-red-50 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
}
