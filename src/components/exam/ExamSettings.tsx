'use client';

import { cn } from '@/lib/utils';
import { Settings, ShieldCheck, Brain } from 'lucide-react';
import { AppTheme } from '@/lib/theme';
import React from 'react';

export interface ExamSettingsProps {
  theme: AppTheme;
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
  theme, examMode, autoAdvance, showExplanation, soundEnabled,
  shuffleQuestions, shuffleAnswers, timerMode,
  showSettings, onToggleSettings, onSetExamMode, onSetAutoAdvance, onSetShowExplanation, onSetSoundEnabled,
  onSetShuffleQuestions, onSetShuffleAnswers, onSetTimerMode, hidePreExamSettings
}: ExamSettingsProps) {
  const isLight = theme === 'cozy';
  const bg = isLight
    ? 'bg-[#FFF9FA] border border-[var(--border-default)] text-[var(--text-primary)] shadow-2xl'
    : theme === 'neon'
      ? 'bg-[#1a2e22] border-[#9ce5c1]/20 text-[#f4faf0] shadow-xl'
      : 'bg-[var(--card-bg)] border-white/10 text-[var(--text-primary)] shadow-xl';

  const accent = isLight
    ? 'bg-[var(--accent)] text-white border-transparent shadow-sm hover:opacity-90'
    : theme === 'neon'
      ? 'bg-[var(--accent-light)]/20 border-[#9ce5c1]/40 text-[#9ce5c1] hover:bg-[#9ce5c1]/20'
      : 'bg-white/10 border-white/30 text-white hover:bg-white/20';

  const borderClass = isLight ? "border-black/5" : "border-white/10";
  const hoverClass = isLight ? "border-black/10 hover:border-black/20 hover:bg-black/5" : "border-transparent hover:bg-white/10";

  const menuRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (showSettings) onToggleSettings();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef, showSettings, onToggleSettings]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={onToggleSettings}
        aria-expanded={showSettings}
        className={cn(
          "inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-sans font-bold text-[var(--text-primary)] shadow-sm transition-all hover:border-[var(--accent)] hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40",
          showSettings
            ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]"
            : "border-[var(--border-default)] bg-[var(--card-bg)]",
        )}
        title="Cài đặt làm bài"
      >
        <Settings className="w-4 h-4" />
        <span>Cài đặt</span>
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
                      examMode === 'exam' ? accent : cn("opacity-60 hover:opacity-100", hoverClass))}
                  >
                    <ShieldCheck className="w-3 h-3" /> Thi thật
                  </button>
                  <button onClick={() => onSetExamMode('practice')}
                    className={cn("flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-serif font-bold uppercase tracking-wider transition-all border",
                      examMode === 'practice' ? accent : cn("opacity-60 hover:opacity-100", hoverClass))}
                  >
                    <Brain className="w-3 h-3" /> Học tập
                  </button>
                </div>
              </div>
              {examMode === 'practice' && (
                <div className={cn("space-y-2 pt-2 border-t", borderClass)}>
                  <p className="text-[10px] font-sans font-bold uppercase tracking-wider opacity-50">Thời gian</p>
                  <div className="flex gap-2">
                    <button onClick={() => onSetTimerMode('timed')}
                      className={cn("flex-1 px-3 py-1.5 rounded-xl text-[10px] font-serif font-bold uppercase tracking-wider transition-all border",
                        timerMode === 'timed' ? accent : cn("opacity-60 hover:opacity-100", hoverClass))}
                    >Giới hạn</button>
                    <button onClick={() => onSetTimerMode('unlimited')}
                      className={cn("flex-1 px-3 py-1.5 rounded-xl text-[10px] font-serif font-bold uppercase tracking-wider transition-all border",
                        timerMode === 'unlimited' ? accent : cn("opacity-60 hover:opacity-100", hoverClass))}
                    >Vô hạn</button>
                  </div>
                </div>
              )}
              <div className={cn("space-y-2 pt-2 border-t", borderClass)}>
                <p className="text-[10px] font-sans font-bold uppercase tracking-wider opacity-50">Đảo đề</p>
                <ToggleRow label="Đảo câu hỏi" value={shuffleQuestions} onChange={onSetShuffleQuestions} isLight={isLight} />
                <ToggleRow label="Đảo đáp án" value={shuffleAnswers} onChange={onSetShuffleAnswers} isLight={isLight} />
              </div>
            </>
          )}
          <div className={cn("space-y-2", !hidePreExamSettings ? `pt-2 border-t ${borderClass}` : "")}>
            <p className="text-[10px] font-sans font-bold uppercase tracking-wider opacity-50">Tiện ích</p>
            <ToggleRow label="Tự động chuyển câu" value={autoAdvance} onChange={onSetAutoAdvance} isLight={isLight} />
            <ToggleRow label="Hiển thị giải thích" value={showExplanation} onChange={onSetShowExplanation} isLight={isLight} />
            <ToggleRow label="Âm thanh đúng/sai" value={soundEnabled} onChange={onSetSoundEnabled} isLight={isLight} />
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({ label, value, onChange, isLight }: {
  label: string; value: boolean; onChange: (val: boolean) => void; isLight: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <span className="text-[11px] font-sans font-medium">{label}</span>
      <button onClick={() => onChange(!value)}
        className={cn("w-8 h-4 rounded-full transition-all relative", value ? ("bg-[var(--accent)]") : (isLight ? "bg-black/10" : "bg-white/20"))}
      >
        <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm", value ? "right-0.5" : "left-0.5")} />
      </button>
    </label>
  );
}
