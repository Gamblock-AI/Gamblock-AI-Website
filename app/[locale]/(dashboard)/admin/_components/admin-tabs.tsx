import { BookOpen, KeyRound, LifeBuoy, Terminal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminOperations } from '@/hooks/use-admin-operations';
import { ContentTab } from './content-tab';
import { EmergencyTab } from './emergency-tab';
import { ReleaseTab } from './release-tab';
import { AdminErrorState, AdminLoadingState } from './admin-state';
import { SupportTab } from './support-tab';

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
        : 'emergency';

  return (
    <Tabs key={role ?? 'loading'} defaultValue={defaultTab} className="w-full">
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
              />
            </TabsContent>
          ) : null}
          {operations.capabilities.releases ? (
            <TabsContent value="releases">
              <ReleaseTab
                releases={operations.releases}
                createModelRelease={operations.createModelRelease}
              />
            </TabsContent>
          ) : null}
          {operations.capabilities.support ? (
            <TabsContent value="support">
              <SupportTab cases={operations.cases} />
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
        </>
      )}
    </Tabs>
  );
}
