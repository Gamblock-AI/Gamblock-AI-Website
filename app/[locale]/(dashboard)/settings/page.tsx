import {
  ArrowRight,
  Database,
  HeartHandshake,
  HelpCircle,
  LockKeyhole,
  Settings2,
  ShieldCheck,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
  DashboardPanel,
} from '@/components/dashboard/dashboard-page';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';
import { RecoverySyncSettings } from '@/components/dashboard/recovery-sync-settings';

const linkClass =
  'mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-navy/15 px-4 text-sm font-semibold text-navy outline-none transition-colors hover:bg-navy/[0.04] focus-visible:ring-2 focus-visible:ring-navy/30 sm:w-auto';

export default async function SettingsPage() {
  const t = await getTranslations('settingsWorkspace');

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={Settings2}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        aside={
          <DashboardNotice
            icon={LockKeyhole}
            title={t('boundaryTitle')}
          >
            {t('boundaryBody')}
          </DashboardNotice>
        }
      />

      <DashboardNotice icon={ShieldCheck} title={t('deviceTitle')} tone="navy">
        {t('deviceBody')}
      </DashboardNotice>

      <RecoverySyncSettings />

      <div className="grid gap-5 md:grid-cols-2">
        <DashboardPanel
          icon={HeartHandshake}
          title={t('accountabilityTitle')}
          description={t('accountabilityBody')}
          className="flex h-full flex-col"
        >
          <Link href={ROUTES.ACCOUNTABILITY} className={linkClass}>
            {t('accountabilityAction')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </DashboardPanel>

        <DashboardPanel
          icon={Database}
          title={t('privacyTitle')}
          description={t('privacyBody')}
          className="flex h-full flex-col"
        >
          <Link href={ROUTES.DATA_REQUESTS} className={linkClass}>
            {t('privacyAction')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </DashboardPanel>

        <DashboardPanel
          icon={HelpCircle}
          title={t('helpTitle')}
          description={t('helpBody')}
          className="flex h-full flex-col md:col-span-2"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={ROUTES.SUPPORT} className={linkClass}>
              {t('supportAction')}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href={ROUTES.DOWNLOAD} className={linkClass}>
              {t('setupAction')}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </DashboardPanel>
      </div>
    </DashboardPage>
  );
}
