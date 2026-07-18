'use client';

import { useState } from 'react';
import {
  Check,
  CircleAlert,
  CircleMinus,
  CloudRain,
  CloudSun,
  SunMedium,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  DailyCheckIn,
  MoodLevel,
  UrgeLevel,
} from '@/lib/recovery/types';

interface PrivateCheckInProps {
  initialMood?: MoodLevel;
  initialUrge?: UrgeLevel | null;
  onSave: (
    input: { mood: MoodLevel; urge: UrgeLevel | null },
  ) => DailyCheckIn | null | Promise<DailyCheckIn | null>;
  showHeader?: boolean;
}

const moodOptions = [
  { value: 1 as const, labelKey: 'mood1', icon: CircleAlert },
  { value: 2 as const, labelKey: 'mood2', icon: CloudRain },
  { value: 3 as const, labelKey: 'mood3', icon: CircleMinus },
  { value: 4 as const, labelKey: 'mood4', icon: CloudSun },
  { value: 5 as const, labelKey: 'mood5', icon: SunMedium },
] as const;

const urgeOptions = [
  { value: 1 as const, labelKey: 'urge1' },
  { value: 2 as const, labelKey: 'urge2' },
  { value: 3 as const, labelKey: 'urge3' },
  { value: 4 as const, labelKey: 'urge4' },
  { value: 5 as const, labelKey: 'urge5' },
] as const;

export function PrivateCheckIn({
  initialMood,
  initialUrge,
  onSave,
  showHeader = true,
}: PrivateCheckInProps) {
  const t = useTranslations('recoveryDashboard');
  const [mood, setMood] = useState<MoodLevel | null>(initialMood ?? null);
  const [urge, setUrge] = useState<UrgeLevel | null | undefined>(initialUrge);
  const [saved, setSaved] = useState(
    Boolean(initialMood && initialUrge !== undefined),
  );
  const [showIncomplete, setShowIncomplete] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectMood = (value: MoodLevel) => {
    setMood(value);
    setSaved(false);
    setShowIncomplete(false);
    setSaveError(false);
  };

  const selectUrge = (value: UrgeLevel | null) => {
    setUrge(value);
    setSaved(false);
    setShowIncomplete(false);
    setSaveError(false);
  };

  const handleSave = async () => {
    if (!mood || urge === undefined) {
      setShowIncomplete(true);
      return;
    }
    setSaving(true);
    setSaveError(false);
    let savedCheckIn: DailyCheckIn | null = null;
    try {
      savedCheckIn = await onSave({ mood, urge });
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }

    if (savedCheckIn) {
      setSaved(true);
    } else {
      setSaveError(true);
    }
  };

  return (
    <section
      className="p-4 sm:px-5 sm:py-4"
      aria-labelledby={showHeader ? 'private-check-in-title' : undefined}
    >
      {showHeader ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="private-check-in-title" className="text-navy text-base font-bold">
              {t('checkInTitle')}
            </h2>
            <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-6">
              {t('checkInDescription')}
            </p>
          </div>
          {saved ? (
            <span className="bg-sage/10 text-sage inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold" role="status">
              <Check className="size-4" aria-hidden="true" />
              {t('checkInSaved')}
            </span>
          ) : null}
        </div>
      ) : null}

      <fieldset className={showHeader ? 'mt-4' : undefined}>
        <legend className="text-foreground text-sm font-semibold">{t('moodQuestion')}</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5" role="group">
          {moodOptions.map(({ value, labelKey, icon: Icon }) => {
            const selected = mood === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => selectMood(value)}
                className={cn(
                  'flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-center text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-navy/30',
                  selected
                    ? 'border-navy bg-azure/80 text-navy shadow-soft'
                    : 'border-border bg-card text-muted-foreground hover:border-navy/45 hover:bg-azure/35 hover:text-navy',
                )}
              >
                <Icon className="size-5" strokeWidth={1.7} aria-hidden="true" />
                {t(labelKey)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-4">
        <legend className="text-foreground text-sm font-semibold">{t('urgeQuestion')}</legend>
        <div
          className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 lg:gap-0"
          role="group"
        >
          {urgeOptions.map(({ value, labelKey }, index) => {
            const selected = urge === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => selectUrge(value)}
                className={cn(
                  'min-h-12 rounded-xl border px-2 py-2 text-xs font-semibold outline-none transition-colors focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-navy/30 lg:-ml-px lg:rounded-none',
                  index === 0 && 'lg:ml-0 lg:rounded-l-xl',
                  selected
                    ? 'relative z-[1] border-navy bg-azure/80 text-navy shadow-soft'
                    : 'border-border bg-card text-muted-foreground hover:border-navy/45 hover:bg-azure/35 hover:text-navy',
                )}
              >
                <span className="block text-sm font-bold">{value}</span>
                <span className="mt-0.5 block">{t(labelKey)}</span>
              </button>
            );
          })}
          <button
            type="button"
            aria-pressed={urge === null}
            onClick={() => selectUrge(null)}
            className={cn(
              'min-h-12 rounded-xl border px-2 py-2 text-xs font-semibold outline-none transition-colors focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-navy/30 lg:-ml-px lg:rounded-l-none lg:rounded-r-xl',
              urge === null
                ? 'relative z-[1] border-navy bg-azure/80 text-navy shadow-soft'
                : 'border-border bg-card text-muted-foreground hover:border-navy/45 hover:bg-azure/35 hover:text-navy',
            )}
          >
            {t('urgePreferNotSay')}
          </button>
        </div>
      </fieldset>

      <div className="border-border mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <p
            className={cn(
              'flex items-center gap-2 text-sm font-medium text-amber',
              !showIncomplete && 'hidden',
            )}
            role="alert"
          >
            <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
            <span>{t('checkInIncomplete')}</span>
          </p>
          <p
            className={cn(
              'flex items-center gap-2 text-sm font-medium text-crimson',
              !saveError && 'hidden',
            )}
            role="alert"
          >
            <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
            <span>{t('checkInSaveError')}</span>
          </p>
        </div>
        <Button
          onClick={() => void handleSave()}
          size="lg"
          className="h-11 w-full shrink-0 sm:w-auto"
          disabled={saving}
        >
          {saved ? <Check className="size-4" aria-hidden="true" /> : null}
          {saving
            ? t('checkInSaving')
            : saved
              ? t('checkInSaved')
              : t('checkInSave')}
        </Button>
      </div>
    </section>
  );
}
