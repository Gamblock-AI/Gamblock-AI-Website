'use client';

import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAccountability } from '@/hooks/use-accountability';
import { ApprovalRequestModal } from './ApprovalRequestModal';
import { PendingRequestNotification } from './PendingRequestNotification';
import { RequestsHistoryTable } from './RequestsHistoryTable';
import { PartnerSetupCard } from './PartnerSetupCard';
import { useTranslations } from "next-intl";

export default function AccountabilityPage() {
    const t = useTranslations('accountabilityPage');
  const {
    partnerEmail,
    setPartnerEmail,
    partnerStatus,
    antiUninstall,
    requests,
    isModalOpen,
    setIsModalOpen,
    approvalReason,
    setApprovalReason,
    loading,
    handleInvitePartner,
    handleRevokePartner,
    handleAntiUninstallToggle,
    handleRequestApproval,
    handleCancelRequest,
    pendingRequest,
  } = useAccountability();

  return (
    <div className="text-navy w-full space-y-3">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="space-y-1">
          <span className="bg-navy/5 text-navy rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase">
            {t('text_71')}</span>
          <h1 className="text-navy mt-2 text-xl font-bold tracking-tight">
            {t('text_72')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('text_73')}</p>
        </div>
      </div>

      {/* Active Pending Request Notification */}
      <PendingRequestNotification
        pendingRequest={pendingRequest}
        onCancelRequest={handleCancelRequest}
      />

      {/* Grid Content */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Left Side (2/3): Partner Setup and Lock Settings */}
        <div className="space-y-3 lg:col-span-2">
          {/* Partner Setup Card */}
          <PartnerSetupCard
            partnerEmail={partnerEmail}
            setPartnerEmail={setPartnerEmail}
            partnerStatus={partnerStatus}
            loading={loading}
            onSubmitInvite={(e) => {
              e.preventDefault();
              handleInvitePartner(partnerEmail);
            }}
            onRevokePartner={handleRevokePartner}
          />

          {/* Friction Lock Card */}
          <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center gap-3.5 border-b border-border pb-1">
              <ShieldAlert className="text-crimson size-5" />
              <h3 className="text-base font-black tracking-tight">
                {t('text_74')}</h3>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h4 className="text-navy text-sm font-bold">
                  {t('text_75')}</h4>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {t('text_76')}</p>
              </div>
              <input
                type="checkbox"
                checked={antiUninstall}
                onChange={(e) => handleAntiUninstallToggle(e.target.checked)}
                className="text-navy focus:ring-navy mt-1 size-5 cursor-pointer rounded border-input"
              />
            </div>
          </div>
        </div>

        {/* Right Side (1/3): Summary Stats and Info */}
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-sage/10">
                  <ShieldCheck className="size-5 text-sage" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold tracking-wide text-navy">
                    {t('text_77')}</h4>
                  <p className="text-[10px] font-medium text-muted-foreground">
                    {t('text_78')}</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('text_79')}</span>
                  <span className="font-semibold text-navy">
                    {partnerStatus === 'active'
                      ? 'Tinggi (Terkunci)'
                      : 'Rendah'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('text_80')}</span>
                  <span className="font-semibold text-navy">
                    {partnerStatus === 'active' ? 'Ya, Pendamping' : 'Tidak'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <h4 className="text-xs font-extrabold tracking-wider uppercase">
              {t('text_81')}</h4>
            <p className="text-[11px] leading-relaxed font-semibold text-muted-foreground">
              {t('text_82')}</p>
          </div>
        </div>
      </div>

      {/* Approval Requests History */}
      <RequestsHistoryTable
        requests={requests}
        onCancelRequest={handleCancelRequest}
      />

      {/* Approval Reason Request Modal */}
      <ApprovalRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(e) => {
          e.preventDefault();
          handleRequestApproval(approvalReason);
        }}
        reason={approvalReason}
        setReason={setApprovalReason}
        loading={loading}
      />
    </div>
  );
}
