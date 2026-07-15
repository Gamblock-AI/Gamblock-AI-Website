import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export interface PartnerLink {
  id: string;
  partner_email: string;
  status: string;
}

export interface ApprovalRequest {
  id: string;
  action: string;
  status: string;
  reason: string;
  created_at: string;
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
    };
  }

  const invited = data.items?.find((partner) => partner.status === 'invited');
  if (invited) {
    return {
      email: invited.partner_email,
      status: 'invited' as const,
      id: invited.id,
    };
  }

  return { email: '', status: 'none' as const, id: null };
}

export function useAccountability() {
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerStatus, setPartnerStatus] = useState<
    'none' | 'invited' | 'active'
  >('none');
  const [partnerLinkId, setPartnerLinkId] = useState<string | null>(null);

  const [antiUninstall, setAntiUninstall] = useState(true);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approvalReason, setApprovalReason] = useState('');
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
        const inviteRes = await apiClient<{ id: string; status: string }>(
          '/partners/invitations',
          {
            method: 'POST',
            body: JSON.stringify({ email }),
          }
        );
        toast.success(`Undangan berhasil dikirim ke ${email}`);
        setPartnerStatus('invited');
        setPartnerLinkId(inviteRes.id);
        fetchData();
        return inviteRes;
      } catch (err) {
        toast.error('Gagal mengirim undangan pendamping.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchData]
  );

  const handleRevokePartner = useCallback(async () => {
    if (!partnerLinkId) return;
    try {
      await apiClient(`/partners/${partnerLinkId}/revoke`, {
        method: 'POST',
      });
      toast.success('Hubungan pendamping berhasil diputuskan.');
      setPartnerEmail('');
      setPartnerStatus('none');
      setPartnerLinkId(null);
      await fetchData();
    } catch (err) {
      toast.error('Gagal memutuskan hubungan pendamping.');
      throw err;
    }
  }, [partnerLinkId, fetchData]);

  const handleAntiUninstallToggle = useCallback(
    (checked: boolean) => {
      if (!checked && partnerStatus === 'active') {
        setIsModalOpen(true);
      } else {
        setAntiUninstall(checked);
      }
    },
    [partnerStatus]
  );

  const handleRequestApproval = useCallback(
    async (reason: string) => {
      if (!reason.trim()) return;

      setLoading(true);
      try {
        await apiClient('/approval-requests', {
          method: 'POST',
          body: JSON.stringify({
            action: 'disable_protection',
            reason,
            partner_link_id: partnerLinkId || 'pl_active',
          }),
        });

        toast.success(
          'Permohonan penonaktifan berhasil dikirim ke pendamping!'
        );
        setIsModalOpen(false);
        setApprovalReason('');
        fetchData();
      } catch (err) {
        toast.error('Gagal mengirim permohonan persetujuan.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [partnerLinkId, fetchData]
  );

  const handleCancelRequest = useCallback(
    async (id: string) => {
      try {
        await apiClient(`/approval-requests/${id}/cancel`, {
          method: 'POST',
        });
        toast.success('Permohonan berhasil dibatalkan.');
        await fetchData();
      } catch (err) {
        toast.error('Gagal membatalkan permohonan.');
        throw err;
      }
    },
    [fetchData]
  );

  const pendingRequest = requests.find((r) =>
    r.status.toLowerCase().includes('pending')
  );

  return {
    partnerEmail,
    setPartnerEmail,
    partnerStatus,
    partnerLinkId,
    antiUninstall,
    setAntiUninstall,
    requests,
    isModalOpen,
    setIsModalOpen,
    approvalReason,
    setApprovalReason,
    loading,
    dataLoading,
    dataError,
    fetchData,
    handleInvitePartner,
    handleRevokePartner,
    handleAntiUninstallToggle,
    handleRequestApproval,
    handleCancelRequest,
    pendingRequest,
  };
}
