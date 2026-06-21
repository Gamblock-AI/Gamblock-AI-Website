'use client';

import { Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ApprovalDetails } from '@/hooks/use-approval';
import { useResolveApproval } from '@/hooks/use-approval';
import { useTranslations } from "next-intl";

export function ApprovalRequestForm({
  details,
  token,
  onResolved,
}: {
  details: ApprovalDetails;
  token: string;
  onResolved: (status: 'approved' | 'denied') => void;
}) {
    const t = useTranslations('ApprovalRequestForm');
  const { resolve, submitting } = useResolveApproval(details.request_id, token);

  const handleResolve = async (status: 'approved' | 'denied') => {
    const ok = await resolve(status);
    if (ok) onResolved(status);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-crimson/10">
            <Shield className="h-7 w-7 text-crimson" />
          </div>
          <h2 className="text-heading text-xl text-navy">{t('text_269')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('text_270')}</p>
        </div>

        <div className="mt-6 space-y-3 rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tindakan</span>
            <span className="font-semibold text-navy">{details.action || 'Pause protection'}</span>
          </div>
          {details.requested_duration_minutes > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Durasi</span>
              <span className="font-semibold text-navy">{details.requested_duration_minutes} menit</span>
            </div>
          )}
          {details.reason && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Alasan</span>
              <span className="max-w-[200px] text-right font-semibold text-navy">{details.reason}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tanggal</span>
            <span className="font-semibold text-navy">
              {details.created_at ? new Date(details.created_at).toLocaleDateString('id-ID') : '-'}
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
          {t('text_271')}</p>
      </Card>
    </div>
  );
}
