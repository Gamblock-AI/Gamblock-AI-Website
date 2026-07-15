'use client';

import { useState } from 'react';
import { ClipboardList, X } from 'lucide-react';
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
}

function statusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('approved')) return 'sage' as const;
  if (normalized.includes('denied')) return 'crimson' as const;
  if (normalized.includes('pending')) return 'amber' as const;
  return 'muted' as const;
}

function statusKey(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('approved')) return 'approved';
  if (normalized.includes('denied')) return 'denied';
  if (normalized.includes('pending')) return 'pending';
  if (normalized.includes('expired')) return 'expired';
  return 'cancelled';
}

export function RequestsHistoryTable({
  requests,
  onCancelRequest,
}: RequestsHistoryTableProps) {
  const t = useTranslations('accountabilityWorkspace');
  const locale = useLocale();
  const [cancelId, setCancelId] = useState<string | null>(null);
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
          className="min-h-48 bg-muted/20"
        />
      ) : (
        <div className="space-y-3">
          {requests.map((request) => {
            const isPending = request.status.toLowerCase().includes('pending');
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
                className="grid gap-3 rounded-2xl border border-border bg-muted/25 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <DashboardStatus tone={statusTone(request.status)}>
                      {t(`requestStatus.${statusKey(request.status)}`)}
                    </DashboardStatus>
                    <span className="font-mono text-xs text-muted-foreground">
                      {request.id}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground">
                    {request.reason || t('reasonNotProvided')}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{date}</p>
                </div>
                {isPending ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full border-crimson/20 text-crimson hover:bg-crimson/[0.04] md:w-auto"
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

      <Dialog open={cancelId !== null} onOpenChange={(open) => !open && setCancelId(null)}>
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
                  setCancelId(null),
                );
              }}
            >
              {t('confirmCancelRequest')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPanel>
  );
}
