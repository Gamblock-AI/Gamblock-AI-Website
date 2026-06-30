import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

type SectionTone =
  | 'plain'
  | 'mesh'
  | 'pastel'
  | 'aqua'
  | 'dots'
  | 'grid'
  | 'navy'
  | 'crimson'
  | 'white';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
  /** Render the inner max-width container automatically. */
  container?: boolean;
  containerClassName?: string;
  /**
   * When true, the inner container becomes a white "panel" — a contained
   * rounded card with a soft shadow that floats over the fixed page mesh
   * (tina.io style). Use this to create rhythm between open mesh sections.
   */
  panel?: boolean;
}

// Background tones. The marketing pages render a single <FixedBackground />
// (tina.io style): the pastel gradient is FIXED to the viewport and content
// scrolls over it. Light tones are transparent and let that background show
// through; `dots`/`grid` add a transparent texture overlay; only `navy`/
// `crimson` paint a solid surface.
const toneClass: Record<SectionTone, string> = {
  plain: 'bg-transparent',
  mesh: 'bg-transparent',
  pastel: 'bg-transparent',
  aqua: 'bg-transparent',
  white: 'bg-transparent',
  dots: 'bg-texture-dots bg-transparent',
  grid: 'bg-texture-grid bg-transparent',
  navy: 'bg-footer-navy text-white',
  crimson: 'bg-footer-crimson text-white',
};

/**
 * Section — consistent vertical rhythm + branded background tones for
 * marketing pages. Pass `container` to auto-wrap children in the centered
 * max-width container, or `panel` for a contained white card.
 */
export function Section({
  tone = 'plain',
  container = true,
  containerClassName,
  panel = false,
  className,
  children,
  ...props
}: SectionProps) {
  const inner = (
    <div
      className={cn(
        'mx-auto w-full max-w-6xl',
        panel &&
          'rounded-[2rem] border border-border bg-card px-6 py-12 shadow-card md:px-12 md:py-16',
        containerClassName,
      )}
    >
      {children}
    </div>
  );

  return (
    <section
      className={cn('relative px-6 py-20 md:px-10 md:py-28', toneClass[tone], className)}
      {...props}
    >
      {container ? inner : children}
    </section>
  );
}
