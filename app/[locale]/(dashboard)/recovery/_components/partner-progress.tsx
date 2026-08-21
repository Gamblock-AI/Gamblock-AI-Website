import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  EyeOff,
  Handshake,
  LockKeyhole,
  MessageCircleHeart,
  ShieldAlert,
  ShieldCheck,
  Users,
  UsersRound,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { StudentAvatar } from '@/components/dashboard/student-avatar';
import { ExpandableRow } from '@/components/dashboard/expandable-row';
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import {
  type AccountabilityMembership,
  type MemberAggregate,
  useAccountability,
} from '@/hooks/use-accountability';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes';

interface ProgressTranslation {
  (key: string, values?: Record<string, string | number>): string;
}

const protectionStatusKey = {
  ready: 'protectionState.ready',
  attention: 'protectionState.attention',
  unknown: 'protectionState.unknown',
} satisfies Record<NonNullable<MemberAggregate['protection_status']>, string>;

const educationProgressKey = {
  not_started: 'educationProgress.notStarted',
  starting: 'educationProgress.starting',
  in_progress: 'educationProgress.inProgress',
  near_complete: 'educationProgress.nearComplete',
} satisfies Record<
  NonNullable<MemberAggregate['education_progress_band']>,
  string
>;

const membershipStatusKey = {
  active: 'membershipStatus.active',
  leave_pending: 'membershipStatus.leavePending',
  support_review: 'membershipStatus.supportReview',
  safety_suspended: 'membershipStatus.safetySuspended',
  left: 'membershipStatus.left',
  removed: 'membershipStatus.removed',
} satisfies Record<AccountabilityMembership['status'], string>;

function formatProtectionStatus(
  t: ProgressTranslation,
  status: MemberAggregate['protection_status']
) {
  return status ? t(protectionStatusKey[status]) : undefined;
}

function formatEducationProgress(
  t: ProgressTranslation,
  progress: MemberAggregate['education_progress_band']
) {
  return progress ? t(educationProgressKey[progress]) : undefined;
}

function formatMembershipStatus(
  t: ProgressTranslation,
  status: AccountabilityMembership['status']
) {
  return t(membershipStatusKey[status]);
}

const liveMemberStatuses = new Set([
  'active',
  'leave_pending',
  'support_review',
  'safety_suspended',
]);

type MonitorFlag = 'status' | 'protection' | 'inactive' | 'noCheckIn';

const monitorSeverity: Record<MonitorFlag, number> = {
  status: 0,
  protection: 1,
  inactive: 2,
  noCheckIn: 3,
};

const monitorFlagLabel: Record<MonitorFlag, string> = {
  status: 'reasonStatus',
  protection: 'reasonProtection',
  inactive: 'reasonInactive',
  noCheckIn: 'reasonNoCheckIn',
};

// Monitoring triage flags derived from the consented aggregate summaries. It
// surfaces students who need the partner's attention without exposing any raw
// browsing or personal recovery detail.
function monitorFlags(member: AccountabilityMembership): MonitorFlag[] {
  const flags: MonitorFlag[] = [];
  if (member.status !== 'active') flags.push('status');
  if (member.aggregate.protection_status === 'attention') {
    flags.push('protection');
  }
  if (
    member.aggregate.last_heartbeat_bucket === 'older' ||
    member.aggregate.last_heartbeat_bucket === 'never'
  ) {
    flags.push('inactive');
  }
  if (member.aggregate.check_in_days === 0) flags.push('noCheckIn');
  return flags;
}

