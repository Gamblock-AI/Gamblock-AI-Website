import {
  BookOpen,
  KeyRound,
  LifeBuoy,
  Settings2,
  Terminal,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminOperations } from '@/hooks/use-admin-operations';
import { ContentTab } from './content-tab';
import { EmergencyTab } from './emergency-tab';
import { ReleaseTab } from './release-tab';
import { AdminErrorState, AdminLoadingState } from './admin-state';
import { SupportTab } from './support-tab';
import { PlatformTab } from './platform-tab';

type AdminOperations = ReturnType<typeof useAdminOperations>;

interface AdminTabsProps {
  role?: string;
  userId?: string;
  operations: AdminOperations;
}

export function AdminTabs({ role, userId, operations }: AdminTabsProps) {
  const t = useTranslations('adminPage');
  const defaultTab = operations.capabilities.content
    ? 'content'
    : operations.capabilities.releases
      ? 'releases'
      : operations.capabilities.support
        ? 'support'
        : operations.capabilities.platform
          ? 'platform'
          : 'emergency';
  const overview = operations.overview;
  const overviewEntries = operations.capabilities.content
    ? [
        [t('metricDraftContent'), overview?.draft_content ?? 0],
        [t('metricReviewContent'), overview?.review_content ?? 0],
      ]
    : operations.capabilities.releases
      ? [
          [t('metricValidatedReleases'), overview?.validated_releases ?? 0],
          [t('metricActiveRollouts'), overview?.active_rollouts ?? 0],
        ]
      : operations.capabilities.support
        ? [
            [t('metricOpenSupport'), overview?.open_support ?? 0],
            [t('metricUnassignedSupport'), overview?.unassigned_support ?? 0],
            [t('metricFailedData'), overview?.failed_data_requests ?? 0],
          ]
        : [
            [t('metricPendingEmergency'), overview?.pending_emergency ?? 0],
            [t('metricActiveOperators'), overview?.active_operators ?? 0],
            [t('metricVisibleSocial'), overview?.visible_social_links ?? 0],
          ];

  return (
    <Tabs key={role ?? 'loading'} defaultValue={defaultTab} className="w-full">
      {!operations.loading && !operations.error ? (
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {overviewEntries.map(([label, value]) => (
            <div
              key={label}
              className="border-border bg-card rounded-2xl border p-4"
            >
              <p className="text-muted-foreground text-xs font-semibold">
                {label}
              </p>
              <p className="text-navy mt-2 text-2xl font-extrabold">{value}</p>
            </div>
          ))}
        </div>
      ) : null}
      <TabsList className="border-border bg-muted/60 mb-3 flex w-full max-w-full justify-start gap-1 overflow-x-auto overflow-y-hidden rounded-xl border p-1 group-data-horizontal/tabs:h-auto sm:w-fit">
        {operations.capabilities.content ? (
          <TabsTrigger value="content" className="min-h-10 gap-2 px-4">
            <BookOpen className="size-4" aria-hidden="true" />
            {t('tabContent')}
          </TabsTrigger>
        ) : null}
        {operations.capabilities.releases ? (
          <TabsTrigger value="releases" className="min-h-10 gap-2 px-4">
            <Terminal className="size-4" aria-hidden="true" />
            {t('tabReleases')}
          </TabsTrigger>
        ) : null}
        {operations.capabilities.support ? (
          <TabsTrigger value="support" className="min-h-10 gap-2 px-4">
            <LifeBuoy className="size-4" aria-hidden="true" />
            {t('tabTickets')}
          </TabsTrigger>
        ) : null}
        {operations.capabilities.emergency ? (
          <TabsTrigger value="emergency" className="min-h-10 gap-2 px-4">
            <KeyRound className="size-4" aria-hidden="true" />
            {t('tabEmergency')}
          </TabsTrigger>
        ) : null}
        {operations.capabilities.platform ? (
          <TabsTrigger value="platform" className="min-h-10 gap-2 px-4">
            <Settings2 className="size-4" aria-hidden="true" />
            {t('tabPlatform')}
          </TabsTrigger>
        ) : null}
      </TabsList>
      {operations.loading ? (
        <AdminLoadingState label={t('loading')} />
      ) : operations.error ? (
        <AdminErrorState
          label={t('fetchError')}
          retryLabel={t('retry')}
          onRetry={() => void operations.refetch()}
        />
      ) : (
        <>
          {operations.capabilities.content ? (
            <TabsContent value="content">
              <ContentTab
                modules={operations.modules}
                createModule={operations.createModule}
                getModule={operations.getModule}
                saveModule={operations.saveModule}
                transitionModule={operations.transitionModule}
                uploadEducationMedia={operations.uploadEducationMedia}
                registerExternalEducationMedia={
                  operations.registerExternalEducationMedia
                }
                getModuleRevisions={operations.getModuleRevisions}
                rollbackModule={operations.rollbackModule}
              />
            </TabsContent>
          ) : null}
          {operations.capabilities.releases ? (
            <TabsContent value="releases">
              <ReleaseTab
                allReleases={operations.releases}
                rollouts={operations.rollouts}
                createModelRelease={operations.createRelease}
                uploadReleaseArtifact={operations.uploadReleaseArtifact}
                createRollout={operations.createRollout}
                transitionRollout={operations.transitionRollout}
              />
            </TabsContent>
          ) : null}
          {operations.capabilities.support ? (
            <TabsContent value="support">
              <SupportTab
                userId={userId}
                cases={operations.cases}
                dataRequests={operations.dataRequests}
                getSupportCase={operations.getSupportCase}
                claimSupportCase={operations.claimSupportCase}
                releaseSupportCase={operations.releaseSupportCase}
                replySupportCase={operations.replySupportCase}
                transitionSupportCase={operations.transitionSupportCase}
                retryDataRequest={operations.retryDataRequest}
                rejectDataRequest={operations.rejectDataRequest}
              />
            </TabsContent>
          ) : null}
          {operations.capabilities.emergency ? (
            <TabsContent value="emergency">
              <EmergencyTab
                userId={userId}
                requests={operations.emergencyRequests}
                emergencyKey={operations.emergencyKey}
                keyLoading={operations.keyLoading}
                clearEmergencyKey={operations.clearEmergencyKey}
                reviewEmergencyKey={operations.reviewEmergencyKey}
                approveEmergencyKey={operations.approveEmergencyKey}
              />
            </TabsContent>
          ) : null}
          {operations.capabilities.platform ? (
            <TabsContent value="platform">
              <PlatformTab
                socialLinks={operations.socialLinks}
                accounts={operations.operatorAccounts}
                invitations={operations.operatorInvitations}
                auditEvents={operations.auditEvents}
                replaceSocialLinks={operations.replaceSocialLinks}
                inviteOperator={operations.inviteOperator}
                revokeInvitation={operations.revokeOperatorInvitation}
                updateOperator={operations.updateOperator}
              />
            </TabsContent>
          ) : null}
        </>
      )}
    </Tabs>
  );
}
