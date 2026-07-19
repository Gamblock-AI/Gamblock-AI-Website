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
      className="border-border bg-card shadow-soft rounded-3xl border p-5 sm:p-6"
      aria-labelledby="sync-settings-title"
    >
      <div className="flex items-center gap-3">
        <span className="bg-navy flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm">
          <Cloud className="size-5" aria-hidden="true" />
        </span>
        <h2
          id="sync-settings-title"
          className="text-navy min-w-0 text-lg font-bold"
        >
          {t('syncTitle')}
        </h2>
      </div>
      <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6">
        {t('syncBody')}
      </p>

      <div className="divide-border border-border mt-5 divide-y rounded-2xl border">
        {options.map(({ category, labelKey, bodyKey }) => {
          const enabled = preferences[category];
          return (
            <div
              key={category}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0">
                <p className="text-navy text-sm font-bold">{t(labelKey)}</p>
                <p className="text-muted-foreground mt-1 text-xs leading-5">
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
