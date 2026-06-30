import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

const pillVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-semibold transition-colors',
  {
    variants: {
      variant: {
        accent: 'bg-crimson/10 text-crimson',
        navy: 'bg-navy/10 text-navy',
        sky: 'bg-sky-light/50 text-navy',
        outline: 'border border-border bg-card/70 text-foreground backdrop-blur',
        ghost: 'bg-white/10 text-white',
      },
      size: {
        sm: 'px-2.5 py-1 text-[11px] tracking-wide',
        md: 'px-3.5 py-1.5 text-xs tracking-wide',
      },
    },
    defaultVariants: { variant: 'accent', size: 'md' },
  },
);

interface PillProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof pillVariants> {}

/**
 * Pill — small rounded label used for "NEW" badges, section kickers, and
 * trust chips across the marketing site.
 */
export function Pill({ className, variant, size, ...props }: PillProps) {
  return <span className={cn(pillVariants({ variant, size }), className)} {...props} />;
}
