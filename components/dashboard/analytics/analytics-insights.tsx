'use client';

import type { ReactNode } from 'react';
import { BarChart3, Clock3, LockKeyhole } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DashboardPanel } from '@/components/dashboard/dashboard-page';
import type { AnalyticsPeriod, AnalyticsSummary } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';
import { AnalyticsMetric } from './analytics-metric';
import { DailyTrendChart } from './daily-trend-chart';
import { PeakHoursChart } from './peak-hours-chart';

const PERIODS: AnalyticsPeriod[] = [14, 30];

export function AnalyticsInsights({
  summary,
  period,
  onPeriodChange,
  metricsExtra,
  emptyTitle,
  emptyBody,
}: {
  summary: AnalyticsSummary;
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  metricsExtra?: ReactNode;
  emptyTitle: string;
  emptyBody: string;
}) {
  const t = useTranslations('analyticsDashboard');
  const { totals, daily, hourly, data_state } = summary;
  const isEmpty = data_state === 'empty' || daily.length === 0;

  return (
    <section
      className="grid gap-5 xl:grid-cols-12 xl:items-stretch"
      aria-label={t('insightsLabel')}
    >
      <DashboardPanel
        icon={BarChart3}
        title={t('trendTitle')}
        description={t('trendBody')}
        action={
          <div
            className="border-border bg-muted/45 inline-flex rounded-xl border p-1"
            role="group"
            aria-label={t('periodToggle')}
          >
            {PERIODS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onPeriodChange(value)}
                aria-pressed={period === value}
                className={cn(
                  'text-navy min-h-9 rounded-lg px-3 text-sm font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-navy/30',
                  period === value
                    ? 'bg-navy text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-navy/[0.06]'
                )}
              >
                {t('periodDays', { days: value })}
              </button>
            ))}
          </div>
        }
        className="xl:col-span-7"
      >
        {isEmpty ? (
          <ChartEmpty title={emptyTitle} body={emptyBody} />
        ) : (
          <DailyTrendChart points={daily} />
        )}
      </DashboardPanel>

      <DashboardPanel
        icon={Clock3}
        title={t('peakHoursTitle')}
        description={t('peakHoursBody')}
        className="xl:col-span-5"
      >
        {isEmpty ? (
          <ChartEmpty title={emptyTitle} body={emptyBody} />
        ) : (
          <PeakHoursChart hours={hourly} />
        )}
      </DashboardPanel>

      <DashboardPanel
        icon={BarChart3}
        title={t('metricsTitle')}
        description={t('metricsBody')}
        className="xl:col-span-12"
        fullHeight={false}
        contentClassName="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <AnalyticsMetric
          label={t('metricBlocked')}
          value={totals.blocked}
          body={t('periodSummary', { days: period })}
        />
        <AnalyticsMetric
          label={t('metricInterventions')}
          value={totals.interventions}
          body={t('periodSummary', { days: period })}
        />
        <AnalyticsMetric
          label={t('metricTamper')}
          value={totals.tamper_events}
          body={t('periodSummary', { days: period })}
        />
        <AnalyticsMetric
          label={t('metricRevoked')}
          value={totals.permission_revoked}
          body={t('periodSummary', { days: period })}
        />
        {metricsExtra}
      </DashboardPanel>

      <p className="text-muted-foreground flex items-start gap-2 text-xs leading-5 xl:col-span-12">
        <LockKeyhole className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        {t('privacyNote')}
      </p>
    </section>
  );
}

function ChartEmpty({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-border bg-muted/25 flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center">
      <BarChart3 className="text-muted-foreground size-6" aria-hidden="true" />
      <p className="text-foreground mt-2 text-sm font-semibold">{title}</p>
      <p className="text-muted-foreground mt-1 text-sm leading-6">{body}</p>
    </div>
  );
}
