'use client';

import { useState, type KeyboardEvent } from 'react';
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
import { GamiMoodResponse } from './gami-mood-response';
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

// "No urge" is a first-class scale point (0), not an opt-out appended at the
// end — the segmented control reads as one ascending 0→5 scale.
const urgeOptions = [
  { value: 1 as const, display: 1, labelKey: 'urge1' },
  { value: 2 as const, display: 2, labelKey: 'urge2' },
  { value: 3 as const, display: 3, labelKey: 'urge3' },
  { value: 4 as const, display: 4, labelKey: 'urge4' },
  { value: 5 as const, display: 5, labelKey: 'urge5' },
] as const;

const urgeOptionId = (value: UrgeLevel | null) =>
  value === null ? 'check-in-urge-skip' : `check-in-urge-${value}`;

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

  const focusRadio = (id: string) => {
    document.getElementById(id)?.focus();
  };

  const moveMood = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (delta === 0) return;
    event.preventDefault();
    const next =
      (index + delta + moodOptions.length) % moodOptions.length;
    const value = moodOptions[next].value;
    selectMood(value);
    focusRadio(`check-in-mood-${value}`);
  };

  const moveUrge = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (delta === 0) return;
    event.preventDefault();
    const next = (index + delta + urgeOptions.length) % urgeOptions.length;
    const option = urgeOptions[next];
    selectUrge(option.value);
    focusRadio(urgeOptionId(option.value));
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
        <div
          className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5"
          role="radiogroup"
          aria-label={t('moodQuestion')}
        >
          {moodOptions.map(({ value, labelKey, icon: Icon }, index) => {
            const selected = mood === value;
            return (
              <button
                key={value}
                id={`check-in-mood-${value}`}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected || (mood === null && index === 0) ? 0 : -1}
                onKeyDown={(event) => moveMood(event, index)}
                onClick={() => selectMood(value)}
                className={cn(
                  'flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-center text-xs font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-navy/30 active:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none',
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

      {/* Persistent live region: Gami's supportive reply is announced on every
          mood change; hidden again once the check-in is saved. */}
      <div role="status" aria-live="polite" className="mt-3">
        {!saved ? <GamiMoodResponse mood={mood} urge={urge ?? null} /> : null}
      </div>

      <fieldset className="mt-4">
        <legend className="text-foreground text-sm font-semibold">{t('urgeQuestion')}</legend>
        <div
          className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-5 lg:gap-0"
          role="radiogroup"
          aria-label={t('urgeQuestion')}
        >
          {urgeOptions.map(({ value, display, labelKey }, index) => {
            const selected = urge === value;
            return (
              <button
                key={labelKey}
                id={urgeOptionId(value)}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected || (urge === undefined && index === 0) ? 0 : -1}
                onKeyDown={(event) => moveUrge(event, index)}
                onClick={() => selectUrge(value)}
                className={cn(
                  'min-h-12 rounded-xl border px-2 py-2 text-xs font-semibold outline-none transition focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-navy/30 active:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none lg:-ml-px lg:rounded-none',
                  index === 0 && 'lg:ml-0 lg:rounded-l-xl',
                  index === urgeOptions.length - 1 && 'lg:rounded-r-xl',
                  selected
                    ? 'relative z-[1] border-navy bg-azure/80 text-navy shadow-soft'
                    : 'border-border bg-card text-muted-foreground hover:border-navy/45 hover:bg-azure/35 hover:text-navy',
                )}
              >
                <span className="block text-sm font-bold">{display}</span>
                <span className="mt-0.5 block">{t(labelKey)}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="border-border mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          {showIncomplete ? (
            <p
              className="text-navy flex items-center gap-2 text-sm font-medium"
              role="alert"
            >
              <CircleAlert
                className="text-amber size-4 shrink-0"
                aria-hidden="true"
              />
              <span>{t('checkInIncomplete')}</span>
            </p>
          ) : null}
          {saveError ? (
            <p
              className="text-crimson flex items-center gap-2 text-sm font-medium"
              role="alert"
            >
              <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
              <span>{t('checkInSaveError')}</span>
            </p>
          ) : null}
        </div>
        <Button
          onClick={() => void handleSave()}
          size="lg"
          className="h-11 w-full shrink-0 sm:w-auto"
          disabled={saving}
          aria-busy={saving}
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
