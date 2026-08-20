'use client';

import { CircleAlert, Cloud, LockKeyhole, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { RecoverySyncCategory } from '@/lib/recovery/sync-preferences';
import { cn } from '@/lib/utils';
import { useRecoverySyncSettings } from '@/hooks/use-recovery-sync-settings';
import { DashboardNotice } from './dashboard-page';
import { Button } from '@/components/ui/button';

const options: Array<{
  category: RecoverySyncCategory;
  labelKey: 'syncIntentions';
  bodyKey: 'syncIntentionsBody';
}> = [
  {
    category: 'intentions',
    labelKey: 'syncIntentions',
    bodyKey: 'syncIntentionsBody',
  },
];

export function RecoverySyncSettings() {
  const t = useTranslations('settingsWorkspace');
  const { preferences, busy, error, toggle, retry } = useRecoverySyncSettings();

  return (
    <section
      className="border-border/80 bg-card shadow-2xs rounded-2xl border p-4 sm:p-5 transition-all duration-200 hover:shadow-card"
      aria-labelledby="sync-settings-title"
    >
      <div className="flex items-center gap-2.5">
        <span className="bg-azure/80 text-navy ring-1 ring-navy/10 flex size-9 shrink-0 items-center justify-center rounded-lg shadow-2xs">
          <Cloud className="size-4.5" aria-hidden="true" />
        </span>
        <div>
          <h2
            id="sync-settings-title"
            className="text-navy min-w-0 text-base font-bold"
          >
            {t('syncTitle')}
          </h2>
          <p className="text-muted-foreground text-xs">
            {t('syncBody')}
          </p>
        </div>
      </div>

      <div className="divide-border/60 border-border/80 mt-4 divide-y rounded-xl border">
        {options.map(({ category, labelKey, bodyKey }) => {
          const enabled = preferences[category];
          return (
            <div
              key={category}
              className="flex items-center justify-between gap-4 p-3.5"
            >
              <div className="min-w-0">
                <p className="text-navy text-xs sm:text-sm font-bold">{t(labelKey)}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {t(bodyKey)}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={t(labelKey)}
                disabled={busy}
                onClick={() => void toggle(category)}
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
          );
        })}
      </div>
      {error ? (
        <DashboardNotice
          icon={CircleAlert}
          title={t('syncErrorTitle')}
          tone="amber"
          role="alert"
          className="mt-4 shadow-none"
          action={
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => void retry()}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              {busy ? t('syncRetrying') : t('syncRetry')}
            </Button>
          }
        >
          {t('syncErrorBody')}
        </DashboardNotice>
      ) : null}
      <p className="text-muted-foreground mt-4 flex items-start gap-2 text-xs leading-5">
        <LockKeyhole
          className="text-sage mt-0.5 size-4 shrink-0"
          aria-hidden="true"
        />
        {t('syncPrivateNote')}
      </p>
    </section>
  );
}
