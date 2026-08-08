'use client';

import { Trophy, Target, Sparkles, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDailyMission } from '@/hooks/use-daily-mission';
import { getLevelTitleKey } from '@/lib/recovery/level-titles';
import { Button } from '@/components/ui/button';

interface GamificationSummaryCardProps {
  onOpenMissions?: () => void;
}

export function GamificationSummaryCard({ onOpenMissions }: GamificationSummaryCardProps) {
  const t = useTranslations('recoveryDashboard');
  const mission = useDailyMission();

  const exp = mission.mission?.experience ?? {
    level: 1,
    level_progress: 0,
    level_target: 100,
    total_exp: 0,
  };
  const levelTitle = t(getLevelTitleKey(exp.level));
  const completedCount = mission.mission?.completed_count ?? 0;
  const targetExp = exp.level_target || 100;
  const progressPercent = Math.min(100, Math.round((exp.level_progress / targetExp) * 100));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-navy/15 bg-gradient-to-br from-azure/50 via-card to-azure/20 p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Level & Title */}
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-navy text-sky shadow-inner">
            <Trophy className="size-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-navy/75">
                Level {exp.level}
              </span>
              <span className="inline-flex items-center rounded-full bg-navy/10 px-2.5 py-0.5 text-xs font-bold text-navy">
                {levelTitle}
              </span>
            </div>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {exp.level_progress} / {exp.level_target} EXP
            </p>
          </div>
        </div>

        {/* Right: Mission Progress & Quick Claim Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card/80 px-3 py-2">
            <Target className="size-4 text-navy" />
            <span className="text-xs font-bold text-navy">
              {t('missionProgress', { completed: completedCount, total: 5 })}
            </span>
          </div>
          {onOpenMissions ? (
            <Button
              type="button"
              size="sm"
              onClick={onOpenMissions}
              className="gap-1.5 rounded-xl font-bold"
            >
              <Sparkles className="size-4" />
              {t('claimExp')}
              <ChevronRight className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>

      {/* Accessible Progress Bar */}
      <div className="mt-4 space-y-1.5">
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-navy/10"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('expProgress', { current: exp.level_progress, target: exp.level_target })}
        >
          <div
            className="h-full rounded-full bg-navy transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
