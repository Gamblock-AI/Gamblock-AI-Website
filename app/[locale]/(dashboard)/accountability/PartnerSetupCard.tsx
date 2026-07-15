'use client';

import { useState } from 'react';
import { HeartHandshake, Mail, Trash2, Users } from 'lucide-react';
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

interface PartnerSetupCardProps {
  partnerEmail: string;
  setPartnerEmail: (value: string) => void;
  partnerStatus: 'none' | 'invited' | 'active';
  loading: boolean;
  dataLoading?: boolean;
  onInvite: () => void;
  onRevokePartner: () => Promise<void> | void;
}

export function PartnerSetupCard({
  partnerEmail,
  setPartnerEmail,
  partnerStatus,
  loading,
  dataLoading = false,
  onInvite,
  onRevokePartner,
}: PartnerSetupCardProps) {
  const t = useTranslations('accountabilityWorkspace');
  const [revokeOpen, setRevokeOpen] = useState(false);

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
            onInvite();
          }}
        >
          <div className="space-y-2">
            <label htmlFor="partner-email" className="text-sm font-semibold text-navy">
              {t('partnerEmailLabel')}
            </label>
            <p id="partner-email-help" className="text-xs leading-5 text-muted-foreground">
              {t('partnerEmailHelp')}
            </p>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
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
                className="h-11 w-full rounded-xl border border-input bg-background pr-4 pl-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-navy focus-visible:ring-2 focus-visible:ring-navy/20 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
          </div>
          <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
            <HeartHandshake className="size-4" aria-hidden="true" />
            {loading ? t('sendingInvite') : t('sendInvite')}
          </Button>
        </form>
      ) : (
        <div className="rounded-2xl border border-border bg-muted/45 p-4 sm:p-5">
          <p className="text-xs font-semibold text-muted-foreground">
            {t('connectedEmail')}
          </p>
          <p className="mt-1 break-all text-sm font-bold text-navy">{partnerEmail}</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {partnerStatus === 'active'
              ? t('activePartnerHelp')
              : t('invitedPartnerHelp')}
          </p>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="mt-4 w-full border-crimson/25 text-crimson hover:bg-crimson/[0.04] sm:w-auto"
            onClick={() => setRevokeOpen(true)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {t('revokePartner')}
          </Button>
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
                  setRevokeOpen(false),
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
