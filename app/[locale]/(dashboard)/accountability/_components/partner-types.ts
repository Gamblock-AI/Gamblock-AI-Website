import type { PartnerLink } from '@/hooks/use-accountability';

export interface PartnerSetupCardProps {
  partnerEmail: string;
  setPartnerEmail: (value: string) => void;
  partnerStatus: 'none' | 'invited' | 'active';
  partnerLinkId?: string | null;
  partnerLinks?: PartnerLink[];
  inviteUrl?: string | null;
  loading: boolean;
  dataLoading?: boolean;
  onInvite: (email: string) => void;
  onSelectPartner?: (id: string) => void;
  onRevokePartner: () => Promise<void> | void;
}

export function getPartnerStatusTone(
  status: PartnerSetupCardProps['partnerStatus']
) {
  if (status === 'active') return 'sage' as const;
  if (status === 'invited') return 'amber' as const;
  return 'muted' as const;
}
