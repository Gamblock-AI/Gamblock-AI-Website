import { ArrowRight, Handshake, LockKeyhole, ShieldCheck, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
} from './dashboard-page';

interface PartnerDashboardProps {
  name: string;
}

export function PartnerDashboard({ name }: PartnerDashboardProps) {
  const t = useTranslations('recoveryDashboard');

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={Handshake}
        eyebrow={t('partnerEyebrow')}
        title={t('partnerTitle')}
        description={t('partnerDescription')}
      />
      <p className="sr-only">{name}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href={ROUTES.PARTNERS}
          className="group min-h-32 rounded-2xl border border-border bg-card p-5 shadow-soft outline-none transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-px hover:border-navy/35 hover:shadow-card focus-visible:ring-2 focus-visible:ring-navy/35 motion-reduce:transform-none motion-reduce:transition-none"
        >
          <span className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy text-white shadow-sm">
              <Users className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 text-base font-bold text-navy">
              {t('partnerMembers')}
            </span>
            <ArrowRight className="size-4 shrink-0 text-navy transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
          <span className="mt-3 block text-sm leading-6 text-muted-foreground">
            {t('partnerDescription')}
          </span>
        </Link>

        <Link
          href={ROUTES.ACCOUNTABILITY}
          className="group min-h-32 rounded-2xl border border-border bg-card p-5 shadow-soft outline-none transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-px hover:border-navy/35 hover:shadow-card focus-visible:ring-2 focus-visible:ring-navy/35 motion-reduce:transform-none motion-reduce:transition-none"
        >
          <span className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy text-white shadow-sm">
              <Handshake className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 text-base font-bold text-navy">
              {t('partnerApprovals')}
            </span>
            <ArrowRight className="size-4 shrink-0 text-navy transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
          <span className="mt-3 block text-sm leading-6 text-muted-foreground">
            {t('partnerPrivacyBody')}
          </span>
        </Link>
      </div>

      <DashboardNotice
        icon={LockKeyhole}
        title={t('partnerPrivacyTitle')}
      >
        <p className="max-w-3xl text-sm leading-6">
          {t('partnerPrivacyBody')}
        </p>
        <p className="mt-3 flex items-center gap-2 text-xs font-bold text-sage">
          <ShieldCheck className="size-4" aria-hidden="true" />
          {t('privacyStatusUnknown')}
        </p>
      </DashboardNotice>
    </DashboardPage>
  );
}
