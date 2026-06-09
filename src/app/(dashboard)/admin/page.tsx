'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useExamStore } from '@/store/useExamStore';
import AdminStatsDashboard from '@/components/AdminStatsDashboard';

export default function AdminPage() {
  const currentUser = useExamStore((s) => s.currentUser);
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <motion.div
      key="admin-page"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {isAdmin ? (
        <AdminStatsDashboard />
      ) : (
        <div className="text-center py-20">
          <p className="font-serif text-lg text-neutral-500">Bạn không có quyền truy cập trang này.</p>
        </div>
      )}
    </motion.div>
  );
}
