'use client';

import {
  ArrowRight,
  Check,
  EyeOff,
  LockKeyhole,
  MessageCircleHeart,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { useAccountability } from '@/hooks/use-accountability';
import { useEducationModules } from '@/hooks/use-education';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

export function PartnerProgress() {
  const p = useTranslations('progressExperience');
  const locale = useLocale();
  const accountability = useAccountability();
  const education = useEducationModules(locale);
  const simulator = education.modules.find(
    (module) => module.experience_type === 'partner_response_simulator'
  );

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={UsersRound}
        eyebrow={p('partnerEyebrow')}
        title={p('partnerTitle')}
        description={p('partnerBody')}
        aside={
          <DashboardStatus tone="sage">{p('aggregateOnly')}</DashboardStatus>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="border-border bg-card rounded-[2rem] border p-5 sm:p-7">
          <MessageCircleHeart
            className="text-cyan-dark size-8"
            aria-hidden="true"
          />
          <h2 className="text-navy mt-4 text-xl font-bold">
            {p('learningPath')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {p('learningPathBody')}
          </p>
          <div className="mt-6 space-y-3">
            {(simulator?.sections ?? []).map((section, index) => {
              const checkID = section.knowledge_check?.id ?? '';
              const done =
                simulator?.progress.correct_check_ids.includes(checkID);
              return (
                <div
                  key={section.id}
                  className={`flex min-h-16 items-center gap-3 rounded-2xl border p-3 ${done ? 'border-sage/30 bg-sage/8' : 'border-border'}`}
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full font-bold ${done ? 'bg-sage text-white' : 'bg-muted text-navy'}`}
                  >
                    {done ? (
                      <Check className="size-4" aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <p className="text-navy text-sm font-semibold">
                    {section.title}
                  </p>
                </div>
              );
            })}
            {!simulator ? (
              <p className="text-muted-foreground text-sm">
                {p('learningEmpty')}
              </p>
            ) : null}
          </div>
          <Link
            href={ROUTES.RECOVERY}
            className="bg-navy focus-visible:ring-navy/30 mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-white outline-none focus-visible:ring-2"
          >
            {p('openLearning')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>

        <section className="border-border bg-card rounded-[2rem] border p-5 sm:p-7">
          <div>
            <p className="text-cyan-dark text-xs font-bold tracking-[0.14em] uppercase">
              {p('sharedEyebrow')}
            </p>
            <h2 className="text-navy mt-2 text-xl font-bold">
              {p('sharedTitle')}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {p('sharedBody')}
            </p>
          </div>
          <div className="mt-6 space-y-4">
            {accountability.workspace.members.map((member) => (
              <article
                key={member.id}
                className="border-border rounded-2xl border p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-navy font-bold">{member.student_name}</p>
                  <DashboardStatus
                    tone={member.status === 'active' ? 'sage' : 'amber'}
                  >
                    {member.status}
                  </DashboardStatus>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <Aggregate
                    label={p('protection')}
                    value={member.aggregate.protection_status}
                  />
                  <Aggregate
                    label={p('education')}
                    value={member.aggregate.education_progress_band}
                  />
                  <Aggregate
                    label={p('participation')}
                    value={member.aggregate.check_in_days}
                  />
                </div>
              </article>
            ))}
            {accountability.workspace.members.length === 0 ? (
              <p className="text-muted-foreground text-sm">{p('noMembers')}</p>
            ) : null}
          </div>
        </section>
      </div>
      <div className="border-navy/20 bg-navy/[0.04] flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <LockKeyhole
            className="text-navy mt-0.5 size-5 shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="text-navy font-bold">{p('privacyBoundary')}</p>
            <p className="text-muted-foreground mt-1 max-w-3xl text-sm leading-6">
              {p('privacyBoundaryBody')}
            </p>
          </div>
        </div>
        <Link
          href={ROUTES.PARTNERS}
          className="border-navy/25 focus-visible:ring-navy/30 text-navy inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold outline-none focus-visible:ring-2"
        >
          {p('managePartner')}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </DashboardPage>
  );
}

function Aggregate({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  const p = useTranslations('progressExperience');
  const shared = value !== undefined && value !== null && value !== '';
  return (
    <div className={`rounded-xl p-3 ${shared ? 'bg-sage/8' : 'bg-muted/45'}`}>
      {shared ? (
        <ShieldCheck className="text-sage size-4" aria-hidden="true" />
      ) : (
        <EyeOff className="text-muted-foreground size-4" aria-hidden="true" />
      )}
      <p className="text-muted-foreground mt-2 text-xs">{label}</p>
      <p className="text-navy mt-1 text-sm font-bold">
        {shared ? String(value) : p('notShared')}
      </p>
    </div>
  );
}
