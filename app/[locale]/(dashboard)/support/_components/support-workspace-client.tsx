'use client';

import { LifeBuoy, MessageCircleHeart, MessagesSquare, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CompactTabNav } from '@/components/common/compact-tab-nav';
import {
  DashboardPage,
  DashboardPageHeader,
} from '@/components/dashboard/dashboard-page';
import { useLocalUser } from '@/hooks/use-local-user';
import { useQueryTab } from '@/hooks/use-query-tab';
import { useSupportRequest } from '@/hooks/use-support-request';
import { DASHBOARD_QUERY_KEYS } from '@/routes';
import { HotlineWorkspace } from './hotline-workspace';
import { PartnerContactWorkspace } from './partner-contact-workspace';
import { SupportCaseHistory } from './support-case-history';
import { SupportRequestForm } from './support-request-form';

export type SupportChannel = 'team' | 'partner' | 'hotline';

export function SupportWorkspaceClient() {
  const t = useTranslations('supportWorkspace');
  const user = useLocalUser();
  const isPartner = user.role === 'partner';
  const { value: channel, setValue: setChannel } = useQueryTab<SupportChannel>({
    queryKey: DASHBOARD_QUERY_KEYS.supportTab,
    values: ['partner', 'team', 'hotline'],
    defaultValue: 'partner',
    resetKeys: [
      DASHBOARD_QUERY_KEYS.pages.incomingContacts,
      DASHBOARD_QUERY_KEYS.pages.contactHistory,
      DASHBOARD_QUERY_KEYS.pages.contactRequests,
      DASHBOARD_QUERY_KEYS.pages.supportHistory,
    ],
    removeKeys: ['channel'],
  });

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={LifeBuoy}
        eyebrow={isPartner ? t('partnerEyebrow') : t('eyebrow')}
        title={isPartner ? t('partnerWorkspaceTitle') : t('title')}
        description={
          isPartner ? t('partnerWorkspaceDescription') : t('description')
        }
      />
      <CompactTabNav<SupportChannel>
        ariaLabel={
          isPartner
            ? t('partnerChannelNavigationLabel')
            : t('channelNavigationLabel')
        }
        value={channel}
        onValueChange={setChannel}
        className="w-full sm:w-auto"
        items={[
          {
            value: 'partner',
            icon: <MessageCircleHeart aria-hidden="true" />,
            label: isPartner
              ? t('studentRequestsChannelTitle')
              : t('partnerChannelTitle'),
            activeAdornment: (
              <span className="bg-sage size-1.5 shrink-0 rounded-full" />
            ),
          },
          {
            value: 'team',
            icon: <MessagesSquare aria-hidden="true" />,
            label: t('teamChannelTitle'),
            activeAdornment: (
              <span className="bg-sage size-1.5 shrink-0 rounded-full" />
            ),
          },
          {
            value: 'hotline',
            icon: <Phone aria-hidden="true" />,
            label: t('hotlineChannelTitle'),
            activeAdornment: (
              <span className="bg-sage size-1.5 shrink-0 rounded-full" />
            ),
          },
        ]}
      />
      {channel === 'partner' ? (
        <PartnerContactWorkspace />
      ) : channel === 'hotline' ? (
        <HotlineWorkspace />
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
