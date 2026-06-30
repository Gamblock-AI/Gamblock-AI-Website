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
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <Clock className="text-navy size-5.5" />
        <h3 className="text-navy text-base font-black tracking-wider uppercase">
          {t('text_70')}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="text-navy w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border font-bold tracking-wider text-muted-foreground uppercase">
              <th className="px-1 pb-3">ID</th>
              <th className="px-2 pb-3">Alasan</th>
              <th className="px-2 pb-3">Tanggal</th>
              <th className="px-2 pb-3">Status</th>
              <th className="px-2 pb-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="font-semibold text-navy">
            {requests.map((r) => (
              <tr
                key={r.id}
                className="border-b border-border transition-colors hover:bg-muted/50/40"
              >
                <td className="px-1 py-2.5 font-mono text-[10px] text-muted-foreground">
                  {r.id}
                </td>
                <td className="px-2 py-2.5 font-medium text-muted-foreground">
                  {r.reason || 'Tidak ada alasan'}
                </td>
                <td className="px-2 py-2.5 text-muted-foreground">
                  {r.created_at
                    ? new Date(r.created_at).toLocaleDateString('id-ID')
                    : '-'}
                </td>
                <td className="px-2 py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase ${
                      r.status.toLowerCase().includes('approved')
                        ? 'border border-sage/20 bg-sage/10 text-sage'
                        : r.status.toLowerCase().includes('denied')
                          ? 'border border-crimson/20 bg-crimson/5 text-crimson'
                          : r.status.toLowerCase().includes('pending')
                            ? 'animate-pulse border border-amber-100 bg-amber-50 text-amber-600'
                            : 'bg-muted text-muted-foreground'
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
