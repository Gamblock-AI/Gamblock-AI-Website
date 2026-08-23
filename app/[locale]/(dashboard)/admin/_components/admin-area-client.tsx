'use client';

import { DashboardPage } from '@/components/dashboard/dashboard-page';
import { AdminVerificationCard } from '@/components/dashboard/admin-verification-card';
import {
  type AdminArea,
  useAdminOperations,
} from '@/hooks/use-admin-operations';
import { useLocalUser } from '@/hooks/use-local-user';
import { useTranslations } from 'next-intl';
import {
  FileClock,
  FileText,
  GraduationCap,
  KeyRound,
  Settings2,
  Tickets,
} from 'lucide-react';
import { AdminHeader } from './admin-header';
import { AdminErrorState, AdminLoadingState } from './admin-state';
import { ContentTab } from './content-tab';
import { LearningHubTab } from './learning-hub-tab';
import { EmergencyTab } from './emergency-tab';
import { PlatformTab } from './platform-tab';
import { SupportTab } from './support-tab';
import { DataRequestsTab } from './data-requests-tab';

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
  const verifiedRole = user.phone_verified_at ? user.role : undefined;
  const operations = useAdminOperations(verifiedRole, area);
  const header =
    area === 'content'
      ? {
          title: t('tabContent'),
          description: t('contentDescription'),
          icon: FileText,
        }
      : area === 'learningHub'
        ? {
            title: t('tabLearningHub'),
            description: t('learningHubDescription'),
            icon: GraduationCap,
          }
        : area === 'tickets'
          ? {
              title: t('tabTickets'),
              description: t('supportDescription'),
              icon: Tickets,
            }
          : area === 'dataRequests'
            ? {
                title: t('tabDataRequests'),
                description: t('dataRequestsHelp'),
                icon: FileClock,
              }
            : area === 'emergency'
              ? {
                  title: t('tabEmergency'),
                  description: t('emergencyDescription'),
                  icon: KeyRound,
                }
              : {
                  title: t('tabPlatform'),
                  description: t('platformDescription'),
                  icon: Settings2,
                };

  return (
    <DashboardPage density="compact" className="max-w-none">
      <AdminHeader
        title={header.title}
        description={header.description}
        role={user.role}
        icon={header.icon}
      />
      {!user.phone_verified_at ? (
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
          deleteModule={operations.deleteModule}
          uploadEducationMedia={operations.uploadEducationMedia}
          registerExternalEducationMedia={
            operations.registerExternalEducationMedia
          }
          getModuleRevisions={operations.getModuleRevisions}
          rollbackModule={operations.rollbackModule}
          moduleID={moduleID}
        />
      ) : area === 'learningHub' ? (
        <LearningHubTab
          items={operations.learningHubItems}
          taxonomy={operations.learningHubTaxonomy}
          createItem={operations.createLearningHubItem}
          saveItem={operations.saveLearningHubItem}
          transitionItem={operations.transitionLearningHubItem}
          deleteItem={operations.deleteLearningHubItem}
          getRevisions={operations.getLearningHubRevisions}
          rollbackItem={operations.rollbackLearningHubItem}
          createCluster={operations.createLearningHubCluster}
          updateCluster={operations.updateLearningHubCluster}
          deleteCluster={operations.deleteLearningHubCluster}
          createProgram={operations.createLearningHubProgram}
          updateProgram={operations.updateLearningHubProgram}
          deleteProgram={operations.deleteLearningHubProgram}
          uploadEducationMedia={operations.uploadEducationMedia}
        />
      ) : area === 'tickets' ? (
        <SupportTab
          userId={user.id}
          cases={operations.cases}
          getSupportCase={operations.getSupportCase}
          claimSupportCase={operations.claimSupportCase}
          releaseSupportCase={operations.releaseSupportCase}
          replySupportCase={operations.replySupportCase}
          transitionSupportCase={operations.transitionSupportCase}
          caseID={caseID}
        />
      ) : area === 'dataRequests' ? (
        <DataRequestsTab
          dataRequests={operations.dataRequests}
          retryDataRequest={operations.retryDataRequest}
          rejectDataRequest={operations.rejectDataRequest}
        />
      ) : area === 'emergency' ? (
        <EmergencyTab
          requests={operations.emergencyRequests}
          emergencyKey={operations.emergencyKey}
          keyLoading={operations.keyLoading}
          clearEmergencyKey={operations.clearEmergencyKey}
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
