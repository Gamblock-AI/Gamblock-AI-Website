'use client';

import { FormEvent, useState } from 'react';
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
import { toastError, toastSuccess } from '@/lib/feedback';
import { Link } from '@/i18n/routing';
import { updateLocalUser, useLocalUser } from '@/hooks/use-local-user';
import { ROUTES } from '@/routes';
import { apiClient } from '@/lib/api-client';

export default function ProfilePage() {
  const t = useTranslations('profileWorkspace');
  const user = useLocalUser();
  const [saving, setSaving] = useState(false);

  const saveDisplayName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const displayName = String(formData.get('displayName') ?? '').trim();
    if (!displayName) return;
    setSaving(true);
    try {
      const updated = await apiClient<{ display_name: string }>('/me', {
        method: 'PATCH',
        body: JSON.stringify({ display_name: displayName }),
      });
      updateLocalUser({ display_name: updated.display_name });
      toastSuccess(t('saved'));
    } catch (error) {
      toastError(error, t('saveError'));
    } finally {
      setSaving(false);
    }
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
            onSubmit={(event) => void saveDisplayName(event)}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label
                htmlFor="display-name"
                className="text-navy text-sm font-semibold"
              >
                {t('displayNameLabel')}
              </label>
              <p
                id="display-name-help"
                className="text-muted-foreground text-xs leading-5"
              >
                {t('displayNameHelp')}
              </p>
              <div className="relative">
                <UserRound
                  className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  id="display-name"
                  name="displayName"
                  type="text"
                  defaultValue={user.display_name ?? ''}
                  aria-describedby="display-name-help"
                  autoComplete="name"
                  className="border-input bg-background text-foreground focus-visible:border-navy focus-visible:ring-navy/20 h-11 w-full rounded-xl border pr-4 pl-10 text-sm transition-colors outline-none focus-visible:ring-2"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="account-email"
                className="text-navy text-sm font-semibold"
              >
                {t('emailLabel')}
              </label>
              <div className="relative">
                <Mail
                  className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  id="account-email"
                  type="email"
                  value={user.email ?? ''}
                  readOnly
                  aria-readonly="true"
                  className="border-border bg-muted/60 text-muted-foreground h-11 w-full rounded-xl border pr-4 pl-10 text-sm outline-none"
                />
              </div>
              <p className="text-muted-foreground text-xs leading-5">
                {t('emailReadonly')}
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              disabled={saving}
            >
              <Save className="size-4" aria-hidden="true" />
              {saving ? t('saving') : t('saveDisplayName')}
            </Button>
          </form>
        </DashboardPanel>

        <div className="space-y-5 lg:col-span-5">
          <DashboardPanel
            icon={KeyRound}
            title={t('securityTitle')}
            description={t('securityBody')}
          >
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="border-navy/15 text-navy hover:bg-navy/[0.04] focus-visible:ring-navy/30 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-2"
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
