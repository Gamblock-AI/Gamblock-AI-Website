'use client';

import type { ReactNode } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Clock3,
  LockKeyhole,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DashboardPanel } from '@/components/dashboard/dashboard-page';
import type {
  AnalyticsDay,
  AnalyticsPeriod,
  AnalyticsSummary,
} from '@/hooks/use-analytics';
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
}: {
  summary: AnalyticsSummary;
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  metricsExtra?: ReactNode;
  emptyTitle?: string;
  emptyBody?: string;
}) {
  const t = useTranslations('analyticsDashboard');
  const { totals, daily, hourly } = summary;
  const chartPoints = ensureDailyPoints(daily, period);

  return (
    <section
      className="grid gap-5 xl:grid-cols-12 xl:items-stretch"
      aria-label={t('insightsLabel')}
    >
      <DashboardPanel
        icon={BarChart3}
        title={t('trendTitle')}
        description={t('trendBody')}
        density="compact"
        className="xl:col-span-7"
        contentClassName="flex-1 flex flex-col"
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
                  'min-h-8 rounded-lg px-2.5 text-xs font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-navy/30',
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
      >
        <DailyTrendChart points={chartPoints} />
      </DashboardPanel>

      <DashboardPanel
        icon={Clock3}
        title={t('peakHoursTitle')}
        description={t('peakHoursBody')}
        density="compact"
        className="xl:col-span-5"
        contentClassName="flex-1 flex flex-col"
      >
        <PeakHoursChart hours={hourly} />
      </DashboardPanel>

      <DashboardPanel
        icon={ShieldCheck}
        title={t('metricsTitle')}
        description={t('metricsBody')}
        density="compact"
        className="xl:col-span-12"
        fullHeight={false}
        contentClassName="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        <AnalyticsMetric
          icon={ShieldAlert}
          tone="crimson"
          label={t('metricBlocked')}
          value={totals.blocked}
          body={t('periodSummary', { days: period })}
        />
        <AnalyticsMetric
          icon={ShieldCheck}
          tone="azure"
          label={t('metricInterventions')}
          value={totals.interventions}
          body={t('periodSummary', { days: period })}
        />
        <AnalyticsMetric
          icon={AlertTriangle}
          tone={totals.tamper_events > 0 ? 'amber' : 'navy'}
          attention={totals.tamper_events > 0}
          label={t('metricTamper')}
          value={totals.tamper_events}
          body={t('periodSummary', { days: period })}
        />
        <AnalyticsMetric
          icon={ShieldOff}
          tone={totals.permission_revoked > 0 ? 'amber' : 'navy'}
          attention={totals.permission_revoked > 0}
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

function ensureDailyPoints(
  points: AnalyticsDay[] | undefined,
  days: number
): AnalyticsDay[] {
  if (points && points.length > 0) return points;
  const now = new Date();
  const fallback: AnalyticsDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    fallback.push({
      date: dateStr,
      blocked: 0,
      interventions: 0,
      tamper_events: 0,
      permission_revoked: 0,
    });
  }
  return fallback;
}
