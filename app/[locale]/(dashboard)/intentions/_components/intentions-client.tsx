'use client';

import { Target } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardPage,
  DashboardPageHeader,
} from '@/components/dashboard/dashboard-page';
import { useRecoveryJourney } from '@/hooks/use-recovery-journey';
import type { CreateIntentionInput } from '@/lib/recovery/types';
import { IntentionSection } from '../../recovery/_components/intention-section';

export function IntentionsClient() {
  const t = useTranslations('recoveryHub');
  const recovery = useRecoveryJourney();
  const saveIntention = (input: CreateIntentionInput) => {
    if (recovery.activeIntention) {
      recovery.updateIntention(recovery.activeIntention.id, input);
      return;
    }
    recovery.createIntention(input);
  };

  return (
    <DashboardPage density="compact">
      <DashboardPageHeader
        icon={Target}
        eyebrow={t('intentionsEyebrow')}
        title={t('intentionsPageTitle')}
        description={t('intentionsPageDescription')}
      />
      <IntentionSection
        activeIntention={recovery.activeIntention}
        intentions={recovery.state.intentions}
        onSave={saveIntention}
        setIntentionStatus={recovery.setIntentionStatus}
      />
    </DashboardPage>
  );
}
