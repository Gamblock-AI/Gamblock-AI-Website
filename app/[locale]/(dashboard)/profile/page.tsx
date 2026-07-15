'use client';

import { FormEvent } from 'react';
import {
  BadgeCheck,
  KeyRound,
  LockKeyhole,
  Mail,
  Save,
  UserRound,
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
import { toastSuccess } from '@/lib/feedback';
import { Link } from '@/i18n/routing';
import {
  updateLocalUser,
  useLocalUser,
} from '@/hooks/use-local-user';
import { ROUTES } from '@/routes';

export default function ProfilePage() {
  const t = useTranslations('profileWorkspace');
  const user = useLocalUser();

  const saveDisplayName = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const displayName = String(formData.get('displayName') ?? '').trim();
    if (!displayName) return;
    updateLocalUser({ display_name: displayName });
    toastSuccess(t('saved'));
  };

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={UserRound}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        aside={
          <DashboardNotice
            icon={LockKeyhole}
            title={t('sessionTitle')}
            tone="sage"
          >
            {t('sessionBody')}
          </DashboardNotice>
        }
      />

      <div className="grid gap-5 lg:grid-cols-12 lg:items-start">
        <DashboardPanel
          icon={UserRound}
          title={t('identityTitle')}
          description={t('identityBody')}
          className="lg:col-span-7"
          action={
            <DashboardStatus tone="navy">
              {user.role || t('roleUnavailable')}
            </DashboardStatus>
          }
        >
          <form
            key={user.display_name ?? 'empty-profile'}
            onSubmit={saveDisplayName}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label htmlFor="display-name" className="text-sm font-semibold text-navy">
                {t('displayNameLabel')}
              </label>
              <p id="display-name-help" className="text-xs leading-5 text-muted-foreground">
                {t('displayNameHelp')}
              </p>
              <div className="relative">
                <UserRound
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="display-name"
                  name="displayName"
                  type="text"
                  defaultValue={user.display_name ?? ''}
                  aria-describedby="display-name-help"
                  autoComplete="name"
                  className="h-11 w-full rounded-xl border border-input bg-background pr-4 pl-10 text-sm text-foreground outline-none transition-colors focus-visible:border-navy focus-visible:ring-2 focus-visible:ring-navy/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="account-email" className="text-sm font-semibold text-navy">
                {t('emailLabel')}
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="account-email"
                  type="email"
                  value={user.email ?? ''}
                  readOnly
                  aria-readonly="true"
                  className="h-11 w-full rounded-xl border border-border bg-muted/60 pr-4 pl-10 text-sm text-muted-foreground outline-none"
                />
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                {t('emailReadonly')}
              </p>
            </div>

            <Button type="submit" size="lg" className="w-full sm:w-auto">
              <Save className="size-4" aria-hidden="true" />
              {t('saveDisplayName')}
            </Button>
          </form>
        </DashboardPanel>

        <div className="space-y-5 lg:col-span-5">
          <DashboardPanel
            icon={KeyRound}
            title={t('securityTitle')}
            description={t('securityBody')}
            accent="amber"
          >
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-navy/15 px-4 text-sm font-semibold text-navy outline-none transition-colors hover:bg-navy/[0.04] focus-visible:ring-2 focus-visible:ring-navy/30"
            >
              <KeyRound className="size-4" aria-hidden="true" />
              {t('resetPassword')}
            </Link>
          </DashboardPanel>

          <DashboardNotice
            icon={BadgeCheck}
            title={t('accountTruthTitle')}
            tone="navy"
          >
            {t('accountTruthBody')}
          </DashboardNotice>
        </div>
      </div>
    </DashboardPage>
  );
}
