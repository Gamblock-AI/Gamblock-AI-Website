import { getTranslations } from 'next-intl/server';
import { AuthShell } from '@/components/auth/AuthShell';
import { PasswordResetForm } from '@/components/auth/password-reset-form';
import { ROUTES } from '@/routes';

export default async function ForgotPasswordPage() {
  const [t, authT] = await Promise.all([
    getTranslations('forgotPasswordPage'),
    getTranslations('authShell'),
  ]);

  return (
    <AuthShell
      heading={t('heading')}
      subheading={t('subheading')}
      backFallbackHref={ROUTES.LOGIN}
      backLabel={authT('backLogin')}
    >
      <PasswordResetForm
        copy={{
          email: t('email'),
          code: t('code'),
          password: t('password'),
          request: t('request'),
          confirm: t('confirm'),
          sent: t('sent'),
          success: t('success'),
          detail: t('detail'),
          genericError: t('genericError'),
        }}
      />
    </AuthShell>
  );
}
