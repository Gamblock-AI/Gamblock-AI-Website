import type {
  AccountabilityGroup,
  AccountabilityMembership,
} from '@/hooks/use-accountability';

const liveMemberStatuses = new Set<AccountabilityMembership['status']>([
  'active',
  'leave_pending',
  'support_review',
  'safety_suspended',
]);

export interface PartnerAnalyticsMember {
  membership: AccountabilityMembership;
  groupName: string;
  weeklyDetections?: number;
  protectionStatus?: NonNullable<
    AccountabilityMembership['aggregate']['protection_status']
  >;
  activeDeviceCount?: number;
  heartbeatBucket?: NonNullable<
    AccountabilityMembership['aggregate']['last_heartbeat_bucket']
  >;
  checkInDays?: number;
  missionCompleted?: number;
  educationProgress?: NonNullable<
    AccountabilityMembership['aggregate']['education_progress_band']
  >;
}

export interface PartnerAnalyticsView {
  members: PartnerAnalyticsMember[];
  visibleMembers: PartnerAnalyticsMember[];
  totalDetections: number;
  sharedActivityMembers: number;
  totalMembers: number;
  readyMembers: number;
  attentionMembers: number;
  detectionScaleMax: number;
}

function analyticsMember(
  membership: AccountabilityMembership,
  groupName: string
): PartnerAnalyticsMember {
  const { aggregate, sharing } = membership;
  return {
    membership,
    groupName,
    weeklyDetections: sharing.protection_activity
      ? (aggregate.weekly_block_count ?? 0)
      : undefined,
    protectionStatus: sharing.protection_health
      ? (aggregate.protection_status ?? 'unknown')
      : undefined,
    activeDeviceCount: sharing.protection_health
      ? (aggregate.active_device_count ?? 0)
      : undefined,
    heartbeatBucket: sharing.protection_health
      ? (aggregate.last_heartbeat_bucket ?? 'never')
      : undefined,
    checkInDays: sharing.recovery_engagement
      ? (aggregate.check_in_days ?? 0)
      : undefined,
    missionCompleted: sharing.recovery_engagement
      ? (aggregate.mission_completed ?? 0)
      : undefined,
    educationProgress: sharing.education_progress
      ? (aggregate.education_progress_band ?? 'not_started')
      : undefined,
  };
}

export function buildPartnerAnalytics(
  groups: AccountabilityGroup[],
  memberships: AccountabilityMembership[],
  selectedGroupID: string,
  searchQuery: string,
  locale: string
): PartnerAnalyticsView {
  const activeGroups = new Map(
    groups
      .filter((group) => group.status === 'active')
      .map((group) => [group.id, group.name])
  );
  const members = memberships
    .filter(
      (membership) =>
        liveMemberStatuses.has(membership.status) &&
        activeGroups.has(membership.group_id) &&
        (selectedGroupID === 'all' || membership.group_id === selectedGroupID)
    )
    .map((membership) =>
      analyticsMember(membership, activeGroups.get(membership.group_id) ?? '')
    )
    .sort((left, right) => {
      const groupOrder = left.groupName.localeCompare(right.groupName, locale);
      return groupOrder !== 0
        ? groupOrder
        : left.membership.student_name.localeCompare(
            right.membership.student_name,
            locale
          );
    });
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase(locale);
  const visibleMembers = normalizedQuery
    ? members.filter((item) =>
        item.membership.student_name
          .toLocaleLowerCase(locale)
          .includes(normalizedQuery)
      )
    : members;

  let totalDetections = 0;
  let sharedActivityMembers = 0;
  let readyMembers = 0;
  let attentionMembers = 0;
  let detectionScaleMax = 0;
  for (const item of members) {
    if (item.weeklyDetections !== undefined) {
      sharedActivityMembers += 1;
      totalDetections += item.weeklyDetections;
      detectionScaleMax = Math.max(detectionScaleMax, item.weeklyDetections);
    }
    if (item.protectionStatus === 'ready') readyMembers += 1;
    if (item.protectionStatus === 'attention') attentionMembers += 1;
  }

  return {
    members,
    visibleMembers,
    totalDetections,
    sharedActivityMembers,
    totalMembers: members.length,
    readyMembers,
    attentionMembers,
    detectionScaleMax,
  };
}
