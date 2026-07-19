'use client';

import { type FormEvent, useMemo, useState } from 'react';
import { Save, ShieldCheck, UserCheck, UserPlus, UserX } from 'lucide-react';
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
import { toastError, toastSuccess } from '@/lib/feedback';
import {
  AdminEmptyTable,
  AdminFormField,
  adminFieldClassName,
} from './admin-shared';

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
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.086 0C5.412 0 0 5.412 0 12.086s5.412 12.086 12.086 12.086c3.486 0 6.643-1.479 8.871-3.836l-2.086-2.086c-1.743 1.843-4.2 3.008-6.785 3.008-5.068 0-9.172-4.104-9.172-9.172s4.104-9.172 9.172-9.172c4.786 0 8.7 3.654 9.122 8.358h-2.914c-.407-3.111-3.064-5.444-6.208-5.444-3.458 0-6.258 2.8-6.258 6.258s2.8 6.258 6.258 6.258c1.625 0 3.107-.621 4.225-1.637l2.086 2.086c-1.682 1.528-3.907 2.465-6.311 2.465-5.068 0-9.172-4.104-9.172-9.172" />
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

function getPlatformBadgeStyle(platform: string) {
  switch (platform) {
    case 'instagram':
      return 'bg-pink-50 text-pink-600 border-pink-200/60 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-800/40';
    case 'tiktok':
      return 'bg-slate-900 text-cyan-400 border-slate-700 dark:bg-slate-950 dark:text-cyan-300';
    case 'youtube':
      return 'bg-red-50 text-red-600 border-red-200/60 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40';
    case 'facebook':
      return 'bg-blue-50 text-blue-600 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40';
    case 'linkedin':
      return 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/40';
    case 'x':
      return 'bg-slate-900 text-white border-slate-700 dark:bg-slate-950';
    case 'threads':
      return 'bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700';
    case 'github':
      return 'bg-slate-800 text-white border-slate-700 dark:bg-slate-900';
    default:
      return 'bg-muted text-foreground border-border';
  }
}

function getRoleBadgeStyle(role: string) {
  const r = role.toLowerCase();
  if (r === 'admin' || r === 'platform_admin') {
    return 'bg-purple-50 text-purple-700 border-purple-200/70 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40';
  }
  if (r === 'partner') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40';
  }
  if (r === 'user') {
    return 'bg-sky-50 text-sky-700 border-sky-200/70 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/40';
  }
  return 'bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40';
}

