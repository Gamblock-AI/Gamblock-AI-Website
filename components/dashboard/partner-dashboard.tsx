import { ArrowRight, Handshake, LockKeyhole, ShieldCheck, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

interface PartnerDashboardProps {
  name: string;
}

export function PartnerDashboard({ name }: PartnerDashboardProps) {
  const t = useTranslations('recoveryDashboard');

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header className="rounded-[1.75rem] border border-border bg-card px-5 py-6 shadow-soft sm:px-7 sm:py-8">
        <p className="text-xs font-bold tracking-[0.12em] text-sage uppercase">
          {t('partnerEyebrow')}
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl leading-tight font-extrabold tracking-tight text-navy sm:text-4xl">
          {t('partnerTitle')}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
          {t('partnerDescription')}
        </p>
        <p className="sr-only">{name}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href={ROUTES.PARTNERS}
          className="group flex min-h-36 items-start gap-4 rounded-[1.5rem] border border-border bg-card p-5 shadow-soft outline-none transition-colors hover:border-navy/25 focus-visible:ring-2 focus-visible:ring-navy/30"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-azure text-navy">
            <Users className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-bold text-navy">{t('partnerMembers')}</span>
            <span className="mt-2 block text-sm leading-6 text-muted-foreground">
              {t('partnerDescription')}
            </span>
          </span>
          <ArrowRight className="mt-3 size-4 shrink-0 text-navy transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>

        <Link
          href={ROUTES.ACCOUNTABILITY}
          className="group flex min-h-36 items-start gap-4 rounded-[1.5rem] border border-border bg-card p-5 shadow-soft outline-none transition-colors hover:border-navy/25 focus-visible:ring-2 focus-visible:ring-navy/30"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sage/10 text-sage">
            <Handshake className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-bold text-navy">{t('partnerApprovals')}</span>
            <span className="mt-2 block text-sm leading-6 text-muted-foreground">
              {t('partnerPrivacyBody')}
            </span>
          </span>
          <ArrowRight className="mt-3 size-4 shrink-0 text-navy transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>

      <section className="rounded-[1.5rem] border border-sage/20 bg-sage/[0.05] p-5 sm:p-6" aria-labelledby="partner-privacy-title">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-sage shadow-soft">
            <LockKeyhole className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="partner-privacy-title" className="text-base font-bold text-navy">
              {t('partnerPrivacyTitle')}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {t('partnerPrivacyBody')}
            </p>
            <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-sage">
              <ShieldCheck className="size-4" aria-hidden="true" />
              {t('privacyStatusUnknown')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
