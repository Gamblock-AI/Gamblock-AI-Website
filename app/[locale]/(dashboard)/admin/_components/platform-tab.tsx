import { type FormEvent, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Save,
  ScrollText,
  Share2,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import type {
  AdminAuditEvent,
  AdminAccount,
  AdminSiteSocialLink,
} from '@/hooks/use-admin-operations';
import { Pagination } from '@/components/dashboard/pagination';
import {
  FilterResetButton,
  FilterSearchInput,
  FilterSelect,
  FilterToggleButton,
} from '@/components/dashboard/filter-toolbar';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import { useQueryFilters } from '@/hooks/use-query-filters';
import { useQueryFilterInput } from '@/hooks/use-query-filter-input';
import { toastError, toastSuccess } from '@/lib/feedback';
import { cn } from '@/lib/utils';
import {
  dynamicLabelFallback,
  dynamicLabelKey,
} from '@/lib/i18n/dynamic-labels';
import {
  AdminEmptyTable,
  AdminFormField,
  adminFieldClassName,
} from './admin-shared';
import { DASHBOARD_QUERY_KEYS } from '@/routes';

const PLATFORMS = [
  'instagram',
  'tiktok',
  'youtube',
  'facebook',
  'linkedin',
  'x',
  'threads',
  'github',
] as const;

function SocialIcon({
  platform,
  className = 'size-4',
}: {
  platform: string;
  className?: string;
}) {
  switch (platform) {
    case 'instagram':
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-1.42V8.94a6.34 6.34 0 0 0-5.1 2.12 6.36 6.36 0 0 0 4.19 10.44 6.34 6.34 0 0 0 6.35-6.35V9.4a8.16 8.16 0 0 0 4.67 1.48V7.43a4.85 4.85 0 0 1-3.3-0.74z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case 'x':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'threads':
      return (
        <svg className={className} viewBox="0 0 192 192" fill="currentColor">
          <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
        </svg>
      );
    case 'github':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      );
    default:
      return null;
  }
}

// The platform icon and name identify the vendor; badges stay on the brand
// neutral tone instead of per-vendor marketing palettes.
const platformBadgeStyle = 'bg-muted text-foreground border-border';

function getRoleBadgeStyle(role: string) {
  const r = role.toLowerCase();
  if (r === 'admin' || r === 'platform_admin') {
    return 'bg-navy/10 text-navy border-navy/25';
  }
  if (r === 'partner') {
    return 'bg-success/15 text-navy border-success/40';
  }
  if (r === 'user') {
    return 'bg-sky-light/60 text-navy border-sky/40';
  }
  return 'bg-amber/15 text-navy border-amber/40';
}

function normalizeKey(str: string): string {
  if (!str) return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function formatAuditAction(action: string): string {
  if (!action) return '—';
  const normalized = action
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[._-]+/g, ' ')
    .trim();
  return normalized
    .split(/\s+/)
    .map((word, index) =>
      index === 0
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word.toLowerCase()
    )
    .join(' ');
}

type AdminTranslate = {
  (key: string, values?: Record<string, string | number>): string;
  has(key: string): boolean;
};

// Localize a known audit action; unknown values fall back to the humanized
// form so new backend events never render raw keys or trigger MISSING_MESSAGE
// console errors.
function localizeAuditAction(t: AdminTranslate, action: string): string {
  if (!action) return '—';
  const directKey = `auditActions.${action}`;
  if (t.has(directKey)) return t(directKey);

  const normalized = normalizeKey(action);
  const normKey = `auditActions.${normalized}`;
  if (t.has(normKey)) return t(normKey);

  return formatAuditAction(action);
}

