'use client';

import { type FormEvent, useState } from 'react';
import {
  BarChart3,
  Calendar,
  Clock,
  FileCheck2,
  HeartHandshake,
  KeyRound,
  Lock,
  MessageCircleHeart,
  MessageSquare,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  UsersRound,
} from 'lucide-react';
import {
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { RequiredMark } from '@/components/common/form-field';
import {
  type AccountabilityGroup,
  useAccountability,
} from '@/hooks/use-accountability';
import { toastError, toastSuccess } from '@/lib/feedback';
import { ROUTES } from '@/routes';
import {
  BoundaryItem,
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
      <div className="space-y-4">
        <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(21rem,0.85fr)]">
          <DashboardPanel
            icon={KeyRound}
            title={t('joinTitle')}
            description={t('joinBody')}
            density="compact"
            fullHeight
            className="flex h-full flex-col justify-between"
          >
            <div className="flex flex-1 flex-col justify-between gap-3.5">
              <form
                onSubmit={(event) => void previewCode(event)}
                className="space-y-1.5"
              >
                <label
                  htmlFor="group-code"
                  className="text-navy flex items-center text-xs font-semibold"
                >
                  <span>{t('codeLabel')}</span>
                  <RequiredMark />
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="group-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    minLength={8}
                    maxLength={12}
                    autoCapitalize="characters"
                    autoComplete="off"
                    placeholder={t('codePlaceholder')}
                    className="border-border/80 bg-background text-navy focus-visible:border-navy focus-visible:ring-navy/20 h-10 flex-1 rounded-xl border px-3.5 font-mono text-sm font-bold tracking-[0.2em] uppercase placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground/60 outline-none transition-all focus-visible:ring-2 shadow-none"
                    required
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={accountability.mutating || !code.trim()}
                    className="min-h-10 px-4 text-xs font-bold gap-1.5 shadow-none shrink-0"
                  >
                    <KeyRound className="size-3.5" aria-hidden="true" />
                    {t('previewGroup')}
                  </Button>
                </div>
              </form>

              <div className="grid gap-2 sm:grid-cols-2 border-t border-border/60 pt-3">
                <div className="border-border/70 bg-muted/15 rounded-xl p-2.5 flex items-start gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sage/15 text-sage-dark border border-sage/20">
                    <Lock className="size-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-navy text-xs font-bold">{t('guaranteePrivateTitle')}</p>
                    <p className="text-muted-foreground text-[11px] leading-relaxed mt-0.5">
                      {t('guaranteePrivateBody')}
                    </p>
                  </div>
                </div>
                <div className="border-border/70 bg-muted/15 rounded-xl p-2.5 flex items-start gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-azure/80 text-navy">
                    <SlidersHorizontal className="size-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-navy text-xs font-bold">{t('guaranteeControlTitle')}</p>
                    <p className="text-muted-foreground text-[11px] leading-relaxed mt-0.5">
                      {t('guaranteeControlBody')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DashboardPanel>

          <DashboardPanel
            icon={ShieldCheck}
            title={t('confirmTitle')}
            description={t('confirmBody')}
            density="compact"
            fullHeight
            className="flex h-full flex-col justify-between"
          >
            {preview ? (
              <div className="border-sage/30 bg-gradient-to-br from-sage/[0.12] via-card to-sage/[0.04] flex h-full flex-1 flex-col justify-between rounded-xl border p-4 shadow-none">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="border-sage/25 bg-sage/20 text-sage-dark flex size-9 shrink-0 items-center justify-center rounded-lg border">
                      <UsersRound className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-navy truncate text-sm font-bold">
                        {preview.name}
                      </p>
                      <span className="border-sage/25 bg-sage/10 text-sage-dark mt-0.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold">
                        <UserCheck className="size-2.5" aria-hidden="true" />
                        {t('managedBy', { name: preview.owner_name })}
                      </span>
                    </div>
                  </div>
                  {preview.description ? (
                    <p className="text-muted-foreground border-border/60 mt-2.5 border-t pt-2.5 text-xs leading-relaxed">
                      {preview.description}
                    </p>
                  ) : null}
                </div>
                <Button
                  className="bg-navy hover:bg-navy-light mt-3 min-h-9 w-full gap-1.5 text-xs font-bold shadow-none"
                  onClick={() => void join()}
                  disabled={accountability.mutating}
                >
                  <ShieldCheck className="size-3.5" aria-hidden="true" />
                  {t('confirmJoin')}
                </Button>
              </div>
            ) : (
              <EmptyState
                icon={KeyRound}
                title={t('previewEmpty')}
                hint={t('previewEmptyBody')}
                className="border-border/70 bg-muted/15 flex-1 h-full min-h-32 py-4 px-3 shadow-none rounded-xl border-dashed"
              />
            )}
          </DashboardPanel>
        </div>

        <DashboardPanel
          icon={HeartHandshake}
          title={t('setupStepsTitle')}
          description={t('setupStepsBody')}
          density="compact"
        >
          <ol className="grid gap-3 md:grid-cols-3">
            <RelationshipStep
              number={1}
              icon={KeyRound}
              title={t('setupSteps.preview.title')}
              body={t('setupSteps.preview.body')}
            />
            <RelationshipStep
              number={2}
              icon={ShieldCheck}
              title={t('setupSteps.consent.title')}
              body={t('setupSteps.consent.body')}
            />
            <RelationshipStep
              number={3}
              icon={SlidersHorizontal}
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
          contentClassName="justify-start"
          action={
            <DashboardStatus
              tone={membership.status === 'active' ? 'sage' : 'amber'}
            >
              {t(`membershipStatus.${membership.status}`)}
            </DashboardStatus>
          }
        >
          <div className="border-border bg-muted/20 flex flex-col gap-3 rounded-xl border p-3.5 sm:p-4">
            <div className="border-border/80 bg-card rounded-xl border p-4 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="bg-azure/80 text-navy flex size-11 shrink-0 items-center justify-center rounded-xl font-bold shadow-2xs">
                  <UsersRound className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-navy truncate text-base font-bold tracking-tight sm:text-lg">
                    {group?.name ?? t('groupFallback')}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="border-sage/25 bg-sage/10 text-sage-dark inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                      <UserCheck className="size-3" aria-hidden="true" />
                      {t('managedBy', {
                        name: group?.owner_name ?? t('partnerFallback'),
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {group?.description ? (
                <p className="text-muted-foreground border-border/60 mt-3 border-t pt-3 text-xs leading-relaxed sm:text-sm">
                  {group.description}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <Info
                icon={Calendar}
                label={t('joinedLabel')}
                value={formatDate(membership.joined_at)}
              />
              <Info
                icon={SlidersHorizontal}
                label={t('sharingLabel')}
                value={t('sharingManageHint')}
              />
              <Info
                icon={Clock}
                label={t('pendingApprovalLabel')}
                value={t('itemCount', { count: pendingApprovalCount })}
              />
              <Info
                icon={MessageSquare}
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
          contentClassName="justify-start"
        >
          <div className="border-border bg-muted/20 flex flex-col gap-2.5 rounded-xl border p-3.5 sm:p-4">
            <BoundaryItem
              icon={FileCheck2}
              title={t('boundaryLabels.approval')}
            >
              {t('boundaryItems.approval')}
            </BoundaryItem>
            <BoundaryItem
              icon={BarChart3}
              title={t('boundaryLabels.aggregate')}
            >
              {t('boundaryItems.aggregate')}
            </BoundaryItem>
            <BoundaryItem
              icon={Lock}
              title={t('boundaryLabels.private')}
              tone="sage"
            >
              {t('boundaryItems.private')}
            </BoundaryItem>
            <BoundaryItem
              icon={SlidersHorizontal}
              title={t('boundaryLabels.control')}
            >
              {t('boundaryItems.control')}
            </BoundaryItem>
          </div>
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
