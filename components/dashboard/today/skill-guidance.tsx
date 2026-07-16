import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SkillRecommendation } from '@/components/dashboard/today/skill-recommendation';
import type { UseRecoveryJourneyResult } from '@/hooks/use-recovery-journey';
import { skillCopy, skillReasonCopy } from './dashboard-copy';

interface SkillGuidanceProps {
  recommendation: UseRecoveryJourneyResult['skillRecommendation'];
  onAnother: () => void;
}

export function SkillGuidance({
  recommendation,
  onAnother,
}: SkillGuidanceProps) {
  const t = useTranslations('recoveryDashboard');
  const copy = recommendation ? skillCopy[recommendation.id] : null;

  if (recommendation && copy) {
    return (
      <SkillRecommendation
        title={t(copy.title)}
        summary={t(copy.summary)}
        practice={t(copy.practice)}
        reason={t(skillReasonCopy[recommendation.reasonCode])}
        onAnother={onAnother}
      />
    );
  }

  return (
    <section
      className="border-navy/30 bg-card shadow-soft rounded-2xl border border-dashed p-5"
      aria-labelledby="skill-awaiting-title"
    >
      <span className="bg-navy flex size-10 items-center justify-center rounded-xl text-white shadow-sm">
        <Sparkles className="size-[1.125rem]" aria-hidden="true" />
      </span>
      <h2
        id="skill-awaiting-title"
        className="text-navy mt-4 text-lg font-bold"
      >
        {t('skillAwaitingTitle')}
      </h2>
      <p className="text-muted-foreground mt-2 text-sm leading-6">
        {t('skillAwaitingBody')}
      </p>
    </section>
  );
}
