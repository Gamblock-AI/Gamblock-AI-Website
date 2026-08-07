import { describe, expect, it } from 'vitest';
import type {
  AccountabilityGroup,
  AccountabilityMembership,
} from '@/hooks/use-accountability';
import { buildPartnerAnalytics } from './partner-analytics';

function group(
  id: string,
  name: string,
  status: AccountabilityGroup['status'] = 'active'
): AccountabilityGroup {
  return {
    id,
    owner_name: 'Partner',
    name,
    description: '',
    join_code_hint: 'DEMO',
    status,
    member_count: 1,
    code_rotated_at: '2026-08-02T00:00:00Z',
    created_at: '2026-08-02T00:00:00Z',
  };
}

function member(
  id: string,
  groupID: string,
  name: string,
  overrides: Partial<AccountabilityMembership> = {}
): AccountabilityMembership {
  return {
    id,
    group_id: groupID,
    student_id: 'student-' + id,
    student_name: name,
    status: 'active',
    sharing: {
      protection_health: true,
      protection_activity: true,
      recovery_engagement: true,
      education_progress: true,
    },
    aggregate: {
      protection_status: 'ready',
      active_device_count: 1,
      last_heartbeat_bucket: 'today',
      weekly_block_count: 0,
      check_in_days: 0,
      mission_completed: 0,
      education_progress_band: 'not_started',
    },
    joined_at: '2026-08-02T00:00:00Z',
    ...overrides,
  };
}

describe('buildPartnerAnalytics', () => {
  it('totals only consented active-group members and keeps zero distinct from not shared', () => {
    const groups = [
      group('group-a', 'Alpha'),
      group('group-b', 'Beta'),
      group('group-archived', 'Archived', 'archived'),
    ];
    const memberships = [
      member('a', 'group-a', 'Alya', {
        aggregate: {
          protection_status: 'ready',
          weekly_block_count: 5,
        },
      }),
      member('b', 'group-a', 'Bima', {
        aggregate: {
          protection_status: 'attention',
          weekly_block_count: 0,
        },
      }),
      member('c', 'group-b', 'Citra', {
        sharing: {
          protection_health: false,
          protection_activity: false,
          recovery_engagement: false,
          education_progress: false,
        },
        aggregate: { weekly_block_count: 99 },
      }),
      member('left', 'group-a', 'Left', {
        status: 'left',
        aggregate: { weekly_block_count: 10 },
      }),
      member('archived', 'group-archived', 'Archived', {
        aggregate: { weekly_block_count: 20 },
      }),
    ];

    const result = buildPartnerAnalytics(groups, memberships, 'all', '', 'id');

    expect(result.totalMembers).toBe(3);
    expect(result.sharedActivityMembers).toBe(2);
    expect(result.totalDetections).toBe(5);
    expect(result.readyMembers).toBe(1);
    expect(result.attentionMembers).toBe(1);
    expect(result.detectionScaleMax).toBe(5);
    expect(
      result.members.find((item) => item.membership.id === 'b')
        ?.weeklyDetections
    ).toBe(0);
    expect(
      result.members.find((item) => item.membership.id === 'c')
        ?.weeklyDetections
    ).toBeUndefined();
  });

  it('filters by group and name without changing the selected-group bar scale', () => {
    const groups = [group('group-a', 'Alpha'), group('group-b', 'Beta')];
    const memberships = [
      member('a', 'group-a', 'Alya', {
        aggregate: { weekly_block_count: 8 },
      }),
      member('b', 'group-a', 'Bima', {
        aggregate: { weekly_block_count: 2 },
      }),
      member('c', 'group-b', 'Citra', {
        aggregate: { weekly_block_count: 4 },
      }),
    ];

    const result = buildPartnerAnalytics(
      groups,
      memberships,
      'group-a',
      'bima',
      'id'
    );

    expect(result.members).toHaveLength(2);
    expect(
      result.visibleMembers.map((item) => item.membership.student_name)
    ).toEqual(['Bima']);
    expect(result.detectionScaleMax).toBe(8);
    expect(result.totalDetections).toBe(10);
  });
});
