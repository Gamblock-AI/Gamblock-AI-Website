'use client';

import { BarChart3, CircleAlert, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { IntentionEditor } from '@/components/dashboard/today/intention-editor';
import { PrivateCheckIn } from '@/components/dashboard/today/private-check-in';
import { DailyMission } from '@/components/dashboard/today/daily-mission';
import { SkillRecommendation } from '@/components/dashboard/today/skill-recommendation';
import { ProtectionSummary } from '@/components/dashboard/today/protection-summary';
import { WeeklySnapshot } from '@/components/dashboard/today/weekly-snapshot';
import { QuickReflection } from '@/components/dashboard/today/quick-reflection';
import { StreakCard } from '@/components/dashboard/today/streak-card';
import { BiteSizedLearning } from '@/components/dashboard/today/bite-sized-learning';
import { EmergencyHelp } from '@/components/dashboard/today/emergency-help';
import { useDailyMission } from '@/hooks/use-daily-mission';
import { useProtectionStatus } from '@/hooks/use-protection-status';
import { useDashboardSummary } from '@/hooks/use-dashboard-summary';
import { useRecoveryJourney } from '@/hooks/use-recovery-journey';
import type {
  MissionNumber,
  SkillId,
  SkillReasonCode,
} from '@/lib/recovery/types';
import { cn } from '@/lib/utils';

interface StudentDashboardProps {
  name: string;
}

const MISSION_MINUTES: Record<MissionNumber, number> = {
  1: 2,
  2: 1,
  3: 2,
  4: 5,
  5: 5,
};

const SKILL_COPY: Record<
  SkillId,
  { title: string; summary: string; practice: string }
> = {
  grounding_reset: {
    title: 'skillPauseTitle',
    summary: 'skillPauseSummary',
    practice: 'skillPausePractice',
  },
  gentle_movement: {
    title: 'skillMoveTitle',
    summary: 'skillMoveSummary',
    practice: 'skillMovePractice',
  },
  focus_sprint: {
    title: 'skillFocusTitle',
    summary: 'skillFocusSummary',
    practice: 'skillFocusPractice',
  },
  budgeting_basics: {
    title: 'skillBudgetTitle',
    summary: 'skillBudgetSummary',
    practice: 'skillBudgetPractice',
  },
  creative_reset: {
    title: 'skillCreativeTitle',
    summary: 'skillCreativeSummary',
    practice: 'skillCreativePractice',
  },
  social_connection: {
    title: 'skillReachTitle',
    summary: 'skillReachSummary',
    practice: 'skillReachPractice',
  },
};

const REASON_COPY: Record<SkillReasonCode, string> = {
  high_urge_pause: 'reasonStrongUrge',
  moderate_urge_redirect: 'reasonDefault',
  low_mood_gentle_start: 'reasonLowMood',
  steady_mood_build_routine: 'reasonCalm',
  balanced_check_in: 'reasonDefault',
};

const steps = [
  { number: 1, key: 'stepIntention' },
  { number: 2, key: 'stepCheckIn' },
  { number: 3, key: 'stepMission' },
  { number: 4, key: 'stepLearn' },
] as const;

export function StudentDashboard({ name }: StudentDashboardProps) {
  const t = useTranslations('recoveryDashboard');
  const displayName = name || t('defaultName');
  const {
    state,
    persistence,
    activeIntention,
    todayCheckIn,
    selectedMission,
    skillRecommendation,
    createIntention,
    updateIntention,
    recordDailyCheckIn,
    selectMissionAlternative,
    cycleSkillRecommendation,
  } = useRecoveryJourney();
  const {
    items,
    loading: missionLoading,
    error: missionError,
    updatingMissionNumber,
    refetch: refetchMission,
    setMissionCompleted,
  } = useDailyMission();
  const {
    status: protectionStatus,
    loading: protectionLoading,
    error: protectionError,
    refetch: refetchProtection,
  } = useProtectionStatus();
  const { summary } = useDashboardSummary();

  const selectedMissionNumber = selectedMission?.missionNumber ?? 1;
  const selectedMissionItem =
    items.find((item) => item.number === selectedMissionNumber) ?? items[0];
  const activeStep = !activeIntention
    ? 1
    : !todayCheckIn
      ? 2
      : selectedMissionItem?.completed
        ? 4
        : 3;
  const skillCopy = skillRecommendation
    ? SKILL_COPY[skillRecommendation.id]
    : null;
  const protectionActive = protectionStatus?.mode
    .toLocaleLowerCase()
    .includes('active');

  const saveIntention = (value: string) => {
    if (activeIntention) {
      updateIntention(activeIntention.id, { title: value });
    } else {
      createIntention({ title: value });
    }
  };

  const chooseAlternative = () => {
    const next = ((selectedMissionNumber % 5) + 1) as MissionNumber;
    selectMissionAlternative(next);
  };

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-sage uppercase">
            {t('eyebrow')}
          </p>
          <h1 className="mt-2 text-3xl leading-tight font-extrabold tracking-tight text-navy sm:text-4xl">
            {t('greetingHello', { name: displayName })}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
            {t('supportiveLine')}
          </p>
        </div>
        <div className="inline-flex min-h-11 max-w-full items-center gap-2 self-start rounded-xl border border-sage/30 bg-sage/[0.06] px-3 py-2 text-xs leading-5 font-semibold text-sage sm:self-auto">
          {protectionActive ? (
            <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <LockKeyhole className="size-4 shrink-0" aria-hidden="true" />
          )}
          {protectionActive ? t('privacyStatus') : t('privacyStatusUnknown')}
        </div>
      </header>

      {persistence === 'memory' ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber/30 bg-amber/[0.06] p-4 text-sm leading-6 text-foreground" role="status">
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber" aria-hidden="true" />
          {t('memoryOnlyWarning')}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-12 xl:items-start">
        <section
          className="overflow-hidden rounded-[1.75rem] border border-navy/15 bg-azure/45 shadow-soft xl:col-span-8"
          aria-labelledby="today-space-title"
        >
          <div className="px-4 pt-5 pb-4 sm:px-5">
            <h2 id="today-space-title" className="text-xl font-bold text-navy">
              {t('todayTitle')}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {t('todayDescription')}
            </p>
            <ol className="mt-5 grid grid-cols-4 gap-1" aria-label={t('todayTitle')}>
              {steps.map((step, index) => {
                const current = activeStep === step.number;
                const complete = activeStep > step.number;
                return (
                  <li key={step.number} className="relative flex min-w-0 flex-col items-center gap-2 text-center">
                    {index > 0 ? (
                      <span className="absolute top-4 right-1/2 h-px w-full bg-navy/20" aria-hidden="true" />
                    ) : null}
                    <span
                      className={cn(
                        'relative z-[1] flex size-8 items-center justify-center rounded-full border text-xs font-bold',
                        current
                          ? 'border-navy bg-navy text-white'
                          : complete
                            ? 'border-sage bg-sage text-white'
                            : 'border-navy/25 bg-white text-muted-foreground',
                      )}
                      aria-current={current ? 'step' : undefined}
                    >
                      {step.number}
                    </span>
                    <span className={cn('truncate text-[11px] font-semibold sm:text-xs', current ? 'text-navy' : 'text-muted-foreground')}>
                      {t(step.key)}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <IntentionEditor value={activeIntention?.title} onSave={saveIntention} />
          <PrivateCheckIn
            key={todayCheckIn?.recordedAt ?? 'empty-check-in'}
            initialMood={todayCheckIn?.mood}
            initialUrge={todayCheckIn?.urge ?? undefined}
            onSave={recordDailyCheckIn}
          />
          <DailyMission
            label={t(`mission${selectedMissionNumber}`)}
            minutes={MISSION_MINUTES[selectedMissionNumber]}
            completed={selectedMissionItem?.completed ?? false}
            loading={missionLoading}
            error={missionError?.message ?? null}
            updating={updatingMissionNumber === selectedMissionNumber}
            onToggle={() => {
              if (!selectedMissionItem) return;
              void setMissionCompleted(
                selectedMissionNumber,
                !selectedMissionItem.completed,
              );
            }}
            onAlternative={chooseAlternative}
            onRetry={() => void refetchMission()}
          />
          <QuickReflection />
        </section>

        <aside className="space-y-5 xl:col-span-4" aria-label={t('skillEyebrow')}>
          <StreakCard streakDays={summary?.current_streak ?? 0} />

          {skillRecommendation && skillCopy ? (
            <SkillRecommendation
              title={t(skillCopy.title)}
              summary={t(skillCopy.summary)}
              practice={t(skillCopy.practice)}
              reason={t(REASON_COPY[skillRecommendation.reasonCode])}
              onAnother={cycleSkillRecommendation}
            />
          ) : (
            <section className="rounded-[1.5rem] border border-dashed border-navy/20 bg-card p-5 shadow-soft" aria-labelledby="skill-awaiting-title">
              <span className="flex size-11 items-center justify-center rounded-xl bg-azure text-navy">
                <Sparkles className="size-5" aria-hidden="true" />
              </span>
              <h2 id="skill-awaiting-title" className="mt-4 text-lg font-bold text-navy">
                {t('skillAwaitingTitle')}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t('skillAwaitingBody')}
              </p>
            </section>
          )}

          <ProtectionSummary
            status={protectionStatus}
            loading={protectionLoading}
            error={protectionError}
            onRetry={() => void refetchProtection()}
          />

          <BiteSizedLearning />
          <EmergencyHelp />
        </aside>
      </div>

      <WeeklySnapshot checkIns={state.checkIns} />

      <p className="flex items-start gap-2 px-1 text-xs leading-5 text-muted-foreground">
        <BarChart3 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        {t('weeklyPrivate')}
      </p>
    </div>
  );
}
