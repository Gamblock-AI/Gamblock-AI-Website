import { useTranslations } from 'next-intl';
import { DashboardStatus } from '@/components/dashboard/dashboard-page';
import {
  dynamicLabelFallback,
  dynamicLabelKey,
  normalizeSupportStatus,
} from '@/lib/i18n/dynamic-labels';

const supportStatusTones = {
  waiting_support: 'navy',
  waiting_user: 'amber',
  resolved: 'sage',
  closed: 'muted',
} as const;

export function SupportStatusBadge({ status }: { status: string }) {
  const t = useTranslations('dynamicLabels');
  const normalizedStatus = normalizeSupportStatus(status);
  const tone =
    supportStatusTones[normalizedStatus as keyof typeof supportStatusTones] ??
    'muted';

  return (
    <DashboardStatus tone={tone}>
      {t(dynamicLabelKey('supportStatus', normalizedStatus), {
        value: dynamicLabelFallback(status),
      })}
    </DashboardStatus>
  );
}
