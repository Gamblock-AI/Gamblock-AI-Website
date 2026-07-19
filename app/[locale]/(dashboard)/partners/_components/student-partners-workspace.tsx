'use client';

import { type FormEvent, useState } from 'react';
import {
  HeartHandshake,
  KeyRound,
  MessageCircleHeart,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound,
} from 'lucide-react';
import {
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import {
  type AccountabilityGroup,
  useAccountability,
} from '@/hooks/use-accountability';
import { toastError, toastSuccess } from '@/lib/feedback';
import { ROUTES } from '@/routes';
import {
  BoundaryItem,
  EmptyLine,
  formatDate,
  Info,
  QuickLink,
  RelationshipStep,
  type Translation,
} from './partners-shared';

export function StudentPartnersWorkspace({
  t,
  accountability,
}: {
  t: Translation;
  accountability: ReturnType<typeof useAccountability>;
}) {
  const [code, setCode] = useState('');
  const [preview, setPreview] = useState<AccountabilityGroup | null>(null);
  const membership = accountability.workspace.membership;
  const group = accountability.workspace.groups[0];

  const previewCode = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setPreview(await accountability.previewGroup(code.trim().toUpperCase()));
    } catch (error) {
      setPreview(null);
      toastError(error);
    }
  };

  const join = async () => {
    try {
      await accountability.joinGroup(code.trim().toUpperCase());
      setPreview(null);
      setCode('');
      toastSuccess(t('joinSuccess'));
    } catch (error) {
      toastError(error);
    }
  };

  if (!membership) {
    return (
      <div className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(21rem,0.85fr)]">
          <DashboardPanel
            icon={KeyRound}
            title={t('joinTitle')}
            description={t('joinBody')}
          >
            <form
              onSubmit={(event) => void previewCode(event)}
              className="space-y-4"
            >
              <label
                htmlFor="group-code"
                className="text-navy block text-sm font-semibold"
              >
                {t('codeLabel')}
              </label>
              <input
                id="group-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                minLength={8}
                maxLength={12}
                autoCapitalize="characters"
                autoComplete="off"
                placeholder={t('codePlaceholder')}
                className="border-input bg-background text-foreground focus-visible:border-navy focus-visible:ring-navy/20 h-12 w-full rounded-xl border px-4 font-mono text-base tracking-[0.18em] uppercase outline-none focus-visible:ring-2"
                required
              />
              <Button
                type="submit"
                size="lg"
                disabled={accountability.mutating}
              >
                {t('previewGroup')}
              </Button>
            </form>
          </DashboardPanel>

          <DashboardPanel
            icon={ShieldCheck}
            title={t('confirmTitle')}
            description={t('confirmBody')}
          >
            {preview ? (
              <div className="border-sage/35 bg-sage/[0.08] rounded-xl border p-4">
                <p className="text-navy font-bold">{preview.name}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {t('managedBy', { name: preview.owner_name })}
                </p>
                {preview.description ? (
                  <p className="text-foreground mt-3 text-sm leading-6">
                    {preview.description}
                  </p>
                ) : null}
                <Button className="mt-4 w-full" onClick={() => void join()}>
                  {t('confirmJoin')}
                </Button>
              </div>
            ) : (
              <EmptyLine
                title={t('previewEmpty')}
                body={t('previewEmptyBody')}
              />
            )}
          </DashboardPanel>
        </div>

        <DashboardPanel
          icon={HeartHandshake}
          title={t('setupStepsTitle')}
          description={t('setupStepsBody')}
        >
          <ol className="grid gap-5 md:grid-cols-3">
            <RelationshipStep
              number={1}
              title={t('setupSteps.preview.title')}
              body={t('setupSteps.preview.body')}
            />
            <RelationshipStep
              number={2}
              title={t('setupSteps.consent.title')}
              body={t('setupSteps.consent.body')}
            />
            <RelationshipStep
              number={3}
              title={t('setupSteps.control.title')}
              body={t('setupSteps.control.body')}
            />
          </ol>
        </DashboardPanel>
      </div>
    );
  }

  const latestContact = accountability.workspace.contact_requests[0];
  const pendingApprovalCount = accountability.requests.filter(
    (request) => request.status === 'pending'
  ).length;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-12 xl:items-stretch">
        <DashboardPanel
          icon={UsersRound}
          title={t('currentGroupTitle')}
          description={t('currentGroupBody')}
          className="h-full xl:col-span-7"
          action={
            <DashboardStatus
              tone={membership.status === 'active' ? 'sage' : 'amber'}
            >
              {t(`membershipStatus.${membership.status}`)}
            </DashboardStatus>
          }
        >
          <div className="border-border rounded-xl border p-4">
            <p className="text-navy text-lg font-bold">
              {group?.name ?? t('groupFallback')}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('managedBy', {
                name: group?.owner_name ?? t('partnerFallback'),
              })}
            </p>
            {group?.description ? (
              <p className="text-foreground mt-3 text-sm leading-6">
                {group.description}
              </p>
            ) : null}
            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <Info
                label={t('joinedLabel')}
                value={formatDate(membership.joined_at)}
              />
              <Info label={t('sharingLabel')} value={t('sharingManageHint')} />
              <Info
                label={t('pendingApprovalLabel')}
                value={t('itemCount', { count: pendingApprovalCount })}
              />
              <Info
                label={t('latestContactLabel')}
                value={
                  latestContact
                    ? t(`contactStatusSummary.${latestContact.status}`)
                    : t('noContactSummary')
                }
              />
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel
          icon={ShieldCheck}
          title={t('boundaryDetailsTitle')}
          description={t('boundaryDetailsBody')}
          className="h-full xl:col-span-5"
        >
          <ul className="space-y-3">
            <BoundaryItem>{t('boundaryItems.approval')}</BoundaryItem>
            <BoundaryItem>{t('boundaryItems.aggregate')}</BoundaryItem>
            <BoundaryItem>{t('boundaryItems.private')}</BoundaryItem>
            <BoundaryItem>{t('boundaryItems.control')}</BoundaryItem>
          </ul>
        </DashboardPanel>
      </div>

      <DashboardPanel
        icon={HeartHandshake}
        title={t('quickActionsTitle')}
        description={t('quickActionsBody')}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <QuickLink
            href={ROUTES.ACCOUNTABILITY}
            icon={SlidersHorizontal}
            title={t('manageAccountabilityTitle')}
            body={t('manageAccountabilityBody')}
          />
          <QuickLink
            href={`${ROUTES.SUPPORT}?channel=partner`}
            icon={MessageCircleHeart}
            title={t('openPartnerSupportTitle')}
            body={t('openPartnerSupportBody')}
          />
        </div>
      </DashboardPanel>
    </div>
  );
}
