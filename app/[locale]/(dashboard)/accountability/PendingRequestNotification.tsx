'use client';

import { useState } from 'react';
import { Clock3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DashboardNotice } from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ApprovalRequest } from '@/hooks/use-accountability';

interface PendingRequestNotificationProps {
  pendingRequest: ApprovalRequest | undefined;
  onCancelRequest: (id: string) => Promise<void> | void;
}

export function PendingRequestNotification({
  pendingRequest,
  onCancelRequest,
}: PendingRequestNotificationProps) {
  const t = useTranslations('accountabilityWorkspace');
  const [cancelOpen, setCancelOpen] = useState(false);

  if (!pendingRequest) return null;

  return (
    <>
      <DashboardNotice
        icon={Clock3}
        title={t('pendingTitle')}
        tone="amber"
        role="status"
        action={
          <Button
            type="button"
            variant="outline"
            className="w-full border-amber/30 bg-transparent text-navy sm:w-auto"
            onClick={() => setCancelOpen(true)}
          >
            {t('cancelRequest')}
          </Button>
        }
      >
        <p>{t('pendingBody')}</p>
      </DashboardNotice>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cancelDialogTitle')}</DialogTitle>
            <DialogDescription>{t('cancelDialogBody')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {t('keepRequest')}
            </DialogClose>
            <Button
              onClick={() => {
                void Promise.resolve(onCancelRequest(pendingRequest.id)).then(
                  () => setCancelOpen(false),
                );
              }}
            >
              {t('confirmCancelRequest')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
