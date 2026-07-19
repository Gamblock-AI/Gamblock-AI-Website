'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap } from '@/lib/gsap';
import { cn } from '@/lib/utils';

interface StatCounterProps {
  /** Final numeric value to count up to. */
  value: number;
  /** Rendered before the number, e.g. "Rp". */
  prefix?: string;
  /** Rendered after the number, e.g. "T", "Jt", "+". */
  suffix?: string;
  /** Decimal places to display (e.g. 2 for 286.84). */
  decimals?: number;
  /** Locale used for thousands/decimal formatting. */
  locale?: string;
  className?: string;
  durationSec?: number;
}

function format(n: number, decimals: number, locale: string) {
  return n.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * StatCounter — animates from 0 to `value` when scrolled into view (GSAP +
 * ScrollTrigger). Under prefers-reduced-motion it renders the final value
 * immediately with no animation.
 */
export function StatCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  locale = 'id-ID',
  className,
  durationSec = 1.8,
}: StatCounterProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() =>
    reduce ? format(value, decimals, locale) : format(0, decimals, locale),
  );

  useEffect(() => {
    if (reduce || !ref.current) return;
    const obj = { n: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        n: value,
        duration: durationSec,
        ease: 'power2.out',
        scrollTrigger: { trigger: ref.current!, start: 'top 85%', once: true },
        onUpdate: () => setDisplay(format(obj.n, decimals, locale)),
        onComplete: () => setDisplay(format(value, decimals, locale)),
      });
    }, ref);
    return () => ctx.revert();
  }, [reduce, value, decimals, locale, durationSec]);

  const visibleDisplay = reduce ? format(value, decimals, locale) : display;

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {visibleDisplay}
      {suffix}
    </span>
  );
}
