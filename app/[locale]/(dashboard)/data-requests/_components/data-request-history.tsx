import { CircleAlert, FileClock, RefreshCw } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  DashboardNotice,
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { DataRequestRecord } from '@/hooks/use-data-requests';
import { getRequestStatus } from './request-status';

interface DataRequestHistoryProps {
  requests: DataRequestRecord[];
  loading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function DataRequestHistory({
  requests,
  loading,
  error,
  onRetry,
}: DataRequestHistoryProps) {
  const t = useTranslations('dataRequestsWorkspace');

  return (
    <DashboardPanel
      icon={FileClock}
      title={t('historyTitle')}
      description={t('historyBody')}
      action={
        error ? (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="size-4" aria-hidden="true" />
            {t('retry')}
          </Button>
        ) : undefined
      }
    >
      <DataRequestHistoryContent
        requests={requests}
        loading={loading}
        error={error}
      />
    </DashboardPanel>
  );
}

function DataRequestHistoryContent({
  requests,
  loading,
  error,
}: Omit<DataRequestHistoryProps, 'onRetry'>) {
  const t = useTranslations('dataRequestsWorkspace');
  const locale = useLocale();
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  });

  if (loading) {
    return (
      <div className="space-y-3" role="status">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-2xl" />
        ))}
        <span className="sr-only">{t('loading')}</span>
      </div>
    );
  }
  if (error) {
    return (
      <DashboardNotice
        icon={CircleAlert}
        title={t('errorTitle')}
        tone="amber"
        role="alert"
      >
        {t('errorBody')}
      </DashboardNotice>
    );
  }
  if (requests.length === 0) {
    return (
      <EmptyState
        icon={FileClock}
        title={t('emptyTitle')}
        hint={t('emptyBody')}
        className="bg-muted/55 min-h-48"
      />
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => {
        const status = getRequestStatus(request.status);
        const parsedDate = request.created_at
          ? new Date(request.created_at)
          : null;
        const date =
          parsedDate && !Number.isNaN(parsedDate.getTime())
            ? dateFormatter.format(parsedDate)
            : t('dateUnavailable');
        const type = request.type.toLowerCase().includes('delete')
          ? t('typeDelete')
          : t('typeExport');

        return (
          <article
            key={request.id}
            className="border-border bg-muted/25 grid gap-3 rounded-2xl border p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
          >
            <div className="min-w-0">
              <p className="text-navy text-sm font-bold">{type}</p>
              <p className="text-muted-foreground mt-1 font-mono text-xs">
                {request.id}
              </p>
              <p className="text-muted-foreground mt-2 text-xs">{date}</p>
            </div>
            <DashboardStatus tone={status.tone}>
              {t(`status.${status.key}`)}
            </DashboardStatus>
          </article>
        );
      })}
    </div>
  );
}
