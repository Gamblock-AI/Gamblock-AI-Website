'use client';

import { useState } from 'react';
import { Check, ClipboardList, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
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
import { EmptyState } from '@/components/ui/empty-state';
import type { ApprovalRequest } from '@/hooks/use-accountability';

interface RequestsHistoryTableProps {
  requests: ApprovalRequest[];
  onCancelRequest: (id: string) => Promise<void> | void;
  onResolveRequest?: (
    id: string,
    decision: 'approve' | 'deny'
  ) => Promise<void> | void;
  viewerRole?: string;
}

function statusTone(status: string) {
  if (status === 'approved') return 'sage' as const;
  if (status === 'denied') return 'crimson' as const;
  if (status === 'pending') return 'amber' as const;
  return 'muted' as const;
}

function statusKey(status: string) {
  if (status === 'approved') return 'approved';
  if (status === 'denied') return 'denied';
  if (status === 'pending') return 'pending';
  if (status === 'expired') return 'expired';
  return 'cancelled';
}

export function RequestsHistoryTable({
  requests,
  onCancelRequest,
  onResolveRequest,
  viewerRole,
}: RequestsHistoryTableProps) {
  const t = useTranslations('accountabilityWorkspace');
  const locale = useLocale();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [resolution, setResolution] = useState<{
    id: string;
    decision: 'approve' | 'deny';
  } | null>(null);
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

  return (
    <DashboardPanel
      icon={ClipboardList}
      title={t('historyTitle')}
      description={t('historyDescription')}
    >
      {requests.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={t('historyEmptyTitle')}
          hint={t('historyEmptyBody')}
          className="min-h-48 bg-muted/55"
        />
      ) : (
        <div className="space-y-3">
          {requests.map((request) => {
            const isPending = request.status === 'pending';
            const parsedDate = request.created_at
              ? new Date(request.created_at)
              : null;
            const date =
              parsedDate && !Number.isNaN(parsedDate.getTime())
                ? formatter.format(parsedDate)
                : t('dateUnavailable');

            return (
              <article
                key={request.id}
                className="border-border bg-muted/25 grid gap-3 rounded-2xl border p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <DashboardStatus tone={statusTone(request.status)}>
                      {t(`requestStatus.${statusKey(request.status)}`)}
                    </DashboardStatus>
                    <span className="text-muted-foreground font-mono text-xs">
                      {request.id}
                    </span>
                  </div>
                  <p className="text-foreground mt-3 text-sm leading-6">
                    {request.reason || t('reasonNotProvided')}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {request.action_label}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">{date}</p>
                </div>
                {isPending && viewerRole === 'partner' && onResolveRequest ? (
                  <div className="grid grid-cols-2 gap-2 md:flex">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-crimson/20 text-crimson hover:bg-crimson/[0.04] h-11"
                      onClick={() =>
                        setResolution({ id: request.id, decision: 'deny' })
                      }
                    >
                      <X className="size-4" aria-hidden="true" />
                      {t('denyRequest')}
                    </Button>
                    <Button
                      type="button"
                      className="h-11"
                      onClick={() =>
                        setResolution({ id: request.id, decision: 'approve' })
                      }
                    >
                      <Check className="size-4" aria-hidden="true" />
                      {t('approveRequest')}
                    </Button>
                  </div>
                ) : isPending && viewerRole !== 'partner' ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-crimson/20 text-crimson hover:bg-crimson/[0.04] h-11 w-full md:w-auto"
                    onClick={() => setCancelId(request.id)}
                  >
                    <X className="size-4" aria-hidden="true" />
                    {t('cancelRequest')}
                  </Button>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <Dialog
        open={cancelId !== null}
        onOpenChange={(open) => !open && setCancelId(null)}
      >
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
                if (!cancelId) return;
                void Promise.resolve(onCancelRequest(cancelId)).then(() =>
                  setCancelId(null)
                );
              }}
            >
              {t('confirmCancelRequest')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={resolution !== null}
        onOpenChange={(open) => !open && setResolution(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {resolution?.decision === 'approve'
                ? t('approveDialogTitle')
                : t('denyDialogTitle')}
            </DialogTitle>
            <DialogDescription>
              {resolution?.decision === 'approve'
                ? t('approveDialogBody')
                : t('denyDialogBody')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {t('keepRequest')}
            </DialogClose>
            <Button
              variant={
                resolution?.decision === 'deny' ? 'destructive' : 'primary'
              }
              onClick={() => {
                if (!resolution || !onResolveRequest) return;
                void Promise.resolve(
                  onResolveRequest(resolution.id, resolution.decision)
                ).then(() => setResolution(null));
              }}
            >
              {resolution?.decision === 'approve'
                ? t('confirmApproveRequest')
                : t('confirmDenyRequest')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPanel>
  );
}
