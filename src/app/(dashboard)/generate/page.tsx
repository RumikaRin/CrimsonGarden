'use client';

import React from 'react';
import { motion } from 'motion/react';
import UploadAutoGenerate from '@/components/UploadAutoGenerate';

export default function GeneratePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <UploadAutoGenerate />
    </motion.div>
  );
}
