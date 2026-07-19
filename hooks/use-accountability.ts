'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useApiQuery } from './use-api';

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
  status: 'pending' | 'acknowledged' | 'closed' | 'cancelled' | 'escalated';
  acknowledged_at?: string;
  closed_at?: string;
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
  resolved_at?: string;
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

type AccountabilityWorkspaceResponse = Omit<
  AccountabilityWorkspace,
  'groups' | 'membership' | 'members' | 'exit_requests' | 'contact_requests'
> & {
  groups?: AccountabilityGroup[] | null;
  membership?: AccountabilityMembership | null;
  members?: AccountabilityMembership[] | null;
  exit_requests?: MembershipExitRequest[] | null;
  contact_requests?: PartnerContactRequest[] | null;
};

const EMPTY_WORKSPACE: AccountabilityWorkspace = {
  role: 'user',
  groups: [],
  members: [],
  exit_requests: [],
  contact_requests: [],
  pending_actions: 0,
};

const EMPTY_CONTACT_REQUESTS: PartnerContactRequest[] = [];

function normalizeWorkspace(
  workspace: AccountabilityWorkspaceResponse | null | undefined
): AccountabilityWorkspace {
  if (!workspace) return EMPTY_WORKSPACE;
  return {
    ...workspace,
    groups: workspace.groups ?? [],
    membership: workspace.membership ?? undefined,
    members: workspace.members ?? [],
    exit_requests: workspace.exit_requests ?? [],
    contact_requests: workspace.contact_requests ?? [],
  };
}

export function usePartnerContactRequests() {
  const [mutating, setMutating] = useState(false);
  const query = useApiQuery<AccountabilityWorkspaceResponse>(
    '/accountability/workspace'
  );
  const { refetch } = query;
  const workspace = useMemo(
    () => (query.data ? normalizeWorkspace(query.data) : null),
    [query.data]
  );

  const mutate = useCallback(
    async <T>(request: () => Promise<T>) => {
      setMutating(true);
      try {
        const result = await request();
        await refetch();
        return result;
      } finally {
        setMutating(false);
      }
    },
    [refetch]
  );

  const createRequest = useCallback(
    (
      membershipId: string,
      category: PartnerContactRequest['category'],
      message: string
    ) =>
      mutate(() =>
        apiClient<PartnerContactRequest>('/accountability/contact-requests', {
          method: 'POST',
          body: JSON.stringify({
            membership_id: membershipId,
            category,
            message,
          }),
        })
      ),
    [mutate]
  );

  const transitionRequest = useCallback(
    (requestId: string, status: string) =>
      mutate(() =>
        apiClient(`/accountability/contact-requests/${requestId}/transition`, {
          method: 'POST',
          body: JSON.stringify({ status }),
        })
      ),
    [mutate]
  );

  return {
    workspace,
    requests: workspace?.contact_requests ?? EMPTY_CONTACT_REQUESTS,
    loading: query.loading,
    error: query.error,
    mutating,
    refetch,
    createRequest,
    transitionRequest,
  };
}

export function useAccountability() {
  const [workspace, setWorkspace] =
    useState<AccountabilityWorkspace>(EMPTY_WORKSPACE);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutatingActions, setMutatingActions] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const [error, setError] = useState<unknown>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextWorkspace, approvalRequests] = await Promise.all([
        apiClient<AccountabilityWorkspaceResponse>('/accountability/workspace'),
        apiClient<ApprovalRequest[]>('/approval-requests'),
      ]);
      setWorkspace(normalizeWorkspace(nextWorkspace));
      setRequests(approvalRequests ?? []);
    } catch (fetchError) {
      setError(fetchError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [nextWorkspace, approvalRequests] = await Promise.all([
          apiClient<AccountabilityWorkspaceResponse>(
            '/accountability/workspace'
          ),
          apiClient<ApprovalRequest[]>('/approval-requests'),
        ]);
        if (!active) return;
        setWorkspace(normalizeWorkspace(nextWorkspace));
        setRequests(approvalRequests ?? []);
      } catch (fetchError) {
        if (active) setError(fetchError);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const mutate = useCallback(
    async <T>(action: string, request: () => Promise<T>) => {
      setMutatingActions((current) => new Set(current).add(action));
      try {
        const result = await request();
        await fetchData();
        return result;
      } finally {
        setMutatingActions((current) => {
          const next = new Set(current);
          next.delete(action);
          return next;
        });
      }
    },
    [fetchData]
  );

  return {
    workspace,
    requests,
    loading,
    mutating: mutatingActions.size > 0,
    isMutating: (action: string) => mutatingActions.has(action),
    error,
    refetch: fetchData,
    createGroup: (name: string, description: string) =>
      mutate('group:create', () =>
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
      mutate('group:join', () =>
        apiClient<AccountabilityMembership>('/accountability/groups/join', {
          method: 'POST',
          body: JSON.stringify({ code, confirmed: true }),
        })
      ),
    rotateCode: (groupId: string) =>
      mutate(`group:${groupId}:rotate`, () =>
        apiClient<{ join_code: string }>(
          `/accountability/groups/${groupId}/rotate-code`,
          { method: 'POST' }
        )
      ),
    archiveGroup: (groupId: string) =>
      mutate(`group:${groupId}:archive`, () =>
        apiClient(`/accountability/groups/${groupId}/archive`, {
          method: 'POST',
        })
      ),
    updateSharing: (membershipId: string, sharing: SharingPreferences) =>
      mutate('sharing:update', () =>
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
      mutate(`leave:${kind}`, () =>
        apiClient<MembershipExitRequest>(
          `/accountability/memberships/${membershipId}/leave`,
          { method: 'POST', body: JSON.stringify({ kind, reason }) }
        )
      ),
    cancelLeave: (requestId: string) =>
      mutate(`leave:${requestId}:cancel`, () =>
        apiClient(`/accountability/exit-requests/${requestId}/cancel`, {
          method: 'POST',
        })
      ),
    resolveLeave: (requestId: string, decision: 'approved' | 'denied') =>
      mutate(`leave:${requestId}:${decision}`, () =>
        apiClient(`/accountability/exit-requests/${requestId}/resolve`, {
          method: 'POST',
          body: JSON.stringify({ decision }),
        })
      ),
    removeMember: (membershipId: string, reason: string) =>
      mutate(`membership:${membershipId}:remove`, () =>
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
      mutate('contact:create', () =>
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
      mutate(`contact:${requestId}:${status}`, () =>
        apiClient(`/accountability/contact-requests/${requestId}/transition`, {
          method: 'POST',
          body: JSON.stringify({ status }),
        })
      ),
    cancelApproval: (requestId: string) =>
      mutate(`approval:${requestId}:cancel`, () =>
        apiClient(`/approval-requests/${requestId}/cancel`, {
          method: 'POST',
        })
      ),
    resolveApproval: (
      requestId: string,
      decision: 'approve' | 'deny',
      supportiveResponse: string
    ) =>
      mutate(`approval:${requestId}:${decision}`, () =>
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
