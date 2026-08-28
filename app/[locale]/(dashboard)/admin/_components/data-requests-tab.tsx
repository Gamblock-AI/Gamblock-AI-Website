'use client';

import { type FormEvent, useMemo, useState } from 'react';
import {
  FileClock,
  Filter,
  History,
  Inbox,
  Loader2,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AdminDataRequest } from '@/hooks/use-admin-operations';
import { Pagination } from '@/components/dashboard/pagination';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import { useQueryFilters } from '@/hooks/use-query-filters';
import { useQueryTab } from '@/hooks/use-query-tab';
import { toastError, toastSuccess } from '@/lib/feedback';
import { CompactTabNav } from '@/components/common/compact-tab-nav';
import { DASHBOARD_QUERY_KEYS } from '@/routes';
import {
  FilterResetButton,
  FilterSelect,
  FilterToggleButton,
} from '@/components/dashboard/filter-toolbar';
import {
  AdminStatusBadge,
  TableEmptyRow,
  adminFieldClassName,
} from './admin-shared';
import { RequiredMark } from '@/components/common/form-field';

interface DataRequestsTabProps {
  dataRequests: AdminDataRequest[];
  retryDataRequest: (id: string) => Promise<unknown>;
  rejectDataRequest: (id: string, reason: string) => Promise<unknown>;
}

type DataRequestTabSection = 'active' | 'history';

