'use client';

import { useState, type ComponentType, type FormEvent } from 'react';
import {
  Check,
  CircleHelp,
  Footprints,
  LockKeyhole,
  Pause,
  ShieldCheck,
  TimerReset,
  Users,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRecoveryJourney } from '@/hooks/use-recovery-journey';
import { Link } from '@/i18n/routing';
import { recommendSkills } from '@/lib/recovery/skill-catalog';
import type {
  DailyCheckIn,
  MissionNumber,
  RecoveryIntention,
  SkillId,
  SkillRecommendation,
  WeeklyAdjustment,
  WeeklyHelpfulAction,
  WeeklyReview,
} from '@/lib/recovery/types';
import { ROUTES } from '@/routes';

import {
  WeeklyPatternChart,
  type WeeklyPatternDay,
} from './weekly-pattern-chart';

const MINIMUM_WEEKLY_CHECK_INS = 3;
const EXACT_LOCALIZED_SKILL_IDS = new Set<SkillId>([
  'grounding_reset',
  'gentle_movement',
  'social_connection',
]);

type IntentionChoice = 'keep' | 'adjust' | 'pause';

interface RadioOptionProps<T extends string> {
  name: string;
  value: T;
  selected: boolean;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  onSelect: (value: T) => void;
}

interface ReviewFormProps {
  activeIntention: RecoveryIntention | null;
  currentWeekReview: WeeklyReview | null;
  missionNumber: MissionNumber | null;
  skillRecommendations: SkillRecommendation[];
  saveWeeklyReview: ReturnType<typeof useRecoveryJourney>['saveWeeklyReview'];
  setIntentionStatus: ReturnType<
    typeof useRecoveryJourney
  >['setIntentionStatus'];
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateFromLocalKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

function getLastSevenDays(
  checkIns: DailyCheckIn[],
  locale: string
): WeeklyPatternDay[] {
  const latestByDate = new Map<string, DailyCheckIn>();
  for (const checkIn of checkIns) {
    if (!latestByDate.has(checkIn.date)) {
      latestByDate.set(checkIn.date, checkIn);
    }
  }

  const shortFormatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const fullFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const dateKey = getLocalDateKey(date);
    const checkIn = latestByDate.get(dateKey);

    return {
      date: dateKey,
      shortLabel: shortFormatter.format(date),
      fullLabel: fullFormatter.format(date),
      mood: checkIn?.mood ?? null,
      urge: checkIn?.urge ?? null,
    };
  });
}

function getIntentionChoice(
  adjustment: WeeklyAdjustment | undefined
): IntentionChoice {
  if (adjustment === 'pause') return 'pause';
  if (adjustment === 'simplify' || adjustment === 'change_focus') {
    return 'adjust';
  }
  return 'keep';
}

function getWeeklyAdjustment(choice: IntentionChoice): WeeklyAdjustment {
  if (choice === 'pause') return 'pause';
  if (choice === 'adjust') return 'change_focus';
  return 'continue';
}

