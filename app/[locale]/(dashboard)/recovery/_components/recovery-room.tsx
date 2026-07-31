'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Clock3,
  HandHeart,
  Headphones,
  Leaf,
  LockKeyhole,
  MessageCircleMore,
  NotebookPen,
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
  type RecoveryRoomTheme,
} from '@/hooks/use-recovery-experience';
import { useExperienceProgress } from '@/hooks/use-experience-progress';
import { useRecoveryJourney } from '@/hooks/use-recovery-journey';
import {
  DECOR_CATALOG,
  DECOR_SLOT_POSITIONS,
  decorIcon,
  decorSlot,
  ROOM_THEME_IMAGES,
  type DecorCriteria,
} from '@/lib/recovery/decor-catalog';
import { PracticeHistory } from './practice-history';
import {
  FocusPractice,
  GroundingPractice,
  TimedPractice,
} from './practice-timers';
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
    tone: 'bg-navy-light text-white',
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
            src={
              ROOM_THEME_IMAGES[experience.space.data?.theme ?? 'dorm_room']
            }
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
            .map(([item, value]) => {
              const Icon = decorIcon(item);
              const slot = decorSlot(item, value);
              return (
                <motion.div
                  key={item}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${slot ? DECOR_SLOT_POSITIONS[slot] : 'top-1/2 left-1/2'} bg-card/90 text-navy absolute z-[5] hidden size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/80 shadow-lg backdrop-blur md:flex`}
                  aria-label={t('placedDecor', { item: t(`decor.${item}`) })}
                >
                  <Icon className="text-navy-light size-5" aria-hidden="true" />
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
                    className={`${config.hotspot} focus-visible:ring-cyan absolute z-30 flex size-14 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-4 border-white/90 shadow-[0_10px_35px_rgba(23,38,77,0.45)] transition-transform outline-none hover:scale-105 focus-visible:ring-4 focus-visible:ring-offset-2 motion-reduce:transition-none ${config.tone}`}
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

        {/* Placed decor stays visible on mobile (the 2.5D scene is md+ only). */}
        {Object.entries(experience.space.data?.placed_items ?? {}).some(
          ([, placed]) => Boolean(placed)
        ) ? (
          <div className="px-3 pt-3 md:hidden">
            <p className="text-xs font-bold tracking-[0.1em] text-white/70 uppercase">
              {t('mobileDecorTitle')}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {Object.entries(experience.space.data?.placed_items ?? {})
                .filter(([, placed]) => Boolean(placed))
                .map(([item]) => {
                  const Icon = decorIcon(item);
                  return (
                    <li
                      key={item}
                      className="flex min-h-8 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 text-xs font-semibold text-white"
                    >
                      <Icon className="size-3.5" aria-hidden="true" />
                      {t(`decor.${item}`)}
                    </li>
                  );
                })}
            </ul>
          </div>
        ) : null}

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

      <PracticeHistory practices={experience.practices} />
      <RoomCollection
        unlockedItems={experience.space.data?.unlocked_items ?? []}
        placedItems={experience.space.data?.placed_items ?? {}}
        theme={experience.space.data?.theme ?? 'dorm_room'}
        loading={experience.space.loading}
        saving={experience.saving}
        onUpdate={experience.updateSpace}
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

function decorCriteriaText(
  t: ReturnType<typeof useTranslations<'recoveryRoom'>>,
  criteria: DecorCriteria
) {
  switch (criteria.kind) {
    case 'level':
      return t('criteriaLevel', { level: criteria.value });
    case 'practices':
      return t('criteriaPractices', { count: criteria.value });
    case 'activeDays':
      return t('criteriaActiveDays', { count: criteria.value });
    case 'reviews':
      return t('criteriaReviews', { count: criteria.value });
    case 'missions':
      return t('criteriaMissions', { count: criteria.value });
    case 'practiceKind':
      return t(`criteriaPracticeKind.${criteria.value}`);
    case 'journal':
      return t('criteriaJournal');
  }
}

function RoomCollection({
  unlockedItems,
  placedItems,
  theme,
  loading,
  saving,
  onUpdate,
}: {
  unlockedItems: string[];
  placedItems: Record<string, unknown>;
  theme: RecoveryRoomTheme;
  loading: boolean;
  saving: boolean;
  onUpdate: (
    items: Record<string, unknown>,
    theme?: RecoveryRoomTheme
  ) => Promise<unknown>;
}) {
  const t = useTranslations('recoveryRoom');
  const experienceProgress = useExperienceProgress();
  const themeUnlocked = (experienceProgress?.level ?? 1) >= 18;
  const unlocked = new Set(unlockedItems);

  const save = async (
    next: Record<string, unknown>,
    successKey: 'decorPlaced' | 'decorRemoved' | 'themeSwitched',
    nextTheme?: RecoveryRoomTheme
  ) => {
    try {
      await onUpdate(next, nextTheme);
      toastSuccess(t(successKey));
    } catch (error) {
      toastError(error, t('decorSaveError'));
    }
  };

  const toggle = (item: string) => {
    const next = { ...placedItems };
    const placing = !next[item];
    if (placing) {
      next[item] = true;
    } else {
      delete next[item];
    }
    void save(next, placing ? 'decorPlaced' : 'decorRemoved');
  };

  const moveToSlot = (item: string, slot: string) => {
    const next = { ...placedItems, [item]: slot };
    void save(next, 'decorPlaced');
  };

  return (
    <section className="border-border bg-card rounded-2xl border p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-navy font-bold">{t('collectionTitle')}</h3>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {t('collectionBody')}
          </p>
          <p className="text-navy/70 mt-1 text-xs">{t('collectionHint')}</p>
        </div>
        {themeUnlocked ? (
          <div className="shrink-0">
            <p className="text-muted-foreground text-xs font-semibold">
              {t('themeTitle')}
            </p>
            <div className="border-border bg-muted/40 mt-1 inline-flex rounded-xl border p-1">
              {(['dorm_room', 'sunrise_study'] as const).map((candidate) => (
                <button
                  key={candidate}
                  type="button"
                  disabled={saving || theme === candidate}
                  onClick={() =>
                    void save(placedItems, 'themeSwitched', candidate)
                  }
                  className={`focus-visible:ring-navy/30 min-h-9 cursor-pointer rounded-lg px-3 text-xs font-bold outline-none focus-visible:ring-2 disabled:cursor-default ${theme === candidate ? 'bg-navy text-white shadow-sm' : 'text-muted-foreground hover:text-navy'}`}
                  aria-pressed={theme === candidate}
                >
                  {t(`theme.${candidate}`)}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <ul
        className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3"
        aria-live="polite"
      >
        {loading ? (
          <li className="text-muted-foreground text-sm">{t('loading')}</li>
        ) : (
          DECOR_CATALOG.map((item) => {
            const Icon = item.icon;
            const isUnlocked = unlocked.has(item.id);
            const placedValue = placedItems[item.id];
            const placed = Boolean(placedValue);
            const currentSlot = decorSlot(item.id, placedValue);
            return (
              <li
                key={item.id}
                className={`flex items-center gap-2.5 rounded-xl border p-2.5 ${
                  isUnlocked
                    ? 'border-border bg-card'
                    : 'border-border bg-card/50 border-dashed'
                }`}
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${
                    isUnlocked
                      ? 'border-navy/15 bg-azure/60 text-navy'
                      : 'border-border text-muted-foreground/40 border-dashed'
                  }`}
                  aria-hidden="true"
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-bold ${isUnlocked ? 'text-navy' : 'text-muted-foreground'}`}
                  >
                    {t(`decor.${item.id}`)}
                  </p>
                  {isUnlocked && placed && item.slots.length > 1 ? (
                    <label className="text-muted-foreground mt-0.5 flex items-center gap-1 text-[11px]">
                      {t('slotLabel')}
                      <select
                        value={currentSlot ?? item.slots[0]}
                        disabled={saving}
                        onChange={(event) =>
                          moveToSlot(item.id, event.target.value)
                        }
                        className="border-border bg-card text-navy cursor-pointer rounded-md border px-1 py-0.5 text-[11px] font-semibold"
                      >
                        {item.slots.map((slot) => (
                          <option key={slot} value={slot}>
                            {t(`slot.${slot}`)}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <p className="text-muted-foreground mt-0.5 text-[11px] leading-4">
                      {isUnlocked
                        ? placed
                          ? t(`slot.${currentSlot ?? item.slots[0]}`)
                          : t('collectionHint')
                        : decorCriteriaText(t, item.criteria)}
                    </p>
                  )}
                </div>
                {isUnlocked ? (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => toggle(item.id)}
                    className={`focus-visible:ring-navy/30 min-h-9 shrink-0 cursor-pointer rounded-lg border px-2.5 text-[11px] font-bold outline-none focus-visible:ring-2 disabled:cursor-wait disabled:opacity-60 ${
                      placed
                        ? 'border-navy bg-navy text-white'
                        : 'border-navy/20 text-navy hover:bg-azure/45'
                    }`}
                    aria-pressed={placed}
                  >
                    {t(placed ? 'removeDecor' : 'placeDecor')}
                  </button>
                ) : (
                  <span className="text-muted-foreground/70 shrink-0 text-[11px] font-semibold">
                    {t('lockedBadge')}
                  </span>
                )}
              </li>
            );
          })
        )}
      </ul>
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
  const completeAndClose = async (input: {
    practice_kind: RecoveryPracticeKind;
    duration_seconds: number;
    feedback?: RecoveryFeedback;
  }) => {
    await onComplete(input);
    onClose();
  };

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
                  onComplete={completeAndClose}
                  saving={saving}
                />
              ) : null}
              {activity === 'grounding' ? (
                <GroundingPractice onComplete={completeAndClose} saving={saving} />
              ) : null}
              {activity === 'focus' ? (
                <FocusPractice onComplete={completeAndClose} saving={saving} />
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

function RoomJournal() {
  const t = useTranslations('recoveryRoom');
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground max-w-xl text-sm leading-6">
        {t('journalRouteBody')}
      </p>
      <Link
        href={ROUTES.JOURNAL}
        className="bg-navy hover:bg-navy-light focus-visible:ring-navy/30 inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-bold text-white outline-none focus-visible:ring-2"
      >
        {t('journalRouteAction')}
      </Link>
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
