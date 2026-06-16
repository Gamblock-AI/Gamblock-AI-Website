'use client';

import React from 'react';
import { Key } from 'lucide-react';

interface NotificationSelectorProps {
  notificationStatus: string;
  setNotificationStatus: (val: string) => void;
}

export function NotificationSelector({
  notificationStatus,
  setNotificationStatus,
}: NotificationSelectorProps) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-100 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
      <div className="flex items-center gap-3.5 border-b border-slate-50 pb-3">
        <Key className="text-navy size-5" />
        <h3 className="text-navy text-base font-black tracking-wider uppercase">
          Notifikasi & Laporan
        </h3>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Saluran Pengiriman
          </label>
          <p className="text-[11px] text-slate-400">
            Pilih jenis kejadian yang dilaporkan ke pendamping.
          </p>
        </div>

        <select
          value={notificationStatus}
          onChange={(e) => setNotificationStatus(e.target.value)}
          className="focus:ring-navy w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-900 shadow-sm focus:border-transparent focus:ring-2 focus:outline-none"
        >
          <option>Semua (Blokir, Aksesibilitas Mati, Request)</option>
          <option>Hanya Request & Peringatan Darurat</option>
          <option>Hanya Notifikasi In-App</option>
        </select>
      </div>
    </div>
  );
}