function RadioOption<T extends string>({
  name,
  value,
  selected,
  label,
  icon: Icon,
  onSelect,
}: RadioOptionProps<T>) {
  return (
    <label className="block">
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={() => onSelect(value)}
        className="peer sr-only"
      />
      <span className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground transition-colors peer-checked:border-navy peer-checked:bg-navy/[0.04] peer-focus-visible:ring-2 peer-focus-visible:ring-ring/40 peer-focus-visible:ring-offset-2 hover:border-navy/35">
        {Icon ? (
          <Icon
            className={`size-4 shrink-0 ${
              selected ? 'text-navy' : 'text-muted-foreground'
            }`}
          />
        ) : null}
        <span className="min-w-0 flex-1 leading-5">{label}</span>
        <span
          aria-hidden="true"
          className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
            selected
              ? 'border-navy bg-navy text-white'
              : 'border-border bg-card text-transparent'
          }`}
        >
          <Check className="size-3" strokeWidth={3} />
        </span>
      </span>
    </label>
  );
}

function ReviewForm({
  activeIntention,
  currentWeekReview,
  missionNumber,
  skillRecommendations,
  saveWeeklyReview,
  setIntentionStatus,
}: ReviewFormProps) {
  const t = useTranslations('weeklyReview');
  const recoveryT = useTranslations('recoveryDashboard');
  const [helpfulAction, setHelpfulAction] =
    useState<WeeklyHelpfulAction | null>(
      currentWeekReview?.helpfulAction ?? null
    );
  const [intentionChoice, setIntentionChoice] = useState<IntentionChoice>(() =>
    getIntentionChoice(currentWeekReview?.adjustment)
  );
  const localizedRecommendations = skillRecommendations.filter(
    (recommendation) => EXACT_LOCALIZED_SKILL_IDS.has(recommendation.id)
  );
  const [nextMissionNumber, setNextMissionNumber] = useState<MissionNumber>(
    currentWeekReview?.nextMissionNumber ?? missionNumber ?? 1
  );
  const [selectedSkillId, setSelectedSkillId] = useState<SkillId>(
    currentWeekReview?.selectedSkillId &&
      EXACT_LOCALIZED_SKILL_IDS.has(currentWeekReview.selectedSkillId)
      ? currentWeekReview.selectedSkillId
      : (localizedRecommendations[0]?.id ?? 'grounding_reset')
  );
  const [isDirty, setIsDirty] = useState(false);

  const skillLabel = (skillId: SkillId): string => {
    if (skillId === 'gentle_movement') return recoveryT('skillMoveTitle');
    if (skillId === 'social_connection') return recoveryT('skillReachTitle');
    return recoveryT('skillGroundTitle');
  };

  const updateHelpfulAction = (value: WeeklyHelpfulAction) => {
    setHelpfulAction(value);
    setIsDirty(true);
  };

  const updateIntentionChoice = (value: IntentionChoice) => {
    setIntentionChoice(value);
    setIsDirty(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!helpfulAction) return;

    const savedReview = saveWeeklyReview({
      intentionId: activeIntention?.id ?? null,
      helpfulAction,
      adjustment: getWeeklyAdjustment(intentionChoice),
      nextMissionNumber,
      selectedSkillId,
    });
    if (!savedReview || !activeIntention) return;

    const nextStatus = intentionChoice === 'pause' ? 'paused' : 'active';
    setIntentionStatus(activeIntention.id, nextStatus);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <fieldset>
            <legend className="text-lg font-bold tracking-tight text-navy">
              {t('helpfulTitle')}
            </legend>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {t('helpfulDescription')}
            </p>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              <RadioOption
                name="helpful-action"
                value="pause"
                selected={helpfulAction === 'pause'}
                label={t('helpfulPause')}
                icon={TimerReset}
                onSelect={updateHelpfulAction}
              />
              <RadioOption
                name="helpful-action"
                value="trusted_person"
                selected={helpfulAction === 'trusted_person'}
                label={t('helpfulPartner')}
                icon={Users}
                onSelect={updateHelpfulAction}
              />
              <RadioOption
                name="helpful-action"
                value="walk"
                selected={helpfulAction === 'walk'}
                label={t('helpfulWalk')}
                icon={Footprints}
                onSelect={updateHelpfulAction}
              />
              <RadioOption
                name="helpful-action"
                value="unsure"
                selected={helpfulAction === 'unsure'}
                label={t('helpfulUnknown')}
                icon={CircleHelp}
                onSelect={updateHelpfulAction}
              />
            </div>
            {helpfulAction === 'unsure' ? (
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                {t('helpfulUnknownHint')}
              </p>
            ) : null}
          </fieldset>
        </Card>

        <Card className="p-5 sm:p-6">
          <fieldset>
            <legend className="text-lg font-bold tracking-tight text-navy">
              {t('intentionTitle')}
            </legend>
            {activeIntention ? (
              <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
                {activeIntention.title}
              </p>
            ) : (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t('intentionEmpty')}
              </p>
            )}
            {activeIntention ? (
              <div className="mt-5 grid gap-2.5">
                <RadioOption
                  name="intention-choice"
                  value="keep"
                  selected={intentionChoice === 'keep'}
                  label={t('intentionKeep')}
                  onSelect={updateIntentionChoice}
                />
                <RadioOption
                  name="intention-choice"
                  value="adjust"
                  selected={intentionChoice === 'adjust'}
                  label={t('intentionAdjust')}
                  onSelect={updateIntentionChoice}
                />
                <RadioOption
                  name="intention-choice"
                  value="pause"
                  selected={intentionChoice === 'pause'}
                  label={t('intentionPause')}
                  icon={Pause}
                  onSelect={updateIntentionChoice}
                />
              </div>
            ) : null}
          </fieldset>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border bg-navy/[0.025] p-5 sm:p-6">
          <h2 className="text-lg font-bold tracking-tight text-navy sm:text-xl">
            {t('planTitle')}
          </h2>
        </div>
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-foreground">
              {t('missionLabel')}
            </span>
            <select
              value={nextMissionNumber}
              onChange={(event) => {
                setNextMissionNumber(Number(event.target.value) as MissionNumber);
                setIsDirty(true);
              }}
              className="min-h-11 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              {([1, 2, 3, 4, 5] as const).map((number) => (
                <option key={number} value={number}>
                  {recoveryT(`mission${number}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-foreground">
              {t('skillLabel')}
            </span>
            <select
              value={selectedSkillId}
              onChange={(event) => {
                setSelectedSkillId(event.target.value as SkillId);
                setIsDirty(true);
              }}
              className="min-h-11 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              {localizedRecommendations.map((recommendation) => (
                <option key={recommendation.id} value={recommendation.id}>
                  {skillLabel(recommendation.id)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-col gap-4 border-t border-border px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="flex max-w-2xl items-start gap-2.5 text-xs leading-5 text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sage" />
            <span>{t('recommendationReason')}</span>
          </p>
          <Button
            type="submit"
            size="lg"
            disabled={!helpfulAction}
            className="min-h-11 w-full lg:w-auto"
          >
            {t('savePlan')}
          </Button>
        </div>
      </Card>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div aria-live="polite" className="min-h-5 text-sm font-semibold text-sage">
          {currentWeekReview && !isDirty ? t('planSaved') : null}
        </div>
        <Link
          href={ROUTES.DASHBOARD}
          className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-navy outline-none transition-colors hover:bg-navy/[0.05] focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          {t('backToday')}
        </Link>
      </div>
    </form>
  );
}

