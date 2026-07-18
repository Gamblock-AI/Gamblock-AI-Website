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
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
} from '@/components/dashboard/dashboard-page';

export default async function PartnersPage() {
  const t = await getTranslations('partnerWorkspace');

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={Handshake}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <DashboardNotice icon={LockKeyhole} title={t('privacyTitle')}>
        <p className="max-w-3xl text-sm leading-6">{t('privacyBody')}</p>
      </DashboardNotice>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col rounded-2xl p-5 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-px hover:border-navy/35 hover:shadow-card motion-reduce:transform-none motion-reduce:transition-none sm:p-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-navy text-white shadow-sm">
            <Handshake className="size-5" aria-hidden="true" />
          </span>
          <h2 className="text-navy mt-4 text-lg font-bold">
            {t('relationshipTitle')}
          </h2>
          <p className="text-muted-foreground mt-2 flex-1 text-sm leading-6">
            {t('relationshipBody')}
          </p>
          <Link
            href={ROUTES.ACCOUNTABILITY}
            className="text-navy focus-visible:ring-navy/30 mt-5 inline-flex min-h-11 items-center gap-2 self-start rounded-xl text-sm font-semibold outline-none hover:underline focus-visible:ring-2"
          >
            {t('relationshipAction')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Card>

        <Card className="flex flex-col rounded-2xl p-5 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-px hover:border-navy/35 hover:shadow-card motion-reduce:transform-none motion-reduce:transition-none sm:p-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-navy text-white shadow-sm">
            <KeyRound className="size-5" aria-hidden="true" />
          </span>
          <h2 className="text-navy mt-4 text-lg font-bold">
            {t('approvalTitle')}
          </h2>
          <p className="text-muted-foreground mt-2 flex-1 text-sm leading-6">
            {t('approvalBody')}
          </p>
          <p className="text-sage mt-5 flex min-h-11 items-center gap-2 text-xs font-semibold">
            <ShieldCheck className="size-4" aria-hidden="true" />
            {t('privacyTitle')}
          </p>
        </Card>
      </div>

      <section
        className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6"
        aria-labelledby="partner-support-guidance"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy text-white shadow-sm">
            <CircleHelp className="size-[1.125rem]" aria-hidden="true" />
          </span>
          <h2
            id="partner-support-guidance"
            className="text-navy min-w-0 text-lg font-bold"
          >
            {t('supportTitle')}
          </h2>
        </div>
        <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-6">
          {t('supportBody')}
        </p>
        <Link
          href={ROUTES.SUPPORT}
          className="text-navy focus-visible:ring-navy/30 mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-semibold outline-none hover:underline focus-visible:ring-2"
        >
          {t('supportAction')}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
    </DashboardPage>
  );
}