function getAuditTargetParts(
  t: AdminTranslate,
  targetType: string,
  target: string
): { typeLabel: string; targetLabel: string; isConfig: boolean } {
  if (!targetType) {
    return { typeLabel: '', targetLabel: target || '—', isConfig: false };
  }

  const directTypeKey = `auditTargetTypes.${targetType}`;
  let resolvedType = t.has(directTypeKey) ? t(directTypeKey) : null;
  if (!resolvedType) {
    const normType = normalizeKey(targetType);
    const normTypeKey = `auditTargetTypes.${normType}`;
    resolvedType = t.has(normTypeKey)
      ? t(normTypeKey)
      : formatAuditAction(targetType);
  }

  if (!target) {
    return { typeLabel: resolvedType, targetLabel: '', isConfig: true };
  }

  const directTargetKey = `auditTargets.${target}`;
  let resolvedTarget = t.has(directTargetKey) ? t(directTargetKey) : null;
  let isConfig = Boolean(resolvedTarget);
  if (!resolvedTarget) {
    const normTarget = normalizeKey(target);
    const normTargetKey = `auditTargets.${normTarget}`;
    if (t.has(normTargetKey)) {
      resolvedTarget = t(normTargetKey);
      isConfig = true;
    } else {
      resolvedTarget = target;
    }
  }

  return { typeLabel: resolvedType, targetLabel: resolvedTarget, isConfig };
}

