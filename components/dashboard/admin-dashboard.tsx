'use client';

import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BookOpen,
  CircleAlert,
  FileCheck2,
  KeyRound,
  Microscope,
  Settings2,
  ShieldCheck,
  Tickets,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AdminVerificationCard } from '@/components/dashboard/admin-verification-card';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminOperations } from '@/hooks/use-admin-operations';
import { useLocalUser } from '@/hooks/use-local-user';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

export function AdminDashboard({ name }: { name: string }) {
  const t = useTranslations('adminDashboard');
  const user = useLocalUser();
  const verified = Boolean(user.email_verified_at);
  const operations = useAdminOperations(
    verified ? user.role : undefined,
    'overview'
  );
  const overview = operations.overview;

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={ShieldCheck}
        eyebrow={t('eyebrow')}
        title={t('title', { name: name || t('defaultName') })}
        description={t('description')}
        aside={<DashboardStatus tone="navy">{t('role')}</DashboardStatus>}
      />

      {!verified ? (
        <AdminVerificationCard />
      ) : operations.loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" role="status">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
          <span className="sr-only">{t('loading')}</span>
        </div>
      ) : operations.error || !overview ? (
        <DashboardNotice
          icon={CircleAlert}
          title={t('errorTitle')}
          tone="amber"
          role="alert"
          action={
            <Button variant="outline" onClick={() => void operations.refetch()}>
              {t('retry')}
            </Button>
          }
        >
          {t('errorBody')}
        </DashboardNotice>
      ) : (
        <>
          <section aria-labelledby="attention-title">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <h2 id="attention-title" className="text-navy text-lg font-bold">
                  {t('attentionTitle')}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {t('attentionBody')}
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <AttentionMetric label={t('reviewContent')} value={overview.review_content ?? 0} />
              <AttentionMetric label={t('unassignedTickets')} value={overview.unassigned_support ?? 0} />
              <AttentionMetric label={t('failedData')} value={overview.failed_data_requests ?? 0} />
              <AttentionMetric label={t('pendingEmergency')} value={overview.pending_emergency ?? 0} />
            </div>
          </section>

          <DashboardPanel
            icon={ShieldCheck}
            title={t('workspaceTitle')}
            description={t('workspaceBody')}
            surface="flat"
            className="p-0"
            contentClassName="mt-4"
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <WorkspaceLink
                href={ROUTES.ADMIN_CONTENT}
                icon={BookOpen}
                title={t('contentTitle')}
                primaryLabel={t('draftContent')}
                primaryValue={overview.draft_content ?? 0}
                secondaryLabel={t('reviewContent')}
                secondaryValue={overview.review_content ?? 0}
              />
              <WorkspaceLink
                href={ROUTES.ADMIN_RELEASES}
                icon={FileCheck2}
                title={t('releaseTitle')}
                primaryLabel={t('validatedReleases')}
                primaryValue={overview.validated_releases ?? 0}
                secondaryLabel={t('activeRollouts')}
                secondaryValue={overview.active_rollouts ?? 0}
              />
              <WorkspaceLink
                href={ROUTES.ADMIN_TICKETS}
                icon={Tickets}
                title={t('ticketTitle')}
                primaryLabel={t('openTickets')}
                primaryValue={overview.open_support ?? 0}
                secondaryLabel={t('unassignedTickets')}
                secondaryValue={overview.unassigned_support ?? 0}
              />
              <WorkspaceLink
                href={ROUTES.ADMIN_EMERGENCY}
                icon={KeyRound}
                title={t('emergencyTitle')}
                primaryLabel={t('pendingEmergency')}
                primaryValue={overview.pending_emergency ?? 0}
                secondaryLabel={t('dualControl')}
                secondaryValue={t('required')}
              />
              <WorkspaceLink
                href={ROUTES.ADMIN_PLATFORM}
                icon={Settings2}
                title={t('platformTitle')}
                primaryLabel={t('activeAdmins')}
                primaryValue={overview.active_operators ?? 0}
                secondaryLabel={t('visibleSocial')}
                secondaryValue={overview.visible_social_links ?? 0}
              />
              <WorkspaceLink
                href={ROUTES.RESEARCH_SANDBOX}
                icon={Microscope}
                title={t('researchTitle')}
                primaryLabel={t('researchMode')}
                primaryValue={t('synthetic')}
                secondaryLabel={t('privacyBoundary')}
                secondaryValue={t('aggregateOnly')}
              />
            </div>
          </DashboardPanel>
        </>
      )}
    </DashboardPage>
  );
}

function AttentionMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border bg-card shadow-soft rounded-2xl border p-4">
      <p className="text-muted-foreground text-xs font-semibold">{label}</p>
      <p className="text-navy mt-2 text-3xl font-extrabold tabular-nums">{value}</p>
    </div>
  );
}

function WorkspaceLink({
  href,
  icon: Icon,
  title,
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  primaryLabel: string;
  primaryValue: number | string;
  secondaryLabel: string;
  secondaryValue: number | string;
}) {
  const t = useTranslations('adminDashboard');
  return (
    <Link
      href={href}
      className="group border-border bg-card hover:border-navy/30 focus-visible:ring-navy/30 rounded-2xl border p-5 shadow-soft outline-none transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-card focus-visible:ring-2 motion-reduce:transform-none motion-reduce:transition-none"
    >
      <div className="flex items-center gap-3">
        <span className="bg-azure text-navy flex size-10 items-center justify-center rounded-xl">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <h3 className="text-navy flex-1 font-bold">{title}</h3>
        <ArrowRight className="text-navy size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3">
        <Metric label={primaryLabel} value={primaryValue} />
        <Metric label={secondaryLabel} value={secondaryValue} />
      </dl>
      <span className="text-navy mt-4 block text-sm font-semibold">{t('openWorkspace')}</span>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs leading-5">{label}</dt>
      <dd className="text-navy mt-1 text-lg font-extrabold tabular-nums">{value}</dd>
    </div>
  );
}
