'use client';

import {
  type Dispatch,
  type FormEvent,
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
  Copy,
  FolderKanban,
  KeyRound,
  Laptop,
  Lock,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserPlus,
  UserRoundMinus,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import {
  FilterResetButton,
  FilterSearchInput,
  FilterSelect,
  FilterToolbar,
} from '@/components/dashboard/filter-toolbar';
import { Pagination } from '@/components/dashboard/pagination';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { OptionalMark, RequiredMark } from '@/components/common/form-field';
import { StudentAvatar } from '@/components/dashboard/student-avatar';
import {
  type AccountabilityGroup,
  type AccountabilityMembership,
  useAccountability,
} from '@/hooks/use-accountability';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import { useQueryFilterInput } from '@/hooks/use-query-filter-input';
import { useQueryFilters } from '@/hooks/use-query-filters';
import { toastError, toastSuccess } from '@/lib/feedback';
import { cn } from '@/lib/utils';
import { DASHBOARD_QUERY_KEYS } from '@/routes';
import {
  EmptyLine,
  Info,
  StatOverviewCard,
  type Translation,
} from './partners-shared';

export function PartnerGroupsWorkspace({
  t,
  accountability,
}: {
  t: Translation;
  accountability: ReturnType<typeof useAccountability>;
}) {
  const tPagination = useTranslations('pagination');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [removalReasons, setRemovalReasons] = useState<Record<string, string>>(
    {}
  );
  const [revealedCodes, setRevealedCodes] = useState<Record<string, string>>(
    {}
  );
  const [showFilters, setShowFilters] = useState(false);

  const { filters, setFilter, resetFilters, activeFilterCount } =
    useQueryFilters({
      resourceKey: 'groups',
      filterKeys: ['q', 'status'],
      defaultValues: {
        q: '',
        status: 'all',
      },
      pageKey: DASHBOARD_QUERY_KEYS.pages.groups,
      removeKeys: ['q', 'status'],
    });
  const queryInput = useQueryFilterInput({
    resourceKey: 'groups',
    pageKey: DASHBOARD_QUERY_KEYS.pages.groups,
    removeKeys: ['q'],
  });

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

  const groupQueryParams = new URLSearchParams();
  if (filters.q.trim()) groupQueryParams.set('q', filters.q.trim());
  if (filters.status !== 'all') groupQueryParams.set('status', filters.status);
  const groupsQuery = usePaginatedQuery<AccountabilityGroup>({
    path: `/accountability/groups?${groupQueryParams.toString()}`,
    pageKey: DASHBOARD_QUERY_KEYS.pages.groups,
    pageSize: 5,
  });
  const groupsPagination = groupsQuery.pagination;

  const run = async (action: Promise<unknown>, message: string) => {
    try {
      await action;
      toastSuccess(message);
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
    <div className="space-y-6">
      {/* 1. Ringkasan Ruang Pendamping */}
      <DashboardPanel
        icon={FolderKanban}
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
            icon={Users}
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
            icon={KeyRound}
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

      {/* 2. Group Management */}
      <DashboardPanel
        icon={UserPlus}
        title={t('createGroupTitle')}
        description={t('createGroupBody')}
        density="compact"
        className="shadow-2xs"
      >
        <form
          onSubmit={(e) => void createGroup(e)}
          className="flex flex-1 flex-col justify-between space-y-4"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="group-name"
                className="text-navy flex items-center text-xs font-bold"
              >
                <span>{t('groupName')}</span>
                <RequiredMark />
              </label>
              <input
                id="group-name"
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                placeholder={t('groupNamePlaceholder')}
                className="border-input bg-background/80 focus-visible:ring-navy/20 h-10 w-full rounded-xl border px-3 text-xs outline-none focus-visible:ring-2"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="group-description"
                className="text-navy flex items-center text-xs font-bold"
              >
                <span>{t('groupDescription')}</span>
                <OptionalMark />
              </label>
              <Textarea
                id="group-description"
                value={groupDescription}
                onChange={(event) => setGroupDescription(event.target.value)}
                placeholder={t('groupDescriptionPlaceholder')}
                className="min-h-24 text-xs"
              />
            </div>
          </div>

          <div className="pt-1 space-y-2">
            <Button
              type="submit"
              disabled={accountability.mutating || !groupName.trim()}
              className="w-full gap-2 text-xs font-bold"
            >
              <PlusCircle className="size-4" aria-hidden="true" />
              {t('createGroup')}
            </Button>
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
        className="shadow-2xs lg:col-span-2"
      >
        <div className="flex flex-1 flex-col space-y-4">
          {accountability.workspace.groups.length > 0 ? (
            <FilterToolbar
              isExpanded={showFilters}
              onToggle={() => setShowFilters((prev) => !prev)}
              activeCount={activeFilterCount}
              hasActiveFilters={activeFilterCount > 0}
              onReset={() => {
                resetFilters();
                queryInput.reset();
              }}
              headerRight={
                <span className="text-xs font-semibold text-muted-foreground">
                  {t('groupsCount', {
                    count: groupsPagination.totalItems,
                  })}
                </span>
              }
            >
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between w-full">
                <div className="w-full sm:w-64">
                  <FilterSearchInput
                    value={queryInput.value}
                    onChangeValue={queryInput.onChange}
                    placeholder={t('searchGroups')}
                    ariaLabel={t('searchGroups')}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <FilterSelect
                    value={filters.status}
                    onChange={(e) => setFilter('status', e.target.value)}
                    ariaLabel={t('allGroupStatuses')}
                  >
                    <option value="all">{t('allGroupStatuses')}</option>
                    <option value="active">{t('groupActive')}</option>
                    <option value="archived">{t('groupArchived')}</option>
                  </FilterSelect>
                  {activeFilterCount > 0 ? (
                    <FilterResetButton
                      onClick={() => {
                        resetFilters();
                        queryInput.reset();
                      }}
                      label={t('resetFilters')}
                    />
                  ) : null}
                </div>
              </div>
            </FilterToolbar>
          ) : null}

          {accountability.workspace.groups.length === 0 ? (
            <EmptyLine
              icon={FolderKanban}
              title={t('noGroups')}
              body={t('noGroupsBody')}
              className="flex-1"
            />
          ) : groupsPagination.totalItems === 0 ? (
            <EmptyLine
              icon={FolderKanban}
              title={t('noGroups')}
              body={t('noGroupsBody')}
              className="flex-1"
            />
          ) : (
            <div className="space-y-4">
              {groupsPagination.items.map((group) => (
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

              {groupsPagination.totalItems > 0 ? (
                <div className="border-border/80 bg-muted/15 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 border rounded-xl px-4 py-2.5 sm:px-5">
                  <span className="text-muted-foreground text-xs font-semibold whitespace-nowrap self-start sm:self-center">
                    {tPagination('showingRange', {
                      start: groupsPagination.startIndex,
                      end: groupsPagination.endIndex,
                      total: groupsPagination.totalItems,
                    })}
                  </span>
                  {groupsPagination.totalPages > 1 ? (
                    <Pagination
                      currentPage={groupsPagination.page}
                      totalPages={groupsPagination.totalPages}
                      onPageChange={groupsPagination.setPage}
                      size="sm"
                      variant="flat"
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </DashboardPanel>
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
  const tPagination = useTranslations('pagination');
  const [expandedMembers, setExpandedMembers] = useState<
    Record<string, boolean>
  >({});
  const [copied, setCopied] = useState(false);
  const displayCode = code || group.join_code;
  const memberResourceKey = `groupMembers][${group.id}`;
  const memberPageKey = DASHBOARD_QUERY_KEYS.pages.groupMembers(group.id);
  const { filters: memberFilters } = useQueryFilters({
    resourceKey: memberResourceKey,
    filterKeys: ['q'],
    defaultValues: { q: '' },
    pageKey: memberPageKey,
    removeKeys: ['q'],
  });
  const memberQueryInput = useQueryFilterInput({
    resourceKey: memberResourceKey,
    pageKey: memberPageKey,
    removeKeys: ['q'],
  });

  const activeMembers = useMemo(
    () => members.filter((item) =>
      ['active', 'leave_pending', 'support_review', 'safety_suspended'].includes(item.status)
    ),
    [members]
  );
  const memberQueryParams = new URLSearchParams({ group_id: group.id });
  if (memberFilters.q.trim()) {
    memberQueryParams.set('q', memberFilters.q.trim());
  }
  const membersQuery = usePaginatedQuery<AccountabilityMembership>({
    path: `/accountability/members?${memberQueryParams.toString()}`,
    pageKey: memberPageKey,
    pageSize: 5,
  });
  const memberPagination = membersQuery.pagination;
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
              value={memberQueryInput.value}
              onChange={(e) => memberQueryInput.onChange(e.target.value)}
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
        ) : memberPagination.totalItems === 0 ? (
          <p className="text-muted-foreground py-3 text-center text-xs">
            {t('noMatchingStudents')}
          </p>
        ) : (
          <div className="space-y-2.5">
            {memberPagination.items.map((membership) => {
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
                                ? 'bg-amber'
                                : 'bg-muted-foreground'
                          )}
                        />
                        <span className="text-navy font-semibold text-[0.6875rem]">
                          {formatProtectionStatus(t, protection)}
                        </span>
                      </div>

                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <ChevronDown
                          className={cn(
                            'size-4 transition-transform duration-200',
                            isExpanded && 'rotate-180 text-navy'
                          )}
                          aria-hidden="true"
                        />
                        <span className="sr-only">
                          {isExpanded ? t('hideDetails') : t('viewDetails')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details Drawer */}
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

            {memberPagination.totalPages > 1 ? (
              <div className="border-border/80 bg-muted/15 flex flex-col sm:flex-row items-center justify-between gap-2 border rounded-xl p-2.5 mt-2">
                <span className="text-muted-foreground text-[0.6875rem] font-semibold">
                  {tPagination('showingRange', {
                    start: memberPagination.startIndex,
                    end: memberPagination.endIndex,
                    total: memberPagination.totalItems,
                  })}
                </span>
                <Pagination
                  currentPage={memberPagination.page}
                  totalPages={memberPagination.totalPages}
                  onPageChange={memberPagination.setPage}
                  size="sm"
                  variant="flat"
                />
              </div>
            ) : null}
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
