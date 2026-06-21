'use client';

import React from 'react';
import { Users, HeartHandshake, Trash2 } from 'lucide-react';
import { useTranslations } from "next-intl";

interface PartnerSetupCardProps {
  partnerEmail: string;
  setPartnerEmail: (val: string) => void;
  partnerStatus: 'none' | 'invited' | 'active';
  loading: boolean;
  onSubmitInvite: (e: React.FormEvent) => void;
  onRevokePartner: () => void;
  title?: string;
  isSettingsPage?: boolean;
}

export function PartnerSetupCard({
  partnerEmail,
  setPartnerEmail,
  partnerStatus,
  loading,
  onSubmitInvite,
  onRevokePartner,
  title = 'Akun Pendamping Akuntabilitas',
  isSettingsPage = false,
}: PartnerSetupCardProps) {
    const t = useTranslations('PartnerSetupCard');
  return (
    <div className="space-y-3 rounded-lg border border-slate-100 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
      <div className="flex items-center justify-between border-b border-slate-50 pb-1">
        <div className="flex items-center gap-3.5">
          <Users className="text-navy size-5" />
          <h3 className="text-navy text-base font-black tracking-wider uppercase">
            {title}
          </h3>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${
            partnerStatus === 'active'
              ? 'border border-emerald-100 bg-emerald-50 text-emerald-600'
              : partnerStatus === 'invited'
                ? 'animate-pulse border border-blue-100 bg-blue-50 text-blue-600'
                : 'bg-slate-100 text-slate-500'
          }`}
        >
          {partnerStatus === 'active'
            ? 'Aktif'
            : partnerStatus === 'invited'
              ? 'Menunggu Penerimaan'
              : 'Belum Terhubung'}
        </span>
      </div>

      {partnerStatus === 'none' ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              {t('text_58')}</label>
            <p className="text-[11px] text-slate-400">
              {t('text_59')}</p>
            <input
              type="email"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
              placeholder={t('text_63')}
              disabled={loading}
              className="py-2.5.5 focus:ring-navy w-full rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-transparent focus:ring-2 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
              required
            />
          </div>
          {!isSettingsPage && (
            <button
              onClick={onSubmitInvite}
              disabled={loading}
              className="bg-navy hover:bg-navy/90 py-2.5.5 flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 text-xs font-bold text-white shadow-md shadow-blue-500/5 transition-all disabled:opacity-50"
            >
              <HeartHandshake className="size-4" /> {t('text_60')}</button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-5">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {t('text_61')}</span>
            <p className="text-navy text-sm font-bold">{partnerEmail}</p>
            <p className="text-[11px] leading-relaxed font-semibold text-slate-400">
              {partnerStatus === 'active'
                ? 'Pendamping Anda saat ini memegang kendali otorisasi untuk membuka proteksi aplikasi.'
                : 'Menunggu pendamping menerima undangan Anda via tautan verifikasi email.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onRevokePartner}
            className="py-2.5.5 flex cursor-pointer items-center gap-1 rounded-xl border border-red-200 px-4 text-xs font-bold text-red-600 transition-all hover:bg-red-50"
          >
            <Trash2 className="size-3.5" /> {t('text_62')}</button>
        </div>
      )}
    </div>
  );
}
