'use client';

import React, { useState, useEffect } from 'react';
import { useExamStore } from '@/store/useExamStore';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import MainLayoutWrapper from '@/components/layout/MainLayoutWrapper';
import { Home, PenLine, Gamepad2, Brain, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);
  const { theme, syncOfflineData } = useExamStore();
  const pathname = usePathname();
  const router = useRouter();

  const isGreenTheme = theme === 'neon';

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
    root.style.setProperty(
      '--scrollbar-thumb',
      isGreenTheme ? 'rgba(34, 67, 52, 0.35)' : 'rgba(220, 20, 60, 0.35)'
    );
    root.style.setProperty(
      '--scrollbar-thumb-hover',
      isGreenTheme ? 'rgba(34, 67, 52, 0.55)' : 'rgba(220, 20, 60, 0.55)'
    );
    root.style.setProperty(
      '--page-bg',
      isGreenTheme ? '#f4faf0' : '#F2EFE7'
    );
    root.style.setProperty(
      '--dot-color',
      isGreenTheme ? 'rgba(34, 67, 52, 0.035)' : 'rgba(26, 24, 20, 0.035)'
    );
    root.style.setProperty(
      '--card-frame-color',
      isGreenTheme ? 'rgba(34, 67, 52, 0.18)' : 'rgba(220, 20, 60, 0.16)'
    );
    root.style.setProperty(
      '--card-bg',
      isGreenTheme ? '#FFFFFF' : '#FFF9FA'
    );
    root.style.setProperty(
      '--accent',
      isGreenTheme ? '#224334' : '#DC143C'
    );
    root.style.setProperty(
      '--accent-hover',
      isGreenTheme ? '#1A3327' : '#c91236'
    );
    root.style.setProperty(
      '--accent-light',
      isGreenTheme ? 'rgba(156, 229, 193, 0.15)' : 'rgba(220, 20, 60, 0.08)'
    );
    root.style.setProperty(
      '--surface-soft',
      isGreenTheme ? '#EEF5EC' : '#F7EDEF'
    );
    root.style.setProperty(
      '--card-shadow',
      isGreenTheme
        ? '0 12px 32px rgba(34, 67, 52, 0.10)'
        : '0 12px 32px rgba(73, 24, 34, 0.10)'
    );
    root.style.setProperty(
      '--card-shadow-hover',
      isGreenTheme
        ? '0 18px 42px rgba(34, 67, 52, 0.14)'
        : '0 18px 42px rgba(73, 24, 34, 0.14)'
    );
    root.style.setProperty(
      '--focus-ring',
      isGreenTheme ? 'rgba(34, 67, 52, 0.28)' : 'rgba(220, 20, 60, 0.24)'
    );
    root.classList.toggle('green', isGreenTheme);
  }, [isGreenTheme]);

  if (!hasMounted) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#F2EFE7]">
        <p className="font-serif text-[#1A1814]/60 text-sm tracking-widest uppercase animate-pulse">Đang tải Crimson Garden...</p>
      </div>
    );
  }

  const bgClass = isGreenTheme
    ? 'bg-[#f4faf0] text-[#224334]'
    : 'bg-[#F2EFE7] text-[#1A1814]';

  const isAdminPage = pathname === '/admin';

  const mobileTabs = [
    { path: '/', label: 'Trang Chủ', icon: Home },
    { path: '/quiz', label: 'Luyện Đề', icon: PenLine },
    { path: '/quick-quiz', label: 'Quiz', icon: Brain },
    { path: '/snake', label: 'Snake', icon: Gamepad2 },
    { path: '/leaderboard', label: 'Thi Đua', icon: Trophy },
  ] as const;

  return (
    <>
      <div className={`min-h-[100dvh] ${bgClass} font-sans relative flex flex-col justify-between ${isGreenTheme ? 'selection:bg-[#9ce5c1]/50 selection:text-[#224334]' : 'selection:bg-[#DC143C]/20 selection:text-[#DC143C]'} transition-colors duration-300`}>
        <Sidebar />
        <div className="fixed inset-0 pointer-events-none opacity-[0.015] bg-[radial-gradient(#1A1814_1px,transparent_1px)] [background-size:16px_16px] z-0" />

        <div className="relative z-10 md:pl-64 pb-20 md:pb-0">

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
                      ? isGreenTheme
                        ? 'bg-[#224334] text-white'
                        : 'bg-[#DC143C] text-white'
                      : 'text-neutral-500 hover:text-neutral-800'
                  )}
                >
                  <t.icon className="w-4 h-4 mx-auto" />
                  <span className="block text-[9px] mt-1 font-sans leading-none">{t.label}</span>
                </button>
              ))}
            </div>
          </nav>

          <MainLayoutWrapper>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 md:py-10">
              {children}
            </div>
          </MainLayoutWrapper>
        </div>

        <Footer />
      </div>

    </>
  );
}
