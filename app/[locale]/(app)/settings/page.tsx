'use client';

import { toast } from 'sonner';
import { useState } from 'react';
import { ShieldAlert, Save, CheckCircle } from 'lucide-react';
import { useAccountability } from '@/hooks/use-accountability';
import { ApprovalRequestModal } from '../accountability/ApprovalRequestModal';
import { PendingRequestNotification } from '../accountability/PendingRequestNotification';
import { RequestsHistoryTable } from '../accountability/RequestsHistoryTable';
import { PartnerSetupCard } from '../accountability/PartnerSetupCard';
import { SensitivitySelector } from './SensitivitySelector';
import { NotificationSelector } from './NotificationSelector';
import { useTranslations } from "next-intl";

export default function SettingsPage() {
    const t = useTranslations('settingsPage');
  const [sensitivity, setSensitivity] = useState('Sedang');
  const [notificationStatus, setNotificationStatus] = useState('Semua');
  const [showSavedNotification, setShowSavedNotification] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (partnerEmail && partnerStatus === 'none') {
        await handleInvitePartner(partnerEmail);
      } else {
        toast.success('Pengaturan berhasil disimpan!');
        setToastMessage('Pengaturan berhasil disimpan!');
        setShowSavedNotification(true);
        setTimeout(() => setShowSavedNotification(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="text-navy relative w-full space-y-3">
      {/* Header Banner */}
      <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        <div className="space-y-1">
          <span className="bg-navy/5 text-navy rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase">
            {t('text_213')}</span>
          <h1 className="text-navy mt-2 text-xl font-bold tracking-tight">
            {t('text_214')}</h1>
          <p className="text-sm text-slate-500">
            {t('text_215')}</p>
        </div>
      </div>

      {/* Save Success Toast */}
      {showSavedNotification && (
        <div className="animate-fade-in flex items-center gap-3.5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 shadow-sm">
          <CheckCircle className="size-5 shrink-0 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Active Pending Request Notification */}
      <PendingRequestNotification
        pendingRequest={pendingRequest}
        onCancelRequest={handleCancelRequest}
      />

      {/* Settings Grid Form */}
      <form onSubmit={handleSave} className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          {/* AI Detection parameters */}
          <SensitivitySelector
            sensitivity={sensitivity}
            setSensitivity={setSensitivity}
          />

          {/* Accountability partner setup */}
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
            title={t('text_220')}
            isSettingsPage={true}
          />

          {/* Anti uninstall feature */}
          <div className="space-y-3 rounded-lg border border-slate-100 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-3.5 border-b border-slate-50 pb-3">
              <ShieldAlert className="text-crimson size-5" />
              <h3 className="text-navy text-base font-black tracking-wider uppercase">
                {t('text_216')}</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-navy text-sm font-bold">
                    {t('text_217')}</h4>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    {t('text_218')}</p>
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

          {/* Notification settings */}
          <NotificationSelector
            notificationStatus={notificationStatus}
            setNotificationStatus={setNotificationStatus}
          />
        </div>

        {/* Save button */}
        {partnerStatus === 'none' && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-navy hover:bg-navy/90 flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-8 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/5 transition-all disabled:opacity-50"
            >
              {t('text_219')}<Save className="size-4" />
            </button>
          </div>
        )}
      </form>

      {/* Requests History */}
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
