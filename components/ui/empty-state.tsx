import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Reusable empty-state for lists (members, approval history, data requests, …).
// Shows an icon, a title, an optional hint, and an optional action. Kept centered and elevated.
export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'border-border/80 bg-card shadow-soft flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed p-6 sm:p-8 text-center',
        className
      )}
    >
      {Icon ? (
        <span className="border-border/80 bg-muted/40 text-muted-foreground/80 flex size-12 items-center justify-center rounded-2xl border shadow-2xs">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      ) : null}
      <p className={cn('text-navy text-sm font-bold', Icon ? 'mt-3' : '')}>
        {title}
      </p>
      {hint ? (
        <p className="text-muted-foreground mt-1 max-w-sm text-xs leading-relaxed">
          {hint}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
