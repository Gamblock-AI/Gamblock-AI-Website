'use client';

import { CircleAlert } from 'lucide-react';
import { Reveal } from '@/components/common/Reveal';
import { useLocale, useTranslations } from 'next-intl';
import { DashboardWelcome } from '@/components/dashboard/today/dashboard-welcome';
import { DashboardSummaryStrip } from '@/components/dashboard/today/dashboard-summary-strip';
import { BiteSizedLearning } from '@/components/dashboard/today/bite-sized-learning';
import { DashboardShortcuts } from '@/components/dashboard/today/dashboard-shortcuts';
import { EmergencyHelp } from '@/components/dashboard/today/emergency-help';
import { LearningNextStep } from '@/components/dashboard/today/learning-next-step';
import { ProtectionSummary } from '@/components/dashboard/today/protection-summary';
import { WeeklySnapshot } from '@/components/dashboard/today/weekly-snapshot';
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
    <div className="mx-auto w-full max-w-[1360px] space-y-5 sm:space-y-6">
      <Reveal y={12} duration={0.45}>
        <DashboardWelcome
          name={name}
          protectionActive={protection.status?.mode === 'active'}
        />
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
      {/* Education leads the canvas (psychologist-review request): the next
          learning step sits directly below the greeting. */}
      <Reveal y={12} duration={0.45} delay={0.05}>
        <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
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
        <DashboardSummaryStrip
          summary={summary}
          summaryLoading={summaryLoading}
          checkIns={recovery.state.checkIns}
        />
      </Reveal>
      <Reveal y={12} duration={0.45} delay={0.15}>
        <div className="grid gap-5 xl:grid-cols-12 xl:items-stretch">
        <div className="xl:col-span-8">
          <WeeklySnapshot checkIns={recovery.state.checkIns} />
        </div>
        <aside
          className="flex flex-col gap-5 xl:col-span-4"
          aria-label={t('protectionTitle')}
        >
          <div className="flex flex-1">
            <ProtectionSummary
              status={protection.status}
              loading={protection.loading}
              error={protection.error}
              onRetry={() => void protection.refetch()}
            />
          </div>
          <BiteSizedLearning />
        </aside>
        </div>
      </Reveal>
      <Reveal y={12} duration={0.45} delay={0.2}>
        <DashboardShortcuts />
      </Reveal>
    </div>
  );
}
