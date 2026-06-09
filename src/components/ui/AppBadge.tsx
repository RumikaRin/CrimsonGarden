'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useExamStore } from '@/store/useExamStore';

type BadgeVariant = 'accent' | 'success' | 'warning' | 'info' | 'neutral';

interface AppBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: 'sm' | 'md';
}

export function AppBadge({
  children,
  variant = 'neutral',
  className,
  size = 'sm',
}: AppBadgeProps) {
  const { theme } = useExamStore();
  const isGreen = theme === 'neon';

  const variantStyles: Record<BadgeVariant, string> = {
    accent: isGreen
      ? 'bg-[#9CE5C1]/20 text-[var(--accent)] border-[var(--accent)]/20'
      : 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    neutral: 'bg-neutral-100 text-[var(--text-secondary)] border-neutral-200',
  };

  const sizeStyles = {
    sm: 'text-[9px] px-2 py-0.5',
    md: 'text-[11px] px-3 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-sans font-bold uppercase tracking-wider border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
