'use client';

import { cn } from '@/lib/utils';
import { useIsGreen } from "@/lib/useThemeTokens";
import { Award } from 'lucide-react';

interface ResultSummaryProps {
  isGreenTheme: boolean;
  correctCount: number;
  totalCount: number;
  percentage: number;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  accentLight: string;
  onReset: () => void;
  onRetry: () => void;
}

export function ResultSummary({
  isGreenTheme, correctCount, totalCount, percentage,
  accentBg, accentText, accentBorder, accentLight,
  onReset, onRetry,
}: ResultSummaryProps) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-default)] rounded-2xl p-4">
      <div className="flex flex-col gap-5">
        <div className="space-y-3">
          <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-serif font-bold uppercase tracking-wider", accentLight, accentText)}>
            <Award className="w-3.5 h-3.5" /> Kết Quả Thi
          </div>
          <h3 className="text-xl font-serif font-bold text-[var(--text-primary)]">Hoàn thành đề thi</h3>
          <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
            Bạn đã trả lời đúng <strong className="text-[var(--text-primary)]">{correctCount}/{totalCount}</strong> câu hỏi. Xem lại chi tiết từng câu bên dưới.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button onClick={onReset} className="bg-[var(--surface-soft)] text-red-500 hover:bg-red-500 hover:text-white border border-[var(--border-default)] hover:border-red-500 px-3 py-2 rounded-xl text-[10px] font-serif font-bold uppercase tracking-wider cursor-pointer transition-all">
              Chọn đề khác
            </button>
            <button onClick={onRetry}
              className={cn("border px-3 py-2 rounded-xl text-[10px] font-serif font-bold uppercase tracking-wider cursor-pointer transition-all", accentBorder, accentText, "hover:bg-[var(--accent-light)]/20")}
            >
              Làm lại
            </button>
          </div>
        </div>
        <div className="flex justify-center border-t border-[var(--border-default)] pt-4">
          <div className={cn("relative w-24 h-24 rounded-full flex flex-col items-center justify-center bg-[var(--card-bg)] border-[3px]", "border-[var(--accent)]")}>
            <span className="text-2xl font-mono font-bold text-[var(--text-primary)]">{percentage}%</span>
            <span className="text-[9px] font-serif font-bold uppercase tracking-wider text-[var(--text-secondary)]">Chính xác</span>
          </div>
        </div>
      </div>
    </div>
  );
}