export function PartnerProgress() {
  const p = useTranslations('progressExperience');
  const accountability = useAccountability();
  const [expandedMembers, setExpandedMembers] = useState<
    Record<string, boolean>
  >({});
  const groupNames = new Map(
    accountability.workspace.groups.map((group) => [group.id, group.name])
  );
  const liveMembers = accountability.workspace.members.filter((member) =>
    liveMemberStatuses.has(member.status)
  );
  const flagged = liveMembers
    .map((member) => ({ member, flags: monitorFlags(member) }))
    .filter((item) => item.flags.length > 0)
    .sort((left, right) => {
      const leftSeverity = Math.min(
        ...left.flags.map((flag) => monitorSeverity[flag])
      );
      const rightSeverity = Math.min(
        ...right.flags.map((flag) => monitorSeverity[flag])
      );
      if (leftSeverity !== rightSeverity) return leftSeverity - rightSeverity;
      return left.member.student_name.localeCompare(right.member.student_name);
    });

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={UsersRound}
        eyebrow={p('partnerEyebrow')}
        title={p('partnerTitle')}
        description={p('partnerBody')}
        aside={
          <DashboardStatus tone="navy">{p('aggregateOnly')}</DashboardStatus>
        }
      />
      <div className="grid gap-5 xl:grid-cols-12 xl:items-stretch">
        <DashboardPanel
          icon={ShieldAlert}
          accent="amber"
          title={p('monitorTitle')}
          description={p('monitorBody')}
          density="compact"
          className="xl:col-span-5"
        >
          <div className="flex-1 space-y-3">
            {flagged.length === 0 ? (
              <div className="border-border/80 bg-muted/20 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center">
                <span className="border-border/80 bg-card text-muted-foreground/80 flex size-12 items-center justify-center rounded-2xl border shadow-2xs">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </span>
                <p className="text-navy mt-3 text-sm font-bold">
                  {p('monitorAllGood')}
                </p>
                <p className="text-muted-foreground mt-1 max-w-xs text-xs leading-relaxed">
                  {p('monitorAllGoodBody')}
                </p>
              </div>
            ) : (
              flagged.map(({ member, flags }) => (
                <div
                  key={member.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-amber/35 bg-gradient-to-br from-amber/[0.05] via-card to-card p-4 shadow-2xs transition-all duration-200 hover:border-amber/55 hover:shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <StudentAvatar
                          name={member.student_name}
                          avatarUrl={member.student_avatar_url}
                          className="size-8 ring-2 ring-amber/30"
                        />
                        <div className="min-w-0">
                          <p className="text-navy truncate text-sm font-bold">
                            {member.student_name}
                          </p>
                          <p className="text-muted-foreground text-[0.6875rem]">
                            {groupNames.get(member.group_id) ??
                              p('groupFallback')}
                          </p>
                        </div>
                      </div>
                      <DashboardStatus tone="amber">
                        {p('attentionBadge')}
                      </DashboardStatus>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {flags.map((flag) => (
                        <span
                          key={flag}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber/40 bg-amber/15 px-2 py-0.5 text-[0.6875rem] font-bold text-amber-900"
                        >
                          <AlertTriangle
                            className="size-3 shrink-0"
                            aria-hidden="true"
                          />
                          {flag === 'status'
                            ? formatMembershipStatus(p, member.status)
                            : p(monitorFlagLabel[flag])}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`${ROUTES.SUPPORT}?channel=partner`}
                    className="mt-3.5 flex min-h-9.5 items-center justify-center gap-2 rounded-xl border border-amber/40 bg-amber/15 text-xs font-bold text-amber-900 transition-all duration-200 hover:border-transparent hover:bg-amber-500 hover:text-white shadow-2xs group-hover:border-amber/50"
                  >
                    <MessageCircleHeart
                      className="size-3.5"
                      aria-hidden="true"
                    />
                    <span>{p('monitorContact')}</span>
                    <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="size-3.5" aria-hidden="true" />
              {p('monitorSummary', {
                attention: flagged.length,
                total: liveMembers.length,
              })}
            </span>
            <span className="font-semibold text-amber-800">
              {flagged.length > 0
                ? p('monitorActionRequired', { count: flagged.length })
                : p('monitorAllClear')}
            </span>
          </div>
        </DashboardPanel>

        <DashboardPanel
          icon={Handshake}
          title={p('sharedTitle')}
          description={p('sharedBody')}
          density="compact"
          className="xl:col-span-7"
        >
          <div className="flex-1 space-y-3">
            {accountability.workspace.members.map((member) => (
              <ExpandableRow
                key={member.id}
                open={Boolean(expandedMembers[member.id])}
                onToggle={() =>
                  setExpandedMembers((current) => ({
                    ...current,
                    [member.id]: !current[member.id],
                  }))
                }
                className="rounded-2xl"
                header={
                  <div className="flex w-full items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <StudentAvatar
                        name={member.student_name}
                        avatarUrl={member.student_avatar_url}
                        className="size-8"
                      />
                      <div className="min-w-0">
                        <p className="text-navy truncate font-bold text-sm">
                          {member.student_name}
                        </p>
                        <p className="text-muted-foreground text-[0.6875rem]">
                          {groupNames.get(member.group_id) ??
                            p('groupFallback')}
                        </p>
                      </div>
                    </div>
                    <DashboardStatus
                      tone={member.status === 'active' ? 'sage' : 'amber'}
                    >
                      {formatMembershipStatus(p, member.status)}
                    </DashboardStatus>
                  </div>
                }
              >
                <div className="grid gap-2.5 sm:grid-cols-3">
                  <Aggregate
                    icon={ShieldCheck}
                    label={p('protection')}
                    value={formatProtectionStatus(
                      p,
                      member.aggregate.protection_status
                    )}
                  />
                  <Aggregate
                    icon={BookOpen}
                    label={p('education')}
                    value={formatEducationProgress(
                      p,
                      member.aggregate.education_progress_band
                    )}
                  />
                  <Aggregate
                    icon={Calendar}
                    label={p('participation')}
                    value={
                      member.aggregate.check_in_days !== undefined
                        ? p('checkInDaysValue', {
                            count: member.aggregate.check_in_days,
                          })
                        : undefined
                    }
                  />
                </div>
              </ExpandableRow>
            ))}

            {accountability.workspace.members.length === 0 ? (
              <div className="border-border/80 bg-muted/20 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center">
                <span className="border-border/80 bg-card text-muted-foreground/80 flex size-12 items-center justify-center rounded-2xl border shadow-2xs">
                  <Users className="size-5" aria-hidden="true" />
                </span>
                <p className="text-navy mt-3 text-sm font-bold">
                  {p('noMembers')}
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <LockKeyhole className="size-3.5 text-navy" aria-hidden="true" />
              {p('aggregateOnly')}
            </span>
            <span className="font-semibold text-navy">
              {p('membersCount', {
                count: accountability.workspace.members.length,
              })}
            </span>
          </div>
        </DashboardPanel>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-navy/15 bg-gradient-to-r from-azure/35 via-card to-azure/20 p-3.5 sm:px-5 sm:py-3.5 shadow-2xs flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex size-9 sm:size-9.5 shrink-0 items-center justify-center rounded-xl bg-navy text-white shadow-2xs border border-white/10">
            <LockKeyhole className="size-4 sm:size-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-navy font-bold text-xs sm:text-sm tracking-tight">
              {p('privacyBoundary')}
            </p>
            <p className="text-muted-foreground mt-0.5 max-w-2xl text-xs leading-relaxed">
              {p('privacyBoundaryBody')}
            </p>
          </div>
        </div>
        <Link
          href={ROUTES.PARTNERS}
          className="group inline-flex min-h-8.5 sm:min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-navy px-3.5 sm:px-4 text-xs font-semibold text-white shadow-2xs transition-all duration-200 outline-none hover:bg-navy-light hover:shadow-xs focus-visible:ring-2 focus-visible:ring-navy/30 active:scale-98"
        >
          <span>{p('managePartner')}</span>
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </DashboardPage>
  );
}

function Aggregate({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value?: string | number;
}) {
  const p = useTranslations('progressExperience');
  const shared = value !== undefined && value !== null && value !== '';

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-xl border p-3 shadow-2xs transition-all',
        shared
          ? 'border-border/80 bg-card hover:border-navy/20'
          : 'border-dashed border-border bg-muted/25'
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <p className="text-muted-foreground truncate text-[0.6875rem] font-bold tracking-wider uppercase">
          {label}
        </p>
        {shared ? (
          <span className="flex size-6 items-center justify-center rounded-md bg-sage/15 text-sage-dark">
            <Icon className="size-3.5" aria-hidden="true" />
          </span>
        ) : (
          <span className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <EyeOff className="size-3.5" aria-hidden="true" />
          </span>
        )}
      </div>

      <p className="text-navy mt-2 text-sm font-extrabold tabular-nums">
        {shared ? String(value) : p('notShared')}
      </p>
    </div>
  );
}
