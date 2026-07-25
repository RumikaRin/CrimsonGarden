'use client';

import React, { useState } from 'react';
import { useExamStore } from '@/store/useExamStore';
import { Eye, EyeOff, GraduationCap, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getThemeTokens } from '@/lib/theme';

interface LoginScreenProps {
  onSuccess?: () => void;
}

export default function LoginScreen({ onSuccess }: LoginScreenProps) {
  const { login, signup, theme } = useExamStore();
  const isGreen = theme === 'neon';
  const isDark = theme === 'dark';
  const tokens = getThemeTokens(theme);

  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accent = tokens.accent;
  const accentLight = tokens.accentMuted;
  const bgPage = tokens.pageBg;
  const cardBg = tokens.cardBg;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let result;
      if (tab === 'login') {
        result = await login(email, password);
      } else {
        if (!name.trim()) {
          setError('Vui lòng nhập tên của bạn.');
          setLoading(false);
          return;
        }
        result = await signup(name, email, password);
      }

      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center px-4 transition-colors duration-300 relative overflow-hidden"
      style={{ backgroundColor: bgPage }}
    >
      {/* Subtle background dots */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#1A1814_1px,transparent_1px)] [background-size:18px_18px]" />

      {/* Decorative blobs */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: accentLight }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: accentLight }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg"
            style={{ backgroundColor: accent }}
          >
            <GraduationCap className="w-8 h-8" style={{ color: tokens.fgInverse }} />
          </div>
          <h1 className="font-serif text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Crimson <span className="italic font-normal" style={{ color: accent }}>Academy</span>
          </h1>
          <p className="text-[11px] font-sans tracking-[0.25em] uppercase mt-1 text-neutral-500">
            Nền tảng học tập tương tác
          </p>
        </div>

        {/* Card */}
        <div
          className={cn('rounded-2xl overflow-hidden',
            isDark
              ? 'border border-white/15 shadow-[0_24px_70px_rgba(0,0,0,0.45)]'
              : isGreen
              ? 'border-[3px] border-[var(--accent)] shadow-[5px_5px_0px_#224334]'
              : 'border border-neutral-200 shadow-[0_20px_60px_rgba(26,24,20,0.08)]'
          )}
          style={{ backgroundColor: cardBg }}
        >
          {/* Tab switcher */}
          <div className="flex border-b border-neutral-100">
            {(['login', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null); }}
                className={cn(
                  'flex-1 py-4 text-[11px] font-sans font-bold uppercase tracking-widest transition-all cursor-pointer',
                  tab === t
                    ? 'border-b-2'
                    : 'text-neutral-400 hover:text-[var(--text-secondary)]'
                )}
                style={tab === t ? { borderColor: accent, color: accent } : {}}
              >
                {t === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5 sm:p-8">
            {/* Name field (signup only) */}
            {tab === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-500">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm font-sans text-[var(--text-primary)] outline-none transition-all bg-neutral-50 focus:bg-white"
                  style={{ '--tw-ring-color': accent } as React.CSSProperties}
                  onFocus={(e) => (e.target.style.borderColor = accent)}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-500">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@crimson.edu.vn"
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm font-sans text-[var(--text-primary)] outline-none transition-all bg-neutral-50 focus:bg-white"
                onFocus={(e) => (e.target.style.borderColor = accent)}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-500">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={4}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-neutral-200 text-sm font-sans text-[var(--text-primary)] outline-none transition-all bg-neutral-50 focus:bg-white"
                  onFocus={(e) => (e.target.style.borderColor = accent)}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[var(--text-secondary)] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                className="text-xs font-sans px-4 py-2.5 rounded-xl border"
                style={{ backgroundColor: `${accent}10`, borderColor: `${accent}30`, color: accent }}
              >
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-serif font-bold uppercase tracking-widest transition-all cursor-pointer disabled:opacity-60 active:scale-[0.98] shadow-md hover:shadow-lg mt-2"
              style={{ backgroundColor: accent, color: tokens.fgInverse }}
            >
              {loading
                ? 'Đang xử lý...'
                : tab === 'login' ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản'}
            </button>

            {/* Demo hint */}
            <p className="text-[10px] text-center font-sans text-neutral-400 leading-relaxed">
              {tab === 'login'
                ? 'Chưa có tài khoản? Nhập bất kỳ email & mật khẩu để trải nghiệm demo.'
                : 'Điền đầy đủ thông tin để tạo tài khoản mới.'}
            </p>
          </form>
        </div>

        {/* Feature highlights */}
        <div className="mt-5 grid grid-cols-3 gap-1.5 sm:mt-6 sm:gap-3">
          {[
            { icon: BookOpen, label: 'Ôn thi trắc nghiệm' },
            { icon: Sparkles, label: 'AI bóc tách đề' },
            { icon: GraduationCap, label: 'Game rắn từ vựng' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="text-center p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white ">
              <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: accent }} />
              <p className="text-[9px] font-sans font-bold leading-tight text-[#1A1814]">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
