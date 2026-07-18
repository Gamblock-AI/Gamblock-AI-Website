import { CircleHelp, FileWarning, RefreshCw, ShieldCheck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  DashboardNotice,
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { SupportCaseRecord } from '@/hooks/use-support-request';
import {
  dynamicLabelFallback,
  dynamicLabelKey,
} from '@/lib/i18n/dynamic-labels';

interface SupportCaseHistoryProps {
  cases: SupportCaseRecord[];
  loading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function SupportCaseHistory({
  cases,
  loading,
  error,
  onRetry,
}: SupportCaseHistoryProps) {
  const t = useTranslations('supportWorkspace');

  return (
    <aside className="space-y-5 xl:col-span-4">
      <DashboardNotice icon={ShieldCheck} title={t('safeReportTitle')}>
        {t('safeReportBody')}
      </DashboardNotice>
      <DashboardPanel
        icon={FileWarning}
        title={t('historyTitle')}
        description={t('historyBody')}
        action={
          error ? (
            <Button variant="ghost" size="sm" onClick={onRetry}>
              <RefreshCw className="size-4" aria-hidden="true" />
              {t('historyRetry')}
            </Button>
          ) : undefined
        }
      >
        <SupportCaseHistoryContent
          cases={cases}
          loading={loading}
          error={error}
        />
      </DashboardPanel>
      <DashboardPanel
        icon={CircleHelp}
        title={t('urgentTitle')}
        description={t('urgentBody')}
      />
    </aside>
  );
}

function SupportCaseHistoryContent({
  cases,
  loading,
  error,
}: Omit<SupportCaseHistoryProps, 'onRetry'>) {
  const t = useTranslations('supportWorkspace');
  const tDynamic = useTranslations('dynamicLabels');
  const locale = useLocale();
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  });

  if (loading) {
    return (
      <div className="space-y-3" role="status">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <span className="sr-only">{t('historyLoading')}</span>
      </div>
    );
  }
  if (error) {
    return (
      <p className="text-muted-foreground text-sm leading-6">
        {t('historyError')}
      </p>
    );
  }
  if (cases.length === 0) {
    return (
      <p className="text-muted-foreground text-sm leading-6">
        {t('historyBoundary')}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {cases.slice(0, 4).map((item) => {
        const parsedDate = item.created_at ? new Date(item.created_at) : null;
        const date =
          parsedDate && !Number.isNaN(parsedDate.getTime())
            ? dateFormatter.format(parsedDate)
            : t('dateUnavailable');
        const labelValues = { value: dynamicLabelFallback(item.status) };
        return (
          <article
            key={item.id}
            className="border-border bg-muted/55 rounded-2xl border p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-navy line-clamp-2 text-sm font-bold">
                {item.title}
              </p>
              <DashboardStatus
                tone={
                  item.status === 'resolved' || item.status === 'closed'
                    ? 'sage'
                    : 'amber'
                }
              >
                {tDynamic(
                  dynamicLabelKey('supportStatus', item.status),
                  labelValues
                )}
              </DashboardStatus>
            </div>
            <p className="text-muted-foreground mt-2 font-mono text-[11px]">
              {item.id}
            </p>
            <p className="text-muted-foreground mt-2 text-xs leading-5">
              {tDynamic(dynamicLabelKey('supportType', item.type), {
                value: dynamicLabelFallback(item.type),
              })}
              {' · '}
              {tDynamic(dynamicLabelKey('priority', item.priority), {
                value: dynamicLabelFallback(item.priority),
              })}
              {' · '}
              {date}
            </p>
          </article>
        );
      })}
    </div>
  );
}
