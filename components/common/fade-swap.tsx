'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FadeSwapProps {
  /** Content re-animates whenever this key changes. */
  swapKey: string | number;
  children: ReactNode;
  className?: string;
  duration?: number;
  y?: number;
}

/**
 * FadeSwap — gentle crossfade between changing content (greeting variants,
 * rotating facts, breathing phases). `initial={false}` keeps hydration silent:
 * the first render never animates, only subsequent key changes do. Reduced
 * motion renders a plain container.
 */
export function FadeSwap({
  swapKey,
  children,
  className,
  duration = 0.25,
  y = 4,
}: FadeSwapProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={swapKey}
        className={className}
        initial={{ opacity: 0, y }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -y }}
        transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
