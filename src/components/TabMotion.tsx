'use client';

import { motion } from 'motion/react';
import { ReactNode } from 'react';

const defaultTransition = { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

interface TabMotionProps {
  children: ReactNode;
  tabKey: string;
  className?: string;
}

export function TabMotion({ children, tabKey, className }: TabMotionProps) {
  return (
    <motion.div
      key={tabKey}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={defaultTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
