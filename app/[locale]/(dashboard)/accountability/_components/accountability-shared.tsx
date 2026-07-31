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
  title,
  body,
  className,
}: {
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div className={cn('border-border rounded-xl border border-dashed p-4', className)}>
      <p className="text-navy font-semibold">{title}</p>
      <p className="text-muted-foreground mt-1 text-sm leading-6">{body}</p>
    </div>
  );
}
