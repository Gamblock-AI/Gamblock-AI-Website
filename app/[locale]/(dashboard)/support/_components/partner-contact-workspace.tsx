'use client';

import { type FormEvent, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  CircleAlert,
  Clock3,
  MessageCircleHeart,
  RefreshCw,
  Send,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { NativeSelect } from '@/components/common/native-select';
import {
  DashboardNotice,
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Pagination } from '@/components/dashboard/pagination';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Textarea } from '@/components/ui/textarea';
import { StudentAvatar } from '@/components/dashboard/student-avatar';
import { ExpandableRow } from '@/components/dashboard/expandable-row';
import {
  type PartnerContactRequest,
  usePartnerContactRequests,
} from '@/hooks/use-accountability';
import { useLocalUser } from '@/hooks/use-local-user';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import type { UsePaginationResult } from '@/hooks/use-pagination';
import { Link } from '@/i18n/routing';
import { OptionalMark, RequiredMark } from '@/components/common/form-field';
import { toastError, toastSuccess } from '@/lib/feedback';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes';

export function PartnerContactWorkspace() {
  const t = useTranslations('supportWorkspace');
  const locale = useLocale();
  const contacts = usePartnerContactRequests();
  const [category, setCategory] =
    useState<PartnerContactRequest['category']>('check_in');
  const [message, setMessage] = useState('');
  const [currentTime] = useState(() => Date.now());
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const workspace = contacts.workspace;
  const user = useLocalUser();
  const isPartner = workspace?.role === 'partner' || user.role === 'partner';
  const membership = workspace?.membership;
  const incomingQuery = usePaginatedQuery<PartnerContactRequest>({
    path: '/accountability/contact-requests?bucket=incoming',
    pageKey: 'page[incomingContacts]',
    pageSize: 5,
  });
  const historyQuery = usePaginatedQuery<PartnerContactRequest>({
    path: '/accountability/contact-requests?bucket=history',
    pageKey: 'page[contactHistory]',
    pageSize: 5,
  });
  const studentRequestsQuery = usePaginatedQuery<PartnerContactRequest>({
    path: '/accountability/contact-requests?bucket=all',
    pageKey: 'page[contactRequests]',
    pageSize: 5,
  });
  const toggleExpanded = (id: string) =>
    setExpanded((current) => ({ ...current, [id]: !current[id] }));

  // Partner view splits requests into actionable ("Permintaan dari siswa")
  // and finished ("Riwayat permintaan siswa"); the student view keeps the
  // single request list as before.
  const incoming = incomingQuery.items;
  const history = historyQuery.items;
  const studentRequests = studentRequestsQuery.items;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!membership) return;
    try {
      await contacts.createRequest(membership.id, category, message.trim());
      setMessage('');
      toastSuccess(t('partnerContactSuccess'));
    } catch (error) {
      toastError(error, t('partnerContactError'));
    }
  };

  const transition = async (requestId: string, status: string) => {
    try {
      await contacts.transitionRequest(requestId, status);
      toastSuccess(t(`contactActionSuccess.${status}`));
    } catch (error) {
      toastError(error, t('partnerContactError'));
    }
  };

  if (contacts.loading && !workspace) {
    return (
      <DashboardNotice
        icon={RefreshCw}
        title={isPartner ? t('incomingLoading') : t('partnerLoading')}
      />
    );
  }

  if (contacts.error && !workspace) {
    return (
      <DashboardNotice
        icon={CircleAlert}
        title={isPartner ? t('incomingErrorTitle') : t('partnerErrorTitle')}
        tone="amber"
        role="alert"
        action={
          <Button variant="outline" onClick={() => void contacts.refetch()}>
            <RefreshCw className="size-4" aria-hidden="true" />
            {t('historyRetry')}
          </Button>
        }
      >
        {isPartner ? t('incomingErrorBody') : t('partnerErrorBody')}
      </DashboardNotice>
    );
  }

  if (!isPartner && !membership) {
    return (
      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(19rem,0.85fr)]">
        <EmptyState
          icon={UserRoundCheck}
          title={t('partnerUnavailableTitle')}
          hint={t('partnerUnavailableBody')}
          action={
            <Link
              href={ROUTES.PARTNERS}
              className="bg-navy hover:bg-navy-light focus-visible:ring-navy/30 inline-flex min-h-9 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold text-white transition-colors outline-none focus-visible:ring-2 shadow-2xs"
            >
              {t('partnerUnavailableAction')}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
          className="h-full flex-1"
        />
        <ContactBoundary isPartner={false} fullHeight />
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-12 xl:items-stretch">
      {isPartner ? (
        <DashboardPanel
          icon={MessageCircleHeart}
          title={t('incomingContactTitle')}
          description={t('incomingContactBody')}
          className="h-full xl:col-span-5"
          action={
            <DashboardStatus
              tone={
                contacts.requests.some((item) => item.status === 'pending')
                  ? 'amber'
                  : 'sage'
              }
            >
              {t('contactPendingCount', {
                count: contacts.requests.filter(
                  (item) => item.status === 'pending'
                ).length,
              })}
            </DashboardStatus>
          }
        >
          <div className="flex flex-1 flex-col justify-between gap-3">
            <ContactRequestList
              requests={incoming}
              pagination={incomingQuery.pagination}
              isPartner
              mutating={contacts.mutating}
              locale={locale}
              currentTime={currentTime}
              expanded={expanded}
              onToggle={toggleExpanded}
              onTransition={(id, status) => void transition(id, status)}
              emptyIcon={MessageCircleHeart}
              emptyTitle={t('incomingEmpty')}
              emptyBody={t('incomingEmptyBody')}
              emptyClassName="flex-1"
            />
            {incoming.length > 0 ? <ContactBoundary isPartner /> : null}
          </div>
        </DashboardPanel>
      ) : (
        <DashboardPanel
          icon={Send}
          title={t('partnerFormTitle')}
          description={t('partnerFormBody')}
          className="h-full xl:col-span-7"
        >
          <form onSubmit={(event) => void submit(event)} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="partner-contact-category"
                className="text-navy flex items-center text-sm font-semibold"
              >
                <span>{t('partnerCategoryLabel')}</span>
                <RequiredMark />
              </label>
              <NativeSelect
                id="partner-contact-category"
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value as PartnerContactRequest['category']
                  )
                }
              >
                <option value="check_in">
                  {t('partnerCategories.check_in')}
                </option>
                <option value="practical_help">
                  {t('partnerCategories.practical_help')}
                </option>
                <option value="accountability">
                  {t('partnerCategories.accountability')}
                </option>
                <option value="other">{t('partnerCategories.other')}</option>
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="partner-contact-message"
                className="text-navy flex items-center text-sm font-semibold"
              >
                <span>{t('partnerMessageLabel')}</span>
                <OptionalMark />
              </label>
              <Textarea
                id="partner-contact-message"
                value={message}
                maxLength={500}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={t('partnerMessagePlaceholder')}
                aria-describedby="partner-contact-help"
                className="min-h-28"
              />
              <p
                id="partner-contact-help"
                className="text-muted-foreground text-xs leading-5"
              >
                {t('partnerMessageHelp')}
              </p>
            </div>
            <Button type="submit" size="lg" disabled={contacts.mutating}>
              <Send className="size-4" aria-hidden="true" />
              {contacts.mutating ? t('partnerSubmitting') : t('partnerSubmit')}
            </Button>
          </form>
        </DashboardPanel>
      )}

      <DashboardPanel
        icon={Clock3}
        title={isPartner ? t('incomingHistoryTitle') : t('partnerHistoryTitle')}
        description={
          isPartner ? t('incomingHistoryBody') : t('partnerHistoryBody')
        }
        className={`h-full ${isPartner ? 'xl:col-span-7' : 'xl:col-span-5'}`}
      >
        <div className="flex flex-1 flex-col justify-between">
          <ContactRequestList
            requests={isPartner ? history : studentRequests}
            pagination={
              isPartner
                ? historyQuery.pagination
                : studentRequestsQuery.pagination
            }
            isPartner={isPartner}
            mutating={contacts.mutating}
            locale={locale}
            currentTime={currentTime}
            expanded={expanded}
            onToggle={toggleExpanded}
            onTransition={(id, status) => void transition(id, status)}
            emptyIcon={Clock3}
            emptyTitle={
              isPartner
                ? t('incomingHistoryEmpty')
                : t('partnerHistoryEmpty')
            }
            emptyBody={
              isPartner
                ? t('incomingHistoryEmptyBody')
                : t('partnerHistoryEmptyBody')
            }
            emptyClassName="flex-1"
          />
        </div>
      </DashboardPanel>
    </div>
  );
}

