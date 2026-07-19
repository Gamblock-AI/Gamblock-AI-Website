'use client';

import { CircleAlert, Handshake, LockKeyhole, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { useAccountability } from '@/hooks/use-accountability';
import { useLocalUser } from '@/hooks/use-local-user';
import { PartnerGroupsWorkspace } from './_components/partner-groups-workspace';
import { StudentPartnersWorkspace } from './_components/student-partners-workspace';

export default function PartnersPage() {
  const t = useTranslations('partnersV2');
  const user = useLocalUser();
  const accountability = useAccountability();
  const isPartner = accountability.workspace.role === 'partner';

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={Handshake}
        eyebrow={t('eyebrow')}
        title={isPartner ? t('partnerTitle') : t('studentTitle')}
        description={
          isPartner ? t('partnerDescription') : t('studentDescription')
        }
        aside={
          <DashboardStatus tone={isPartner ? 'navy' : 'sage'}>
            {isPartner ? t('partnerRole') : t('studentRole')}
          </DashboardStatus>
        }
      />

      <DashboardNotice icon={LockKeyhole} title={t('privacyTitle')}>
        {t('privacyBody')}
      </DashboardNotice>

      {accountability.error ? (
        <DashboardNotice
          icon={CircleAlert}
          title={t('errorTitle')}
          tone="amber"
          role="alert"
          action={
            <Button
              variant="outline"
              onClick={() => void accountability.refetch()}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              {t('retry')}
            </Button>
          }
        >
          {t('errorBody')}
        </DashboardNotice>
      ) : accountability.loading ? (
        <DashboardNotice icon={RefreshCw} title={t('loading')} />
      ) : isPartner ? (
        <PartnerGroupsWorkspace
          t={t}
          user={user}
          accountability={accountability}
        />
      ) : (
        <StudentPartnersWorkspace t={t} accountability={accountability} />
      )}
    </DashboardPage>
  );
}
