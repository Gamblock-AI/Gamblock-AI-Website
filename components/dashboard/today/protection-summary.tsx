'use client';

import {
  Cpu,
  FileKey2,
  RefreshCw,
  ShieldCheck,
  TimerReset,
} from 'lucide-react';
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
  const formattedLastSync = status?.last_sync
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(status.last_sync))
    : t('protectionNeverSynced');
  const modeLabel =
    status?.mode === 'active' ? t('protectionActive') : t('protectionInactive');
  const runtimeLabel =
    status?.runtime_status === 'connected'
      ? t('protectionConnected')
      : t('protectionNotConnected');

  const rows = status
    ? [
        { label: t('protectionMode'), value: modeLabel, icon: ShieldCheck },
        { label: t('protectionRuntime'), value: runtimeLabel, icon: Cpu },
        {
          label: t('protectionRules'),
          value: status.ruleset_version || t('protectionNotAvailable'),
          icon: FileKey2,
        },
        {
          label: t('protectionModel'),
          value: status.model_version || t('protectionNotAvailable'),
          icon: Cpu,
        },
        {
          label: t('protectionLastSync'),
          value: formattedLastSync,
          icon: TimerReset,
        },
      ]
    : [];

  return (
    <section
      className="rounded-3xl border border-border bg-card p-5 shadow-soft"
      aria-labelledby="protection-summary-title"
    >
      <div>
        <h2
          id="protection-summary-title"
          className="text-navy text-base font-bold"
        >
          {t('protectionTitle')}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm leading-6">
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
        <div className="border-border mt-4 rounded-2xl border border-dashed p-4">
          <p className="text-muted-foreground text-sm leading-6">
            {t('protectionUnavailable')}
          </p>
          <Button variant="outline" className="mt-3 h-11" onClick={onRetry}>
            <RefreshCw className="size-4" aria-hidden="true" />
            {t('protectionRetry')}
          </Button>
        </div>
      ) : (
        <dl className="divide-border mt-4 divide-y">
          {rows.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex min-h-12 items-center gap-3 py-2.5"
            >
              <Icon
                className="text-navy/70 size-4 shrink-0"
                aria-hidden="true"
              />
              <dt className="text-muted-foreground min-w-0 flex-1 text-xs font-medium">
                {label}
              </dt>
              <dd className="text-foreground max-w-[55%] text-right text-xs leading-5 font-semibold">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
