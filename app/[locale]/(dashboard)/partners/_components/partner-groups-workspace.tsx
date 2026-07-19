'use client';

import {
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
  useMemo,
  useState,
} from 'react';
import {
  ClipboardCheck,
  Copy,
  KeyRound,
  MessageCircleHeart,
  PhoneCall,
  UserRoundMinus,
  UsersRound,
} from 'lucide-react';
import {
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  type AccountabilityGroup,
  type AccountabilityMembership,
  useAccountability,
} from '@/hooks/use-accountability';
import { refreshCurrentUser, useLocalUser } from '@/hooks/use-local-user';
import { toastError, toastSuccess } from '@/lib/feedback';
import { ROUTES } from '@/routes';
import {
  EmptyLine,
  Info,
  QuickLink,
  type Translation,
} from './partners-shared';

export function PartnerGroupsWorkspace({
  t,
  user,
  accountability,
}: {
  t: Translation;
  user: ReturnType<typeof useLocalUser>;
  accountability: ReturnType<typeof useAccountability>;
}) {
  const [phone, setPhone] = useState(user.phone_e164 ?? '');
  const [verificationCode, setVerificationCode] = useState('');
  const [previewCode, setPreviewCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [removalReasons, setRemovalReasons] = useState<Record<string, string>>(
    {}
  );
  const [revealedCodes, setRevealedCodes] = useState<Record<string, string>>(
    {}
  );
  const verified = Boolean(user.email_verified_at && user.phone_verified_at);
  const liveStatuses = new Set([
    'active',
    'leave_pending',
    'support_review',
    'safety_suspended',
  ]);
  const membersByGroup = useMemo(
    () =>
      accountability.workspace.members.reduce<
        Record<string, AccountabilityMembership[]>
      >((groups, membership) => {
        (groups[membership.group_id] ??= []).push(membership);
        return groups;
      }, {}),
    [accountability.workspace.members]
  );
  const activeGroups = accountability.workspace.groups.filter(
    (group) => group.status === 'active'
  ).length;
  const activeMembers = accountability.workspace.members.filter((member) =>
    liveStatuses.has(member.status)
  ).length;
  const pendingDecisions =
    accountability.requests.filter((request) => request.status === 'pending')
      .length +
    accountability.workspace.exit_requests.filter(
      (request) => request.status === 'pending'
    ).length;
  const pendingContacts = accountability.workspace.contact_requests.filter(
    (request) => request.status === 'pending'
  ).length;

  const run = async (action: Promise<unknown>, message: string) => {
    try {
      await action;
      toastSuccess(message);
    } catch (error) {
      toastError(error);
    }
  };

  const resendEmail = async () => {
    try {
      const result = await accountability.resendEmailVerification();
      if (result.preview_url)
        await navigator.clipboard.writeText(result.preview_url);
      toastSuccess(
        result.preview_url ? t('emailPreviewCopied') : t('emailSent')
      );
    } catch (error) {
      toastError(error);
    }
  };

  const startPhone = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const result = await accountability.startPhoneVerification(phone.trim());
      setPreviewCode(result.preview_code ?? '');
      toastSuccess(t('phoneCodeSent'));
    } catch (error) {
      toastError(error);
    }
  };

  const confirmPhone = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await accountability.confirmPhoneVerification(verificationCode.trim());
      await refreshCurrentUser();
      setVerificationCode('');
      setPreviewCode('');
      toastSuccess(t('phoneVerified'));
    } catch (error) {
      toastError(error);
    }
  };

  const createGroup = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const group = await accountability.createGroup(
        groupName.trim(),
        groupDescription.trim()
      );
      if (group.join_code) {
        setRevealedCodes((current) => ({
          ...current,
          [group.id]: group.join_code ?? '',
        }));
      }
      setGroupName('');
      setGroupDescription('');
      toastSuccess(t('groupCreated'));
    } catch (error) {
      toastError(error);
    }
  };

  const rotate = async (group: AccountabilityGroup) => {
    try {
      const result = await accountability.rotateCode(group.id);
      setRevealedCodes((current) => ({
        ...current,
        [group.id]: result.join_code,
      }));
      toastSuccess(t('codeRotated'));
    } catch (error) {
      toastError(error);
    }
  };

  return (
    <div className="space-y-5">
      <DashboardPanel
        icon={ClipboardCheck}
        title={t('partnerOverviewTitle')}
        description={t('partnerOverviewBody')}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Info label={t('activeGroupsLabel')} value={String(activeGroups)} />
          <Info label={t('activeMembersLabel')} value={String(activeMembers)} />
          <Info
            label={t('pendingDecisionsLabel')}
            value={String(pendingDecisions)}
          />
          <Info
            label={t('pendingContactsLabel')}
            value={String(pendingContacts)}
          />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <QuickLink
            href={ROUTES.ACCOUNTABILITY}
            icon={ClipboardCheck}
            title={t('openDecisionQueueTitle')}
            body={t('openDecisionQueueBody')}
          />
          <QuickLink
            href={`${ROUTES.SUPPORT}?channel=partner`}
            icon={MessageCircleHeart}
            title={t('openContactQueueTitle')}
            body={t('openContactQueueBody')}
          />
        </div>
      </DashboardPanel>

      {!verified ? (
        <DashboardPanel
          icon={PhoneCall}
          title={t('verificationTitle')}
          description={t('verificationBody')}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <VerificationCard
              title={t('emailVerification')}
              verified={Boolean(user.email_verified_at)}
              verifiedLabel={t('verified')}
              pendingLabel={t('notVerified')}
            >
              {!user.email_verified_at ? (
                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => void resendEmail()}
                >
                  {t('resendEmail')}
                </Button>
              ) : null}
            </VerificationCard>
            <VerificationCard
              title={t('phoneVerification')}
              verified={Boolean(user.phone_verified_at)}
              verifiedLabel={t('verified')}
              pendingLabel={t('notVerified')}
            >
              {!user.phone_verified_at ? (
                <div className="mt-3 space-y-3">
                  <form
                    onSubmit={(event) => void startPhone(event)}
                    className="flex flex-col gap-2 sm:flex-row"
                  >
                    <label htmlFor="phone-number" className="sr-only">
                      {t('phoneLabel')}
                    </label>
                    <input
                      id="phone-number"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+6281234567890"
                      className="border-input bg-background focus-visible:ring-navy/20 h-11 min-w-0 flex-1 rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
                      required
                    />
                    <Button type="submit" variant="outline">
                      {t('sendCode')}
                    </Button>
                  </form>
                  <form
                    onSubmit={(event) => void confirmPhone(event)}
                    className="flex flex-col gap-2 sm:flex-row"
                  >
                    <label htmlFor="phone-code" className="sr-only">
                      {t('codeVerificationLabel')}
                    </label>
                    <input
                      id="phone-code"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      value={verificationCode}
                      onChange={(event) =>
                        setVerificationCode(event.target.value)
                      }
                      placeholder={
                        previewCode || t('codeVerificationPlaceholder')
                      }
                      className="border-input bg-background focus-visible:ring-navy/20 h-11 min-w-0 flex-1 rounded-xl border px-3 font-mono text-sm tracking-[0.18em] outline-none focus-visible:ring-2"
                      required
                    />
                    <Button type="submit">{t('verifyCode')}</Button>
                  </form>
                  {previewCode ? (
                    <p className="text-muted-foreground text-xs">
                      {t('demoCode', { code: previewCode })}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </VerificationCard>
          </div>
        </DashboardPanel>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(20rem,0.75fr)_minmax(0,1.25fr)] xl:items-start">
        <DashboardPanel
          icon={UsersRound}
          title={t('createGroupTitle')}
          description={t('createGroupBody')}
        >
          <form
            onSubmit={(event) => void createGroup(event)}
            className="space-y-4"
          >
            <label
              htmlFor="group-name"
              className="text-navy block text-sm font-semibold"
            >
              {t('groupName')}
            </label>
            <input
              id="group-name"
              value={groupName}
              minLength={3}
              maxLength={80}
              onChange={(event) => setGroupName(event.target.value)}
              placeholder={t('groupNamePlaceholder')}
              className="border-input bg-background focus-visible:ring-navy/20 h-11 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
              required
            />
            <label
              htmlFor="group-description"
              className="text-navy block text-sm font-semibold"
            >
              {t('groupDescription')}
            </label>
            <Textarea
              id="group-description"
              value={groupDescription}
              maxLength={240}
              onChange={(event) => setGroupDescription(event.target.value)}
              placeholder={t('groupDescriptionPlaceholder')}
            />
            <Button
              type="submit"
              disabled={!verified || accountability.mutating}
            >
              {t('createGroup')}
            </Button>
            {!verified ? (
              <p className="text-muted-foreground text-xs leading-5">
                {t('createRequiresVerification')}
              </p>
            ) : null}
          </form>
        </DashboardPanel>

        <DashboardPanel
          icon={KeyRound}
          title={t('groupsTitle')}
          description={t('groupsBody')}
        >
          <div className="space-y-4">
            {accountability.workspace.groups.length ? (
              accountability.workspace.groups.map((group) => (
                <GroupCard
                  key={group.id}
                  t={t}
                  group={group}
                  members={membersByGroup[group.id] ?? []}
                  code={revealedCodes[group.id]}
                  removalReasons={removalReasons}
                  setRemovalReasons={setRemovalReasons}
                  mutating={accountability.mutating}
                  onRotate={() => void rotate(group)}
                  onArchive={() =>
                    void run(
                      accountability.archiveGroup(group.id),
                      t('groupArchived')
                    )
                  }
                  onRemove={(membership) =>
                    void run(
                      accountability.removeMember(
                        membership.id,
                        removalReasons[membership.id] ?? ''
                      ),
                      t('memberRemoved')
                    )
                  }
                />
              ))
            ) : (
              <EmptyLine title={t('noGroups')} body={t('noGroupsBody')} />
            )}
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}

function GroupCard({
  t,
  group,
  members,
  code,
  removalReasons,
  setRemovalReasons,
  mutating,
  onRotate,
  onArchive,
  onRemove,
}: {
  t: Translation;
  group: AccountabilityGroup;
  members: AccountabilityMembership[];
  code?: string;
  removalReasons: Record<string, string>;
  setRemovalReasons: Dispatch<SetStateAction<Record<string, string>>>;
  mutating: boolean;
  onRotate: () => void;
  onArchive: () => void;
  onRemove: (membership: AccountabilityMembership) => void;
}) {
  const activeMembers = members.filter((item) =>
    ['active', 'leave_pending', 'support_review', 'safety_suspended'].includes(
      item.status
    )
  );

  return (
    <article className="border-border rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-navy font-bold">{group.name}</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('memberCount', { count: activeMembers.length })}
          </p>
        </div>
        <DashboardStatus tone={group.status === 'active' ? 'sage' : 'muted'}>
          {t(`groupStatus.${group.status}`)}
        </DashboardStatus>
      </div>
      {group.description ? (
        <p className="text-foreground mt-3 text-sm leading-6">
          {group.description}
        </p>
      ) : null}
      {group.status === 'active' ? (
        <div className="bg-muted/45 mt-4 rounded-xl p-3">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {t('joinCode')}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <code className="text-navy font-semibold tracking-[0.14em]">
              {code ?? t('codeHint', { hint: group.join_code_hint })}
            </code>
            {code ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('copyCode')}
                onClick={() => void navigator.clipboard.writeText(code)}
              >
                <Copy className="size-4" aria-hidden="true" />
              </Button>
            ) : null}
          </div>
          <Button
            variant="outline"
            className="mt-3 w-full"
            disabled={mutating}
            onClick={onRotate}
          >
            {t('rotateCode')}
          </Button>
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {activeMembers.map((membership) => (
          <div
            key={membership.id}
            className="border-border bg-background rounded-xl border p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-navy font-semibold">
                {membership.student_name}
              </p>
              <DashboardStatus
                tone={membership.status === 'active' ? 'sage' : 'amber'}
              >
                {t(`membershipStatus.${membership.status}`)}
              </DashboardStatus>
            </div>
            <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
              <Info
                label={t('protectionStatus')}
                value={membership.aggregate.protection_status ?? t('notShared')}
              />
              <Info
                label={t('activeDevices')}
                value={String(
                  membership.aggregate.active_device_count ?? t('notShared')
                )}
              />
              <Info
                label={t('checkInDays')}
                value={String(
                  membership.aggregate.check_in_days ?? t('notShared')
                )}
              />
              <Info
                label={t('educationBand')}
                value={
                  membership.aggregate.education_progress_band ?? t('notShared')
                }
              />
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={removalReasons[membership.id] ?? ''}
                onChange={(event) =>
                  setRemovalReasons((current) => ({
                    ...current,
                    [membership.id]: event.target.value,
                  }))
                }
                maxLength={240}
                placeholder={t('removalReason')}
                aria-label={t('removalReason')}
                className="border-input bg-background focus-visible:ring-navy/20 h-10 min-w-0 flex-1 rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
              />
              <Button
                variant="outline"
                disabled={mutating}
                onClick={() => onRemove(membership)}
              >
                <UserRoundMinus className="size-4" aria-hidden="true" />
                {t('remove')}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {group.status === 'active' ? (
        <Button
          variant="outline"
          className="mt-4 w-full"
          disabled={mutating || activeMembers.length > 0}
          onClick={onArchive}
        >
          {t('archiveGroup')}
        </Button>
      ) : null}
    </article>
  );
}

function VerificationCard({
  title,
  verified,
  verifiedLabel,
  pendingLabel,
  children,
}: {
  title: string;
  verified: boolean;
  verifiedLabel: string;
  pendingLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="border-border rounded-xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-navy font-semibold">{title}</p>
        <DashboardStatus tone={verified ? 'sage' : 'amber'}>
          {verified ? verifiedLabel : pendingLabel}
        </DashboardStatus>
      </div>
      {children}
    </div>
  );
}