function ContactBoundary({
  isPartner,
  fullHeight,
}: {
  isPartner: boolean;
  fullHeight?: boolean;
}) {
  const t = useTranslations('supportWorkspace');

  if (fullHeight) {
    return (
      <div className="border-sage/30 bg-gradient-to-br from-sage/[0.12] via-card to-sage/[0.04] shadow-soft flex h-full flex-col items-center justify-center rounded-2xl border p-6 sm:p-8 text-center">
        <span className="border-sage/25 bg-sage/15 text-sage-dark flex size-12 items-center justify-center rounded-2xl border shadow-2xs">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <p className="text-navy mt-3 text-sm font-bold">
          {isPartner ? t('incomingBoundaryTitle') : t('partnerBoundaryTitle')}
        </p>
        <p className="text-muted-foreground mt-1 max-w-xs text-xs leading-relaxed">
          {isPartner ? t('incomingBoundaryBody') : t('partnerBoundaryBody')}
        </p>
      </div>
    );
  }

  return (
    <div className="border-sage/25 bg-gradient-to-r from-sage/[0.08] via-card to-sage/[0.03] rounded-xl border p-3 sm:px-3.5 sm:py-2.5 shadow-2xs">
      <div className="flex items-start gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sage/15 text-sage-dark border border-sage/20">
          <ShieldCheck
            className="size-3.5"
            aria-hidden="true"
          />
        </span>
        <div className="min-w-0">
          <p className="text-navy text-xs font-bold">
            {isPartner ? t('incomingBoundaryTitle') : t('partnerBoundaryTitle')}
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
            {isPartner ? t('incomingBoundaryBody') : t('partnerBoundaryBody')}
          </p>
        </div>
      </div>
    </div>
  );
}

