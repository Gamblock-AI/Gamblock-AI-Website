'use client';

import { DashboardPage } from '@/components/dashboard/dashboard-page';
import { AdminVerificationCard } from '@/components/dashboard/admin-verification-card';
import {
  type AdminArea,
  useAdminOperations,
} from '@/hooks/use-admin-operations';
import { useLocalUser } from '@/hooks/use-local-user';
import { useTranslations } from 'next-intl';
import { AdminHeader } from './admin-header';
import { AdminErrorState, AdminLoadingState } from './admin-state';
import { ContentTab } from './content-tab';
import { EmergencyTab } from './emergency-tab';
import { PlatformTab } from './platform-tab';
import { ReleaseTab } from './release-tab';
import { SupportTab } from './support-tab';

type AdminPageArea = Exclude<AdminArea, 'overview' | 'all'>;

export function AdminAreaClient({
  area,
  moduleID,
  caseID,
}: {
  area: AdminPageArea;
  moduleID?: string;
  caseID?: string;
}) {
  const t = useTranslations('adminPage');
  const user = useLocalUser();
  const verifiedRole = user.email_verified_at ? user.role : undefined;
  const operations = useAdminOperations(verifiedRole, area);
  const header =
    area === 'content'
      ? { title: t('tabContent'), description: t('contentDescription') }
      : area === 'releases'
        ? { title: t('tabReleases'), description: t('releaseDescription') }
        : area === 'tickets'
          ? { title: t('tabTickets'), description: t('supportDescription') }
          : area === 'emergency'
            ? {
                title: t('tabEmergency'),
                description: t('emergencyDescription'),
              }
            : { title: t('tabPlatform'), description: t('platformDescription') };

  return (
    <DashboardPage density="compact" className="max-w-none">
      <AdminHeader
        title={header.title}
        description={header.description}
        role={user.role}
      />
      {!user.email_verified_at ? (
        <AdminVerificationCard />
      ) : operations.loading ? (
        <AdminLoadingState label={t('loading')} />
      ) : operations.error ? (
        <AdminErrorState
          label={t('fetchError')}
          retryLabel={t('retry')}
          onRetry={() => void operations.refetch()}
        />
      ) : area === 'content' ? (
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
          moduleID={moduleID}
        />
      ) : area === 'releases' ? (
        <ReleaseTab
          allReleases={operations.releases}
          rollouts={operations.rollouts}
          createModelRelease={operations.createRelease}
          uploadReleaseArtifact={operations.uploadReleaseArtifact}
          createRollout={operations.createRollout}
          transitionRollout={operations.transitionRollout}
        />
      ) : area === 'tickets' ? (
        <SupportTab
          userId={user.id}
          cases={operations.cases}
          dataRequests={operations.dataRequests}
          getSupportCase={operations.getSupportCase}
          claimSupportCase={operations.claimSupportCase}
          releaseSupportCase={operations.releaseSupportCase}
          replySupportCase={operations.replySupportCase}
          transitionSupportCase={operations.transitionSupportCase}
          retryDataRequest={operations.retryDataRequest}
          rejectDataRequest={operations.rejectDataRequest}
          caseID={caseID}
        />
      ) : area === 'emergency' ? (
        <EmergencyTab
          userId={user.id}
          requests={operations.emergencyRequests}
          emergencyKey={operations.emergencyKey}
          keyLoading={operations.keyLoading}
          clearEmergencyKey={operations.clearEmergencyKey}
          reviewEmergencyKey={operations.reviewEmergencyKey}
          approveEmergencyKey={operations.approveEmergencyKey}
        />
      ) : (
        <PlatformTab
          socialLinks={operations.socialLinks}
          accounts={operations.accounts}
          currentUserId={user.id}
          auditEvents={operations.auditEvents}
          replaceSocialLinks={operations.replaceSocialLinks}
          createAccount={operations.createAccount}
          updateAccount={operations.updateAccount}
        />
      )}
    </DashboardPage>
  );
}
