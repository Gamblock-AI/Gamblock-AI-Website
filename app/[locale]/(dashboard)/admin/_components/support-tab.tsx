import { type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  FileClock,
  Filter,
  Inbox,
  MessageSquare,
  UserCheck,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import type {
  AdminDataRequest,
  AdminSupportCase,
} from '@/hooks/use-admin-operations';
import { SupportStatusBadge } from '@/components/dashboard/support-status-badge';
import { Pagination } from '@/components/dashboard/pagination';
import { usePagination } from '@/hooks/use-pagination';
import { toastError, toastSuccess } from '@/lib/feedback';
import { usePathname, useRouter } from '@/i18n/routing';
import {
  dynamicLabelFallback,
  dynamicLabelKey,
  normalizeSupportStatus,
} from '@/lib/i18n/dynamic-labels';
import {
  FilterResetButton,
  FilterSelect,
  FilterToggleButton,
} from '@/components/dashboard/filter-toolbar';
import {
  AdminEmptyTable,
  AdminPriorityBadge,
  AdminStatusBadge,
  adminFieldClassName,
} from './admin-shared';
import { RequiredMark } from '@/components/common/form-field';

interface SupportTabProps {
  userId?: string;
  caseID?: string;
  cases: AdminSupportCase[];
  dataRequests: AdminDataRequest[];
  getSupportCase: (id: string) => Promise<AdminSupportCase>;
  claimSupportCase: (id: string, reason: string) => Promise<AdminSupportCase>;
  releaseSupportCase: (id: string, reason: string) => Promise<unknown>;
  replySupportCase: (id: string, content: string) => Promise<unknown>;
  transitionSupportCase: (id: string, status: string) => Promise<unknown>;
  retryDataRequest: (id: string) => Promise<unknown>;
  rejectDataRequest: (id: string, reason: string) => Promise<unknown>;
}

export function SupportTab(props: SupportTabProps) {
  const t = useTranslations('adminPage');
  const tDynamic = useTranslations('dynamicLabels');
  const tPagination = useTranslations('pagination');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { caseID, getSupportCase } = props;
  const [selected, setSelected] = useState<AdminSupportCase | null>(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [promptModal, setPromptModal] = useState<{
    action: 'claim_case' | 'release_case' | 'reject_data_request';
    targetId: string;
    title: string;
    description: string;
    itemSummary?: string;
  } | null>(null);
  const [modalReason, setModalReason] = useState('');

  // Query param filters
  const priorityFilter = searchParams.get('priority') || 'all';
  const statusFilter = searchParams.get('status') || 'all';
  const assigneeFilter = searchParams.get('assignee') || 'all';
  const dataStatusFilter = searchParams.get('dataStatus') || 'all';

  const hasActiveTicketFilters =
    priorityFilter !== 'all' ||
    statusFilter !== 'all' ||
    assigneeFilter !== 'all';

  const hasActiveDataFilters = dataStatusFilter !== 'all';

  const [showTicketFilters, setShowTicketFilters] = useState(
    () => hasActiveTicketFilters
  );
  const [showDataFilters, setShowDataFilters] = useState(
    () => hasActiveDataFilters
  );

  const activeTicketFilterCount =
    (priorityFilter !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (assigneeFilter !== 'all' ? 1 : 0);

  const activeDataFilterCount = dataStatusFilter !== 'all' ? 1 : 0;

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const clearTicketFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('priority');
    params.delete('status');
    params.delete('assignee');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const clearDataRequestFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('dataStatus');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const filteredCases = useMemo(() => {
    return props.cases.filter((item) => {
      // Priority filter
      if (
        priorityFilter !== 'all' &&
        item.priority.toLowerCase() !== priorityFilter.toLowerCase()
      ) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all') {
        const itemStatus = normalizeSupportStatus(item.status);
        const targetStatus = normalizeSupportStatus(statusFilter);
        if (itemStatus !== targetStatus) {
          return false;
        }
      }
      // Assignee filter: 'me' vs 'others'
      if (assigneeFilter === 'me') {
        if (!props.userId || item.owner !== props.userId) {
          return false;
        }
      } else if (assigneeFilter === 'others') {
        if (props.userId && item.owner === props.userId) {
          return false;
        }
      }
      return true;
    });
  }, [props.cases, priorityFilter, statusFilter, assigneeFilter, props.userId]);

  const filteredDataRequests = useMemo(() => {
    return props.dataRequests.filter((request) => {
      if (
        dataStatusFilter !== 'all' &&
        request.status.toLowerCase() !== dataStatusFilter.toLowerCase()
      ) {
        return false;
      }
      return true;
    });
  }, [props.dataRequests, dataStatusFilter]);

  const {
    pagedItems: pagedCases,
    page: casesPage,
    totalPages: totalCasesPages,
    setPage: setCasesPage,
    startIndex: casesStartIndex,
    endIndex: casesEndIndex,
    totalItems: totalCases,
  } = usePagination({ items: filteredCases, pageSize: 10 });

  const {
    pagedItems: pagedDataRequests,
    page: requestsPage,
    totalPages: totalRequestsPages,
    setPage: setRequestsPage,
    startIndex: requestsStartIndex,
    endIndex: requestsEndIndex,
    totalItems: totalDataRequests,
  } = usePagination({ items: filteredDataRequests, pageSize: 10 });

  const dataRequestTitle = (request: AdminDataRequest) =>
    request.type === 'export'
      ? t('dataRequestTypeExport')
      : request.type === 'delete'
        ? t('dataRequestTypeDelete')
        : request.title || request.id;

  useEffect(() => {
    if (!caseID || selected?.id === caseID) return;
    let active = true;

    void getSupportCase(caseID)
      .then((supportCase) => {
        if (active) setSelected(supportCase);
      })
      .catch((error) => {
        if (active) toastError(error, t('caseActionError'));
      });

    return () => {
      active = false;
    };
  }, [caseID, getSupportCase, selected?.id, t]);

  const confirmPromptModal = async () => {
    if (!promptModal || !modalReason.trim()) return;
    const { action, targetId } = promptModal;
    setBusy(true);
    try {
      if (action === 'claim_case') {
        await props.claimSupportCase(targetId, modalReason.trim());
        router.push(`/admin/tickets/${targetId}`);
        toastSuccess(t('caseClaimed'));
      } else if (action === 'release_case') {
        await props.releaseSupportCase(targetId, modalReason.trim());
        router.push('/admin/tickets');
        toastSuccess(t('caseReleased'));
      } else if (action === 'reject_data_request') {
        await props.rejectDataRequest(targetId, modalReason.trim());
        toastSuccess(t('requestRejected'));
      }
      setPromptModal(null);
      setModalReason('');
    } catch (error) {
      toastError(
        error,
        action === 'reject_data_request'
          ? t('dataRequestActionError')
          : t('caseActionError')
      );
    } finally {
      setBusy(false);
    }
  };

  const actionDialog = (
    <Dialog
      open={Boolean(promptModal)}
      onOpenChange={(open) => {
        if (!open && !busy) {
          setPromptModal(null);
          setModalReason('');
        }
      }}
    >
      <DialogContent className="max-w-md gap-5 rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="pr-6">
          <DialogTitle className="text-navy text-lg font-bold">
            {promptModal?.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
            {promptModal?.description}
          </DialogDescription>
        </DialogHeader>

        {promptModal?.itemSummary ? (
          <div className="border-border/80 bg-muted/40 rounded-xl border p-3.5">
            <span className="text-muted-foreground block text-[0.7rem] font-bold tracking-wider uppercase">
              {t('detailTarget')}
            </span>
            <p className="text-navy mt-0.5 text-sm font-semibold">
              {promptModal.itemSummary}
            </p>
          </div>
        ) : null}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void confirmPromptModal();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-navy flex items-center text-xs font-bold">
              <span>{t('reasonPrompt')}</span>
              <RequiredMark />
            </label>
            <textarea
              value={modalReason}
              onChange={(event) => setModalReason(event.target.value)}
              placeholder={t('reasonPlaceholder')}
              className="border-input bg-card focus-visible:border-navy/40 focus-visible:ring-navy/30 min-h-[90px] w-full resize-none rounded-xl border p-3 text-sm outline-none transition-all focus-visible:ring-2"
              required
              autoFocus
            />
          </div>

          <DialogFooter className="-mx-6 -mb-6 mt-6 border-border/80 bg-muted/40 rounded-b-2xl border-t px-6 py-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => {
                setPromptModal(null);
                setModalReason('');
              }}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={busy || !modalReason.trim()}>
              {busy ? t('saving') : t('confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  const openCase = async (item: AdminSupportCase) => {
    if (!item.owner) {
      setPromptModal({
        action: 'claim_case',
        targetId: item.id,
        title: t('claimCaseTitle'),
        description: t('claimReasonPrompt'),
        itemSummary: `${item.title} (${item.id})`,
      });
      setModalReason('');
      return;
    }
    if (item.owner !== props.userId) {
      toastError(new Error('assigned'), t('caseOwnedByOther'));
      return;
    }
    router.push(`/admin/tickets/${item.id}`);
  };

  const reloadSelected = async () => {
    if (selected) setSelected(await props.getSupportCase(selected.id));
  };

  const sendReply = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !reply.trim()) return;
    setBusy(true);
    try {
      await props.replySupportCase(selected.id, reply);
      setReply('');
      await reloadSelected();
      toastSuccess(t('replySent'));
    } catch (error) {
      toastError(error, t('caseActionError'));
    } finally {
      setBusy(false);
    }
  };

  if (caseID && selected?.id !== caseID) {
    return (
      <div className="border-border bg-card flex min-h-72 items-center justify-center rounded-2xl border">
        <p className="text-muted-foreground text-sm">{t('loading')}</p>
      </div>
    );
  }

  if (selected) {
    return (
      <>
      <div className="space-y-4">
        <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Button
              size="icon"
              variant="ghost"
              aria-label={t('backToQueue')}
              onClick={() => router.push('/admin/tickets')}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-navy font-extrabold">{selected.title}</h2>
                <SupportStatusBadge status={selected.status} />
              </div>
              <p className="text-muted-foreground mt-1 font-mono text-xs">
                {selected.id}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {selected.status !== 'resolved' && selected.status !== 'closed' ? (
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await props.transitionSupportCase(selected.id, 'resolved');
                    await reloadSelected();
                    toastSuccess(t('caseResolved'));
                  } catch (error) {
                    toastError(error, t('caseActionError'));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {t('markResolved')}
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => {
              setPromptModal({
                action: 'release_case',
                targetId: selected.id,
                title: t('releaseCaseTitle'),
                description: t('releaseReasonPrompt'),
                itemSummary: `${selected.title} (${selected.id})`,
              });
                setModalReason('');
              }}
            >
              {t('releaseCase')}
            </Button>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
          <Card className="p-5">
            <div className="space-y-3">
              {(selected.messages ?? []).map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[85%] rounded-2xl p-4 ${message.author_role === 'admin' ? 'bg-navy ml-auto text-white' : 'bg-muted text-navy'}`}
                >
                  <p className="text-[10px] font-bold tracking-wide uppercase opacity-70">
                    {message.author_role === 'admin'
                      ? t('supportTeam')
                      : t('requester')}
                  </p>
                  <p className="mt-1 text-sm leading-6 whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className="mt-2 text-[10px] opacity-60">
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <form
              onSubmit={(event) => void sendReply(event)}
              className="border-border mt-5 flex flex-col gap-3 border-t pt-4"
            >
              <label className="space-y-1.5">
                <span className="text-navy flex items-center text-xs font-bold">
                  <span>{t('reply')}</span>
                  <RequiredMark />
                </span>
                <textarea
                  className={`${adminFieldClassName} min-h-28 py-3`}
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder={t('replyPlaceholder')}
                  maxLength={4000}
                  required
                />
              </label>
              <Button type="submit" className="self-end" disabled={busy}>
                <MessageSquare className="size-4" />
                {t('sendReply')}
              </Button>
            </form>
          </Card>
          <Card className="h-fit p-5">
            <h3 className="text-navy font-bold">{t('caseContext')}</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground text-xs">{t('thType')}</dt>
                <dd className="text-navy mt-1 font-semibold">
                  {tDynamic(dynamicLabelKey('supportType', selected.type), {
                    value: dynamicLabelFallback(selected.type),
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">
                  {t('thPriority')}
                </dt>
                <dd className="mt-1">
                  <AdminPriorityBadge priority={selected.priority} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Impact</dt>
                <dd className="text-navy mt-1 font-semibold">
                  {selected.impact || '—'}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
        {actionDialog}
      </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Support Tickets Queue Card */}
      <section className="border-border bg-card shadow-soft overflow-hidden rounded-2xl border">
        <div className="border-border/80 border-b p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-navy text-base font-bold">
              {t('supportTitle')}
            </h3>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {t('supportDescription')}
            </p>
          </div>

          {/* Filter Toggle Button */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <FilterToggleButton
              isExpanded={showTicketFilters}
              onToggle={() => setShowTicketFilters((prev) => !prev)}
              hasActiveFilters={hasActiveTicketFilters}
              activeCount={activeTicketFilterCount}
              label={t('filterToggle') || 'Filter'}
            />
          </div>
        </div>

        {/* Expandable Ticket Filters Panel */}
        {showTicketFilters ? (
          <div className="border-border/60 bg-muted/20 border-b px-4 py-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold text-navy/70 mr-1 flex items-center gap-1.5">
                <Filter className="size-3 text-navy/60" />
                {t('filterLabel')}
              </span>

              {/* Priority Filter */}
              <FilterSelect
                value={priorityFilter}
                onChange={(e) => updateParam('priority', e.target.value)}
                ariaLabel={t('filterPriority')}
              >
                <option value="all">{t('filterAllPriorities')}</option>
                <option value="urgent">{tDynamic('priority.urgent', { value: 'Mendesak' })}</option>
                <option value="high">{tDynamic('priority.high', { value: 'Tinggi' })}</option>
                <option value="normal">{tDynamic('priority.normal', { value: 'Normal' })}</option>
                <option value="low">{tDynamic('priority.low', { value: 'Rendah' })}</option>
              </FilterSelect>

              {/* Status Filter */}
              <FilterSelect
                value={statusFilter}
                onChange={(e) => updateParam('status', e.target.value)}
                ariaLabel={t('filterStatus')}
              >
                <option value="all">{t('filterAllStatuses')}</option>
                <option value="waiting_support">{tDynamic('supportStatus.waiting_support', { value: 'Menunggu Dukungan' })}</option>
                <option value="waiting_user">{tDynamic('supportStatus.waiting_user', { value: 'Menunggu Pengguna' })}</option>
                <option value="resolved">{tDynamic('supportStatus.resolved', { value: 'Selesai' })}</option>
                <option value="closed">{tDynamic('supportStatus.closed', { value: 'Ditutup' })}</option>
              </FilterSelect>

              {/* Assignee Filter */}
              <FilterSelect
                value={assigneeFilter}
                onChange={(e) => updateParam('assignee', e.target.value)}
                ariaLabel={t('filterAssignee')}
              >
                <option value="all">{t('filterAllAssignees')}</option>
                <option value="me">{t('assigneeMe')}</option>
                <option value="others">{t('assigneeOthers')}</option>
              </FilterSelect>
            </div>

            {hasActiveTicketFilters ? (
              <FilterResetButton
                onClick={clearTicketFilters}
                label={t('clearFilters') || 'Reset'}
              />
            ) : null}
          </div>
        ) : null}

        <Table className="[&_td]:px-4 [&_td]:py-3.5 sm:[&_td]:px-5 [&_th]:h-11 [&_th]:px-4 sm:[&_th]:px-5">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-bold text-xs">{t('thId')}</TableHead>
              <TableHead className="font-bold text-xs">{t('thSubject')}</TableHead>
              <TableHead className="font-bold text-xs">{t('thPriority')}</TableHead>
              <TableHead className="font-bold text-xs">{t('thStatus')}</TableHead>
              <TableHead className="font-bold text-xs">{t('owner')}</TableHead>
              <TableHead className="text-right font-bold text-xs">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCases.length === 0 ? (
              <AdminEmptyTable
                colSpan={6}
                icon={Inbox}
                text={
                  props.cases.length === 0
                    ? t('noTickets')
                    : t('noFilteredTickets')
                }
                description={t('noTicketsDescription')}
              />
            ) : (
              pagedCases.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.id}</TableCell>
                  <TableCell className="text-navy font-semibold text-sm">
                    {item.title}
                  </TableCell>
                  <TableCell>
                    <AdminPriorityBadge priority={item.priority} size="sm" />
                  </TableCell>
                  <TableCell>
                    <SupportStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-xs">
                    {item.owner
                      ? item.owner === props.userId
                        ? t('ownedByYou')
                        : t('ownedByOther')
                      : t('unassigned')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={item.owner ? 'outline' : 'primary'}
                      disabled={
                        busy ||
                        Boolean(item.owner && item.owner !== props.userId)
                      }
                      onClick={() => void openCase(item)}
                    >
                      <UserCheck className="size-4" />
                      {item.owner ? t('openCase') : t('claimCase')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {totalCases > 0 ? (
          <div className="border-border/80 bg-muted/15 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 border-t px-4 py-2.5 sm:px-5">
            <span className="text-muted-foreground text-xs font-semibold whitespace-nowrap self-start sm:self-center">
              {tPagination('showingRange', {
                start: casesStartIndex,
                end: casesEndIndex,
                total: totalCases,
              })}
            </span>
            <Pagination
              currentPage={casesPage}
              totalPages={totalCasesPages}
              onPageChange={setCasesPage}
              variant="flat"
              size="sm"
            />
          </div>
        ) : null}
      </section>

      {/* User Data Requests Card */}
      <section className="border-border bg-card shadow-soft overflow-hidden rounded-2xl border">
        <div className="border-border/80 border-b p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-navy text-base font-bold">{t('dataRequestsTitle')}</h3>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {t('dataRequestsHelp')}
            </p>
          </div>

          {/* Filter Toggle Button */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <FilterToggleButton
              isExpanded={showDataFilters}
              onToggle={() => setShowDataFilters((prev) => !prev)}
              hasActiveFilters={hasActiveDataFilters}
              activeCount={activeDataFilterCount}
              label={t('filterToggle') || 'Filter'}
            />
          </div>
        </div>

        {/* Expandable Data Request Filters Panel */}
        {showDataFilters ? (
          <div className="border-border/60 bg-muted/20 border-b px-4 py-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold text-navy/70 mr-1 flex items-center gap-1.5">
                <Filter className="size-3 text-navy/60" />
                {t('filterLabel')}
              </span>

              <FilterSelect
                value={dataStatusFilter}
                onChange={(e) => updateParam('dataStatus', e.target.value)}
                ariaLabel={t('filterDataStatus')}
              >
                <option value="all">{t('filterAllDataStatuses')}</option>
                <option value="pending">{tDynamic('status.pending', { value: 'Menunggu' })}</option>
                <option value="processing">{tDynamic('status.processing', { value: 'Diproses' })}</option>
                <option value="queued">{tDynamic('status.queued', { value: 'Dalam Antrean' })}</option>
                <option value="completed">{tDynamic('status.completed', { value: 'Selesai' })}</option>
                <option value="failed">{tDynamic('status.failed', { value: 'Gagal' })}</option>
                <option value="rejected">{tDynamic('status.rejected', { value: 'Ditolak' })}</option>
              </FilterSelect>
            </div>

            {hasActiveDataFilters ? (
              <FilterResetButton
                onClick={clearDataRequestFilters}
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
              <TableHead className="font-bold text-xs">{t('retryCount')}</TableHead>
              <TableHead className="text-right font-bold text-xs">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDataRequests.length === 0 ? (
              <AdminEmptyTable
                colSpan={5}
                icon={FileClock}
                text={
                  props.dataRequests.length === 0
                    ? t('noDataRequests')
                    : t('noFilteredDataRequests')
                }
                description={t('noDataRequestsDescription')}
              />
            ) : (
              pagedDataRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-mono text-xs">
                    {request.id}
                  </TableCell>
                  <TableCell className="text-navy text-sm font-semibold">{dataRequestTitle(request)}</TableCell>
                  <TableCell>
                    <AdminStatusBadge status={request.status} />
                  </TableCell>
                  <TableCell className="text-xs font-mono">{request.retry_count}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {request.status === 'failed' &&
                      request.retry_count < 3 ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            void props
                              .retryDataRequest(request.id)
                              .then(() => toastSuccess(t('requestRetried')))
                              .catch((error) =>
                                toastError(error, t('dataRequestActionError'))
                              )
                          }
                        >
                          {t('retry')}
                        </Button>
                      ) : null}
                      {['failed', 'queued'].includes(request.status) ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPromptModal({
                              action: 'reject_data_request',
                              targetId: request.id,
                              title: t('rejectDataRequestTitle'),
                              description: t('reasonPrompt'),
                              itemSummary: `${dataRequestTitle(request)} (${request.id})`,
                            });
                            setModalReason('');
                          }}
                        >
                          {t('reject')}
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {totalDataRequests > 0 ? (
          <div className="border-border/80 bg-muted/15 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 border-t px-4 py-2.5 sm:px-5">
            <span className="text-muted-foreground text-xs font-semibold whitespace-nowrap self-start sm:self-center">
              {tPagination('showingRange', {
                start: requestsStartIndex,
                end: requestsEndIndex,
                total: totalDataRequests,
              })}
            </span>
            <Pagination
              currentPage={requestsPage}
              totalPages={totalRequestsPages}
              onPageChange={setRequestsPage}
              variant="flat"
              size="sm"
            />
          </div>
        ) : null}
      </section>

      {actionDialog}
    </div>
  );
}
