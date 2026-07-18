import { ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import {
  dynamicLabelFallback,
  dynamicLabelKey,
} from '@/lib/i18n/dynamic-labels';

interface AdminHeaderProps {
  title: string;
  description: string;
  role?: string;
}

export function AdminHeader({ title, description, role }: AdminHeaderProps) {
  const t = useTranslations('dynamicLabels');
  return (
    <header className="border-border bg-card shadow-soft flex flex-col gap-3 rounded-3xl border p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-navy flex size-11 items-center justify-center rounded-xl text-white">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-navy text-xl font-bold tracking-tight">
            {title}
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-6">
            {description}
          </p>
        </div>
      </div>
      {role ? (
        <Badge variant="secondary" className="w-fit px-3 py-1.5">
          {t(dynamicLabelKey('role', role), {
            value: dynamicLabelFallback(role),
          })}
        </Badge>
      ) : null}
    </header>
  );
}
