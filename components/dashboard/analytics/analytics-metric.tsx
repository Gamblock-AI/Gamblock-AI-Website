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
    navy: 'bg-navy/10 text-navy',
    sage: 'bg-sage/15 text-sage-dark',
    amber: 'bg-amber/20 text-amber-800',
    crimson: 'bg-crimson/15 text-crimson-dark',
    azure: 'bg-azure text-navy',
  };

  const cardHighlightClasses = {
    navy: 'border-border/80 hover:border-navy/30 bg-card hover:bg-muted/15',
    sage: 'border-border/80 hover:border-sage/40 bg-card hover:bg-muted/15',
    amber: 'border-amber/35 bg-amber/[0.04] hover:border-amber/55',
    crimson: 'border-crimson/30 bg-crimson/[0.03] hover:border-crimson/45',
    azure: 'border-border/80 hover:border-navy/30 bg-card hover:bg-muted/15',
  };

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 rounded-xl border p-3.5 shadow-2xs transition-all duration-200 hover:shadow-xs',
        cardHighlightClasses[effectiveTone],
        className
      )}
    >
      {Icon ? (
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
            iconToneClasses[effectiveTone]
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <p className="text-muted-foreground truncate text-[0.6875rem] font-bold tracking-wider uppercase">
            {label}
          </p>
          {badge ? (
            <span className="rounded-full border border-amber/40 bg-amber/20 px-1.5 py-0.2 text-[0.625rem] font-bold text-amber-900 uppercase">
              {badge}
            </span>
          ) : null}
        </div>

        <p className="text-navy mt-0.5 text-xl font-black tracking-tight tabular-nums sm:text-2xl leading-tight">
          {value}
        </p>

        {body ? (
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            {body}
          </p>
        ) : null}
      </div>
    </div>
  );
}

