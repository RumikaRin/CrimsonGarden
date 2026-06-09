'use client';

import React, { useState, useEffect } from 'react';
import { useExamStore } from '@/store/useExamStore';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import MainLayoutWrapper from '@/components/layout/MainLayoutWrapper';
import LoginScreen from '@/components/LoginScreen';
import { Home, PenLine, Gamepad2, Trophy, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);
  const { theme, currentUser, syncOfflineData } = useExamStore();
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
      isGreenTheme ? '#214D39' : '#DC143C'
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
    root.classList.toggle('green', isGreenTheme);
  }, [isGreenTheme]);

  if (!hasMounted) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#F2EFE7]">
        <p className="font-serif text-[#1A1814]/60 text-sm tracking-widest uppercase animate-pulse">Đang tải Crimson Garden...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  const bgClass = isGreenTheme
    ? 'bg-[#f4faf0] text-[#224334]'
    : 'bg-[#F2EFE7] text-[#1A1814]';

  const containerBorderClass = 'bg-white border border-[var(--accent)] shadow-[var(--card-shadow)]';

  const isAdminPage = pathname === '/admin';

  const mobileTabs = [
    { path: '/', label: 'Trang Chủ', icon: Home },
    { path: '/quiz', label: 'Luyện Đề', icon: PenLine },
    { path: '/snake', label: 'Snake', icon: Gamepad2 },
    { path: '/leaderboard', label: 'Xếp Hạng', icon: Trophy },
    { path: '/generate', label: 'Bóc Tách', icon: Upload },
  ] as const;

  return (
    <div className={`min-h-[100dvh] ${bgClass} font-sans relative flex flex-col justify-between ${isGreenTheme ? 'selection:bg-[#9ce5c1]/50 selection:text-[#224334]' : 'selection:bg-[#DC143C]/20 selection:text-[#DC143C]'} transition-colors duration-300`}>
      <Sidebar />
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] bg-[radial-gradient(#1A1814_1px,transparent_1px)] [background-size:16px_16px] z-0" />

      <div className="relative z-10 md:pl-64">

        {/* Mobile Navigation Bar */}
        <div className="md:hidden mx-2 mt-2">
          <div className={`${containerBorderClass} rounded-xl p-1.5 flex gap-1`} style={{ borderWidth: 3 }}>
            {mobileTabs.map((t) => (
              <button
                key={t.path}
                onClick={() => router.push(t.path)}
                className={cn(
                  'flex-1 px-2 py-2.5 rounded-lg text-[11px] font-sans font-bold uppercase tracking-wider transition-all text-center',
                  pathname === t.path && !isAdminPage
                    ? isGreenTheme
                      ? 'bg-[#224334] text-white shadow-sm'
                      : 'bg-[#DC143C] text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800'
                )}
              >
                <t.icon className="w-4 h-4 mx-auto" />
                <span className="block text-[9px] mt-0.5 font-sans">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <MainLayoutWrapper>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {children}
          </div>
        </MainLayoutWrapper>
      </div>

      <Footer />
    </div>
  );
}
