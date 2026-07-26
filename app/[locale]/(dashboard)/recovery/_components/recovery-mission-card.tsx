'use client';

import { ChevronDown, RefreshCw, Target } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MissionTaskCard } from '@/components/dashboard/gamification/mission-task-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type DailyMissionItem,
  useDailyMission,
} from '@/hooks/use-daily-mission';
import { toastError, toastSuccess } from '@/lib/feedback';
import { getLevelTitleKey } from '@/lib/recovery/level-titles';

/**
 * RecoveryMissionCard — surfaces today's server-verified self-control
 * missions inside the recovery workspace. The gamification FAB fetches
 * /missions/today independently and refetches when opened, so both surfaces
 * converge after a claim.
 */
export function RecoveryMissionCard() {
  const t = useTranslations('recoveryDashboard');
  const mission = useDailyMission();

  const primaryTask = mission.items.find((item) => item.role === 'primary');
  const bonusTasks = mission.items.filter((item) => item.role === 'bonus');
  const experience = mission.mission?.experience;

  const claimTask = async (task: DailyMissionItem) => {
    if (!task.claimable || task.completed) return;
    const willLevelUp = experience
      ? experience.level_progress + task.expReward >= experience.level_target
      : false;
    const saved = await mission.claimMission(task.number);
    if (!saved) {
      toastError(mission.error, t('missionError'));
      return;
    }
    toastSuccess(
      willLevelUp
        ? t('levelUpTitled', {
            title: t(getLevelTitleKey((experience?.level ?? 0) + 1)),
          })
        : t('expEarned', { count: task.expReward })
    );
  };

  return (
    <section
      className="border-border bg-card shadow-soft rounded-2xl border p-5"
      aria-labelledby="recovery-mission-title"
    >
      <div className="flex items-start gap-3">
        <span
          className="bg-navy flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
          aria-hidden="true"
        >
          <Target className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id="recovery-mission-title"
            className="text-navy text-base font-bold"
          >
            {t('missionTitle')}
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs leading-5">
            {t('missionDescription')}
          </p>
        </div>
      </div>

      <div className="mt-4">
        {mission.loading && mission.items.length === 0 ? (
          <div className="space-y-2.5" aria-label={t('missionLoading')}>
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ) : mission.error && mission.items.length === 0 ? (
          <div className="border-border bg-muted/40 rounded-xl border p-4 text-center">
            <p className="text-muted-foreground text-sm">{t('missionError')}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void mission.refetch()}
            >
              <RefreshCw className="size-3.5" />
              {t('missionRetry')}
            </Button>
          </div>
        ) : primaryTask ? (
          <>
            <MissionTaskCard
              task={primaryTask}
              label={t(`mission${primaryTask.number}`)}
              actionLabel={t(`mission${primaryTask.number}Action`)}
              claimLabel={t('claimExp')}
              claimedLabel={t('expClaimed')}
              skippedLabel={t('missionSkipped')}
              replacedLabel={t('missionReplaced')}
              busy={mission.updatingMissionNumber !== null}
              onClaim={() => void claimTask(primaryTask)}
              onNavigate={() => undefined}
              primary
            />
            {bonusTasks.length > 0 ? (
              <details className="group mt-3">
                <summary className="text-navy/80 hover:text-navy flex min-h-10 cursor-pointer list-none items-center justify-between rounded-xl text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-navy/30 [&::-webkit-details-marker]:hidden">
                  <span>{t('bonusTasks')}</span>
                  <ChevronDown className="text-muted-foreground size-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
                </summary>
                <div className="mt-2 space-y-2.5">
                  {bonusTasks.map((task) => (
                    <MissionTaskCard
                      key={task.id}
                      task={task}
                      label={t(`mission${task.number}`)}
                      actionLabel={t(`mission${task.number}Action`)}
                      claimLabel={t('claimExp')}
                      claimedLabel={t('expClaimed')}
                      skippedLabel={t('missionSkipped')}
                      replacedLabel={t('missionReplaced')}
                      busy={mission.updatingMissionNumber !== null}
                      onClaim={() => void claimTask(task)}
                      onNavigate={() => undefined}
                    />
                  ))}
                </div>
              </details>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