function ContactRequestList({
  requests,
  pagination,
  isPartner,
  mutating,
  locale,
  currentTime,
  expanded,
  onToggle,
  emptyIcon,
  emptyTitle,
  emptyBody,
  emptyClassName,
  onTransition,
}: {
  requests: PartnerContactRequest[];
  pagination: UsePaginationResult<PartnerContactRequest>;
  isPartner: boolean;
  mutating: boolean;
  locale: string;
  currentTime: number;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  emptyIcon?: LucideIcon;
  emptyTitle: string;
  emptyBody: string;
  emptyClassName?: string;
  onTransition: (id: string, status: string) => void;
}) {
  const t = useTranslations('supportWorkspace');
  const tPagination = useTranslations('pagination');
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  if (!requests.length) {
    const Icon = emptyIcon || (isPartner ? MessageCircleHeart : Send);
    return (
      <div
        className={cn(
          'border-border/80 bg-muted/20 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center',
          emptyClassName
        )}
      >
        <span className="border-border/80 bg-card text-muted-foreground/80 flex size-12 items-center justify-center rounded-2xl border shadow-2xs">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <p className="text-navy mt-3 text-sm font-bold">{emptyTitle}</p>
        <p className="text-muted-foreground mt-1 max-w-sm text-xs leading-relaxed">
          {emptyBody}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => {
        const createdAt = new Date(request.created_at);
        const canEscalate =
          !isPartner &&
          request.status === 'pending' &&
          currentTime - createdAt.getTime() >= 24 * 60 * 60 * 1000;
        return (
          <ExpandableRow
            key={request.id}
            open={Boolean(expanded[request.id])}
            onToggle={() => onToggle(request.id)}
            header={
              <div className="flex w-full items-center gap-2 min-w-0">
                {isPartner ? (
                  <StudentAvatar
                    name={request.student_name || t('studentFallback')}
                    avatarUrl={request.student_avatar_url}
                    className="size-6"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  {isPartner ? (
                    <p className="text-navy truncate text-sm font-bold">
                      {request.student_name || t('studentFallback')}
                    </p>
                  ) : (
                    <p className="text-navy truncate text-sm font-bold">
                      {t(`partnerCategories.${request.category}`)}
                    </p>
                  )}
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {Number.isNaN(createdAt.getTime())
                      ? t('dateUnavailable')
                      : formatter.format(createdAt)}
                  </p>
                </div>
                <DashboardStatus tone={contactTone(request.status)}>
                  {t(`contactStatuses.${request.status}`)}
                </DashboardStatus>
              </div>
            }
          >
            {isPartner ? (
              <p className="text-muted-foreground text-xs font-semibold">
                {t(`partnerCategories.${request.category}`)}
              </p>
            ) : null}
            <p className="text-foreground mt-2 text-sm leading-6">
              {request.message || t('partnerMessageEmpty')}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {isPartner && request.status === 'pending' ? (
                <Button
                  variant="outline"
                  disabled={mutating}
                  onClick={() => onTransition(request.id, 'acknowledged')}
                >
                  {t('contactAcknowledge')}
                </Button>
              ) : null}
              {isPartner &&
              ['acknowledged', 'escalated'].includes(request.status) ? (
                <Button
                  variant="outline"
                  disabled={mutating}
                  onClick={() => onTransition(request.id, 'closed')}
                >
                  {t('contactClose')}
                </Button>
              ) : null}
              {!isPartner && request.status === 'pending' ? (
                <Button
                  variant="outline"
                  disabled={mutating}
                  onClick={() => onTransition(request.id, 'cancelled')}
                >
                  {t('contactCancel')}
                </Button>
              ) : null}
              {canEscalate ? (
                <Button
                  variant="outline"
                  disabled={mutating}
                  onClick={() => onTransition(request.id, 'escalated')}
                >
                  {t('contactEscalate')}
                </Button>
              ) : null}
              {!isPartner &&
              ['acknowledged', 'escalated'].includes(request.status) ? (
                <Button
                  variant="outline"
                  disabled={mutating}
                  onClick={() => onTransition(request.id, 'closed')}
                >
                  {t('contactClose')}
                </Button>
              ) : null}
            </div>
          </ExpandableRow>
        );
      })}

      {pagination.totalPages > 1 ? (
        <div className="border-border/80 bg-muted/15 flex flex-col sm:flex-row items-center justify-between gap-2 border rounded-xl p-2.5 mt-2">
          <span className="text-muted-foreground text-[0.6875rem] font-semibold">
            {tPagination('showingRange', {
              start: pagination.startIndex,
              end: pagination.endIndex,
              total: pagination.totalItems,
            })}
          </span>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={pagination.setPage}
            size="sm"
            variant="flat"
          />
        </div>
      ) : null}
    </div>
  );
}

function contactTone(status: PartnerContactRequest['status']) {
  if (status === 'acknowledged' || status === 'closed') return 'sage' as const;
  if (status === 'pending' || status === 'escalated') return 'amber' as const;
  return 'muted' as const;
}
