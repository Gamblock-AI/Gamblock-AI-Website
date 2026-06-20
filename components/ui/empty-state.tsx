import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Reusable empty-state for lists (members, approval history, data requests, …).
// Shows an icon, a title, and an optional hint. Kept centered and muted.
export function EmptyState({
  icon: Icon,
  title,
  hint,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center',
        className
      )}
    >
      {Icon ? <Icon className="mb-3 h-7 w-7 text-muted-foreground/60" /> : null}
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
