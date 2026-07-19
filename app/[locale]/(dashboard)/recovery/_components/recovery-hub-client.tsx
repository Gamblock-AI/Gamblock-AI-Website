'use client';

import { HeartHandshake, UsersRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardPage,
  DashboardPageHeader,
} from '@/components/dashboard/dashboard-page';
import { useLocalUser } from '@/hooks/use-local-user';
import { PartnerResponseSimulator } from './partner-response-simulator';
import { RecoveryRoom } from './recovery-room';

export function RecoveryHubClient() {
  const user = useLocalUser();
  return user.role === 'partner' ? (
    <PartnerRecoveryGuide />
  ) : (
    <StudentRecoveryHub />
  );
}

function StudentRecoveryHub() {
  const t = useTranslations('recoveryHub');

  return (
    <DashboardPage>
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

function PartnerRecoveryGuide() {
  const t = useTranslations('partnerSimulator');

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={UsersRound}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />
      <PartnerResponseSimulator />
    </DashboardPage>
  );
}