function formatAuditAction(action: string) {
  if (!action) return '—';
  const normalized = action.replace(/_/g, ' ').trim();
  return normalized
    .split(' ')
    .map((word, index) =>
      index === 0
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word.toLowerCase()
    )
    .join(' ');
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
  const [email, setEmail] = useState('');
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

  const confirmAccountAction = async () => {
    if (!accountActionModal || !accountActionModal.reason.trim()) return;
    const { account, reason } = accountActionModal;
    setBusy(true);
    try {
      await updateAccount(account.id, !account.disabled_at, reason.trim());
      toastSuccess(
        account.disabled_at
          ? 'Akun berhasil diaktifkan kembali.'
          : 'Akun berhasil dinonaktifkan.'
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
    setBusy(true);
    try {
      await replaceSocialLinks(links, socialReason);
      setSocialReason('');
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
        displayName,
        role,
        inviteReason
      );
      setTemporaryPassword(result.temporary_password);
      setEmail('');
      setDisplayName('');
      setInviteReason('');
      toastSuccess(
        'Akun berhasil dibuat. Salin kata sandi sementara sekarang.'
      );
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
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-navy text-base font-bold">
              Kanal Media Sosial Publik
            </h3>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Atur tautan dan visibilitas akun media sosial resmi Gamblock-AI
              pada situs publik.
            </p>
          </div>
        </div>

        <form onSubmit={(event) => void saveLinks(event)} className="space-y-4">
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {links.map((link, index) => (
              <Card
                key={link.platform}
                className="border-border/80 bg-card hover:border-navy/25 flex flex-col justify-between gap-3.5 rounded-2xl border p-4 shadow-sm transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex size-9 items-center justify-center rounded-xl border shadow-xs ${getPlatformBadgeStyle(
                        link.platform
                      )}`}
                    >
                      <SocialIcon platform={link.platform} className="size-4" />
                    </span>
                    <h4 className="text-navy text-sm font-bold">
                      {link.label}
                    </h4>
                  </div>
                  <label className="border-border bg-muted/40 hover:bg-muted/70 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-1.5 transition-colors">
                    <input
                      type="checkbox"
                      className="border-border text-navy focus:ring-navy/30 size-3.5 rounded"
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
                    className="border-input bg-background focus:border-navy/40 focus:ring-navy/20 min-h-9 w-full rounded-xl border px-3 text-xs transition-[border-color,box-shadow] duration-200 outline-none focus:ring-2"
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
            ))}
          </div>

          <div className="border-navy/15 bg-azure/35 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-end sm:p-5">
            <AdminFormField label={t('changeReason')} className="flex-1">
              <input
                className={adminFieldClassName}
                placeholder="Contoh: Pembaruan tautan akun media sosial resmi kampanye"
                value={socialReason}
                onChange={(event) => setSocialReason(event.target.value)}
                required
              />
            </AdminFormField>
            <Button type="submit" disabled={busy} className="sm:shrink-0">
              <Save className="size-4" /> {t('saveSocial')}
            </Button>
          </div>
        </form>
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
              <h3 className="text-navy text-base font-bold">Buat Akun baru</h3>
              <p className="text-muted-foreground text-xs leading-5">
                Buat akun user, partner, atau admin dengan kata sandi sementara
                sekali pakai.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <AdminFormField label="Email">
              <input
                className={adminFieldClassName}
                type="email"
                placeholder="email@domain.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </AdminFormField>

            <AdminFormField label="Nama tampilan">
              <input
                className={adminFieldClassName}
                placeholder="Nama lengkap atau panggilan"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                required
              />
            </AdminFormField>

            <AdminFormField label={t('operatorRole')}>
              <select
                className={adminFieldClassName}
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="user">User (mahasiswa)</option>
                <option value="partner">Partner</option>
                <option value="admin">Admin</option>
              </select>
            </AdminFormField>

            <AdminFormField label={t('changeReason')}>
              <input
                className={adminFieldClassName}
                placeholder="Contoh: Pembuatan akun operator pendampingan resmi"
                value={inviteReason}
                onChange={(event) => setInviteReason(event.target.value)}
                required
              />
            </AdminFormField>
          </div>

          <Button type="submit" disabled={busy} className="w-full sm:w-auto">
            <UserPlus className="size-4" />
            Buat akun
          </Button>

          {temporaryPassword ? (
            <div
              className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200"
              role="status"
            >
              <p className="font-bold">
                Kata sandi sementara — hanya ditampilkan sekali
              </p>
              <code className="mt-2 block rounded-lg border border-amber-200 bg-white p-2.5 font-mono text-xs break-all select-all dark:border-amber-800 dark:bg-slate-900">
                {temporaryPassword}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setTemporaryPassword(null)}
              >
                Saya sudah menyimpannya
              </Button>
            </div>
          ) : null}
        </form>

        {/* Accounts List Table */}
        <div className="border-border bg-card shadow-soft overflow-hidden rounded-2xl border">
          <div className="border-border border-b p-4 sm:p-5">
            <h3 className="text-navy text-base font-bold">
              Daftar Akun Terdaftar
            </h3>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Pengelolaan status dan hak akses akun user, partner, dan admin.
            </p>
          </div>
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
                <AdminEmptyTable colSpan={4} text={t('noOperators')} />
              ) : (
                accounts.map((account) => (
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
                        {account.role}
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
        </div>
      </section>

      {/* Operational Audit Log Section */}
      <section className="border-border bg-card shadow-soft overflow-hidden rounded-2xl border">
        <div className="border-border border-b p-4 sm:p-5">
          <h3 className="text-navy text-base font-bold">{t('auditTitle')}</h3>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Catatan jejak aktivitas dan perubahan sensitif operasional sistem.
          </p>
        </div>
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
              <AdminEmptyTable colSpan={5} text={t('noAudit')} />
            ) : (
              auditEvents.map((event) => (
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
                      {formatAuditAction(event.action)}
                    </span>
                  </TableCell>
                  <TableCell className="text-foreground text-xs font-medium">
                    {event.target_type}: {event.target}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {event.reason || '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
                        ? 'border border-emerald-200/80 bg-emerald-50 text-emerald-600 dark:border-emerald-800/40 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'border border-red-200/80 bg-red-50 text-red-600 dark:border-red-800/40 dark:bg-red-950/60 dark:text-red-300'
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
                        ? 'Aktifkan Kembali Akun'
                        : 'Nonaktifkan Akun'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
                      {accountActionModal.account.disabled_at
                        ? 'Akun ini akan dipulihkan sehingga pengguna dapat kembali mengakses dashboard.'
                        : 'Akun ini akan dinonaktifkan sementara dan tidak dapat masuk ke sistem.'}
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
                    {accountActionModal.account.role}
                  </span>
                </div>
                <p className="text-muted-foreground truncate font-mono text-xs">
                  {accountActionModal.account.email}
                </p>
              </div>

              <AdminFormField
                label="Alasan perubahan (wajib untuk audit log)"
                className="space-y-2"
              >
                <input
                  className={`${adminFieldClassName} h-10`}
                  placeholder="Contoh: Pemeliharaan rutin / Permintaan pemilik akun"
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
                  Batal
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
                    ? 'Aktifkan Akun'
                    : 'Nonaktifkan Akun'}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