function AuditTargetCell({
  t,
  targetType,
  target,
}: {
  t: AdminTranslate;
  targetType: string;
  target: string;
}) {
  const { typeLabel, targetLabel, isConfig } = getAuditTargetParts(
    t,
    targetType,
    target
  );

  if (isConfig) {
    return (
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-navy font-semibold text-xs">
          {targetLabel || typeLabel}
        </span>
        {targetLabel && typeLabel !== targetLabel ? (
          <span className="text-[0.6875rem] text-muted-foreground">
            {typeLabel}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
      {typeLabel ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.6875rem] font-semibold bg-muted/60 text-navy border border-border/70 shrink-0">
          {typeLabel}
        </span>
      ) : null}
      <span
        className="font-mono text-[0.75rem] text-muted-foreground truncate max-w-[220px]"
        title={targetLabel}
      >
        {targetLabel}
      </span>
    </div>
  );
}

interface PlatformTabProps {
  socialLinks: AdminSiteSocialLink[];
  accounts: AdminAccount[];
  currentUserId?: string;
  auditEvents: AdminAuditEvent[];
  replaceSocialLinks: (
    items: AdminSiteSocialLink[],
    reason: string
  ) => Promise<unknown>;
  createAccount: (
    email: string,
    phone: string,
    displayName: string,
    role: string,
    reason: string
  ) => Promise<{ account: AdminAccount; temporary_password: string }>;
  updateAccount: (
    id: string,
    disabled: boolean,
    reason: string
  ) => Promise<unknown>;
}

export function PlatformTab({
  socialLinks,
  accounts,
  currentUserId,
  auditEvents,
  replaceSocialLinks,
  createAccount,
  updateAccount,
}: PlatformTabProps) {
  const t = useTranslations('adminPage');
  const tDynamic = useTranslations('dynamicLabels');
  const tPagination = useTranslations('pagination');
  const initialLinks = useMemo(
    () =>
      PLATFORMS.map((platform, index) => {
        const current = socialLinks.find((item) => item.platform === platform);
        return (
          current ?? {
            platform,
            label:
              platform === 'x'
                ? 'X'
                : platform[0].toUpperCase() + platform.slice(1),
            url: null,
            enabled: false,
            sort_order: index,
          }
        );
      }),
    [socialLinks]
  );
  const [links, setLinks] = useState(initialLinks);
  const [socialReason, setSocialReason] = useState('');
  const [socialSaveModalOpen, setSocialSaveModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('user');
  const [inviteReason, setInviteReason] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null
  );
  const [busy, setBusy] = useState(false);
  const [accountActionModal, setAccountActionModal] = useState<{
    account: AdminAccount;
    reason: string;
  } | null>(null);

  // Filters for Accounts table
  const {
    getFilter: getAccountFilter,
    setFilter: setAccountFilter,
    clearFilters: clearAccountFilters,
    isExpanded: showAccountFilters,
    toggleExpanded: toggleAccountFilters,
    activeFilterCount: activeAccountFilterCount,
    hasActiveFilters: hasActiveAccountFilters,
  } = useQueryFilters({
    resourceKey: 'accounts',
    filterKeys: ['q', 'role', 'status'],
    defaultValues: { role: 'all', status: 'all' },
    pageKey: DASHBOARD_QUERY_KEYS.pages.accounts,
    removeKeys: ['q', 'role', 'status'],
  });
  const accountSearchInput = useQueryFilterInput({
    resourceKey: 'accounts',
    pageKey: DASHBOARD_QUERY_KEYS.pages.accounts,
    removeKeys: ['q', 'role', 'status'],
  });

  const accountRoleFilter = getAccountFilter('role', 'all');
  const accountStatusFilter = getAccountFilter('status', 'all');
  const accountSearchQuery = accountSearchInput.value;

  const accountsQuery = usePaginatedQuery<AdminAccount>({
    path: `/admin/accounts?${new URLSearchParams({
      ...(accountRoleFilter !== 'all' ? { role: accountRoleFilter } : {}),
      ...(accountStatusFilter !== 'all' ? { status: accountStatusFilter } : {}),
      ...(accountSearchQuery ? { q: accountSearchQuery } : {}),
    }).toString()}`,
    pageKey: DASHBOARD_QUERY_KEYS.pages.accounts,
    pageSize: 6,
  });
  const pageAccounts = accountsQuery.items;
  const accountPagination = accountsQuery.pagination;
  const totalAccounts = accountPagination.totalItems;

  // Filters for Audit Events table
  const {
    getFilter: getAuditFilter,
    setFilter: setAuditFilter,
    clearFilters: clearAuditFilters,
    isExpanded: showAuditFilters,
    toggleExpanded: toggleAuditFilters,
    activeFilterCount: activeAuditFilterCount,
    hasActiveFilters: hasActiveAuditFilters,
  } = useQueryFilters({
    resourceKey: 'audit',
    filterKeys: ['q', 'action'],
    defaultValues: { action: 'all' },
    pageKey: DASHBOARD_QUERY_KEYS.pages.audit,
    removeKeys: ['q', 'action'],
  });
  const auditSearchInput = useQueryFilterInput({
    resourceKey: 'audit',
    pageKey: DASHBOARD_QUERY_KEYS.pages.audit,
    removeKeys: ['q', 'action'],
  });

  const auditActionFilter = getAuditFilter('action', 'all');
  const auditSearchQuery = auditSearchInput.value;

  const availableAuditActions = useMemo(() => {
    const actionSet = new Set<string>();
    auditEvents.forEach((ev) => {
      if (ev.action) actionSet.add(ev.action);
    });
    return Array.from(actionSet).sort();
  }, [auditEvents]);

  const auditQuery = usePaginatedQuery<AdminAuditEvent>({
    path: `/admin/audit-events?${new URLSearchParams({
      ...(auditActionFilter !== 'all' ? { action: auditActionFilter } : {}),
      ...(auditSearchQuery ? { q: auditSearchQuery } : {}),
    }).toString()}`,
    pageKey: DASHBOARD_QUERY_KEYS.pages.audit,
    pageSize: 10,
  });
  const pageAuditEvents = auditQuery.items;
  const auditPagination = auditQuery.pagination;
  const totalAuditEvents = auditPagination.totalItems;

  const localizeRole = (accountRole: string) =>
    tDynamic(dynamicLabelKey('role', accountRole), {
      value: dynamicLabelFallback(accountRole),
    });

  const isLinkModified = (index: number) => {
    const curr = links[index];
    const init = initialLinks[index];
    if (!curr || !init) return false;
    return curr.url !== init.url || curr.enabled !== init.enabled;
  };

  const modifiedLinks = links.filter((_, index) => isLinkModified(index));
  const hasChanges = modifiedLinks.length > 0;

  const confirmAccountAction = async () => {
    if (!accountActionModal || !accountActionModal.reason.trim()) return;
    const { account, reason } = accountActionModal;
    setBusy(true);
    try {
      await updateAccount(account.id, !account.disabled_at, reason.trim());
      toastSuccess(
        account.disabled_at ? t('accountEnabled') : t('accountDisabled')
      );
      setAccountActionModal(null);
    } catch (error) {
      toastError(error, t('operatorActionError'));
    } finally {
      setBusy(false);
    }
  };

  const saveLinks = async (event: FormEvent) => {
    event.preventDefault();
    if (!socialReason.trim()) return;
    setBusy(true);
    try {
      await replaceSocialLinks(links, socialReason.trim());
      setSocialReason('');
      setSocialSaveModalOpen(false);
      toastSuccess(t('socialSaved'));
    } catch (error) {
      toastError(error, t('socialSaveError'));
    } finally {
      setBusy(false);
    }
  };

  const provisionAccount = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await createAccount(
        email,
        phone,
        displayName,
        role,
        inviteReason
      );
      setTemporaryPassword(result.temporary_password);
      setEmail('');
      setPhone('');
      setDisplayName('');
      setInviteReason('');
      toastSuccess(t('accountCreated'));
    } catch (error) {
      toastError(error, t('operatorActionError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Social Media Links Section */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-navy text-base font-bold">
              {t('socialTitle')}
            </h3>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {t('socialDescription')}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {hasChanges ? (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/40 bg-amber/15 px-3 py-1 text-xs font-bold text-amber-900">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {t('socialUnsavedChanges', { count: modifiedLinks.length })}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLinks(initialLinks)}
                  disabled={busy}
                  className="rounded-xl text-xs font-bold"
                >
                  <RotateCcw className="size-3.5" />
                  {t('socialReset')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setSocialSaveModalOpen(true)}
                  disabled={busy}
                  className="rounded-xl text-xs font-bold shadow-soft"
                >
                  <Save className="size-3.5" />
                  {t('saveSocial')}
                </Button>
              </>
            ) : (
              <span className="text-muted-foreground inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-xs font-semibold">
                <CheckCircle2
                  className="size-3.5 text-sage"
                  aria-hidden="true"
                />
                {t('socialAllSaved')}
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((link, index) => {
            const isModified = isLinkModified(index);
            return (
              <Card
                key={link.platform}
                className={cn(
                  'bg-card flex flex-col justify-between gap-3.5 rounded-2xl border p-4 shadow-2xs transition-all duration-200',
                  isModified
                    ? 'border-amber/50 ring-2 ring-amber/20'
                    : 'border-border/80 hover:border-navy/25'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex size-9 items-center justify-center rounded-xl border shadow-xs ${platformBadgeStyle}`}
                    >
                      <SocialIcon platform={link.platform} className="size-4" />
                    </span>
                    <h4 className="text-navy text-sm font-bold flex items-center gap-1.5">
                      {link.label}
                      {isModified ? (
                        <span className="bg-amber/20 text-amber-900 text-[0.625rem] font-bold px-1.5 py-0.5 rounded-md">
                          {t('socialChangedBadge')}
                        </span>
                      ) : null}
                    </h4>
                  </div>
                  <label className="border-border bg-muted/40 hover:bg-muted/70 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-1.5 transition-colors">
                    <input
                      type="checkbox"
                      className="border-border text-navy focus-visible:ring-navy/30 size-3.5 rounded"
                      checked={link.enabled}
                      disabled={!link.url}
                      onChange={(event) =>
                        setLinks((items) =>
                          items.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, enabled: event.target.checked }
                              : item
                          )
                        )
                      }
                    />
                    <span className="text-navy text-[0.75rem] font-bold">
                      {t('visible')}
                    </span>
                  </label>
                </div>

                <div>
                  <input
                    type="url"
                    className={cn(
                      'border-input bg-background focus-visible:border-navy/40 focus-visible:ring-navy/20 min-h-9 w-full rounded-xl border px-3 text-xs transition-[border-color,box-shadow] duration-200 outline-none focus-visible:ring-2',
                      isModified && 'border-amber/40 bg-amber/[0.02]'
                    )}
                    placeholder={`https://${
                      link.platform === 'x'
                        ? 'x.com'
                        : link.platform === 'tiktok'
                          ? 'tiktok.com/@...'
                          : link.platform + '.com'
                    }/...`}
                    value={link.url ?? ''}
                    onChange={(event) =>
                      setLinks((items) =>
                        items.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, url: event.target.value || null }
                            : item
                        )
                      )
                    }
                  />
                </div>
              </Card>
            );
          })}
        </div>

        {hasChanges ? (
          <div className="border-amber/35 bg-gradient-to-r from-amber/[0.08] via-card to-card flex flex-col gap-3 rounded-2xl border p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber/20 text-amber-900 ring-1 ring-amber/30">
                <AlertTriangle className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-navy text-sm font-bold">
                  {t('socialUnsavedChanges', { count: modifiedLinks.length })}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t('socialUnsavedBody')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLinks(initialLinks)}
                disabled={busy}
                className="rounded-xl text-xs font-bold"
              >
                <RotateCcw className="size-3.5" />
                {t('socialReset')}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setSocialSaveModalOpen(true)}
                disabled={busy}
                className="rounded-xl text-xs font-bold shadow-soft"
              >
                <Save className="size-3.5" />
                {t('saveSocial')}
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      {/* Account Provisioning & Accounts Table Section */}
      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <form
          onSubmit={(event) => void provisionAccount(event)}
          className="border-border bg-card shadow-soft space-y-4 rounded-2xl border p-5 sm:p-6"
        >
          <div className="flex items-center gap-3">
            <span className="bg-navy flex size-10 items-center justify-center rounded-xl text-white shadow-sm">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h3 className="text-navy text-base font-bold">
                {t('createAccountTitle')}
              </h3>
              <p className="text-muted-foreground text-xs leading-5">
                {t('createAccountDescription')}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <AdminFormField label={t('fieldEmail')} required>
              <input
                className={adminFieldClassName}
                type="email"
                placeholder="email@domain.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </AdminFormField>

            <AdminFormField label={t('fieldPhone')} required>
              <input
                className={adminFieldClassName}
                type="tel"
                placeholder="+6281234567890"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
              />
            </AdminFormField>

            <AdminFormField label={t('fieldDisplayName')} required>
              <input
                className={adminFieldClassName}
                placeholder={t('fieldDisplayName')}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                required
              />
            </AdminFormField>

            <AdminFormField label={t('operatorRole')} required>
              <select
                className={adminFieldClassName}
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="user">{t('roleUserOption')}</option>
                <option value="partner">{t('rolePartnerOption')}</option>
                <option value="admin">{t('roleAdminOption')}</option>
              </select>
            </AdminFormField>

            <AdminFormField label={t('changeReason')} required>
              <input
                className={adminFieldClassName}
                placeholder={t('createAccountReasonPlaceholder')}
                value={inviteReason}
                onChange={(event) => setInviteReason(event.target.value)}
                required
              />
            </AdminFormField>
          </div>

          <Button type="submit" disabled={busy} className="w-full sm:w-auto">
            <UserPlus className="size-4" />
            {t('createAccountSubmit')}
          </Button>

          {temporaryPassword ? (
            <div
              className="border-amber/40 bg-amber/15 text-navy rounded-xl border p-4 text-sm"
              role="status"
            >
              <p className="font-bold">{t('temporaryPasswordTitle')}</p>
              <code className="border-amber/30 bg-card mt-2 block rounded-lg border p-2.5 font-mono text-xs break-all select-all">
                {temporaryPassword}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setTemporaryPassword(null)}
              >
                {t('temporaryPasswordSaved')}
              </Button>
            </div>
          ) : null}
        </form>

        {/* Accounts List Table */}
        <div className="border-border bg-card shadow-soft overflow-hidden rounded-2xl border">
          <div className="border-border border-b p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-navy text-base font-bold">
                  {t('accountsTitle')}
                </h3>
                <span className="text-[0.6875rem] font-bold text-navy/90 bg-azure/60 px-2.5 py-0.5 rounded-full border border-navy/15 shadow-2xs">
                  {totalAccounts} akun
                </span>
              </div>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {t('accountsDescription')}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <FilterToggleButton
                isExpanded={showAccountFilters}
                onToggle={toggleAccountFilters}
                hasActiveFilters={hasActiveAccountFilters}
                activeCount={activeAccountFilterCount}
                label={t('filterToggle') || 'Filter'}
              />
            </div>
          </div>

          {/* Expandable Filter Panel */}
          {showAccountFilters ? (
            <div className="border-border/60 bg-muted/20 border-b px-4 py-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex flex-wrap items-center gap-2.5">
                <FilterSearchInput
                  value={accountSearchQuery}
                  onChangeValue={(val) => {
                    accountSearchInput.onChange(val);
                  }}
                  placeholder="Cari nama, email, telepon..."
                  className="w-full sm:w-60"
                />

                <FilterSelect
                  value={accountRoleFilter}
                  onChange={(e) => {
                    setAccountFilter('role', e.target.value);
                  }}
                  ariaLabel={t('filterRole')}
                >
                  <option value="all">{t('filterAllRoles')}</option>
                  <option value="admin">{localizeRole('admin')}</option>
                  <option value="partner">{localizeRole('partner')}</option>
                  <option value="user">{localizeRole('user')}</option>
                </FilterSelect>

                <FilterSelect
                  value={accountStatusFilter}
                  onChange={(e) => {
                    setAccountFilter('status', e.target.value);
                  }}
                  ariaLabel={t('filterAccountStatus')}
                >
                  <option value="all">{t('filterAllAccountStatuses')}</option>
                  <option value="active">{t('statusActive')}</option>
                  <option value="disabled">{t('disabled')}</option>
                </FilterSelect>
              </div>

              {hasActiveAccountFilters ? (
                <FilterResetButton
                  onClick={() => {
                    clearAccountFilters(['role', 'status']);
                    accountSearchInput.reset();
                  }}
                  label={t('clearFilters') || 'Reset'}
                />
              ) : null}
            </div>
          ) : null}

          <Table className="[&_td]:px-4 [&_td]:py-3 sm:[&_td]:px-5 [&_th]:h-11 [&_th]:px-4 sm:[&_th]:px-5">
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-xs font-bold">
                  {t('operator')}
                </TableHead>
                <TableHead className="text-xs font-bold">
                  {t('operatorRole')}
                </TableHead>
                <TableHead className="text-xs font-bold">
                  {t('thStatus')}
                </TableHead>
                <TableHead className="text-right text-xs font-bold">
                  {t('actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <AdminEmptyTable
                  colSpan={4}
                  icon={Users}
                  text={t('noOperators')}
                  description={t('noOperatorsDescription')}
                />
              ) : pageAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 py-4">
                      <p className="text-navy text-sm font-semibold">
                        {t('noFilteredAccounts')}
                      </p>
                      <FilterResetButton
                        onClick={() => {
                          clearAccountFilters(['role', 'status']);
                          accountSearchInput.reset();
                        }}
                        label={t('clearFilters') || 'Reset Filter'}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pageAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <p className="text-navy text-sm font-semibold">
                        {account.display_name}
                      </p>
                      <p className="text-muted-foreground font-mono text-xs">
                        {account.email}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[0.7rem] font-bold tracking-wider uppercase ${getRoleBadgeStyle(
                          account.role
                        )}`}
                      >
                        {localizeRole(account.role)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={account.disabled_at ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        {account.disabled_at
                          ? t('disabled')
                          : t('statusActive')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={account.disabled_at ? 'primary' : 'outline'}
                        disabled={account.id === currentUserId}
                        onClick={() => {
                          setAccountActionModal({
                            account,
                            reason: '',
                          });
                        }}
                      >
                        {account.disabled_at ? t('enable') : t('disable')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {totalAccounts > 0 ? (
            <div className="border-border/80 bg-muted/15 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 border-t px-4 py-2.5 sm:px-5">
              <span className="text-muted-foreground text-xs font-semibold whitespace-nowrap self-start sm:self-center">
                {tPagination('showingRange', {
                  start: accountPagination.startIndex,
                  end: accountPagination.endIndex,
                  total: totalAccounts,
                })}
              </span>
              <Pagination
                currentPage={accountPagination.page}
                totalPages={accountPagination.totalPages}
                onPageChange={accountPagination.setPage}
                variant="flat"
                size="sm"
              />
            </div>
          ) : null}
        </div>
      </section>

      {/* Operational Audit Log Section */}
      <section className="border-border bg-card shadow-soft overflow-hidden rounded-2xl border">
        <div className="border-border border-b p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-navy text-base font-bold">{t('auditTitle')}</h3>
              <span className="text-[0.6875rem] font-bold text-navy/90 bg-azure/60 px-2.5 py-0.5 rounded-full border border-navy/15 shadow-2xs">
                {totalAuditEvents} catatan
              </span>
            </div>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {t('auditDescription')}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <FilterToggleButton
              isExpanded={showAuditFilters}
              onToggle={toggleAuditFilters}
              hasActiveFilters={hasActiveAuditFilters}
              activeCount={activeAuditFilterCount}
              label={t('filterToggle') || 'Filter'}
            />
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {showAuditFilters ? (
          <div className="border-border/60 bg-muted/20 border-b px-4 py-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex flex-wrap items-center gap-2.5">
              <FilterSearchInput
                value={auditSearchQuery}
                onChangeValue={(val) => {
                  auditSearchInput.onChange(val);
                }}
                placeholder="Cari aktor, aksi, target, alasan..."
                className="w-full sm:w-64"
              />

              {availableAuditActions.length > 0 ? (
                <FilterSelect
                  value={auditActionFilter}
                  onChange={(e) => {
                    setAuditFilter('action', e.target.value);
                  }}
                  ariaLabel={t('filterAuditAction')}
                >
                  <option value="all">{t('filterAllAuditActions')}</option>
                  {availableAuditActions.map((action) => (
                    <option key={action} value={action}>
                      {localizeAuditAction(t, action)}
                    </option>
                  ))}
                </FilterSelect>
              ) : null}
            </div>

            {hasActiveAuditFilters ? (
              <FilterResetButton
                onClick={() => {
                  clearAuditFilters(['action']);
                  auditSearchInput.reset();
                }}
                label={t('clearFilters') || 'Reset'}
              />
            ) : null}
          </div>
        ) : null}

        <Table className="[&_td]:px-4 [&_td]:py-3.5 sm:[&_td]:px-5 [&_th]:h-11 [&_th]:px-4 sm:[&_th]:px-5">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="text-xs font-bold">
                {t('auditTime')}
              </TableHead>
              <TableHead className="text-xs font-bold">
                {t('operator')}
              </TableHead>
              <TableHead className="text-xs font-bold">
                {t('auditAction')}
              </TableHead>
              <TableHead className="text-xs font-bold">
                {t('auditTarget')}
              </TableHead>
              <TableHead className="text-xs font-bold">
                {t('changeReason')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditEvents.length === 0 ? (
              <AdminEmptyTable
                colSpan={5}
                icon={ScrollText}
                text={t('noAudit')}
                description={t('noAuditDescription')}
              />
            ) : pageAuditEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 py-4">
                    <p className="text-navy text-sm font-semibold">
                      {t('noFilteredAudit')}
                    </p>
                    <FilterResetButton
                      onClick={() => {
                        clearAuditFilters(['action']);
                        auditSearchInput.reset();
                      }}
                      label={t('clearFilters') || 'Reset Filter'}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pageAuditEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="text-muted-foreground font-mono text-xs whitespace-nowrap">
                    {new Date(event.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <p className="text-navy text-sm font-semibold">
                      {event.actor}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="border-border/70 bg-muted/40 text-navy inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold">
                      {localizeAuditAction(t, event.action)}
                    </span>
                  </TableCell>
                  <TableCell className="text-foreground text-xs font-medium">
                    <AuditTargetCell
                      t={t}
                      targetType={event.target_type}
                      target={event.target}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {event.reason || '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {totalAuditEvents > 0 ? (
          <div className="border-border/80 bg-muted/15 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 border-t px-4 py-2.5 sm:px-5">
            <span className="text-muted-foreground text-xs font-semibold whitespace-nowrap self-start sm:self-center">
              {tPagination('showingRange', {
                start: auditPagination.startIndex,
                end: auditPagination.endIndex,
                total: totalAuditEvents,
              })}
            </span>
            <Pagination
              currentPage={auditPagination.page}
              totalPages={auditPagination.totalPages}
              onPageChange={auditPagination.setPage}
              variant="flat"
              size="sm"
            />
          </div>
        ) : null}
      </section>

      {/* Account Action Confirmation Modal */}
      <Dialog
        open={Boolean(accountActionModal)}
        onOpenChange={(open) => {
          if (!open) setAccountActionModal(null);
        }}
      >
        <DialogContent className="border-border/80 gap-5 rounded-2xl p-6 shadow-2xl sm:max-w-md">
          {accountActionModal ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void confirmAccountAction();
              }}
              className="space-y-5"
            >
              <DialogHeader className="pr-6">
                <div className="flex items-start gap-3.5">
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-2xl shadow-xs ${
                      accountActionModal.account.disabled_at
                        ? 'border-success/40 bg-success/15 text-sage-dark border'
                        : 'border-destructive/40 bg-destructive/10 text-destructive border'
                    }`}
                  >
                    {accountActionModal.account.disabled_at ? (
                      <UserCheck className="size-5" />
                    ) : (
                      <UserX className="size-5" />
                    )}
                  </span>
                  <div className="space-y-1 pt-0.5">
                    <DialogTitle className="text-navy text-base leading-none font-bold">
                      {accountActionModal.account.disabled_at
                        ? t('enableAccountTitle')
                        : t('disableAccountTitle')}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
                      {accountActionModal.account.disabled_at
                        ? t('enableAccountBody')
                        : t('disableAccountBody')}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="border-border/80 bg-muted/30 space-y-2 rounded-2xl border p-4 shadow-xs">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-navy truncate text-sm font-bold">
                    {accountActionModal.account.display_name}
                  </p>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-lg border px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase ${getRoleBadgeStyle(
                      accountActionModal.account.role
                    )}`}
                  >
                    {localizeRole(accountActionModal.account.role)}
                  </span>
                </div>
                <p className="text-muted-foreground truncate font-mono text-xs">
                  {accountActionModal.account.email}
                </p>
              </div>

              <AdminFormField
                label={t('accountReasonLabel')}
                required
                className="space-y-2"
              >
                <input
                  className={`${adminFieldClassName} h-10`}
                  placeholder={t('accountReasonPlaceholder')}
                  value={accountActionModal.reason}
                  onChange={(e) =>
                    setAccountActionModal((prev) =>
                      prev ? { ...prev, reason: e.target.value } : null
                    )
                  }
                  required
                  autoFocus
                />
              </AdminFormField>

              <DialogFooter className="border-border/80 bg-muted/40 -mx-6 mt-6 -mb-6 flex flex-row items-center justify-end gap-3 rounded-b-2xl border-t px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAccountActionModal(null)}
                  disabled={busy}
                  className="rounded-xl px-5"
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  variant={
                    accountActionModal.account.disabled_at
                      ? 'primary'
                      : 'destructive'
                  }
                  disabled={busy || !accountActionModal.reason.trim()}
                  className="rounded-xl px-5 font-bold"
                >
                  {accountActionModal.account.disabled_at
                    ? t('enableAccount')
                    : t('disableAccount')}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Social Media Save Confirmation Modal */}
      <Dialog
        open={socialSaveModalOpen}
        onOpenChange={(open) => {
          if (!busy) setSocialSaveModalOpen(open);
        }}
      >
        <DialogContent className="border-border/80 gap-5 rounded-2xl p-6 shadow-2xl sm:max-w-md">
          <DialogHeader className="pr-6">
            <div className="flex items-start gap-3.5">
              <span className="border-border/80 bg-azure/80 text-navy flex size-11 shrink-0 items-center justify-center rounded-2xl border shadow-xs">
                <Share2 className="size-5" aria-hidden="true" />
              </span>
              <div className="space-y-1 pt-0.5">
                <DialogTitle className="text-navy text-base leading-none font-bold">
                  {t('socialModalTitle')}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
                  {t('socialModalDescription')}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={(e) => void saveLinks(e)} className="space-y-4">
            <div className="rounded-xl border border-border/80 bg-muted/30 p-3 space-y-2">
              <p className="text-navy text-xs font-bold">
                {t('socialSummaryTitle', { count: modifiedLinks.length })}
              </p>
              <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {modifiedLinks.map((link) => (
                  <li
                    key={link.platform}
                    className="flex items-center justify-between text-xs gap-2"
                  >
                    <span className="font-semibold text-navy flex items-center gap-1.5">
                      <SocialIcon
                        platform={link.platform}
                        className="size-3.5"
                      />
                      {link.label}
                    </span>
                    <span className="text-muted-foreground truncate max-w-[200px] text-[0.6875rem]">
                      {link.enabled ? `✓ ${t('socialVisibleYes')}` : t('socialHidden')} •{' '}
                      {link.url || t('socialEmpty')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <AdminFormField
              label={t('changeReason')}
              help={t('socialReasonHelp')}
              required
            >
              <input
                className={adminFieldClassName}
                placeholder={t('socialModalPlaceholder')}
                value={socialReason}
                onChange={(event) => setSocialReason(event.target.value)}
                required
                autoFocus
              />
            </AdminFormField>

            <DialogFooter className="border-border/80 bg-muted/40 -mx-6 mt-6 -mb-6 flex flex-row items-center justify-end gap-3 rounded-b-2xl border-t px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSocialSaveModalOpen(false)}
                disabled={busy}
                className="rounded-xl px-4 text-xs font-bold"
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={busy || !socialReason.trim()}
                className="rounded-xl px-5 text-xs font-bold"
              >
                {busy ? t('saving') : t('socialConfirmSave')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
