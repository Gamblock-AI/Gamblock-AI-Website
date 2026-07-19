import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Check } from 'lucide-react';
import { Link } from '@/i18n/routing';

export interface Translation {
  (key: string, values?: Record<string, string | number>): string;
}

export function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/45 rounded-lg px-3 py-2">
      <span className="text-muted-foreground block">{label}</span>
      <span className="text-navy mt-1 block font-semibold">{value}</span>
    </div>
  );
}

export function EmptyLine({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-border rounded-xl border border-dashed p-4">
      <p className="text-navy font-semibold">{title}</p>
      <p className="text-muted-foreground mt-1 text-sm leading-6">{body}</p>
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

export function BoundaryItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm leading-6">
      <span className="bg-sage/15 text-sage mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
        <Check className="size-3" aria-hidden="true" />
      </span>
      <span className="text-foreground">{children}</span>
    </li>
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
