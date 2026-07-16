import { type FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { UseRecoveryJourneyResult } from '@/hooks/use-recovery-journey';
import type {
  MissionNumber,
  RecoveryIntention,
  SkillId,
  SkillRecommendation,
  WeeklyHelpfulAction,
  WeeklyReview,
} from '@/lib/recovery/types';
import { ROUTES } from '@/routes';
import { ReviewChoiceCards } from './review-choice-cards';
import { ReviewPlanCard } from './review-plan-card';
import {
  getIntentionChoice,
  getWeeklyAdjustment,
  type IntentionChoice,
} from './review-utils';

const localizedSkillIds = new Set<SkillId>([
  'grounding_reset',
  'gentle_movement',
  'social_connection',
]);

interface WeeklyReviewFormProps {
  activeIntention: RecoveryIntention | null;
  currentWeekReview: WeeklyReview | null;
  missionNumber: MissionNumber | null;
  skillRecommendations: SkillRecommendation[];
  saveWeeklyReview: UseRecoveryJourneyResult['saveWeeklyReview'];
  setIntentionStatus: UseRecoveryJourneyResult['setIntentionStatus'];
}

export function WeeklyReviewForm({
  activeIntention,
  currentWeekReview,
  missionNumber,
  skillRecommendations,
  saveWeeklyReview,
  setIntentionStatus,
}: WeeklyReviewFormProps) {
  const t = useTranslations('weeklyReview');
  const localizedRecommendations = skillRecommendations.filter(
    (recommendation) => localizedSkillIds.has(recommendation.id)
  );
  const [helpfulAction, setHelpfulAction] =
    useState<WeeklyHelpfulAction | null>(
      currentWeekReview?.helpfulAction ?? null
    );
  const [intentionChoice, setIntentionChoice] = useState<IntentionChoice>(() =>
    getIntentionChoice(currentWeekReview?.adjustment)
  );
  const [nextMissionNumber, setNextMissionNumber] = useState<MissionNumber>(
    currentWeekReview?.nextMissionNumber ?? missionNumber ?? 1
  );
  const [selectedSkillId, setSelectedSkillId] = useState<SkillId>(
    currentWeekReview?.selectedSkillId &&
      localizedSkillIds.has(currentWeekReview.selectedSkillId)
      ? currentWeekReview.selectedSkillId
      : (localizedRecommendations[0]?.id ?? 'grounding_reset')
  );
  const [isDirty, setIsDirty] = useState(false);

  const updateHelpfulAction = (value: WeeklyHelpfulAction) => {
    setHelpfulAction(value);
    setIsDirty(true);
  };

  const updateIntentionChoice = (value: IntentionChoice) => {
    setIntentionChoice(value);
    setIsDirty(true);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
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

    setIntentionStatus(
      activeIntention.id,
      intentionChoice === 'pause' ? 'paused' : 'active'
    );
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <ReviewChoiceCards
        activeIntention={activeIntention}
        helpfulAction={helpfulAction}
        intentionChoice={intentionChoice}
        onHelpfulActionChange={updateHelpfulAction}
        onIntentionChoiceChange={updateIntentionChoice}
      />
      <ReviewPlanCard
        nextMissionNumber={nextMissionNumber}
        selectedSkillId={selectedSkillId}
        recommendations={localizedRecommendations}
        helpfulAction={helpfulAction}
        onMissionChange={(value) => {
          setNextMissionNumber(value);
          setIsDirty(true);
        }}
        onSkillChange={(value) => {
          setSelectedSkillId(value);
          setIsDirty(true);
        }}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          aria-live="polite"
          className="text-sage min-h-5 text-sm font-semibold"
        >
          {currentWeekReview && !isDirty ? t('planSaved') : null}
        </div>
        <Link
          href={ROUTES.DASHBOARD}
          className="text-navy hover:bg-navy/[0.05] focus-visible:ring-ring/40 inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-2"
        >
          {t('backToday')}
        </Link>
      </div>
    </form>
  );
}
