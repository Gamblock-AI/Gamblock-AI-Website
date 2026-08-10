'use client';

import { type KeyboardEvent } from 'react';
import {
  CircleAlert,
  CircleMinus,
  CloudRain,
  CloudSun,
  SunMedium,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { MoodLevel, UrgeLevel } from '@/lib/recovery/types';
import { cn } from '@/lib/utils';

interface CheckInFieldsProps {
  mood: MoodLevel | null;
  urge: UrgeLevel | null | undefined;
  onMoodChange: (mood: MoodLevel) => void;
  onUrgeChange: (urge: UrgeLevel | null) => void;
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

/**
 * Controlled mood/urge selection used inside the merged onboarding/check-in
 * wizard. The parent owns the values and decides when to persist the check-in.
 */
export function CheckInFields({
  mood,
  urge,
  onMoodChange,
  onUrgeChange,
}: CheckInFieldsProps) {
  const t = useTranslations('recoveryDashboard');

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
    const next = (index + delta + moodOptions.length) % moodOptions.length;
    const value = moodOptions[next].value;
    onMoodChange(value);
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
    onUrgeChange(option.value);
    focusRadio(urgeOptionId(option.value));
  };

  return (
    <>
      <fieldset>
        <legend className="text-foreground text-sm font-semibold">
          {t('moodQuestion')}
        </legend>
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
                onClick={() => onMoodChange(value)}
                className={cn(
                  'flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-center text-xs font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-navy/30 active:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none',
                  selected
                    ? 'border-navy bg-azure/80 text-navy shadow-soft'
                    : 'border-border bg-card text-muted-foreground hover:border-navy/45 hover:bg-azure/35 hover:text-navy'
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
        <legend className="text-foreground text-sm font-semibold">
          {t('urgeQuestion')}
        </legend>
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
                onClick={() => onUrgeChange(value)}
                className={cn(
                  'min-h-12 rounded-xl border px-2 py-2 text-xs font-semibold outline-none transition focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-navy/30 active:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none lg:-ml-px lg:rounded-none',
                  index === 0 && 'lg:ml-0 lg:rounded-l-xl',
                  index === urgeOptions.length - 1 && 'lg:rounded-r-xl',
                  selected
                    ? 'relative z-[1] border-navy bg-azure/80 text-navy shadow-soft'
                    : 'border-border bg-card text-muted-foreground hover:border-navy/45 hover:bg-azure/35 hover:text-navy'
                )}
              >
                <span className="block text-sm font-bold">{display}</span>
                <span className="mt-0.5 block">{t(labelKey)}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </>
  );
}
