'use client';

import React, { useState } from 'react';
import { useExamStore } from './store/useExamStore';
import { SplineSceneBasic } from './components/ui/demo';
import ExamQuiz from './components/ExamQuiz';
import VocabularySnake from './components/VocabularySnake';
import UploadAutoGenerate from './components/UploadAutoGenerate';
import AdminStatsDashboard from './components/AdminStatsDashboard';
import { AnimatePresence } from 'motion/react';
import { TabMotion } from './components/TabMotion';
import { HomeDashboard } from './components/HomeDashboard';
import { Footer as AppFooter } from './components/layout/Footer';

export default function App() {
  const { isExamActive, attempts, gameScores } = useExamStore();
  const [activeTab, setActiveTab] = useState<'home' | 'quiz' | 'snake' | 'generate'>('home');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  const totalStreak = 5;
  const lastAttempt = attempts[attempts.length - 1] || null;
  const recentWordCategory = gameScores[gameScores.length - 1]?.vocabularyCategory || 'CNTT';

  return (
    <div className="min-h-[100dvh] bg-[#F2EFE7] text-[#1A1814] font-sans relative flex flex-col justify-between selection:bg-[#DC143C]/20 selection:text-[#DC143C]">
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] bg-[radial-gradient(#1A1814_1px,transparent_1px)] [background-size:16px_16px] z-0" />
      <div className="relative z-10">
        <header className="border-b border-[#1A1814]/10 bg-[#FAF9F6]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1A1814] flex items-center justify-center text-[#F2EFE7] font-serif font-extrabold text-lg shadow-sm border border-[#FAF9F6]/20">C</div>
              <div>
                <h1 className="font-serif text-lg font-black tracking-tight leading-none text-[#1A1814]">
                  CRIMSON <span className="text-[#DC143C]">ACADEMY</span>
                </h1>
                <p className="text-[9px] font-mono font-bold tracking-widest text-[#1A1814]/60 uppercase mt-0.5">English & Quiz Platform</p>
              </div>
            </div>
            <NavTabs activeTab={activeTab} isAdminMode={isAdminMode} isExamActive={isExamActive} onTabChange={(tab) => { setActiveTab(tab); setIsAdminMode(false); }} />
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 bg-[#DC143C]/10 text-[#DC143C] border border-[#DC143C]/20 px-3 py-1.5 rounded-full text-xs font-sans font-semibold">
                <span>Học máy {totalStreak} Ngày liên tiếp</span>
              </div>
              <button
                onClick={() => setIsAdminMode(prev => !prev)}
                className={`flex items-center gap-2 border px-4 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${isAdminMode ? 'bg-[#1A1814] text-[#FAF9F6] border-[#1A1814]' : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'}`}
              >
                {isAdminMode ? 'Admin/Giáo viên' : 'Vai trò: Học Sinh'}
              </button>
            </div>
          </div>
        </header>

        <MobileNav activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setIsAdminMode(false); }} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <AnimatePresence mode="wait">
            {isAdminMode ? (
              <TabMotion tabKey="admin-view">
                <AdminStatsDashboard />
              </TabMotion>
            ) : (
              <div className="space-y-10">
                {activeTab === 'home' && (
                  <TabMotion tabKey="home-tab" className="space-y-10">
                    <HomeDashboard
                      attempts={attempts}
                      gameScores={gameScores}
                      lastAttempt={lastAttempt}
                      recentWordCategory={recentWordCategory}
                      onNavigate={setActiveTab}
                    />
                  </TabMotion>
                )}
                {activeTab === 'quiz' && <TabMotion tabKey="quiz-tab"><ExamQuiz /></TabMotion>}
                {activeTab === 'snake' && <TabMotion tabKey="snake-tab"><VocabularySnake /></TabMotion>}
                {activeTab === 'generate' && <TabMotion tabKey="generate-tab"><UploadAutoGenerate /></TabMotion>}
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AppFooter />
    </div>
  );
}

function NavTabs({ activeTab, isAdminMode, isExamActive, onTabChange }: {
  activeTab: string; isAdminMode: boolean; isExamActive: boolean;
  onTabChange: (tab: 'home' | 'quiz' | 'snake' | 'generate') => void;
}) {
  const tabs: { key: 'home' | 'quiz' | 'snake' | 'generate'; label: string }[] = [
    { key: 'home', label: 'Trang Chủ' },
    { key: 'quiz', label: 'Ôn Thi Trắc Nghiệm' },
    { key: 'snake', label: 'Săn Từ Vựng (Snake)' },
    { key: 'generate', label: 'Bóc Tách & Tải Đề' },
  ];

  return (
    <nav className="hidden md:flex items-center gap-1 bg-[#1A1814]/5 p-1 rounded-xl border border-[#1A1814]/5">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={`px-4 py-2 rounded-lg text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === key && !isAdminMode ? 'bg-white text-[#DC143C] shadow-sm' : 'text-[#1A1814]/70 hover:text-[#1A1814]'}`}
        >
          {label}
          {key === 'quiz' && isExamActive && <span className="w-1.5 h-1.5 inline-block bg-[#DC143C] rounded-full ml-1 animate-ping" />}
        </button>
      ))}
    </nav>
  );
}

function MobileNav({ activeTab, onTabChange }: {
  activeTab: string; onTabChange: (tab: 'home' | 'quiz' | 'snake' | 'generate') => void;
}) {
  const tabs: { key: 'home' | 'quiz' | 'snake' | 'generate'; label: string }[] = [
    { key: 'home', label: 'Trang Chủ' },
    { key: 'quiz', label: 'Luyện Đề' },
    { key: 'snake', label: 'Chơi Game Rắn' },
    { key: 'generate', label: 'AI Bóc Tách' },
  ];

  return (
    <div className="md:hidden bg-white border-b border-[#1A1814]/10 p-3 flex gap-1 overflow-x-auto">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold uppercase tracking-wide shrink-0 transition-all ${activeTab === key ? 'bg-[#1A1814]/10 text-[#DC143C]' : 'text-neutral-600'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}


