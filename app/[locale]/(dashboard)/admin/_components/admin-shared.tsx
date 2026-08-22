import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TableCell, TableRow } from '@/components/ui/table';
import { OptionalMark, RequiredMark } from '@/components/common/form-field';
import { cn } from '@/lib/utils';
import {
  dynamicLabelFallback,
  dynamicLabelKey,
} from '@/lib/i18n/dynamic-labels';

export const adminFieldClassName =
  'min-h-11 w-full rounded-xl border border-input bg-card px-3 text-base outline-none transition-[border-color,box-shadow] duration-200 focus-visible:border-navy/40 focus-visible:ring-2 focus-visible:ring-navy/30 motion-reduce:transition-none sm:text-sm';

export function AdminSectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-border bg-card shadow-soft flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div>
        <h2 className="text-navy text-base font-bold">{title}</h2>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-6">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

export function AdminFormField({
  label,
  help,
  required,
  optional,
  optionalText,
  className,
  children,
}: {
  label: string;
  help?: string;
  required?: boolean;
  optional?: boolean;
  optionalText?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <span className="text-navy flex items-center text-xs font-bold">
        <span>{label}</span>
        {required ? <RequiredMark /> : null}
        {optional ? <OptionalMark text={optionalText} /> : null}
      </span>
      {help ? (
        <span className="text-muted-foreground block text-xs leading-normal">
          {help}
        </span>
      ) : null}
      {children}
    </label>
  );
}

export function AdminTableShell({ children }: { children: ReactNode }) {
  return (
    <div className="border-border bg-card overflow-hidden rounded-2xl border">
      {children}
    </div>
  );
}

