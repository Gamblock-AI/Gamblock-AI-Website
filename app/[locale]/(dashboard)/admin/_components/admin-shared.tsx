import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
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

export function AdminStatusBadge({ status }: { status: string }) {
  const t = useTranslations('dynamicLabels');
  const active = status === 'published' || status === 'resolved';
  return (
    <Badge variant={active ? 'default' : 'secondary'}>
      {t(dynamicLabelKey('status', status), {
        value: dynamicLabelFallback(status),
      })}
    </Badge>
  );
}
