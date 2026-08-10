import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CircleAlert,
  KeyRound,
  LayoutGrid,
  Settings2,
  ShieldCheck,
  Tickets,
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
            <div className="mb-3.5 flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-amber/15 text-amber-900">
                <AlertTriangle className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h2 id="attention-title" className="text-navy text-lg font-bold">
                  {t('attentionTitle')}
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {t('attentionBody')}
                </p>
              </div>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
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

          <section aria-labelledby="workspace-title" data-tour="tour-admin-workspaces">
            <div className="mb-3.5 flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-azure text-navy">
                <LayoutGrid className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h2
                  id="workspace-title"
                  className="text-navy text-lg font-bold"
                >
                  {t('workspaceTitle')}
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {t('workspaceBody')}
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <WorkspaceLink
                href={ROUTES.ADMIN_CONTENT}
                icon={BookOpen}
                title={t('contentTitle')}
                primaryLabel={t('draftContent')}
                primaryValue={overview.draft_content ?? 0}
                secondaryLabel={t('reviewContent')}
                secondaryValue={overview.review_content ?? 0}
              />
              <WorkspaceLink
                href={ROUTES.ADMIN_TICKETS}
                icon={Tickets}
                title={t('ticketTitle')}
                primaryLabel={t('openTickets')}
                primaryValue={overview.open_support ?? 0}
                secondaryLabel={t('unassignedTickets')}
                secondaryValue={overview.unassigned_support ?? 0}
              />
              <WorkspaceLink
                href={ROUTES.ADMIN_EMERGENCY}
                icon={KeyRound}
                title={t('emergencyTitle')}
                primaryLabel={t('pendingEmergency')}
                primaryValue={overview.pending_emergency ?? 0}
                secondaryLabel={t('dualControl')}
                secondaryValue={t('required')}
              />
              <WorkspaceLink
                href={ROUTES.ADMIN_PLATFORM}
                icon={Settings2}
                title={t('platformTitle')}
                primaryLabel={t('activeAdmins')}
                primaryValue={overview.active_operators ?? 0}
                secondaryLabel={t('visibleSocial')}
                secondaryValue={overview.visible_social_links ?? 0}
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
                  <ProtectedUsersMetric
                    summary={analytics.data ?? platformFallback(period)}
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

function ProtectedUsersMetric({ summary }: { summary: AnalyticsSummary }) {
  const t = useTranslations('analyticsDashboard');
  return (
    <AnalyticsMetric
      icon={ShieldCheck}
      tone="sage"
      label={t('metricProtectedUsers')}
      value={summary.protected_users ?? 0}
      body={t('metricProtectedUsersBody')}
    />
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
        'group relative flex flex-col justify-between rounded-2xl border p-4 shadow-2xs transition-all duration-200',
        needsAttention
          ? 'border-amber/40 bg-gradient-to-br from-amber/[0.08] via-card to-card hover:border-amber/60 hover:shadow-xs'
          : 'border-border/80 bg-card hover:border-navy/20 hover:shadow-2xs'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-xl transition-colors',
            needsAttention
              ? 'bg-amber/20 text-amber-900 ring-1 ring-amber/30'
              : 'bg-muted/60 text-navy'
          )}
        >
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
        {needsAttention ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber/40 bg-amber/15 px-2 py-0.5 text-[0.6875rem] font-bold text-amber-900">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            {t('attentionRequired')}
          </span>
        ) : (
          <span className="text-muted-foreground text-[0.6875rem] font-medium">
            {t('underControl')}
          </span>
        )}
      </div>

      <div className="mt-3.5">
        <p className="text-muted-foreground line-clamp-1 text-xs font-semibold">
          {label}
        </p>
        <div className="mt-1 flex items-baseline justify-between">
          <p
            className={cn(
              'text-2xl font-black tabular-nums tracking-tight',
              needsAttention ? 'text-amber-900' : 'text-navy'
            )}
          >
            {value}
          </p>
          {href ? (
            <span className="text-navy flex items-center gap-1 text-xs font-bold opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {t('openQueue')}
              <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
      >
        {content}
      </Link>
    );
  }
  return content;
}

function WorkspaceLink({
  href,
  icon: Icon,
  title,
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  primaryLabel: string;
  primaryValue: number | string;
  secondaryLabel: string;
  secondaryValue: number | string;
}) {
  const t = useTranslations('adminDashboard');
  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-2xs outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-navy/30 hover:shadow-card focus-visible:ring-2 focus-visible:ring-navy/30"
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-azure/80 text-navy ring-1 ring-navy/10 transition-colors group-hover:bg-navy group-hover:text-white">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="text-navy font-bold text-base leading-snug">
              {title}
            </h3>
          </div>
          <span className="flex size-7 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground transition-all duration-200 group-hover:bg-navy group-hover:text-white">
            <ArrowRight
              className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5 transition-colors group-hover:border-navy/15 group-hover:bg-muted/45">
            <dt className="text-muted-foreground truncate text-[0.6875rem] font-bold tracking-wider uppercase">
              {primaryLabel}
            </dt>
            <dd className="text-navy mt-1 text-base font-black tabular-nums">
              {primaryValue}
            </dd>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5 transition-colors group-hover:border-navy/15 group-hover:bg-muted/45">
            <dt className="text-muted-foreground truncate text-[0.6875rem] font-bold tracking-wider uppercase">
              {secondaryLabel}
            </dt>
            <dd className="text-navy mt-1 text-base font-black tabular-nums">
              {secondaryValue}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs font-bold text-navy transition-colors group-hover:text-navy-light">
        <span>{t('openWorkspace')}</span>
        <span className="text-muted-foreground group-hover:text-navy text-[0.6875rem] font-medium flex items-center gap-1">
          {t('accessWorkspace')} &rarr;
        </span>
      </div>
    </Link>
  );
}
