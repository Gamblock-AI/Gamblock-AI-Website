'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  eager?: boolean;
}

/**
 * Reveal - fade + slide wrapper used across marketing pages.
 * Honours prefers-reduced-motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  duration = 0.6,
  eager = false,
}: RevealProps) {
  return (
    <motion.div
      initial={eager ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`motion-reduce:!transform-none motion-reduce:!opacity-100 ${className ?? ''}`}
    >
      {children}
    </motion.div>
  );
}
