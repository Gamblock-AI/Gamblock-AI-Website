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
      <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        <div className="space-y-1">
          <span className="bg-navy/5 text-navy rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase">
            {t('text_71')}</span>
          <h1 className="text-navy mt-2 text-xl font-bold tracking-tight">
            {t('text_72')}</h1>
          <p className="text-sm text-slate-500">
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
          <div className="space-y-3 rounded-lg border border-slate-100 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-3.5 border-b border-slate-50 pb-1">
              <ShieldAlert className="text-crimson size-5" />
              <h3 className="text-base font-black tracking-tight">
                {t('text_74')}</h3>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h4 className="text-navy text-sm font-bold">
                  {t('text_75')}</h4>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  {t('text_76')}</p>
              </div>
              <input
                type="checkbox"
                checked={antiUninstall}
                onChange={(e) => handleAntiUninstallToggle(e.target.checked)}
                className="text-navy focus:ring-navy mt-1 size-5 cursor-pointer rounded border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Right Side (1/3): Summary Stats and Info */}
        <div className="space-y-3">
          <div className="from-navy to-navy-dark relative overflow-hidden rounded-lg bg-gradient-to-br p-4 text-white shadow-[0_15px_30px_rgba(27,43,94,0.15)]">
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/10">
                  <ShieldCheck className="size-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold tracking-wide">
                    {t('text_77')}</h4>
                  <p className="text-[10px] font-medium text-slate-300">
                    {t('text_78')}</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-white/10 pt-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/60">{t('text_79')}</span>
                  <span className="font-semibold text-white/90">
                    {partnerStatus === 'active'
                      ? 'Tinggi (Terkunci)'
                      : 'Rendah'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">{t('text_80')}</span>
                  <span className="font-semibold text-white/90">
                    {partnerStatus === 'active' ? 'Ya, Pendamping' : 'Tidak'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-slate-100 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
            <h4 className="text-xs font-extrabold tracking-wider uppercase">
              {t('text_81')}</h4>
            <p className="text-[11px] leading-relaxed font-semibold text-slate-400">
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
