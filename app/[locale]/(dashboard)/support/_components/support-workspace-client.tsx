'use client';

import { LifeBuoy, MessageCircleHeart, MessagesSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CompactTabNav } from '@/components/common/compact-tab-nav';
import {
  DashboardPage,
  DashboardPageHeader,
} from '@/components/dashboard/dashboard-page';
import { useSupportRequest } from '@/hooks/use-support-request';
import { ROUTES } from '@/routes';
import { PartnerContactWorkspace } from './partner-contact-workspace';
import { SupportCaseHistory } from './support-case-history';
import { SupportRequestForm } from './support-request-form';

export type SupportChannel = 'team' | 'partner';

export function SupportWorkspaceClient({
  channel,
}: {
  channel: SupportChannel;
}) {
  const t = useTranslations('supportWorkspace');

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={LifeBuoy}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />
      <CompactTabNav<SupportChannel>
        ariaLabel={t('channelNavigationLabel')}
        value={channel}
        className="w-full max-w-md sm:w-auto"
        items={[
          {
            value: 'team',
            href: `${ROUTES.SUPPORT}?channel=team`,
            icon: <MessagesSquare aria-hidden="true" />,
            label: t('teamChannelTitle'),
            activeAdornment: <span className="bg-sage size-1.5 shrink-0 rounded-full" />,
          },
          {
            value: 'partner',
            href: `${ROUTES.SUPPORT}?channel=partner`,
            icon: <MessageCircleHeart aria-hidden="true" />,
            label: t('partnerChannelTitle'),
            activeAdornment: <span className="bg-sage size-1.5 shrink-0 rounded-full" />,
          },
        ]}
      />
      {channel === 'partner' ? (
        <PartnerContactWorkspace />
      ) : (
        <TeamSupportWorkspace />
      )}
    </DashboardPage>
  );
}

function TeamSupportWorkspace() {
  const support = useSupportRequest();

  return (
    <div className="grid gap-5 xl:grid-cols-12 xl:items-stretch">
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
  );
}
