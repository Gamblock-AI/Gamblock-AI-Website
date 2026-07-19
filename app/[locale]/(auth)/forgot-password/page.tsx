import { LockKeyhole } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { AuthShell } from '@/components/auth/AuthShell';
import { ContactSupportButton } from '@/components/auth/ContactSupportButton';
import { Card } from '@/components/ui/card';
import { ROUTES } from '@/routes';

export default async function ForgotPasswordPage() {
  const [t, authT] = await Promise.all([
    getTranslations('forgotPasswordPage'),
    getTranslations('authShell'),
  ]);

  return (
    <AuthShell
      heading={t('heading')}
      subheading={t('placeholderBody')}
      backFallbackHref={ROUTES.LOGIN}
      backLabel={authT('backLogin')}
    >
      <Card className="border-amber/25 bg-amber/[0.04] space-y-5 p-5">
        <div className="flex items-start gap-3">
          <div className="bg-background text-amber flex size-10 shrink-0 items-center justify-center rounded-xl">
            <LockKeyhole className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-navy font-bold">{t('placeholderTitle')}</h2>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              {t('placeholderDetail')}
            </p>
          </div>
        </div>
        <ContactSupportButton label={t('contactSupport')} />
      </Card>
    </AuthShell>
  );
}
