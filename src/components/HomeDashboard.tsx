'use client';

import React from 'react';
import { SplineSceneBasic } from './ui/demo';
import { GraduationCap, Trophy, Sparkles, Activity, Flame } from 'lucide-react';
import { ExamAttempt, GameScore } from '../types';

interface HomeDashboardProps {
  attempts: ExamAttempt[];
  gameScores: GameScore[];
  lastAttempt: ExamAttempt | null;
  recentWordCategory: string;
  onNavigate: (tab: 'home' | 'quiz' | 'snake' | 'generate') => void;
}

export function HomeDashboard({ attempts, gameScores, lastAttempt, recentWordCategory, onNavigate }: HomeDashboardProps) {
  const totalStreak = 5;

  return (
    <>
      <SplineSceneBasic />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-serif text-2xl font-bold text-[#1A1814] pb-2 border-b border-neutral-300">
            Bạn Muốn Làm Gì Hôm Nay?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickActionCard
              icon={<GraduationCap className="w-5 h-5" />}
              iconBg="bg-red-50 text-[var(--accent)]"
              title="Ôn Thi Đề"
              description="Kho câu hỏi trắc nghiệm A-B-C-D"
              onClick={() => onNavigate('quiz')}
            />
            <QuickActionCard
              icon={<Trophy className="w-5 h-5 animate-bounce" />}
              iconBg="bg-orange-50 text-orange-600"
              title="Chơi Snake"
              description="Học nhanh từ vựng, tăng phản xạ"
              onClick={() => onNavigate('snake')}
            />
            <QuickActionCard
              icon={<Sparkles className="w-5 h-5" />}
              iconBg="bg-amber-50 text-amber-600"
              title="AI Bóc Tách"
              description="Nạp ngay file Word/Excel bất kỳ"
              onClick={() => onNavigate('generate')}
            />
          </div>
          <div className="p-6 rounded-2xl bg-[#1A1814] text-[#F2EFE7] flex flex-col sm:flex-row justify-between items-center gap-6 shadow-md border border-[#FAF9F6]/10">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-mono tracking-widest text-[var(--accent)] uppercase font-bold">Kế Hoạch Học Tập Tuần</span>
              <h4 className="font-serif font-bold text-lg">Mục tiêu hôm nay: Ôn luyện 20 câu hỏi & đạt 100 điểm rắn</h4>
            </div>
            <div className="flex gap-4 shrink-0 font-serif">
              <div className="text-center bg-white/10 px-4 py-2.5 rounded-xl border border-white/5">
                <p className="text-xs text-[#F2EFE7]/60 font-sans">Độ chuẩn</p>
                <p className="text-xl font-bold font-mono text-[var(--accent)]">{lastAttempt ? `${Math.round(lastAttempt.score * 10)}%` : 'Chưa có'}</p>
              </div>
              <div className="text-center bg-white/10 px-4 py-2.5 rounded-xl border border-white/5">
                <p className="text-xs text-[#F2EFE7]/60 font-sans">Từ vựng săn</p>
                <p className="text-xl font-bold font-mono text-amber-400">{recentWordCategory}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <ActivityFeed attempts={attempts} gameScores={gameScores} />
          <TipCard />
        </div>
      </div>
    </>
  );
}

function QuickActionCard({ icon, iconBg, title, description, onClick }: {
  icon: React.ReactNode; iconBg: string; title: string; description: string; onClick: () => void;
}) {
  return (
    <div onClick={onClick} className="bg-white border border-neutral-200 hover:border-[var(--accent)]/40 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-40">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
      <div>
        <h4 className="font-serif font-bold text-base text-[#1A1814] group-hover:text-[var(--accent)]">{title}</h4>
        <p className="text-[11px] text-neutral-500 font-sans mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function ActivityFeed({ attempts, gameScores }: { attempts: ExamAttempt[]; gameScores: GameScore[] }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm space-y-4">
      <h4 className="font-serif text-lg font-bold text-neutral-800 flex items-center gap-2">
        <Activity className="w-4 h-4 text-[var(--accent)]" /> Lịch Sử Hoạt Động
      </h4>
      <div className="space-y-4 max-h-[290px] overflow-y-auto pr-1">
        {attempts.length === 0 && gameScores.length === 0 ? (
          <div className="text-xs text-neutral-400 font-sans leading-relaxed text-center py-8">
            Chưa phát hiện lượt làm bài nào. Tiến trình của bạn sẽ có tại đây.
          </div>
        ) : (
          <>
            {attempts.map((attempt) => (
              <div key={attempt.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex justify-between items-center text-xs">
                <div className="space-y-1">
                  <p className="font-serif font-bold text-[#1A1814] leading-tight">Thử sức: {attempt.examId.replace('exam-', '').toUpperCase()}</p>
                  <p className="text-[10px] text-neutral-500 font-mono flex items-center gap-1">
                    Đạt: {attempt.score}/10 điểm | {new Date(attempt.endedAt).toLocaleTimeString()}
                  </p>
                </div>
                <span className="font-mono font-bold bg-green-500/10 text-green-700 px-2 py-1 rounded-md">{Math.round(attempt.score * 10)}%</span>
              </div>
            ))}
            {gameScores.map((scoreLog) => (
              <div key={scoreLog.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex justify-between items-center text-xs">
                <div className="space-y-1">
                  <p className="font-serif font-bold text-neutral-800 leading-tight">Game Snake: {scoreLog.vocabularyCategory}</p>
                  <p className="text-[10px] text-neutral-500 font-mono">Thời gian: {scoreLog.durationSeconds} giây | {new Date(scoreLog.playedAt).toLocaleTimeString()}</p>
                </div>
                <span className="font-mono font-bold bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-1 rounded-md">+{scoreLog.score}đ</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function TipCard() {
  return (
    <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex gap-3 text-xs leading-relaxed">
      <span className="text-lg">💡</span>
      <div className="space-y-1 font-sans">
        <p className="font-bold">Mẹo ghi nhớ siêu nhanh:</p>
        <p className="text-[var(--text-secondary)]">
          Lấy các câu hỏi sai trong mục làm đề, đưa vào game rắn săn mồi để rèn luyện phản xạ ghi nhớ từ vựng. Đạt 100 điểm snake để mở khóa danh hiệu!
        </p>
      </div>
    </div>
  );
}
