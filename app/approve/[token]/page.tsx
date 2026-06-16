'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ApprovalDetails {
  request_id: string;
  action: string;
  reason: string;
  requested_duration_minutes: number;
  status: string;
  created_at: string;
}

export default function ApprovePage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [details, setDetails] = useState<ApprovalDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolved, setResolved] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Token validasi tidak ditemukan.');
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/approval-requests/verify/${token}`);
        if (!res.ok) throw new Error('Token tidak valid');
        const data = await res.json();
        setDetails(data.data);
      } catch {
        setError('Token tidak valid atau sudah kadaluarsa.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [token]);

  const handleResolve = async (status: 'approved' | 'denied') => {
    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/approval-requests/${details?.request_id}/resolve-by-token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, status }),
        }
      );
      if (!res.ok) throw new Error('Gagal memproses');
      setResolved(status);
    } catch {
      setError('Gagal memproses permohonan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <XCircle className="mx-auto h-12 w-12 text-crimson" />
          <h2 className="mt-4 text-heading text-xl text-navy">Gagal Memverifikasi</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </Card>
      </div>
    );
  }

  if (resolved) {
    const isApproved = resolved === 'approved';
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md p-8 text-center">
          {isApproved ? (
            <CheckCircle className="mx-auto h-12 w-12 text-sage" />
          ) : (
            <XCircle className="mx-auto h-12 w-12 text-crimson" />
          )}
          <h2 className="mt-4 text-heading text-xl text-navy">
            {isApproved ? 'Permohonan Disetujui' : 'Permohonan Ditolak'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isApproved
              ? 'Aplikasi akan dibuka dalam waktu singkat. Member akan menerima notifikasi.'
              : 'Permohonan telah ditolak. Aplikasi tetap terkunci.'}
          </p>
        </Card>
      </div>
    );
  }

  if (details?.status !== 'pending' && details?.status !== 'Pending partner approval') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-heading text-xl text-navy">Permohonan Sudah Diproses</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Permohonan ini sudah diselesaikan sebelumnya.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-crimson/10">
            <Shield className="h-7 w-7 text-crimson" />
          </div>
          <h2 className="text-heading text-xl text-navy">Permohonan Izin Pencopotan</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Seorang Member mengajukan permohonan untuk menonaktifkan perlindungan.
          </p>
        </div>

        <div className="mt-6 space-y-3 rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tindakan</span>
            <span className="font-semibold text-navy">{details?.action || 'Pause protection'}</span>
          </div>
          {details?.requested_duration_minutes > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Durasi</span>
              <span className="font-semibold text-navy">{details.requested_duration_minutes} menit</span>
            </div>
          )}
          {details?.reason && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Alasan</span>
              <span className="font-semibold text-navy max-w-[200px] text-right">{details.reason}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tanggal</span>
            <span className="font-semibold text-navy">
              {details?.created_at ? new Date(details.created_at).toLocaleDateString('id-ID') : '-'}
            </span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            variant="accent"
            className="flex-1"
            onClick={() => handleResolve('denied')}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Tolak
          </Button>
          <Button
            variant="wellness"
            className="flex-1"
            onClick={() => handleResolve('approved')}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Setujui
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Gamblock AI - Quick Approval via WhatsApp
        </p>
      </Card>
    </div>
  );
}
