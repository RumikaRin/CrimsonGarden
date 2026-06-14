'use client';

import React, { useState, useEffect } from 'react';
import { useExamStore, computeStreak } from '@/store/useExamStore';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useIsGreen } from '@/lib/useThemeTokens';
import { motion } from 'motion/react';
import {
  Home, PenLine, Gamepad2, Trophy, Upload, BookOpenCheck, Brain,
  ShieldCheck, LogOut, ChevronRight
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

export function Sidebar() {
  const { setTheme, currentUser, activityDates, logout, isExamActive, attempts, gameScores } = useExamStore();
  const pathname = usePathname();
  const router = useRouter();
  const isGreenTheme = useIsGreen();
  const streak = computeStreak(activityDates);

  const hasUnsyncedData = attempts.some((a) => !a.synced) || gameScores.some((g) => !g.synced);
  const [isOnline, setIsOnline] = useState(true);

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
          <div className={cn('rounded-2xl px-4 h-14 flex items-center justify-between border',
            isGreenTheme ? 'card-layered' : 'bg-[#FFF5F7] border-[var(--accent)]'
          )}>
            <span className="font-serif text-lg font-bold">
              <span className="text-[var(--accent)]">Crimson</span>{' '}
              <span className="italic font-normal text-[var(--accent)]">Garden</span>
            </span>
            <button
              onClick={() => router.push('/login')}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-[var(--accent)] text-white"
            >
              Đăng nhập
            </button>
          </div>
        </div>

        {/* Desktop sidebar */}
        <aside className={cn(
          'hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 z-40 border-r transition-colors duration-300',
          isGreenTheme ? 'bg-white border-[var(--border-default)]' : 'bg-[#FAF9F6] border-[var(--border-default)]'
        )}>
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
                      ? 'bg-[var(--accent)] text-white font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-light)]/30'
                  )}
                >
                  <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : '')} />
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
                  'flex-1 px-3 py-1.5 rounded-md text-[10px] font-sans font-bold uppercase tracking-wider transition-all',
                  !isGreenTheme
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] opacity-60 hover:opacity-100'
                )}
              >Crimson</button>
              <button
                onClick={() => setTheme('neon')}
                className={cn(
                  'flex-1 px-3 py-1.5 rounded-md text-[10px] font-sans font-bold uppercase tracking-wider transition-all',
                  isGreenTheme
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] opacity-60 hover:opacity-100'
                )}
              >Garden</button>
            </div>

            <button
              onClick={() => router.push('/login')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[11px] font-sans font-bold uppercase tracking-wider bg-[var(--accent)] text-white shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
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
        <div className={cn('rounded-2xl px-4 h-14 flex items-center justify-between border',
          isGreenTheme ? 'card-layered' : 'bg-[#FFF5F7] border-[var(--accent)]'
        )}>
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
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 z-40 border-r transition-colors duration-300',
        isGreenTheme
          ? 'bg-white border-[var(--border-default)]'
          : 'bg-[#FAF9F6] border-[var(--border-default)]'
      )}>
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
                    ? 'bg-[var(--accent)] text-white font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-light)]/30'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : '')} />
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
                'flex-1 px-3 py-1.5 rounded-md text-[10px] font-sans font-bold uppercase tracking-wider transition-all',
                !isGreenTheme
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] opacity-60 hover:opacity-100'
              )}
            >Crimson</button>
            <button
              onClick={() => setTheme('neon')}
              className={cn(
                'flex-1 px-3 py-1.5 rounded-md text-[10px] font-sans font-bold uppercase tracking-wider transition-all',
                isGreenTheme
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] opacity-60 hover:opacity-100'
              )}
            >Garden</button>
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
