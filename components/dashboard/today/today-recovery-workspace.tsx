import { useTranslations } from 'next-intl';
import { IntentionEditor } from '@/components/dashboard/today/intention-editor';
import { DailyMission } from '@/components/dashboard/today/daily-mission';
import { PrivateCheckIn } from '@/components/dashboard/today/private-check-in';
import { QuickReflection } from '@/components/dashboard/today/quick-reflection';
import type {
  DailyMissionItem,
  UseDailyMissionResult,
} from '@/hooks/use-daily-mission';
import type { UseRecoveryJourneyResult } from '@/hooks/use-recovery-journey';
import type { MissionNumber } from '@/lib/recovery/types';
import { missionMinutes } from './dashboard-copy';
import { TodaySteps } from './today-steps';

interface TodayRecoveryWorkspaceProps {
  activeStep: number;
  activeIntention: UseRecoveryJourneyResult['activeIntention'];
  todayCheckIn: UseRecoveryJourneyResult['todayCheckIn'];
  selectedMissionNumber: MissionNumber;
  selectedMissionItem: DailyMissionItem | undefined;
  mission: Pick<
    UseDailyMissionResult,
    | 'loading'
    | 'error'
    | 'updatingMissionNumber'
    | 'claimMission'
    | 'refetch'
  >;
  onSaveIntention: (value: string) => void;
  onSaveCheckIn: UseRecoveryJourneyResult['recordDailyCheckIn'];
  onAlternative: () => void;
}

export function TodayRecoveryWorkspace({
  activeStep,
  activeIntention,
  todayCheckIn,
  selectedMissionNumber,
  selectedMissionItem,
  mission,
  onSaveIntention,
  onSaveCheckIn,
  onAlternative,
}: TodayRecoveryWorkspaceProps) {
  const t = useTranslations('recoveryDashboard');

  const claimMission = () => {
    if (!selectedMissionItem?.claimable || selectedMissionItem.completed) return;
    void mission.claimMission(selectedMissionNumber);
  };

  return (
    <section
      className="space-y-4 xl:col-span-8"
      aria-labelledby="today-space-title"
    >
      <div className="border-border bg-card shadow-soft overflow-hidden rounded-2xl border">
        <div className="px-4 pt-5 pb-4 sm:px-5">
          <h2 id="today-space-title" className="text-navy text-xl font-bold">
            {t('todayTitle')}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {t('todayDescription')}
          </p>
          <TodaySteps activeStep={activeStep} />
        </div>
        <IntentionEditor
          value={activeIntention?.title}
          onSave={onSaveIntention}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border-border bg-card shadow-soft rounded-2xl border">
          <DailyMission
            label={t(`mission${selectedMissionNumber}`)}
            minutes={missionMinutes[selectedMissionNumber]}
            completed={selectedMissionItem?.completed ?? false}
            claimable={selectedMissionItem?.claimable ?? false}
            loading={mission.loading}
            error={mission.error?.message ?? null}
            updating={mission.updatingMissionNumber === selectedMissionNumber}
            onClaim={claimMission}
            onAlternative={onAlternative}
            onRetry={() => void mission.refetch()}
          />
        </div>
        <div className="border-border bg-card shadow-soft rounded-2xl border">
          <QuickReflection />
        </div>
      </div>

      <div className="border-border bg-card shadow-soft rounded-2xl border">
        <PrivateCheckIn
          key={todayCheckIn?.recordedAt ?? 'empty-check-in'}
          initialMood={todayCheckIn?.mood}
          initialUrge={todayCheckIn ? todayCheckIn.urge : undefined}
          onSave={onSaveCheckIn}
        />
      </div>
    </section>
  );
}
