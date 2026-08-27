'use client';

import { useEffect, useDeferredValue, useMemo, useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  Clock,
  EyeOff,
  FolderKanban,
  Info,
  Search,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Users,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { DashboardPanel, DashboardStatus } from './dashboard-page';
import { Pagination } from '@/components/dashboard/pagination';
import { StudentAvatar } from './student-avatar';
import { ExpandableRow } from './expandable-row';
import {
  buildPartnerAnalytics,
  type PartnerAnalyticsMember,
} from './partner-analytics';
import type {
  AccountabilityGroup,
  AccountabilityMembership,
} from '@/hooks/use-accountability';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import type { PaginatedData } from '@/hooks/use-pagination';
import { cn } from '@/lib/utils';

interface Translation {
  (key: string, values?: Record<string, string | number>): string;
}

const membershipStatusKey = {
  active: 'membership.active',
  leave_pending: 'membership.leavePending',
  support_review: 'membership.supportReview',
  safety_suspended: 'membership.safetySuspended',
  left: 'membership.left',
  removed: 'membership.removed',
} satisfies Record<AccountabilityMembership['status'], string>;

const protectionStatusKey = {
  ready: 'protection.ready',
  attention: 'protection.attention',
  unknown: 'protection.unknown',
} as const;

const heartbeatKey = {
  today: 'heartbeat.today',
  '1-3d': 'heartbeat.oneToThree',
  '4-7d': 'heartbeat.fourToSeven',
  older: 'heartbeat.older',
  never: 'heartbeat.never',
} as const;

const educationKey = {
  not_started: 'education.notStarted',
  starting: 'education.starting',
  in_progress: 'education.inProgress',
  near_complete: 'education.nearComplete',
} as const;

interface AccountabilityAnalyticsPage extends PaginatedData<AccountabilityMembership> {
  total_detections: number;
  shared_activity_members: number;
  total_members: number;
  ready_members: number;
  attention_members: number;
  detection_scale_max: number;
}

export function PartnerAnalyticsPanel({
  groups,
  selectedGroupID,
  onSelectedGroupIDChange,
  searchQuery = '',
  onSearchQueryChange = () => {},
}: {
  groups: AccountabilityGroup[];
  selectedGroupID: string;
  onSelectedGroupIDChange: (groupID: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}) {
  const t = useTranslations('partnerDashboard.analytics');
  const tPagination = useTranslations('pagination');
  const locale = useLocale();
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const activeGroups = useMemo(
    () => groups.filter((group) => group.status === 'active'),
    [groups]
  );
  const effectiveGroupID =
    selectedGroupID === 'all' ||
    activeGroups.some((group) => group.id === selectedGroupID)
      ? selectedGroupID
      : 'all';
  const analyticsParams = new URLSearchParams();
  if (effectiveGroupID !== 'all') analyticsParams.set('group_id', effectiveGroupID);
  if (deferredSearchQuery.trim()) analyticsParams.set('q', deferredSearchQuery.trim());
  const analyticsQuery = usePaginatedQuery<
    AccountabilityMembership,
    AccountabilityAnalyticsPage
  >({
    path: `/accountability/analytics/members?${analyticsParams.toString()}`,
    pageKey: 'page[analyticsMembers]',
    pageSize: 5,
  });
  const analytics = useMemo(
    () =>
      buildPartnerAnalytics(
        groups,
        analyticsQuery.items,
        effectiveGroupID,
        '',
        locale
      ),
    [analyticsQuery.items, effectiveGroupID, groups, locale]
  );
  const pagination = analyticsQuery.pagination;
  const analyticsData = analyticsQuery.data;
  const totalDetections = analyticsData?.total_detections ?? analytics.totalDetections;
  const sharedActivityMembers =
    analyticsData?.shared_activity_members ?? analytics.sharedActivityMembers;
  const totalMembers = analyticsData?.total_members ?? analytics.totalMembers;
  const readyMembers = analyticsData?.ready_members ?? analytics.readyMembers;
  const attentionMembers = analyticsData?.attention_members ?? analytics.attentionMembers;
  const detectionScaleMax =
    analyticsData?.detection_scale_max ?? analytics.detectionScaleMax;

  useEffect(() => {
    pagination.resetPage();
  }, [effectiveGroupID, deferredSearchQuery, pagination]);

  return (
    <DashboardPanel
      icon={BarChart3}
      title={t('title')}
      description={t('body')}
      density="compact"
      fullHeight={false}
      contentClassName="grid gap-4 sm:gap-4.5"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetric
          icon={ShieldAlert}
          tone="crimson"
          label={t('totalDetections')}
          value={t('detectionTimes', { count: totalDetections })}
          body={t('sevenDayPeriod')}
        />
        <AnalyticsMetric
          icon={Users}
          tone="azure"
          label={t('sharingCoverage')}
          value={t('sharingCoverageValue', {
            shared: sharedActivityMembers,
            total: totalMembers,
          })}
          body={t('sharingCoverageBody')}
        />
        <AnalyticsMetric
          icon={ShieldCheck}
          tone="sage"
          label={t('readyProtection')}
          value={readyMembers}
          body={t('consentedHealth')}
        />
        <AnalyticsMetric
          icon={AlertTriangle}
          tone={attentionMembers > 0 ? 'amber' : 'navy'}
          attention={attentionMembers > 0}
          label={t('needsAttention')}
          value={attentionMembers}
          body={t('consentedHealth')}
        />
      </div>

      <div
        data-tour="tour-partner-filters"
        className="grid gap-3 md:grid-cols-[minmax(180px,0.7fr)_minmax(220px,1fr)]"
      >
        <label className="text-navy grid gap-1.5 text-xs font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <FolderKanban className="size-3.5" aria-hidden="true" />
            {t('groupFilter')}
          </span>
          <select
            value={effectiveGroupID}
            onChange={(event) => onSelectedGroupIDChange(event.target.value)}
            className="border-border/80 bg-background focus-visible:ring-navy/25 h-10 rounded-xl border px-3 text-xs font-medium outline-none focus-visible:ring-2"
          >
            <option value="all">{t('allGroups')}</option>
            {activeGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-navy grid gap-1.5 text-xs font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Search className="size-3.5" aria-hidden="true" />
            {t('searchLabel')}
          </span>
          <span className="border-border/80 bg-background focus-within:ring-navy/25 flex h-10 items-center gap-2 rounded-xl border px-3 focus-within:ring-2">
            <Search
              className="text-muted-foreground size-3.5"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder={t('searchPlaceholder')}
              className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-xs font-medium outline-none"
            />
          </span>
        </label>
      </div>

      <div data-tour="tour-partner-table" className="space-y-3">
        {pagination.totalItems === 0 ? (
          <AnalyticsEmpty message={t('noMembers')} />
        ) : (
          <div className="space-y-3">
            <MemberTable
              members={analytics.visibleMembers}
              detectionScaleMax={detectionScaleMax}
              t={t}
            />
            <MemberCards
              members={analytics.visibleMembers}
              detectionScaleMax={detectionScaleMax}
              t={t}
            />
            {pagination.totalItems > 0 ? (
              <div className="border-border/80 bg-muted/15 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 border rounded-xl px-4 py-2.5 sm:px-5">
                <span className="text-muted-foreground text-xs font-semibold whitespace-nowrap self-start sm:self-center">
                  {tPagination('showingRange', {
                    start: pagination.startIndex,
                    end: pagination.endIndex,
                    total: pagination.totalItems,
                  })}
                </span>
                {pagination.totalPages > 1 ? (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={pagination.setPage}
                    size="sm"
                    variant="flat"
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="border-navy/15 bg-gradient-to-r from-azure/30 via-background to-azure/20 text-muted-foreground grid gap-2 rounded-xl border p-3.5 text-xs leading-relaxed shadow-2xs">
        <div className="flex items-start gap-2">
          <Info className="text-navy mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p>{t('classificationNote')}</p>
            <p>{t('barScaleNote')}</p>
            <p className="font-semibold text-navy">{t('privacyNote')}</p>
          </div>
        </div>
      </div>
    </DashboardPanel>
  );
}

function AnalyticsMetric({
  label,
  value,
  body,
  icon: Icon,
  tone = 'navy',
  attention = false,
}: {
  label: string;
  value: string | number;
  body: string;
  icon: LucideIcon;
  tone?: 'navy' | 'sage' | 'amber' | 'crimson' | 'azure';
  attention?: boolean;
}) {
  const effectiveTone = attention ? 'amber' : tone;

  const iconToneClasses = {
    navy: 'bg-navy/10 text-navy',
    sage: 'bg-sage/15 text-sage-dark',
    amber: 'bg-amber/20 text-amber-800',
    crimson: 'bg-crimson/15 text-crimson-dark',
    azure: 'bg-azure text-navy',
  };

  const cardHighlightClasses = {
    navy: 'border-border/80 hover:border-navy/30 bg-card hover:bg-muted/15',
    sage: 'border-border/80 hover:border-sage/40 bg-card hover:bg-muted/15',
    amber: 'border-amber/35 bg-amber/[0.04] hover:border-amber/55',
    crimson: 'border-crimson/30 bg-crimson/[0.03] hover:border-crimson/45',
    azure: 'border-border/80 hover:border-navy/30 bg-card hover:bg-muted/15',
  };

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 rounded-xl border p-3.5 shadow-2xs transition-all duration-200 hover:shadow-xs',
        cardHighlightClasses[effectiveTone]
      )}
    >
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
          iconToneClasses[effectiveTone]
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground truncate text-[0.6875rem] font-bold tracking-wider uppercase">
          {label}
        </p>

        <p className="text-navy mt-0.5 text-xl font-black tracking-tight tabular-nums sm:text-2xl leading-tight">
          {value}
        </p>

        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
          {body}
        </p>
      </div>
    </div>
  );
}

function MemberTable({
  members,
  detectionScaleMax,
  t,
}: {
  members: PartnerAnalyticsMember[];
  detectionScaleMax: number;
  t: Translation;
}) {
  return (
    <div className="border-border hidden overflow-x-auto rounded-xl border md:block">
      <table className="w-full min-w-[920px] border-collapse text-left text-sm">
        <caption className="sr-only">{t('tableCaption')}</caption>
        <thead className="bg-muted/55 text-muted-foreground text-xs">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              {t('student')}
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              {t('detections')}
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              {t('protectionColumn')}
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              {t('supportColumn')}
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              {t('educationColumn')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {members.map((item) => (
            <tr key={item.membership.id} className="align-top">
              <th scope="row" className="px-4 py-4 font-normal">
                <MemberIdentity item={item} t={t} />
              </th>
              <td className="w-64 px-4 py-4">
                <DetectionCell item={item} scaleMax={detectionScaleMax} t={t} />
              </td>
              <td className="px-4 py-4">
                <ProtectionCell item={item} t={t} />
              </td>
              <td className="px-4 py-4">
                <SupportCell item={item} t={t} />
              </td>
              <td className="px-4 py-4">
                <EducationCell item={item} t={t} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MemberCards({
  members,
  detectionScaleMax,
  t,
}: {
  members: PartnerAnalyticsMember[];
  detectionScaleMax: number;
  t: Translation;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  return (
    <div className="grid gap-3 md:hidden">
      {members.map((item) => (
        <ExpandableRow
          key={item.membership.id}
          open={Boolean(expanded[item.membership.id])}
          onToggle={() =>
            setExpanded((current) => ({
              ...current,
              [item.membership.id]: !current[item.membership.id],
            }))
          }
          header={
            <div className="w-full min-w-0">
              <MemberIdentity item={item} t={t} />
            </div>
          }
        >
          <dl className="grid gap-3">
            <MobileMetric label={t('detections')}>
              <DetectionCell item={item} scaleMax={detectionScaleMax} t={t} />
            </MobileMetric>
            <MobileMetric label={t('protectionColumn')}>
              <ProtectionCell item={item} t={t} />
            </MobileMetric>
            <MobileMetric label={t('supportColumn')}>
              <SupportCell item={item} t={t} />
            </MobileMetric>
            <MobileMetric label={t('educationColumn')}>
              <EducationCell item={item} t={t} />
            </MobileMetric>
          </dl>
        </ExpandableRow>
      ))}
    </div>
  );
}

function MobileMetric({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <dt className="text-muted-foreground text-xs font-semibold">{label}</dt>
      <dd className="mt-2">{children}</dd>
    </div>
  );
}

function MemberIdentity({
  item,
  t,
}: {
  item: PartnerAnalyticsMember;
  t: Translation;
}) {
  const active = item.membership.status === 'active';
  return (
    <div className="min-w-44">
      <div className="flex items-center gap-2">
        <StudentAvatar
          name={item.membership.student_name}
          avatarUrl={item.membership.student_avatar_url}
          className="size-7"
        />
        <p className="text-navy truncate font-bold">
          {item.membership.student_name}
        </p>
      </div>
      <p className="text-muted-foreground mt-1 text-xs">{item.groupName}</p>
      <div className="mt-2">
        <DashboardStatus tone={active ? 'sage' : 'amber'}>
          {t(membershipStatusKey[item.membership.status])}
        </DashboardStatus>
      </div>
    </div>
  );
}

function DetectionCell({
  item,
  scaleMax,
  t,
}: {
  item: PartnerAnalyticsMember;
  scaleMax: number;
  t: Translation;
}) {
  if (item.weeklyDetections === undefined) return <NotShared t={t} />;
  const count = item.weeklyDetections;
  const isZero = count === 0;
  const percentage = scaleMax > 0 ? Math.round((count / scaleMax) * 100) : 0;
  const barWidth = Math.max(isZero ? 0 : 8, percentage);

  return (
    <div className="space-y-1.5 min-w-[170px]">
      <div className="flex items-baseline justify-between gap-2">
        <span
          className={cn(
            'text-base font-extrabold tabular-nums',
            isZero ? 'text-navy' : 'text-crimson-dark'
          )}
        >
          {t('detectionTimes', { count })}
        </span>
        <span className="text-muted-foreground text-[0.6875rem] font-medium">
          {t('sevenDayPeriodShort')}
        </span>
      </div>

      <div
        className="bg-muted/80 h-2 w-full overflow-hidden rounded-full border border-border/50"
        aria-hidden="true"
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isZero
              ? 'bg-transparent'
              : count === scaleMax
                ? 'bg-gradient-to-r from-amber-500 to-crimson'
                : 'bg-gradient-to-r from-sky to-navy-light'
          )}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <p className="text-muted-foreground text-[0.6875rem] leading-tight">
        {isZero ? (
          <span className="text-sage-dark font-semibold inline-flex items-center gap-1">
            <ShieldCheck className="size-3" aria-hidden="true" />
            {t('noDetections7Days')}
          </span>
        ) : (
          <span>
            {t('groupMaxComparison', { percent: percentage, max: scaleMax })}
          </span>
        )}
      </p>
    </div>
  );
}

function ProtectionCell({
  item,
  t,
}: {
  item: PartnerAnalyticsMember;
  t: Translation;
}) {
  if (!item.protectionStatus) return <NotShared t={t} />;
  const tone =
    item.protectionStatus === 'ready'
      ? 'sage'
      : item.protectionStatus === 'attention'
        ? 'amber'
        : 'muted';
  return (
    <div className="space-y-1.5 text-xs">
      <DashboardStatus tone={tone}>
        {t(protectionStatusKey[item.protectionStatus])}
      </DashboardStatus>
      <p className="text-muted-foreground flex items-center gap-1">
        <Smartphone className="size-3.5 shrink-0" aria-hidden="true" />
        <span>{t('activeDevices', { count: item.activeDeviceCount ?? 0 })}</span>
      </p>
      <p className="text-muted-foreground flex items-center gap-1">
        <Clock className="size-3.5 shrink-0" aria-hidden="true" />
        <span>
          {t('lastHeartbeat', {
            value: t(heartbeatKey[item.heartbeatBucket ?? 'never']),
          })}
        </span>
      </p>
    </div>
  );
}

function SupportCell({
  item,
  t,
}: {
  item: PartnerAnalyticsMember;
  t: Translation;
}) {
  if (item.checkInDays === undefined || item.missionCompleted === undefined) {
    return <NotShared t={t} />;
  }
  return (
    <div className="space-y-1.5 text-xs">
      <p className="text-navy flex items-center gap-1 font-semibold">
        <Calendar className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
        <span>{t('checkInDays', { count: item.checkInDays })}</span>
      </p>
      <p className="text-muted-foreground">
        {t('missionsCompleted', { count: item.missionCompleted })}
      </p>
    </div>
  );
}

function EducationCell({
  item,
  t,
}: {
  item: PartnerAnalyticsMember;
  t: Translation;
}) {
  if (!item.educationProgress) return <NotShared t={t} />;
  return (
    <div className="text-navy flex items-center gap-2 text-sm font-semibold">
      <ShieldCheck className="text-sage size-4 shrink-0" aria-hidden="true" />
      {t(educationKey[item.educationProgress])}
    </div>
  );
}

function NotShared({ t }: { t: Translation }) {
  return (
    <span className="text-muted-foreground inline-flex items-center gap-2 text-xs font-semibold">
      <EyeOff className="size-4" aria-hidden="true" />
      {t('notShared')}
    </span>
  );
}

function AnalyticsEmpty({ message }: { message: string }) {
  return (
    <div className="border-border bg-muted/25 flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center">
      <Activity className="text-muted-foreground size-6" aria-hidden="true" />
      <p className="text-muted-foreground mt-2 text-sm">{message}</p>
    </div>
  );
}
