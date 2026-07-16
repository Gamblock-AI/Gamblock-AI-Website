'use client';

import {
  CircleAlert,
  HeartHandshake,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { useAccountability } from '@/hooks/use-accountability';
import { useLocalUser } from '@/hooks/use-local-user';
import { ApprovalRequestModal } from './ApprovalRequestModal';
import { PartnerSetupCard } from './PartnerSetupCard';
import { PendingRequestNotification } from './PendingRequestNotification';
import { RequestsHistoryTable } from './RequestsHistoryTable';

export default function AccountabilityPage() {
  const t = useTranslations('accountabilityWorkspace');
  const user = useLocalUser();
  const {
    partnerEmail,
    setPartnerEmail,
    partnerStatus,
    partnerLinkId,
    partnerLinks,
    relationshipRole,
    inviteUrl,
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
    selectPartner,
    handleRevokePartner,
    handleRequestApproval,
    handleCancelRequest,
    handleResolveRequest,
    pendingRequest,
  } = useAccountability();
  const isPartner = relationshipRole === 'partner';

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={HeartHandshake}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        aside={
          <DashboardNotice
            icon={LockKeyhole}
            title={t('privacyTitle')}
          >
            {t('privacyBody')}
          </DashboardNotice>
        }
      />

      {dataError ? (
        <DashboardNotice
          icon={CircleAlert}
          title={t('errorTitle')}
          tone="amber"
          role="alert"
          action={
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => void fetchData()}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              {t('retry')}
            </Button>
          }
        >
          <p>{t('errorBody')}</p>
        </DashboardNotice>
      ) : null}

      {!isPartner && (
        <PendingRequestNotification
          pendingRequest={pendingRequest}
          onCancelRequest={handleCancelRequest}
        />
      )}

      {!isPartner && (
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="h-full">
            <PartnerSetupCard
              partnerEmail={partnerEmail}
              setPartnerEmail={setPartnerEmail}
              partnerStatus={partnerStatus}
              partnerLinkId={partnerLinkId}
              partnerLinks={partnerLinks}
              inviteUrl={inviteUrl}
              loading={loading}
              dataLoading={dataLoading}
              onInvite={(email) => void handleInvitePartner(email)}
              onSelectPartner={selectPartner}
              onRevokePartner={handleRevokePartner}
            />
          </div>

          <DashboardPanel
            icon={ShieldCheck}
            title={t('approvalTitle')}
            description={t('approvalDescription')}
            className="h-full"
            action={
              <DashboardStatus
                tone={partnerStatus === 'active' ? 'sage' : 'muted'}
              >
                {partnerStatus === 'active'
                  ? t('approvalReady')
                  : t('approvalUnavailable')}
              </DashboardStatus>
            }
          >
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm leading-6">
                {partnerStatus === 'active'
                  ? t('approvalActiveBody')
                  : t('approvalInactiveBody')}
              </p>
              <Button
                size="lg"
                className="w-full"
                disabled={partnerStatus !== 'active' || Boolean(pendingRequest)}
                onClick={() => setIsModalOpen(true)}
              >
                <LockKeyhole className="size-4" aria-hidden="true" />
                {pendingRequest
                  ? t('requestAlreadyPending')
                  : t('requestDisable')}
              </Button>
            </div>
          </DashboardPanel>
        </div>
      )}

      {isPartner && (
        <DashboardNotice
          icon={ShieldCheck}
          title={t('partnerInboxTitle')}
        >
          {t('partnerInboxBody')}
        </DashboardNotice>
      )}

      <RequestsHistoryTable
        requests={requests}
        onCancelRequest={handleCancelRequest}
        onResolveRequest={handleResolveRequest}
        viewerRole={isPartner ? 'partner' : user.role}
      />

      {!isPartner && (
        <ApprovalRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(event) => {
            event.preventDefault();
            void handleRequestApproval(approvalReason);
          }}
          reason={approvalReason}
          setReason={setApprovalReason}
          loading={loading}
        />
      )}
    </DashboardPage>
  );
}
