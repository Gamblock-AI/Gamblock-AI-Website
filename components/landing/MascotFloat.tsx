'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MascotFloatProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  imgClassName?: string;
  preload?: boolean;
  sizes?: string;
  /** Enables the idle CSS float animation (disabled for static compositions). */
  animate?: boolean;
  /** Strength of scroll parallax in px (0 disables parallax). */
  parallax?: number;
}

/**
 * MascotFloat — the Gami mascot with a gentle idle float (CSS) plus an optional
 * scroll-driven parallax drift (GSAP). Both are disabled under reduced motion.
 */
export function MascotFloat({
  src,
  alt,
  width = 520,
  height = 520,
  className,
  imgClassName,
  preload = false,
  sizes,
  animate = true,
  parallax = 60,
}: MascotFloatProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      reduce ||
      !ref.current ||
      parallax === 0 ||
      !window.matchMedia('(min-width: 768px)').matches
    ) return;

    let cancelled = false;
    let context: { revert: () => void } | undefined;

    void import('@/lib/gsap').then(({ gsap }) => {
      if (cancelled || !ref.current) return;
      context = gsap.context(() => {
        gsap.to(ref.current, {
          y: parallax,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }, ref);
    });

    return () => {
      cancelled = true;
      context?.revert();
    };
  }, [reduce, parallax]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        preload={preload}
        sizes={sizes}
        className={cn('h-auto w-full select-none drop-shadow-[0_30px_60px_rgba(22,41,76,0.25)]', animate && 'animate-float', imgClassName)}
      />
    </div>
  );
}
