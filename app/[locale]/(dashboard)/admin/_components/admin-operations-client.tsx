'use client';

import { DashboardPage } from '@/components/dashboard/dashboard-page';
import { useAdminOperations } from '@/hooks/use-admin-operations';
import { useLocalUser } from '@/hooks/use-local-user';
import { useTranslations } from 'next-intl';
import { AdminHeader } from './admin-header';
import { AdminNoAccess } from './admin-state';
import { AdminTabs } from './admin-tabs';

export function AdminOperationsClient() {
  const t = useTranslations('adminPage');
  const user = useLocalUser();
  const operations = useAdminOperations(user.role);
  const hasAccess = Object.values(operations.capabilities).some(Boolean);

  return (
    <DashboardPage density="compact" className="max-w-none">
      <AdminHeader
        title={t('title')}
        description={t('description')}
        role={user.role}
      />
      {!hasAccess && user.role ? (
        <AdminNoAccess title={t('noAccessTitle')} body={t('noAccessBody')} />
      ) : (
        <AdminTabs role={user.role} userId={user.id} operations={operations} />
      )}
    </DashboardPage>
  );
}
