import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CircleAlert,
  KeyRound,
  ShieldCheck,
  Tickets,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AdminVerificationCard } from '@/components/dashboard/admin-verification-card';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminTour } from '@/components/dashboard/tour/admin-tour';
import { useAdminOperations } from '@/hooks/use-admin-operations';
import {
  usePlatformAnalytics,
  type AnalyticsPeriod,
  type AnalyticsSummary,
} from '@/hooks/use-analytics';
import { useLocalUser } from '@/hooks/use-local-user';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { AnalyticsInsights } from './analytics/analytics-insights';
import { AnalyticsMetric } from './analytics/analytics-metric';

export function AdminDashboard({ name }: { name: string }) {
  const t = useTranslations('adminDashboard');
  const user = useLocalUser();
  const verified = Boolean(user.phone_verified_at);
  const [period, setPeriod] = useState<AnalyticsPeriod>(14);
  const operations = useAdminOperations(
    verified ? user.role : undefined,
    'overview'
  );
  const overview = operations.overview;
  const analytics = usePlatformAnalytics(period, verified);

  return (
    <DashboardPage>
      <div data-tour="tour-admin-welcome">
        <DashboardPageHeader
          icon={ShieldCheck}
          eyebrow={t('eyebrow')}
          title={t('title', { name: name || t('defaultName') })}
          description={t('description')}
          aside={<DashboardStatus tone="navy">{t('role')}</DashboardStatus>}
        />
      </div>

      {!verified ? (
        <AdminVerificationCard />
      ) : operations.loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" role="status">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
          <span className="sr-only">{t('loading')}</span>
        </div>
      ) : operations.error || !overview ? (
        <DashboardNotice
          icon={CircleAlert}
          title={t('errorTitle')}
          tone="amber"
          role="alert"
          action={
            <Button variant="outline" onClick={() => void operations.refetch()}>
              {t('retry')}
            </Button>
          }
        >
          {t('errorBody')}
        </DashboardNotice>
      ) : (
        <>
          <section aria-labelledby="attention-title" data-tour="tour-admin-attention">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-amber/15 text-amber-900">
                <AlertTriangle className="size-3.5" aria-hidden="true" />
              </span>
              <div>
                <h2 id="attention-title" className="text-navy text-base font-bold">
                  {t('attentionTitle')}
                </h2>
                <p className="text-muted-foreground text-xs">
                  {t('attentionBody')}
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <AttentionMetric
                icon={BookOpen}
                label={t('reviewContent')}
                value={overview.review_content ?? 0}
                href={ROUTES.ADMIN_CONTENT}
              />
              <AttentionMetric
                icon={Tickets}
                label={t('unassignedTickets')}
                value={overview.unassigned_support ?? 0}
                href={ROUTES.ADMIN_TICKETS}
              />
              <AttentionMetric
                icon={AlertTriangle}
                label={t('failedData')}
                value={overview.failed_data_requests ?? 0}
                href={ROUTES.DATA_REQUESTS}
              />
              <AttentionMetric
                icon={KeyRound}
                label={t('pendingEmergency')}
                value={overview.pending_emergency ?? 0}
                href={ROUTES.ADMIN_EMERGENCY}
              />
            </div>
          </section>

          <section aria-labelledby="platform-analytics-title" data-tour="tour-admin-analytics">
            <div className="mb-3 flex items-center gap-3">
              <span className="bg-azure text-navy flex size-9 items-center justify-center rounded-lg">
                <BarChart3 className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h2
                  id="platform-analytics-title"
                  className="text-navy text-lg font-bold"
                >
                  {t('analyticsTitle')}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {t('analyticsBody')}
                </p>
              </div>
            </div>
            {analytics.error ? (
              <DashboardNotice
                icon={CircleAlert}
                title={t('errorTitle')}
                tone="amber"
                role="alert"
                action={
                  <Button
                    variant="outline"
                    onClick={() => void analytics.refetch()}
                  >
                    {t('retry')}
                  </Button>
                }
              >
                {t('errorBody')}
              </DashboardNotice>
            ) : analytics.loading ? (
              <div className="grid gap-4 xl:grid-cols-12" role="status">
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton
                    key={index}
                    className="xl:col-span-6 h-56 rounded-2xl"
                  />
                ))}
                <span className="sr-only">{t('loading')}</span>
              </div>
            ) : (
              <AnalyticsInsights
                summary={analytics.data ?? platformFallback(period)}
                period={period}
                onPeriodChange={setPeriod}
                emptyTitle={t('analyticsEmptyTitle')}
                emptyBody={t('analyticsEmptyBody')}
                metricsExtra={
                  <AdminMetricsExtra
                    summary={analytics.data ?? platformFallback(period)}
                    activeOperators={overview.active_operators ?? 0}
                  />
                }
              />
            )}
          </section>
        </>
      )}
      <AdminTour />
    </DashboardPage>
  );
}

function platformFallback(period: AnalyticsPeriod): AnalyticsSummary {
  return {
    period_days: period,
    totals: { blocked: 0, interventions: 0, tamper_events: 0, permission_revoked: 0 },
    daily: [],
    hourly: [],
    data_state: 'empty',
    member_count: 0,
    shared_member_count: 0,
    protected_users: 0,
  };
}

function AdminMetricsExtra({
  summary,
  activeOperators,
}: {
  summary: AnalyticsSummary;
  activeOperators: number;
}) {
  const t = useTranslations('adminDashboard');
  const tAnalytics = useTranslations('analyticsDashboard');
  return (
    <>
      <AnalyticsMetric
        icon={ShieldCheck}
        tone="sage"
        label={tAnalytics('metricProtectedUsers')}
        value={summary.protected_users ?? 0}
        body={tAnalytics('metricProtectedUsersBody')}
      />
      <AnalyticsMetric
        icon={Users}
        tone="navy"
        label={t('activeAdmins')}
        value={activeOperators}
        body={t('activeAdminsBody')}
      />
    </>
  );
}

function AttentionMetric({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  href?: string;
}) {
  const t = useTranslations('adminDashboard');
  const needsAttention = value > 0;
  const content = (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-xl border p-4 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card',
        needsAttention
          ? 'border-amber/40 bg-gradient-to-br from-amber/[0.08] via-card to-card hover:border-amber/60'
          : 'border-border/80 bg-card hover:border-navy/30'
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'flex size-9 items-center justify-center rounded-lg transition-colors',
              needsAttention
                ? 'bg-amber/20 text-amber-900 ring-1 ring-amber/30'
                : 'bg-azure/80 text-navy ring-1 ring-navy/10 group-hover:bg-navy group-hover:text-white'
            )}
          >
            <Icon className="size-4.5" aria-hidden="true" />
          </span>
          <div className="flex items-center gap-2">
            {needsAttention ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber/40 bg-amber/15 px-2 py-0.5 text-[0.625rem] font-bold text-amber-900 shadow-2xs">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                {t('attentionRequired')}
              </span>
            ) : null}
            <span
              className={cn(
                'text-2xl sm:text-3xl font-black tabular-nums tracking-tight leading-none',
                needsAttention ? 'text-amber-900' : 'text-navy'
              )}
            >
              {value}
            </span>
          </div>
        </div>

        <p className="text-navy mt-3 line-clamp-1 text-xs sm:text-[0.8125rem] font-bold">
          {label}
        </p>
      </div>

      {href ? (
        <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-[0.6875rem] font-semibold text-muted-foreground transition-colors group-hover:text-navy">
          <span>{t('openQueue')}</span>
          <ArrowRight
            className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-navy/30 block"
      >
        {content}
      </Link>
    );
  }
  return content;
}
