'use client';

import { useState } from 'react';
import { Check, Copy, HeartHandshake, Mail, Trash2, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { PartnerLink } from '@/hooks/use-accountability';

interface PartnerSetupCardProps {
  partnerEmail: string;
  setPartnerEmail: (value: string) => void;
  partnerStatus: 'none' | 'invited' | 'active';
  partnerLinkId?: string | null;
  partnerLinks?: PartnerLink[];
  inviteUrl?: string | null;
  loading: boolean;
  dataLoading?: boolean;
  onInvite: (email: string) => void;
  onSelectPartner?: (id: string) => void;
  onRevokePartner: () => Promise<void> | void;
}

export function PartnerSetupCard({
  partnerEmail,
  setPartnerEmail,
  partnerStatus,
  partnerLinkId,
  partnerLinks = [],
  inviteUrl,
  loading,
  dataLoading = false,
  onInvite,
  onSelectPartner,
  onRevokePartner,
}: PartnerSetupCardProps) {
  const t = useTranslations('accountabilityWorkspace');
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [inviteAnotherOpen, setInviteAnotherOpen] = useState(false);
  const [newPartnerEmail, setNewPartnerEmail] = useState('');
  const visibleLinks = partnerLinks.filter(
    (partner) => partner.status === 'active' || partner.status === 'invited'
  );

  const statusTone =
    partnerStatus === 'active'
      ? 'sage'
      : partnerStatus === 'invited'
        ? 'amber'
        : 'muted';

  return (
    <DashboardPanel
      icon={Users}
      title={t('partnerTitle')}
      description={t('partnerDescription')}
      className="h-full"
      action={
        dataLoading ? (
          <Skeleton className="h-8 w-28 rounded-full" />
        ) : (
          <DashboardStatus tone={statusTone}>
            {t(`partnerStatus.${partnerStatus}`)}
          </DashboardStatus>
        )
      }
    >
      {visibleLinks.length > 1 && !dataLoading ? (
        <div className="mb-4 space-y-2">
          <p className="text-muted-foreground text-xs font-semibold">
            {t('relationshipListLabel')}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {visibleLinks.map((partner) => (
              <button
                key={partner.id}
                type="button"
                onClick={() => onSelectPartner?.(partner.id)}
                className={`focus-visible:ring-navy/25 min-h-11 rounded-xl border p-3 text-left text-sm transition-colors focus-visible:ring-2 ${
                  partner.id === partnerLinkId
                    ? 'border-navy bg-azure/45 text-navy'
                    : 'border-border bg-background text-muted-foreground hover:border-navy/30'
                }`}
              >
                <span className="block truncate font-semibold">
                  {partner.partner_email}
                </span>
                <span className="mt-1 block text-xs">
                  {partner.status === 'active'
                    ? t('partnerStatus.active')
                    : t('partnerStatus.invited')}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {dataLoading ? (
        <div className="space-y-3" role="status">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-40 rounded-xl" />
          <span className="sr-only">{t('loading')}</span>
        </div>
      ) : partnerStatus === 'none' ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onInvite(partnerEmail);
          }}
        >
          <div className="space-y-2">
            <label
              htmlFor="partner-email"
              className="text-navy text-sm font-semibold"
            >
              {t('partnerEmailLabel')}
            </label>
            <p
              id="partner-email-help"
              className="text-muted-foreground text-xs leading-5"
            >
              {t('partnerEmailHelp')}
            </p>
            <div className="relative">
              <Mail
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                id="partner-email"
                type="email"
                value={partnerEmail}
                onChange={(event) => setPartnerEmail(event.target.value)}
                aria-describedby="partner-email-help"
                autoComplete="email"
                placeholder={t('partnerEmailPlaceholder')}
                disabled={loading}
                className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-navy focus-visible:ring-navy/20 h-11 w-full rounded-xl border pr-4 pl-10 text-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <HeartHandshake className="size-4" aria-hidden="true" />
            {loading ? t('sendingInvite') : t('sendInvite')}
          </Button>
        </form>
      ) : (
        <div className="border-border bg-muted/45 rounded-2xl border p-4 sm:p-5">
          <p className="text-muted-foreground text-xs font-semibold">
            {t('connectedEmail')}
          </p>
          <p className="text-navy mt-1 text-sm font-bold break-all">
            {partnerEmail}
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            {partnerStatus === 'active'
              ? t('activePartnerHelp')
              : t('invitedPartnerHelp')}
          </p>
          {inviteUrl ? (
            <div className="border-amber/25 bg-amber/[0.05] mt-4 rounded-xl border p-3">
              <p className="text-navy text-xs font-semibold">
                {t('inviteLinkLabel')}
              </p>
              <p className="text-muted-foreground mt-1 font-mono text-xs break-all">
                {inviteUrl}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  void navigator.clipboard.writeText(inviteUrl).then(() => {
                    setInviteCopied(true);
                    window.setTimeout(() => setInviteCopied(false), 2400);
                  });
                }}
              >
                {inviteCopied ? (
                  <Check className="text-sage size-4" aria-hidden="true" />
                ) : (
                  <Copy className="size-4" aria-hidden="true" />
                )}
                {inviteCopied ? t('inviteLinkCopied') : t('copyInviteLink')}
              </Button>
            </div>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="border-crimson/25 text-crimson hover:bg-crimson/[0.04] mt-4 w-full sm:w-auto"
            onClick={() => setRevokeOpen(true)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {t('revokePartner')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="mt-4 w-full sm:ml-2 sm:w-auto"
            onClick={() => setInviteAnotherOpen((open) => !open)}
          >
            <Mail className="size-4" aria-hidden="true" />
            {t('inviteAnother')}
          </Button>
          {inviteAnotherOpen ? (
            <form
              className="border-border bg-background mt-4 flex flex-col gap-2 rounded-xl border p-3 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                onInvite(newPartnerEmail);
                setInviteAnotherOpen(false);
                setNewPartnerEmail('');
              }}
            >
              <input
                type="email"
                value={newPartnerEmail}
                onChange={(event) => setNewPartnerEmail(event.target.value)}
                placeholder={t('partnerEmailPlaceholder')}
                className="border-input bg-background focus-visible:border-navy focus-visible:ring-navy/20 h-11 min-w-0 flex-1 rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
                required
              />
              <Button type="submit" disabled={loading}>
                {loading ? t('sendingInvite') : t('sendInvite')}
              </Button>
            </form>
          ) : null}
        </div>
      )}

      <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('revokeDialogTitle')}</DialogTitle>
            <DialogDescription>{t('revokeDialogBody')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {t('cancel')}
            </DialogClose>
            <Button
              variant="destructive"
              disabled={loading}
              onClick={() => {
                void Promise.resolve(onRevokePartner()).then(() =>
                  setRevokeOpen(false)
                );
              }}
            >
              {loading ? t('revoking') : t('confirmRevoke')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPanel>
  );
}
