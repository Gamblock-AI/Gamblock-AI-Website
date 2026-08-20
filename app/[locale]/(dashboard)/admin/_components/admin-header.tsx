import type { LucideIcon } from 'lucide-react';
import { ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  dynamicLabelFallback,
  dynamicLabelKey,
} from '@/lib/i18n/dynamic-labels';

interface AdminHeaderProps {
  title: string;
  description: string;
  role?: string;
  icon?: LucideIcon;
}

export function AdminHeader({
  title,
  description,
  role,
  icon: Icon = ShieldCheck,
}: AdminHeaderProps) {
  const t = useTranslations('dynamicLabels');
  return (
    <header className="border-border bg-card shadow-soft flex flex-col gap-3 rounded-2xl border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex items-center gap-3">
        <div className="bg-navy/5 text-navy ring-1 ring-navy/10 flex size-10 shrink-0 items-center justify-center rounded-xl">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className="text-navy text-base font-bold tracking-tight leading-snug sm:text-lg">
            {title}
          </h1>
          <p className="text-muted-foreground mt-0.5 max-w-2xl text-xs leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      {role ? (
        <span className="border-navy/20 bg-navy/5 text-navy inline-flex w-fit shrink-0 items-center rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase">
          {t(dynamicLabelKey('role', role), {
            value: dynamicLabelFallback(role),
          })}
        </span>
      ) : null}
    </header>
  );
}
