'use client';

import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  CircleAlert,
  FolderKanban,
  Handshake,
  MessageCircleHeart,
  ShieldAlert,
  UserCheck,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccountability } from '@/hooks/use-accountability';
import {
  usePartnerAnalytics,
  type AnalyticsPeriod,
  type AnalyticsSummary,
} from '@/hooks/use-analytics';
import { useQueryFilterInput } from '@/hooks/use-query-filter-input';
import { useQueryFilters } from '@/hooks/use-query-filters';
import { useQueryTab } from '@/hooks/use-query-tab';
import { cn } from '@/lib/utils';
import { DASHBOARD_QUERY_KEYS } from '@/routes';
import { AnalyticsInsights } from './analytics/analytics-insights';
import { AnalyticsMetric } from './analytics/analytics-metric';
import { PartnerAnalyticsPanel } from './partner-analytics-panel';
import { PartnerTour } from './tour/partner-tour';

interface PartnerDashboardProps {
  name: string;
}

const liveMemberStatuses = new Set([
  'active',
  'leave_pending',
  'support_review',
  'safety_suspended',
]);

export function PartnerDashboard({ name }: PartnerDashboardProps) {
  const t = useTranslations('partnerDashboard');
  const { filters, setFilter } = useQueryFilters({
    resourceKey: 'analyticsMembers',
    filterKeys: ['q', 'group'],
    defaultValues: { q: '', group: 'all' },
    pageKey: DASHBOARD_QUERY_KEYS.pages.analyticsMembers,
    removeKeys: ['q', 'group'],
  });
  const queryInput = useQueryFilterInput({
    resourceKey: 'analyticsMembers',
    pageKey: DASHBOARD_QUERY_KEYS.pages.analyticsMembers,
    removeKeys: ['q'],
  });
  const { value: period, setValue: setPeriod } = useQueryTab<AnalyticsPeriod>({
    queryKey: DASHBOARD_QUERY_KEYS.analyticsPeriod,
    values: [14, 30],
    defaultValue: 14,
    resetKeys: [DASHBOARD_QUERY_KEYS.pages.analyticsMembers],
    history: 'push',
  });
  const selectedGroupID = filters.group;
  const searchQuery = queryInput.value;
  const handleSearchChange = queryInput.onChange;
  const handleGroupChange = (groupID: string) =>
    setFilter('group', groupID);

  const handlePeriodChange = (nextPeriod: AnalyticsPeriod) => {
    setPeriod(nextPeriod);
  };

  const accountability = useAccountability();
  const activeGroups = accountability.workspace.groups.filter(
    (group) => group.status === 'active'
  ).length;
  const activeMembers = accountability.workspace.members.filter((member) =>
    liveMemberStatuses.has(member.status)
  );
  const pendingApprovals = accountability.requests.filter(
    (request) => request.status === 'pending'
  ).length;
  const pendingExits = accountability.workspace.exit_requests.filter(
    (request) => request.status === 'pending'
  ).length;
  const pendingContacts = accountability.workspace.contact_requests.filter(
    (request) => request.status === 'pending'
  ).length;
  const effectiveGroupID =
    selectedGroupID === 'all' ||
    accountability.workspace.groups.some(
      (group) => group.status === 'active' && group.id === selectedGroupID
    )
      ? selectedGroupID
      : 'all';
  const groupId =
    effectiveGroupID === 'all' ? undefined : effectiveGroupID;
  const analytics = usePartnerAnalytics(period, groupId);

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={Handshake}
        eyebrow={t('eyebrow')}
        title={t('title', { name: name || t('defaultName') })}
        description={t('description')}
        aside={
          <DashboardStatus tone="navy">{t('aggregateOnly')}</DashboardStatus>
        }
      />

      {accountability.error ? (
        <DashboardNotice
          icon={CircleAlert}
          title={t('errorTitle')}
          tone="amber"
          role="alert"
          action={
            <Button
              variant="outline"
              onClick={() => void accountability.refetch()}
            >
              {t('retry')}
            </Button>
          }
        >
          {t('errorBody')}
        </DashboardNotice>
      ) : accountability.loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" role="status">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
          <span className="sr-only">{t('loading')}</span>
        </div>
      ) : (
        <>
          <section aria-labelledby="partner-summary-title" data-tour="tour-partner-summary">
            <h2 id="partner-summary-title" className="sr-only">
              {t('summaryTitle')}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryMetric
                icon={FolderKanban}
                label={t('activeGroups')}
                value={activeGroups}
                tone="navy"
                subtitle={t('groupUnit')}
              />
              <SummaryMetric
                icon={UserCheck}
                label={t('activeMembers')}
                value={activeMembers.length}
                tone="sage"
                subtitle={
                  activeMembers.length > 0
                    ? t('studentUnit')
                    : t('noneYet')
                }
              />
              <SummaryMetric
                icon={ShieldAlert}
                label={t('pendingDecisions')}
                value={pendingApprovals + pendingExits}
                tone={pendingApprovals + pendingExits > 0 ? 'amber' : 'navy'}
                attention={pendingApprovals + pendingExits > 0}
                subtitle={
                  pendingApprovals + pendingExits > 0
                    ? t('actionRequired')
                    : t('noQueue')
                }
              />
              <SummaryMetric
                icon={MessageCircleHeart}
                label={t('pendingContacts')}
                value={pendingContacts}
                tone={pendingContacts > 0 ? 'azure' : 'navy'}
                attention={pendingContacts > 0}
                subtitle={
                  pendingContacts > 0
                    ? t('newCount')
                    : t('noNewMessages')
                }
              />
            </div>
          </section>

          <PartnerAnalyticsPanel
            groups={accountability.workspace.groups}
            selectedGroupID={selectedGroupID}
            onSelectedGroupIDChange={handleGroupChange}
            searchQuery={searchQuery}
            onSearchQueryChange={handleSearchChange}
          />

          <section aria-labelledby="advanced-analytics-title" data-tour="tour-partner-analytics">
            <div className="mb-3 flex items-center gap-3">
              <span className="bg-azure text-navy flex size-9 items-center justify-center rounded-lg">
                <BarChart3 className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h2
                  id="advanced-analytics-title"
                  className="text-navy text-lg font-bold"
                >
                  {t('advancedTitle')}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {t('advancedBody')}
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
                summary={analytics.data ?? analyticsFallback(period)}
                period={period}
                onPeriodChange={handlePeriodChange}
                emptyTitle={t('advancedEmptyTitle')}
                emptyBody={t('advancedEmptyBody')}
                metricsExtra={
                  <SharingMetrics
                    summary={analytics.data ?? analyticsFallback(period)}
                  />
                }
              />
            )}
          </section>
        </>
      )}

      <PartnerTour />
    </DashboardPage>
  );
}

