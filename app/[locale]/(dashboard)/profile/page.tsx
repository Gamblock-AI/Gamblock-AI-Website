'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  BadgeCheck,
  CircleAlert,
  KeyRound,
  Mail,
  Save,
  Trash2,
  UserRound,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthField } from '@/components/auth/AuthField';
import { AvatarCropper } from '@/components/account/avatar-cropper';
import { AvatarImage } from '@/components/account/avatar-image';
import { toastError, toastSuccess } from '@/lib/feedback';
import { Link } from '@/i18n/routing';
import {
  refreshCurrentUser,
  updateLocalUser,
  useLocalUser,
} from '@/hooks/use-local-user';
import { useProfileActions } from '@/hooks/use-profile';
import { ROUTES } from '@/routes';
import { useRouter } from '@/i18n/routing';
import { clearBrowserSession } from '@/lib/api-client';
import {
  dynamicLabelFallback,
  dynamicLabelKey,
} from '@/lib/i18n/dynamic-labels';
import { errorCode, friendlyMessage } from '@/lib/messages';

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const t = useTranslations('profileWorkspace');
  const tDynamic = useTranslations('dynamicLabels');
  const router = useRouter();
  const user = useLocalUser();
  const {
    updateDisplayName,
    uploadAvatar: sendAvatar,
    deleteAvatar,
    updatePassword,
  } = useProfileActions();
  const [saving, setSaving] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const passwordSchema = z
    .object({
      currentPassword: z.string().min(1, t('currentPasswordRequired')),
      newPassword: z.string().min(8, t('newPasswordMinimum')),
      confirmPassword: z.string().min(1, t('confirmPasswordRequired')),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
      path: ['confirmPassword'],
      message: t('passwordMismatch'),
    })
    .refine((values) => values.newPassword !== values.currentPassword, {
      path: ['newPassword'],
      message: t('passwordMustDiffer'),
    });
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    clearErrors: clearPasswordErrors,
    setError: setPasswordError,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    let active = true;
    refreshCurrentUser()
      .then(() => {
        if (active) setProfileError(false);
      })
      .catch(() => {
        if (active) setProfileError(true);
      })
      .finally(() => {
        if (active) setProfileLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const retryProfile = async () => {
    setProfileLoading(true);
    setProfileError(false);
    try {
      await refreshCurrentUser();
    } catch {
      setProfileError(true);
    } finally {
      setProfileLoading(false);
    }
  };

  const savePassword = async (values: PasswordFormValues) => {
    clearPasswordErrors();
    setPasswordBusy(true);
    try {
      await updatePassword(values.currentPassword, values.newPassword);
      toastSuccess(t('passwordUpdateSuccess'));
      clearBrowserSession();
      router.replace(ROUTES.LOGIN);
    } catch (error) {
      const code = errorCode(error);
      const message = friendlyMessage(error);
      if (code === 'current_password_invalid') {
        setPasswordError(
          'currentPassword',
          { type: 'server', message },
          { shouldFocus: true }
        );
      } else if (code === 'password_reuse_not_allowed') {
        setPasswordError(
          'newPassword',
          { type: 'server', message },
          { shouldFocus: true }
        );
      } else if (code === 'password_validation_failed') {
        setPasswordError('root.server', { type: 'server', message });
      } else {
        toastError(error);
      }
    } finally {
      setPasswordBusy(false);
    }
  };

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

      {profileError ? (
        <DashboardNotice
          icon={CircleAlert}
          title={t('profileLoadErrorTitle')}
          tone="amber"
          role="alert"
          action={
            <Button
              variant="outline"
              disabled={profileLoading}
              onClick={() => void retryProfile()}
            >
              {t('retryProfile')}
            </Button>
          }
        >
          {t('profileLoadErrorBody')}
        </DashboardNotice>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
        <DashboardPanel
          icon={UserRound}
          title={t('identityTitle')}
          description={t('identityBody')}
          className="flex h-full flex-col"
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

        <DashboardPanel
          icon={KeyRound}
          title={t('securityTitle')}
          description={t('securityBody')}
          className="flex h-full flex-col"
          contentClassName="flex flex-1 flex-col"
        >
          {profileError ? (
            <DashboardNotice
              icon={CircleAlert}
              title={t('securityUnavailableTitle')}
              tone="amber"
              role="alert"
              action={
                <Button
                  size="sm"
                  variant="outline"
                  disabled={profileLoading}
                  onClick={() => void retryProfile()}
                >
                  {t('retryProfile')}
                </Button>
              }
            >
              {t('securityUnavailableBody')}
            </DashboardNotice>
          ) : profileLoading || user.password_enabled === undefined ? (
            <div className="space-y-3" role="status">
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
              <span className="sr-only">{t('loadingSecurity')}</span>
            </div>
          ) : user.password_enabled === false ? (
            <DashboardNotice
              icon={BadgeCheck}
              title={t('providerSecurityTitle')}
              tone="navy"
            >
              {t('providerSecurityBody')}
            </DashboardNotice>
          ) : (
            <form
              onSubmit={handlePasswordSubmit(savePassword)}
              className="space-y-4"
              noValidate
            >
              {passwordErrors.root?.server?.message ? (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="border-crimson/20 bg-crimson/5 text-crimson rounded-xl border px-4 py-3 text-sm font-medium"
                >
                  {passwordErrors.root.server.message}
                </div>
              ) : null}
              <AuthField
                label={t('currentPasswordLabel')}
                icon={KeyRound}
                type="password"
                placeholder={t('currentPasswordPlaceholder')}
                autoComplete="current-password"
                error={passwordErrors.currentPassword?.message}
                {...registerPassword('currentPassword')}
              />
              <AuthField
                label={t('newPasswordLabel')}
                icon={KeyRound}
                type="password"
                placeholder={t('newPasswordPlaceholder')}
                autoComplete="new-password"
                error={passwordErrors.newPassword?.message}
                {...registerPassword('newPassword')}
              />
              <AuthField
                label={t('confirmPasswordLabel')}
                icon={KeyRound}
                type="password"
                placeholder={t('confirmPasswordPlaceholder')}
                autoComplete="new-password"
                error={passwordErrors.confirmPassword?.message}
                {...registerPassword('confirmPassword')}
              />
              <p className="text-muted-foreground text-xs leading-5">
                {t('passwordSignOutNote')}
              </p>
              <Button type="submit" className="w-full" disabled={passwordBusy}>
                <KeyRound className="size-4" aria-hidden="true" />
                {passwordBusy ? t('updatingPassword') : t('updatePassword')}
              </Button>
            </form>
          )}
        </DashboardPanel>
      </div>

      <DashboardPanel
        icon={BadgeCheck}
        title={t('accountTruthTitle')}
        description={t('accountTruthBody')}
        density="compact"
      >
        <Link
          href={ROUTES.DATA_REQUESTS}
          className="border-navy/15 text-navy hover:bg-navy/[0.04] focus-visible:ring-navy/30 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-2"
        >
          <BadgeCheck className="size-4" aria-hidden="true" />
          {t('accountTruthAction')}
        </Link>
      </DashboardPanel>
    </DashboardPage>
  );
}
