import { cn } from '@/lib/utils';

// Shimmering placeholder for loading states. Honours prefers-reduced-motion via
// the `motion-safe`/`motion-reduce` Tailwind variants (animation disabled when
// the user prefers reduced motion).
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-muted',
        'motion-reduce:animate-none motion-reduce:opacity-60',
        className
      )}
      aria-hidden="true"
    />
  );
}
