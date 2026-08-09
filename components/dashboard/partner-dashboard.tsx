'use client';

import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BarChart3,
  CircleAlert,
  ClipboardCheck,
  Handshake,
  LockKeyhole,
  MessageCircleHeart,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
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
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';
import { AnalyticsInsights } from './analytics/analytics-insights';
import { AnalyticsMetric } from './analytics/analytics-metric';
import { PartnerAnalyticsPanel } from './partner-analytics-panel';

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
  const [selectedGroupID, setSelectedGroupID] = useState('all');
  const [period, setPeriod] = useState<AnalyticsPeriod>(14);
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
  const groupId =
    selectedGroupID === 'all' ? undefined : selectedGroupID;
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
          <section aria-labelledby="partner-summary-title">
            <h2 id="partner-summary-title" className="sr-only">
              {t('summaryTitle')}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryMetric label={t('activeGroups')} value={activeGroups} />
              <SummaryMetric
                label={t('activeMembers')}
                value={activeMembers.length}
              />
              <SummaryMetric
                label={t('pendingDecisions')}
                value={pendingApprovals + pendingExits}
                attention={pendingApprovals + pendingExits > 0}
              />
              <SummaryMetric
                label={t('pendingContacts')}
                value={pendingContacts}
                attention={pendingContacts > 0}
              />
            </div>
          </section>

          <PartnerAnalyticsPanel
            groups={accountability.workspace.groups}
            members={accountability.workspace.members}
            selectedGroupID={selectedGroupID}
            onSelectedGroupIDChange={setSelectedGroupID}
          />

          <section aria-labelledby="advanced-analytics-title">
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
                onPeriodChange={setPeriod}
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
              className="xl:col-span-5"
            >
              <dl className="space-y-3">
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
                className="border-navy/20 text-navy focus-visible:ring-navy/30 hover:bg-azure/70 mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition-colors outline-none focus-visible:ring-2"
              >
                {t('manageGroups')}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </DashboardPanel>
          </div>
        </>
      )}

      <DashboardNotice
        icon={LockKeyhole}
        title={t('privacyTitle')}
        className="border-navy/15 bg-azure/30"
      >
        {t('privacyBody')}
      </DashboardNotice>
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
      <AnalyticsMetric label={t('metricMembers')} value={summary.member_count} />
      <AnalyticsMetric
        label={t('metricSharing')}
        value={t('metricSharingValue', {
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
  attention = false,
}: {
  label: string;
  value: number;
  attention?: boolean;
}) {
  return (
    <div
      className={`shadow-soft rounded-2xl border p-4 ${attention ? 'border-amber/35 bg-amber/[0.08]' : 'border-border bg-card'}`}
    >
      <p className="text-muted-foreground text-xs font-semibold">{label}</p>
      <p className="text-navy mt-2 text-3xl font-extrabold tabular-nums">
        {value}
      </p>
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
  return (
    <Link
      href={href}
      className="group border-border bg-muted/35 hover:border-navy/30 focus-visible:ring-navy/30 rounded-xl border p-4 transition-colors outline-none focus-visible:ring-2"
    >
      <div className="flex items-center gap-3">
        <span className="bg-navy flex size-9 items-center justify-center rounded-lg text-white">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span className="text-navy flex-1 text-sm font-bold">{title}</span>
        <DashboardStatus tone={count > 0 ? 'amber' : 'sage'}>
          {t('itemCount', { count })}
        </DashboardStatus>
      </div>
      <p className="text-muted-foreground mt-3 text-sm leading-6">{body}</p>
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
  return (
    <div className="border-border flex items-center justify-between gap-4 rounded-xl border p-3">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd>
        <DashboardStatus tone={tone}>{value}</DashboardStatus>
      </dd>
    </div>
  );
}
