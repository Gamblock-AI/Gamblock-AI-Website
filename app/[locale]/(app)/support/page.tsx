'use client';

import { toast } from 'sonner';

import { useState, useEffect } from 'react';
import { HelpCircle, Send, CheckCircle, Clock, Info } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useTranslations } from "next-intl";

interface Ticket {
  id: string;
  subject: string;
  priority: string;
  status: string;
  date: string;
}

interface BackendSupportCase {
  id: string;
  title?: string;
  summary?: string;
  priority: string;
  status: string;
  created_at?: string;
}

export default function SupportPage() {
    const t = useTranslations('supportPage');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const fetchTickets = async () => {
    try {
      const data = await apiClient<BackendSupportCase[]>('/support-cases');
      const mapped = (data || []).map((c) => ({
        id: c.id || 'CASE-MOCK',
        subject: c.title || c.summary || 'Bantuan Teknis',
        priority:
          c.priority === 'high'
            ? 'Tinggi'
            : c.priority === 'normal'
              ? 'Normal'
              : c.priority === 'low'
                ? 'Rendah'
                : 'Mendesak',
        status:
          c.status === 'open'
            ? 'Terbuka'
            : c.status === 'waiting_user'
              ? 'Menunggu Jawaban'
              : c.status === 'resolved'
                ? 'Selesai'
                : c.status,
        date: c.created_at
          ? new Date(c.created_at).toLocaleDateString('id-ID')
          : '6 Juni 2026',
      }));
      setTickets(mapped);
    } catch (err) {
      console.error('Failed to load tickets', err);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchTickets();
    }, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setLoading(true);
    try {
      // Map priority
      let pKey = 'normal';
      if (priority === 'Rendah') pKey = 'low';
      if (priority === 'Tinggi') pKey = 'high';
      if (priority === 'Mendesak') pKey = 'urgent';

      await apiClient('/support-cases', {
        method: 'POST',
        body: JSON.stringify({
          type: 'device_recovery',
          summary: `${subject} - ${description}`,
          priority: pKey,
        }),
      });

      setSubject('');
      setDescription('');
      toast.success(
        'Tiket dukungan Anda berhasil dibuat! Tim teknis kami akan merespons dalam 24 jam.'
      );
      fetchTickets();
    } catch (err) {
      toast.error('Gagal mengirim tiket bantuan.');
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
            {t('text_221')}</span>
          <h1 className="text-navy mt-2 text-xl font-bold tracking-tight">
            {t('text_222')}</h1>
          <p className="text-sm text-slate-500">
            {t('text_223')}</p>
        </div>
      </div>

      {/* Ticket Success Toast */}
      {showNotification && (
        <div className="animate-fade-in flex items-center gap-3.5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 shadow-sm">
          <CheckCircle className="size-5 shrink-0 text-emerald-600" />
          <span>
            {t('text_224')}</span>
        </div>
      )}

      {/* Grid: Create Ticket & Active Tickets */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Create Ticket Form (2/3) */}
        <div className="space-y-3 rounded-lg border border-slate-100 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] lg:col-span-2">
          <h3 className="text-navy text-sm font-semibold">
            {t('text_225')}</h3>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-slate-600 uppercase">
                {t('text_226')}</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t('text_233')}
                className="py-2.5.5 focus:ring-navy w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-transparent focus:ring-2 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-slate-600 uppercase">
                {t('text_227')}</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="focus:ring-navy w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow-sm focus:border-transparent focus:ring-2 focus:outline-none"
              >
                <option>Rendah</option>
                <option>Normal</option>
                <option>Tinggi</option>
                <option>Mendesak</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-slate-600 uppercase">
                {t('text_228')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('text_234')}
                rows={5}
                className="focus:ring-navy w-full rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-transparent focus:ring-2 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-navy hover:bg-navy/90 py-2.5.5 flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 pt-2 text-xs font-bold text-white shadow-md shadow-blue-500/5 transition-all disabled:opacity-50"
            >
              {loading ? 'Mengirim...' : 'Kirim Tiket Bantuan'}{' '}
              <Send className="size-3.5" />
            </button>
          </form>
        </div>

        {/* Support cases history (1/3) */}
        <div className="flex flex-col justify-between space-y-3 rounded-lg border border-slate-100 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <div className="space-y-3">
            <h3 className="text-navy text-sm font-semibold">
              {t('text_229')}</h3>

            <div className="space-y-3">
              {tickets.length === 0 ? (
                <p className="py-2.5 text-center text-xs font-semibold text-slate-400">
                  {t('text_230')}</p>
              ) : (
                tickets.map((ticket, idx) => (
                  <div
                    key={idx}
                    className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/20 p-4"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase">
                      <span className="font-mono text-slate-400">{ticket.id}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 ${
                          ticket.status === 'Terbuka' || ticket.status === 'open'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                    <h4 className="text-navy text-xs leading-snug font-bold">
                      {ticket.subject}
                    </h4>
                    <div className="flex items-center justify-between border-t border-slate-50 pt-1 text-[10px] font-bold text-slate-400">
                      <span>
                        {t('text_231')}{' '}
                        <strong
                          className={
                            ticket.priority === 'Tinggi'
                              ? 'text-red-500'
                              : 'text-slate-600'
                          }
                        >
                          {ticket.priority}
                        </strong>
                      </span>
                      <span>{ticket.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-2 flex gap-3.5 rounded-xl border border-blue-100/50 bg-blue-50/50 p-4 text-[11px] leading-relaxed text-slate-600">
            <Info className="text-navy mt-0.5 size-5 shrink-0" />
            <span>
              {t('text_232')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
