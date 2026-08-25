'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Eye,
  Filter,
  History,
  Inbox,
  Send,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AvatarImage } from '@/components/account/avatar-image';
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
import type { AdminSupportCase } from '@/hooks/use-admin-operations';
import { SupportStatusBadge } from '@/components/dashboard/support-status-badge';
import { Pagination } from '@/components/dashboard/pagination';
import { usePagination } from '@/hooks/use-pagination';
import { toastError, toastSuccess } from '@/lib/feedback';
import { CompactTabNav } from '@/components/common/compact-tab-nav';
import { ROUTES } from '@/routes';
import { usePathname, useRouter } from '@/i18n/routing';
import {
  dynamicLabelKey,
  normalizeSupportStatus,
} from '@/lib/i18n/dynamic-labels';
import {
  FilterResetButton,
  FilterSelect,
  FilterToggleButton,
} from '@/components/dashboard/filter-toolbar';
import {
  AdminPriorityBadge,
  TableEmptyRow,
  adminFieldClassName,
} from './admin-shared';
import { RequiredMark } from '@/components/common/form-field';

interface SupportTabProps {
  userId?: string;
  caseID?: string;
  cases: AdminSupportCase[];
  getSupportCase: (id: string) => Promise<AdminSupportCase>;
  claimSupportCase: (id: string, reason: string) => Promise<AdminSupportCase>;
  releaseSupportCase: (id: string, reason: string) => Promise<unknown>;
  replySupportCase: (id: string, content: string) => Promise<unknown>;
  transitionSupportCase: (id: string, status: string) => Promise<unknown>;
}

type SupportTabSection = 'active' | 'history';

