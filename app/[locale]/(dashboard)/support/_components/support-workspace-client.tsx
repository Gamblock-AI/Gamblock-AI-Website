'use client';

import { LifeBuoy, LockKeyhole } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
} from '@/components/dashboard/dashboard-page';
import { useSupportRequest } from '@/hooks/use-support-request';
import { SupportCaseHistory } from './support-case-history';
import { SupportRequestForm } from './support-request-form';

export function SupportWorkspaceClient() {
  const t = useTranslations('supportWorkspace');
  const support = useSupportRequest();

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={LifeBuoy}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />
      <div className="grid gap-5 xl:grid-cols-12 xl:items-start">
        <SupportRequestForm
          submitting={support.submitting}
          createCase={support.createCase}
        />
        <SupportCaseHistory
          cases={support.cases}
          loading={support.loading}
          error={support.error}
          onRetry={() => void support.refetch()}
        />
      </div>
    </DashboardPage>
  );
}
