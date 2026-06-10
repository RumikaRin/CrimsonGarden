'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SplineScene } from './splite';
import { CardContent } from './card';
import { Spotlight } from './spotlight';
import { SpotlightStatic } from './spotlight-static';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useExamStore } from '@/store/useExamStore';
import { cn } from '@/lib/utils';

const benefits = [
  'Luyện đề cá nhân hoặc trộn nhiều đề thành Quiz nhanh',
  'Chơi Quiz nhanh và Snake để tích điểm thi đua',
  'Ôn lại câu sai với giải thích chi tiết',
];

export function SplineSceneBasic() {
  const theme = useExamStore((s) => s.theme);
  const isGreenTheme = theme === 'neon';
  const router = useRouter();

  const accentText = isGreenTheme ? 'text-[#224334]' : 'text-[#DC143C]';
  const accentBg = isGreenTheme ? 'bg-[#224334]' : 'bg-[#DC143C]';
  const dotColor = isGreenTheme ? 'bg-[#79ab8e]' : 'bg-[#DC143C]';

  return (
    <div className="w-full overflow-hidden relative card-layered text-[#1A1814]">
      <CardContent className="p-0">
        <Spotlight
          className={
            isGreenTheme
              ? 'from-[#224334]/8 via-[#9ce5c1]/3 to-transparent'
              : 'from-[#DC143C]/8 via-[#DC143C]/3 to-transparent'
          }
          size={350}
        />
        <SpotlightStatic
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill={isGreenTheme ? '#224334' : '#DC143C'}
        />

        <div className="flex flex-col lg:flex-row h-auto min-h-[480px] relative z-10 w-full">
          <div className="flex-1 p-8 sm:p-10 lg:p-12 flex flex-col justify-center space-y-6 lg:max-w-xl">
            <div
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-sans font-bold tracking-wider uppercase w-fit border',
                isGreenTheme
                  ? 'bg-[#224334]/10 border-[#224334]/20 text-[#224334]'
                  : 'bg-[#DC143C]/10 border-[#DC143C]/20 text-[#DC143C]',
              )}
            >
              <Sparkles className="w-3.5 h-3.5" /> Nền tảng học tập
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-serif font-extrabold tracking-tight leading-[1.1] text-[#1A1814]">
                Ôn Luyện{' '}
                <span className={cn('italic font-normal', accentText)}>Thông Minh</span>
              </h1>
              <p className="text-sm font-sans text-[#78716C] leading-relaxed max-w-md">
                Học cùng robot, luyện đề và tham gia các mini game tương tác.
              </p>
            </div>

            <ul className="space-y-2.5">
              {benefits.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-sans text-[#78716C]">
                  <span className={cn('w-1.5 h-1.5 rounded-full mt-2 shrink-0', dotColor)} />
                  {item}
                </li>
              ))}
            </ul>

            <div className="border-t border-[#1A1814]/10 pt-5 space-y-3 max-w-sm">
              <div className="space-y-1">
                <p className="font-serif font-bold text-[#1A1814] text-base">Bắt đầu ôn luyện</p>
                <p className="text-xs font-sans text-[#78716C]">
                  Chọn một đề thi hoặc bắt đầu Quiz nhanh đã trộn đề.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push('/quiz')}
                className={cn(
                  'w-full min-h-11 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-bold uppercase tracking-wider text-white transition-all cursor-pointer hover:opacity-90 active:scale-[0.98]',
                  accentBg,
                )}
              >
                Làm đề ngay
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            className={cn(
              'flex-1 relative aspect-square lg:aspect-auto min-h-[320px] lg:min-h-0 bg-radial flex items-center justify-center',
              isGreenTheme
                ? 'from-[#224334]/5 via-[#1A1814]/5 to-transparent'
                : 'from-[#DC143C]/5 via-[#1A1814]/5 to-transparent',
            )}
          >
            <div className="absolute inset-4 sm:inset-6 rounded-2xl overflow-hidden border border-[#1A1814]/10 bg-[#FAF9F6]/50 backdrop-blur-sm shadow-xl">
              <SplineScene
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
