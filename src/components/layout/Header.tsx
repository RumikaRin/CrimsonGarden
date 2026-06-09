'use client';

import React, { useState, useRef } from 'react';
import { useExamStore, computeStreak } from '@/store/useExamStore';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useIsGreen } from '@/lib/useThemeTokens';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, ShieldCheck, Flame, LogOut, ChevronDown, Settings
} from 'lucide-react';

interface HeaderProps {
}

export function Header({}: HeaderProps) {
  const { isExamActive, theme, setTheme, currentUser, activityDates, logout, switchRole } = useExamStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const isGreenTheme = useIsGreen();
  const isAdminMode = currentUser?.role === 'ADMIN';
  const streak = computeStreak(activityDates);

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase()
    : '??';

  const logoColorClass = 'text-[var(--accent)]';
  const containerBorderClass = 'bg-white border border-[var(--accent)] card-frame';

  const navTabClass = (tabPath: string) =>
    `px-4 py-2 rounded-lg text-[10px] font-sans font-bold uppercase tracking-widest transition-all cursor-pointer ${
      pathname === tabPath && !isAdminMode
        ? 'bg-[var(--accent-light)] text-[var(--accent)] shadow-sm'
        : 'text-inherit opacity-70 hover:opacity-100'
    }`;

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-50 mx-auto w-full px-2 sm:px-4 pt-4">
      <div style={{ borderWidth: 3 }} className={`${containerBorderClass} rounded-2xl sm:rounded-3xl px-3 sm:px-6 lg:px-10 h-20 flex items-center justify-between transition-all duration-300 max-w-[100rem] mx-auto`}>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="font-serif text-2xl tracking-tight font-bold">
            <span className={logoColorClass}>Crimson</span>{' '}
            <span className={cn('italic font-normal font-serif', 'text-[var(--accent)]')}>Garden</span>
          </span>
           <div className="h-5 w-[1px] bg-[#1A1814]/20 hidden sm:block" />
           <p className={`text-[9px] font-sans font-bold tracking-[0.25em] uppercase hidden sm:block mt-1 ${'text-[var(--text-secondary)]'}`}>
             {typeof window !== 'undefined' && localStorage.getItem('theme') === 'neon' ? 'CRIMSON GARDEN' : 'HỌC VIỆN THƯ THÁI'}
           </p>
        </div>

        {/* Middle Nav Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#1A1814]/5 p-1 rounded-xl border border-[#1A1814]/5">
          <motion.button onClick={() => router.push('/')} className={navTabClass('/')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>Trang Chủ</motion.button>
          <motion.button onClick={() => router.push('/quiz')} className={navTabClass('/quiz')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
            Ôn Thi Trắc Nghiệm {isExamActive && <span className={cn('w-1.5 h-1.5 inline-block rounded-full ml-1 animate-ping', 'bg-[var(--accent)]')} />}
          </motion.button>
          <motion.button onClick={() => router.push('/snake')} className={navTabClass('/snake')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>Săn Từ Vựng</motion.button>
          <motion.button onClick={() => router.push('/leaderboard')} className={navTabClass('/leaderboard')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>Bảng Xếp Hạng</motion.button>
          <motion.button onClick={() => router.push('/generate')} className={navTabClass('/generate')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>Bóc Tách Đề</motion.button>
        </nav>

        {/* Right: Theme + Streak + Profile */}
        <div className="flex items-center gap-3">
          {/* Theme selector */}
          <div className="flex items-center bg-[#1A1814]/5 p-0.5 rounded-lg border border-[#1A1814]/5">
            <button
              onClick={() => setTheme('cozy')}
              className={cn(
                'px-2 py-1.5 rounded-md text-[9px] font-sans font-bold uppercase tracking-wider transition-all',
                !isGreenTheme
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] opacity-60 hover:opacity-100'
              )}
              title="Theme Crimson"
            >Crimson</button>
            <button
              onClick={() => setTheme('neon')}
              className={cn(
                'px-2 py-1.5 rounded-md text-[9px] font-sans font-bold uppercase tracking-wider transition-all',
                isGreenTheme
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] opacity-60 hover:opacity-100'
              )}
              title="Theme Garden"
            >Garden</button>
          </div>

          {/* Streak pill */}
          <div className={`hidden lg:flex items-center gap-2 border px-3 py-1.5 rounded-full text-[10px] font-sans font-bold tracking-wider uppercase ${'bg-[var(--accent-light)]/20 text-[var(--accent)] border-[var(--accent)]/20'}`}>
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>STREAK {streak} NGÀY</span>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((p) => !p)}
              className={cn(
                'flex items-center gap-2 border px-3 py-2 rounded-xl text-[10px] font-sans font-bold uppercase tracking-widest transition-all cursor-pointer shadow-sm',
                isAdminMode
                  ? 'bg-[#1A1814] text-[#FAF9F6] border-[#1A1814]'
                  : isGreenTheme
                    ? 'bg-white text-[var(--accent)] border-[var(--accent)] hover:bg-[#FAFDF9]'
                    : 'bg-white text-[#1A1814]/80 border-[#1A1814]/15 hover:border-[#1A1814]/30'
              )}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                style={{ backgroundColor: isAdminMode ? 'var(--accent)' : ('var(--accent-light)'), color: isAdminMode ? 'white' : 'white' }}
              >
                {initials}
              </div>
              <span className="hidden sm:inline">{currentUser.name.split(' ').pop()}</span>
              <ChevronDown className={cn('w-3 h-3 transition-transform', profileOpen && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'absolute right-0 top-full mt-2 w-72 rounded-2xl border shadow-xl z-50 overflow-hidden',
                    isGreenTheme
                      ? 'bg-white border-[var(--accent)]/20 shadow-lg'
                      : 'bg-[var(--card-bg)] border-[var(--border-default)] shadow-lg'
                  )}
                  onClick={() => setProfileOpen(false)}
                >
                  <div className={cn('p-4 border-b', 'border-[var(--border-default)] bg-[var(--card-bg-secondary)]')}>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif font-bold text-sm text-[#1A1814] truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-neutral-500 font-sans truncate">{currentUser.email}</p>
                      </div>
                    </div>
                    <div className={cn('mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-sans font-bold', 'bg-[var(--accent-light)]/30 text-[var(--accent)]')}>
                      <Flame className="w-3.5 h-3.5 fill-current shrink-0" />
                      <span>{streak > 0 ? `${streak} ngày streak liên tiếp!` : 'Chưa có streak hôm nay — hãy làm bài!'}</span>
                    </div>
                  </div>

                  <div className="p-2">
                    <div className="px-3 py-2 mb-1">
                      <p className="text-[9px] font-sans font-bold uppercase tracking-widest text-neutral-400 mb-2">Chế độ quản trị</p>
                      <button
                        onClick={() => { switchRole(); isAdminMode ? router.push('/') : router.push('/admin'); }}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[11px] font-sans font-bold transition-all cursor-pointer',
                          isAdminMode
                            ? 'bg-[#1A1814] text-white'
                            : isGreenTheme
                              ? 'bg-[#f4faf0] text-[var(--accent)] hover:bg-[var(--accent-light)]/30 border border-[var(--accent)]/20'
                              : 'bg-neutral-100 text-[#1A1814] hover:bg-neutral-200'
                        )}
                      >
                        {isAdminMode ? (
                          <><ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" /> Chế độ Giáo Viên (Admin)</>
                        ) : (
                          <><User className="w-3.5 h-3.5" /> Chế độ Học Sinh</>
                        )}
                        <span className="ml-auto text-[9px] opacity-60">{isAdminMode ? '→ Học sinh' : '→ Giáo viên'}</span>
                      </button>
                    </div>

                    <div className={cn('my-1 h-px', 'bg-[var(--accent)]/10')} />

                    <button
                      onClick={() => { router.push('/settings'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[11px] font-sans text-[var(--text-secondary)] hover:bg-neutral-100 transition-all cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" /> Cài đặt tài khoản
                    </button>

                    <button
                      onClick={() => { logout(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[11px] font-sans text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Đăng xuất
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
