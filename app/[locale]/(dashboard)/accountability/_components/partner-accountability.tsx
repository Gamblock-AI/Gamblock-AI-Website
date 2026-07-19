'use client';

import { useMemo, useState } from 'react';
import { ShieldCheck, UserRoundCheck } from 'lucide-react';
import { useLocale } from 'next-intl';
import {
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { useAccountability } from '@/hooks/use-accountability';
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

type Accountability = ReturnType<typeof useAccountability>;
type PartnerDialog =
  | { type: 'approval'; id: string; decision: 'approve' | 'deny' }
  | { type: 'leave'; id: string; decision: 'approved' | 'denied' }
  | null;

export function PartnerAccountability({
  t,
  accountability,
}: {
  t: Translation;
  accountability: Accountability;
}) {
  const locale = useLocale();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [dialog, setDialog] = useState<PartnerDialog>(null);
  const pendingApprovals = accountability.requests.filter(
    (request) => request.status === 'pending'
  );
  const pendingLeaves = accountability.workspace.exit_requests.filter(
    (request) => request.status === 'pending'
  );
  const membersById = useMemo(
    () =>
      new Map(
        accountability.workspace.members.map((member) => [member.id, member])
      ),
    [accountability.workspace.members]
  );

  const confirmDecision = async () => {
    if (!dialog) return;
    try {
      if (dialog.type === 'approval') {
        await accountability.resolveApproval(
          dialog.id,
          dialog.decision,
          responses[dialog.id] ?? ''
        );
        toastSuccess(
          dialog.decision === 'approve'
            ? t('approvalApproved')
            : t('approvalDenied')
        );
      } else {
        await accountability.resolveLeave(dialog.id, dialog.decision);
        toastSuccess(
          dialog.decision === 'approved' ? t('leaveApproved') : t('leaveDenied')
        );
      }
      setDialog(null);
    } catch (error) {
      toastError(error);
    }
  };

  const dialogBusy = dialog
    ? dialog.type === 'approval'
      ? accountability.isMutating(`approval:${dialog.id}:${dialog.decision}`)
      : accountability.isMutating(`leave:${dialog.id}:${dialog.decision}`)
    : false;
  const dialogCopy = (() => {
    if (dialog?.type === 'approval') {
      return dialog.decision === 'approve'
        ? {
            title: t('approveDialogTitle'),
            body: t('approveDialogBody'),
            confirm: t('confirmApprove'),
            destructive: false,
          }
        : {
            title: t('denyDialogTitle'),
            body: t('denyDialogBody'),
            confirm: t('confirmDeny'),
            destructive: true,
          };
    }
    return dialog?.decision === 'denied'
      ? {
          title: t('keepMembershipDialogTitle'),
          body: t('keepMembershipDialogBody'),
          confirm: t('confirmKeepMembership'),
          destructive: false,
        }
      : {
          title: t('endMembershipDialogTitle'),
          body: t('endMembershipDialogBody'),
          confirm: t('confirmEndMembership'),
          destructive: true,
        };
  })();

  return (
    <>
      <div className="grid gap-5 xl:grid-cols-2 xl:items-start">
        <DashboardPanel
          icon={ShieldCheck}
          title={t('decisionQueueTitle')}
          description={t('decisionQueueBody')}
          action={
            <DashboardStatus tone={pendingApprovals.length ? 'amber' : 'sage'}>
              {t('itemCount', { count: pendingApprovals.length })}
            </DashboardStatus>
          }
        >
          <div className="space-y-3">
            {pendingApprovals.length ? (
              pendingApprovals.map((request) => {
                const member = membersById.get(request.membership_id);
                return (
                  <article
                    key={request.id}
                    className="border-border bg-muted/35 rounded-xl border p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-navy text-sm font-bold">
                          {member?.student_name || t('studentFallback')}
                        </p>
                        <p className="text-navy mt-1 font-semibold">
                          {request.action === 'pause_protection'
                            ? t('pauseRequest', {
                                minutes: request.requested_duration_minutes,
                              })
                            : t('uninstallRequest')}
                        </p>
                      </div>
                      <RequestStatus status="pending">
                        {t('pending')}
                      </RequestStatus>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm leading-6">
                      {request.reason || t('noReason')}
                    </p>
                    <dl className="bg-background/70 mt-3 grid gap-2 rounded-lg p-3 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">
                          {t('createdAt')}
                        </dt>
                        <dd className="text-navy mt-1 font-semibold">
                          {formatDateTime(locale, request.created_at) ??
                            t('dateUnavailable')}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          {t('expiresAt')}
                        </dt>
                        <dd className="text-navy mt-1 font-semibold">
                          {formatDateTime(locale, request.expires_at) ??
                            t('dateUnavailable')}
                        </dd>
                      </div>
                    </dl>
                    <label
                      htmlFor={`response-${request.id}`}
                      className="text-navy mt-3 block text-sm font-semibold"
                    >
                      {t('supportiveResponse')}
                    </label>
                    <Textarea
                      id={`response-${request.id}`}
                      value={responses[request.id] ?? ''}
                      maxLength={500}
                      onChange={(event) =>
                        setResponses((current) => ({
                          ...current,
                          [request.id]: event.target.value,
                        }))
                      }
                      placeholder={t('supportiveResponsePlaceholder')}
                      className="mt-2 min-h-20"
                    />
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Button
                        variant="outline"
                        disabled={accountability.isMutating(
                          `approval:${request.id}:deny`
                        )}
                        onClick={() =>
                          setDialog({
                            type: 'approval',
                            id: request.id,
                            decision: 'deny',
                          })
                        }
                      >
                        {t('deny')}
                      </Button>
                      <Button
                        disabled={accountability.isMutating(
                          `approval:${request.id}:approve`
                        )}
                        onClick={() =>
                          setDialog({
                            type: 'approval',
                            id: request.id,
                            decision: 'approve',
                          })
                        }
                      >
                        {t('approve')}
                      </Button>
                    </div>
                  </article>
                );
              })
            ) : (
              <EmptyLine title={t('noDecisions')} body={t('noDecisionsBody')} />
            )}
          </div>
        </DashboardPanel>

        <DashboardPanel
          icon={UserRoundCheck}
          title={t('leaveQueueTitle')}
          description={t('leaveQueueBody')}
          action={
            <DashboardStatus tone={pendingLeaves.length ? 'amber' : 'muted'}>
              {t('itemCount', { count: pendingLeaves.length })}
            </DashboardStatus>
          }
        >
          <div className="space-y-3">
            {pendingLeaves.length ? (
              pendingLeaves.map((request) => {
                const member = membersById.get(request.membership_id);
                const unsafe = request.kind === 'unsafe';
                return (
                  <article
                    key={request.id}
                    className="border-border rounded-xl border p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-navy text-sm font-bold">
                          {member?.student_name || t('studentFallback')}
                        </p>
                        <p className="text-navy mt-1 font-semibold">
                          {unsafe ? t('unsafeLeave') : t('normalLeave')}
                        </p>
                      </div>
                      <RequestStatus status="pending">
                        {t('pending')}
                      </RequestStatus>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm leading-6">
                      {request.reason || t('noReason')}
                    </p>
                    <p className="text-muted-foreground mt-2 text-xs">
                      {formatDateTime(locale, request.created_at) ??
                        t('dateUnavailable')}
                    </p>
                    {unsafe ? (
                      <div className="border-amber/35 bg-amber/[0.08] mt-3 rounded-lg border p-3">
                        <p className="text-navy text-xs leading-5 font-semibold">
                          {t('unsafePartnerNotice')}
                        </p>
                        <Link
                          href={`${ROUTES.SUPPORT}?channel=team`}
                          className="text-navy mt-2 inline-flex min-h-10 items-center text-xs font-semibold underline underline-offset-4"
                        >
                          {t('openTeamSupport')}
                        </Link>
                      </div>
                    ) : request.review_due_at ? (
                      <p className="text-navy mt-2 text-xs font-semibold">
                        {t('reviewDueAt', {
                          date:
                            formatDateTime(locale, request.review_due_at) ??
                            t('dateUnavailable'),
                        })}
                      </p>
                    ) : null}
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {!unsafe ? (
                        <Button
                          variant="outline"
                          disabled={accountability.isMutating(
                            `leave:${request.id}:denied`
                          )}
                          onClick={() =>
                            setDialog({
                              type: 'leave',
                              id: request.id,
                              decision: 'denied',
                            })
                          }
                        >
                          {t('keepMembership')}
                        </Button>
                      ) : null}
                      <Button
                        className={unsafe ? 'sm:col-span-2' : undefined}
                        variant={unsafe ? 'destructive' : 'primary'}
                        disabled={accountability.isMutating(
                          `leave:${request.id}:approved`
                        )}
                        onClick={() =>
                          setDialog({
                            type: 'leave',
                            id: request.id,
                            decision: 'approved',
                          })
                        }
                      >
                        {t('confirmLeave')}
                      </Button>
                    </div>
                  </article>
                );
              })
            ) : (
              <EmptyLine title={t('noLeaves')} body={t('noLeavesBody')} />
            )}
          </div>
        </DashboardPanel>
      </div>

      <AccountabilityConfirmDialog
        open={dialog !== null}
        onOpenChange={(open) => !open && setDialog(null)}
        title={dialogCopy.title}
        description={dialogCopy.body}
        cancelLabel={t('keepCurrentState')}
        confirmLabel={dialogCopy.confirm}
        busyLabel={t('processing')}
        busy={dialogBusy}
        destructive={dialogCopy.destructive}
        onConfirm={() => void confirmDecision()}
      />
    </>
  );
}
