'use client';

import { useState } from 'react';
import { HeartHandshake, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
} from '@/components/dashboard/dashboard-page';
import { useRecoveryJourney } from '@/hooks/use-recovery-journey';
import { ClearLocalData } from './clear-local-data';
import { IntentionSection } from './intention-section';
import { JournalSection } from './journal-section';
import { RecoveryLinks } from './recovery-links';
import { SkillsSection } from './skills-section';

export function RecoveryHubClient() {
  const t = useTranslations('recoveryHub');
  const recoveryT = useTranslations('recoveryDashboard');
  const {
    state,
    persistence,
    activeIntention,
    createIntention,
    updateIntention,
    setIntentionStatus,
    clearRecoveryData,
  } = useRecoveryJourney();
  const [cleared, setCleared] = useState(false);

  const saveIntention = (value: string) => {
    setCleared(false);
    if (activeIntention) {
      updateIntention(activeIntention.id, { title: value });
      return;
    }
    createIntention({ title: value });
  };

  const clearLocalData = () => {
    clearRecoveryData();
    setCleared(true);
  };

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={HeartHandshake}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />
      {persistence === 'memory' ? (
        <div
          className="border-amber/30 bg-amber/[0.06] text-foreground rounded-2xl border p-4 text-sm leading-6"
          role="status"
        >
          {recoveryT('memoryOnlyWarning')}
        </div>
      ) : null}
      <IntentionSection
        activeIntention={activeIntention}
        intentions={state.intentions}
        onSave={saveIntention}
        setIntentionStatus={setIntentionStatus}
      />
      <JournalSection />
      <SkillsSection />
      <RecoveryLinks />
      <ClearLocalData cleared={cleared} onClear={clearLocalData} />
      <footer className="text-muted-foreground flex items-start gap-2 text-xs leading-5">
        <ShieldCheck
          className="text-sage mt-0.5 size-4 shrink-0"
          aria-hidden="true"
        />
        {t('privateBody')}
      </footer>
    </DashboardPage>
  );
}
