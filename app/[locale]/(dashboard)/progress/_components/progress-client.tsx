'use client';

import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
} from '@/components/dashboard/dashboard-page';
import { useRecoveryJourney } from '@/hooks/use-recovery-journey';
import { recommendSkills } from '@/lib/recovery/skill-catalog';
import { InsufficientWeek } from './insufficient-week';
import { MINIMUM_WEEKLY_CHECK_INS, getWeeklyInsights } from './weekly-data';
import { WeeklyPatternSection } from './weekly-pattern-section';
import { WeeklyReviewForm } from './weekly-review-form';

export function ProgressClient() {
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
  const insights = getWeeklyInsights(state.checkIns, locale);
  const hasEnoughData =
    insights.recordedDays.length >= MINIMUM_WEEKLY_CHECK_INS;
  const weeklySkillRecommendations =
    skillRecommendations.length > 0
      ? skillRecommendations
      : recommendSkills(insights.latestCheckIn);
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
    insights.moodRange <= 1 ? t('stableSummary') : t('variableSummary');
  const summaryParts = [
    t('recordedSummary', { count: insights.recordedDays.length }),
    moodSummary,
  ];
  if (insights.strongerUrgeCount > 0) {
    summaryParts.push(
      t('higherUrgeSummary', { count: insights.strongerUrgeCount })
    );
  }
  const chartSummary = summaryParts.join(' ');

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={ShieldCheck}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        aside={
          <DashboardNotice icon={LockKeyhole} title={t('privateStatus')}>
            {t('basedOnPrivate')}
          </DashboardNotice>
        }
      />
      {hasEnoughData ? (
        <>
          <WeeklyPatternSection days={insights.days} summary={chartSummary} />
          <WeeklyReviewForm
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
        <InsufficientWeek recordedCount={insights.recordedDays.length} />
      )}
      <footer className="border-border text-muted-foreground flex items-start gap-2.5 border-t pt-5 text-xs leading-5">
        <LockKeyhole className="text-sage mt-0.5 size-4 shrink-0" />
        <p>{t('privacyFooter')}</p>
      </footer>
    </DashboardPage>
  );
}
