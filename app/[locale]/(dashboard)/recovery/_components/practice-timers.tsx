'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Focus, Pause, Play, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { FadeSwap } from '@/components/common/fade-swap';
import type {
  RecoveryFeedback,
  RecoveryPracticeKind,
} from '@/hooks/use-recovery-experience';
import {
  BREATHING_PACK_IDS,
  BREATHING_PACKS,
  isExpandedAt,
  packCycleSeconds,
  phaseIndexAt,
  type BreathingPackId,
} from '@/lib/recovery/breathing-packs';
import { toastError, toastSuccess } from '@/lib/feedback';

type PracticeInput = {
  practice_kind: RecoveryPracticeKind;
  duration_seconds: number;
  feedback?: RecoveryFeedback;
};

export function formatTimer(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

const FOCUS_DURATIONS = [600, 900, 1500] as const;

/**
 * Shared countdown practice. The urge-surfing variant adds a selectable
 * breathing pack whose wave disc expands and contracts in sync with the
 * current phase — driven by the same 1s interval, no extra timers. Reduced
 * motion parks the disc and keeps the text cues.
 */
export function TimedPractice({
  kind,
  seconds,
  onComplete,
  saving,
}: {
  kind: RecoveryPracticeKind;
  seconds: number;
  onComplete: (input: PracticeInput) => Promise<unknown>;
  saving: boolean;
}) {
  const t = useTranslations('recoveryRoom');
  const reduce = useReducedMotion();
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const [feedback, setFeedback] = useState<RecoveryFeedback>('prefer_not_say');
  const [packId, setPackId] = useState<BreathingPackId>('box');

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const interval = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [remaining, running]);

  const breathing = kind === 'urge_surfing';
  const progress = Math.round(((seconds - remaining) / seconds) * 100);
  const active = running && remaining > 0;

  const pack = BREATHING_PACKS[packId];
  const cyclePosition = active ? (seconds - remaining) % packCycleSeconds(pack) : 0;
  const phaseIndex = phaseIndexAt(pack, cyclePosition);
  const expanded = active && isExpandedAt(pack, phaseIndex);
  const breathPhaseKey = pack[phaseIndex].key;

  const phase = breathing
    ? active
      ? t(`phase.${breathPhaseKey}`)
      : t(
          `urgePhases.${progress < 34 ? 'notice' : progress < 67 ? 'breathe' : 'observe'}`
        )
    : t('focusStay');

  const save = async () => {
    try {
      await onComplete({
        practice_kind: kind,
        duration_seconds: seconds,
        feedback,
      });
      toastSuccess(t('practiceSaved'));
    } catch (error) {
      toastError(error, t('practiceSaveError'));
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-center">
      <div className="bg-navy relative mx-auto flex aspect-square w-full max-w-52 items-center justify-center overflow-hidden rounded-full p-5 text-center text-white shadow-[inset_0_0_0_12px_rgba(255,255,255,0.08)] sm:max-w-64">
        {breathing ? (
          <motion.div
            aria-hidden="true"
            className="bg-cyan/15 absolute inset-6 rounded-full"
            animate={{ scale: reduce || !active ? 1 : expanded ? 1.3 : 0.95 }}
            transition={{
              duration: reduce ? 0 : pack[phaseIndex].seconds,
              ease: 'easeInOut',
            }}
          />
        ) : null}
        <div
          className="border-cyan/25 absolute inset-3 rounded-full border-4"
          aria-hidden="true"
        />
        <div className="relative">
          <p className="font-mono text-4xl font-bold tabular-nums">
            {formatTimer(remaining)}
          </p>
          <FadeSwap swapKey={phase}>
            <p className="mt-2 text-xs text-white/70">{phase}</p>
          </FadeSwap>
        </div>
      </div>
      <div>
        {breathing ? (
          <fieldset className="mb-4">
            <legend className="text-navy text-sm font-bold">
              {t('breathingPackLabel')}
            </legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {BREATHING_PACK_IDS.map((candidate) => (
                <button
                  key={candidate}
                  type="button"
                  onClick={() => setPackId(candidate)}
                  aria-pressed={packId === candidate}
                  className={`focus-visible:ring-navy/30 min-h-11 cursor-pointer rounded-xl border px-2 text-xs font-bold outline-none focus-visible:ring-2 ${packId === candidate ? 'border-navy bg-navy text-white shadow-sm' : 'border-border text-muted-foreground hover:text-navy'}`}
                >
                  {t(`breathingPack.${candidate}`)}
                  <span className="block text-[10px] font-semibold opacity-70">
                    {t(`breathingPackHint.${candidate}`)}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}
        <div className="bg-cyan/8 border-cyan/25 rounded-2xl border p-4">
          <p className="text-navy font-semibold">{phase}</p>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {kind === 'urge_surfing'
              ? t('urgeInstruction')
              : t('focusInstruction')}
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button
            className="w-full sm:w-auto"
            onClick={() => setRunning((value) => !value)}
            disabled={remaining === 0}
          >
            {active ? (
              <Pause className="size-4" aria-hidden="true" />
            ) : (
              <Play className="size-4" aria-hidden="true" />
            )}
            {active
              ? t('pause')
              : remaining === seconds
                ? t('start')
                : t('continue')}
          </Button>
          <Button
            className="w-full sm:w-auto"
            variant="outline"
            onClick={() => {
              setRemaining(seconds);
              setRunning(false);
            }}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            {t('reset')}
          </Button>
        </div>
        {remaining === 0 ? (
          <FeedbackPicker
            value={feedback}
            onChange={setFeedback}
            onSave={() => void save()}
            saving={saving}
          />
        ) : null}
      </div>
    </div>
  );
}

const GROUNDING_STEPS = ['see', 'touch', 'hear', 'smell', 'taste'] as const;

export function GroundingPractice({
  onComplete,
  saving,
}: {
  onComplete: (input: PracticeInput) => Promise<unknown>;
  saving: boolean;
}) {
  const t = useTranslations('recoveryRoom');
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState<RecoveryFeedback>('prefer_not_say');
  // Optional per-sense words. Component state only: never persisted, never
  // sent anywhere, gone when the sheet closes.
  const [notes, setNotes] = useState<string[]>(['', '', '', '', '']);
  const completed = step >= GROUNDING_STEPS.length;
  const capturedNotes = notes.filter((note) => note.trim() !== '');

  const save = async () => {
    try {
      await onComplete({
        practice_kind: 'grounding_54321',
        duration_seconds: 120,
        feedback,
      });
      toastSuccess(t('practiceSaved'));
    } catch (error) {
      toastError(error, t('practiceSaveError'));
    }
  };

  return (
    <div>
      <div className="flex gap-2" aria-label={t('stepProgress')}>
        {GROUNDING_STEPS.map((item, index) => (
          <span
            key={item}
            className={`h-2 flex-1 rounded-full transition-colors duration-200 motion-reduce:transition-none ${index < step ? 'bg-sage' : index === step ? 'bg-navy' : 'bg-muted'}`}
          />
        ))}
      </div>
      {!completed ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-[6rem_1fr] sm:items-center">
          <div className="bg-sage/15 text-sage mx-auto flex size-24 items-center justify-center rounded-3xl text-4xl font-bold sm:mx-0">
            {5 - step}
          </div>
          <div>
            <p className="text-navy text-xl font-bold">
              {t(`groundingSteps.${GROUNDING_STEPS[step]}.title`)}
            </p>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {t(`groundingSteps.${GROUNDING_STEPS[step]}.body`)}
            </p>
            <label className="mt-3 block">
              <span className="text-muted-foreground text-xs font-semibold">
                {t('groundingInputLabel')}
              </span>
              <input
                value={notes[step]}
                onChange={(event) =>
                  setNotes((current) =>
                    current.map((note, index) =>
                      index === step ? event.target.value : note
                    )
                  )
                }
                placeholder={t('groundingInputHint')}
                className="border-input bg-card focus-visible:ring-navy/30 mt-1 h-11 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
              />
            </label>
            <p className="text-muted-foreground mt-1.5 text-xs leading-5">
              {t('groundingPrivateNote')}
            </p>
            <Button
              className="mt-4 w-full sm:w-auto"
              onClick={() => setStep((value) => value + 1)}
            >
              <Check className="size-4" aria-hidden="true" />
              {t('groundingDone')}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {capturedNotes.length > 0 ? (
            <div className="bg-azure/40 border-navy/10 mt-5 rounded-xl border p-3">
              <p className="text-navy text-xs font-bold">
                {t('groundingYourWords')}
              </p>
              <p className="text-muted-foreground mt-1 text-sm leading-6">
                {capturedNotes.join(' · ')}
              </p>
            </div>
          ) : null}
          <FeedbackPicker
            value={feedback}
            onChange={setFeedback}
            onSave={() => void save()}
            saving={saving}
          />
        </div>
      )}
    </div>
  );
}

export function FocusPractice({
  onComplete,
  saving,
}: {
  onComplete: (input: PracticeInput) => Promise<unknown>;
  saving: boolean;
}) {
  const t = useTranslations('recoveryRoom');
  const [task, setTask] = useState('');
  const [seconds, setSeconds] = useState<number>(FOCUS_DURATIONS[0]);
  const [started, setStarted] = useState(false);
  const storageKey = 'gamblock_recovery_focus_task_v1';

  const prepare = () => {
    const saved = window.localStorage.getItem(storageKey) ?? '';
    setTask(saved);
    setStarted(true);
  };

  if (!started) {
    return (
      <div className="bg-azure/40 border-navy/15 rounded-2xl border p-4 sm:p-5">
        <label htmlFor="focus-task" className="text-navy text-sm font-bold">
          {t('focusTaskLabel')}
        </label>
        <input
          id="focus-task"
          value={task}
          onChange={(event) => {
            setTask(event.target.value);
            window.localStorage.setItem(storageKey, event.target.value);
          }}
          placeholder={t('focusTaskPlaceholder')}
          className="border-input bg-card focus-visible:ring-navy/30 mt-2 h-12 w-full rounded-xl border px-4 text-base outline-none focus-visible:ring-2"
        />
        <p className="text-muted-foreground mt-2 text-xs leading-5">
          {t('focusLocal')}
        </p>
        <fieldset className="mt-4">
          <legend className="text-navy text-sm font-bold">
            {t('focusDurationLabel')}
          </legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {FOCUS_DURATIONS.map((candidate) => (
              <button
                key={candidate}
                type="button"
                onClick={() => setSeconds(candidate)}
                aria-pressed={seconds === candidate}
                className={`focus-visible:ring-navy/30 min-h-11 cursor-pointer rounded-xl border text-sm font-bold outline-none focus-visible:ring-2 ${seconds === candidate ? 'border-navy bg-navy text-white shadow-sm' : 'border-border text-muted-foreground hover:text-navy'}`}
              >
                {t('focusDurationMinutes', { count: candidate / 60 })}
              </button>
            ))}
          </div>
        </fieldset>
        <Button
          className="mt-4 w-full sm:w-auto"
          disabled={!task.trim()}
          onClick={prepare}
        >
          <Focus className="size-4" aria-hidden="true" />
          {t('focusPrepare')}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-muted/45 mb-4 flex items-center gap-3 rounded-xl px-4 py-3">
        <Focus className="text-navy-light size-5" aria-hidden="true" />
        <p className="text-navy font-semibold">{task}</p>
      </div>
      <TimedPractice
        key={seconds}
        kind="focus_sprint"
        seconds={seconds}
        onComplete={onComplete}
        saving={saving}
      />
    </div>
  );
}

export function FeedbackPicker({
  value,
  onChange,
  onSave,
  saving,
}: {
  value: RecoveryFeedback;
  onChange: (value: RecoveryFeedback) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const t = useTranslations('recoveryRoom');
  const values: RecoveryFeedback[] = [
    'lighter',
    'same',
    'heavier',
    'prefer_not_say',
  ];
  return (
    <div className="mt-5">
      <p className="text-navy text-sm font-bold">{t('feedbackTitle')}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {values.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={`focus-visible:ring-navy/30 min-h-11 cursor-pointer rounded-xl border px-3 text-sm font-semibold outline-none transition-colors duration-200 focus-visible:ring-2 motion-reduce:transition-none ${value === item ? 'border-navy bg-navy text-white shadow-sm' : 'border-border text-muted-foreground'}`}
          >
            {t(`feedback.${item}`)}
          </button>
        ))}
      </div>
      <Button
        className="mt-4 w-full sm:w-auto"
        disabled={saving}
        onClick={onSave}
      >
        <Check className="size-4" aria-hidden="true" />
        {saving ? t('saving') : t('savePractice')}
      </Button>
    </div>
  );
}