function analyticsFallback(period: AnalyticsPeriod): AnalyticsSummary {
  return {
    period_days: period,
    totals: { blocked: 0, interventions: 0, tamper_events: 0, permission_revoked: 0 },
    daily: [],
    hourly: [],
    data_state: 'empty',
    member_count: 0,
    shared_member_count: 0,
  };
}

function SharingMetrics({ summary }: { summary: AnalyticsSummary }) {
  const t = useTranslations('analyticsDashboard');
  return (
    <>
      <AnalyticsMetric
        icon={Users}
        tone="navy"
        label={t('metricMembers')}
        value={summary.member_count}
        body={t('metricMembersBody')}
      />
      <AnalyticsMetric
        icon={UserCheck}
        tone="sage"
        label={t('metricSharing')}
        value={`${summary.shared_member_count}/${summary.member_count}`}
        body={t('metricSharingBody', {
          shared: summary.shared_member_count,
          total: summary.member_count,
        })}
      />
    </>
  );
}

function SummaryMetric({
  label,
  value,
  icon: Icon,
  subtitle,
  attention = false,
  tone = 'navy',
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  subtitle?: string;
  attention?: boolean;
  tone?: 'navy' | 'sage' | 'amber' | 'azure';
}) {
  const effectiveTone = attention ? 'amber' : tone;

  const iconToneClasses = {
    navy: 'bg-navy/10 text-navy',
    sage: 'bg-sage/15 text-sage-dark',
    amber: 'bg-amber/20 text-amber-800',
    azure: 'bg-azure text-navy',
  };

  const cardHighlightClasses = {
    navy: 'border-border/80 hover:border-navy/30 bg-card hover:bg-muted/15',
    sage: 'border-border/80 hover:border-sage/40 bg-card hover:bg-muted/15',
    amber: 'border-amber/40 bg-amber/[0.04] hover:border-amber/60',
    azure: 'border-border/80 hover:border-navy/30 bg-card hover:bg-muted/15',
  };

  return (
    <div
      className={cn(
        'group relative flex items-center gap-3.5 rounded-2xl border p-4 shadow-2xs transition-all duration-200 hover:shadow-xs',
        cardHighlightClasses[effectiveTone]
      )}
    >
      <span
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
          iconToneClasses[effectiveTone]
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-[0.6875rem] font-bold tracking-wider uppercase leading-none">
          {label}
        </p>

        <div className="mt-1.5 flex items-baseline gap-2">
          <p className="text-navy text-2xl font-black tracking-tight tabular-nums sm:text-3xl leading-none">
            {value}
          </p>
          {subtitle ? (
            <span className="text-muted-foreground text-xs font-semibold leading-none">
              {subtitle}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
