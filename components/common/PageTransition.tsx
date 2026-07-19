'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useLayoutEffect, type ReactNode } from 'react';
import { usePathname } from '@/i18n/routing';

// Fade + slide page transition wrapper. Honours prefers-reduced-motion (renders
// children without animation). Used in (app)/layout.tsx to animate route changes.
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const pathname = usePathname();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (reduce) return <>{children}</>;
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
