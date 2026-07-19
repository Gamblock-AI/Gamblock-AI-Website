'use client';

import { type FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Check,
  Clock3,
  Focus,
  HandHeart,
  Headphones,
  LampDesk,
  Leaf,
  LockKeyhole,
  MessageCircleMore,
  NotebookPen,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Waves,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useRecoveryExperience,
  type RecoveryFeedback,
  type RecoveryPracticeKind,
} from '@/hooks/use-recovery-experience';
import { useRecoveryJourney } from '@/hooks/use-recovery-journey';
import { useReflections } from '@/hooks/use-reflections';
import { Link } from '@/i18n/routing';
import { toastError, toastSuccess } from '@/lib/feedback';
import { ROUTES } from '@/routes';

type RoomActivity = 'urge' | 'grounding' | 'focus' | 'journal' | 'support';

const ACTIVITY_CONFIG: Record<
  RoomActivity,
  {
    icon: typeof Waves;
    hotspot: string;
    tone: string;
  }
> = {
  urge: {
    icon: Waves,
    hotspot: 'left-[49%] top-[30%]',
    tone: 'bg-cyan text-navy',
  },
  grounding: {
    icon: Leaf,
    hotspot: 'left-[48%] top-[66%]',
    tone: 'bg-sage text-white',
  },
  focus: {
    icon: Clock3,
    hotspot: 'left-[84%] top-[42%]',
    tone: 'bg-amber text-navy',
  },
  journal: {
    icon: NotebookPen,
    hotspot: 'left-[72%] top-[82%]',
    tone: 'bg-sage text-white',
  },
  support: {
    icon: MessageCircleMore,
    hotspot: 'left-[89%] top-[80%]',
    tone: 'bg-navy text-white',
  },
};

const DECOR_ICONS: Record<string, typeof Leaf> = {
  plant: Leaf,
  curtain: Waves,
  desk_lamp: LampDesk,
  note_board: NotebookPen,
  wall_art: Sparkles,
  gami_figure: HandHeart,
};

const DECOR_PLACEMENTS: Record<string, string> = {
  plant: 'left-[20%] top-[57%]',
  curtain: 'left-[45%] top-[18%]',
  desk_lamp: 'left-[80%] top-[47%]',
  note_board: 'left-[70%] top-[33%]',
  wall_art: 'left-[25%] top-[28%]',
  gami_figure: 'left-[62%] top-[72%]',
};

