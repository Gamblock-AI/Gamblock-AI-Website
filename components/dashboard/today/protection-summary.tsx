'use client';

import {
  Clock3,
  MonitorSmartphone,
  RefreshCw,
  Settings2,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { ProtectionStatus } from '@/hooks/use-protection-status';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';
import { RECOVERY_TIME_ZONE } from '@/lib/recovery/date';
import { cn } from '@/lib/utils';

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
  const locale = useLocale();
  const healthy =
    status?.mode === 'active' && status.runtime_status === 'connected';
  const formattedLastSync = status?.last_sync
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: RECOVERY_TIME_ZONE,
      }).format(new Date(status.last_sync))
    : t('protectionNeverSynced');

  return (
    <section
      className="border-border bg-card shadow-soft rounded-2xl border p-5"
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
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <span className="sr-only">{t('protectionLoading')}</span>
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
        <>
          <div
            className={cn(
              'mt-4 flex items-start gap-3 rounded-xl border p-4',
              healthy
                ? 'border-sage/30 bg-sage/[0.10]'
                : 'border-amber/35 bg-amber/[0.10]'
            )}
            role="status"
          >
            <span
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-xl',
                healthy ? 'bg-sage text-white' : 'bg-amber text-navy'
              )}
            >
              {healthy ? (
                <ShieldCheck className="size-5" aria-hidden="true" />
              ) : (
                <ShieldAlert className="size-5" aria-hidden="true" />
              )}
            </span>
            <div>
              <p className="text-navy text-sm font-bold">
                {healthy ? t('protectionReady') : t('protectionNeedsAttention')}
              </p>
              <p className="text-muted-foreground mt-1 text-xs leading-5">
                {healthy
                  ? t('protectionReadyBody')
                  : t('protectionNeedsAttentionBody')}
              </p>
            </div>
          </div>

          <dl className="divide-border mt-4 divide-y">
            <div className="flex min-h-12 items-center gap-3 py-2.5">
              <MonitorSmartphone
                className="text-navy/70 size-4 shrink-0"
                aria-hidden="true"
              />
              <dt className="text-muted-foreground min-w-0 flex-1 text-xs font-medium">
                {t('protectionDevices')}
              </dt>
              <dd className="text-foreground text-right text-xs font-semibold">
                {t('protectionDeviceCount', { count: status.device_count })}
              </dd>
            </div>
            <div className="flex min-h-12 items-center gap-3 py-2.5">
              <Clock3
                className="text-navy/70 size-4 shrink-0"
                aria-hidden="true"
              />
              <dt className="text-muted-foreground min-w-0 flex-1 text-xs font-medium">
                {t('protectionLastConnected')}
              </dt>
              <dd className="text-foreground max-w-[58%] text-right text-xs leading-5 font-semibold">
                {formattedLastSync}
              </dd>
            </div>
          </dl>

          <Link
            href={ROUTES.SETTINGS}
            className="border-navy/20 text-navy hover:bg-azure/45 focus-visible:ring-navy/35 mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition-colors outline-none focus-visible:ring-2"
          >
            <Settings2 className="size-4" aria-hidden="true" />
            {t('protectionManage')}
          </Link>
        </>
      )}
    </section>
  );
}
