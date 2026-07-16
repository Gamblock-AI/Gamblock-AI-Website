'use client';

import { BarChart3, CircleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BiteSizedLearning } from '@/components/dashboard/today/bite-sized-learning';
import { DashboardWelcome } from '@/components/dashboard/today/dashboard-welcome';
import { EmergencyHelp } from '@/components/dashboard/today/emergency-help';
import { ProtectionSummary } from '@/components/dashboard/today/protection-summary';
import { RecoveryAtAGlance } from '@/components/dashboard/today/recovery-at-a-glance';
import { SkillGuidance } from '@/components/dashboard/today/skill-guidance';
import { TodayRecoveryWorkspace } from '@/components/dashboard/today/today-recovery-workspace';
import { WeeklySnapshot } from '@/components/dashboard/today/weekly-snapshot';
import { useDailyMission } from '@/hooks/use-daily-mission';
import { useDashboardSummary } from '@/hooks/use-dashboard-summary';
import { useProtectionStatus } from '@/hooks/use-protection-status';
import { useRecoveryJourney } from '@/hooks/use-recovery-journey';
import type { MissionNumber } from '@/lib/recovery/types';

interface StudentDashboardProps {
  name: string;
}

export function StudentDashboard({ name }: StudentDashboardProps) {
  const t = useTranslations('recoveryDashboard');
  const recovery = useRecoveryJourney();
  const mission = useDailyMission();
  const protection = useProtectionStatus();
  const { summary } = useDashboardSummary();
  const selectedMissionNumber = recovery.selectedMission?.missionNumber ?? 1;
  const selectedMissionItem =
    mission.items.find((item) => item.number === selectedMissionNumber) ??
    mission.items[0];
  const activeStep = getActiveStep(
    recovery.activeIntention,
    recovery.todayCheckIn,
    selectedMissionItem?.completed
  );

  const saveIntention = (value: string) => {
    if (recovery.activeIntention) {
      recovery.updateIntention(recovery.activeIntention.id, { title: value });
      return;
    }
    recovery.createIntention({ title: value });
  };

  const chooseAlternative = () => {
    const next = ((selectedMissionNumber % 5) + 1) as MissionNumber;
    recovery.selectMissionAlternative(next);
  };

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-5 sm:space-y-6">
      <DashboardWelcome
        name={name}
        protectionActive={protection.status?.mode === 'active'}
      />
      {recovery.persistence === 'memory' ? (
        <div
          className="border-amber/40 bg-amber/[0.10] text-foreground flex items-start gap-3 rounded-2xl border p-4 text-sm leading-6"
          role="status"
        >
          <CircleAlert
            className="text-amber mt-0.5 size-5 shrink-0"
            aria-hidden="true"
          />
          {t('memoryOnlyWarning')}
        </div>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-12 xl:items-start">
        <TodayRecoveryWorkspace
          activeStep={activeStep}
          activeIntention={recovery.activeIntention}
          todayCheckIn={recovery.todayCheckIn}
          selectedMissionNumber={selectedMissionNumber}
          selectedMissionItem={selectedMissionItem}
          mission={mission}
          onSaveIntention={saveIntention}
          onSaveCheckIn={recovery.recordDailyCheckIn}
          onAlternative={chooseAlternative}
        />
        <aside
          className="space-y-5 xl:col-span-4"
          aria-label={t('skillEyebrow')}
        >
          <SkillGuidance
            recommendation={recovery.skillRecommendation}
            onAnother={recovery.cycleSkillRecommendation}
          />
          <ProtectionSummary
            status={protection.status}
            loading={protection.loading}
            error={protection.error}
            onRetry={() => void protection.refetch()}
          />
          <BiteSizedLearning />
          <EmergencyHelp />
        </aside>
      </div>
      <RecoveryAtAGlance summary={summary} checkIns={recovery.state.checkIns} />
      <WeeklySnapshot checkIns={recovery.state.checkIns} />
      <p className="text-muted-foreground flex items-start gap-2 px-1 text-xs leading-5">
        <BarChart3 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        {t('weeklyPrivate')}
      </p>
    </div>
  );
}

function getActiveStep(
  activeIntention: ReturnType<typeof useRecoveryJourney>['activeIntention'],
  todayCheckIn: ReturnType<typeof useRecoveryJourney>['todayCheckIn'],
  missionCompleted: boolean | undefined
): number {
  if (!activeIntention) return 1;
  if (!todayCheckIn) return 2;
  return missionCompleted ? 4 : 3;
}
