'use client';

import { FormEvent, useState } from 'react';
import {
  BadgeCheck,
  KeyRound,
  Mail,
  Save,
  Trash2,
  UserRound,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { AvatarCropper } from '@/components/account/avatar-cropper';
import { AvatarImage } from '@/components/account/avatar-image';
import { toastError, toastSuccess } from '@/lib/feedback';
import { Link } from '@/i18n/routing';
import { updateLocalUser, useLocalUser } from '@/hooks/use-local-user';
import { useProfileActions } from '@/hooks/use-profile';
import { ROUTES } from '@/routes';
import {
  dynamicLabelFallback,
  dynamicLabelKey,
} from '@/lib/i18n/dynamic-labels';

export default function ProfilePage() {
  const t = useTranslations('profileWorkspace');
  const tDynamic = useTranslations('dynamicLabels');
  const user = useLocalUser();
  const {
    updateDisplayName,
    uploadAvatar: sendAvatar,
    deleteAvatar,
  } = useProfileActions();
  const [saving, setSaving] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);

  const saveDisplayName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const displayName = String(formData.get('displayName') ?? '').trim();
    if (!displayName) return;
    setSaving(true);
    try {
      const updated = await updateDisplayName(displayName);
      updateLocalUser({ display_name: updated.display_name });
      toastSuccess(t('saved'));
    } catch (error) {
      toastError(error, t('saveError'));
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (avatar: File) => {
    setAvatarBusy(true);
    try {
      const updated = await sendAvatar(avatar);
      updateLocalUser({
        avatar_url: updated.avatar_url
          ? `${updated.avatar_url}?v=${Date.now()}`
          : undefined,
      });
      toastSuccess(t('avatarUploadSuccess'));
    } catch (error) {
      toastError(error, t('avatarUploadError'));
    } finally {
      setAvatarBusy(false);
    }
  };

  const removeAvatar = async () => {
    setAvatarBusy(true);
    try {
      await deleteAvatar();
      updateLocalUser({ avatar_url: undefined });
      toastSuccess(t('avatarRemoveSuccess'));
    } catch (error) {
      toastError(error, t('avatarRemoveError'));
    } finally {
      setAvatarBusy(false);
    }
  };

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={UserRound}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <div className="grid gap-5 lg:grid-cols-12 lg:items-stretch">
        <DashboardPanel
          icon={UserRound}
          title={t('identityTitle')}
          description={t('identityBody')}
          className="flex h-full flex-col lg:col-span-7"
          contentClassName="flex flex-1 flex-col"
          action={
            <DashboardStatus tone="navy">
              {user.role
                ? tDynamic(dynamicLabelKey('role', user.role), {
                    value: dynamicLabelFallback(user.role),
                  })
                : t('roleUnavailable')}
            </DashboardStatus>
          }
        >
          <div className="border-border flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center">
            <AvatarImage
              avatarUrl={user.avatar_url}
              alt={t('avatarAlt', {
                name: user.display_name || t('profileFallback'),
              })}
              fallback={<UserRound className="size-8" aria-hidden="true" />}
              className="bg-azure text-navy flex size-20 shrink-0 items-center justify-center rounded-2xl"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-navy text-sm font-bold">
                {t('avatarTitle')}
              </h3>
              <p className="text-muted-foreground mt-1 text-xs leading-5">
                {t('avatarBody')}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <AvatarCropper busy={avatarBusy} onCrop={uploadAvatar} />
                {user.avatar_url ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={avatarBusy}
                    onClick={() => void removeAvatar()}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    {t('avatarRemove')}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <form
            key={user.display_name ?? 'empty-profile'}
            onSubmit={(event) => void saveDisplayName(event)}
            className="flex flex-1 flex-col space-y-5"
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
              className="mt-auto w-full sm:w-auto"
              disabled={saving}
            >
              <Save className="size-4" aria-hidden="true" />
              {saving ? t('saving') : t('saveDisplayName')}
            </Button>
          </form>
        </DashboardPanel>

        <div className="flex h-full flex-col gap-5 lg:col-span-5">
          <DashboardPanel
            icon={KeyRound}
            title={t('securityTitle')}
            description={t('securityBody')}
            className="flex flex-1 flex-col"
            contentClassName="flex flex-1 flex-col"
          >
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="border-navy/15 text-navy hover:bg-navy/[0.04] focus-visible:ring-navy/30 mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-2"
            >
              <KeyRound className="size-4" aria-hidden="true" />
              {t('resetPassword')}
            </Link>
          </DashboardPanel>

          <DashboardPanel
            icon={BadgeCheck}
            title={t('accountTruthTitle')}
            description={t('accountTruthBody')}
            className="flex flex-1 flex-col"
            contentClassName="flex flex-1 flex-col"
          >
            <Link
              href={ROUTES.DATA_REQUESTS}
              className="border-navy/15 text-navy hover:bg-navy/[0.04] focus-visible:ring-navy/30 mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-2"
            >
              <BadgeCheck className="size-4" aria-hidden="true" />
              {t('accountTruthAction')}
            </Link>
          </DashboardPanel>
        </div>
      </div>
    </DashboardPage>
  );
}
