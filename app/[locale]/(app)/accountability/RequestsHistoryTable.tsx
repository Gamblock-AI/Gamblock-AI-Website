'use client';

import { Clock } from 'lucide-react';
import { ApprovalRequest } from '@/hooks/use-accountability';
import { useTranslations } from "next-intl";

interface RequestsHistoryTableProps {
  requests: ApprovalRequest[];
  onCancelRequest: (id: string) => void;
}

export function RequestsHistoryTable({
  requests,
  onCancelRequest,
}: RequestsHistoryTableProps) {
    const t = useTranslations('RequestsHistoryTable');
  if (requests.length === 0) return null;

  return (
    <div className="space-y-3 rounded-lg border border-slate-100 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
      <div className="flex items-center gap-3">
        <Clock className="text-navy size-5.5" />
        <h3 className="text-navy text-base font-black tracking-wider uppercase">
          {t('text_70')}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="text-navy w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 font-bold tracking-wider text-slate-400 uppercase">
              <th className="px-1 pb-3">ID</th>
              <th className="px-2 pb-3">Alasan</th>
              <th className="px-2 pb-3">Tanggal</th>
              <th className="px-2 pb-3">Status</th>
              <th className="px-2 pb-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="font-semibold text-slate-700">
            {requests.map((r) => (
              <tr
                key={r.id}
                className="border-b border-slate-50 transition-colors hover:bg-slate-50/40"
              >
                <td className="px-1 py-2.5 font-mono text-[10px] text-slate-400">
                  {r.id}
                </td>
                <td className="px-2 py-2.5 font-medium text-slate-600">
                  {r.reason || 'Tidak ada alasan'}
                </td>
                <td className="px-2 py-2.5 text-slate-400">
                  {r.created_at
                    ? new Date(r.created_at).toLocaleDateString('id-ID')
                    : '-'}
                </td>
                <td className="px-2 py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase ${
                      r.status.toLowerCase().includes('approved')
                        ? 'border border-emerald-100 bg-emerald-50 text-emerald-600'
                        : r.status.toLowerCase().includes('denied')
                          ? 'border border-red-100 bg-red-50 text-red-600'
                          : r.status.toLowerCase().includes('pending')
                            ? 'animate-pulse border border-amber-100 bg-amber-50 text-amber-600'
                            : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {r.status.toLowerCase().includes('approved')
                      ? 'Disetujui'
                      : r.status.toLowerCase().includes('denied')
                        ? 'Ditolak'
                        : r.status.toLowerCase().includes('pending')
                          ? 'Tertunda'
                          : 'Dibatalkan'}
                  </span>
                </td>
                <td className="px-2 py-2.5 text-right">
                  {r.status.toLowerCase().includes('pending') && (
                    <button
                      type="button"
                      onClick={() => onCancelRequest(r.id)}
                      className="text-crimson text-xs font-bold hover:underline"
                    >
                      Batalkan
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
