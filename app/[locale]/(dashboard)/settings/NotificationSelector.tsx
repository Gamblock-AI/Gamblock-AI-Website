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
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-3.5 border-b border-border pb-3">
        <Key className="text-navy size-5" />
        <h3 className="text-navy text-base font-black tracking-wider uppercase">
          {t('text_203')}</h3>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            {t('text_204')}</label>
          <p className="text-[11px] text-muted-foreground">
            {t('text_205')}</p>
        </div>

        <select
          value={notificationStatus}
          onChange={(e) => setNotificationStatus(e.target.value)}
          className="focus:ring-navy w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-navy shadow-sm focus:border-transparent focus:ring-2 focus:outline-none"
        >
          <option>{t('text_206')}</option>
          <option>{t('text_207')}</option>
          <option>{t('text_208')}</option>
        </select>
      </div>
    </div>
  );
}
