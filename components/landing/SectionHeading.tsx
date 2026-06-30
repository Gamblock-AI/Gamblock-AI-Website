'use client';

import type { LucideIcon } from 'lucide-react';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/common/Reveal';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  kicker: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Accent of the kicker pill. */
  accent?: 'crimson' | 'navy' | 'sky';
  align?: 'center' | 'left';
  /** Use on dark (navy/crimson) surfaces to flip text to white. */
  invert?: boolean;
  className?: string;
}

const pillVariant = { crimson: 'accent', navy: 'navy', sky: 'sky' } as const;

/**
 * SectionHeading — the single canonical eyebrow→title→subtitle pattern used
 * across every marketing section, so spacing, sizing, and alignment stay
 * consistent. Title size is fixed (text-3xl/md:text-4xl); use a custom heading
 * only for special moments (e.g. the crisis data hero).
 */
export function SectionHeading({
  kicker,
  title,
  subtitle,
  icon: Icon,
  accent = 'navy',
  align = 'center',
  invert = false,
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl text-left',
        className,
      )}
    >
      <Pill
        variant={invert ? 'ghost' : pillVariant[accent]}
        className={cn('mb-4', invert && 'bg-white/15 text-white')}
      >
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {kicker}
      </Pill>
      <h2
        className={cn(
          'text-heading text-3xl md:text-4xl',
          invert ? 'text-white' : 'text-navy',
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            'mt-4 text-base leading-relaxed',
            invert ? 'text-white/75' : 'text-muted-foreground',
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}
