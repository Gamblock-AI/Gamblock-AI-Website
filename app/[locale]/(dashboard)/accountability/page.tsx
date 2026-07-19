'use client';

import { type Dispatch, type SetStateAction, useState } from 'react';
import {
  CircleAlert,
  Clock3,
  HeartHandshake,
  LockKeyhole,
  MessageCircleHeart,
  RefreshCw,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAccountability } from '@/hooks/use-accountability';
import { toastError, toastSuccess } from '@/lib/feedback';

export default function AccountabilityPage() {
  const t = useTranslations('accountabilityV2');
  const {
    workspace,
    requests,
    loading,
    mutating,
    error,
    refetch,
    updateSharing,
    requestLeave,
    resolveLeave,
    transitionContact,
    cancelApproval,
    resolveApproval,
  } = useAccountability();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [leaveReason, setLeaveReason] = useState('');
  const isPartner = workspace.role === 'partner';

  const handle = async (action: Promise<unknown>, success: string) => {
    try {
      await action;
      toastSuccess(success);
    } catch (actionError) {
      toastError(actionError);
    }
  };

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={HeartHandshake}
        eyebrow={t('eyebrow')}
        title={isPartner ? t('partnerTitle') : t('studentTitle')}
        description={
          isPartner ? t('partnerDescription') : t('studentDescription')
        }
        aside={
          <DashboardStatus tone={isPartner ? 'navy' : 'sage'}>
            {isPartner ? t('partnerRole') : t('studentRole')}
          </DashboardStatus>
        }
      />

      <DashboardNotice icon={LockKeyhole} title={t('privacyTitle')}>
        {t('privacyBody')}
      </DashboardNotice>

      {error ? (
        <DashboardNotice
          icon={CircleAlert}
          title={t('errorTitle')}
          tone="amber"
          role="alert"
          action={
            <Button variant="outline" onClick={() => void refetch()}>
              <RefreshCw className="size-4" aria-hidden="true" />
              {t('retry')}
            </Button>
          }
        >
          {t('errorBody')}
        </DashboardNotice>
      ) : null}

      {loading ? (
        <DashboardNotice icon={RefreshCw} title={t('loading')} />
      ) : isPartner ? (
        <PartnerAccountability
          t={t}
          workspace={workspace}
          requests={requests}
          responses={responses}
          setResponses={setResponses}
          mutating={mutating}
          onResolveApproval={(id, decision) =>
            handle(
              resolveApproval(id, decision, responses[id] ?? ''),
              decision === 'approve'
                ? t('approvalApproved')
                : t('approvalDenied')
            )
          }
          onResolveLeave={(id, decision) =>
            handle(
              resolveLeave(id, decision),
              decision === 'approved' ? t('leaveApproved') : t('leaveDenied')
            )
          }
          onAcknowledge={(id) =>
            handle(
              transitionContact(id, 'acknowledged'),
              t('contactAcknowledged')
            )
          }
        />
      ) : (
        <StudentAccountability
          t={t}
          workspace={workspace}
          requests={requests}
          mutating={mutating}
          leaveReason={leaveReason}
          setLeaveReason={setLeaveReason}
          onSharing={(sharing) => {
            const membership = workspace.membership;
            if (!membership) return;
            void handle(
              updateSharing(membership.id, sharing),
              t('sharingSaved')
            );
          }}
          onLeave={(kind) => {
            const membership = workspace.membership;
            if (!membership) return;
            void handle(
              requestLeave(membership.id, kind, leaveReason),
              kind === 'unsafe' ? t('unsafeSent') : t('leaveSent')
            );
          }}
          onCancelApproval={(id) =>
            handle(cancelApproval(id), t('approvalCancelled'))
          }
        />
      )}
    </DashboardPage>
  );
}

interface Translation {
  (key: string, values?: Record<string, string | number>): string;
}

