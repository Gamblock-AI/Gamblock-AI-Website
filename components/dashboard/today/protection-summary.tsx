'use client';

import { Cpu, FileKey2, RefreshCw, ShieldCheck, TimerReset } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ProtectionStatus } from '@/hooks/use-protection-status';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectionSummaryProps {
  status: ProtectionStatus | null;
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
}

export function ProtectionSummary({
  status,
  loading,
  error,
  onRetry,
}: ProtectionSummaryProps) {
  const t = useTranslations('recoveryDashboard');

  const rows = status
    ? [
        { label: t('protectionMode'), value: status.mode, icon: ShieldCheck },
        { label: t('protectionRuntime'), value: status.runtime_status, icon: Cpu },
        { label: t('protectionRules'), value: status.ruleset_version, icon: FileKey2 },
        { label: t('protectionModel'), value: status.model_version, icon: Cpu },
        { label: t('protectionLastSync'), value: status.last_sync, icon: TimerReset },
      ]
    : [];

  return (
    <section
      className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft"
      aria-labelledby="protection-summary-title"
    >
      <div>
        <h2 id="protection-summary-title" className="text-base font-bold text-navy">
          {t('protectionTitle')}
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {t('protectionDescription')}
        </p>
      </div>

      {loading ? (
        <div className="mt-4 space-y-3" role="status">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
          <span className="sr-only">{t('missionLoading')}</span>
        </div>
      ) : error || !status ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border p-4">
          <p className="text-sm leading-6 text-muted-foreground">
            {t('protectionUnavailable')}
          </p>
          <Button variant="outline" className="mt-3 h-11" onClick={onRetry}>
            <RefreshCw className="size-4" aria-hidden="true" />
            {t('protectionRetry')}
          </Button>
        </div>
      ) : (
        <dl className="mt-4 divide-y divide-border">
          {rows.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex min-h-12 items-center gap-3 py-2.5">
              <Icon className="size-4 shrink-0 text-navy/70" aria-hidden="true" />
              <dt className="min-w-0 flex-1 text-xs font-medium text-muted-foreground">
                {label}
              </dt>
              <dd className="max-w-[55%] text-right text-xs leading-5 font-semibold text-foreground">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
