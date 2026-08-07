'use client';

import { useState } from 'react';
import { CircleAlert } from 'lucide-react';
import { Reveal } from '@/components/common/Reveal';
import { useLocale, useTranslations } from 'next-intl';
import { DashboardWelcome } from '@/components/dashboard/today/dashboard-welcome';
import { DashboardSummaryStrip } from '@/components/dashboard/today/dashboard-summary-strip';
import { EmergencyHelp } from '@/components/dashboard/today/emergency-help';
import { LearningNextStep } from '@/components/dashboard/today/learning-next-step';
import { ProtectionSummary } from '@/components/dashboard/today/protection-summary';
import { WeeklySnapshot } from '@/components/dashboard/today/weekly-snapshot';
import { StudentNextAction } from '@/components/dashboard/today/student-next-action';
import { NiatPerubahanGate } from '@/components/dashboard/today/niat-perubahan-gate';
import { GamificationSummaryCard } from '@/components/dashboard/today/gamification-summary-card';
import { StudentGamificationFab } from '@/components/dashboard/student-gamification-fab';
import { useDashboardSummary } from '@/hooks/use-dashboard-summary';
import { useEducationModules } from '@/hooks/use-education';
import { useProtectionStatus } from '@/hooks/use-protection-status';
import { useRecoveryJourney } from '@/hooks/use-recovery-journey';

interface StudentDashboardProps {
  name: string;
}

export function StudentDashboard({ name }: StudentDashboardProps) {
  const t = useTranslations('recoveryDashboard');
  const locale = useLocale();
  const recovery = useRecoveryJourney();
  const protection = useProtectionStatus();
  const { summary, loading: summaryLoading } = useDashboardSummary();
  const education = useEducationModules(locale);
  const [missionsOpen, setMissionsOpen] = useState(false);

  const learningModule =
    education.modules.find(
      (module) =>
        module.progress.progress_percent > 0 &&
        module.progress.progress_percent < 100
    ) ??
    education.modules.find(
      (module) => module.progress.progress_percent < 100
    ) ??
    education.modules[0] ??
    null;

  return (
    <NiatPerubahanGate>
      <div className="mx-auto w-full max-w-[1360px] space-y-4 sm:space-y-5">
      <Reveal y={12} duration={0.45}>
        <DashboardWelcome
          name={name}
          protectionActive={protection.status?.mode === 'active'}
          currentStreak={summary?.current_streak ?? null}
          activeDays={summary?.active_days ?? null}
        />
      </Reveal>

      {/* Main Gamification Summary Card */}
      <Reveal y={12} duration={0.45} delay={0.03}>
        <GamificationSummaryCard onOpenMissions={() => setMissionsOpen(true)} />
      </Reveal>

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

      {/* Original Side-by-Side 2-Column Grid */}
      <Reveal y={12} duration={0.45} delay={0.05}>
        <div className="grid items-stretch gap-4 lg:grid-cols-2">
          <LearningNextStep
            module={learningModule}
            loading={education.loading}
            error={education.error}
            onRetry={() => void education.refetch()}
          />
          <EmergencyHelp />
        </div>
      </Reveal>

      <Reveal y={12} duration={0.45} delay={0.1}>
        <StudentNextAction />
      </Reveal>

      <Reveal y={12} duration={0.45} delay={0.12}>
        <DashboardSummaryStrip
          summary={summary}
          summaryLoading={summaryLoading}
          checkIns={recovery.state.checkIns}
        />
      </Reveal>

      <Reveal y={12} duration={0.45} delay={0.15}>
        <div className="grid items-stretch gap-4 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <WeeklySnapshot checkIns={recovery.state.checkIns} />
          </div>
          <div className="xl:col-span-5">
            <ProtectionSummary
              status={protection.status}
              loading={protection.loading}
              error={protection.error}
              onRetry={() => void protection.refetch()}
            />
          </div>
        </div>
      </Reveal>

      {/* Floating Action Button for Daily Missions & EXP Claim */}
      <StudentGamificationFab
        open={missionsOpen}
        onOpenChange={setMissionsOpen}
      />
    </div>
    </NiatPerubahanGate>
  );
}
