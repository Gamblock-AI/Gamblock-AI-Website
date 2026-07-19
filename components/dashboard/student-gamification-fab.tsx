'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleAlert,
  Gamepad2,
  Lightbulb,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { MissionAdjustDialog } from '@/components/dashboard/gamification/mission-adjust-dialog';
import { MissionReflectionDialog } from '@/components/dashboard/gamification/mission-reflection-dialog';
import {
  skillCopy,
  skillReasonCopy,
} from '@/components/dashboard/today/dashboard-copy';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  type DailyMissionItem,
  type MissionAdjustmentReason,
  useDailyMission,
} from '@/hooks/use-daily-mission';
import { useLocalUser } from '@/hooks/use-local-user';
import { useRecoveryJourney } from '@/hooks/use-recovery-journey';
import { Link, usePathname } from '@/i18n/routing';
import { toastError, toastSuccess } from '@/lib/feedback';
import type { MissionNumber } from '@/lib/recovery/types';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes';

const GAMIFICATION_PANEL_ID = 'student-gamification-panel';
const MISSION_ACTION_ROUTE: Record<MissionNumber, string> = {
  1: ROUTES.DASHBOARD,
  2: ROUTES.DASHBOARD,
  3: ROUTES.EDUCATION,
  4: ROUTES.PARTNERS,
  5: ROUTES.EDUCATION,
};

export function StudentGamificationFab() {
  const user = useLocalUser();
  const pathname = usePathname();
  if (user.role !== 'user') return null;
  return <StudentGamificationContent key={pathname} />;
}

