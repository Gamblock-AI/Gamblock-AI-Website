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
import { DailyReminderSettings } from '@/components/dashboard/daily-reminder-settings';
import { SpkPrivacySettings } from '@/components/dashboard/spk-privacy-settings';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/routing';
import { useLocalUser } from '@/hooks/use-local-user';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes';

const linkClass =
  'inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-navy/15 bg-muted/25 px-3.5 py-2 text-xs sm:text-sm font-semibold text-navy outline-none transition-all duration-200 hover:border-navy/30 hover:bg-navy hover:text-white focus-visible:ring-2 focus-visible:ring-navy/30';

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
          {isStudent ? <DailyReminderSettings /> : null}
          {isStudent ? <SpkPrivacySettings /> : null}

          <div
            className={cn(
              'grid gap-4 md:items-stretch',
              isConsumer ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'
            )}
          >
            {isConsumer ? (
              <DashboardPanel
                icon={HeartHandshake}
                title={t('accountabilityTitle')}
                description={t('accountabilityBody')}
                className="flex h-full flex-col"
                contentClassName="flex flex-1 flex-col justify-between"
                density="compact"
              >
                <div className="mt-4 border-t border-border/50 pt-3">
                  <Link
                    href={ROUTES.ACCOUNTABILITY}
                    className={linkClass}
                  >
                    {t('accountabilityAction')}
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </DashboardPanel>
            ) : null}

            <DashboardPanel
              icon={Database}
              title={t('privacyTitle')}
              description={t('privacyBody')}
              className="flex h-full flex-col"
              contentClassName="flex flex-1 flex-col justify-between"
              density="compact"
            >
              <div className="mt-4 border-t border-border/50 pt-3">
                <Link
                  href={ROUTES.DATA_REQUESTS}
                  className={linkClass}
                >
                  {t('privacyAction')}
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </DashboardPanel>

            <DashboardPanel
              icon={HelpCircle}
              title={t('helpTitle')}
              description={isConsumer ? t('helpBody') : t('operatorHelpBody')}
              className="flex h-full flex-col"
              contentClassName="flex flex-1 flex-col justify-between"
              density="compact"
            >
              <div className="mt-4 border-t border-border/50 pt-3">
                <div className={cn('flex flex-col gap-2', isConsumer ? 'sm:flex-row' : '')}>
                  {isConsumer ? (
                    <Link href={ROUTES.SUPPORT} className={linkClass}>
                      {t('supportAction')}
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  ) : null}
                  <Link href={ROUTES.DOWNLOAD} className={linkClass}>
                    {t('setupAction')}
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </DashboardPanel>
          </div>
        </>
      )}
    </DashboardPage>
  );
}
