import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Check } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export { EmptyLine } from '../../accountability/_components/accountability-shared';

export interface Translation {
  (key: string, values?: Record<string, string | number>): string;
}

export function Info({
  label,
  value,
  icon: Icon,
  className,
  valueClassName,
  tone = 'default',
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  className?: string;
  valueClassName?: string;
  tone?: 'default' | 'sage' | 'amber' | 'azure';
}) {
  const toneClasses = {
    default: 'hover:border-navy/20 hover:bg-muted/30',
    sage: 'border-sage/30 bg-sage/[0.04] hover:border-sage/50',
    amber: 'border-amber/30 bg-amber/[0.04] hover:border-amber/50',
    azure: 'border-navy/20 bg-azure/[0.15] hover:border-navy/35',
  };

  return (
    <div
      className={cn(
        'border-border/80 bg-background/90 group flex items-center gap-3 rounded-xl border p-3 shadow-2xs transition-all duration-200',
        toneClasses[tone],
        className
      )}
    >
      {Icon ? (
        <span className="bg-azure/80 text-navy flex size-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <span className="text-muted-foreground block text-xs font-medium">
          {label}
        </span>
        <span
          className={cn(
            'text-navy mt-0.5 block truncate text-xs font-bold sm:text-sm',
            valueClassName
          )}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

export function StatOverviewCard({
  icon: Icon,
  label,
  value,
  subtitle,
  badge,
  tone = 'navy',
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  badge?: {
    text: string;
    tone?: 'navy' | 'sage' | 'amber' | 'muted';
  };
  tone?: 'navy' | 'sage' | 'amber' | 'azure';
  className?: string;
}) {
  const iconToneClasses = {
    navy: 'bg-navy/10 text-navy',
    sage: 'bg-sage/15 text-sage-dark',
    amber: 'bg-amber/20 text-amber-800',
    azure: 'bg-azure text-navy',
  };

  const cardHighlightClasses = {
    navy: 'border-border/80 hover:border-navy/30 bg-card hover:bg-muted/15',
    sage: 'border-border/80 hover:border-sage/40 bg-card hover:bg-muted/15',
    amber: 'border-amber/35 bg-amber/[0.04] hover:border-amber/55',
    azure: 'border-border/80 hover:border-navy/30 bg-card hover:bg-muted/15',
  };

  const badgeToneClasses = {
    navy: 'border-navy/20 bg-azure/80 text-navy',
    sage: 'border-sage/30 bg-sage/15 text-sage-dark',
    amber: 'border-amber/40 bg-amber/25 text-amber-900',
    muted: 'border-border bg-muted text-muted-foreground',
  };

  return (
    <div
      className={cn(
        'group relative flex items-center gap-3 rounded-xl border p-3 shadow-2xs transition-all duration-200 hover:shadow-xs',
        cardHighlightClasses[tone],
        className
      )}
    >
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
          iconToneClasses[tone]
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <span className="text-muted-foreground truncate text-[0.6875rem] font-bold tracking-wider uppercase">
            {label}
          </span>
          {badge ? (
            <span
              className={cn(
                'shrink-0 rounded-full border px-1.5 py-0.2 text-[0.625rem] font-bold uppercase tracking-wider',
                badgeToneClasses[badge.tone ?? 'muted']
              )}
            >
              {badge.text}
            </span>
          ) : null}
        </div>

        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-navy text-xl font-black tracking-tight sm:text-2xl leading-none">
            {value}
          </span>
          {subtitle ? (
            <span className="text-muted-foreground truncate text-xs font-medium">
              {subtitle}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function RelationshipStep({
  number,
  title,
  body,
}: {
  number: number;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-3">
      <span className="bg-navy flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
        {number}
      </span>
      <span>
        <span className="text-navy block text-sm font-bold">{title}</span>
        <span className="text-muted-foreground mt-1 block text-sm leading-6">
          {body}
        </span>
      </span>
    </li>
  );
}

export function BoundaryItem({
  icon: Icon = Check,
  title,
  children,
  tone = 'default',
  badge,
}: {
  icon?: LucideIcon;
  title?: string;
  children: ReactNode;
  tone?: 'default' | 'highlight' | 'sage';
  badge?: string;
}) {
  const isHighlight = tone === 'highlight' || tone === 'sage';

  return (
    <div
      className={cn(
        'group rounded-xl border p-3 sm:p-3.5 transition-all duration-200',
        isHighlight
          ? 'border-sage/35 bg-sage/[0.08] hover:border-sage/50 hover:bg-sage/[0.12] shadow-2xs'
          : 'border-border/80 bg-background/80 hover:border-navy/20 hover:bg-muted/30 shadow-2xs'
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105',
            isHighlight ? 'bg-sage/20 text-sage-dark' : 'bg-azure/80 text-navy'
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          {title ? (
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  'text-xs font-bold tracking-tight sm:text-sm',
                  isHighlight ? 'text-sage-dark' : 'text-navy'
                )}
              >
                {title}
              </span>
              {badge ? (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wide uppercase',
                    isHighlight
                      ? 'border border-sage/30 bg-sage/20 text-sage-dark'
                      : 'border border-border bg-muted/80 text-muted-foreground'
                  )}
                >
                  {badge}
                </span>
              ) : null}
            </div>
          ) : null}
          <p className="text-foreground/80 mt-0.5 text-xs leading-relaxed sm:text-[0.8125rem]">
            {children}
          </p>
        </div>
      </div>
    </div>
  );
}

export function QuickLink({
  href,
  icon: Icon,
  title,
  body,
  badge,
  badgeTone = 'navy',
  highlight = false,
  compact = false,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  body?: string;
  badge?: string;
  badgeTone?: 'navy' | 'sage' | 'amber';
  highlight?: boolean;
  compact?: boolean;
}) {
  const badgeClasses = {
    navy: 'border-navy/20 bg-azure/90 text-navy font-bold',
    sage: 'border-sage/30 bg-sage/20 text-sage-dark font-bold',
    amber: 'border-amber/40 bg-amber/20 text-amber-900 font-bold animate-pulse',
  };

  if (compact) {
    return (
      <Link
        href={href}
        className={cn(
          'group relative flex items-center justify-between gap-3 rounded-xl border p-2.5 sm:px-3.5 sm:py-2.5 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-navy/30 shadow-2xs hover:shadow-xs motion-reduce:transition-none',
          highlight
            ? 'border-amber/40 bg-gradient-to-r from-amber/[0.06] to-card hover:border-amber/60'
            : 'border-border/80 bg-card hover:border-navy/25 hover:bg-muted/25'
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="bg-azure/85 text-navy flex size-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-navy truncate text-xs font-bold sm:text-sm">
                {title}
              </span>
              {badge ? (
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-1.5 py-0.2 text-[0.625rem]',
                    badgeClasses[badgeTone]
                  )}
                >
                  {badge}
                </span>
              ) : null}
            </div>
            {body ? (
              <p className="text-muted-foreground truncate text-[0.6875rem] leading-tight">
                {body}
              </p>
            ) : null}
          </div>
        </div>

        <ArrowRight
          className="text-muted-foreground size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-navy"
          aria-hidden="true"
        />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex min-h-20 items-start gap-3.5 rounded-2xl border p-4.5 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-navy/30 shadow-2xs hover:shadow-xs motion-reduce:transition-none',
        highlight
          ? 'border-amber/40 bg-gradient-to-br from-amber/[0.04] to-card hover:border-amber/60'
          : 'border-border/80 bg-card hover:border-navy/25 hover:bg-muted/25'
      )}
    >
      <span className="bg-azure/85 text-navy flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-navy block text-sm font-bold sm:text-base">
            {title}
          </span>
          {badge ? (
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[0.6875rem]',
                badgeClasses[badgeTone]
              )}
            >
              {badge}
            </span>
          ) : null}
        </span>
        <span className="text-muted-foreground mt-1 block text-xs leading-5 sm:text-[0.8125rem]">
          {body}
        </span>
      </span>
      <ArrowRight
        className="text-muted-foreground mt-2 size-4.5 shrink-0 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-navy"
        aria-hidden="true"
      />
    </Link>
  );
}

export function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? '-'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
        parsed
      );
}

