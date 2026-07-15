'use client';

import type { FormEvent } from 'react';
import { LockKeyhole } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ApprovalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  reason: string;
  setReason: (value: string) => void;
  loading: boolean;
}

export function ApprovalRequestModal({
  isOpen,
  onClose,
  onSubmit,
  reason,
  setReason,
  loading,
}: ApprovalRequestModalProps) {
  const t = useTranslations('accountabilityWorkspace');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <span className="mb-2 flex size-11 items-center justify-center rounded-xl bg-amber/10 text-amber">
            <LockKeyhole className="size-5" aria-hidden="true" />
          </span>
          <DialogTitle>{t('approvalDialogTitle')}</DialogTitle>
          <DialogDescription>{t('approvalDialogBody')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="approval-reason" className="text-sm font-semibold text-navy">
              {t('approvalReasonLabel')}
            </label>
            <textarea
              id="approval-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t('approvalReasonPlaceholder')}
              rows={4}
              className="w-full resize-y rounded-xl border border-input bg-background p-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-navy focus-visible:ring-2 focus-visible:ring-navy/20"
              required
            />
            <p className="text-xs leading-5 text-muted-foreground">
              {t('approvalReasonAudience')}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('sendingRequest') : t('submitRequest')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
