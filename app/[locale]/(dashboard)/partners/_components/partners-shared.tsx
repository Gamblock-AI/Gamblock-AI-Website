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
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="border-border/80 bg-background/90 group flex items-center gap-3 rounded-xl border p-3 shadow-2xs transition-all duration-200 hover:border-navy/20 hover:bg-muted/30">
      {Icon ? (
        <span className="bg-azure/80 text-navy flex size-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <span className="text-muted-foreground block text-xs font-medium">
          {label}
        </span>
        <span className="text-navy mt-0.5 block truncate text-xs font-bold sm:text-sm">
          {value}
        </span>
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
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="border-border bg-background hover:border-navy/25 hover:bg-muted/45 focus-visible:ring-navy/30 flex min-h-20 items-start gap-3 rounded-xl border p-4 transition-colors duration-200 outline-none focus-visible:ring-2 motion-reduce:transition-none"
    >
      <span className="bg-azure/75 text-navy flex size-10 shrink-0 items-center justify-center rounded-xl">
        <Icon className="size-[1.125rem]" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-navy block text-sm font-bold">{title}</span>
        <span className="text-muted-foreground mt-1 block text-xs leading-5">
          {body}
        </span>
      </span>
      <ArrowRight
        className="text-muted-foreground mt-2 size-4 shrink-0"
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
