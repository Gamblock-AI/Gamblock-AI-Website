'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AnalyticsMetric({
  label,
  value,
  body,
  icon: Icon,
  tone = 'navy',
  attention = false,
  badge,
  className,
}: {
  label: string;
  value: string | number;
  body?: ReactNode;
  icon?: LucideIcon;
  tone?: 'navy' | 'sage' | 'amber' | 'crimson' | 'azure';
  attention?: boolean;
  badge?: string;
  className?: string;
}) {
  const effectiveTone = attention ? 'amber' : tone;

  const iconToneClasses = {
    navy: 'bg-navy/10 text-navy ring-1 ring-navy/15',
    sage: 'bg-sage/15 text-sage-dark ring-1 ring-sage/25',
    amber: 'bg-amber/20 text-amber-900 ring-1 ring-amber/30',
    crimson: 'bg-crimson/15 text-crimson-dark ring-1 ring-crimson/25',
    azure: 'bg-azure text-navy ring-1 ring-navy/10',
  };

  const valueToneClasses = {
    navy: 'text-navy',
    sage: 'text-sage-dark',
    amber: 'text-amber-900',
    crimson: 'text-crimson-dark',
    azure: 'text-navy',
  };

  const cardHighlightClasses = {
    navy: 'border-border/80 hover:border-navy/30 bg-card hover:bg-muted/10',
    sage: 'border-border/80 hover:border-sage/40 bg-card hover:bg-muted/10',
    amber: 'border-amber/35 bg-gradient-to-br from-amber/[0.06] via-card to-card hover:border-amber/55',
    crimson: 'border-crimson/30 bg-gradient-to-br from-crimson/[0.04] via-card to-card hover:border-crimson/50',
    azure: 'border-border/80 hover:border-navy/30 bg-card hover:bg-muted/10',
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-xl border p-3.5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card',
        cardHighlightClasses[effectiveTone],
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          {Icon ? (
            <span
              className={cn(
                'flex size-8.5 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105 shadow-2xs',
                iconToneClasses[effectiveTone]
              )}
            >
              <Icon className="size-4.5" aria-hidden="true" />
            </span>
          ) : null}

          <div className="flex items-center gap-2">
            {badge ? (
              <span className="rounded-full border border-amber/40 bg-amber/20 px-1.5 py-0.5 text-[0.5625rem] font-bold text-amber-900 uppercase shadow-2xs">
                {badge}
              </span>
            ) : null}
            <span
              className={cn(
                'text-2xl sm:text-3xl font-black tabular-nums tracking-tight leading-none',
                valueToneClasses[effectiveTone]
              )}
            >
              {value}
            </span>
          </div>
        </div>

        <p className="text-navy mt-2.5 line-clamp-1 text-xs font-bold uppercase tracking-wider">
          {label}
        </p>
      </div>

      {body ? (
        <p className="text-muted-foreground mt-1 text-[0.6875rem] leading-tight line-clamp-1">
          {body}
        </p>
      ) : null}
    </div>
  );
}

