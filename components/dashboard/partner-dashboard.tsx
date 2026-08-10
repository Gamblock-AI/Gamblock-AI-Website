'use client';

import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BarChart3,
  CircleAlert,
  ClipboardCheck,
  FolderKanban,
  Handshake,
  LockKeyhole,
  MessageCircleHeart,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  UsersRound,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
  DashboardPanel,
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
import { Link, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedGroupID, setSelectedGroupID] = useState(
    () => searchParams.get('group') ?? 'all'
  );
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get('q') ?? ''
  );
  const [period, setPeriod] = useState<AnalyticsPeriod>(() =>
    searchParams.get('period') === '30' ? 30 : 14
  );
  const searchTimerRef = useRef<number | null>(null);

  const updateParams = (
    nextGroup: string,
    nextQuery: string,
    nextPeriod: AnalyticsPeriod
  ) => {
    const params: Record<string, string> = {};
    if (nextQuery.trim()) params.q = nextQuery.trim();
    if (nextGroup && nextGroup !== 'all') params.group = nextGroup;
    if (nextPeriod !== 14) params.period = String(nextPeriod);
    router.replace(
      {
        pathname: ROUTES.DASHBOARD,
        query: Object.keys(params).length ? params : {},
      },
      { scroll: false }
    );
  };

  const clearSearchTimer = () => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    clearSearchTimer();
    searchTimerRef.current = window.setTimeout(() => {
      searchTimerRef.current = null;
      updateParams(selectedGroupID, value, period);
    }, 350);
  };

  const handleGroupChange = (groupID: string) => {
    setSelectedGroupID(groupID);
    clearSearchTimer();
    updateParams(groupID, searchQuery, period);
  };

  const handlePeriodChange = (nextPeriod: AnalyticsPeriod) => {
    setPeriod(nextPeriod);
    clearSearchTimer();
    updateParams(selectedGroupID, searchQuery, nextPeriod);
  };

  useEffect(() => {
    return () => clearSearchTimer();
  }, []);

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
  const readyMembers = activeMembers.filter(
    (member) => member.aggregate.protection_status === 'ready'
  ).length;
  const attentionMembers = activeMembers.filter(
    (member) => member.aggregate.protection_status === 'attention'
  ).length;
  const unknownMembers = activeMembers.length - readyMembers - attentionMembers;
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
                subtitle="Aktif"
              />
              <SummaryMetric
                icon={UserCheck}
                label={t('activeMembers')}
                value={activeMembers.length}
                tone="sage"
                subtitle={
                  activeMembers.length > 0
                    ? `${activeMembers.length} mahasiswa`
                    : 'Belum ada'
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
                    ? 'Perlu tindakan'
                    : 'Tidak ada antrean'
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
                    ? `${pendingContacts} baru`
                    : 'Tidak ada antrean'
                }
              />
            </div>
          </section>

          <PartnerAnalyticsPanel
            groups={accountability.workspace.groups}
            members={accountability.workspace.members}
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

          <div className="grid gap-5 xl:grid-cols-12 xl:items-stretch">
            <DashboardPanel
              icon={ClipboardCheck}
              title={t('actionTitle')}
              description={t('actionBody')}
              density="compact"
              className="xl:col-span-7"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <ActionLink
                  href={ROUTES.ACCOUNTABILITY}
                  icon={ShieldCheck}
                  title={t('approvalTitle')}
                  body={t('approvalBody')}
                  count={pendingApprovals + pendingExits}
                />
                <ActionLink
                  href={`${ROUTES.SUPPORT}?channel=partner`}
                  icon={MessageCircleHeart}
                  title={t('contactTitle')}
                  body={t('contactBody')}
                  count={pendingContacts}
                />
              </div>
            </DashboardPanel>

            <DashboardPanel
              icon={UsersRound}
              title={t('protectionTitle')}
              description={t('protectionBody')}
              density="compact"
              className="xl:col-span-5"
            >
              <dl className="space-y-2.5">
                <AggregateRow
                  label={t('ready')}
                  value={readyMembers}
                  tone="sage"
                />
                <AggregateRow
                  label={t('needsAttention')}
                  value={attentionMembers}
                  tone="amber"
                />
                <AggregateRow
                  label={t('notShared')}
                  value={unknownMembers}
                  tone="muted"
                />
              </dl>
              <Link
                href={ROUTES.PARTNERS}
                className="bg-navy text-white hover:bg-navy-light focus-visible:ring-navy/30 mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold shadow-soft transition-all duration-200 outline-none focus-visible:ring-2 hover:shadow-md"
              >
                <span>{t('manageGroups')}</span>
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </DashboardPanel>
          </div>
        </>
      )}

      <DashboardNotice
        icon={LockKeyhole}
        title={t('privacyTitle')}
        className="border-navy/15 bg-gradient-to-r from-azure/35 via-background to-azure/20 shadow-2xs"
      >
        {t('privacyBody')}
      </DashboardNotice>

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
            <span
              className={cn(
                'text-xs font-semibold leading-none',
                attention
                  ? 'rounded-md bg-amber/25 px-1.5 py-0.5 text-amber-900 border border-amber/40 font-bold text-[0.6875rem]'
                  : 'text-muted-foreground'
              )}
            >
              {subtitle}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ActionLink({
  href,
  icon: Icon,
  title,
  body,
  count,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  body: string;
  count: number;
}) {
  const t = useTranslations('partnerDashboard');
  const hasPending = count > 0;

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl border p-4.5 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-navy/30 shadow-2xs hover:shadow-xs motion-reduce:transition-none',
        hasPending
          ? 'border-amber/40 bg-gradient-to-b from-amber/[0.04] to-card hover:border-amber/60 hover:bg-amber/[0.06]'
          : 'border-border/80 bg-card hover:border-navy/30 hover:bg-muted/10'
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
                hasPending
                  ? 'bg-amber/20 text-amber-900'
                  : 'bg-azure text-navy'
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="text-navy text-sm font-bold sm:text-base">
              {title}
            </span>
          </div>
          <DashboardStatus tone={hasPending ? 'amber' : 'sage'}>
            {t('itemCount', { count })}
          </DashboardStatus>
        </div>
        <p className="text-muted-foreground mt-3 text-xs leading-relaxed sm:text-[0.8125rem]">
          {body}
        </p>
      </div>

      <div
        className={cn(
          'mt-4.5 flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all duration-200',
          hasPending
            ? 'border-amber/40 bg-amber/15 text-amber-900 group-hover:bg-amber-500 group-hover:text-white group-hover:border-transparent'
            : 'border-navy/15 bg-muted/40 text-navy group-hover:bg-navy group-hover:text-white group-hover:border-transparent'
        )}
      >
        <span>Buka antrean</span>
        <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function AggregateRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'sage' | 'amber' | 'muted';
}) {
  const dotClasses = {
    sage: 'bg-sage',
    amber: 'bg-amber animate-pulse',
    muted: 'bg-muted-foreground',
  };

  return (
    <div className="border-border/80 bg-card hover:border-navy/20 hover:bg-muted/15 flex items-center justify-between gap-4 rounded-xl border p-3.5 shadow-2xs transition-all duration-200">
      <dt className="flex items-center gap-2.5 text-navy text-xs sm:text-sm font-semibold">
        <span
          className={cn('size-2.5 rounded-full shrink-0', dotClasses[tone])}
        />
        {label}
      </dt>
      <dd>
        <DashboardStatus tone={tone}>{value}</DashboardStatus>
      </dd>
    </div>
  );
}

