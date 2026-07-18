import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export interface PartnerLink {
  id: string;
  partner_email: string;
  status: string;
  relationship_role?: 'owner' | 'partner';
}

export interface ApprovalRequest {
  id: string;
  device_id: string;
  partner_link_id: string;
  action: string;
  status: string;
  reason: string;
  requested_duration_minutes: number;
  created_at: string;
  expires_at?: string;
  resolved_at?: string;
  applied_at?: string;
  grant_expires_at?: string;
}

function resolvePartnerState(data: {
  active_partner: PartnerLink | null | undefined;
  items: PartnerLink[];
}) {
  if (data.active_partner) {
    return {
      email: data.active_partner.partner_email,
      status: 'active' as const,
      id: data.active_partner.id,
      relationshipRole: data.active_partner.relationship_role ?? 'owner',
    };
  }

  const invited = data.items?.find((partner) => partner.status === 'invited');
  if (invited) {
    return {
      email: invited.partner_email,
      status: 'invited' as const,
      id: invited.id,
      relationshipRole: invited.relationship_role ?? 'owner',
    };
  }

  return {
    email: '',
    status: 'none' as const,
    id: null,
    relationshipRole: null,
  };
}

export function useAccountability() {
  const t = useTranslations('accountabilityWorkspace');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerStatus, setPartnerStatus] = useState<
    'none' | 'invited' | 'active'
  >('none');
  const [partnerLinkId, setPartnerLinkId] = useState<string | null>(null);
  const [partnerLinks, setPartnerLinks] = useState<PartnerLink[]>([]);
  const [relationshipRole, setRelationshipRole] = useState<
    'owner' | 'partner' | null
  >(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<unknown>(null);

  const fetchData = useCallback(async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const [partnersData, approvalData] = await Promise.all([
        apiClient<{
          active_partner: PartnerLink | null | undefined;
          items: PartnerLink[];
        }>('/partners'),
        apiClient<ApprovalRequest[]>('/approval-requests'),
      ]);
      const nextPartner = resolvePartnerState(partnersData);
      setPartnerEmail(nextPartner.email);
      setPartnerStatus(nextPartner.status);
      setPartnerLinkId(nextPartner.id);
      setPartnerLinks(partnersData.items ?? []);
      setRelationshipRole(nextPartner.relationshipRole);
      setRequests(approvalData || []);
    } catch (err) {
      setDataError(err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Fetch on mount. setState only after `await` (lint-safe, no setTimeout).
  useEffect(() => {
    let active = true;
    Promise.all([
      apiClient<{
        active_partner: PartnerLink | null | undefined;
        items: PartnerLink[];
      }>('/partners'),
      apiClient<ApprovalRequest[]>('/approval-requests'),
    ])
      .then(([partnersData, approvalData]) => {
        if (!active) return;
        const nextPartner = resolvePartnerState(partnersData);
        setPartnerEmail(nextPartner.email);
        setPartnerStatus(nextPartner.status);
        setPartnerLinkId(nextPartner.id);
        setPartnerLinks(partnersData.items ?? []);
        setRelationshipRole(nextPartner.relationshipRole);
        setRequests(approvalData || []);
      })
      .catch((err: unknown) => {
        if (active) setDataError(err);
      })
      .finally(() => {
        if (active) setDataLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleInvitePartner = useCallback(
    async (email: string) => {
      if (!email.trim()) return;
      setLoading(true);
      try {
        const inviteRes = await apiClient<{
          id: string;
          status: string;
          invite_url: string;
          expires_in: string;
        }>('/partners/invitations', {
          method: 'POST',
          body: JSON.stringify({ email }),
        });
        toast.success(t('inviteSuccess', { email }));
        setPartnerStatus('invited');
        setPartnerLinkId(inviteRes.id);
        setInviteUrl(inviteRes.invite_url);
        fetchData();
        return inviteRes;
      } catch (err) {
        toast.error(t('inviteError'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchData, t]
  );

  const selectPartner = useCallback(
    (id: string) => {
      const selected = partnerLinks.find((partner) => partner.id === id);
      if (!selected) return;
      setPartnerLinkId(selected.id);
      setPartnerEmail(selected.partner_email);
      setPartnerStatus(
        selected.status === 'active'
          ? 'active'
          : selected.status === 'invited'
            ? 'invited'
            : 'none'
      );
      setRelationshipRole(selected.relationship_role ?? 'owner');
    },
    [partnerLinks]
  );

  const handleRevokePartner = useCallback(async () => {
    if (!partnerLinkId) return;
    try {
      await apiClient(`/partners/${partnerLinkId}/revoke`, {
        method: 'POST',
      });
      toast.success(t('revokeSuccess'));
      setPartnerEmail('');
      setPartnerStatus('none');
      setPartnerLinkId(null);
      setRelationshipRole(null);
      setInviteUrl(null);
      await fetchData();
    } catch (err) {
      toast.error(t('revokeError'));
      throw err;
    }
  }, [partnerLinkId, fetchData, t]);

  const handleCancelRequest = useCallback(
    async (id: string) => {
      try {
        await apiClient(`/approval-requests/${id}/cancel`, {
          method: 'POST',
        });
        toast.success(t('requestCancelSuccess'));
        await fetchData();
      } catch (err) {
        toast.error(t('requestCancelError'));
        throw err;
      }
    },
    [fetchData, t]
  );

  const handleResolveRequest = useCallback(
    async (id: string, decision: 'approve' | 'deny') => {
      setLoading(true);
      try {
        await apiClient(`/approval-requests/${id}/${decision}`, {
          method: 'POST',
        });
        toast.success(
          decision === 'approve'
            ? t('requestApproveSuccess')
            : t('requestDenySuccess')
        );
        await fetchData();
      } catch (err) {
        toast.error(t('requestDecisionError'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchData, t]
  );

  const pendingRequest = requests.find(
    (request) => request.status === 'pending'
  );

  return {
    partnerEmail,
    setPartnerEmail,
    partnerStatus,
    partnerLinkId,
    partnerLinks,
    relationshipRole,
    inviteUrl,
    requests,
    loading,
    dataLoading,
    dataError,
    fetchData,
    handleInvitePartner,
    selectPartner,
    handleRevokePartner,
    handleCancelRequest,
    handleResolveRequest,
    pendingRequest,
  };
}
