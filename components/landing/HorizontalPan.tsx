'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap } from '@/lib/gsap';

interface HorizontalPanProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * HorizontalPan - vertical scroll drives a horizontal pan (canonical 5.B).
 * Wrapper is pinned at top top; inner track slides left by its overflow width.
 * Motivated motion: side-to-side exploration of a feature set.
 * Collapses to a horizontally scrollable / wrapped static layout under reduced motion.
 */
export function HorizontalPan({ children, className = '' }: HorizontalPanProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !wrap.current || !track.current) return;
    const ctx = gsap.context(() => {
      const distance = track.current!.scrollWidth - window.innerWidth;
      gsap.to(track.current, {
        x: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: wrap.current,
          start: 'top top',
          end: () => `+=${distance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, wrap);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <section ref={wrap} className={`relative overflow-hidden ${className}`}>
      <div ref={track} className="flex h-[100dvh] items-center gap-8 px-6 md:px-16">
        {children}
      </div>
    </section>
  );
}
