'use client';

import React, { useState } from 'react';
import { useExamStore, computeStreak } from '../store/useExamStore';
import { useRouter } from 'next/navigation';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import {
  ArrowLeft, User, Mail, Phone, FileText, Save,
  Flame, AlertCircle, CheckCircle, Lock
} from 'lucide-react';
import { getThemeTokens } from '@/lib/theme';

export default function AccountSettings() {
  const router = useRouter();
  const { currentUser, theme, activityDates, updateProfile } = useExamStore();
  const isGreen = theme === 'neon';
  const tokens = getThemeTokens(theme);
  const accent = tokens.accent;
  const bgPage = tokens.pageBg;

  const streak = computeStreak(activityDates);
  const totalDays = Array.from(new Set(activityDates.map(d => new Date(d).toISOString().slice(0, 10)))).length;

  const [name, setName] = useState(currentUser?.name ?? '');
  const [bio, setBio] = useState(currentUser?.bio ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) return null;

  const initials = currentUser.name
    .split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() || '??';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Tên không được để trống.'); return; }
    setSaving(true);
    setError(null);
    const result = await updateProfile({ name: name.trim(), bio: bio.trim(), phone: phone.trim() });
    setSaving(false);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setError(result.error ?? 'Không thể lưu. Thử lại sau.');
    }
  };

  const inputClass = cn('w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] text-sm font-sans text-[var(--text-primary)] outline-none transition-all bg-[var(--surface-raised)] focus:border-[var(--accent)]');

  const springEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: springEase } },
  };

  const stagger = {
    animate: { transition: { staggerChildren: 0.05 } },
  };

  const item = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: springEase } },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto p-4">
      {/* Back button */}
      <motion.button
        onClick={() => router.push('/')}
        className="inline-flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-800 transition-colors mb-6 cursor-pointer"
        whileHover={{ x: -4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
      </motion.button>

      <motion.div
        className={cn('card-layered overflow-hidden')}
      >
        {/* Header */}
        <motion.div
          className="px-4 py-4 flex items-center gap-3 border-b sm:px-6 sm:py-5 sm:gap-4"
          style={{ backgroundColor: bgPage, borderColor: tokens.cardBorder }}
          variants={item}
          initial="initial"
          animate="animate"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shrink-0"
            style={{ backgroundColor: accent, color: tokens.fgInverse }}
          >
            {initials}
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-[var(--text-primary)]">Cài Đặt Tài Khoản</h2>
            <p className="text-[10px] font-sans text-neutral-400 uppercase tracking-widest">
              {currentUser.role === 'ADMIN' ? 'Giáo Viên / Admin' : 'Học Sinh'}
            </p>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          className="grid grid-cols-3 divide-x"
          style={{ borderColor: tokens.cardBorder }}
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {[
            { label: 'Streak', value: `${streak} ngày`, accent: true },
            { label: 'Ngày học', value: `${totalDays} ngày` },
            { label: 'Vai trò', value: currentUser.role === 'ADMIN' ? 'Giáo viên' : 'Học sinh' },
          ].map(({ label, value, accent: isAccent }) => (
            <motion.div key={label} variants={item} className="flex flex-col items-center py-3 px-1 bg-[var(--surface-soft)] sm:py-4 sm:px-4">
              <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-neutral-400">{label}</span>
              <span
                className="text-xs font-mono font-bold mt-0.5 text-center sm:text-sm"
                style={{ color: isAccent ? accent : tokens.fg }}
              >{value}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-4 space-y-5 sm:p-6">
          {/* Email (read-only) */}
          <motion.div className="space-y-1.5" variants={item} initial="initial" animate="animate">
            <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
              <Mail className="w-3 h-3" /> Email (không thể thay đổi)
            </label>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-100 bg-neutral-50 text-sm font-sans text-neutral-500">
              <span>{currentUser.email}</span>
              <Lock className="w-3 h-3 ml-auto text-neutral-300" />
            </div>
          </motion.div>

          {/* Name */}
          <motion.div className="space-y-1.5" variants={item} initial="initial" animate="animate">
            <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
              <User className="w-3 h-3" /> Họ và tên
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ và tên..."
              className={inputClass}
              style={{ borderColor: tokens.cardBorder }}
              onFocus={(e) => (e.target.style.borderColor = accent)}
              onBlur={(e) => (e.target.style.borderColor = tokens.cardBorder)}
            />
          </motion.div>

          {/* Phone */}
          <motion.div className="space-y-1.5" variants={item} initial="initial" animate="animate">
            <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
              <Phone className="w-3 h-3" /> Số điện thoại (tùy chọn)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912 345 678"
              className={inputClass}
              style={{ borderColor: tokens.cardBorder }}
              onFocus={(e) => (e.target.style.borderColor = accent)}
              onBlur={(e) => (e.target.style.borderColor = tokens.cardBorder)}
            />
          </motion.div>

          {/* Bio */}
          <motion.div className="space-y-1.5" variants={item} initial="initial" animate="animate">
            <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Giới thiệu bản thân (tùy chọn)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ví dụ: Học sinh lớp 12 trường THPT ABC, đang ôn thi đại học..."
              rows={3}
              className={cn(inputClass, 'resize-none')}
              style={{ borderColor: tokens.cardBorder }}
              onFocus={(e) => (e.target.style.borderColor = accent)}
              onBlur={(e) => (e.target.style.borderColor = tokens.cardBorder)}
            />
          </motion.div>

          {/* Feedback */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 text-xs font-sans px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </motion.div>
          )}
          {saved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-2 text-xs font-sans px-3 py-2.5 rounded-xl border"
              style={{ backgroundColor: `${accent}10`, borderColor: `${accent}30`, color: accent }}
            >
              <CheckCircle className="w-3.5 h-3.5 shrink-0" /> Đã lưu thông tin thành công!
            </motion.div>
          )}

          {/* Actions */}
          <motion.div className="flex gap-3 pt-2" variants={item} initial="initial" animate="animate">
            <motion.button
              type="button"
              onClick={() => router.push('/')}
              className="flex-1 py-3 rounded-xl border border-neutral-200 text-[11px] font-sans font-bold text-[var(--text-secondary)] hover:bg-neutral-50 transition-all cursor-pointer"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              Hủy
            </motion.button>
            <motion.button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl text-[11px] font-sans font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 shadow-md hover:shadow-lg"
              style={{ backgroundColor: accent, color: tokens.fgInverse }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {saving ? (
                'Đang lưu...'
              ) : (
                <><Save className="w-3.5 h-3.5" /> Lưu Thay Đổi</>
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
}
