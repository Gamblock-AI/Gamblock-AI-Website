'use client';

import {
  ArrowRight,
  CircleHelp,
  FileWarning,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { DashboardPanel } from '@/components/dashboard/dashboard-page';
import { SupportStatusBadge } from '@/components/dashboard/support-status-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useSupportRequest,
  type SupportCaseRecord,
} from '@/hooks/use-support-request';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';
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

function SectionHeading({
  icon: Icon,
  title,
  action,
}: {
  icon: LucideIcon;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="bg-navy flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm">
        <Icon className="size-[1.125rem]" aria-hidden="true" />
      </span>
      <h2 className="text-navy min-w-0 flex-1 text-[0.9375rem] leading-6 font-bold">
        {title}
      </h2>
      {action}
    </div>
  );
}

export function SupportCaseHistory({
  cases,
  loading,
  error,
  onRetry,
}: SupportCaseHistoryProps) {
  const t = useTranslations('supportWorkspace');

  return (
    <aside className="border-border bg-card shadow-soft flex h-full flex-col rounded-2xl border p-5 sm:p-6 xl:col-span-4">
      <section>
        <SectionHeading icon={ShieldCheck} title={t('safeReportTitle')} />
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          {t('safeReportBody')}
        </p>
      </section>

      <section className="border-border mt-5 border-t pt-5">
        <SectionHeading
          icon={FileWarning}
          title={t('historyTitle')}
          action={
            <Link
              href={ROUTES.SUPPORT_HISTORY}
              className="text-navy focus-visible:ring-navy/30 inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm font-bold outline-none hover:underline focus-visible:ring-2"
            >
              {t('historyAll')}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          }
        />
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          {t('historyBody')}
        </p>
        {error ? (
          <Button variant="ghost" size="sm" className="mt-3" onClick={onRetry}>
            <RefreshCw className="size-4" aria-hidden="true" />
            {t('historyRetry')}
          </Button>
        ) : null}
        <div className="mt-4">
          <SupportCaseList
            cases={cases}
            loading={loading}
            error={error}
            maxItems={3}
          />
        </div>
      </section>

      <section className="border-border mt-auto border-t pt-5">
        <SectionHeading icon={CircleHelp} title={t('urgentTitle')} />
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          {t('urgentBody')}
        </p>
        <Link
          href={ROUTES.CONTACT}
          className="border-navy/20 text-navy hover:bg-azure/45 focus-visible:ring-navy/35 mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition-colors outline-none focus-visible:ring-2"
        >
          {t('urgentAction')}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
    </aside>
  );
}

export function SupportCaseList({
  cases,
  loading,
  error,
  maxItems,
}: Omit<SupportCaseHistoryProps, 'onRetry'> & { maxItems?: number }) {
  const t = useTranslations('supportWorkspace');
  const tDynamic = useTranslations('dynamicLabels');
  const locale = useLocale();
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  });

  if (loading) {
    return (
      <div className="space-y-3" role="status">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
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

  const sortedCases = [...cases]
    .sort(
      (left, right) =>
        caseTimestamp(right.created_at) - caseTimestamp(left.created_at)
    )
    .slice(0, maxItems);

  return (
    <div className="divide-border divide-y">
      {sortedCases.map((item) => {
        const parsedDate = item.created_at ? new Date(item.created_at) : null;
        const date =
          parsedDate && !Number.isNaN(parsedDate.getTime())
            ? dateFormatter.format(parsedDate)
            : t('dateUnavailable');
        return (
          <article key={item.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-navy line-clamp-2 text-sm font-bold">
                  {item.title}
                </p>
                <p className="text-muted-foreground mt-1 font-mono text-[11px]">
                  {item.id}
                </p>
              </div>
              <SupportStatusBadge status={item.status} />
            </div>
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
            <Link
              href={`/support/${item.id}`}
              className="text-navy focus-visible:ring-navy/30 mt-2 inline-flex min-h-10 items-center gap-1 rounded-lg text-sm font-semibold outline-none hover:underline focus-visible:ring-2"
            >
              {t('openTicket')}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </article>
        );
      })}
    </div>
  );
}

function caseTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function SupportHistoryPageClient() {
  const t = useTranslations('supportWorkspace');
  const support = useSupportRequest();

  return (
    <DashboardPanel
      icon={FileWarning}
      title={t('historyPageTitle')}
      description={t('historyPageBody')}
      action={
        support.error ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void support.refetch()}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            {t('historyRetry')}
          </Button>
        ) : undefined
      }
    >
      <SupportCaseList
        cases={support.cases}
        loading={support.loading}
        error={support.error}
      />
    </DashboardPanel>
  );
}
