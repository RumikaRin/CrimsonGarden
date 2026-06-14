'use client';

import { cn } from '@/lib/utils';
import { useIsGreen } from "@/lib/useThemeTokens";
import { Settings, ShieldCheck, Brain } from 'lucide-react';

interface ExamSettingsProps {
  isGreenTheme: boolean;
  examMode: 'exam' | 'practice';
  autoAdvance: boolean;
  showExplanation: boolean;
  soundEnabled: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  timerMode: 'timed' | 'unlimited';
  showSettings: boolean;
  onToggleSettings: () => void;
  onSetExamMode: (mode: 'exam' | 'practice') => void;
  onSetAutoAdvance: (val: boolean) => void;
  onSetShowExplanation: (val: boolean) => void;
  onSetSoundEnabled: (val: boolean) => void;
  onSetShuffleQuestions: (val: boolean) => void;
  onSetShuffleAnswers: (val: boolean) => void;
  onSetTimerMode: (mode: 'timed' | 'unlimited') => void;
  hidePreExamSettings?: boolean;
}

export function ExamSettings({
  isGreenTheme, examMode, autoAdvance, showExplanation, soundEnabled,
  shuffleQuestions, shuffleAnswers, timerMode,
  showSettings, onToggleSettings, onSetExamMode, onSetAutoAdvance, onSetShowExplanation, onSetSoundEnabled,
  onSetShuffleQuestions, onSetShuffleAnswers, onSetTimerMode, hidePreExamSettings
}: ExamSettingsProps) {
  const bg = isGreenTheme ? 'bg-[#1a2e22] border-[#9ce5c1]/20 text-[#f4faf0]' : 'bg-[#1A1814] border-[#FAF9F6]/10 text-[#F2EFE7]';
  const accent = isGreenTheme ? 'bg-[var(--accent-light)]/20 border-[#9ce5c1]/40 text-[#9ce5c1]' : 'bg-[var(--accent)]/15 border-[var(--accent)]/30 text-[var(--accent)]';

  return (
    <div className="relative">
      <button onClick={onToggleSettings}
        className={cn("p-2 rounded-lg transition-all hover:bg-white/10", showSettings ? "bg-white/10" : "")}
        title="Cài đặt làm bài"
      >
        <Settings className="w-4 h-4" />
      </button>
      {showSettings && (
        <div className={cn("absolute right-0 top-full mt-2 w-64 rounded-2xl border p-4 space-y-3 z-40", bg)}>
          <h4 className="text-[11px] font-serif font-bold uppercase tracking-wider opacity-70">⚙️ Tùy chọn làm bài</h4>
          {!hidePreExamSettings && (
            <>
              <div className="space-y-2">
                <p className="text-[10px] font-sans font-bold uppercase tracking-wider opacity-50">Chế độ</p>
                <div className="flex gap-2">
                  <button onClick={() => onSetExamMode('exam')}
                    className={cn("flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-serif font-bold uppercase tracking-wider transition-all border",
                      examMode === 'exam' ? accent : "border-transparent opacity-60 hover:opacity-100 hover:bg-white/5")}
                  >
                    <ShieldCheck className="w-3 h-3" /> Thi thật
                  </button>
                  <button onClick={() => onSetExamMode('practice')}
                    className={cn("flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-serif font-bold uppercase tracking-wider transition-all border",
                      examMode === 'practice' ? accent : "border-transparent opacity-60 hover:opacity-100 hover:bg-white/5")}
                  >
                    <Brain className="w-3 h-3" /> Học tập
                  </button>
                </div>
              </div>
              {examMode === 'practice' && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <p className="text-[10px] font-sans font-bold uppercase tracking-wider opacity-50">Thời gian</p>
                  <div className="flex gap-2">
                    <button onClick={() => onSetTimerMode('timed')}
                      className={cn("flex-1 px-3 py-1.5 rounded-xl text-[10px] font-serif font-bold uppercase tracking-wider transition-all border",
                        timerMode === 'timed' ? accent : "border-transparent opacity-60 hover:opacity-100 hover:bg-white/5")}
                    >Giới hạn</button>
                    <button onClick={() => onSetTimerMode('unlimited')}
                      className={cn("flex-1 px-3 py-1.5 rounded-xl text-[10px] font-serif font-bold uppercase tracking-wider transition-all border",
                        timerMode === 'unlimited' ? accent : "border-transparent opacity-60 hover:opacity-100 hover:bg-white/5")}
                    >Vô hạn</button>
                  </div>
                </div>
              )}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <p className="text-[10px] font-sans font-bold uppercase tracking-wider opacity-50">Đảo đề</p>
                <ToggleRow label="Đảo câu hỏi" value={shuffleQuestions} onChange={onSetShuffleQuestions} isGreenTheme={isGreenTheme} />
                <ToggleRow label="Đảo đáp án" value={shuffleAnswers} onChange={onSetShuffleAnswers} isGreenTheme={isGreenTheme} />
              </div>
            </>
          )}
          <div className={cn("space-y-2", !hidePreExamSettings ? "pt-2 border-t border-white/10" : "")}>
            <p className="text-[10px] font-sans font-bold uppercase tracking-wider opacity-50">Tiện ích</p>
            <ToggleRow label="Tự động chuyển câu" value={autoAdvance} onChange={onSetAutoAdvance} isGreenTheme={isGreenTheme} />
            <ToggleRow label="Hiển thị giải thích" value={showExplanation} onChange={onSetShowExplanation} isGreenTheme={isGreenTheme} />
            <ToggleRow label="Âm thanh đúng/sai" value={soundEnabled} onChange={onSetSoundEnabled} isGreenTheme={isGreenTheme} />
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({ label, value, onChange, isGreenTheme }: {
  label: string; value: boolean; onChange: (val: boolean) => void; isGreenTheme: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <span className="text-[11px] font-sans font-medium">{label}</span>
      <button onClick={() => onChange(!value)}
        className={cn("w-8 h-4 rounded-full transition-all relative", value ? ("bg-[var(--accent-light)]") : "bg-white/20")}
      >
        <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm", value ? "right-0.5" : "left-0.5")} />
      </button>
    </label>
  );
}