export default function ProgressPage() {
  const t = useTranslations('weeklyReview');
  const locale = useLocale();
  const {
    state,
    activeIntention,
    currentWeekReview,
    selectedMission,
    skillRecommendations,
    saveWeeklyReview,
    setIntentionStatus,
  } = useRecoveryJourney();

  const days = getLastSevenDays(state.checkIns, locale);
  const recordedDays = days.filter((day) => day.mood !== null);
  const hasEnoughData = recordedDays.length >= MINIMUM_WEEKLY_CHECK_INS;
  const moods = recordedDays.flatMap((day) =>
    day.mood === null ? [] : [day.mood]
  );
  const moodRange = moods.length > 0 ? Math.max(...moods) - Math.min(...moods) : 0;
  const strongerUrgeCount = recordedDays.filter(
    (day) => day.urge !== null && day.urge >= 4
  ).length;
  const latestCheckIn = recordedDays.reduce<DailyCheckIn | null>(
    (latest, day) => {
      if (day.mood === null) return latest;
      const checkIn = state.checkIns.find((entry) => entry.date === day.date);
      if (!checkIn) return latest;
      if (!latest) return checkIn;
      return dateFromLocalKey(checkIn.date) > dateFromLocalKey(latest.date)
        ? checkIn
        : latest;
    },
    null
  );
  const weeklySkillRecommendations =
    skillRecommendations.length > 0
      ? skillRecommendations
      : recommendSkills(latestCheckIn);
  const intentionForReview =
    activeIntention ??
    (currentWeekReview?.intentionId
      ? (state.intentions.find(
          (intention) =>
            intention.id === currentWeekReview.intentionId &&
            intention.status !== 'archived'
        ) ?? null)
      : null);
  const moodSummary =
    moodRange <= 1 ? t('stableSummary') : t('variableSummary');
  const summaryParts = [
    t('recordedSummary', { count: recordedDays.length }),
    moodSummary,
  ];
  if (strongerUrgeCount > 0) {
    summaryParts.push(t('higherUrgeSummary', { count: strongerUrgeCount }));
  }
  const chartSummary = summaryParts.join(' ');

  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 pb-8 sm:space-y-8">
      <header className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-[0.14em] text-sage uppercase">
            {t('eyebrow')}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            {t('description')}
          </p>
        </div>
        <div className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-sage/20 bg-sage/[0.07] px-4 text-sm font-semibold text-sage">
          <LockKeyhole className="size-4" />
          {t('privateStatus')}
        </div>
      </header>

      {hasEnoughData ? (
        <>
          <section aria-labelledby="weekly-pattern-title">
            <Card className="p-5 sm:p-7">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2
                    id="weekly-pattern-title"
                    className="text-lg font-bold tracking-tight text-navy sm:text-xl"
                  >
                    {t('patternTitle')}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('basedOnPrivate')}
                  </p>
                </div>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-right">
                  {chartSummary}
                </p>
              </div>
              <WeeklyPatternChart
                days={days}
                moodLabel={t('moodLabel')}
                urgeLabel={t('urgeLabel')}
                ariaLabel={chartSummary}
              />
            </Card>
          </section>

          <ReviewForm
            key={currentWeekReview?.reviewedAt ?? 'new-weekly-review'}
            activeIntention={intentionForReview}
            currentWeekReview={currentWeekReview}
            missionNumber={selectedMission?.missionNumber ?? null}
            skillRecommendations={weeklySkillRecommendations}
            saveWeeklyReview={saveWeeklyReview}
            setIntentionStatus={setIntentionStatus}
          />
        </>
      ) : (
        <Card className="overflow-hidden">
          <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-12 text-center sm:px-8 sm:py-16">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-navy/[0.06] text-navy">
              <ShieldCheck className="size-6" />
            </div>
            <h2 className="mt-5 text-xl font-bold tracking-tight text-navy sm:text-2xl">
              {t('insufficientTitle')}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              {t('insufficientBody')}
            </p>
            <p className="mt-2 text-sm font-semibold text-navy">
              {t('recordedSummary', { count: recordedDays.length })}
            </p>
            <Button
              size="lg"
              className="mt-7 min-h-11 w-full sm:w-auto"
              render={<Link href={ROUTES.DASHBOARD} />}
            >
              {t('goCheckIn')}
            </Button>
          </div>
        </Card>
      )}

      <footer className="flex items-start gap-2.5 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
        <LockKeyhole className="mt-0.5 size-4 shrink-0 text-sage" />
        <p>{t('privacyFooter')}</p>
      </footer>
    </div>
  );
}
