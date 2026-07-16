import { ArrowLeft, LifeBuoy, LockKeyhole } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

export default async function ForgotPasswordPage() {
  const t = await getTranslations('forgotPasswordPage');

  return (
    <AuthShell
      heading={t('heading')}
      subheading={t('placeholderBody')}
      footer={
        <Link
          href={ROUTES.LOGIN}
          className="group text-muted-foreground hover:text-navy inline-flex w-full items-center justify-center gap-2 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1 motion-reduce:transform-none" />
          {t('backToLogin')}
        </Link>
      }
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
        <Button
          render={<Link href={ROUTES.CONTACT} />}
          size="lg"
          className="w-full"
        >
          <LifeBuoy className="size-4" aria-hidden="true" />
          {t('contactSupport')}
        </Button>
      </Card>
    </AuthShell>
  );
}
