import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { useTranslations } from 'next-intl';
import {
  dynamicLabelFallback,
  dynamicLabelKey,
} from '@/lib/i18n/dynamic-labels';

export const adminFieldClassName =
  'min-h-11 w-full rounded-xl border border-input bg-card px-3 text-base outline-none transition-[border-color,box-shadow] duration-200 focus:border-navy/40 focus:ring-2 focus:ring-navy/30 motion-reduce:transition-none sm:text-sm';

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
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`space-y-2 ${className ?? ''}`}>
      <span className="text-navy text-xs font-bold">{label}</span>
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
}: {
  colSpan: number;
  text: string;
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="text-muted-foreground h-28 text-center"
      >
        {text}
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
