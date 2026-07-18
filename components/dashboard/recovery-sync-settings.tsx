'use client';

import { Cloud, LockKeyhole } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  getRecoverySyncPreferences,
  setRecoverySyncPreference,
  type RecoverySyncCategory,
  type RecoverySyncPreferences,
} from '@/lib/recovery/sync-preferences';
import { cn } from '@/lib/utils';

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
  const [preferences, setPreferences] = useState<RecoverySyncPreferences>({
    intentions: false,
  });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setPreferences(getRecoverySyncPreferences());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggle = (category: RecoverySyncCategory) => {
    const enabled = !preferences[category];
    setRecoverySyncPreference(category, enabled);
    setPreferences((current) => ({ ...current, [category]: enabled }));
  };

  return (
    <section
      className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6"
      aria-labelledby="sync-settings-title"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy text-white shadow-sm">
          <Cloud className="size-5" aria-hidden="true" />
        </span>
        <h2 id="sync-settings-title" className="text-navy min-w-0 text-lg font-bold">
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
                onClick={() => toggle(category)}
                className={cn(
                  'focus-visible:ring-navy/30 relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none',
                  enabled ? 'bg-sage' : 'bg-muted-foreground/25'
                )}
              >
                <span
                  className={cn(
                    'shadow-soft absolute top-1 left-1 size-5 rounded-full bg-white transition-transform duration-200 motion-reduce:transition-none',
                    enabled && 'translate-x-5'
                  )}
                />
              </button>
            </div>
          );
        })}
      </div>
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
