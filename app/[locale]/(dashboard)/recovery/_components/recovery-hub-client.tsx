'use client';

import { HeartHandshake } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardPage,
  DashboardPageHeader,
} from '@/components/dashboard/dashboard-page';
import { RecoveryRoom } from './recovery-room';

export function RecoveryHubClient() {
  const t = useTranslations('recoveryHub');
  return (
    <DashboardPage density="compact">
      <DashboardPageHeader
        icon={HeartHandshake}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />
      <RecoveryRoom />
    </DashboardPage>
  );
}