export function DataRequestsTab(props: DataRequestsTabProps) {
  const t = useTranslations('adminPage');
  const tDynamic = useTranslations('dynamicLabels');
  const tPagination = useTranslations('pagination');
  const locale = useLocale();
  const { value: currentTab, setValue: setCurrentTab } = useQueryTab<DataRequestTabSection>({
    queryKey: DASHBOARD_QUERY_KEYS.adminDataRequestsTab,
    values: ['active', 'history'],
    defaultValue: 'active',
    resetKeys: [DASHBOARD_QUERY_KEYS.pages.dataRequests],
    removeKeys: ['tab', 'dataStatus', 'status'],
    clearKeys: [DASHBOARD_QUERY_KEYS.filters.dataRequests.status],
    history: 'push',
  });

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [locale]
  );

  const [promptModal, setPromptModal] = useState<{
    targetId: string;
    title: string;
    description: string;
    itemSummary: string;
  } | null>(null);
  const [modalReason, setModalReason] = useState('');
  const [modalBusy, setModalBusy] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const {
    getFilter,
    setFilter,
    clearFilters,
    isExpanded: showFilters,
    toggleExpanded: toggleFilters,
    hasActiveFilters,
    activeFilterCount,
  } = useQueryFilters({
    resourceKey: 'dataRequests',
    filterKeys: ['status'],
    defaultValues: { status: 'all' },
    pageKey: DASHBOARD_QUERY_KEYS.pages.dataRequests,
    removeKeys: ['dataStatus', 'status'],
  });
  const dataStatusFilter = getFilter('status', 'all');
  const activeRequestsList = useMemo(
    () => props.dataRequests.filter((request) =>
      ['pending', 'pending_confirmation', 'queued', 'processing', 'failed'].includes(request.status)
    ),
    [props.dataRequests]
  );
  const historyRequestsList = useMemo(
    () => props.dataRequests.filter((request) =>
      ['completed', 'rejected', 'cancelled'].includes(request.status)
    ),
    [props.dataRequests]
  );

  const dataRequestsQuery = usePaginatedQuery<AdminDataRequest>({
    path: `/admin/data-requests?${new URLSearchParams({
      bucket: currentTab,
      ...(dataStatusFilter !== 'all' ? { status: dataStatusFilter } : {}),
    }).toString()}`,
    pageKey: DASHBOARD_QUERY_KEYS.pages.dataRequests,
    pageSize: 10,
  });
  const pagedDataRequests = dataRequestsQuery.items;
  const pagination = dataRequestsQuery.pagination;
  const totalDataRequests = pagination.totalItems;

  const dataRequestTitle = (request: AdminDataRequest) => {
    if (request.type === 'delete_account') {
      return t('dataRequestTypeDelete');
    }
    return t('dataRequestTypeExport');
  };

  const handleRetry = async (requestId: string) => {
    setRetryingId(requestId);
    try {
      await props.retryDataRequest(requestId);
      toastSuccess(t('requestRetried'));
    } catch (err) {
      toastError(err, t('dataRequestActionError'));
    } finally {
      setRetryingId(null);
    }
  };

  const handleModalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!promptModal || !modalReason.trim()) return;
    setModalBusy(true);
    try {
      await props.rejectDataRequest(promptModal.targetId, modalReason.trim());
      toastSuccess(t('dataRequestRejected'));
      setPromptModal(null);
      setModalReason('');
    } catch (err) {
      toastError(err);
    } finally {
      setModalBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Compact Tab Navigation */}
      <CompactTabNav<DataRequestTabSection>
        ariaLabel={t('dataRequestsTitle')}
        value={currentTab}
        onValueChange={setCurrentTab}
        items={[
          {
            value: 'active',
            label: t('dataRequestTabActive'),
            icon: <Inbox className="size-3.5" />,
            activeAdornment:
              activeRequestsList.length > 0 ? (
                <span className="ml-1 rounded-full bg-azure px-2 py-0.2 text-[10px] font-bold text-navy">
                  {activeRequestsList.length}
                </span>
              ) : null,
          },
          {
            value: 'history',
            label: t('dataRequestTabHistory'),
            icon: <History className="size-3.5" />,
            activeAdornment:
              historyRequestsList.length > 0 ? (
                <span className="ml-1 rounded-full bg-azure px-2 py-0.2 text-[10px] font-bold text-navy">
                  {historyRequestsList.length}
                </span>
              ) : null,
          },
        ]}
      />

      <section className="border-border bg-card shadow-soft overflow-hidden rounded-2xl border">
        <div className="border-border/80 border-b p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="bg-azure/80 text-navy flex size-9 shrink-0 items-center justify-center rounded-xl">
              {currentTab === 'active' ? (
                <FileClock className="size-4.5" aria-hidden="true" />
              ) : (
                <History className="size-4.5" aria-hidden="true" />
              )}
            </span>
            <div>
              <h3 className="text-navy text-base font-bold">
                {currentTab === 'active'
                  ? t('dataRequestsTitle')
                  : t('dataRequestHistoryTitle')}
              </h3>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {currentTab === 'active'
                  ? t('dataRequestsHelp')
                  : t('dataRequestHistoryHelp')}
              </p>
            </div>
          </div>

          {/* Filter Toggle Button */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <FilterToggleButton
              isExpanded={showFilters}
              onToggle={toggleFilters}
              hasActiveFilters={hasActiveFilters}
              activeCount={activeFilterCount}
              label={t('filterToggle') || 'Filter'}
            />
          </div>
        </div>

        {/* Expandable Data Request Filters Panel */}
        {showFilters ? (
          <div className="border-border/60 bg-muted/20 border-b px-4 py-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold text-navy/70 mr-1 flex items-center gap-1.5">
                <Filter className="size-3 text-navy/60" />
                {t('filterLabel')}
              </span>

              <FilterSelect
                value={dataStatusFilter}
                onChange={(e) => setFilter('status', e.target.value)}
                ariaLabel={t('filterDataStatus')}
              >
                <option value="all">{t('filterAllDataStatuses')}</option>
                {currentTab === 'active' ? (
                  <>
                    <option value="pending">
                      {tDynamic('status.pending', { value: 'Menunggu' })}
                    </option>
                    <option value="queued">
                      {tDynamic('status.queued', { value: 'Dalam Antrean' })}
                    </option>
                    <option value="processing">
                      {tDynamic('status.processing', { value: 'Diproses' })}
                    </option>
                    <option value="failed">
                      {tDynamic('status.failed', { value: 'Gagal' })}
                    </option>
                  </>
                ) : (
                  <>
                    <option value="completed">
                      {tDynamic('status.completed', { value: 'Selesai' })}
                    </option>
                    <option value="rejected">
                      {tDynamic('status.rejected', { value: 'Ditolak' })}
                    </option>
                    <option value="cancelled">
                      {tDynamic('status.cancelled', { value: 'Dibatalkan' })}
                    </option>
                  </>
                )}
              </FilterSelect>
            </div>

            {hasActiveFilters ? (
              <FilterResetButton
                onClick={() => clearFilters(['status'])}
                label={t('clearFilters') || 'Reset'}
              />
            ) : null}
          </div>
        ) : null}

        <Table className="[&_td]:px-4 [&_td]:py-3.5 sm:[&_td]:px-5 [&_th]:h-11 [&_th]:px-4 sm:[&_th]:px-5">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-bold text-xs">{t('thId')}</TableHead>
              <TableHead className="font-bold text-xs">{t('thType')}</TableHead>
              <TableHead className="font-bold text-xs">{t('thStatus')}</TableHead>
              <TableHead className="font-bold text-xs">{t('thTime')}</TableHead>
              <TableHead className="font-bold text-xs">{t('retryCount')}</TableHead>
              {currentTab === 'active' ? (
                <TableHead className="text-right font-bold text-xs">{t('actions')}</TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {totalDataRequests === 0 ? (
              <TableEmptyRow
                colSpan={currentTab === 'active' ? 6 : 5}
                icon={FileClock}
                text={
                  hasActiveFilters
                    ? t('noFilteredDataRequests')
                    : currentTab === 'active'
                      ? t('noDataRequests')
                      : t('noDataRequestHistory')
                }
                description={
                  hasActiveFilters ? (
                    <FilterResetButton
                      onClick={() => clearFilters(['status'])}
                      label={t('clearFilters') || 'Reset Filter'}
                      className="mt-2"
                    />
                  ) : currentTab === 'active' ? (
                    t('noDataRequestsDescription')
                  ) : (
                    t('noDataRequestHistoryDescription')
                  )
                }
              />
            ) : (
              pagedDataRequests.map((request) => (
                <TableRow
                  key={request.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-mono text-xs font-semibold text-navy">
                    {request.id}
                  </TableCell>
                  <TableCell className="font-medium text-xs text-foreground">
                    {dataRequestTitle(request)}
                  </TableCell>
                  <TableCell>
                    <AdminStatusBadge status={request.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {request.created_at
                      ? formatDateTime(dateFormatter, request.created_at)
                      : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {t('timesSuffix', { count: request.retry_count })}
                  </TableCell>
                  {currentTab === 'active' ? (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {request.status === 'failed' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={retryingId === request.id}
                            onClick={() => void handleRetry(request.id)}
                            className="h-8 text-xs font-semibold"
                          >
                            {retryingId === request.id ? (
                              <Loader2 className="size-3.5 mr-1 animate-spin" />
                            ) : (
                              <RotateCcw className="size-3.5 mr-1" />
                            )}
                            {retryingId === request.id ? t('retrying') : t('retry')}
                          </Button>
                        ) : request.status === 'pending' ||
                          request.status === 'queued' ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              setPromptModal({
                                targetId: request.id,
                                title: t('rejectDataRequestTitle'),
                                description: t('rejectDataRequestHelp'),
                                itemSummary: `${t('requestLabel', { id: request.id })} • ${dataRequestTitle(request)}`,
                              })
                            }
                            className="h-8 text-xs font-semibold"
                          >
                            {t('reject')}
                          </Button>
                        ) : (
                          <span className="inline-flex items-center rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 text-[0.6875rem] font-medium text-muted-foreground">
                            {t('noActionNeeded')}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalDataRequests > 0 ? (
          <div className="border-border/80 bg-muted/15 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 border-t px-4 py-2.5 sm:px-5">
            <span className="text-muted-foreground text-xs font-semibold whitespace-nowrap self-start sm:self-center">
              {tPagination('showingRange', {
                start: pagination.startIndex,
                end: pagination.endIndex,
                total: totalDataRequests,
              })}
            </span>
            <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={pagination.setPage}
              variant="flat"
              size="sm"
            />
          </div>
        ) : null}
      </section>

      {/* Reject Modal Dialog */}
      <Dialog
        open={Boolean(promptModal)}
        onOpenChange={(open) => {
          if (!open) {
            setPromptModal(null);
            setModalReason('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleModalSubmit} className="space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <span className="bg-destructive/10 text-destructive flex size-9 shrink-0 items-center justify-center rounded-xl">
                  <ShieldAlert className="size-4.5" aria-hidden="true" />
                </span>
                <div>
                  <DialogTitle className="text-navy text-base font-bold">
                    {promptModal?.title}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground mt-0.5 text-xs">
                    {promptModal?.description}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {promptModal?.itemSummary ? (
              <div className="rounded-xl border border-border/80 bg-muted/30 p-3 text-xs">
                <span className="font-semibold text-navy">
                  {promptModal.itemSummary}
                </span>
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label
                htmlFor="reject-reason"
                className="text-navy flex items-center text-xs font-bold"
              >
                <span>{t('reasonLabel')}</span>
                <RequiredMark />
              </label>
              <textarea
                id="reject-reason"
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
                placeholder={t('rejectReasonPlaceholder')}
                required
                rows={3}
                className={adminFieldClassName}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPromptModal(null);
                  setModalReason('');
                }}
                disabled={modalBusy}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={modalBusy || !modalReason.trim()}
              >
                {modalBusy ? t('submitting') : t('confirmReject')}
              </Button>
              </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatDateTime(formatter: Intl.DateTimeFormat, value?: string) {
  if (!value) return '-';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '-' : formatter.format(parsed);
}
