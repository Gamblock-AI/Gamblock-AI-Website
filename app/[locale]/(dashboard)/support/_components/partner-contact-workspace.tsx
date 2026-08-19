'use client';

import { type FormEvent, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StudentAvatar } from '@/components/dashboard/student-avatar';
import { ExpandableRow } from '@/components/dashboard/expandable-row';
import {
  type PartnerContactRequest,
  usePartnerContactRequests,
} from '@/hooks/use-accountability';
import { useLocalUser } from '@/hooks/use-local-user';
import { Link } from '@/i18n/routing';
import { OptionalMark, RequiredMark } from '@/components/common/form-field';
import { toastError, toastSuccess } from '@/lib/feedback';
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
  const toggleExpanded = (id: string) =>
    setExpanded((current) => ({ ...current, [id]: !current[id] }));

  // Partner view splits requests into actionable ("Permintaan dari siswa")
  // and finished ("Riwayat permintaan siswa"); the student view keeps the
  // single request list as before.
  const incoming = contacts.requests.filter((request) =>
    ['pending', 'acknowledged', 'escalated'].includes(request.status)
  );
  const history = contacts.requests.filter((request) =>
    ['closed', 'cancelled'].includes(request.status)
  );

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
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(19rem,0.85fr)]">
        <DashboardPanel
          icon={UserRoundCheck}
          title={t('partnerUnavailableTitle')}
          description={t('partnerUnavailableBody')}
        >
          <Link
            href={ROUTES.PARTNERS}
            className="bg-navy hover:bg-navy-light focus-visible:ring-navy/30 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white transition-colors outline-none focus-visible:ring-2"
          >
            {t('partnerUnavailableAction')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </DashboardPanel>
        <ContactBoundary isPartner={false} />
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
          <div className="space-y-3">
            <ContactRequestList
              requests={incoming}
              isPartner
              mutating={contacts.mutating}
              locale={locale}
              currentTime={currentTime}
              expanded={expanded}
              onToggle={toggleExpanded}
              onTransition={(id, status) => void transition(id, status)}
              emptyTitle={t('incomingEmpty')}
              emptyBody={t('incomingEmptyBody')}
            />
            <ContactBoundary isPartner />
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
        <ContactRequestList
          requests={isPartner ? history : contacts.requests}
          isPartner={isPartner}
          mutating={contacts.mutating}
          locale={locale}
          currentTime={currentTime}
          expanded={expanded}
          onToggle={toggleExpanded}
          limit={isPartner ? 5 : 2}
          onTransition={(id, status) => void transition(id, status)}
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
        />
      </DashboardPanel>
    </div>
  );
}

function ContactBoundary({ isPartner }: { isPartner: boolean }) {
  const t = useTranslations('supportWorkspace');
  return (
    <div className="border-sage/30 bg-sage/[0.07] rounded-xl border p-4">
      <div className="flex items-start gap-3">
        <ShieldCheck
          className="text-sage mt-0.5 size-5 shrink-0"
          aria-hidden="true"
        />
        <div>
          <p className="text-navy text-sm font-bold">
            {isPartner ? t('incomingBoundaryTitle') : t('partnerBoundaryTitle')}
          </p>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {isPartner ? t('incomingBoundaryBody') : t('partnerBoundaryBody')}
          </p>
        </div>
      </div>
    </div>
  );
}

function ContactRequestList({
  requests,
  isPartner,
  mutating,
  locale,
  currentTime,
  expanded,
  onToggle,
  limit,
  emptyTitle,
  emptyBody,
  onTransition,
}: {
  requests: PartnerContactRequest[];
  isPartner: boolean;
  mutating: boolean;
  locale: string;
  currentTime: number;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  limit?: number;
  emptyTitle: string;
  emptyBody: string;
  onTransition: (id: string, status: string) => void;
}) {
  const t = useTranslations('supportWorkspace');
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  if (!requests.length) {
    return (
      <div className="border-border rounded-xl border border-dashed p-4">
        <p className="text-navy font-semibold">{emptyTitle}</p>
        <p className="text-muted-foreground mt-1 text-sm leading-6">
          {emptyBody}
        </p>
      </div>
    );
  }

  const visible = [...requests]
    .sort(
      (left, right) =>
        Date.parse(right.created_at) - Date.parse(left.created_at)
    )
    .slice(0, limit);

  return (
    <div className="space-y-3">
      {visible.map((request) => {
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
    </div>
  );
}

function contactTone(status: PartnerContactRequest['status']) {
  if (status === 'acknowledged' || status === 'closed') return 'sage' as const;
  if (status === 'pending' || status === 'escalated') return 'amber' as const;
  return 'muted' as const;
}
