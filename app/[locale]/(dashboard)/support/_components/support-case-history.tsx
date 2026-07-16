import { CircleHelp, FileWarning, RefreshCw, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardNotice,
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { SupportCaseRecord } from '@/hooks/use-support-request';

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
      {cases.slice(0, 4).map((item) => (
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
              {item.status.replaceAll('_', ' ')}
            </DashboardStatus>
          </div>
          <p className="text-muted-foreground mt-2 font-mono text-[11px]">
            {item.id}
          </p>
        </article>
      ))}
    </div>
  );
}
