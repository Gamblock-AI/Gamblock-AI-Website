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
        className="border-border/80 bg-muted/35 inline-flex min-h-11 w-full max-w-md items-center gap-1 rounded-2xl border p-1 shadow-inner sm:w-auto"
      >
        <ChannelLink
          active={channel === 'team'}
          href={`${ROUTES.SUPPORT}?channel=team`}
          icon={MessagesSquare}
          title={t('teamChannelTitle')}
        />
        <ChannelLink
          active={channel === 'partner'}
          href={`${ROUTES.SUPPORT}?channel=partner`}
          icon={MessageCircleHeart}
          title={t('partnerChannelTitle')}
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
      className={`group focus-visible:ring-navy/30 relative flex h-9 flex-1 items-center justify-center gap-2.5 rounded-xl px-4 text-xs font-semibold transition-all duration-200 outline-none focus-visible:ring-2 motion-reduce:transition-none sm:flex-initial sm:text-sm ${
        active
          ? 'bg-navy font-bold text-white shadow-sm ring-1 ring-black/10'
          : 'text-muted-foreground hover:bg-card/70 hover:text-navy'
      }`}
    >
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-md transition-colors ${
          active ? 'text-white' : 'text-navy/70 group-hover:text-navy'
        }`}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="whitespace-nowrap">{title}</span>
      {active ? (
        <span className="bg-sage size-1.5 shrink-0 rounded-full" />
      ) : null}
    </Link>
  );
}
