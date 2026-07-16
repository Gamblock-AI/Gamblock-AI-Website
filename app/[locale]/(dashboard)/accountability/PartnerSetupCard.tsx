'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Skeleton } from '@/components/ui/skeleton';
import { ConnectedPartnerDetails } from './_components/connected-partner-details';
import { PartnerInviteForm } from './_components/partner-invite-form';
import { PartnerLinkPicker } from './_components/partner-link-picker';
import {
  getPartnerStatusTone,
  type PartnerSetupCardProps,
} from './_components/partner-types';
import { RevokePartnerDialog } from './_components/revoke-partner-dialog';

export type { PartnerSetupCardProps } from './_components/partner-types';

export function PartnerSetupCard({
  partnerEmail,
  setPartnerEmail,
  partnerStatus,
  partnerLinkId,
  partnerLinks = [],
  inviteUrl,
  loading,
  dataLoading = false,
  onInvite,
  onSelectPartner,
  onRevokePartner,
}: PartnerSetupCardProps) {
  const t = useTranslations('accountabilityWorkspace');
  const [revokeOpen, setRevokeOpen] = useState(false);

  return (
    <DashboardPanel
      icon={Users}
      title={t('partnerTitle')}
      description={t('partnerDescription')}
      className="h-full"
      action={
        dataLoading ? (
          <Skeleton className="h-8 w-28 rounded-full" />
        ) : (
          <DashboardStatus tone={getPartnerStatusTone(partnerStatus)}>
            {t(`partnerStatus.${partnerStatus}`)}
          </DashboardStatus>
        )
      }
    >
      <PartnerLinkPicker
        links={partnerLinks}
        selectedId={partnerLinkId}
        onSelect={onSelectPartner}
      />
      {dataLoading ? (
        <PartnerSetupSkeleton label={t('loading')} />
      ) : partnerStatus === 'none' ? (
        <PartnerInviteForm
          email={partnerEmail}
          loading={loading}
          onEmailChange={setPartnerEmail}
          onInvite={onInvite}
        />
      ) : (
        <ConnectedPartnerDetails
          email={partnerEmail}
          status={partnerStatus}
          inviteUrl={inviteUrl}
          loading={loading}
          onInvite={onInvite}
          onRequestRevoke={() => setRevokeOpen(true)}
        />
      )}
      <RevokePartnerDialog
        open={revokeOpen}
        loading={loading}
        onOpenChange={setRevokeOpen}
        onRevoke={onRevokePartner}
      />
    </DashboardPanel>
  );
}

function PartnerSetupSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-3" role="status">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-11 w-full rounded-xl" />
      <Skeleton className="h-11 w-40 rounded-xl" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
