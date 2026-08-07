'use client';

import { useDeferredValue, useMemo, useState, type ReactNode } from 'react';
import { Activity, BarChart3, EyeOff, Search, ShieldCheck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { DashboardPanel, DashboardStatus } from './dashboard-page';
import {
  buildPartnerAnalytics,
  type PartnerAnalyticsMember,
} from './partner-analytics';
import type {
  AccountabilityGroup,
  AccountabilityMembership,
} from '@/hooks/use-accountability';

interface PartnerAnalyticsPanelProps {
  groups: AccountabilityGroup[];
  members: AccountabilityMembership[];
}

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

export function PartnerAnalyticsPanel({
  groups,
  members,
}: PartnerAnalyticsPanelProps) {
  const t = useTranslations('partnerDashboard.analytics');
  const locale = useLocale();
  const [selectedGroupID, setSelectedGroupID] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
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
  const analytics = useMemo(
    () =>
      buildPartnerAnalytics(
        groups,
        members,
        effectiveGroupID,
        deferredSearchQuery,
        locale
      ),
    [deferredSearchQuery, effectiveGroupID, groups, locale, members]
  );

  return (
    <DashboardPanel
      icon={BarChart3}
      title={t('title')}
      description={t('body')}
      fullHeight={false}
      contentClassName="grid gap-5"
    >
      <div className="grid gap-3 md:grid-cols-[minmax(180px,0.7fr)_minmax(220px,1fr)]">
        <label className="text-navy grid gap-1.5 text-sm font-semibold">
          {t('groupFilter')}
          <select
            value={effectiveGroupID}
            onChange={(event) => setSelectedGroupID(event.target.value)}
            className="border-border bg-background focus-visible:ring-navy/30 min-h-11 rounded-xl border px-3 text-sm font-medium outline-none focus-visible:ring-2"
          >
            <option value="all">{t('allGroups')}</option>
            {activeGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-navy grid gap-1.5 text-sm font-semibold">
          {t('searchLabel')}
          <span className="border-border bg-background focus-within:ring-navy/30 flex min-h-11 items-center gap-2 rounded-xl border px-3 focus-within:ring-2">
            <Search
              className="text-muted-foreground size-4"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('searchPlaceholder')}
              className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
            />
          </span>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetric
          label={t('totalDetections')}
          value={analytics.totalDetections}
          body={t('sevenDayPeriod')}
        />
        <AnalyticsMetric
          label={t('sharingCoverage')}
          value={t('sharingCoverageValue', {
            shared: analytics.sharedActivityMembers,
            total: analytics.totalMembers,
          })}
          body={t('sharingCoverageBody')}
        />
        <AnalyticsMetric
          label={t('readyProtection')}
          value={analytics.readyMembers}
          body={t('consentedHealth')}
        />
        <AnalyticsMetric
          label={t('needsAttention')}
          value={analytics.attentionMembers}
          body={t('consentedHealth')}
          attention={analytics.attentionMembers > 0}
        />
      </div>

      {analytics.members.length === 0 ? (
        <AnalyticsEmpty message={t('noMembers')} />
      ) : analytics.visibleMembers.length === 0 ? (
        <AnalyticsEmpty message={t('noSearchResults')} />
      ) : (
        <>
          <MemberTable
            members={analytics.visibleMembers}
            detectionScaleMax={analytics.detectionScaleMax}
            t={t}
          />
          <MemberCards
            members={analytics.visibleMembers}
            detectionScaleMax={analytics.detectionScaleMax}
            t={t}
          />
        </>
      )}

      <div className="border-navy/15 bg-azure/30 text-muted-foreground grid gap-2 rounded-xl border p-4 text-xs leading-5">
        <p>{t('classificationNote')}</p>
        <p>{t('barScaleNote')}</p>
        <p>{t('privacyNote')}</p>
      </div>
    </DashboardPanel>
  );
}

function AnalyticsMetric({
  label,
  value,
  body,
  attention = false,
}: {
  label: string;
  value: string | number;
  body: string;
  attention?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        attention
          ? 'border-amber/35 bg-amber/[0.08]'
          : 'border-border bg-muted/25'
      }`}
    >
      <p className="text-muted-foreground text-xs font-semibold">{label}</p>
      <p className="text-navy mt-2 text-2xl font-extrabold tabular-nums">
        {value}
      </p>
      <p className="text-muted-foreground mt-1 text-xs leading-5">{body}</p>
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
  return (
    <div className="grid gap-3 md:hidden">
      {members.map((item) => (
        <article
          key={item.membership.id}
          className="border-border rounded-xl border p-4"
        >
          <MemberIdentity item={item} t={t} />
          <dl className="mt-4 grid gap-3">
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
        </article>
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
      <p className="text-navy font-bold">{item.membership.student_name}</p>
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
  const width = scaleMax > 0 ? (item.weeklyDetections / scaleMax) * 100 : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-navy text-lg font-extrabold tabular-nums">
          {item.weeklyDetections}
        </span>
        <span className="text-muted-foreground text-xs">
          {t('sevenDayShort')}
        </span>
      </div>
      <div
        className="bg-muted mt-2 h-2 overflow-hidden rounded-full"
        aria-hidden="true"
      >
        <div
          className="bg-cyan-dark h-full rounded-full"
          style={{ width: `${width}%` }}
        />
      </div>
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
    <div className="space-y-1.5">
      <DashboardStatus tone={tone}>
        {t(protectionStatusKey[item.protectionStatus])}
      </DashboardStatus>
      <p className="text-muted-foreground text-xs">
        {t('activeDevices', { count: item.activeDeviceCount ?? 0 })}
      </p>
      <p className="text-muted-foreground text-xs">
        {t('lastHeartbeat', {
          value: t(heartbeatKey[item.heartbeatBucket ?? 'never']),
        })}
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
      <p className="text-navy font-semibold">
        {t('checkInDays', { count: item.checkInDays })}
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
