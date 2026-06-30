'use client';

import { cn } from '@/lib/utils';
import { Children, type ReactNode } from 'react';

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  /** Gap (and seam spacing) between items, in rem. Uniform so the -50% loop
   *  is seamless. */
  gapRem?: number;
  /** How many times to repeat the item set within EACH half of the track.
   *  A half must be at least as wide as the viewport, otherwise a gap appears
   *  on the right before the loop resets. Bump this if you have few/short
   *  items on wide screens. */
  repeat?: number;
  /** Full loop duration in seconds. Higher = slower scroll. Because the track
   *  repeats the items, scale this with `repeat` to keep a steady pace. */
  durationSec?: number;
}

/**
 * Marquee — seamless infinite horizontal auto-scroll.
 *
 * The track is built from TWO identical halves and translates by exactly -50%
 * (one half width). For a gap-free loop, a single half must be wider than the
 * container, so each half repeats the item set `repeat` times.
 *
 * Pauses on hover and under prefers-reduced-motion (animate-marquee is disabled
 * globally), leaving a static row.
 */
export function Marquee({
  children,
  className,
  gapRem = 4,
  repeat = 3,
  durationSec = 60,
}: MarqueeProps) {
  const items = Children.toArray(children);
  const half = Array.from({ length: repeat }).flatMap((_, r) =>
    items.map((child, i) => (
      <div key={`${r}-${i}`} className="flex shrink-0" style={{ marginRight: `${gapRem}rem` }}>
        {child}
      </div>
    )),
  );

  return (
    <div
      className={cn('group relative flex w-full overflow-hidden', className)}
      role="presentation"
    >
      <div
        className="flex w-max shrink-0 animate-marquee items-center group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${durationSec}s` }}
      >
        <div className="flex shrink-0 items-center">{half}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {half}
        </div>
      </div>
    </div>
  );
}
