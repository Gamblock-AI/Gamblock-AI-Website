'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap } from '@/lib/gsap';
import { cn } from '@/lib/utils';

interface MascotFloatProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  /** Strength of scroll parallax in px (0 disables parallax). */
  parallax?: number;
}

/**
 * MascotFloat — the Gami mascot with a gentle idle float (CSS) plus an optional
 * scroll-driven parallax drift (GSAP). Both are disabled under reduced motion.
 */
export function MascotFloat({
  src = '/images/mascot/gami-hero.png',
  alt,
  width = 520,
  height = 520,
  className,
  imgClassName,
  priority = false,
  parallax = 60,
}: MascotFloatProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce || !ref.current || parallax === 0) return;
    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        y: parallax,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, ref);
    return () => ctx.revert();
  }, [reduce, parallax]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={cn('h-auto w-full select-none drop-shadow-[0_30px_60px_rgba(22,41,76,0.25)] animate-float', imgClassName)}
      />
    </div>
  );
}
