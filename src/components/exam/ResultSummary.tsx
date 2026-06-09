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
    <div className="bg-[#FAF9F6] border border-neutral-200 rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
        <div className="flex-1 space-y-3 text-center md:text-left">
          <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-serif font-bold uppercase tracking-wider", accentLight, accentText)}>
            <Award className="w-3.5 h-3.5" /> Kết Quả Thi
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#1A1814]">Hoàn thành đề thi</h3>
          <p className="text-sm text-neutral-500 font-sans leading-relaxed">
            Bạn đã trả lời đúng <strong className="text-[#1A1814]">{correctCount}/{totalCount}</strong> câu hỏi. Xem lại chi tiết từng câu bên dưới.
          </p>
          <div className="flex gap-3 pt-2 justify-center md:justify-start">
            <button onClick={onReset} className="bg-[#1A1814] hover:bg-neutral-800 text-white px-5 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider cursor-pointer transition-all">
              Chọn đề khác
            </button>
            <button onClick={onRetry}
              className={cn("border px-5 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider cursor-pointer transition-all", accentBorder, accentText, "hover:bg-black/5")}
            >
              Làm lại
            </button>
          </div>
        </div>
        <div className="shrink-0">
          <div className={cn("relative w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-lg bg-white border-4", "border-[var(--accent)]")}>
            <span className="text-3xl font-mono font-bold text-[#1A1814]">{percentage}%</span>
            <span className="text-[9px] font-serif font-bold uppercase tracking-wider text-neutral-400">Chính xác</span>
          </div>
        </div>
      </div>
    </div>
  );
}
