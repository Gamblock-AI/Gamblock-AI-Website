'use client';

import { useState } from 'react';
import {
  CircleAlert,
  Database,
  Download,
  FileClock,
  LockKeyhole,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
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
import { Skeleton } from '@/components/ui/skeleton';
import { toastError, toastSuccess } from '@/lib/feedback';
import { useDataRequests } from '@/hooks/use-data-requests';

function requestStatus(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('complete')) {
    return { key: 'completed', tone: 'sage' as const };
  }
  if (normalized.includes('reject') || normalized.includes('fail')) {
    return { key: 'failed', tone: 'crimson' as const };
  }
  if (normalized.includes('process')) {
    return { key: 'processing', tone: 'amber' as const };
  }
  return { key: 'pending', tone: 'navy' as const };
}

export default function DataRequestsPage() {
  const t = useTranslations('dataRequestsWorkspace');
  const locale = useLocale();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { requests, loading, submitting, error, refetch, createRequest } =
    useDataRequests();
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

  const submitRequest = async (type: 'export' | 'delete') => {
    try {
      await createRequest(type);
      toastSuccess(t(type === 'export' ? 'exportSuccess' : 'deleteSuccess'));
      if (type === 'delete') setDeleteOpen(false);
    } catch (requestError) {
      toastError(requestError, t('requestError'));
    }
  };

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={Database}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        aside={
          <DashboardNotice
            icon={LockKeyhole}
            title={t('privacyTitle')}
          >
            {t('privacyBody')}
          </DashboardNotice>
        }
      />

      <DashboardNotice
        icon={CircleAlert}
        title={t('localDataTitle')}
        tone="navy"
      >
        {t('localDataBody')}
      </DashboardNotice>

      <div className="grid gap-5 md:grid-cols-2">
        <DashboardPanel
          icon={Download}
          title={t('exportTitle')}
          description={t('exportBody')}
          className="flex h-full flex-col"
        >
          <Button
            size="lg"
            className="w-full sm:w-auto"
            disabled={submitting !== null}
            onClick={() => void submitRequest('export')}
          >
            <Download className="size-4" aria-hidden="true" />
            {submitting === 'export' ? t('submitting') : t('exportAction')}
          </Button>
        </DashboardPanel>

        <DashboardPanel
          icon={Trash2}
          title={t('deleteTitle')}
          description={t('deleteBody')}
          accent="crimson"
          className="flex h-full flex-col"
        >
          <Button
            variant="destructive"
            size="lg"
            className="w-full sm:w-auto"
            disabled={submitting !== null}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {t('deleteAction')}
          </Button>
        </DashboardPanel>
      </div>

      <DashboardPanel
        icon={FileClock}
        title={t('historyTitle')}
        description={t('historyBody')}
        action={
          error ? (
            <Button variant="outline" onClick={() => void refetch()}>
              <RefreshCw className="size-4" aria-hidden="true" />
              {t('retry')}
            </Button>
          ) : undefined
        }
      >
        {loading ? (
          <div className="space-y-3" role="status">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-2xl" />
            ))}
            <span className="sr-only">{t('loading')}</span>
          </div>
        ) : error ? (
          <DashboardNotice
            icon={CircleAlert}
            title={t('errorTitle')}
            tone="amber"
            role="alert"
          >
            {t('errorBody')}
          </DashboardNotice>
        ) : requests.length === 0 ? (
          <EmptyState
            icon={FileClock}
            title={t('emptyTitle')}
            hint={t('emptyBody')}
            className="min-h-48 bg-muted/55"
          />
        ) : (
          <div className="space-y-3">
            {requests.map((request) => {
              const status = requestStatus(request.status);
              const parsedDate = request.created_at
                ? new Date(request.created_at)
                : null;
              const date =
                parsedDate && !Number.isNaN(parsedDate.getTime())
                  ? dateFormatter.format(parsedDate)
                  : t('dateUnavailable');
              const type = request.type.toLowerCase().includes('delete')
                ? t('typeDelete')
                : t('typeExport');

              return (
                <article
                  key={request.id}
                  className="grid gap-3 rounded-2xl border border-border bg-muted/25 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-navy">{type}</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {request.id}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">{date}</p>
                  </div>
                  <DashboardStatus tone={status.tone}>
                    {t(`status.${status.key}`)}
                  </DashboardStatus>
                </article>
              );
            })}
          </div>
        )}
      </DashboardPanel>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <span className="mb-2 flex size-11 items-center justify-center rounded-xl bg-crimson/10 text-crimson">
              <Trash2 className="size-5" aria-hidden="true" />
            </span>
            <DialogTitle>{t('deleteDialogTitle')}</DialogTitle>
            <DialogDescription>{t('deleteDialogBody')}</DialogDescription>
          </DialogHeader>
          <DashboardNotice
            icon={CircleAlert}
            title={t('deleteScopeTitle')}
            tone="amber"
          >
            {t('deleteScopeBody')}
          </DashboardNotice>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {t('cancel')}
            </DialogClose>
            <Button
              variant="destructive"
              disabled={submitting !== null}
              onClick={() => void submitRequest('delete')}
            >
              {submitting === 'delete'
                ? t('submitting')
                : t('confirmDelete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPage>
  );
}
