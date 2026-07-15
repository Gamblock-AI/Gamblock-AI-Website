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
import { ApprovalRequestModal } from './ApprovalRequestModal';
import { PartnerSetupCard } from './PartnerSetupCard';
import { PendingRequestNotification } from './PendingRequestNotification';
import { RequestsHistoryTable } from './RequestsHistoryTable';

export default function AccountabilityPage() {
  const t = useTranslations('accountabilityWorkspace');
  const {
    partnerEmail,
    setPartnerEmail,
    partnerStatus,
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
    handleRequestApproval,
    handleCancelRequest,
    pendingRequest,
  } = useAccountability();

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
            tone="sage"
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

      <PendingRequestNotification
        pendingRequest={pendingRequest}
        onCancelRequest={handleCancelRequest}
      />

      <div className="grid gap-5 xl:grid-cols-12 xl:items-start">
        <div className="xl:col-span-7">
          <PartnerSetupCard
            partnerEmail={partnerEmail}
            setPartnerEmail={setPartnerEmail}
            partnerStatus={partnerStatus}
            loading={loading}
            dataLoading={dataLoading}
            onInvite={() => void handleInvitePartner(partnerEmail)}
            onRevokePartner={handleRevokePartner}
          />
        </div>

        <DashboardPanel
          icon={ShieldCheck}
          title={t('approvalTitle')}
          description={t('approvalDescription')}
          accent={partnerStatus === 'active' ? 'sage' : 'navy'}
          className="xl:col-span-5"
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
            <p className="text-sm leading-6 text-muted-foreground">
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
              {pendingRequest ? t('requestAlreadyPending') : t('requestDisable')}
            </Button>
          </div>
        </DashboardPanel>
      </div>

      <RequestsHistoryTable
        requests={requests}
        onCancelRequest={handleCancelRequest}
      />

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
    </DashboardPage>
  );
}
