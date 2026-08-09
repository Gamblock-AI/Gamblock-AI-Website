'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function AnalyticsMetric({
  label,
  value,
  body,
  attention = false,
  className,
}: {
  label: string;
  value: string | number;
  body?: ReactNode;
  attention?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        attention
          ? 'border-amber/35 bg-amber/[0.08]'
          : 'border-border bg-muted/25',
        className
      )}
    >
      <p className="text-muted-foreground text-xs font-semibold">{label}</p>
      <p className="text-navy mt-2 text-2xl font-extrabold tabular-nums">
        {value}
      </p>
      {body ? (
        <p className="text-muted-foreground mt-1 text-xs leading-5">{body}</p>
      ) : null}
    </div>
  );
}
