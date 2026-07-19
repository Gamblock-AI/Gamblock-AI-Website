'use client';

import { useMemo, useState } from 'react';
import {
  Beaker,
  CircleAlert,
  Download,
  FlaskConical,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const stages = [
  { id: 'SYN-EXPERT-001', metric: 'content_clarity', value: 4.2, unit: '/5' },
  { id: 'SYN-USABILITY-001', metric: 'task_completion', value: 83, unit: '%' },
  { id: 'SYN-PI-001', metric: 'self_reported_pause', value: 62, unit: '%' },
  { id: 'SYN-ENGAGEMENT-001', metric: 'day_7_return', value: 58, unit: '%' },
] as const;

type StageId = (typeof stages)[number]['id'];

function buildFixture(stageId: string) {
  return Array.from({ length: 48 }, (_, index) => ({
    participant_id: `${stageId}-P${String(index + 1).padStart(3, '0')}`,
    stage_id: stageId,
    cohort: index % 2 === 0 ? 'fixture_a' : 'fixture_b',
    completed: index % 6 !== 0,
    score_1_to_5: ((index * 3) % 5) + 1,
    duration_seconds: 45 + ((index * 17) % 91),
    synthetic: true,
  }));
}

export default function ResearchSandboxPage() {
  const t = useTranslations('researchSandbox');
  const [selectedStage, setSelectedStage] = useState<StageId>(stages[0].id);
  const fixture = useMemo(() => buildFixture(selectedStage), [selectedStage]);

  const downloadFixture = () => {
    const payload = {
      schema_version: 'synthetic-research-v1',
      generated_for: 'Gamblock-AI evaluator sandbox',
      warning: 'Synthetic fixture only. Not research evidence.',
      records: fixture,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${selectedStage.toLowerCase()}-fixture.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardPage density="compact">
      <DashboardPageHeader
        icon={FlaskConical}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <DashboardNotice
        icon={CircleAlert}
        title={t('warningTitle')}
        tone="amber"
      >
        {t('warningBody')}
      </DashboardNotice>

      <div className="grid gap-5 xl:grid-cols-12">
        <DashboardPanel
          icon={Beaker}
          title={t('stagesTitle')}
          description={t('stagesBody')}
          className="flex h-full flex-col xl:col-span-8"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {stages.map((stage) => {
              const selected = stage.id === selectedStage;
              return (
                <button
                  key={stage.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSelectedStage(stage.id)}
                  className={cn(
                    'focus-visible:ring-navy/30 rounded-2xl border p-4 text-left transition-[transform,border-color,background-color] duration-200 outline-none hover:-translate-y-0.5 focus-visible:ring-2 motion-reduce:transform-none motion-reduce:transition-none',
                    selected
                      ? 'border-navy/30 bg-azure/45'
                      : 'border-border bg-card hover:border-navy/20'
                  )}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-navy font-mono text-xs font-bold">
                      {stage.id}
                    </span>
                    <DashboardStatus tone="muted">
                      {t('synthetic')}
                    </DashboardStatus>
                  </span>
                  <span className="text-navy mt-5 block text-2xl font-extrabold tabular-nums">
                    {stage.value}
                    {stage.unit}
                  </span>
                  <span className="text-muted-foreground mt-1 block text-xs">
                    {t(`metrics.${stage.metric}`)}
                  </span>
                </button>
              );
            })}
          </div>
        </DashboardPanel>

        <DashboardPanel
          icon={Users}
          title={t('fixtureTitle')}
          description={t('fixtureBody')}
          className="flex h-full flex-col xl:col-span-4"
          contentClassName="flex-1 flex flex-col justify-between"
        >
          <dl className="divide-border divide-y">
            <div className="flex items-center justify-between py-3">
              <dt className="text-muted-foreground text-sm">{t('records')}</dt>
              <dd className="text-navy font-bold tabular-nums">48</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-muted-foreground text-sm">
                {t('suppression')}
              </dt>
              <dd className="text-navy font-bold">n &lt; 6</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-muted-foreground text-sm">
                {t('realEnrollment')}
              </dt>
              <dd>
                <DashboardStatus tone="muted">{t('locked')}</DashboardStatus>
              </dd>
            </div>
          </dl>
          <Button
            variant="outline"
            className="mt-5 w-full"
            onClick={downloadFixture}
          >
            <Download className="size-4" aria-hidden="true" />
            {t('download')}
          </Button>
        </DashboardPanel>
      </div>

      <p className="text-muted-foreground text-xs leading-5">{t('footnote')}</p>
    </DashboardPage>
  );
}
