'use client';

import { BellRing, CircleAlert, LockKeyhole } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useReminderPreference } from '@/hooks/use-reminder-preference';
import { cn } from '@/lib/utils';
import { RequiredMark } from '@/components/common/form-field';
import { DashboardNotice } from './dashboard-page';

/**
 * Opt-in daily check-in reminder (Duolingo-style nudge). The setting is synced
 * through the backend so the same time applies on the web, Android, and
 * Windows surfaces. The web delivers the notification through Web Push; the
 * native apps schedule a local notification at the same time.
 */
export function DailyReminderSettings() {
  const t = useTranslations('settingsWorkspace');
  const locale = useLocale();
  const { preference, loading, saving, error, save } = useReminderPreference();
  const { subscribe, unsubscribe } = usePushNotifications();
  const enabled = preference.enabled;

  const handleToggle = async () => {
    if (enabled) {
      await unsubscribe();
      await save({ ...preference, enabled: false });
      return;
    }
    const subscribed = await subscribe();
    if (!subscribed) return;
    await save({ ...preference, enabled: true, locale });
  };

  const handleTimeChange = async (localTime: string) => {
    await save({ ...preference, local_time: localTime, locale });
  };

  const busy = loading || saving;

  return (
    <section
      className="border-border/80 bg-card shadow-2xs rounded-2xl border p-4 sm:p-5 transition-all duration-200 hover:shadow-card"
      aria-labelledby="reminder-settings-title"
    >
      <div className="flex items-center gap-2.5">
        <span className="bg-azure/80 text-navy ring-1 ring-navy/10 flex size-9 shrink-0 items-center justify-center rounded-lg shadow-2xs">
          <BellRing className="size-4.5" aria-hidden="true" />
        </span>
        <div>
          <h2
            id="reminder-settings-title"
            className="text-navy min-w-0 text-base font-bold"
          >
            {t('reminderTitle')}
          </h2>
          <p className="text-muted-foreground text-xs">
            {t('reminderBody')}
          </p>
        </div>
      </div>

      <div className="divide-border/60 border-border/80 mt-4 divide-y rounded-xl border">
        <div className="flex items-center justify-between gap-4 p-3.5">
          <div className="min-w-0">
            <p className="text-navy text-xs sm:text-sm font-bold">
              {t('reminderEnabledLabel')}
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {t('reminderEnabledDesc')}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label={t('reminderEnabledLabel')}
            disabled={busy}
            onClick={() => void handleToggle()}
            className="focus-visible:ring-navy/30 relative h-11 w-14 shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            <span
              className={cn(
                'absolute top-2 left-1 h-7 w-12 rounded-full transition-colors duration-200 motion-reduce:transition-none',
                enabled ? 'bg-sage' : 'bg-muted-foreground/25'
              )}
              aria-hidden="true"
            >
              <span
                className={cn(
                  'shadow-soft absolute top-1 left-1 size-5 rounded-full bg-white transition-transform duration-200 motion-reduce:transition-none',
                  enabled ? 'translate-x-5' : null
                )}
              />
            </span>
          </button>
        </div>
        {enabled ? (
          <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <label
                htmlFor="reminder-time"
                className="text-navy flex items-center text-sm font-bold"
              >
                <span>{t('reminderTimeLabel')}</span>
                <RequiredMark />
              </label>
              <p className="text-muted-foreground mt-1 text-xs leading-5">
                {t('reminderTimeDesc')}
              </p>
            </div>
            <input
              id="reminder-time"
              type="time"
              value={preference.local_time}
              disabled={busy}
              onChange={(event) => void handleTimeChange(event.target.value)}
              className="border-input bg-background text-foreground focus-visible:ring-navy/30 h-11 w-40 rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
            />
          </div>
        ) : null}
      </div>

      {error ? (
        <DashboardNotice
          icon={CircleAlert}
          title={t('reminderErrorTitle')}
          tone="amber"
          role="alert"
          className="mt-4 shadow-none"
        >
          {t('reminderErrorBody')}
        </DashboardNotice>
      ) : null}

      <p className="text-muted-foreground mt-4 flex items-start gap-2 text-xs leading-5">
        <LockKeyhole className="text-sage mt-0.5 size-4 shrink-0" />
        {t('reminderPrivateNote')}
      </p>
    </section>
  );
}
