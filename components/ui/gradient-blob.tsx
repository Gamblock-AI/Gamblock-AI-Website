import { cn } from '@/lib/utils';

interface GradientBlobProps {
  className?: string;
  /** Tailwind color utility for the blob fill, e.g. 'bg-sky-light'. */
  color?: string;
  /** Disable the floating animation. */
  static?: boolean;
}

/**
 * GradientBlob — soft, blurred decorative shape for pastel backgrounds.
 * Purely decorative; aria-hidden. Animation respects reduced-motion
 * (animate-blob is disabled globally under prefers-reduced-motion).
 */
export function GradientBlob({
  className,
  color = 'bg-sky-light',
  static: isStatic = false,
}: GradientBlobProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute -z-10 rounded-full opacity-60 blur-3xl',
        color,
        !isStatic && 'animate-blob',
        className,
      )}
    />
  );
}
