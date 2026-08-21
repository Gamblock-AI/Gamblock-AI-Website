import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { DashboardStatus } from '@/components/dashboard/dashboard-page';
import { cn } from '@/lib/utils';

export interface Translation {
  (key: string, values?: Record<string, string | number>): string;
}

export function formatDateTime(locale: string, value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
}

export function requestStatusTone(status: string) {
  if (status === 'approved') return 'sage' as const;
  if (status === 'denied') return 'crimson' as const;
  if (status === 'pending') return 'amber' as const;
  return 'muted' as const;
}

export function RequestStatus({
  status,
  children,
}: {
  status: string;
  children: ReactNode;
}) {
  return (
    <DashboardStatus tone={requestStatusTone(status)}>
      {children}
    </DashboardStatus>
  );
}

export function EmptyLine({
  icon: Icon,
  title,
  body,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'border-border/80 bg-muted/20 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center',
        className
      )}
    >
      {Icon ? (
        <span className="border-border/80 bg-card text-muted-foreground/80 flex size-12 items-center justify-center rounded-2xl border shadow-2xs">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      ) : null}
      <p className={cn('text-navy text-sm font-bold', Icon ? 'mt-3' : '')}>
        {title}
      </p>
      {body ? (
        <p className="text-muted-foreground mt-1 max-w-sm text-xs leading-relaxed">
          {body}
        </p>
      ) : null}
    </div>
  );
}