function PartnerAccountability({
  t,
  workspace,
  requests,
  responses,
  setResponses,
  mutating,
  onResolveApproval,
  onResolveLeave,
  onAcknowledge,
}: {
  t: Translation;
  workspace: ReturnType<typeof useAccountability>['workspace'];
  requests: ReturnType<typeof useAccountability>['requests'];
  responses: Record<string, string>;
  setResponses: Dispatch<SetStateAction<Record<string, string>>>;
  mutating: boolean;
  onResolveApproval: (id: string, decision: 'approve' | 'deny') => void;
  onResolveLeave: (id: string, decision: 'approved' | 'denied') => void;
  onAcknowledge: (id: string) => void;
}) {
  const pendingApprovals = requests.filter((item) => item.status === 'pending');
  const pendingLeaves = workspace.exit_requests.filter(
    (item) => item.status === 'pending'
  );
  const pendingContacts = workspace.contact_requests.filter(
    (item) => item.status === 'pending'
  );

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <DashboardPanel
        icon={ShieldCheck}
        title={t('decisionQueueTitle')}
        description={t('decisionQueueBody')}
        className="h-full"
        action={
          <DashboardStatus tone={pendingApprovals.length ? 'amber' : 'sage'}>
            {t('itemCount', { count: pendingApprovals.length })}
          </DashboardStatus>
        }
      >
        <div className="space-y-3">
          {pendingApprovals.length ? (
            pendingApprovals.map((request) => (
              <article
                key={request.id}
                className="border-border bg-muted/35 rounded-xl border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-navy font-semibold">
                    {request.action === 'pause_protection'
                      ? t('pauseRequest', {
                          minutes: request.requested_duration_minutes,
                        })
                      : t('uninstallRequest')}
                  </p>
                  <DashboardStatus tone="amber">{t('pending')}</DashboardStatus>
                </div>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {request.reason || t('noReason')}
                </p>
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
                    disabled={mutating}
                    onClick={() => onResolveApproval(request.id, 'deny')}
                  >
                    {t('deny')}
                  </Button>
                  <Button
                    disabled={mutating}
                    onClick={() => onResolveApproval(request.id, 'approve')}
                  >
                    {t('approve')}
                  </Button>
                </div>
              </article>
            ))
          ) : (
            <EmptyLine title={t('noDecisions')} body={t('noDecisionsBody')} />
          )}
        </div>
      </DashboardPanel>

      <div className="space-y-5">
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
              pendingLeaves.map((request) => (
                <article
                  key={request.id}
                  className="border-border rounded-xl border p-4"
                >
                  <p className="text-navy font-semibold">
                    {request.kind === 'unsafe'
                      ? t('unsafeLeave')
                      : t('normalLeave')}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {request.reason || t('noReason')}
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <Button
                      variant="outline"
                      disabled={mutating || request.kind === 'unsafe'}
                      onClick={() => onResolveLeave(request.id, 'denied')}
                    >
                      {t('keepMembership')}
                    </Button>
                    <Button
                      disabled={mutating}
                      onClick={() => onResolveLeave(request.id, 'approved')}
                    >
                      {t('confirmLeave')}
                    </Button>
                  </div>
                </article>
              ))
            ) : (
              <EmptyLine title={t('noLeaves')} body={t('noLeavesBody')} />
            )}
          </div>
        </DashboardPanel>

        <DashboardPanel
          icon={MessageCircleHeart}
          title={t('contactQueueTitle')}
          description={t('contactQueueBody')}
        >
          <div className="space-y-3">
            {pendingContacts.length ? (
              pendingContacts.map((request) => (
                <div
                  key={request.id}
                  className="border-border rounded-xl border p-4"
                >
                  <p className="text-navy font-semibold">
                    {request.student_name || t('studentFallback')}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {request.message || t('structuredContactOnly')}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3 w-full"
                    disabled={mutating}
                    onClick={() => onAcknowledge(request.id)}
                  >
                    {t('acknowledge')}
                  </Button>
                </div>
              ))
            ) : (
              <EmptyLine title={t('noContacts')} body={t('noContactsBody')} />
            )}
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}

