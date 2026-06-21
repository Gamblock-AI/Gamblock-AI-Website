'use client';

import React from 'react';
import { Key } from 'lucide-react';
import { useTranslations } from "next-intl";

interface NotificationSelectorProps {
  notificationStatus: string;
  setNotificationStatus: (val: string) => void;
}

export function NotificationSelector({
  notificationStatus,
  setNotificationStatus,
}: NotificationSelectorProps) {
    const t = useTranslations('NotificationSelector');
  return (
    <div className="space-y-3 rounded-lg border border-slate-100 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
      <div className="flex items-center gap-3.5 border-b border-slate-50 pb-3">
        <Key className="text-navy size-5" />
        <h3 className="text-navy text-base font-black tracking-wider uppercase">
          {t('text_203')}</h3>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            {t('text_204')}</label>
          <p className="text-[11px] text-slate-400">
            {t('text_205')}</p>
        </div>

        <select
          value={notificationStatus}
          onChange={(e) => setNotificationStatus(e.target.value)}
          className="focus:ring-navy w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-900 shadow-sm focus:border-transparent focus:ring-2 focus:outline-none"
        >
          <option>{t('text_206')}</option>
          <option>{t('text_207')}</option>
          <option>{t('text_208')}</option>
        </select>
      </div>
    </div>
  );
}
