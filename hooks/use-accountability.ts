import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

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

  const fetchData = useCallback(async () => {
    try {
      // Fetch partners
      const partnersData = await apiClient<{
        active_partner: PartnerLink | null | undefined;
        items: PartnerLink[];
      }>('/partners');
      if (partnersData.active_partner) {
        setPartnerEmail(partnersData.active_partner.partner_email);
        setPartnerStatus('active');
        setPartnerLinkId(partnersData.active_partner.id);
      } else if (partnersData.items && partnersData.items.length > 0) {
        const invited = partnersData.items.find((p) => p.status === 'invited');
        if (invited) {
          setPartnerEmail(invited.partner_email);
          setPartnerStatus('invited');
          setPartnerLinkId(invited.id);
        } else {
          setPartnerStatus('none');
          setPartnerLinkId(null);
        }
      } else {
        setPartnerStatus('none');
        setPartnerLinkId(null);
      }

      // Fetch approval requests
      const approvalData =
        await apiClient<ApprovalRequest[]>('/approval-requests');
      setRequests(approvalData || []);
    } catch (err) {
      console.error('Failed to load accountability data', err);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fetchData();
    }, 0);
  }, [fetchData]);

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
    const result = await Swal.fire({
      title: 'Putuskan Hubungan Pendamping?',
      text: 'Tindakan ini akan mencabut akses pendamping Anda secara permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C41E3A',
      cancelButtonColor: '#ccc',
      confirmButtonText: 'Ya, Putuskan!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await apiClient(`/partners/${partnerLinkId}/revoke`, {
          method: 'POST',
        });
        toast.success('Hubungan pendamping berhasil diputuskan.');
        setPartnerEmail('');
        setPartnerStatus('none');
        setPartnerLinkId(null);
        fetchData();
      } catch (err) {
        toast.error('Gagal memutuskan hubungan pendamping.');
      }
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
      const result = await Swal.fire({
        title: 'Batalkan Permohonan?',
        text: 'Apakah Anda yakin ingin membatalkan permohonan persetujuan ini?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1B2B5E',
        cancelButtonColor: '#ccc',
        confirmButtonText: 'Ya, Batalkan!',
        cancelButtonText: 'Batal',
      });

      if (result.isConfirmed) {
        try {
          await apiClient(`/approval-requests/${id}/cancel`, {
            method: 'POST',
          });
          toast.success('Permohonan berhasil dibatalkan.');
          fetchData();
        } catch (err) {
          toast.error('Gagal membatalkan permohonan.');
        }
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
    fetchData,
    handleInvitePartner,
    handleRevokePartner,
    handleAntiUninstallToggle,
    handleRequestApproval,
    handleCancelRequest,
    pendingRequest,
  };
}
