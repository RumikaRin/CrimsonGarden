'use client';

import React from 'react';
import { motion } from 'motion/react';
import VocabularySnake from '@/components/VocabularySnake';

export default function SnakePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <VocabularySnake />
    </motion.div>
  );
}
