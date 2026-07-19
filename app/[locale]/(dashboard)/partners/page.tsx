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
  CircleAlert,
  Copy,
  Handshake,
  KeyRound,
  LockKeyhole,
  MessageCircleHeart,
  PhoneCall,
  RefreshCw,
  ShieldCheck,
  UserRoundMinus,
  UsersRound,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { NativeSelect } from '@/components/common/native-select';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  type AccountabilityGroup,
  type AccountabilityMembership,
  type PartnerContactRequest,
  useAccountability,
} from '@/hooks/use-accountability';
import { refreshCurrentUser, useLocalUser } from '@/hooks/use-local-user';
import { toastError, toastSuccess } from '@/lib/feedback';

export default function PartnersPage() {
  const t = useTranslations('partnersV2');
  const user = useLocalUser();
  const accountability = useAccountability();
  const isPartner = accountability.workspace.role === 'partner';

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={Handshake}
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

      {accountability.error ? (
        <DashboardNotice
          icon={CircleAlert}
          title={t('errorTitle')}
          tone="amber"
          role="alert"
          action={
            <Button
              variant="outline"
              onClick={() => void accountability.refetch()}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              {t('retry')}
            </Button>
          }
        >
          {t('errorBody')}
        </DashboardNotice>
      ) : accountability.loading ? (
        <DashboardNotice icon={RefreshCw} title={t('loading')} />
      ) : isPartner ? (
        <PartnerWorkspace t={t} user={user} accountability={accountability} />
      ) : (
        <StudentWorkspace t={t} accountability={accountability} />
      )}
    </DashboardPage>
  );
}

interface Translation {
  (key: string, values?: Record<string, string | number>): string;
}

function StudentWorkspace({
  t,
  accountability,
}: {
  t: Translation;
  accountability: ReturnType<typeof useAccountability>;
}) {
  const [code, setCode] = useState('');
  const [preview, setPreview] = useState<AccountabilityGroup | null>(null);
  const [category, setCategory] =
    useState<PartnerContactRequest['category']>('check_in');
  const [message, setMessage] = useState('');
  const membership = accountability.workspace.membership;
  const group = accountability.workspace.groups[0];

  const previewCode = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setPreview(await accountability.previewGroup(code.trim().toUpperCase()));
    } catch (error) {
      setPreview(null);
      toastError(error);
    }
  };

  const join = async () => {
    try {
      await accountability.joinGroup(code.trim().toUpperCase());
      setPreview(null);
      setCode('');
      toastSuccess(t('joinSuccess'));
    } catch (error) {
      toastError(error);
    }
  };

  const requestContact = async (event: FormEvent) => {
    event.preventDefault();
    if (!membership) return;
    try {
      await accountability.createContactRequest(
        membership.id,
        category,
        message.trim()
      );
      setMessage('');
      toastSuccess(t('contactSuccess'));
    } catch (error) {
      toastError(error);
    }
  };

  if (!membership) {
    return (
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <DashboardPanel
          icon={KeyRound}
          title={t('joinTitle')}
          description={t('joinBody')}
        >
          <form
            onSubmit={(event) => void previewCode(event)}
            className="space-y-4"
          >
            <label
              htmlFor="group-code"
              className="text-navy block text-sm font-semibold"
            >
              {t('codeLabel')}
            </label>
            <input
              id="group-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              minLength={8}
              maxLength={12}
              autoCapitalize="characters"
              autoComplete="off"
              placeholder={t('codePlaceholder')}
              className="border-input bg-background text-foreground focus-visible:border-navy focus-visible:ring-navy/20 h-12 w-full rounded-xl border px-4 font-mono text-base tracking-[0.18em] uppercase outline-none focus-visible:ring-2"
              required
            />
            <Button type="submit" disabled={accountability.mutating}>
              {t('previewGroup')}
            </Button>
          </form>
        </DashboardPanel>

        <DashboardPanel
          icon={ShieldCheck}
          title={t('confirmTitle')}
          description={t('confirmBody')}
        >
          {preview ? (
            <div className="border-sage/35 bg-sage/[0.08] rounded-xl border p-4">
              <p className="text-navy font-bold">{preview.name}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('managedBy', { name: preview.owner_name })}
              </p>
              {preview.description ? (
                <p className="text-foreground mt-3 text-sm leading-6">
                  {preview.description}
                </p>
              ) : null}
              <Button className="mt-4 w-full" onClick={() => void join()}>
                {t('confirmJoin')}
              </Button>
            </div>
          ) : (
            <EmptyLine title={t('previewEmpty')} body={t('previewEmptyBody')} />
          )}
        </DashboardPanel>
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2 xl:items-stretch">
      <DashboardPanel
        icon={UsersRound}
        title={t('currentGroupTitle')}
        description={t('currentGroupBody')}
        className="h-full"
        action={
          <DashboardStatus
            tone={membership.status === 'active' ? 'sage' : 'amber'}
          >
            {t(`membershipStatus.${membership.status}`)}
          </DashboardStatus>
        }
      >
        <div className="border-border rounded-xl border p-4">
          <p className="text-navy font-bold">
            {group?.name ?? t('groupFallback')}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('managedBy', {
              name: group?.owner_name ?? t('partnerFallback'),
            })}
          </p>
          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <Info
              label={t('joinedLabel')}
              value={formatDate(membership.joined_at)}
            />
            <Info label={t('sharingLabel')} value={t('sharingManageHint')} />
          </div>
        </div>
      </DashboardPanel>

      <DashboardPanel
        icon={MessageCircleHeart}
        title={t('contactTitle')}
        description={t('contactBody')}
        className="h-full"
      >
        <form
          onSubmit={(event) => void requestContact(event)}
          className="space-y-4"
        >
          <label
            htmlFor="contact-category"
            className="text-navy block text-sm font-semibold"
          >
            {t('contactCategory')}
          </label>
          <NativeSelect
            id="contact-category"
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value as PartnerContactRequest['category']
              )
            }
          >
            <option value="check_in">{t('contactCategories.check_in')}</option>
            <option value="practical_help">
              {t('contactCategories.practical_help')}
            </option>
            <option value="accountability">
              {t('contactCategories.accountability')}
            </option>
            <option value="other">{t('contactCategories.other')}</option>
          </NativeSelect>
          <label
            htmlFor="contact-message"
            className="text-navy block text-sm font-semibold"
          >
            {t('contactMessage')}
          </label>
          <Textarea
            id="contact-message"
            value={message}
            maxLength={500}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t('contactPlaceholder')}
            className="min-h-24"
          />
          <Button type="submit" disabled={accountability.mutating}>
            {t('sendContact')}
          </Button>
        </form>
      </DashboardPanel>
    </div>
  );
}

function PartnerWorkspace({
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

  const run = async (action: Promise<unknown>, message: string) => {
    try {
      await action;
      toastSuccess(message);
    } catch (error) {
      toastError(error);
    }
  };

  const resendEmail = async () => {
    const result = await accountability.resendEmailVerification();
    if (result.preview_url)
      await navigator.clipboard.writeText(result.preview_url);
    toastSuccess(result.preview_url ? t('emailPreviewCopied') : t('emailSent'));
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
                    className="flex gap-2"
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
                    className="flex gap-2"
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

      <div className="grid gap-5 xl:grid-cols-[minmax(20rem,0.75fr)_minmax(0,1.25fr)]">
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
            <div className="mt-3 flex gap-2">
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
                size="sm"
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/45 rounded-lg px-3 py-2">
      <span className="text-muted-foreground block">{label}</span>
      <span className="text-navy mt-1 block font-semibold">{value}</span>
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

function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? '-'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
        parsed
      );
}
