'use client';

import { useState } from 'react';
import {
  Check,
  CircleAlert,
  CircleMinus,
  CloudRain,
  CloudSun,
  LockKeyhole,
  SunMedium,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MoodLevel, UrgeLevel } from '@/lib/recovery/types';

interface PrivateCheckInProps {
  initialMood?: MoodLevel;
  initialUrge?: UrgeLevel;
  onSave: (input: { mood: MoodLevel; urge: UrgeLevel }) => void;
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
}: PrivateCheckInProps) {
  const t = useTranslations('recoveryDashboard');
  const [mood, setMood] = useState<MoodLevel | null>(initialMood ?? null);
  const [urge, setUrge] = useState<UrgeLevel | null>(initialUrge ?? null);
  const [saved, setSaved] = useState(Boolean(initialMood && initialUrge));
  const [showIncomplete, setShowIncomplete] = useState(false);

  const selectMood = (value: MoodLevel) => {
    setMood(value);
    setSaved(false);
    setShowIncomplete(false);
  };

  const selectUrge = (value: UrgeLevel) => {
    setUrge(value);
    setSaved(false);
    setShowIncomplete(false);
  };

  const handleSave = () => {
    if (!mood || !urge) {
      setShowIncomplete(true);
      return;
    }
    onSave({ mood, urge });
    setSaved(true);
  };

  return (
    <section className="px-4 py-5 sm:px-5" aria-labelledby="private-check-in-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="private-check-in-title" className="text-base font-bold text-navy">
            {t('checkInTitle')}
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
            {t('checkInDescription')}
          </p>
        </div>
        {saved ? (
          <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-sage/10 px-3 text-xs font-semibold text-sage" role="status">
            <Check className="size-4" aria-hidden="true" />
            {t('checkInSaved')}
          </span>
        ) : null}
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-foreground">{t('moodQuestion')}</legend>
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
                  'flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-center text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-navy/30',
                  selected
                    ? 'border-navy bg-navy/[0.06] text-navy'
                    : 'border-border bg-white text-muted-foreground hover:border-navy/30 hover:text-navy',
                )}
              >
                <Icon className="size-6" strokeWidth={1.7} aria-hidden="true" />
                {t(labelKey)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-foreground">{t('urgeQuestion')}</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-0" role="group">
          {urgeOptions.map(({ value, labelKey }, index) => {
            const selected = urge === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => selectUrge(value)}
                className={cn(
                  'min-h-12 border px-2 py-2 text-xs font-semibold outline-none transition-colors focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-navy/30 sm:-ml-px',
                  index === 0 && 'sm:ml-0 sm:rounded-l-xl',
                  index === urgeOptions.length - 1 && 'sm:rounded-r-xl',
                  selected
                    ? 'relative z-[1] border-navy bg-navy/[0.06] text-navy'
                    : 'border-border bg-white text-muted-foreground hover:border-navy/30 hover:text-navy',
                )}
              >
                <span className="block text-sm font-bold">{value}</span>
                <span className="mt-0.5 block">{t(labelKey)}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <LockKeyhole className="mt-0.5 size-4 shrink-0 text-navy" aria-hidden="true" />
          {t('privateBrowserNote')}
        </p>
        <Button onClick={handleSave} size="lg" className="h-11 w-full sm:w-auto">
          {saved ? <Check className="size-4" aria-hidden="true" /> : null}
          {saved ? t('checkInSaved') : t('checkInSave')}
        </Button>
      </div>

      <p
        className={cn(
          'mt-3 flex items-center gap-2 text-sm font-medium text-amber',
          !showIncomplete && 'sr-only',
        )}
        role="alert"
      >
        <CircleAlert className="size-4" aria-hidden="true" />
        {t('checkInIncomplete')}
      </p>
    </section>
  );
}
