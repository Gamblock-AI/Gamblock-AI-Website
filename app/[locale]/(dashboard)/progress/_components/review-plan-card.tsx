import { ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type {
  MissionNumber,
  SkillId,
  SkillRecommendation,
} from '@/lib/recovery/types';

interface ReviewPlanCardProps {
  nextMissionNumber: MissionNumber;
  selectedSkillId: SkillId;
  recommendations: SkillRecommendation[];
  helpfulAction: string | null;
  onMissionChange: (value: MissionNumber) => void;
  onSkillChange: (value: SkillId) => void;
}

export function ReviewPlanCard({
  nextMissionNumber,
  selectedSkillId,
  recommendations,
  helpfulAction,
  onMissionChange,
  onSkillChange,
}: ReviewPlanCardProps) {
  const t = useTranslations('weeklyReview');
  const recoveryT = useTranslations('recoveryDashboard');

  const skillLabel = (skillId: SkillId): string => {
    if (skillId === 'gentle_movement') return recoveryT('skillMoveTitle');
    if (skillId === 'social_connection') return recoveryT('skillReachTitle');
    return recoveryT('skillGroundTitle');
  };

  return (
    <Card className="overflow-hidden">
      <div className="border-border bg-navy/[0.025] border-b p-5 sm:p-6">
        <h2 className="text-navy text-lg font-bold tracking-tight sm:text-xl">
          {t('planTitle')}
        </h2>
      </div>
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
        <label className="block">
          <span className="text-foreground mb-2 block text-sm font-bold">
            {t('missionLabel')}
          </span>
          <select
            value={nextMissionNumber}
            onChange={(event) =>
              onMissionChange(Number(event.target.value) as MissionNumber)
            }
            className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/30 min-h-11 w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2"
          >
            {([1, 2, 3, 4, 5] as const).map((number) => (
              <option key={number} value={number}>
                {recoveryT(`mission${number}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-foreground mb-2 block text-sm font-bold">
            {t('skillLabel')}
          </span>
          <select
            value={selectedSkillId}
            onChange={(event) => onSkillChange(event.target.value as SkillId)}
            className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/30 min-h-11 w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2"
          >
            {recommendations.map((recommendation) => (
              <option key={recommendation.id} value={recommendation.id}>
                {skillLabel(recommendation.id)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="border-border flex flex-col gap-4 border-t px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-muted-foreground flex max-w-2xl items-start gap-2.5 text-xs leading-5">
          <ShieldCheck className="text-sage mt-0.5 size-4 shrink-0" />
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
  );
}