function StudentGamificationContent() {
  const t = useTranslations('recoveryDashboard');
  const recovery = useRecoveryJourney();
  const mission = useDailyMission();
  const [open, setOpen] = useState(false);
  const [practising, setPractising] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const recommendation = recovery.skillRecommendation;
  const recommendationCopy = recommendation
    ? skillCopy[recommendation.id]
    : null;
  const primaryTask = mission.items.find((item) => item.role === 'primary');
  const bonusTasks = mission.items.filter((item) => item.role === 'bonus');
  const experience = mission.mission?.experience;
  const resolvedCount = mission.mission?.resolved_count ?? 0;
  const totalCount = mission.mission?.total_count ?? 3;
  const claimableCount = mission.items.filter((item) => item.claimable).length;
  const allResolved = totalCount > 0 && resolvedCount >= totalCount;
  const progressPercent = experience
    ? Math.min(
        100,
        (experience.level_progress / Math.max(1, experience.level_target)) * 100
      )
    : 0;

  const claimTask = async (task: DailyMissionItem) => {
    if (!task.claimable || task.completed) return;
    const willLevelUp = experience
      ? experience.level_progress + task.expReward >= experience.level_target
      : false;
    const saved = await mission.claimMission(task.number);
    if (!saved) {
      toastError(mission.error, t('missionError'));
      return;
    }
    const message = willLevelUp
      ? t('levelUp')
      : t('expEarned', { count: task.expReward });
    setSuccessMessage(message);
    toastSuccess(message);
  };

  const adjustTask = async (input: {
    action: 'skip' | 'replace';
    reason: MissionAdjustmentReason;
    replacementNumber?: MissionNumber;
  }) => {
    if (!primaryTask) return false;
    const saved = await mission.adjustMission({
      missionNumber: primaryTask.number,
      ...input,
    });
    if (saved) {
      setSuccessMessage(t('adjustSaved'));
      toastSuccess(t('adjustSaved'));
    } else {
      toastError(mission.error, t('missionError'));
    }
    return saved;
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="data-open:animate-in data-open:fade-in data-closed:animate-out data-closed:fade-out fixed inset-0 z-[54] bg-navy/30 backdrop-blur-xs duration-200 motion-reduce:animate-none" />
        <DialogPrimitive.Popup
          id={GAMIFICATION_PANEL_ID}
          className="shadow-float data-open:animate-in data-open:slide-in-from-bottom-4 data-closed:animate-out data-closed:slide-out-to-bottom-4 fixed inset-x-0 bottom-0 z-[55] flex max-h-[85dvh] min-h-0 flex-col overflow-hidden rounded-t-[1.75rem] border border-navy/15 bg-card duration-200 outline-none motion-reduce:animate-none sm:inset-x-auto sm:right-6 sm:bottom-20 sm:max-h-[min(80dvh,43rem)] sm:w-[26rem] sm:rounded-[1.75rem]"
        >
          {/* Header */}
          <header className="relative shrink-0 border-b border-border/80 bg-gradient-to-b from-navy/5 via-card to-card px-4 pt-4 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-2xl border border-navy/10 bg-gradient-to-br from-azure/40 to-sky/20 p-0.5 shadow-xs">
                <Image
                  src="/images/mascot/gami-peek.png"
                  alt=""
                  fill
                  sizes="48px"
                  className="scale-125 object-contain object-bottom"
                  priority={false}
                />
              </div>
              <div className="min-w-0 flex-1">
                <DialogPrimitive.Title className="text-base font-extrabold tracking-tight text-navy">
                  {t('fabTitle')}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {t('fabDescription')}
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30">
                <X className="size-4.5" aria-hidden="true" />
                <span className="sr-only">{t('fabClose')}</span>
              </DialogPrimitive.Close>
            </div>

            {mission.loading ? (
              <Skeleton className="mt-3.5 h-11 rounded-xl" />
            ) : experience ? (
              <div className="mt-3.5 rounded-xl border border-navy/10 bg-navy/5 p-2.5 backdrop-blur-xs">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 font-extrabold text-navy">
                    <span className="flex size-5 items-center justify-center rounded-md bg-navy text-[0.625rem] text-white">
                      <Trophy className="size-3 text-amber-300" />
                    </span>
                    <span>{t('level', { count: experience.level })}</span>
                  </div>
                  <span className="text-[0.6875rem] font-bold text-navy/70">
                    {t('expProgress', {
                      current: experience.level_progress,
                      target: experience.level_target,
                    })}
                  </span>
                </div>
                <div
                  className="relative mt-2 h-2.5 w-full overflow-hidden rounded-full bg-navy/10 p-0.5"
                  role="progressbar"
                  aria-label={t('levelProgress')}
                  aria-valuemin={0}
                  aria-valuemax={experience.level_target}
                  aria-valuenow={experience.level_progress}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky via-azure to-navy transition-all duration-500 ease-out motion-reduce:transition-none"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : null}
          </header>

          <Tabs defaultValue="today" className="flex min-h-0 flex-1 flex-col gap-0">
            <div className="shrink-0 border-b border-border/80 bg-card px-4 py-2.5">
              <TabsList className="grid w-full grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1">
                <TabsTrigger
                  value="today"
                  className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-muted-foreground transition-all data-[state=active]:bg-card data-[state=active]:font-extrabold data-[state=active]:text-navy data-[state=active]:shadow-xs"
                >
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  {t('fabTodayTab')}
                </TabsTrigger>
                <TabsTrigger
                  value="practice"
                  className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-muted-foreground transition-all data-[state=active]:bg-card data-[state=active]:font-extrabold data-[state=active]:text-navy data-[state=active]:shadow-xs"
                >
                  <Target className="size-3.5" aria-hidden="true" />
                  {t('fabPracticeTab')}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="today"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3.5"
            >
              {successMessage ? (
                <div className="animate-in fade-in slide-in-from-top-1 mb-3.5 flex items-center gap-2 rounded-xl border border-sage/35 bg-sage/12 px-3 py-2 text-xs font-bold text-navy duration-200 motion-reduce:animate-none">
                  <Sparkles
                    className="size-4 shrink-0 text-sage"
                    aria-hidden="true"
                  />
                  <span className="flex-1">{successMessage}</span>
                  <button
                    type="button"
                    className="flex size-7 items-center justify-center rounded-lg text-navy hover:bg-white/60"
                    onClick={() => setSuccessMessage('')}
                    aria-label={t('fabClose')}
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              ) : null}

              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight text-navy">
                    {t('dailyTasksTitle')}
                  </h3>
                  <p className="mt-0.5 text-[0.75rem] font-medium text-muted-foreground">
                    {allResolved
                      ? t('allTasksResolved')
                      : t('claimableCount', { count: claimableCount })}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-navy px-2.5 py-1 text-xs font-extrabold text-white shadow-xs">
                  {t('taskCount', {
                    completed: resolvedCount,
                    total: totalCount,
                  })}
                </span>
              </div>

              {mission.loading ? (
                <div className="space-y-2.5" role="status">
                  <Skeleton className="h-28 rounded-2xl" />
                  <Skeleton className="h-12 rounded-xl" />
                </div>
              ) : mission.error || !primaryTask ? (
                <div className="rounded-xl border border-amber/35 bg-amber/10 p-3.5">
                  <p className="flex gap-2 text-xs leading-5 text-foreground font-medium">
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber" />
                    {t('missionError')}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2.5 min-h-10 text-xs font-semibold"
                    onClick={() => void mission.refetch()}
                  >
                    <RefreshCw className="size-3.5" />
                    {t('missionRetry')}
                  </Button>
                </div>
              ) : (
                <>
                  <MissionTaskCard
                    task={primaryTask}
                    label={t(`mission${primaryTask.number}`)}
                    actionLabel={t(`mission${primaryTask.number}Action`)}
                    claimLabel={t('claimExp')}
                    claimedLabel={t('expClaimed')}
                    skippedLabel={t('missionSkipped')}
                    replacedLabel={t('missionReplaced')}
                    busy={mission.updatingMissionNumber !== null}
                    onClaim={() => void claimTask(primaryTask)}
                    onNavigate={() => setOpen(false)}
                    primary
                  />

                  {!primaryTask.completed &&
                  primaryTask.status !== 'skipped' ? (
                    <button
                      type="button"
                      onClick={() => setAdjustOpen(true)}
                      className="mt-2 flex min-h-10 w-full items-center justify-center rounded-xl text-xs font-bold text-navy/80 transition-colors hover:bg-muted/70 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
                    >
                      {t('adjustTask')}
                    </button>
                  ) : !reflectionSaved ? (
                    <div className="mt-3 rounded-xl border border-navy/10 bg-gradient-to-br from-azure/20 via-sky/10 to-card p-3 shadow-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-navy">
                          <Sparkles className="size-3.5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold leading-relaxed text-navy">
                            {t('reflectionPrompt')}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-2.5 w-full border-navy/20 text-xs font-bold text-navy hover:bg-navy/5"
                            onClick={() => setReflectionOpen(true)}
                          >
                            {t('reflectionAction')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {bonusTasks.length > 0 ? (
                    <details className="group mt-3.5 border-t border-border/80 pt-2.5">
                      <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between rounded-xl px-2 text-xs font-extrabold text-navy transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30">
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="size-4 text-navy/70" />
                          {t('bonusTasks')}
                          <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[0.625rem] font-bold text-navy">
                            {bonusTasks.length}
                          </span>
                        </span>
                        <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
                      </summary>
                      <div className="mt-2 space-y-2.5 pb-1">
                        {bonusTasks.map((task) => (
                          <MissionTaskCard
                            key={task.id}
                            task={task}
                            label={t(`mission${task.number}`)}
                            actionLabel={t(`mission${task.number}Action`)}
                            claimLabel={t('claimExp')}
                            claimedLabel={t('expClaimed')}
                            skippedLabel={t('missionSkipped')}
                            replacedLabel={t('missionReplaced')}
                            busy={mission.updatingMissionNumber !== null}
                            onClaim={() => void claimTask(task)}
                            onNavigate={() => setOpen(false)}
                          />
                        ))}
                      </div>
                    </details>
                  ) : null}
                </>
              )}
            </TabsContent>

            <TabsContent
              value="practice"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3.5"
            >
              <h3 className="text-sm font-extrabold tracking-tight text-navy">
                {t('fabSkillTitle')}
              </h3>
              {recommendation && recommendationCopy ? (
                <div className="mt-3 rounded-2xl border border-navy/15 bg-gradient-to-br from-azure/20 via-card to-card p-3.5 shadow-xs">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-navy text-white shadow-xs">
                      <Lightbulb className="size-4.5 text-amber-300" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-navy sm:text-sm">
                        {t(recommendationCopy.title)}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {t(recommendationCopy.summary)}
                      </p>
                    </div>
                  </div>
                  {practising ? (
                    <p className="mt-3 rounded-xl border border-border/60 bg-muted/50 p-3 text-xs leading-relaxed text-foreground">
                      {t(recommendationCopy.practice)}
                    </p>
                  ) : null}
                  <Button
                    type="button"
                    size="lg"
                    className="mt-3 w-full font-bold shadow-xs"
                    onClick={() => setPractising((current) => !current)}
                    aria-expanded={practising}
                  >
                    {practising ? t('skillClose') : t('skillStart')}
                  </Button>
                  <button
                    type="button"
                    className="mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold text-navy/80 transition-colors hover:bg-muted/70 hover:text-navy"
                    onClick={() => {
                      setPractising(false);
                      recovery.cycleSkillRecommendation();
                    }}
                  >
                    <RefreshCw className="size-3.5" />
                    {t('skillAnother')}
                  </button>
                  <p className="mt-2 text-[0.6875rem] leading-relaxed text-muted-foreground">
                    {t(skillReasonCopy[recommendation.reasonCode])}
                  </p>
                </div>
              ) : (
                <p className="mt-3 rounded-xl border border-dashed border-border bg-muted/30 p-3.5 text-xs leading-relaxed text-muted-foreground">
                  {t('fabCheckInRequired')}
                </p>
              )}
            </TabsContent>
          </Tabs>

          <footer className="shrink-0 border-t border-border/80 bg-card p-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
            <Link
              href={ROUTES.RECOVERY}
              onClick={() => setOpen(false)}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'w-full justify-between font-bold border-navy/15 text-navy hover:bg-navy/5 shadow-xs'
              )}
            >
              <span>{t('fabOpenRecovery')}</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </footer>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>

      <DialogPrimitive.Trigger
        render={
          <button
            type="button"
            aria-label={open ? t('fabClose') : t('fabOpen')}
            onClick={() => {
              if (!open && !mission.loading) void mission.refetch();
            }}
            className={cn(
              'fixed right-4 bottom-[calc(6.25rem+env(safe-area-inset-bottom))] z-[56] flex size-14 items-center justify-center rounded-full border border-white/25 bg-navy text-white shadow-float transition-all duration-200 outline-none hover:-translate-y-0.5 hover:bg-navy-light focus-visible:ring-4 focus-visible:ring-sky/45 focus-visible:ring-offset-2 active:scale-[0.96] motion-reduce:transform-none motion-reduce:transition-none lg:right-6 lg:bottom-6',
              open && 'max-sm:hidden'
            )}
          />
        }
      >
        {open ? <X className="size-6" /> : <Gamepad2 className="size-7" />}
        {!open && mission.mission ? (
          <span className="absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-sky px-1 text-[0.625rem] font-extrabold text-navy shadow-xs">
            {allResolved ? <Check className="size-3 stroke-[2.5]" /> : claimableCount}
          </span>
        ) : null}
      </DialogPrimitive.Trigger>

      {primaryTask ? (
        <MissionAdjustDialog
          open={adjustOpen}
          task={primaryTask}
          replacementOptions={mission.mission?.replacement_options ?? []}
          busy={mission.updatingMissionNumber !== null}
          onOpenChange={setAdjustOpen}
          onSubmit={adjustTask}
        />
      ) : null}
      {mission.mission ? (
        <MissionReflectionDialog
          open={reflectionOpen}
          missionDate={mission.mission.date}
          onOpenChange={setReflectionOpen}
          onSaved={() => setReflectionSaved(true)}
        />
      ) : null}
    </DialogPrimitive.Root>
  );
}

interface MissionTaskCardProps {
  task: DailyMissionItem;
  label: string;
  actionLabel: string;
  claimLabel: string;
  claimedLabel: string;
  skippedLabel: string;
  replacedLabel: string;
  busy: boolean;
  primary?: boolean;
  onClaim: () => void;
  onNavigate: () => void;
}

function MissionTaskCard({
  task,
  label,
  actionLabel,
  claimLabel,
  claimedLabel,
  skippedLabel,
  replacedLabel,
  busy,
  primary = false,
  onClaim,
  onNavigate,
}: MissionTaskCardProps) {
  const resolved = task.completed || task.status === 'skipped';
  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-xl border transition-all duration-200',
        primary ? 'p-3.5' : 'p-3',
        task.claimable
          ? 'border-amber/40 bg-gradient-to-br from-amber/10 via-azure/15 to-card shadow-xs'
          : resolved
            ? 'border-sage/35 bg-sage/8'
            : 'border-border/80 bg-card hover:border-navy/20'
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors',
            resolved
              ? 'bg-sage text-white shadow-xs'
              : task.claimable
                ? 'bg-navy text-amber-300 shadow-xs ring-2 ring-amber/30'
                : 'bg-muted text-muted-foreground'
          )}
          aria-hidden="true"
        >
          {resolved ? (
            <Check className="size-4.5 stroke-[2.5]" />
          ) : task.claimable ? (
            <Star className="size-4.5 fill-amber-300 text-amber-300" />
          ) : (
            <LockKeyhole className="size-4" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-bold leading-snug text-navy sm:text-sm">
              {label}
            </p>
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[0.6875rem] font-extrabold',
                resolved
                  ? 'bg-sage/15 text-navy dark:text-sage'
                  : task.claimable
                    ? 'bg-amber/20 text-amber-900 border border-amber/35 dark:text-amber-300'
                    : 'bg-muted text-muted-foreground'
              )}
            >
              {task.replacedFrom ? (
                replacedLabel
              ) : (
                <>
                  <Sparkles className="size-3 text-amber-600" />
                  {`+${task.expReward} EXP`}
                </>
              )}
            </span>
          </div>

          <div className="mt-2.5">
            {task.completed ? (
              <div className="flex items-center gap-1.5 text-[0.75rem] font-bold text-sage">
                <Check className="size-3.5 stroke-[2.5]" />
                {claimedLabel}
              </div>
            ) : task.status === 'skipped' ? (
              <p className="text-xs font-semibold text-muted-foreground">
                {skippedLabel}
              </p>
            ) : task.claimable ? (
              <Button
                type="button"
                className="w-full bg-navy hover:bg-navy-light font-extrabold text-amber-300 shadow-xs active:scale-[0.98]"
                disabled={busy}
                onClick={onClaim}
              >
                <Star className="size-4 fill-amber-300 text-amber-300" />
                {claimLabel}
              </Button>
            ) : (
              <Link
                href={MISSION_ACTION_ROUTE[task.number]}
                onClick={onNavigate}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'w-full justify-between font-semibold border-navy/15 text-navy hover:bg-navy/5'
                )}
              >
                <span>{actionLabel}</span>
                <ArrowRight className="size-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
