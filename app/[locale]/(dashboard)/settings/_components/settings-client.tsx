'use client';

import {
  ArrowRight,
  Database,
  HeartHandshake,
  HelpCircle,
  Settings2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardPanel,
} from '@/components/dashboard/dashboard-page';
import { RecoverySyncSettings } from '@/components/dashboard/recovery-sync-settings';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/routing';
import { useLocalUser } from '@/hooks/use-local-user';
import { ROUTES } from '@/routes';

const linkClass =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-navy/15 px-4 text-sm font-semibold text-navy outline-none transition-colors hover:bg-navy/[0.04] focus-visible:ring-2 focus-visible:ring-navy/30 sm:w-auto';

export function SettingsClient() {
  const t = useTranslations('settingsWorkspace');
  const user = useLocalUser();
  const roleKnown = Boolean(user.role);
  const isConsumer = user.role === 'user' || user.role === 'partner';
  const isStudent = user.role === 'user';

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={Settings2}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      {!roleKnown ? (
        <div className="space-y-4" role="status">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <span className="sr-only">{t('loading')}</span>
        </div>
      ) : (
        <>
          {isStudent ? <RecoverySyncSettings /> : null}

          <div className="grid gap-4 md:grid-cols-2 md:items-stretch">
            {isConsumer ? (
              <DashboardPanel
                icon={HeartHandshake}
                title={t('accountabilityTitle')}
                description={t('accountabilityBody')}
                className="flex h-full flex-col"
                contentClassName="flex flex-1 flex-col"
                density="compact"
              >
                <Link
                  href={ROUTES.ACCOUNTABILITY}
                  className={`mt-auto ${linkClass}`}
                >
                  {t('accountabilityAction')}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </DashboardPanel>
            ) : null}

            <DashboardPanel
              icon={Database}
              title={t('privacyTitle')}
              description={t('privacyBody')}
              className="flex h-full flex-col"
              contentClassName="flex flex-1 flex-col"
              density="compact"
            >
              <Link
                href={ROUTES.DATA_REQUESTS}
                className={`mt-auto ${linkClass}`}
              >
                {t('privacyAction')}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </DashboardPanel>

            <DashboardPanel
              icon={HelpCircle}
              title={t('helpTitle')}
              description={isConsumer ? t('helpBody') : t('operatorHelpBody')}
              className="flex h-full flex-col md:col-span-2"
              contentClassName="flex flex-1 flex-col"
              density="compact"
            >
              <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                {isConsumer ? (
                  <Link href={ROUTES.SUPPORT} className={linkClass}>
                    {t('supportAction')}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                ) : null}
                <Link href={ROUTES.DOWNLOAD} className={linkClass}>
                  {t('setupAction')}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </DashboardPanel>
          </div>
        </>
      )}
    </DashboardPage>
  );
}
