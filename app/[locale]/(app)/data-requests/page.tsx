'use client';

import { toast } from 'sonner';
import Swal from 'sweetalert2';

import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Download,
  Trash2,
  CheckCircle,
  Clock,
  Database,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useTranslations } from "next-intl";

interface DataRequest {
  id: string;
  date: string;
  type: string;
  status: string;
  result: string;
}

interface BackendDataRequest {
  id: string;
  type: string;
  status: string;
  requested_at?: string;
  result_path?: string;
}

export default function DataRequestsPage() {
    const t = useTranslations('data-requestsPage');
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      const data = await apiClient<BackendDataRequest[]>('/data-requests');
      const mapped = (data || []).map((r) => ({
        id: r.id || 'REQ-MOCK',
        date: r.requested_at
          ? new Date(r.requested_at).toLocaleDateString('id-ID')
          : '6 Juni 2026',
        type:
          r.type === 'export'
            ? 'Ekspor Data'
            : r.type === 'delete'
              ? 'Hapus Akun'
              : r.type,
        status:
          r.status === 'completed'
            ? 'Selesai'
            : r.status === 'pending'
              ? 'Diproses'
              : r.status,
        result: r.result_path ? 'Siap Unduh' : 'Menunggu',
      }));
      setRequests(mapped);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchRequests();
    }, 0);
  }, []);

  const handleAction = async (type: string) => {
    if (type === 'Hapus Akun') {
      Swal.fire({
        title: 'Hapus Akun Permanen?',
        text: 'Semua data pertahanan lokal dan akun Anda akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#C41E3A',
        cancelButtonColor: '#ccc',
        confirmButtonText: 'Ya, Hapus Akun!',
        cancelButtonText: 'Batal',
      }).then(async (result) => {
        if (result.isConfirmed) {
          executeRequest(type);
        }
      });
    } else {
      executeRequest(type);
    }
  };

  const executeRequest = async (type: string) => {
    setLoading(true);
    try {
      const typeKey = type === 'Ekspor Data' ? 'export' : 'delete';
      await apiClient('/data-requests', {
        method: 'POST',
        body: JSON.stringify({ type: typeKey }),
      });
      toast.success(`Permintaan ${type.toLowerCase()} Anda berhasil diajukan!`);
      fetchRequests();
    } catch (err) {
      toast.error('Gagal mengajukan permintaan data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-navy w-full space-y-3">
      {/* Header Banner */}
      <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        <div className="space-y-1">
          <span className="bg-navy/5 text-navy rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase">
            {t('text_122')}</span>
          <h1 className="text-navy mt-2 text-xl font-bold tracking-tight">
            {t('text_123')}</h1>
          <p className="text-sm text-slate-500">
            {t('text_124')}</p>
        </div>
      </div>

      {/* Notification Toast */}
      {showNotification && (
        <div className="animate-fade-in flex items-center gap-3.5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 shadow-sm">
          <CheckCircle className="size-5 shrink-0 text-emerald-600" />
          <span>{showNotification}</span>
        </div>
      )}

      {/* Core Actions Grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {/* Export Card */}
        <div className="flex flex-col justify-between space-y-3 rounded-lg border border-slate-100 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <div className="space-y-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
              <Database className="size-5.5" />
            </div>
            <h3 className="text-navy text-sm font-semibold">
              {t('text_125')}</h3>
            <p className="text-xs leading-relaxed text-slate-500">
              {t('text_126')}</p>
          </div>

          <button
            type="button"
            onClick={() => handleAction('Ekspor Data')}
            disabled={loading}
            className="bg-navy hover:bg-navy/90 py-2.5.5 flex w-full cursor-pointer items-center justify-center gap-1.5 self-start rounded-full px-4 text-xs font-bold text-white shadow-md shadow-blue-500/5 transition-all disabled:opacity-50 sm:w-auto"
          >
            {t('text_127')}<Download className="size-3.5" />
          </button>
        </div>

        {/* Delete Card */}
        <div className="flex flex-col justify-between space-y-3 rounded-lg border border-slate-100 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <div className="space-y-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <ShieldAlert className="size-5.5" />
            </div>
            <h3 className="text-navy text-sm font-semibold">
              {t('text_128')}</h3>
            <p className="text-xs leading-relaxed text-slate-500">
              {t('text_129')}</p>
          </div>

          <button
            type="button"
            onClick={() => handleAction('Hapus Akun')}
            disabled={loading}
            className="bg-crimson hover:bg-crimson/90 py-2.5.5 flex w-full cursor-pointer items-center justify-center gap-1.5 self-start rounded-full px-4 text-xs font-bold text-white shadow-md shadow-red-500/10 transition-all disabled:opacity-50 sm:w-auto"
          >
            {t('text_130')}<Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* History table */}
      <div className="space-y-3 rounded-lg border border-slate-100 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        <h3 className="text-navy text-sm font-semibold">
          {t('text_131')}</h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold tracking-wider text-slate-400 uppercase">
                <th className="px-3 py-2.5">ID</th>
                <th className="px-3 py-2.5">{t('text_132')}</th>
                <th className="px-3 py-2.5">{t('text_133')}</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">{t('text_134')}</th>
              </tr>
            </thead>
            <tbody className="font-semibold text-slate-700">
              {requests.length === 0 ? (
                <tr className="border-b border-slate-50">
                  <td
                    colSpan={5}
                    className="py-2.5 text-center text-xs font-semibold text-slate-400"
                  >
                    {t('text_135')}</td>
                </tr>
              ) : (
                requests.map((r, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-50 transition-colors hover:bg-slate-50/40"
                  >
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-400">
                      {r.id}
                    </td>
                    <td className="px-3 py-2.5 text-xs">{r.date}</td>
                    <td className="px-3 py-2.5 text-xs">{r.type}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${
                          r.status === 'Selesai' || r.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'animate-pulse bg-blue-50 text-blue-600'
                        }`}
                      >
                        {r.status === 'completed' ? 'Selesai' : r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      {r.result === 'Siap Unduh' ? (
                        <span className="text-crimson flex cursor-pointer items-center gap-1 font-bold hover:underline">
                          <Download className="size-3.5" /> {t('text_136')}</span>
                      ) : (
                        <span className="flex items-center gap-1 font-bold text-slate-400">
                          <Clock className="size-3.5" /> {r.result}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
