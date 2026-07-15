import {
  ArrowRight,
  CircleHelp,
  Clock3,
  Handshake,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

export default async function PartnersPage() {
  const t = await getTranslations('partnerWorkspace');

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-8">
      <header className="grid gap-5 border-b border-border pb-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-sage uppercase">
            {t('eyebrow')}
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl leading-tight font-extrabold tracking-tight text-navy sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {t('description')}
          </p>
        </div>
        <div className="flex min-h-11 items-center gap-3 rounded-2xl border border-amber/25 bg-amber/[0.06] p-4 text-sm font-semibold text-foreground">
          <Clock3 className="size-5 shrink-0 text-amber" aria-hidden="true" />
          {t('prototypeStatus')}
        </div>
      </header>

      <section className="rounded-[1.5rem] border border-sage/20 bg-sage/[0.055] p-5 sm:p-6" aria-labelledby="partner-privacy-boundary">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-sage shadow-soft">
            <LockKeyhole className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="partner-privacy-boundary" className="text-lg font-bold text-navy">
              {t('privacyTitle')}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {t('privacyBody')}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col p-5 sm:p-6">
          <span className="flex size-11 items-center justify-center rounded-xl bg-azure text-navy">
            <Handshake className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-navy">{t('relationshipTitle')}</h2>
          <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
            {t('relationshipBody')}
          </p>
          <Link
            href={ROUTES.ACCOUNTABILITY}
            className="mt-5 inline-flex min-h-11 items-center gap-2 self-start rounded-xl text-sm font-semibold text-navy outline-none hover:underline focus-visible:ring-2 focus-visible:ring-navy/30"
          >
            {t('relationshipAction')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Card>

        <Card className="flex flex-col p-5 sm:p-6">
          <span className="flex size-11 items-center justify-center rounded-xl bg-navy/[0.07] text-navy">
            <KeyRound className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-navy">{t('approvalTitle')}</h2>
          <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
            {t('approvalBody')}
          </p>
          <p className="mt-5 flex min-h-11 items-center gap-2 text-xs font-semibold text-sage">
            <ShieldCheck className="size-4" aria-hidden="true" />
            {t('privacyTitle')}
          </p>
        </Card>
      </div>

      <section className="rounded-[1.5rem] border border-navy/15 bg-azure/40 p-5 sm:p-6" aria-labelledby="partner-support-guidance">
        <div className="flex items-start gap-4">
          <CircleHelp className="mt-0.5 size-6 shrink-0 text-navy" aria-hidden="true" />
          <div>
            <h2 id="partner-support-guidance" className="text-lg font-bold text-navy">
              {t('supportTitle')}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {t('supportBody')}
            </p>
            <Link
              href={ROUTES.SUPPORT}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-semibold text-navy outline-none hover:underline focus-visible:ring-2 focus-visible:ring-navy/30"
            >
              {t('supportAction')}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
