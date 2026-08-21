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
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  ChevronsUpDown,
  ClipboardCheck,
  Copy,
  FolderKanban,
  KeyRound,
  Laptop,
  Lock,
  MessageCircleHeart,
  PhoneCall,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserCheck,
  UserPlus,
  UserRoundMinus,
  Users,
  UsersRound,
} from 'lucide-react';
import {
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { OptionalMark, RequiredMark } from '@/components/common/form-field';
import { StudentAvatar } from '@/components/dashboard/student-avatar';
import {
  type AccountabilityGroup,
  type AccountabilityMembership,
  useAccountability,
} from '@/hooks/use-accountability';
import { refreshCurrentUser, useLocalUser } from '@/hooks/use-local-user';
import { toastError, toastSuccess } from '@/lib/feedback';
import { cn } from '@/lib/utils';
import {
  EmptyLine,
  Info,
  StatOverviewCard,
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
  const verified = Boolean(user.phone_verified_at);
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
      {/* 1. Ringkasan Pendampingan Card */}
      <DashboardPanel
        icon={ClipboardCheck}
        title={t('partnerOverviewTitle')}
        description={t('partnerOverviewBody')}
        density="compact"
        surface="default"
        fullHeight={false}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatOverviewCard
            icon={FolderKanban}
            label={t('activeGroupsLabel')}
            value={activeGroups}
            tone="navy"
            subtitle={t('groupStatus.active')}
          />
          <StatOverviewCard
            icon={UserCheck}
            label={t('activeMembersLabel')}
            value={activeMembers}
            tone="sage"
            subtitle={
              activeMembers > 0
                ? t('activeStudentsCount', { count: activeMembers })
                : t('noneYet')
            }
          />
          <StatOverviewCard
            icon={ShieldAlert}
            label={t('pendingDecisionsLabel')}
            value={pendingDecisions}
            tone={pendingDecisions > 0 ? 'amber' : 'navy'}
            subtitle={pendingDecisions > 0 ? undefined : t('noQueue')}
            badge={
              pendingDecisions > 0
                ? {
                    text: t('actionRequiredCount', { count: pendingDecisions }),
                    tone: 'amber',
                  }
                : undefined
            }
          />
          <StatOverviewCard
            icon={MessageCircleHeart}
            label={t('pendingContactsLabel')}
            value={pendingContacts}
            tone={pendingContacts > 0 ? 'azure' : 'navy'}
            subtitle={pendingContacts > 0 ? undefined : t('noQueue')}
            badge={
              pendingContacts > 0
                ? {
                    text: t('newCount', { count: pendingContacts }),
                    tone: 'navy',
                  }
                : undefined
            }
          />
        </div>
      </DashboardPanel>

      {!verified ? (
        <DashboardPanel
          icon={PhoneCall}
          title={t('verificationTitle')}
          description={t('verificationBody')}
          fullHeight={false}
        >
          <div className="grid gap-4 lg:grid-cols-2">
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
                      {t('phoneLabel')} *
                    </label>
                    <input
                      id="phone-number"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+6281234567890"
                      aria-label={`${t('phoneLabel')} *`}
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
                      {t('codeVerificationLabel')} *
                    </label>
                    <input
                      id="phone-code"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      value={verificationCode}
                      onChange={(event) =>
                        setVerificationCode(event.target.value)
                      }
                      aria-label={`${t('codeVerificationLabel')} *`}
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

      {/* 2-Column Section: Buat Grup (Left) and Grup & Anggota (Right) */}
      <div className="grid gap-6 xl:grid-cols-[minmax(21rem,0.72fr)_minmax(0,1.28fr)] xl:items-stretch">
        {/* 2. Buat Grup Card */}
        <DashboardPanel
          icon={UsersRound}
          title={t('createGroupTitle')}
          description={t('createGroupBody')}
          density="compact"
          fullHeight
          className="shadow-2xs"
        >
          <form
            onSubmit={(event) => void createGroup(event)}
            className="flex flex-1 flex-col justify-between gap-4"
          >
            <div className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="group-name"
                    className="text-navy flex items-center text-xs font-bold sm:text-sm"
                  >
                    <span>{t('groupName')}</span>
                    <RequiredMark />
                  </label>
                  <span className="text-muted-foreground text-[0.6875rem]">
                    {groupName.length}/80
                  </span>
                </div>
                <input
                  id="group-name"
                  value={groupName}
                  minLength={3}
                  maxLength={80}
                  onChange={(event) => setGroupName(event.target.value)}
                  placeholder={t('groupNamePlaceholder')}
                  className="border-input bg-background focus-visible:ring-navy/25 mt-1.5 h-11 w-full rounded-xl border px-3.5 text-sm transition-colors outline-none focus-visible:ring-2"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="group-description"
                    className="text-navy flex items-center text-xs font-bold sm:text-sm"
                  >
                    <span>{t('groupDescription')}</span>
                    <OptionalMark />
                  </label>
                  <span className="text-muted-foreground text-[0.6875rem]">
                    {groupDescription.length}/240
                  </span>
                </div>
                <Textarea
                  id="group-description"
                  value={groupDescription}
                  maxLength={240}
                  rows={3}
                  onChange={(event) => setGroupDescription(event.target.value)}
                  placeholder={t('groupDescriptionPlaceholder')}
                  className="border-input bg-background focus-visible:ring-navy/25 mt-1.5 resize-none rounded-xl text-sm transition-colors outline-none focus-visible:ring-2"
                />
              </div>
            </div>

            <div className="pt-1 space-y-2">
              <Button
                type="submit"
                disabled={!verified || accountability.mutating}
                className="w-full gap-2 shadow-sm font-semibold"
              >
                <PlusCircle className="size-4" aria-hidden="true" />
                {t('createGroup')}
              </Button>
              {!verified ? (
                <div className="border-amber/30 bg-amber/[0.08] flex items-center gap-2 rounded-lg border p-2.5 text-xs text-amber-900">
                  <ShieldAlert className="size-4 shrink-0 text-amber-700" />
                  <span>{t('createRequiresVerification')}</span>
                </div>
              ) : null}
            </div>
          </form>
        </DashboardPanel>

        {/* 3. Grup dan Anggota Card */}
        <DashboardPanel
          icon={KeyRound}
          title={t('groupsTitle')}
          description={t('groupsBody')}
          density="compact"
          fullHeight
          className="shadow-2xs"
        >
          <div className="flex flex-1 flex-col">
            {accountability.workspace.groups.length ? (
              <div className="space-y-4">
                {accountability.workspace.groups.map((group) => (
                  <GroupCard
                    key={group.id}
                    t={t}
                    group={group}
                    members={membersByGroup[group.id] ?? []}
                    code={revealedCodes[group.id] || group.join_code}
                    removalReasons={removalReasons}
                    setRemovalReasons={setRemovalReasons}
                    mutating={accountability.mutating}
                    onRotate={() => void rotate(group)}
                    onDelete={() =>
                      void run(
                        accountability.deleteGroup(group.id),
                        t('groupDeleted')
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
                ))}
              </div>
            ) : (
              <EmptyLine
                icon={FolderKanban}
                title={t('noGroups')}
                body={t('noGroupsBody')}
                className="flex-1"
              />
            )}
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}

const protectionStatusKey = {
  ready: 'protectionState.ready',
  attention: 'protectionState.attention',
  unknown: 'protectionState.unknown',
} as const;

const educationProgressKey = {
  not_started: 'educationProgress.notStarted',
  starting: 'educationProgress.starting',
  in_progress: 'educationProgress.inProgress',
  near_complete: 'educationProgress.nearComplete',
} as const;

function formatProtectionStatus(
  t: Translation,
  status: AccountabilityMembership['aggregate']['protection_status']
) {
  return status ? t(protectionStatusKey[status]) : t('notShared');
}

function formatEducationProgress(
  t: Translation,
  progress: AccountabilityMembership['aggregate']['education_progress_band']
) {
  return progress ? t(educationProgressKey[progress]) : t('notShared');
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
  onDelete,
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
  onDelete: () => void;
  onRemove: (membership: AccountabilityMembership) => void;
}) {
  const [expandedMembers, setExpandedMembers] = useState<
    Record<string, boolean>
  >({});
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const displayCode = code || group.join_code;

  const activeMembers = useMemo(
    () =>
      members.filter((item) =>
        ['active', 'leave_pending', 'support_review', 'safety_suspended'].includes(
          item.status
        )
      ),
    [members]
  );

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return activeMembers;
    const query = searchQuery.toLowerCase().trim();
    return activeMembers.filter((m) =>
      m.student_name.toLowerCase().includes(query)
    );
  }, [activeMembers, searchQuery]);

  const allExpanded =
    activeMembers.length > 0 &&
    activeMembers.every((m) => expandedMembers[m.id]);

  const toggleMember = (memberId: string) => {
    setExpandedMembers((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  const toggleAll = () => {
    const nextState = !allExpanded;
    const updated: Record<string, boolean> = {};
    for (const m of activeMembers) {
      updated[m.id] = nextState;
    }
    setExpandedMembers(updated);
  };

  const handleCopy = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toastSuccess(t('copySuccess'));
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  return (
    <article className="border-border/80 bg-background/50 hover:border-navy/20 relative rounded-2xl border p-4 sm:p-5 transition-all duration-200 shadow-2xs">
      {/* Group Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="bg-azure/80 text-navy mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl font-bold">
            <FolderKanban className="size-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-navy text-base sm:text-lg font-extrabold tracking-tight">
                {group.name}
              </h3>
              <DashboardStatus
                tone={group.status === 'active' ? 'sage' : 'muted'}
              >
                {t(`groupStatus.${group.status}`)}
              </DashboardStatus>
            </div>
            <p className="text-muted-foreground mt-0.5 text-xs font-medium">
              {t('memberCount', { count: activeMembers.length })}
            </p>
          </div>
        </div>
      </div>

      {group.description ? (
        <p className="text-foreground/80 mt-3 text-xs leading-relaxed sm:text-sm">
          {group.description}
        </p>
      ) : null}

      {/* Join Code Box */}
      {group.status === 'active' ? (
        <div className="border-border/70 bg-muted/40 mt-4 rounded-xl border p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <KeyRound className="text-navy size-4" aria-hidden="true" />
              <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                {t('joinCode')}
              </span>
            </div>
            <span className="text-muted-foreground hidden sm:inline text-[0.6875rem]">
              {displayCode ? t('copyCode') : ''}
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
            {displayCode ? (
              <div className="flex items-center gap-2">
                <code className="border-navy/20 bg-background text-navy font-mono text-sm font-bold tracking-[0.14em] rounded-lg border px-3 py-1.5 shadow-2xs">
                  {displayCode}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={t('copyCode')}
                  onClick={() => void handleCopy(displayCode)}
                  className="gap-1.5 text-xs h-8 px-2.5"
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5 text-sage" />
                      <span className="text-sage font-semibold">
                        {t('copied')}
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>{t('copyCode')}</span>
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="border-border bg-background text-navy font-mono text-xs font-semibold rounded-lg border px-2.5 py-1">
                  {group.join_code_hint ? t('codeHint', { hint: group.join_code_hint }) : '-'}
                </span>
                <span className="text-muted-foreground text-xs">
                  (Aktif di perangkat)
                </span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8"
              disabled={mutating}
              onClick={onRotate}
            >
              <RefreshCw
                className={cn('size-3.5', mutating && 'animate-spin')}
                aria-hidden="true"
              />
              {t('rotateCode')}
            </Button>
          </div>
        </div>
      ) : null}

      {/* Members Section with Header, Search, Expand All & Collapsible Student Rows */}
      <div className="mt-4 pt-2 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="text-navy size-4" aria-hidden="true" />
            <h4 className="text-navy text-xs font-bold uppercase tracking-wider">
              {t('membersList')}
            </h4>
            <span className="border-border bg-muted/80 text-muted-foreground inline-flex items-center rounded-full border px-2 py-0.5 text-[0.6875rem] font-bold">
              {activeMembers.length}
            </span>
          </div>

          {activeMembers.length >= 2 ? (
            <button
              type="button"
              onClick={toggleAll}
              className="text-navy hover:text-navy-light inline-flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ChevronsUpDown className="size-3.5" aria-hidden="true" />
              <span>{allExpanded ? t('collapseAll') : t('expandAll')}</span>
            </button>
          ) : null}
        </div>

        {/* Search input if group has 4+ members */}
        {activeMembers.length >= 4 ? (
          <div className="relative">
            <Search className="text-muted-foreground absolute left-3 top-1/2 size-3.5 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchStudents')}
              aria-label={t('searchStudents')}
              className="border-input bg-background/80 focus-visible:ring-navy/20 h-9 w-full rounded-xl border pl-8.5 pr-3 text-xs outline-none focus-visible:ring-2"
            />
          </div>
        ) : null}

        {/* Member list or Empty states */}
        {activeMembers.length === 0 ? (
          <div className="border-border/80 border-dashed bg-muted/20 flex flex-col items-center justify-center rounded-xl border p-6 text-center">
            <span className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full">
              <UserPlus className="size-5" />
            </span>
            <p className="text-navy mt-2 text-xs font-bold sm:text-sm">
              {t('noStudentsInGroup')}
            </p>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs">
              {t('noStudentsInGroupBody')}
            </p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <p className="text-muted-foreground py-3 text-center text-xs">
            {t('noMatchingStudents')}
          </p>
        ) : (
          <div className="space-y-2.5">
            {filteredMembers.map((membership) => {
              const isExpanded = Boolean(expandedMembers[membership.id]);
              const protection = membership.aggregate.protection_status;
              const isProtectionReady = protection === 'ready';
              const isProtectionAttention = protection === 'attention';

              return (
                <div
                  key={membership.id}
                  className={cn(
                    'border-border/80 bg-card rounded-xl border transition-all duration-200 shadow-2xs',
                    isExpanded
                      ? 'border-navy/25 ring-1 ring-navy/10'
                      : 'hover:border-navy/20 hover:bg-muted/15'
                  )}
                >
                  {/* Collapsed Toggle Header */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onClick={() => toggleMember(membership.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleMember(membership.id);
                      }
                    }}
                    className="flex flex-wrap items-center justify-between gap-3 p-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <StudentAvatar
                        name={membership.student_name}
                        avatarUrl={membership.student_avatar_url}
                        className="size-8 shadow-2xs"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-navy truncate text-sm font-bold">
                            {membership.student_name}
                          </p>
                          <DashboardStatus
                            tone={
                              membership.status === 'active' ? 'sage' : 'amber'
                            }
                          >
                            {t(`membershipStatus.${membership.status}`)}
                          </DashboardStatus>
                        </div>
                      </div>
                    </div>

                    {/* Quick Preview Chips on Collapsed Row */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="hidden xs:flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1 text-xs">
                        <span
                          className={cn(
                            'size-2 rounded-full shrink-0',
                            isProtectionReady
                              ? 'bg-sage'
                              : isProtectionAttention
                                ? 'bg-amber animate-pulse'
                                : 'bg-muted-foreground'
                          )}
                        />
                        <span className="text-muted-foreground text-[0.6875rem] font-medium sm:text-xs">
                          {formatProtectionStatus(t, protection)}
                        </span>
                      </div>

                      {membership.aggregate.active_device_count ? (
                        <div className="hidden sm:flex items-center gap-1 text-muted-foreground text-xs">
                          <Smartphone className="size-3.5" />
                          <span>
                            {membership.aggregate.active_device_count}
                          </span>
                        </div>
                      ) : null}

                      <span
                        className={cn(
                          'text-muted-foreground flex size-7 items-center justify-center rounded-lg bg-muted/50 transition-transform duration-200',
                          isExpanded && 'rotate-180 text-navy bg-azure/80'
                        )}
                      >
                        <ChevronDown className="size-4" aria-hidden="true" />
                      </span>
                    </div>
                  </div>

                  {/* Expanded Accordion Body */}
                  {isExpanded ? (
                    <div className="border-border/70 bg-muted/15 border-t p-3.5 sm:p-4 rounded-b-xl space-y-3.5 animate-in fade-in-50 duration-150">
                      <div className="grid gap-2 text-xs sm:grid-cols-2">
                        <Info
                          label={t('protectionStatus')}
                          value={formatProtectionStatus(t, protection)}
                          icon={
                            isProtectionReady ? ShieldCheck : ShieldAlert
                          }
                          tone={
                            isProtectionReady
                              ? 'sage'
                              : isProtectionAttention
                                ? 'amber'
                                : 'default'
                          }
                        />
                        <Info
                          label={t('activeDevices')}
                          value={String(
                            membership.aggregate.active_device_count ??
                              t('notShared')
                          )}
                          icon={Laptop}
                        />
                        <Info
                          label={t('checkInDays')}
                          value={
                            membership.aggregate.check_in_days !== undefined &&
                            membership.aggregate.check_in_days !== null
                              ? t('checkInDaysCount', {
                                  count: membership.aggregate.check_in_days,
                                })
                              : t('notShared')
                          }
                          icon={Calendar}
                        />
                        <Info
                          label={t('educationBand')}
                          value={formatEducationProgress(
                            t,
                            membership.aggregate.education_progress_band
                          )}
                          icon={BookOpen}
                        />
                      </div>

                      {/* Privacy Note */}
                      <p className="text-muted-foreground flex items-center gap-1.5 text-[0.6875rem]">
                        <Lock className="size-3 shrink-0" />
                        <span>{t('aggregateConsentNote')}</span>
                      </p>

                      {/* Member Removal Action */}
                      <div className="border-border/60 bg-background flex flex-col gap-2 rounded-xl border p-2.5 sm:flex-row sm:items-center">
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
                          className="border-input bg-background focus-visible:ring-navy/20 h-9 min-w-0 flex-1 rounded-lg border px-3 text-xs outline-none focus-visible:ring-2"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={mutating}
                          onClick={() => onRemove(membership)}
                          className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0 h-9"
                        >
                          <UserRoundMinus
                            className="size-3.5"
                            aria-hidden="true"
                          />
                          {t('remove')}
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Group Button */}
      {group.status === 'active' ? (
        <div className="mt-5 border-t border-border/70 pt-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 text-xs text-muted-foreground hover:text-foreground"
            disabled={mutating || activeMembers.length > 0}
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            {t('deleteGroup')}
          </Button>
          {activeMembers.length > 0 ? (
            <p className="text-muted-foreground mt-1.5 text-center text-[0.6875rem]">
              {t('deleteGroupHint')}
            </p>
          ) : null}
        </div>
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
    <div className="border-border/80 bg-background/50 rounded-2xl border p-4 shadow-2xs">
      <div className="flex items-center justify-between gap-3">
        <p className="text-navy font-bold text-sm">{title}</p>
        <DashboardStatus tone={verified ? 'sage' : 'amber'}>
          {verified ? verifiedLabel : pendingLabel}
        </DashboardStatus>
      </div>
      {children}
    </div>
  );
}