export function RecoveryRoom() {
  const t = useTranslations('recoveryRoom');
  const reduceMotion = useReducedMotion();
  const experience = useRecoveryExperience();
  const [activity, setActivity] = useState<RoomActivity | null>(null);

  const openActivity = (next: RoomActivity) => {
    setActivity(next);
  };

  return (
    <div className="space-y-5">
      <section
        className="border-border bg-navy relative isolate overflow-hidden rounded-3xl border shadow-[0_24px_70px_-38px_rgba(23,38,77,0.7)] md:rounded-[2rem]"
        aria-labelledby="room-heading"
      >
        <div className="bg-navy md:from-navy/90 md:via-navy/55 relative z-20 flex flex-col items-start gap-4 p-4 text-white md:absolute md:inset-x-0 md:top-0 md:flex-row md:justify-between md:bg-transparent md:bg-gradient-to-b md:to-transparent md:p-7 md:pb-20">
          <div className="min-w-0">
            <p className="text-cyan text-xs font-bold tracking-[0.16em] uppercase">
              {t('eyebrow')}
            </p>
            <h2
              id="room-heading"
              className="mt-2 text-2xl font-bold sm:text-3xl"
            >
              {t('title')}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
              {t('description')}
            </p>
          </div>
          <div className="bg-navy/55 flex shrink-0 items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-xs text-white/85 backdrop-blur">
            <LockKeyhole className="text-cyan size-4" aria-hidden="true" />
            {t('syncedPrivate')}
          </div>
        </div>

        <div className="relative aspect-[4/3] md:aspect-[16/9]">
          <Image
            src="/images/recovery-room/calm-dorm-room.webp"
            alt={t('roomAlt')}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="object-cover"
          />
          <div
            className="from-navy/80 to-navy/5 absolute inset-0 bg-gradient-to-t via-transparent"
            aria-hidden="true"
          />

          {Object.entries(experience.space.data?.placed_items ?? {})
            .filter(([, placed]) => Boolean(placed))
            .map(([item]) => {
              const Icon = DECOR_ICONS[item] ?? Sparkles;
              return (
                <motion.div
                  key={item}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${DECOR_PLACEMENTS[item] ?? 'top-1/2 left-1/2'} bg-card/90 text-navy absolute z-[5] hidden size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/80 shadow-lg backdrop-blur md:flex`}
                  aria-label={t('placedDecor', { item: t(`decor.${item}`) })}
                >
                  <Icon className="text-sage size-5" aria-hidden="true" />
                </motion.div>
              );
            })}

          <div className="hidden md:block">
            {(Object.keys(ACTIVITY_CONFIG) as RoomActivity[]).map(
              (key, index) => {
                const config = ACTIVITY_CONFIG[key];
                const Icon = config.icon;
                return (
                  <motion.button
                    key={key}
                    type="button"
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: reduceMotion ? 0 : 0.12 + index * 0.05,
                      duration: 0.2,
                    }}
                    onClick={() => openActivity(key)}
                    data-activity-trigger={key}
                    className={`${config.hotspot} focus-visible:ring-cyan absolute z-10 flex size-14 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-4 border-white/90 shadow-[0_10px_35px_rgba(23,38,77,0.45)] transition-transform outline-none hover:scale-105 focus-visible:ring-4 focus-visible:ring-offset-2 motion-reduce:transition-none ${config.tone}`}
                    aria-label={t(`activities.${key}.label`)}
                  >
                    <Icon className="size-6" aria-hidden="true" />
                    <span className="bg-navy/90 absolute top-full mt-2 w-max max-w-40 rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur">
                      {t(`activities.${key}.short`)}
                    </span>
                  </motion.button>
                );
              }
            )}
          </div>

          <div className="bg-navy/90 absolute bottom-3 left-1/2 z-20 hidden w-[min(46rem,calc(100%-3rem))] -translate-x-1/2 grid-cols-5 gap-2 rounded-2xl border border-white/15 p-2 shadow-2xl backdrop-blur-md md:grid">
            {(Object.keys(ACTIVITY_CONFIG) as RoomActivity[]).map((key) => {
              const Icon = ACTIVITY_CONFIG[key].icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => openActivity(key)}
                  data-activity-trigger={key}
                  className="focus-visible:ring-cyan flex min-h-12 cursor-pointer items-center justify-center gap-1 rounded-xl px-3 text-xs font-semibold text-white/80 transition-colors outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2"
                >
                  <Icon
                    className="text-cyan size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="line-clamp-1">
                    {t(`activities.${key}.dock`)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 p-3 md:hidden">
          {(Object.keys(ACTIVITY_CONFIG) as RoomActivity[]).map((key) => {
            const config = ACTIVITY_CONFIG[key];
            const Icon = config.icon;
            return (
              <button
                key={key}
                type="button"
                onClick={() => openActivity(key)}
                data-activity-trigger={key}
                className={`focus-visible:ring-cyan flex min-h-20 cursor-pointer items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.08] p-3 text-left text-sm leading-5 font-semibold text-white transition-colors outline-none hover:bg-white/[0.14] focus-visible:ring-2 active:bg-white/[0.16] ${key === 'support' ? 'col-span-2' : ''}`}
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${config.tone}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span>{t(`activities.${key}.label`)}</span>
              </button>
            );
          })}
        </div>
      </section>

      <RoomCollection
        unlockedItems={experience.space.data?.unlocked_items ?? []}
        placedItems={experience.space.data?.placed_items ?? {}}
        loading={experience.space.loading}
        saving={experience.saving}
        onToggle={experience.updateSpace}
      />
      <LegacyIntentionOffer />

      {activity ? (
        <ActivitySheet
          key={activity}
          activity={activity}
          reduceMotion={reduceMotion}
          onClose={() => setActivity(null)}
          onComplete={experience.completePractice}
          saving={experience.saving}
        />
      ) : null}
    </div>
  );
}

function LegacyIntentionOffer() {
  const t = useTranslations('recoveryRoom');
  const journey = useRecoveryJourney();
  const journal = useReflections();
  const [hidden, setHidden] = useState(false);
  const storageKey = 'gamblock_intention_migration_v1';
  const handled =
    hidden ||
    (typeof window !== 'undefined' &&
      window.localStorage.getItem(storageKey) === 'handled');
  const intention = journey.activeIntention;

  if (!intention || handled) return null;

  const finish = () => {
    window.localStorage.setItem(storageKey, 'handled');
    setHidden(true);
  };

  const importAsDraft = async () => {
    try {
      await journal.createReflection({
        text: t('legacyJournalText'),
        next_step: intention.title,
        is_focus: true,
      });
      finish();
      toastSuccess(t('legacyImported'));
    } catch (error) {
      toastError(error, t('journalSaveError'));
    }
  };

  return (
    <section className="border-amber/35 bg-amber/[0.08] flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-navy font-bold">{t('legacyTitle')}</h3>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-6">
          {t('legacyBody')}
        </p>
        <p className="text-navy mt-2 text-sm font-semibold">
          “{intention.title}”
        </p>
      </div>
      <div className="grid w-full shrink-0 gap-2 sm:flex sm:w-auto sm:flex-wrap">
        <Button className="w-full sm:w-auto" variant="outline" onClick={finish}>
          {t('legacyDismiss')}
        </Button>
        <Button
          className="w-full sm:w-auto"
          onClick={() => void importAsDraft()}
        >
          {t('legacyImport')}
        </Button>
      </div>
    </section>
  );
}

function RoomCollection({
  unlockedItems,
  placedItems,
  loading,
  saving,
  onToggle,
}: {
  unlockedItems: string[];
  placedItems: Record<string, unknown>;
  loading: boolean;
  saving: boolean;
  onToggle: (items: Record<string, unknown>) => Promise<unknown>;
}) {
  const t = useTranslations('recoveryRoom');

  const toggle = async (item: string) => {
    const next = { ...placedItems };
    if (next[item]) {
      delete next[item];
    } else {
      next[item] = true;
    }
    try {
      await onToggle(next);
      toastSuccess(t(next[item] ? 'decorPlaced' : 'decorRemoved'));
    } catch (error) {
      toastError(error, t('decorSaveError'));
    }
  };

  return (
    <section className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div>
        <h3 className="text-navy font-bold">{t('collectionTitle')}</h3>
        <p className="text-muted-foreground mt-1 text-sm leading-6">
          {t('collectionBody')}
        </p>
        <p className="text-navy/70 mt-1 text-xs">{t('collectionHint')}</p>
      </div>
      <div
        className="grid min-h-12 w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center"
        aria-live="polite"
      >
        {loading ? (
          <span className="text-muted-foreground col-span-2 text-sm">
            {t('loading')}
          </span>
        ) : null}
        {!loading && unlockedItems.length === 0 ? (
          <span className="border-border bg-muted/35 text-muted-foreground col-span-2 rounded-xl border border-dashed px-3 py-2 text-xs">
            {t('collectionEmpty')}
          </span>
        ) : null}
        {unlockedItems.map((item) => {
          const Icon = DECOR_ICONS[item] ?? Sparkles;
          const placed = Boolean(placedItems[item]);
          return (
            <button
              key={item}
              type="button"
              disabled={saving}
              onClick={() => void toggle(item)}
              className={`focus-visible:ring-navy/30 flex min-h-11 w-full min-w-0 cursor-pointer items-center justify-start gap-2 rounded-xl border px-3 text-left text-xs font-semibold outline-none focus-visible:ring-2 disabled:cursor-wait disabled:opacity-60 sm:w-auto ${placed ? 'border-navy bg-navy text-white' : 'border-sage/30 bg-sage/10 text-navy'}`}
              aria-pressed={placed}
            >
              <Icon
                className={`size-4 ${placed ? 'text-cyan' : 'text-sage'}`}
                aria-hidden="true"
              />
              {t(`decor.${item}`)}
              <span className="sr-only">
                {t(placed ? 'removeDecor' : 'placeDecor')}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ActivitySheet({
  activity,
  reduceMotion,
  onClose,
  onComplete,
  saving,
}: {
  activity: RoomActivity;
  reduceMotion: boolean | null;
  onClose: () => void;
  onComplete: (input: {
    practice_kind: RecoveryPracticeKind;
    duration_seconds: number;
    feedback?: RecoveryFeedback;
  }) => Promise<unknown>;
  saving: boolean;
}) {
  const t = useTranslations('recoveryRoom');
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPortal>
        <DialogOverlay
          data-testid="recovery-activity-backdrop"
          className="bg-navy/55 z-[80] backdrop-blur-sm"
        />
        <DialogPrimitive.Viewport className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto overscroll-contain pt-[max(0.75rem,env(safe-area-inset-top))] md:items-center md:p-6">
          <DialogPrimitive.Popup
            data-testid="recovery-activity-dialog"
            render={
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
              />
            }
            className="ring-foreground/10 bg-card text-popover-foreground relative flex max-h-[calc(100dvh-env(safe-area-inset-top)-0.75rem)] w-full max-w-none flex-col overflow-hidden rounded-t-[2rem] shadow-2xl ring-1 outline-none md:max-h-[calc(100dvh-3rem)] md:w-[min(48rem,calc(100vw-3rem))] md:rounded-[2rem]"
          >
            <DialogHeader className="border-border bg-card relative shrink-0 border-b p-4 pr-16 text-left sm:p-7 sm:pr-20">
              <p className="text-cyan-dark text-xs font-bold tracking-[0.14em] uppercase">
                {t('sheetEyebrow')}
              </p>
              <DialogTitle
                id="activity-title"
                className="text-navy mt-1 text-xl leading-tight font-bold sm:text-2xl"
              >
                {t(`activities.${activity}.label`)}
              </DialogTitle>
              <DialogDescription className="mt-1 max-w-xl text-sm leading-6">
                {t(`activities.${activity}.body`)}
              </DialogDescription>
              <DialogClose
                className="border-border text-muted-foreground hover:bg-muted hover:text-navy focus-visible:ring-navy/30 absolute top-4 right-4 flex size-11 cursor-pointer items-center justify-center rounded-full border transition-colors outline-none focus-visible:ring-2 sm:top-7 sm:right-7"
                aria-label={t('close')}
              >
                <X className="size-5" aria-hidden="true" />
              </DialogClose>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-7">
              {activity === 'urge' ? (
                <TimedPractice
                  kind="urge_surfing"
                  seconds={180}
                  onComplete={onComplete}
                  saving={saving}
                />
              ) : null}
              {activity === 'grounding' ? (
                <GroundingPractice onComplete={onComplete} saving={saving} />
              ) : null}
              {activity === 'focus' ? (
                <FocusPractice onComplete={onComplete} saving={saving} />
              ) : null}
              {activity === 'journal' ? <RoomJournal /> : null}
              {activity === 'support' ? <SupportChoices /> : null}
            </div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
      </DialogPortal>
    </Dialog>
  );
}

function TimedPractice({
  kind,
  seconds,
  onComplete,
  saving,
}: {
  kind: RecoveryPracticeKind;
  seconds: number;
  onComplete: (input: {
    practice_kind: RecoveryPracticeKind;
    duration_seconds: number;
    feedback?: RecoveryFeedback;
  }) => Promise<unknown>;
  saving: boolean;
}) {
  const t = useTranslations('recoveryRoom');
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const [feedback, setFeedback] = useState<RecoveryFeedback>('prefer_not_say');

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const interval = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [remaining, running]);

  const progress = Math.round(((seconds - remaining) / seconds) * 100);
  const active = running && remaining > 0;
  const phase =
    kind === 'urge_surfing'
      ? t(
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
      <div className="bg-navy relative mx-auto flex aspect-square w-full max-w-52 items-center justify-center rounded-full p-5 text-center text-white shadow-[inset_0_0_0_12px_rgba(255,255,255,0.08)] sm:max-w-64">
        <div
          className="border-cyan/25 absolute inset-3 rounded-full border-4"
          aria-hidden="true"
        />
        <div>
          <p className="font-mono text-4xl font-bold tabular-nums">
            {formatTimer(remaining)}
          </p>
          <p className="mt-2 text-xs text-white/70">{phase}</p>
        </div>
      </div>
      <div>
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

function GroundingPractice({
  onComplete,
  saving,
}: {
  onComplete: (input: {
    practice_kind: RecoveryPracticeKind;
    duration_seconds: number;
    feedback?: RecoveryFeedback;
  }) => Promise<unknown>;
  saving: boolean;
}) {
  const t = useTranslations('recoveryRoom');
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState<RecoveryFeedback>('prefer_not_say');
  const completed = step >= GROUNDING_STEPS.length;

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
            className={`h-2 flex-1 rounded-full ${index < step ? 'bg-sage' : index === step ? 'bg-cyan' : 'bg-muted'}`}
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
            <Button
              className="mt-5 w-full sm:w-auto"
              onClick={() => setStep((value) => value + 1)}
            >
              <Check className="size-4" aria-hidden="true" />
              {t('groundingDone')}
            </Button>
          </div>
        </div>
      ) : (
        <FeedbackPicker
          value={feedback}
          onChange={setFeedback}
          onSave={() => void save()}
          saving={saving}
        />
      )}
    </div>
  );
}

function FocusPractice({
  onComplete,
  saving,
}: {
  onComplete: (input: {
    practice_kind: RecoveryPracticeKind;
    duration_seconds: number;
    feedback?: RecoveryFeedback;
  }) => Promise<unknown>;
  saving: boolean;
}) {
  const t = useTranslations('recoveryRoom');
  const [task, setTask] = useState('');
  const [started, setStarted] = useState(false);
  const storageKey = 'gamblock_recovery_focus_task_v1';

  const prepare = () => {
    const saved = window.localStorage.getItem(storageKey) ?? '';
    setTask(saved);
    setStarted(true);
  };

  if (!started) {
    return (
      <div className="bg-amber/10 border-amber/35 rounded-2xl border p-4 sm:p-5">
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
        <Focus className="text-cyan-dark size-5" aria-hidden="true" />
        <p className="text-navy font-semibold">{task}</p>
      </div>
      <TimedPractice
        kind="focus_sprint"
        seconds={600}
        onComplete={onComplete}
        saving={saving}
      />
    </div>
  );
}

function FeedbackPicker({
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
            className={`focus-visible:ring-navy/30 min-h-11 cursor-pointer rounded-xl border px-3 text-sm font-semibold outline-none focus-visible:ring-2 ${value === item ? 'border-cyan bg-cyan/10 text-navy' : 'border-border text-muted-foreground'}`}
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

function RoomJournal() {
  const t = useTranslations('recoveryRoom');
  const journal = useReflections();
  const [text, setText] = useState('');
  const [mood, setMood] = useState<number | undefined>();
  const [nextStep, setNextStep] = useState('');
  const [focus, setFocus] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await journal.createReflection({
        text: text.trim(),
        mood_score: mood,
        next_step: nextStep.trim(),
        is_focus: focus && Boolean(nextStep.trim()),
      });
      setText('');
      setNextStep('');
      setFocus(false);
      toastSuccess(t('journalSaved'));
    } catch (error) {
      toastError(error, t('journalSaveError'));
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={(event) => void submit(event)} className="space-y-4">
        <div>
          <label htmlFor="room-journal" className="text-navy text-sm font-bold">
            {t('journalLabel')}
          </label>
          <textarea
            id="room-journal"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t('journalPlaceholder')}
            className="border-input focus-visible:ring-navy/30 bg-card mt-2 min-h-32 w-full rounded-2xl border p-4 text-base leading-6 outline-none focus-visible:ring-2"
          />
        </div>
        <fieldset>
          <legend className="text-navy text-sm font-bold">
            {t('moodLabel')}
          </legend>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMood(value)}
                className={`min-h-11 rounded-xl border font-semibold ${mood === value ? 'border-cyan bg-cyan/10 text-navy' : 'border-border text-muted-foreground'}`}
                aria-pressed={mood === value}
              >
                {value}
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="next-step" className="text-navy text-sm font-bold">
            {t('nextStepLabel')}
          </label>
          <input
            id="next-step"
            value={nextStep}
            onChange={(event) => setNextStep(event.target.value)}
            placeholder={t('nextStepPlaceholder')}
            className="border-input focus-visible:ring-navy/30 mt-2 h-12 w-full rounded-xl border px-4 text-base outline-none focus-visible:ring-2"
          />
          <label className="text-muted-foreground mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={focus}
              onChange={(event) => setFocus(event.target.checked)}
              disabled={!nextStep.trim()}
              className="accent-navy size-4"
            />
            {t('focusNextStep')}
          </label>
        </div>
        <Button
          className="w-full sm:w-auto"
          type="submit"
          disabled={journal.submitting || !text.trim()}
        >
          {journal.submitting ? t('saving') : t('saveJournal')}
        </Button>
      </form>
      <aside className="border-border border-t pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
        <h3 className="text-navy font-bold">{t('recentJournal')}</h3>
        <div className="mt-3 space-y-3">
          {journal.reflections
            .filter((entry) => entry.status !== 'archived')
            .slice(0, 3)
            .map((entry) => (
              <article key={entry.id} className="bg-muted/40 rounded-2xl p-4">
                <p className="text-navy line-clamp-3 text-sm leading-6">
                  {entry.text}
                </p>
                {entry.next_step ? (
                  <p className="text-sage mt-2 flex items-center gap-2 text-xs font-semibold">
                    <Check className="size-3.5" aria-hidden="true" />
                    {entry.next_step}
                  </p>
                ) : null}
              </article>
            ))}
          {!journal.loading && journal.reflections.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('journalEmpty')}</p>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function SupportChoices() {
  const t = useTranslations('recoveryRoom');
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Link
        href={ROUTES.PARTNERS}
        className="border-sage/35 bg-sage/10 focus-visible:ring-sage text-navy flex min-h-32 flex-col justify-between rounded-2xl border p-4 outline-none focus-visible:ring-2 sm:p-5"
      >
        <HandHeart className="text-sage size-7" aria-hidden="true" />
        <div>
          <p className="font-bold">{t('trustedPerson')}</p>
          <p className="text-muted-foreground mt-1 text-sm leading-5">
            {t('trustedPersonBody')}
          </p>
        </div>
      </Link>
      <Link
        href={ROUTES.SUPPORT}
        className="border-cyan/35 bg-cyan/10 focus-visible:ring-cyan text-navy flex min-h-32 flex-col justify-between rounded-2xl border p-4 outline-none focus-visible:ring-2 sm:p-5"
      >
        <Headphones className="text-cyan-dark size-7" aria-hidden="true" />
        <div>
          <p className="font-bold">{t('supportTeam')}</p>
          <p className="text-muted-foreground mt-1 text-sm leading-5">
            {t('supportTeamBody')}
          </p>
        </div>
      </Link>
    </div>
  );
}

function formatTimer(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
