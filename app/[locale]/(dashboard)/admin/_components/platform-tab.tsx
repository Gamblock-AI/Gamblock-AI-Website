'use client';

import { type FormEvent, useMemo, useState } from 'react';
import { Save, Send, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  AdminOperatorAccount,
  AdminOperatorInvitation,
  AdminSiteSocialLink,
} from '@/hooks/use-admin-operations';
import { toastError, toastSuccess } from '@/lib/feedback';
import {
  AdminEmptyTable,
  AdminFormField,
  AdminSectionHeader,
  AdminTableShell,
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

interface PlatformTabProps {
  socialLinks: AdminSiteSocialLink[];
  accounts: AdminOperatorAccount[];
  invitations: AdminOperatorInvitation[];
  auditEvents: AdminAuditEvent[];
  replaceSocialLinks: (
    items: AdminSiteSocialLink[],
    reason: string
  ) => Promise<unknown>;
  inviteOperator: (
    email: string,
    role: string,
    reason: string
  ) => Promise<unknown>;
  revokeInvitation: (id: string, reason: string) => Promise<unknown>;
  updateOperator: (
    id: string,
    role: string,
    disabled: boolean,
    reason: string
  ) => Promise<unknown>;
}

export function PlatformTab({
  socialLinks,
  accounts,
  invitations,
  auditEvents,
  replaceSocialLinks,
  inviteOperator,
  revokeInvitation,
  updateOperator,
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
  const [role, setRole] = useState('support_operator');
  const [inviteReason, setInviteReason] = useState('');
  const [busy, setBusy] = useState(false);

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

  const sendInvite = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await inviteOperator(email, role, inviteReason);
      setEmail('');
      setInviteReason('');
      toastSuccess(t('operatorInvited'));
    } catch (error) {
      toastError(error, t('operatorActionError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title={t('platformTitle')}
        description={t('platformDescription')}
      />

      <form onSubmit={(event) => void saveLinks(event)} className="space-y-3">
        <div className="grid gap-3 lg:grid-cols-2">
          {links.map((link, index) => (
            <Card
              key={link.platform}
              className="grid gap-3 p-4 sm:grid-cols-[8rem_1fr_auto] sm:items-end"
            >
              <AdminFormField label={t('socialPlatform')}>
                <input
                  className={adminFieldClassName}
                  value={link.label}
                  onChange={(event) =>
                    setLinks((items) =>
                      items.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, label: event.target.value }
                          : item
                      )
                    )
                  }
                  required
                />
              </AdminFormField>
              <AdminFormField label={t('socialUrl')}>
                <input
                  className={adminFieldClassName}
                  type="url"
                  placeholder={`https://${link.platform}.com/...`}
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
              </AdminFormField>
              <label className="text-navy flex min-h-11 items-center gap-2 text-xs font-bold">
                <input
                  type="checkbox"
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
                {t('visible')}
              </label>
            </Card>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <AdminFormField label={t('changeReason')} className="flex-1">
            <input
              className={adminFieldClassName}
              value={socialReason}
              onChange={(event) => setSocialReason(event.target.value)}
              required
            />
          </AdminFormField>
          <Button type="submit" disabled={busy}>
            <Save className="size-4" /> {t('saveSocial')}
          </Button>
        </div>
      </form>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <form
          onSubmit={(event) => void sendInvite(event)}
          className="border-border bg-card space-y-4 rounded-2xl border p-5"
        >
          <div className="flex items-center gap-3">
            <span className="bg-navy flex size-9 items-center justify-center rounded-xl text-white">
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <h3 className="text-navy font-bold">{t('inviteOperator')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('inviteOperatorHelp')}
              </p>
            </div>
          </div>
          <AdminFormField label="Email">
            <input
              className={adminFieldClassName}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </AdminFormField>
          <AdminFormField label={t('operatorRole')}>
            <select
              className={adminFieldClassName}
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="support_operator">Support operator</option>
              <option value="content_admin">Content admin</option>
              <option value="model_release_operator">Release operator</option>
            </select>
          </AdminFormField>
          <AdminFormField label={t('changeReason')}>
            <input
              className={adminFieldClassName}
              value={inviteReason}
              onChange={(event) => setInviteReason(event.target.value)}
              required
            />
          </AdminFormField>
          <Button type="submit" disabled={busy}>
            <Send className="size-4" />
            {t('sendInvitation')}
          </Button>
        </form>

        <AdminTableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('operator')}</TableHead>
                <TableHead>{t('operatorRole')}</TableHead>
                <TableHead>{t('thStatus')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <AdminEmptyTable colSpan={4} text={t('noOperators')} />
              ) : (
                accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <p className="text-navy font-semibold">
                        {account.display_name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {account.email}
                      </p>
                    </TableCell>
                    <TableCell>{account.role}</TableCell>
                    <TableCell>
                      <Badge
                        variant={account.disabled_at ? 'secondary' : 'default'}
                      >
                        {account.disabled_at
                          ? t('disabled')
                          : t('statusActive')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const reason = window.prompt(t('reasonPrompt'));
                          if (reason)
                            void updateOperator(
                              account.id,
                              account.role,
                              !account.disabled_at,
                              reason
                            ).catch((error) =>
                              toastError(error, t('operatorActionError'))
                            );
                        }}
                      >
                        {account.disabled_at ? t('enable') : t('disable')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {invitations
                .filter((item) => item.status === 'pending')
                .map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="text-navy font-semibold">{item.email}</p>
                      <p className="text-muted-foreground text-xs">
                        {t('invitationPending')}
                      </p>
                    </TableCell>
                    <TableCell>{item.role}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const reason = window.prompt(t('reasonPrompt'));
                          if (reason)
                            void revokeInvitation(item.id, reason).catch(
                              (error) =>
                                toastError(error, t('operatorActionError'))
                            );
                        }}
                      >
                        {t('revoke')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </AdminTableShell>
      </div>

      <div className="space-y-3">
        <h3 className="text-navy text-base font-bold">{t('auditTitle')}</h3>
        <AdminTableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('auditTime')}</TableHead>
                <TableHead>{t('operator')}</TableHead>
                <TableHead>{t('auditAction')}</TableHead>
                <TableHead>{t('auditTarget')}</TableHead>
                <TableHead>{t('changeReason')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditEvents.length === 0 ? (
                <AdminEmptyTable colSpan={5} text={t('noAudit')} />
              ) : (
                auditEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(event.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>{event.actor}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {event.action}
                    </TableCell>
                    <TableCell>
                      {event.target_type}: {event.target}
                    </TableCell>
                    <TableCell>{event.reason || '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </AdminTableShell>
      </div>
    </div>
  );
}