export function AdminEmptyTable({
  colSpan,
  text,
  description,
  icon: Icon,
  className,
}: {
  colSpan: number;
  text: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={colSpan}
        className={cn('!p-0 text-center select-none whitespace-normal', className)}
      >
        <div className="flex flex-col items-center justify-center gap-3.5 py-10 sm:py-14 px-4 w-full text-center">
          {Icon ? (
            <span className="bg-navy/5 text-navy flex size-12 items-center justify-center rounded-2xl ring-1 ring-navy/10">
              <Icon className="size-6" aria-hidden="true" />
            </span>
          ) : null}
          <div className="space-y-1.5 max-w-md mx-auto text-center">
            <p className="text-navy text-sm font-bold text-center">{text}</p>
            {description ? (
              <p className="text-muted-foreground text-xs leading-relaxed text-center">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

const statusBadgeStyles: Record<string, string> = {
  // Published / Active / Success / Resolved (Sage / Emerald Green)
  published:
    'border-sage/40 bg-sage/15 text-sage-dark dark:bg-sage/25 dark:text-sage-light dark:border-sage/40',
  active:
    'border-sage/40 bg-sage/15 text-sage-dark dark:bg-sage/25 dark:text-sage-light dark:border-sage/40',
  approved:
    'border-sage/40 bg-sage/15 text-sage-dark dark:bg-sage/25 dark:text-sage-light dark:border-sage/40',
  resolved:
    'border-sage/40 bg-sage/15 text-sage-dark dark:bg-sage/25 dark:text-sage-light dark:border-sage/40',
  completed:
    'border-sage/40 bg-sage/15 text-sage-dark dark:bg-sage/25 dark:text-sage-light dark:border-sage/40',

  // Draft / New (Azure / Navy / Neutral)
  draft:
    'border-navy/20 bg-azure/85 text-navy dark:bg-navy/35 dark:text-sky-light dark:border-navy/40',

  // In Review / Pending / In Progress (Amber / Warm Orange)
  in_review:
    'border-amber/40 bg-amber/15 text-amber-900 dark:bg-amber/25 dark:text-amber-300 dark:border-amber/40',
  pending:
    'border-amber/40 bg-amber/15 text-amber-900 dark:bg-amber/25 dark:text-amber-300 dark:border-amber/40',
  waiting_internal:
    'border-amber/40 bg-amber/15 text-amber-900 dark:bg-amber/25 dark:text-amber-300 dark:border-amber/40',
  processing:
    'border-amber/40 bg-amber/15 text-amber-900 dark:bg-amber/25 dark:text-amber-300 dark:border-amber/40',
  queued:
    'border-amber/40 bg-amber/15 text-amber-900 dark:bg-amber/25 dark:text-amber-300 dark:border-amber/40',

  // Archived / Closed / Paused / Rolled back (Muted / Slate Gray)
  archived:
    'border-border/90 bg-muted text-muted-foreground dark:bg-muted/50 dark:text-muted-foreground',
  closed:
    'border-border/90 bg-muted text-muted-foreground dark:bg-muted/50 dark:text-muted-foreground',
  paused:
    'border-border/90 bg-muted text-muted-foreground dark:bg-muted/50 dark:text-muted-foreground',
  rolled_back:
    'border-border/90 bg-muted text-muted-foreground dark:bg-muted/50 dark:text-muted-foreground',

  // Waiting user / Action needed (Sky / Cyan Blue)
  waiting_user:
    'border-sky/40 bg-sky/20 text-navy-dark dark:bg-sky/25 dark:text-sky-light dark:border-sky/40',
  pending_confirmation:
    'border-sky/40 bg-sky/20 text-navy-dark dark:bg-sky/25 dark:text-sky-light dark:border-sky/40',

  // Rejected / Failed / Cancelled / Revoked (Crimson / Red)
  rejected:
    'border-crimson/30 bg-crimson/15 text-crimson-dark dark:bg-crimson/25 dark:text-crimson-light dark:border-crimson/40',
  failed:
    'border-crimson/30 bg-crimson/15 text-crimson-dark dark:bg-crimson/25 dark:text-crimson-light dark:border-crimson/40',
  cancelled:
    'border-crimson/30 bg-crimson/15 text-crimson-dark dark:bg-crimson/25 dark:text-crimson-light dark:border-crimson/40',
  revoked:
    'border-crimson/30 bg-crimson/15 text-crimson-dark dark:bg-crimson/25 dark:text-crimson-light dark:border-crimson/40',
};

export function AdminStatusBadge({
  status,
  className,
  size = 'default',
}: {
  status: string;
  className?: string;
  size?: 'sm' | 'default';
}) {
  const t = useTranslations('dynamicLabels');
  const normalized = status.toLowerCase().trim();
  const colorClass =
    statusBadgeStyles[normalized] ??
    'border-border/80 bg-muted text-muted-foreground';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-bold transition-colors select-none shadow-2xs backdrop-blur-xs whitespace-nowrap shrink-0',
        size === 'sm'
          ? 'px-2 py-0.5 text-[0.625rem] leading-tight'
          : 'px-2.5 py-0.5 text-xs',
        colorClass,
        className
      )}
    >
      {t(dynamicLabelKey('status', status), {
        value: dynamicLabelFallback(status),
      })}
    </span>
  );
}

const priorityBadgeStyles: Record<string, string> = {
  urgent:
    'border-crimson/30 bg-crimson/15 text-crimson-dark dark:bg-crimson/25 dark:text-crimson-light dark:border-crimson/40',
  high:
    'border-amber/40 bg-amber/15 text-amber-900 dark:bg-amber/25 dark:text-amber-300 dark:border-amber/40',
  normal:
    'border-sky/40 bg-sky/15 text-navy-dark dark:bg-sky/25 dark:text-sky-light dark:border-sky/40',
  medium:
    'border-sky/40 bg-sky/15 text-navy-dark dark:bg-sky/25 dark:text-sky-light dark:border-sky/40',
  low:
    'border-border/90 bg-muted/60 text-muted-foreground dark:bg-muted/40 dark:text-muted-foreground',
};

export function AdminPriorityBadge({
  priority,
  className,
  size = 'default',
}: {
  priority: string;
  className?: string;
  size?: 'sm' | 'default';
}) {
  const t = useTranslations('dynamicLabels');
  const normalized = priority.toLowerCase().trim();
  const colorClass =
    priorityBadgeStyles[normalized] ??
    'border-border/80 bg-muted text-muted-foreground';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-bold transition-colors select-none shadow-2xs backdrop-blur-xs whitespace-nowrap shrink-0',
        size === 'sm'
          ? 'px-2 py-0.5 text-[0.625rem] leading-tight'
          : 'px-2.5 py-0.5 text-xs',
        colorClass,
        className
      )}
    >
      {t(dynamicLabelKey('priority', priority), {
        value: dynamicLabelFallback(priority),
      })}
    </span>
  );
}
