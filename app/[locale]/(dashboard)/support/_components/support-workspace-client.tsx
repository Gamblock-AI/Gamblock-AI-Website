'use client';

import { LifeBuoy, MessageCircleHeart, MessagesSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardPage,
  DashboardPageHeader,
} from '@/components/dashboard/dashboard-page';
import { useSupportRequest } from '@/hooks/use-support-request';
import { Link } from '@/i18n/routing';
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
      <nav
        aria-label={t('channelNavigationLabel')}
        className="border-border bg-card shadow-soft grid gap-1 rounded-2xl border p-1.5 sm:grid-cols-2"
      >
        <ChannelLink
          active={channel === 'partner'}
          href={`${ROUTES.SUPPORT}?channel=partner`}
          icon={MessageCircleHeart}
          title={t('partnerChannelTitle')}
        />
        <ChannelLink
          active={channel === 'team'}
          href={`${ROUTES.SUPPORT}?channel=team`}
          icon={MessagesSquare}
          title={t('teamChannelTitle')}
        />
      </nav>
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

function ChannelLink({
  active,
  href,
  icon: Icon,
  title,
}: {
  active: boolean;
  href: string;
  icon: typeof MessageCircleHeart;
  title: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`focus-visible:ring-navy/30 flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-200 outline-none focus-visible:ring-2 motion-reduce:transition-none ${
        active
          ? 'border-navy bg-navy text-white shadow-sm'
          : 'text-navy hover:bg-muted/55 border-transparent'
      }`}
    >
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
          active ? 'bg-white/15 text-white' : 'bg-azure/75 text-navy'
        }`}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 text-sm font-bold">{title}</span>
    </Link>
  );
}
