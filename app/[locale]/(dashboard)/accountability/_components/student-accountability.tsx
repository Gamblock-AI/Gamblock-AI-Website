'use client';

import { useMemo, useState } from 'react';
import {
  CircleAlert,
  Clock3,
  RotateCcw,
  Save,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import {
  DashboardNotice,
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type {
  SharingPreferences,
  useAccountability,
} from '@/hooks/use-accountability';
import { Link } from '@/i18n/routing';
import { toastError, toastSuccess } from '@/lib/feedback';
import { ROUTES } from '@/routes';
import { AccountabilityConfirmDialog } from './accountability-confirm-dialog';
import {
  EmptyLine,
  formatDateTime,
  RequestStatus,
  type Translation,
} from './accountability-shared';
import { OptionalMark } from '@/components/common/form-field';

type Accountability = ReturnType<typeof useAccountability>;
type StudentDialog =
  | { type: 'cancel-approval'; id: string }
  | { type: 'cancel-leave'; id: string }
  | { type: 'normal-leave' }
  | { type: 'unsafe-leave' }
  | null;

function sharingEquals(a: SharingPreferences, b: SharingPreferences) {
  return (
    a.protection_health === b.protection_health &&
    a.protection_activity === b.protection_activity &&
    a.recovery_engagement === b.recovery_engagement &&
    a.education_progress === b.education_progress
  );
}

export function StudentAccountability({
  t,
  accountability,
}: {
  t: Translation;
  accountability: Accountability;
}) {
  const locale = useLocale();
  const membership = accountability.workspace.membership;
  const [sharingDraft, setSharingDraft] = useState<SharingPreferences>(() =>
    membership
      ? { ...membership.sharing }
      : {
          protection_health: false,
          protection_activity: false,
          recovery_engagement: false,
          education_progress: false,
        }
  );
  const [leaveReason, setLeaveReason] = useState('');
  const [dialog, setDialog] = useState<StudentDialog>(null);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const pendingApproval = accountability.requests.find(
    (request) => request.status === 'pending'
  );
  const pendingLeave = accountability.workspace.exit_requests.find(
    (request) => request.status === 'pending'
  );
  const visibleRequests = historyExpanded
    ? accountability.requests
    : accountability.requests.slice(0, 5);
  const sharingDirty = membership
    ? !sharingEquals(sharingDraft, membership.sharing)
    : false;
  const canEditSharing =
    membership?.status === 'active' || membership?.status === 'leave_pending';
  const activeCategoryCount = useMemo(
    () => Object.values(sharingDraft).filter(Boolean).length,
    [sharingDraft]
  );

  if (!membership) {
    return (
      <DashboardNotice
        icon={UserRoundCheck}
        title={t('noGroupTitle')}
        action={
          <Link
            href={ROUTES.PARTNERS}
            className="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-navy/30 inline-flex min-h-11 items-center justify-center rounded-lg border px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 motion-reduce:transition-none"
          >
            {t('openPartners')}
          </Link>
        }
      >
        {t('noGroupBody')}
      </DashboardNotice>
    );
  }

  const saveSharing = async () => {
    try {
      const saved = await accountability.updateSharing(
        membership.id,
        sharingDraft
      );
      setSharingDraft({ ...saved.sharing });
      toastSuccess(t('sharingSaved'));
    } catch (error) {
      toastError(error);
    }
  };

  const confirmDialog = async () => {
    try {
      if (dialog?.type === 'cancel-approval') {
        await accountability.cancelApproval(dialog.id);
        toastSuccess(t('approvalCancelled'));
      } else if (dialog?.type === 'cancel-leave') {
        await accountability.cancelLeave(dialog.id);
        toastSuccess(t('leaveCancelled'));
      } else if (dialog?.type === 'normal-leave') {
        await accountability.requestLeave(membership.id, 'normal', leaveReason);
        setLeaveReason('');
        toastSuccess(t('leaveSent'));
      } else if (dialog?.type === 'unsafe-leave') {
        await accountability.requestLeave(membership.id, 'unsafe', leaveReason);
        setLeaveReason('');
        toastSuccess(t('unsafeSent'));
      }
      setDialog(null);
    } catch (error) {
      toastError(error);
    }
  };

  const dialogBusy = dialog
    ? dialog.type === 'cancel-approval'
      ? accountability.isMutating(`approval:${dialog.id}:cancel`)
      : dialog.type === 'cancel-leave'
        ? accountability.isMutating(`leave:${dialog.id}:cancel`)
        : accountability.isMutating(
            dialog.type === 'unsafe-leave' ? 'leave:unsafe' : 'leave:normal'
          )
    : false;

  const dialogCopy = (() => {
    if (dialog?.type === 'cancel-approval') {
      return {
        title: t('cancelApprovalDialogTitle'),
        description: t('cancelApprovalDialogBody'),
        confirm: t('confirmCancelApproval'),
        destructive: false,
      };
    }
    if (dialog?.type === 'cancel-leave') {
      return {
        title: t('cancelLeaveDialogTitle'),
        description: t('cancelLeaveDialogBody'),
        confirm: t('confirmCancelLeave'),
        destructive: false,
      };
    }
    if (dialog?.type === 'unsafe-leave') {
      return {
        title: t('unsafeLeaveDialogTitle'),
        description: t('unsafeLeaveDialogBody'),
        confirm: t('confirmUnsafeLeave'),
        destructive: true,
      };
    }
    return {
      title: t('normalLeaveDialogTitle'),
      description: t('normalLeaveDialogBody'),
      confirm: t('confirmNormalLeave'),
      destructive: false,
    };
  })();

  return (
    <>
      <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
        <DashboardPanel
          icon={ShieldCheck}
          title={t('sharingTitle')}
          description={t('sharingBody')}
          density="compact"
          className="p-3 sm:p-3"
          contentClassName="mt-3"
          action={
            <DashboardStatus tone={sharingDirty ? 'amber' : 'sage'}>
              {sharingDirty
                ? t('sharingUnsaved')
                : t('sharingCount', { count: activeCategoryCount })}
            </DashboardStatus>
          }
        >
          <div className="grid flex-1 grid-rows-4 gap-2">
            {(
              [
                'protection_health',
                'protection_activity',
                'recovery_engagement',
                'education_progress',
              ] as const
            ).map((key) => (
              <label
                key={key}
                className="border-border/80 bg-card hover:bg-muted/20 hover:border-navy/20 flex h-full min-h-0 cursor-pointer items-center justify-between gap-3.5 rounded-xl border p-3 transition-all duration-200 sm:p-3.5"
              >
                <span className="min-w-0 flex-1">
                  <span className="text-navy block text-sm font-bold tracking-tight">
                    {t(`sharing.${key}.title`)}
                  </span>
                  <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
                    {t(`sharing.${key}.body`)}
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={sharingDraft[key]}
                  disabled={
                    !canEditSharing ||
                    accountability.isMutating('sharing:update')
                  }
                  onChange={() =>
                    setSharingDraft((current) => ({
                      ...current,
                      [key]: !current[key],
                    }))
                  }
                  className="accent-navy size-5 shrink-0 cursor-pointer rounded"
                />
              </label>
            ))}
          </div>
          <div className="border-border mt-3 grid gap-2 border-t pt-3 sm:grid-cols-2">
            <Button
              variant="outline"
              size="lg"
              disabled={
                !sharingDirty || accountability.isMutating('sharing:update')
              }
              onClick={() => setSharingDraft({ ...membership.sharing })}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              {t('discardSharing')}
            </Button>
            <Button
              size="lg"
              disabled={
                !sharingDirty || accountability.isMutating('sharing:update')
              }
              onClick={() => void saveSharing()}
            >
              <Save className="size-4" aria-hidden="true" />
              {accountability.isMutating('sharing:update')
                ? t('saving')
                : t('saveSharing')}
            </Button>
          </div>
        </DashboardPanel>

        <div className="flex flex-col gap-4">
          <DashboardPanel
            icon={Clock3}
            title={t('approvalStatusTitle')}
            description={t('approvalStatusBody')}
            density="compact"
            fullHeight={false}
            className="p-3 sm:p-3"
            contentClassName="mt-3"
          >
            {pendingApproval ? (
              <article className="border-amber/35 bg-amber/[0.08] rounded-xl border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-navy font-semibold">
                    {pendingApproval.action === 'pause_protection'
                      ? t('pauseRequest', {
                          minutes: pendingApproval.requested_duration_minutes,
                        })
                      : t('uninstallRequest')}
                  </p>
                  <RequestStatus status="pending">{t('pending')}</RequestStatus>
                </div>
                <p className="text-muted-foreground mt-1.5 text-sm leading-5">
                  {pendingApproval.reason || t('noReason')}
                </p>
                <RequestMeta
                  t={t}
                  created={formatDateTime(locale, pendingApproval.created_at)}
                  expires={formatDateTime(locale, pendingApproval.expires_at)}
                />
                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  disabled={accountability.isMutating(
                    `approval:${pendingApproval.id}:cancel`
                  )}
                  onClick={() =>
                    setDialog({
                      type: 'cancel-approval',
                      id: pendingApproval.id,
                    })
                  }
                >
                  {t('cancelApproval')}
                </Button>
              </article>
            ) : (
              <EmptyLine
                title={t('noPendingApproval')}
                body={t('nativeRequestBody')}
                className="p-3 [&>p:last-child]:leading-5"
              />
            )}
          </DashboardPanel>

          <DashboardPanel
            icon={CircleAlert}
            title={t('leaveTitle')}
            description={t('leaveBody')}
            density="compact"
            fullHeight={false}
            className="p-3 sm:p-3"
            contentClassName="mt-3"
          >
            {membership.status === 'active' ? (
              <>
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <div>
                    <label
                      htmlFor="leave-reason"
                      className="text-navy flex items-center text-sm font-semibold"
                    >
                      <span>{t('leaveReason')}</span>
                      <OptionalMark />
                    </label>
                    <Textarea
                      id="leave-reason"
                      value={leaveReason}
                      maxLength={500}
                      onChange={(event) => setLeaveReason(event.target.value)}
                      placeholder={t('leaveReasonPlaceholder')}
                      className="mt-1.5 min-h-14"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full sm:mb-2.5 sm:min-w-48 sm:w-auto"
                    disabled={accountability.isMutating('leave:normal')}
                    onClick={() => setDialog({ type: 'normal-leave' })}
                  >
                    {t('requestNormalLeave')}
                  </Button>
                </div>
                <div className="border-crimson/25 bg-crimson/[0.05] mt-2.5 grid gap-2.5 rounded-xl border p-2.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div>
                    <p className="text-navy font-semibold">
                      {t('unsafeSectionTitle')}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs leading-4">
                      {t('unsafeHelp')}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full sm:min-w-48 sm:w-auto"
                    disabled={accountability.isMutating('leave:unsafe')}
                    onClick={() => setDialog({ type: 'unsafe-leave' })}
                  >
                    {t('stopSharingNow')}
                  </Button>
                </div>
              </>
            ) : membership.status === 'leave_pending' ? (
              <PendingLeave
                t={t}
                locale={locale}
                request={pendingLeave}
                busy={
                  pendingLeave
                    ? accountability.isMutating(
                        `leave:${pendingLeave.id}:cancel`
                      )
                    : false
                }
                onCancel={() => {
                  if (pendingLeave) {
                    setDialog({ type: 'cancel-leave', id: pendingLeave.id });
                  }
                }}
              />
            ) : (
              <div className="border-amber/35 bg-amber/[0.08] rounded-xl border p-4">
                <DashboardStatus tone="amber">
                  {t(`membershipStatus.${membership.status}`)}
                </DashboardStatus>
                <p className="text-navy mt-3 font-semibold">
                  {t('safetyReviewTitle')}
                </p>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  {t('safetyReviewBody')}
                </p>
                <Link
                  href={`${ROUTES.SUPPORT}?channel=team`}
                  className="bg-navy hover:bg-navy-light focus-visible:ring-navy/30 mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 text-sm font-semibold text-white transition-colors outline-none focus-visible:ring-2 motion-reduce:transition-none"
                >
                  {t('openTeamSupport')}
                </Link>
              </div>
            )}
          </DashboardPanel>
        </div>
      </div>

      <DashboardPanel
        icon={Clock3}
        title={t('requestHistoryTitle')}
        description={t('requestHistoryBody')}
      >
        {visibleRequests.length ? (
          <div className="space-y-3">
            {visibleRequests.map((request) => (
              <article
                key={request.id}
                className="border-border bg-muted/25 grid gap-3 rounded-xl border p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
              >
                <div>
                  <p className="text-navy font-semibold">
                    {request.action === 'pause_protection'
                      ? t('pauseRequest', {
                          minutes: request.requested_duration_minutes,
                        })
                      : t('uninstallRequest')}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm leading-6">
                    {request.reason || t('noReason')}
                  </p>
                  <dl className="text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <div>
                      <dt className="inline">{t('createdAt')}: </dt>
                      <dd className="inline">
                        {formatDateTime(locale, request.created_at) ??
                          t('dateUnavailable')}
                      </dd>
                    </div>
                    {request.resolved_at ? (
                      <div>
                        <dt className="inline">{t('resolvedAt')}: </dt>
                        <dd className="inline">
                          {formatDateTime(locale, request.resolved_at) ??
                            t('dateUnavailable')}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
                <RequestStatus status={request.status}>
                  {t(`requestStatus.${request.status}`)}
                </RequestStatus>
              </article>
            ))}
            {accountability.requests.length > 5 ? (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setHistoryExpanded((current) => !current)}
              >
                {historyExpanded ? t('showLessHistory') : t('showAllHistory')}
              </Button>
            ) : null}
          </div>
        ) : (
          <EmptyLine
            title={t('historyEmptyTitle')}
            body={t('historyEmptyBody')}
          />
        )}
      </DashboardPanel>

      <AccountabilityConfirmDialog
        open={dialog !== null}
        onOpenChange={(open) => !open && setDialog(null)}
        title={dialogCopy.title}
        description={dialogCopy.description}
        cancelLabel={t('keepCurrentState')}
        confirmLabel={dialogCopy.confirm}
        busyLabel={t('processing')}
        busy={dialogBusy}
        destructive={dialogCopy.destructive}
        onConfirm={() => void confirmDialog()}
      />
    </>
  );
}

function RequestMeta({
  t,
  created,
  expires,
}: {
  t: Translation;
  created: string | null;
  expires: string | null;
}) {
  return (
    <dl className="bg-background/70 mt-2 grid gap-1.5 rounded-lg p-2.5 text-xs sm:grid-cols-2">
      <div>
        <dt className="text-muted-foreground">{t('createdAt')}</dt>
        <dd className="text-navy mt-0.5 font-semibold">
          {created ?? t('dateUnavailable')}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t('expiresAt')}</dt>
        <dd className="text-navy mt-0.5 font-semibold">
          {expires ?? t('dateUnavailable')}
        </dd>
      </div>
    </dl>
  );
}

function PendingLeave({
  t,
  locale,
  request,
  busy,
  onCancel,
}: {
  t: Translation;
  locale: string;
  request: Accountability['workspace']['exit_requests'][number] | undefined;
  busy: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="border-amber/35 bg-amber/[0.08] rounded-xl border p-4">
      <DashboardStatus tone="amber">{t('pending')}</DashboardStatus>
      <p className="text-navy mt-3 font-semibold">{t('normalLeave')}</p>
      <p className="text-muted-foreground mt-1 text-sm leading-6">
        {request?.reason || t('noReason')}
      </p>
      <p className="text-muted-foreground mt-3 text-xs leading-5">
        {t('pendingLeaveSharingNotice')}
      </p>
      {request?.review_due_at ? (
        <p className="text-navy mt-2 text-xs font-semibold">
          {t('reviewDueAt', {
            date:
              formatDateTime(locale, request.review_due_at) ??
              t('dateUnavailable'),
          })}
        </p>
      ) : null}
      <Button
        variant="outline"
        className="mt-4 w-full"
        disabled={!request || busy}
        onClick={onCancel}
      >
        {t('cancelLeave')}
      </Button>
    </div>
  );
}
