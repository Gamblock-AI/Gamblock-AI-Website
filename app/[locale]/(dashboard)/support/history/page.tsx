import { FileWarning } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardPage,
  DashboardPageHeader,
} from '@/components/dashboard/dashboard-page';
import { SupportHistoryPageClient } from '../_components/support-case-history';

export default function SupportHistoryPage() {
  const t = useTranslations('supportWorkspace');

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={FileWarning}
        eyebrow={t('eyebrow')}
        title={t('historyPageTitle')}
        description={t('historyPageBody')}
      />
      <SupportHistoryPageClient />
    </DashboardPage>
  );
}