export function SupportTab(props: SupportTabProps) {
  const t = useTranslations('adminPage');
  const tDynamic = useTranslations('dynamicLabels');
  const tPagination = useTranslations('pagination');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab =
    (searchParams.get('tab') as SupportTabSection) || 'active';
  const { caseID, getSupportCase } = props;
  const [selected, setSelected] = useState<AdminSupportCase | null>(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [locale]
  );

  const [promptModal, setPromptModal] = useState<{
    action: 'claim_case' | 'release_case';
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

  const hasActiveFilters =
    priorityFilter !== 'all' ||
    statusFilter !== 'all' ||
    assigneeFilter !== 'all';

  const [showFilters, setShowFilters] = useState(() => hasActiveFilters);

  const activeFilterCount =
    (priorityFilter !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (assigneeFilter !== 'all' ? 1 : 0);

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

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('priority');
    params.delete('status');
    params.delete('assignee');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const activeCasesList = useMemo(() => {
    return (props.cases ?? []).filter((c) => {
      const s = normalizeSupportStatus(c.status);
      return s !== 'resolved' && s !== 'closed';
    });
  }, [props.cases]);

  const historyCasesList = useMemo(() => {
    return (props.cases ?? []).filter((c) => {
      const s = normalizeSupportStatus(c.status);
      return s === 'resolved' || s === 'closed';
    });
  }, [props.cases]);

  const baseList = currentTab === 'active' ? activeCasesList : historyCasesList;

  const filteredCases = useMemo(() => {
    return baseList.filter((item) => {
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
  }, [baseList, priorityFilter, statusFilter, assigneeFilter, props.userId]);

  const {
    pagedItems: pagedCases,
    page: casesPage,
    totalPages: totalCasesPages,
    setPage: setCasesPage,
    startIndex: casesStartIndex,
    endIndex: casesEndIndex,
    totalItems: totalCases,
  } = usePagination<AdminSupportCase>({ items: filteredCases, pageSize: 10 });

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

  const openCase = async (item: AdminSupportCase) => {
    const isCompleted =
      normalizeSupportStatus(item.status) === 'resolved' ||
      normalizeSupportStatus(item.status) === 'closed';

    if (!item.owner && !isCompleted) {
      setPromptModal({
        action: 'claim_case',
        targetId: item.id,
        title: t('claimCaseTitle'),
        description: t('claimPromptHelp'),
        itemSummary: `${item.id} • ${item.title}`,
      });
      return;
    }
    setBusy(true);
    try {
      const fullCase = await props.getSupportCase(item.id);
      setSelected(fullCase);
      router.push(`${ROUTES.ADMIN_TICKETS}/${item.id}`);
    } catch (error) {
      toastError(error, t('caseActionError'));
    } finally {
      setBusy(false);
    }
  };

  const handleModalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!promptModal || !modalReason.trim()) return;
    setBusy(true);
    try {
      if (promptModal.action === 'claim_case') {
        const fullCase = await props.claimSupportCase(
          promptModal.targetId,
          modalReason.trim()
        );
        setSelected(fullCase);
        router.push(`${ROUTES.ADMIN_TICKETS}/${fullCase.id}`);
        toastSuccess(t('claimCaseSuccess'));
      } else if (promptModal.action === 'release_case') {
        setSelected(null);
        router.push(ROUTES.ADMIN_TICKETS);
        await props.releaseSupportCase(
          promptModal.targetId,
          modalReason.trim()
        );
        toastSuccess(t('releaseCaseSuccess'));
      }
      setPromptModal(null);
      setModalReason('');
    } catch (error) {
      toastError(error, t('caseActionError'));
    } finally {
      setBusy(false);
    }
  };

  const submitReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || !reply.trim()) return;
    setBusy(true);
    try {
      await props.replySupportCase(selected.id, reply.trim());
      const refreshed = await props.getSupportCase(selected.id);
      setSelected(refreshed);
      setReply('');
      toastSuccess(t('replySentSuccess'));
    } catch (error) {
      toastError(error, t('caseActionError'));
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (status: string) => {
    if (!selected) return;
    setBusy(true);
    try {
      await props.transitionSupportCase(selected.id, status);
      const refreshed = await props.getSupportCase(selected.id);
      setSelected(refreshed);
      toastSuccess(t('statusUpdatedSuccess'));
    } catch (error) {
      toastError(error, t('caseActionError'));
    } finally {
      setBusy(false);
    }
  };

  const actionDialog = (
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
            <DialogTitle className="text-navy text-base font-bold">
              {promptModal?.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-0.5 text-xs">
              {promptModal?.description}
            </DialogDescription>
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
              htmlFor="modal-reason"
              className="text-navy flex items-center text-xs font-bold"
            >
              <span>{t('reasonLabel')}</span>
              <RequiredMark />
            </label>
            <textarea
              id="modal-reason"
              value={modalReason}
              onChange={(e) => setModalReason(e.target.value)}
              placeholder={t('reasonPlaceholder')}
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
              disabled={busy}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={busy || !modalReason.trim()}
            >
              {busy ? t('submitting') : t('confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  if (selected) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelected(null);
            router.push(ROUTES.ADMIN_TICKETS);
          }}
          className="rounded-xl"
        >
          <ArrowLeft className="size-4 mr-1.5" />
          {t('backToSupport')}
        </Button>

        <section className="border-border bg-card shadow-soft overflow-hidden rounded-2xl border">
          {/* Header */}
          <div className="border-b border-border/80 p-5 sm:p-6 bg-muted/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-navy text-lg sm:text-xl font-bold tracking-tight">
                    {selected.title}
                  </h3>
                  <SupportStatusBadge status={selected.status} />
                  <AdminPriorityBadge priority={selected.priority} />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono font-medium text-navy/80 bg-muted/60 px-2 py-0.5 rounded-md border border-border/60">
                    {selected.id}
                  </span>
                  {selected.user_name ? (
                    <>
                      <span>•</span>
                      <div className="inline-flex items-center gap-1.5 font-medium text-navy">
                        <AvatarImage
                          avatarUrl={selected.user_avatar_url}
                          alt={selected.user_name}
                          fallback={
                            <span className="size-5 rounded-full bg-navy/10 text-navy flex items-center justify-center text-[10px] font-bold shrink-0">
                              {selected.user_name.charAt(0).toUpperCase()}
                            </span>
                          }
                          className="size-5 rounded-full object-cover border border-border/80 shrink-0"
                        />
                        <span>{selected.user_name}</span>
                      </div>
                    </>
                  ) : null}
                  <span>•</span>
                  <span>
                    {selected.owner ? (
                      <span className="inline-flex items-center gap-1 font-medium text-navy">
                        <UserCheck className="size-3.5 text-navy/70" />
                        {selected.owner === props.userId
                          ? t('assigneeMe')
                          : selected.owner}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md border border-amber/30 bg-amber/15 px-2 py-0.5 text-[0.6875rem] font-semibold text-amber-900 dark:text-amber-300">
                        {t('unassignedLabel')}
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {normalizeSupportStatus(selected.status) !== 'resolved' &&
                normalizeSupportStatus(selected.status) !== 'closed' ? (
                  !selected.owner ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        setPromptModal({
                          action: 'claim_case',
                          targetId: selected.id,
                          title: t('claimCaseTitle'),
                          description: t('claimPromptHelp'),
                          itemSummary: `${selected.id} • ${selected.title}`,
                        })
                      }
                      disabled={busy}
                      className="rounded-xl shadow-2xs"
                    >
                      <UserCheck className="size-3.5 mr-1.5" />
                      {t('claimCase')}
                    </Button>
                  ) : selected.owner === props.userId ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setPromptModal({
                            action: 'release_case',
                            targetId: selected.id,
                            title: t('releaseCaseTitle'),
                            description: t('releasePromptHelp'),
                            itemSummary: `${selected.id} • ${selected.title}`,
                          })
                        }
                        disabled={busy}
                        className="rounded-xl"
                      >
                        {t('releaseCase')}
                      </Button>
                      <Button
                        size="sm"
                        variant="wellness"
                        onClick={() => void changeStatus('resolved')}
                        disabled={busy}
                        className="rounded-xl shadow-2xs"
                      >
                        <ShieldCheck className="size-3.5 mr-1.5" />
                        {t('markResolved')}
                      </Button>
                    </>
                  ) : null
                ) : null}
              </div>
            </div>
          </div>

          {/* Conversation Area */}
          <div className="p-5 sm:p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-navy text-xs font-bold uppercase tracking-wider text-navy/70">
                  {t('conversationHistory')}
                </h4>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {t('messagesCount', {
                    count: selected.messages?.length ?? 0,
                  })}
                </span>
              </div>

              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {(selected.messages ?? []).length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/80 bg-muted/15 p-6 text-center text-xs text-muted-foreground">
                    {t('noMessages')}
                  </div>
                ) : (
                  (selected.messages ?? []).map((msg, index) => {
                    const isAgent = msg.author_role === 'admin';
                    const authorName =
                      msg.author_name ||
                      (isAgent
                        ? t('supportTeamLabel')
                        : selected.user_name || t('userLabel'));
                    const authorAvatar =
                      msg.author_avatar_url ||
                      (!isAgent ? selected.user_avatar_url : undefined);

                    return (
                      <div
                        key={index}
                        className={`flex gap-3 max-w-[88%] ${
                          isAgent ? 'ml-auto flex-row-reverse' : 'mr-auto'
                        }`}
                      >
                        <div
                          className={`size-8 rounded-full flex items-center justify-center shrink-0 shadow-2xs border overflow-hidden ${
                            isAgent
                              ? 'bg-navy text-white border-navy/20'
                              : 'bg-azure text-navy border-navy/15'
                          }`}
                        >
                          {authorAvatar ? (
                            <AvatarImage
                              avatarUrl={authorAvatar}
                              alt={authorName}
                              fallback={
                                isAgent ? (
                                  <ShieldCheck className="size-4" />
                                ) : (
                                  <span className="text-[11px] font-bold">
                                    {authorName.charAt(0).toUpperCase()}
                                  </span>
                                )
                              }
                              className="size-full object-cover"
                            />
                          ) : isAgent ? (
                            <ShieldCheck className="size-4" />
                          ) : (
                            <span className="text-[11px] font-bold">
                              {authorName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div
                          className={`rounded-2xl border p-4 text-xs leading-relaxed space-y-1.5 shadow-2xs ${
                            isAgent
                              ? 'border-navy/25 bg-navy/5 text-navy rounded-tr-xs'
                              : 'border-border bg-card text-foreground rounded-tl-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-1.5 font-bold">
                            <span className="text-xs">{authorName}</span>
                            {msg.created_at ? (
                              <time
                                dateTime={msg.created_at}
                                className="text-muted-foreground text-[11px] font-normal"
                              >
                                {formatDateTime(dateFormatter, msg.created_at)}
                              </time>
                            ) : null}
                          </div>
                          <p className="whitespace-pre-wrap text-sm leading-6">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Reply Field */}
            {normalizeSupportStatus(selected.status) === 'resolved' ||
            normalizeSupportStatus(selected.status) === 'closed' ? (
              <div className="rounded-2xl border border-border/70 bg-muted/25 p-4 text-center text-xs text-muted-foreground font-medium">
                Tiket ini sudah diselesaikan dan dalam mode riwayat (read-only).
              </div>
            ) : selected.owner === props.userId ? (
              <form
                onSubmit={submitReply}
                className="border-t border-border/80 pt-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="reply-content"
                    className="text-navy text-xs font-bold uppercase tracking-wider text-navy/70 flex items-center gap-1"
                  >
                    <span>{t('replyLabel')}</span>
                    <RequiredMark />
                  </label>
                </div>
                <textarea
                  id="reply-content"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={t('replyPlaceholder')}
                  rows={4}
                  required
                  className={`${adminFieldClassName} p-3.5 text-sm leading-relaxed`}
                />
                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={busy || !reply.trim()}
                    className="rounded-xl px-5 h-9 font-medium"
                  >
                    <Send className="size-3.5 mr-1.5" />
                    {busy ? t('sendingReply') : t('sendReply')}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-5 text-center text-xs text-muted-foreground">
                {selected.owner
                  ? t('onlyOwnerCanReply')
                  : t('claimToReplyPrompt')}
              </div>
            )}
          </div>
        </section>

        {actionDialog}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Compact Tab Navigation */}
      <CompactTabNav<SupportTabSection>
        ariaLabel={t('supportTabNavigation')}
        value={currentTab}
        onValueChange={(val) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set('tab', val);
          params.delete('status');
          params.delete('priority');
          params.delete('assignee');
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }}
        items={[
          {
            value: 'active',
            label: t('ticketTabActive'),
            icon: <Inbox className="size-3.5" />,
            href: `${ROUTES.ADMIN_TICKETS}?tab=active`,
            activeAdornment:
              activeCasesList.length > 0 ? (
                <span className="ml-1 rounded-full bg-azure px-2 py-0.2 text-[10px] font-bold text-navy">
                  {activeCasesList.length}
                </span>
              ) : null,
          },
          {
            value: 'history',
            label: t('ticketTabHistory'),
            icon: <History className="size-3.5" />,
            href: `${ROUTES.ADMIN_TICKETS}?tab=history`,
            activeAdornment:
              historyCasesList.length > 0 ? (
                <span className="ml-1 rounded-full bg-azure px-2 py-0.2 text-[10px] font-bold text-navy">
                  {historyCasesList.length}
                </span>
              ) : null,
          },
        ]}
      />

      {/* Support Tickets Queue Card */}
      <section className="border-border bg-card shadow-soft overflow-hidden rounded-2xl border">
        <div className="border-border/80 border-b p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="bg-azure/80 text-navy flex size-9 shrink-0 items-center justify-center rounded-xl">
              {currentTab === 'active' ? (
                <Inbox className="size-4.5" aria-hidden="true" />
              ) : (
                <History className="size-4.5" aria-hidden="true" />
              )}
            </span>
            <div>
              <h3 className="text-navy text-base font-bold">
                {currentTab === 'active'
                  ? t('supportTitle')
                  : t('ticketHistoryTitle')}
              </h3>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {currentTab === 'active'
                  ? t('supportDescription')
                  : t('ticketHistoryDescription')}
              </p>
            </div>
          </div>

          {/* Filter Toggle Button */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <FilterToggleButton
              isExpanded={showFilters}
              onToggle={() => setShowFilters((prev) => !prev)}
              hasActiveFilters={hasActiveFilters}
              activeCount={activeFilterCount}
              label={t('filterToggle')}
            />
          </div>
        </div>

        {/* Expandable Ticket Filters Panel */}
        {showFilters ? (
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
                <option value="urgent">
                  {tDynamic(dynamicLabelKey('priority', 'urgent'))}
                </option>
                <option value="high">
                  {tDynamic(dynamicLabelKey('priority', 'high'))}
                </option>
                <option value="normal">
                  {tDynamic(dynamicLabelKey('priority', 'normal'))}
                </option>
                <option value="low">
                  {tDynamic(dynamicLabelKey('priority', 'low'))}
                </option>
              </FilterSelect>

              {/* Status Filter */}
              <FilterSelect
                value={statusFilter}
                onChange={(e) => updateParam('status', e.target.value)}
                ariaLabel={t('filterStatus')}
              >
                <option value="all">{t('filterAllStatuses')}</option>
                {currentTab === 'active' ? (
                  <>
                    <option value="waiting_support">
                      {tDynamic(
                        dynamicLabelKey('supportStatus', 'waiting_support')
                      )}
                    </option>
                    <option value="waiting_user">
                      {tDynamic(
                        dynamicLabelKey('supportStatus', 'waiting_user')
                      )}
                    </option>
                  </>
                ) : (
                  <>
                    <option value="resolved">
                      {tDynamic(
                        dynamicLabelKey('supportStatus', 'resolved')
                      )}
                    </option>
                    <option value="closed">
                      {tDynamic(
                        dynamicLabelKey('supportStatus', 'closed')
                      )}
                    </option>
                  </>
                )}
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

            {hasActiveFilters ? (
              <FilterResetButton
                onClick={clearFilters}
                label={t('clearFilters')}
              />
            ) : null}
          </div>
        ) : null}

        <Table className="[&_td]:px-4 [&_td]:py-3.5 sm:[&_td]:px-5 [&_th]:h-11 [&_th]:px-4 sm:[&_th]:px-5">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-bold text-xs">{t('thSubject')}</TableHead>
              <TableHead className="font-bold text-xs">{t('thPriority')}</TableHead>
              <TableHead className="font-bold text-xs">{t('thStatus')}</TableHead>
              <TableHead className="font-bold text-xs">{t('thTime')}</TableHead>
              <TableHead className="font-bold text-xs">{t('assignee')}</TableHead>
              <TableHead className="text-right font-bold text-xs">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCases.length === 0 ? (
              <TableEmptyRow
                colSpan={6}
                icon={Inbox}
                text={
                  hasActiveFilters
                    ? t('noFilteredTickets')
                    : currentTab === 'active'
                      ? t('noTickets')
                      : t('noTicketHistory')
                }
                description={
                  hasActiveFilters ? (
                    <FilterResetButton
                      onClick={clearFilters}
                      label={t('clearFilters')}
                      className="mt-2"
                    />
                  ) : currentTab === 'active' ? (
                    t('noTicketsDescription')
                  ) : (
                    t('noTicketHistoryDescription')
                  )
                }
              />
            ) : (
              pagedCases.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium text-sm text-foreground max-w-[240px] truncate">
                    {item.title}
                  </TableCell>
                  <TableCell>
                    <AdminPriorityBadge priority={item.priority} />
                  </TableCell>
                  <TableCell>
                    <SupportStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {formatDateTime(dateFormatter, item.created_at)}
                  </TableCell>
                  <TableCell>
                    {item.owner ? (
                      item.owner === props.userId ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-xs font-mono text-navy">
                          <UserCheck className="size-3 text-navy/70" />
                          {t('assigneeMe')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs font-mono">
                          {item.owner}
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center rounded-md border border-amber/30 bg-amber/15 px-2 py-0.5 text-[0.6875rem] font-semibold text-amber-900 dark:text-amber-300">
                        {t('unassignedLabel')}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {currentTab === 'history' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => void openCase(item)}
                        className="h-8 text-xs font-semibold"
                      >
                        <Eye className="size-3.5 mr-1" />
                        {t('openCase')}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant={item.owner ? 'outline' : 'primary'}
                        disabled={
                          busy ||
                          Boolean(item.owner && item.owner !== props.userId)
                        }
                        onClick={() => void openCase(item)}
                        className="h-8 text-xs font-semibold"
                      >
                        <UserCheck className="size-3.5 mr-1" />
                        {item.owner ? t('openCase') : t('claimCase')}
                      </Button>
                    )}
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

      {actionDialog}
    </div>
  );
}

function formatDateTime(formatter: Intl.DateTimeFormat, value?: string) {
  if (!value) return '-';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '-' : formatter.format(parsed);
}
