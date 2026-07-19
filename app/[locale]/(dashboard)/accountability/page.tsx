'use client';

import {
  CircleAlert,
  HeartHandshake,
  LockKeyhole,
  RefreshCw,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { useAccountability } from '@/hooks/use-accountability';
import { AccountabilityLoading } from './_components/accountability-loading';
import { PartnerAccountability } from './_components/partner-accountability';
import { StudentAccountability } from './_components/student-accountability';

export default function AccountabilityPage() {
  const t = useTranslations('accountabilityV2');
  const accountability = useAccountability();
  const isPartner = accountability.workspace.role === 'partner';
  const membership = accountability.workspace.membership;
  const sharingKey = membership
    ? [
        membership.id,
        membership.sharing.protection_health,
        membership.sharing.protection_activity,
        membership.sharing.recovery_engagement,
        membership.sharing.education_progress,
      ].join(':')
    : 'no-membership';

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={HeartHandshake}
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
      ) : null}

      {accountability.loading ? (
        <AccountabilityLoading label={t('loading')} />
      ) : isPartner ? (
        <PartnerAccountability t={t} accountability={accountability} />
      ) : (
        <StudentAccountability
          key={sharingKey}
          t={t}
          accountability={accountability}
        />
      )}
    </DashboardPage>
  );
}
