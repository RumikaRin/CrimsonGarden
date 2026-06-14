'use client';

import React, { useState, useEffect } from 'react';
import { useExamStore, AuthUser } from '@/store/useExamStore';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, GraduationCap, BookOpen, Sparkles, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const { login, signup, currentUser, theme } = useExamStore();
  const router = useRouter();
  const isGreen = theme === 'neon';

  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password state
  const [forgotStep, setForgotStep] = useState<'idle' | 'email' | 'reset' | 'done'>('idle');
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      router.replace('/');
    }
  }, [currentUser, router]);

  const accent = isGreen ? '#224334' : '#DC143C';
  const accentLight = isGreen ? '#9ce5c1' : '#FFC5C5';
  const bgPage = isGreen ? '#f4faf0' : '#F2EFE7';

  const resetForgotState = () => {
    setForgotStep('idle');
    setForgotEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Direct API call for login
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body: Record<string, string> = { email, password };
      if (tab === 'signup') body.name = name;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success && data.user) {
        // Update Zustand store with user from API
        useExamStore.setState({
          currentUser: {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role === 'ADMIN' ? 'ADMIN' : ('STUDENT' as const),
          },
        });
        router.replace('/');
      } else {
        // If API fails, try store's fallback (offline mode)
        if (tab === 'login') {
          const result = await login(email, password);
          if (result.success) {
            router.replace('/');
            return;
          }
          setError(result.error || 'Đăng nhập thất bại.');
        } else {
          if (!name.trim()) {
            setError('Vui lòng nhập tên của bạn.');
            setLoading(false);
            return;
          }
          const result = await signup(name, email, password);
          if (result.success) {
            router.replace('/');
            return;
          }
          setError(result.error || 'Đăng ký thất bại.');
        }
      }
    } catch (err) {
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();

      if (data.success) {
        setForgotStep('reset');
      } else {
        setError(data.error || 'Email không tồn tại trong hệ thống.');
      }
    } catch {
      setError('Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 4) {
      setError('Mật khẩu mới phải có ít nhất 4 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setForgotStep('done');
      } else {
        setError(data.error || 'Không thể đặt lại mật khẩu.');
      }
    } catch {
      setError('Không thể kết nối đến máy chủ.');
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
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: accent }}
          >
            <GraduationCap className="w-8 h-8 text-white" />
          </button>
          <h1 className="font-serif text-3xl font-bold" style={{ color: '#1A1814' }}>
            Crimson <span className="italic font-normal" style={{ color: accent }}>Academy</span>
          </h1>
          <p className="text-[11px] font-sans tracking-[0.25em] uppercase mt-1 text-neutral-500">
            {forgotStep === 'idle' ? 'Nền tảng học tập tương tác' : 'Khôi phục mật khẩu'}
          </p>
        </div>

        {/* Card */}
        <div
          className={cn('rounded-2xl overflow-hidden',
            isGreen
              ? 'border-[3px] border-[var(--accent)] shadow-[5px_5px_0px_#224334]'
              : 'border border-neutral-200 shadow-[0_20px_60px_rgba(26,24,20,0.08)]'
          )}
          style={{ backgroundColor: 'white' }}
        >
          {/* ───── FORGOT PASSWORD: STEP 1 — Verify Email ───── */}
          {forgotStep === 'email' && (
            <form onSubmit={handleForgotVerify} className="p-8 space-y-5">
              <button
                type="button"
                onClick={resetForgotState}
                className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" /> Quay lại
              </button>

              <div className="text-center py-2">
                <ShieldCheck className="w-10 h-10 mx-auto mb-2" style={{ color: accent }} />
                <h2 className="font-serif text-lg font-bold text-[#1A1814]">Quên mật khẩu?</h2>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Nhập email bạn đã dùng để đăng ký,<br />
                  chúng tôi sẽ xác thực để đặt lại mật khẩu.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-500">
                  Email đã đăng ký
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="student@crimson.edu.vn"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm font-sans text-[#1A1814] outline-none transition-all bg-neutral-50 focus:bg-white"
                  onFocus={(e) => (e.target.style.borderColor = accent)}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>

              {error && (
                <div
                  className="text-xs font-sans px-4 py-2.5 rounded-xl border"
                  style={{ backgroundColor: `${accent}10`, borderColor: `${accent}30`, color: accent }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !forgotEmail.trim()}
                className="w-full py-3.5 rounded-xl text-sm font-serif font-bold uppercase tracking-widest transition-all cursor-pointer disabled:opacity-60 active:scale-[0.98] shadow-md hover:shadow-lg"
                style={{ backgroundColor: accent, color: 'white' }}
              >
                {loading ? 'Đang xác thực...' : 'Xác Thực Email'}
              </button>
            </form>
          )}

          {/* ───── FORGOT PASSWORD: STEP 2 — Reset Password ───── */}
          {forgotStep === 'reset' && (
            <form onSubmit={handleResetPassword} className="p-8 space-y-5">
              <button
                type="button"
                onClick={() => setForgotStep('email')}
                className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" /> Quay lại
              </button>

              <div className="text-center py-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                  style={{ backgroundColor: `${accent}15` }}
                >
                  <CheckCircle2 className="w-5 h-5" style={{ color: accent }} />
                </div>
                <h2 className="font-serif text-lg font-bold text-[#1A1814]">Đặt mật khẩu mới</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Email <span className="font-bold" style={{ color: accent }}>{forgotEmail}</span> đã được xác thực.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-500">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={4}
                    autoFocus
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-neutral-200 text-sm font-sans text-[#1A1814] outline-none transition-all bg-neutral-50 focus:bg-white"
                    onFocus={(e) => (e.target.style.borderColor = accent)}
                    onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-500">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm font-sans text-[#1A1814] outline-none transition-all bg-neutral-50 focus:bg-white"
                  onFocus={(e) => { e.target.style.borderColor = accent; if (confirmPassword && newPassword !== confirmPassword) setError(null); }}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>

              {error && (
                <div
                  className="text-xs font-sans px-4 py-2.5 rounded-xl border"
                  style={{ backgroundColor: `${accent}10`, borderColor: `${accent}30`, color: accent }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !newPassword.trim() || !confirmPassword.trim()}
                className="w-full py-3.5 rounded-xl text-sm font-serif font-bold uppercase tracking-widest transition-all cursor-pointer disabled:opacity-60 active:scale-[0.98] shadow-md hover:shadow-lg"
                style={{ backgroundColor: accent, color: 'white' }}
              >
                {loading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
              </button>
            </form>
          )}

          {/* ───── FORGOT PASSWORD: STEP 3 — Done ───── */}
          {forgotStep === 'done' && (
            <div className="p-8 space-y-5 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ backgroundColor: `${accent}15` }}
              >
                <CheckCircle2 className="w-8 h-8" style={{ color: accent }} />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#1A1814]">Đặt lại mật khẩu thành công!</h2>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Mật khẩu của bạn đã được cập nhật.<br />
                Giờ bạn có thể đăng nhập với mật khẩu mới.
              </p>

              <button
                onClick={() => { resetForgotState(); setEmail(forgotEmail); setTab('login'); }}
                className="w-full py-3.5 rounded-xl text-sm font-serif font-bold uppercase tracking-widest transition-all cursor-pointer active:scale-[0.98] shadow-md hover:shadow-lg"
                style={{ backgroundColor: accent, color: 'white' }}
              >
                Quay Lại Đăng Nhập
              </button>
            </div>
          )}

          {/* ───── LOGIN / SIGNUP FORM ───── */}
          {forgotStep === 'idle' && (
            <>
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

              <form onSubmit={handleSubmit} className="p-8 space-y-5">
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
                      required
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm font-sans text-[#1A1814] outline-none transition-all bg-neutral-50 focus:bg-white"
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
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm font-sans text-[#1A1814] outline-none transition-all bg-neutral-50 focus:bg-white"
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
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-neutral-200 text-sm font-sans text-[#1A1814] outline-none transition-all bg-neutral-50 focus:bg-white"
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

                  {/* Forgot password link */}
                  {tab === 'login' && (
                    <div className="text-right pt-0.5">
                      <button
                        type="button"
                        onClick={() => { setForgotStep('email'); setForgotEmail(email); setError(null); }}
                        className="text-[10px] font-sans font-bold uppercase tracking-widest cursor-pointer transition-colors"
                        style={{ color: accent }}
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                  )}
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
                  style={{ backgroundColor: accent, color: 'white' }}
                >
                  {loading
                    ? 'Đang xử lý...'
                    : tab === 'login' ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-[11px] font-sans font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
          >
            ← Quay lại trang chủ
          </button>
        </div>

        {/* Feature highlights (hide during forgot password flow) */}
        {forgotStep === 'idle' && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: BookOpen, label: 'Ôn thi trắc nghiệm' },
              { icon: Sparkles, label: 'AI bóc tách đề' },
              { icon: GraduationCap, label: 'Game rắn từ vựng' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="text-center p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white">
                <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: accent }} />
                <p className="text-[9px] font-sans font-bold text-[var(--text-secondary)] leading-tight">{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
