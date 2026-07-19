'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export interface SharingPreferences {
  protection_health: boolean;
  protection_activity: boolean;
  recovery_engagement: boolean;
  education_progress: boolean;
}

export interface MemberAggregate {
  protection_status?: 'ready' | 'attention' | 'unknown';
  active_device_count?: number;
  last_heartbeat_bucket?: 'today' | '1-3d' | '4-7d' | 'older' | 'never';
  weekly_block_count?: number;
  check_in_days?: number;
  mission_completed?: number;
  education_progress_band?:
    | 'not_started'
    | 'starting'
    | 'in_progress'
    | 'near_complete';
}

export interface AccountabilityGroup {
  id: string;
  owner_name: string;
  name: string;
  description: string;
  join_code?: string;
  join_code_hint: string;
  status: 'active' | 'archived';
  member_count: number;
  code_rotated_at: string;
  created_at: string;
}

export interface AccountabilityMembership {
  id: string;
  group_id: string;
  student_id: string;
  student_name: string;
  student_email?: string;
  status:
    | 'active'
    | 'leave_pending'
    | 'support_review'
    | 'safety_suspended'
    | 'left'
    | 'removed';
  sharing: SharingPreferences;
  aggregate: MemberAggregate;
  joined_at: string;
  ended_at?: string;
}

export interface MembershipExitRequest {
  id: string;
  membership_id: string;
  requested_by: string;
  kind: 'normal' | 'unsafe' | 'partner_removal';
  status: 'pending' | 'approved' | 'denied' | 'auto_reviewed' | 'cancelled';
  reason?: string;
  review_due_at?: string;
  created_at: string;
}

export interface PartnerContactRequest {
  id: string;
  membership_id: string;
  student_name: string;
  category: 'check_in' | 'practical_help' | 'accountability' | 'other';
  message?: string;
  status: 'pending' | 'acknowledged' | 'closed' | 'cancelled';
  escalated_at?: string;
  created_at: string;
}

export interface ApprovalRequest {
  id: string;
  device_id: string;
  membership_id: string;
  action: 'pause_protection' | 'uninstall_detected';
  status: 'pending' | 'approved' | 'denied' | 'expired' | 'cancelled';
  reason: string;
  supportive_response?: string;
  requested_duration_minutes: number;
  created_at: string;
  expires_at?: string;
}

export interface AccountabilityWorkspace {
  role: 'user' | 'partner';
  groups: AccountabilityGroup[];
  membership?: AccountabilityMembership;
  members: AccountabilityMembership[];
  exit_requests: MembershipExitRequest[];
  contact_requests: PartnerContactRequest[];
  pending_actions: number;
}

const EMPTY_WORKSPACE: AccountabilityWorkspace = {
  role: 'user',
  groups: [],
  members: [],
  exit_requests: [],
  contact_requests: [],
  pending_actions: 0,
};

export function useAccountability() {
  const [workspace, setWorkspace] =
    useState<AccountabilityWorkspace>(EMPTY_WORKSPACE);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextWorkspace, approvalRequests] = await Promise.all([
        apiClient<AccountabilityWorkspace>('/accountability/workspace'),
        apiClient<ApprovalRequest[]>('/approval-requests'),
      ]);
      setWorkspace(nextWorkspace);
      setRequests(approvalRequests ?? []);
    } catch (fetchError) {
      setError(fetchError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const mutate = useCallback(
    async <T>(request: Promise<T>) => {
      setMutating(true);
      try {
        const result = await request;
        await fetchData();
        return result;
      } finally {
        setMutating(false);
      }
    },
    [fetchData]
  );

  return {
    workspace,
    requests,
    loading,
    mutating,
    error,
    refetch: fetchData,
    createGroup: (name: string, description: string) =>
      mutate(
        apiClient<AccountabilityGroup>('/accountability/groups', {
          method: 'POST',
          body: JSON.stringify({ name, description }),
        })
      ),
    previewGroup: (code: string) =>
      apiClient<AccountabilityGroup>('/accountability/groups/preview', {
        method: 'POST',
        body: JSON.stringify({ code }),
      }),
    joinGroup: (code: string) =>
      mutate(
        apiClient<AccountabilityMembership>('/accountability/groups/join', {
          method: 'POST',
          body: JSON.stringify({ code, confirmed: true }),
        })
      ),
    rotateCode: (groupId: string) =>
      mutate(
        apiClient<{ join_code: string }>(
          `/accountability/groups/${groupId}/rotate-code`,
          { method: 'POST' }
        )
      ),
    archiveGroup: (groupId: string) =>
      mutate(
        apiClient(`/accountability/groups/${groupId}/archive`, {
          method: 'POST',
        })
      ),
    updateSharing: (membershipId: string, sharing: SharingPreferences) =>
      mutate(
        apiClient<AccountabilityMembership>(
          `/accountability/memberships/${membershipId}/sharing`,
          { method: 'PATCH', body: JSON.stringify(sharing) }
        )
      ),
    requestLeave: (
      membershipId: string,
      kind: 'normal' | 'unsafe',
      reason: string
    ) =>
      mutate(
        apiClient<MembershipExitRequest>(
          `/accountability/memberships/${membershipId}/leave`,
          { method: 'POST', body: JSON.stringify({ kind, reason }) }
        )
      ),
    resolveLeave: (requestId: string, decision: 'approved' | 'denied') =>
      mutate(
        apiClient(`/accountability/exit-requests/${requestId}/resolve`, {
          method: 'POST',
          body: JSON.stringify({ decision }),
        })
      ),
    removeMember: (membershipId: string, reason: string) =>
      mutate(
        apiClient(`/accountability/memberships/${membershipId}/remove`, {
          method: 'POST',
          body: JSON.stringify({ reason }),
        })
      ),
    createContactRequest: (
      membershipId: string,
      category: PartnerContactRequest['category'],
      message: string
    ) =>
      mutate(
        apiClient<PartnerContactRequest>('/accountability/contact-requests', {
          method: 'POST',
          body: JSON.stringify({
            membership_id: membershipId,
            category,
            message,
          }),
        })
      ),
    transitionContact: (requestId: string, status: string) =>
      mutate(
        apiClient(`/accountability/contact-requests/${requestId}/transition`, {
          method: 'POST',
          body: JSON.stringify({ status }),
        })
      ),
    cancelApproval: (requestId: string) =>
      mutate(
        apiClient(`/approval-requests/${requestId}/cancel`, {
          method: 'POST',
        })
      ),
    resolveApproval: (
      requestId: string,
      decision: 'approve' | 'deny',
      supportiveResponse: string
    ) =>
      mutate(
        apiClient(`/approval-requests/${requestId}/${decision}`, {
          method: 'POST',
          body: JSON.stringify({ supportive_response: supportiveResponse }),
        })
      ),
    resendEmailVerification: () =>
      apiClient<{ sent: boolean; preview_url?: string }>(
        '/auth/email-verification/resend',
        { method: 'POST' }
      ),
    startPhoneVerification: (phone: string) =>
      apiClient<{ sent: boolean; preview_code?: string }>(
        '/auth/phone-verification/start',
        { method: 'POST', body: JSON.stringify({ phone }) }
      ),
    confirmPhoneVerification: (code: string) =>
      apiClient<{ verified: boolean }>('/auth/phone-verification/confirm', {
        method: 'POST',
        body: JSON.stringify({ code }),
      }),
  };
}
