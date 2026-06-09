'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { getThemeTokens } from '@/lib/theme';

type CardVariant = 'default' | 'interactive' | 'nested' | 'ghost' | 'medal';

interface AppCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  onClick?: () => void;
  medalTier?: number;
  isCurrentUser?: boolean;
}

export function AppCard({
  children,
  variant = 'default',
  className,
  onClick,
  medalTier,
  isCurrentUser,
}: AppCardProps) {


  const borderColor = variant === 'medal' ? undefined : 'border-[var(--accent)]';

  const shadowClass = 'shadow-[var(--card-shadow)]';

  const userRing = isCurrentUser && variant !== 'medal'
    ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--page-bg)]'
    : '';

  const borderWidth = 'var(--card-border-width)'; const commonBorder = 'bg-white border rounded-2xl shadow-sm';
  const hoverClasses = 'cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md';

  let variantClass = commonBorder;
  if (variant === 'interactive') variantClass = commonBorder + ' ' + hoverClasses;
  else if (variant === 'nested') variantClass = 'bg-neutral-50 border border-neutral-200 rounded-xl';
  else if (variant === 'ghost') variantClass = 'bg-white/40 backdrop-blur-sm border border-white/20 rounded-2xl';
  else if (variant === 'medal') {
    if (medalTier === 0) variantClass = 'bg-amber-50 border border-amber-400 rounded-2xl ring-1 ring-amber-400/30';
    else if (medalTier === 1) variantClass = 'bg-slate-50 border border-slate-400 rounded-2xl ring-1 ring-slate-400/30';
    else if (medalTier === 2) variantClass = 'bg-orange-50 border border-orange-400 rounded-2xl ring-1 ring-orange-400/30';
    else variantClass = commonBorder;
  }

  return (
    <div
      className={cn(
        variantClass,
        variant !== 'medal' && borderColor,
        variant !== 'medal' && variant !== 'nested' && variant !== 'ghost' && shadowClass,
        userRing,
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e: React.KeyboardEvent) => { if (e.key === 'Enter') onClick(); } : undefined}
    >
      {children}
    </div>
  );
}
