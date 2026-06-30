'use client';

import { toast } from 'sonner';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';
import {
  Users,
  Check,
  X,
  ShieldAlert,
  Activity,
  Heart,
  LifeBuoy,
  Terminal,
} from 'lucide-react';
import { useTranslations } from "next-intl";

const staticPartners = [
  { name: 'RS Jiwa Jakarta', status: 'Aktif', date: '12 Jan 2026' },
  { name: 'Yayasan Anti Judi', status: 'Aktif', date: '5 Mar 2026' },
  { name: 'Klinik Psikologi Bandung', status: 'Pending', date: '1 Jun 2026' },
];

interface ApprovalRequest {
  id: string;
  action: string;
  status: string;
  reason: string;
  created_at: string;
}

interface PortalOverview {
  protected_users: number;
  partner_approvals: number;
  healthy_devices_percent: number;
  open_support: number;
  model_release: string;
  ruleset_release: string;
}

export default function PartnersPage() {
    const t = useTranslations('partnersPage');
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [overview, setOverview] = useState<PortalOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchPortalData = async () => {
    try {
      // Fetch overview metrics
      const overviewData = await apiClient<PortalOverview>('/portal/overview');
      setOverview(overviewData);

      // Fetch requests
      const data = await apiClient<ApprovalRequest[]>('/approval-requests');
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to fetch portal data', err);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchPortalData();
    }, 0);
  }, []);

  const handleResolve = async (id: string, action: 'approve' | 'deny') => {
    setLoading(true);
    try {
      await apiClient(`/approval-requests/${id}/${action}`, {
        method: 'POST',
      });
      setToastMessage(
        `Permohonan ${id} berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}.`
      );
      setTimeout(() => setToastMessage(null), 4000);
      fetchPortalData();
    } catch (err) {
      toast.error(t('toastError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-navy w-full space-y-3">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center gap-3.5 rounded-xl border border-sage/20 bg-sage/10 p-4 text-xs font-bold text-sage shadow-sm">
          <Check className="size-5 shrink-0 text-sage" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Portal Overview Stats Cards */}
      {overview && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-navy/5 text-navy">
                <Users className="size-6" />
              </div>
              <div>
                <p className="text-navy text-sm font-semibold tracking-tight">
                  {overview.protected_users}
                </p>
                <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  {t('text_142')}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-sage/10 text-sage">
                <Activity className="size-6" />
              </div>
              <div>
                <p className="text-navy text-sm font-semibold tracking-tight">
                  {overview.healthy_devices_percent}%
                </p>
                <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  {t('text_143')}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-crimson/5 text-crimson">
                <LifeBuoy className="size-6" />
              </div>
              <div>
                <p className="text-navy text-sm font-semibold tracking-tight">
                  {overview.open_support}
                </p>
                <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  {t('text_144')}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                <Terminal className="size-6" />
              </div>
              <div>
                <p className="text-navy text-sm font-black tracking-tight">
                  {overview.model_release}
                </p>
                <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  {t('text_145')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Accountability Requests Panel */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center gap-3.5 border-b border-border pb-1">
          <ShieldAlert className="text-crimson size-6" />
          <div>
            <h2 className="text-navy text-sm font-semibold">
              {t('text_146')}</h2>
            <p className="text-xs text-muted-foreground">
              {t('text_147')}</p>
          </div>
        </div>

        {requests.length === 0 ? (
          <p className="py-2.5 text-center text-xs font-semibold text-muted-foreground">
            {t('text_148')}</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t('text_149')}</TableHead>
                  <TableHead>{t('text_150')}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">{t('text_151')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-semibold text-navy">
                {requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">
                      {r.id}
                    </TableCell>
                    <TableCell className="text-navy font-bold">
                      {r.action === 'disable_protection'
                        ? 'Nonaktifkan Proteksi'
                        : r.action === 'pause_protection'
                          ? 'Jeda Proteksi'
                          : r.action}
                    </TableCell>
                    <TableCell className="leading-relaxed font-medium font-semibold text-muted-foreground italic">
                      {t('text_152')}{r.reason || 'Tidak ada alasan'}{t('text_153')}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          r.status.toLowerCase().includes('approved')
                            ? 'default'
                            : r.status.toLowerCase().includes('pending')
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {r.status.toLowerCase().includes('approved')
                          ? 'Disetujui'
                          : r.status.toLowerCase().includes('pending')
                            ? 'Tertunda'
                            : r.status.toLowerCase().includes('denied')
                              ? 'Ditolak'
                              : 'Dibatalkan'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {r.status.toLowerCase().includes('pending') ? (
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => handleResolve(r.id, 'approve')}
                            disabled={loading}
                            className="flex cursor-pointer items-center gap-1 rounded-xl bg-sage/100 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm transition-all hover:bg-sage/90 disabled:opacity-50"
                          >
                            <Check className="size-3" /> Setujui
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolve(r.id, 'deny')}
                            disabled={loading}
                            className="flex cursor-pointer items-center gap-1 rounded-xl bg-crimson px-3 py-1.5 text-[10px] font-bold text-white shadow-sm transition-all hover:bg-crimson/90 disabled:opacity-50"
                          >
                            <X className="size-3" /> Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          Terselesaikan
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Organization Partners Section */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center justify-between border-b border-border pb-1">
          <div className="flex items-center gap-3.5">
            <Users className="text-navy size-6" />
            <div>
              <h2 className="text-navy text-sm font-semibold">
                {t('text_154')}</h2>
              <p className="text-xs text-muted-foreground">
                {t('text_155')}</p>
            </div>
          </div>
          <Dialog>
            <DialogTrigger
              render={
                <Button className="py-2.5 bg-navy hover:bg-navy/90 cursor-pointer rounded-xl px-4 text-xs font-bold text-white transition-all">
                  {t('text_156')}</Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('text_157')}</DialogTitle>
              </DialogHeader>
              <p className="text-xs leading-relaxed font-semibold text-muted-foreground">
                {t('text_158')}</p>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>{t('text_159')}</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs font-semibold text-navy">
            {staticPartners.map((p) => (
              <TableRow key={p.name}>
                <TableCell className="text-navy font-bold">{p.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={p.status === 'Aktif' ? 'default' : 'secondary'}
                  >
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{p.date}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer rounded-xl border border-border text-xs font-bold hover:bg-muted/50"
                  >
                    Detail
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