function StudentAccountability({
  t,
  workspace,
  requests,
  mutating,
  leaveReason,
  setLeaveReason,
  onSharing,
  onLeave,
  onCancelApproval,
}: {
  t: Translation;
  workspace: ReturnType<typeof useAccountability>['workspace'];
  requests: ReturnType<typeof useAccountability>['requests'];
  mutating: boolean;
  leaveReason: string;
  setLeaveReason: (value: string) => void;
  onSharing: (
    sharing: NonNullable<typeof workspace.membership>['sharing']
  ) => void;
  onLeave: (kind: 'normal' | 'unsafe') => void;
  onCancelApproval: (id: string) => void;
}) {
  const membership = workspace.membership;
  const pendingApproval = requests.find((item) => item.status === 'pending');

  if (!membership) {
    return (
      <DashboardNotice icon={UserRoundCheck} title={t('noGroupTitle')}>
        {t('noGroupBody')}
      </DashboardNotice>
    );
  }

  const toggleSharing = (key: keyof typeof membership.sharing) => {
    onSharing({
      ...membership.sharing,
      [key]: !membership.sharing[key],
    });
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
      <DashboardPanel
        icon={ShieldCheck}
        title={t('sharingTitle')}
        description={t('sharingBody')}
        action={
          <DashboardStatus
            tone={membership.status === 'active' ? 'sage' : 'amber'}
          >
            {t(`membershipStatus.${membership.status}`)}
          </DashboardStatus>
        }
      >
        <div className="space-y-3">
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
              className="border-border flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3"
            >
              <span>
                <span className="text-navy block text-sm font-semibold">
                  {t(`sharing.${key}.title`)}
                </span>
                <span className="text-muted-foreground mt-0.5 block text-xs leading-5">
                  {t(`sharing.${key}.body`)}
                </span>
              </span>
              <input
                type="checkbox"
                checked={membership.sharing[key]}
                disabled={mutating || membership.status !== 'active'}
                onChange={() => toggleSharing(key)}
                className="accent-navy size-5 shrink-0"
              />
            </label>
          ))}
        </div>
      </DashboardPanel>

      <div className="space-y-5">
        <DashboardPanel
          icon={Clock3}
          title={t('approvalStatusTitle')}
          description={t('approvalStatusBody')}
        >
          {pendingApproval ? (
            <div className="border-amber/35 bg-amber/[0.08] rounded-xl border p-4">
              <p className="text-navy font-semibold">
                {pendingApproval.action === 'pause_protection'
                  ? t('pauseRequest', {
                      minutes: pendingApproval.requested_duration_minutes,
                    })
                  : t('uninstallRequest')}
              </p>
              <Button
                variant="outline"
                className="mt-3 w-full"
                disabled={mutating}
                onClick={() => onCancelApproval(pendingApproval.id)}
              >
                {t('cancelApproval')}
              </Button>
            </div>
          ) : (
            <EmptyLine
              title={t('noPendingApproval')}
              body={t('nativeRequestBody')}
            />
          )}
        </DashboardPanel>

        <DashboardPanel
          icon={CircleAlert}
          title={t('leaveTitle')}
          description={t('leaveBody')}
        >
          <label
            htmlFor="leave-reason"
            className="text-navy text-sm font-semibold"
          >
            {t('leaveReason')}
          </label>
          <Textarea
            id="leave-reason"
            value={leaveReason}
            maxLength={500}
            onChange={(event) => setLeaveReason(event.target.value)}
            placeholder={t('leaveReasonPlaceholder')}
            className="mt-2 min-h-20"
          />
          <div className="mt-3 grid gap-2">
            <Button
              variant="outline"
              disabled={mutating || membership.status !== 'active'}
              onClick={() => onLeave('normal')}
            >
              {t('requestNormalLeave')}
            </Button>
            <Button
              variant="destructive"
              disabled={mutating || membership.status !== 'active'}
              onClick={() => onLeave('unsafe')}
            >
              {t('stopSharingNow')}
            </Button>
          </div>
          <p className="text-muted-foreground mt-3 text-xs leading-5">
            {t('unsafeHelp')}
          </p>
        </DashboardPanel>
      </div>
    </div>
  );
}

function EmptyLine({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-border rounded-xl border border-dashed p-4">
      <p className="text-navy font-semibold">{title}</p>
      <p className="text-muted-foreground mt-1 text-sm leading-6">{body}</p>
    </div>
  );
}
