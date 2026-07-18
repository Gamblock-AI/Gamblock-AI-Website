'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  CircleAlert,
  Clock3,
  Gamepad2,
  Lightbulb,
  LockKeyhole,
  RefreshCw,
  Star,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  missionMinutes,
  skillCopy,
  skillReasonCopy,
} from '@/components/dashboard/today/dashboard-copy';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type DailyMissionItem,
  useDailyMission,
} from '@/hooks/use-daily-mission';
import { useLocalUser } from '@/hooks/use-local-user';
import { useRecoveryJourney } from '@/hooks/use-recovery-journey';
import { Link, usePathname } from '@/i18n/routing';
import { toastSuccess } from '@/lib/feedback';
import { cn } from '@/lib/utils';
import type { MissionNumber } from '@/lib/recovery/types';
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
  const [statusMessage, setStatusMessage] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const recommendation = recovery.skillRecommendation;
  const recommendationCopy = recommendation
    ? skillCopy[recommendation.id]
    : null;
  const primaryTask = mission.items.find((item) => item.role === 'primary');
  const bonusTasks = mission.items.filter((item) => item.role === 'bonus');
  const experience = mission.mission?.experience;
  const completedCount = mission.mission?.completed_count ?? 0;
  const totalCount = mission.mission?.total_count ?? 3;
  const progressPercent = experience
    ? Math.min(
        100,
        (experience.level_progress / Math.max(1, experience.level_target)) * 100
      )
    : 0;

  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePress);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const togglePanel = () => {
    if (!open && !mission.loading) void mission.refetch();
    setOpen((current) => !current);
  };

  const claimTask = async (task: DailyMissionItem) => {
    if (!task.claimable || task.completed) return;
    const saved = await mission.claimMission(task.number);
    if (!saved) return;

    const message = t('expEarned', { count: task.expReward });
    setStatusMessage(message);
    toastSuccess(message);
  };

  return (
    <div
      ref={rootRef}
      className="fixed right-4 bottom-[calc(6.25rem+env(safe-area-inset-bottom))] z-[45] lg:right-6 lg:bottom-6"
    >
      {open ? (
        <section
          id={GAMIFICATION_PANEL_ID}
          role="dialog"
          aria-modal="false"
          aria-labelledby="student-gamification-title"
          className="border-navy/15 bg-card shadow-float animate-in fade-in zoom-in-95 slide-in-from-bottom-2 absolute right-0 bottom-16 max-h-[min(76dvh,42rem)] w-[min(24rem,calc(100vw-2rem))] origin-bottom-right overflow-y-auto rounded-3xl border duration-200 motion-reduce:animate-none"
        >
          <header className="border-border bg-card/95 sticky top-0 z-10 border-b px-4 py-4 backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="bg-navy text-sky flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <Gamepad2 className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2
                    id="student-gamification-title"
                    className="text-navy text-base font-bold"
                  >
                    {t('fabTitle')}
                  </h2>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-5">
                    {t('fabDescription')}
                  </p>
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                className="text-muted-foreground hover:bg-muted hover:text-navy focus-visible:ring-navy/35 flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors outline-none focus-visible:ring-2"
                aria-label={t('fabClose')}
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            {mission.loading ? (
              <Skeleton className="mt-4 h-14 w-full rounded-xl" />
            ) : experience ? (
              <div className="bg-azure/45 mt-4 rounded-2xl px-3 py-3">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-navy flex items-center gap-1.5 font-bold">
                    <Star className="fill-sky text-navy size-4" aria-hidden="true" />
                    {t('level', { count: experience.level })}
                  </span>
                  <span className="text-muted-foreground font-semibold">
                    {t('expProgress', {
                      current: experience.level_progress,
                      target: experience.level_target,
                    })}
                  </span>
                </div>
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-white/80"
                  role="progressbar"
                  aria-label={t('levelProgress')}
                  aria-valuemin={0}
                  aria-valuemax={experience.level_target}
                  aria-valuenow={experience.level_progress}
                >
                  <div
                    className="bg-navy h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-muted-foreground mt-2 text-[0.6875rem]">
                  {t('totalExp', { count: experience.total_exp })}
                </p>
              </div>
            ) : null}
          </header>

          <div className="divide-border divide-y px-4">
            <section className="py-4" aria-labelledby="fab-mission-title">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p id="fab-mission-title" className="text-navy text-sm font-bold">
                    {t('dailyTasksTitle')}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs leading-5">
                    {t('dailyTasksDescription')}
                  </p>
                </div>
                <span className="bg-navy shrink-0 rounded-full px-2.5 py-1 text-xs font-bold text-white">
                  {t('taskCount', { completed: completedCount, total: totalCount })}
                </span>
              </div>

              {mission.loading ? (
                <div className="mt-3 space-y-2" role="status">
                  <Skeleton className="h-24 w-full rounded-2xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <span className="sr-only">{t('missionLoading')}</span>
                </div>
              ) : mission.error || !primaryTask ? (
                <div className="border-amber/35 bg-amber/10 mt-3 rounded-xl border p-3">
                  <p className="text-foreground flex items-start gap-2 text-xs leading-5">
                    <CircleAlert
                      className="text-amber mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    {t('missionError')}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 h-11"
                    onClick={() => void mission.refetch()}
                  >
                    <RefreshCw className="size-4" aria-hidden="true" />
                    {t('missionRetry')}
                  </Button>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <MissionTaskButton
                    task={primaryTask}
                    label={t(`mission${primaryTask.number}`)}
                    roleLabel={t('primaryTask')}
                    minutesLabel={t('minutes', {
                      count: missionMinutes[primaryTask.number],
                    })}
                    rewardLabel={t('expReward', { count: primaryTask.expReward })}
                    updating={mission.updatingMissionNumber === primaryTask.number}
                    disabled={mission.updatingMissionNumber !== null}
                    claimLabel={t('claimExp')}
                    claimingLabel={t('claimingExp')}
                    claimedLabel={t('expClaimed')}
                    lockedLabel={t('claimLocked')}
                    readyLabel={t('claimReady')}
                    actionLabel={t(`mission${primaryTask.number}Action`)}
                    actionHref={MISSION_ACTION_ROUTE[primaryTask.number]}
                    onClaim={() => void claimTask(primaryTask)}
                    onNavigate={() => setOpen(false)}
                    primary
                  />

                  <p className="text-muted-foreground pt-1 text-[0.6875rem] font-bold tracking-[0.12em] uppercase">
                    {t('bonusTasks')}
                  </p>
                  {bonusTasks.map((task) => (
                    <MissionTaskButton
                      key={task.id}
                      task={task}
                      label={t(`mission${task.number}`)}
                      roleLabel={t('bonusTask')}
                      minutesLabel={t('minutes', {
                        count: missionMinutes[task.number],
                      })}
                      rewardLabel={t('expReward', { count: task.expReward })}
                      updating={mission.updatingMissionNumber === task.number}
                      disabled={mission.updatingMissionNumber !== null}
                      claimLabel={t('claimExp')}
                      claimingLabel={t('claimingExp')}
                      claimedLabel={t('expClaimed')}
                      lockedLabel={t('claimLocked')}
                      readyLabel={t('claimReady')}
                      actionLabel={t(`mission${task.number}Action`)}
                      actionHref={MISSION_ACTION_ROUTE[task.number]}
                      onClaim={() => void claimTask(task)}
                      onNavigate={() => setOpen(false)}
                    />
                  ))}
                </div>
              )}
              <p className="sr-only" aria-live="polite">
                {statusMessage}
              </p>
            </section>

            <section className="py-4" aria-labelledby="fab-skill-title">
              <p id="fab-skill-title" className="text-navy text-sm font-bold">
                {t('fabSkillTitle')}
              </p>
              {recommendation && recommendationCopy ? (
                <div className="mt-3">
                  <div className="flex items-start gap-3">
                    <span className="bg-azure/65 text-navy flex size-9 shrink-0 items-center justify-center rounded-xl">
                      <Lightbulb className="size-[1.125rem]" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-foreground text-sm font-semibold">
                        {t(recommendationCopy.title)}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs leading-5">
                        {t(recommendationCopy.summary)}
                      </p>
                    </div>
                  </div>

                  {practising ? (
                    <p
                      className="bg-muted/45 text-foreground mt-3 rounded-xl p-3 text-xs leading-6"
                      role="status"
                    >
                      {t(recommendationCopy.practice)}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      className="h-11 flex-1"
                      onClick={() => setPractising((current) => !current)}
                      aria-expanded={practising}
                    >
                      {practising ? t('skillClose') : t('skillStart')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11"
                      onClick={() => {
                        setPractising(false);
                        recovery.cycleSkillRecommendation();
                      }}
                    >
                      <RefreshCw className="size-4" aria-hidden="true" />
                      {t('skillAnother')}
                    </Button>
                  </div>
                  <p className="text-muted-foreground mt-3 text-[0.6875rem] leading-5">
                    {t(skillReasonCopy[recommendation.reasonCode])}
                  </p>
                </div>
              ) : (
                <div className="border-border bg-muted/35 mt-3 rounded-xl border border-dashed p-3">
                  <p className="text-muted-foreground text-xs leading-5">
                    {t('fabCheckInRequired')}
                  </p>
                  <Link
                    href={ROUTES.DASHBOARD}
                    onClick={() => setOpen(false)}
                    className="text-navy focus-visible:ring-navy/35 mt-2 inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-semibold outline-none hover:underline focus-visible:ring-2"
                  >
                    {t('fabGoDashboard')}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </section>
          </div>

          <Link
            href={ROUTES.RECOVERY}
            onClick={() => setOpen(false)}
            className="border-border bg-azure/25 text-navy hover:bg-azure/50 focus-visible:ring-navy/35 flex min-h-12 items-center justify-between gap-3 border-t px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset"
          >
            {t('fabOpenRecovery')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      ) : null}

      <button
        ref={triggerRef}
        type="button"
        aria-controls={GAMIFICATION_PANEL_ID}
        aria-expanded={open}
        aria-label={open ? t('fabClose') : t('fabOpen')}
        onClick={togglePanel}
        className="bg-navy shadow-float hover:bg-navy-light focus-visible:ring-sky/45 relative flex size-14 items-center justify-center rounded-full border border-white/25 text-white transition-[background-color,transform,box-shadow] duration-200 outline-none hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-offset-2 active:scale-[0.96] motion-reduce:transform-none motion-reduce:transition-none"
      >
        {open ? (
          <X className="size-6" aria-hidden="true" />
        ) : (
          <Gamepad2 className="size-7" aria-hidden="true" />
        )}
        {!open && mission.mission ? (
          <span className="border-background bg-sky text-navy absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full border-2 px-1 text-[0.625rem] leading-4 font-extrabold">
            {completedCount}/{totalCount}
          </span>
        ) : null}
      </button>
    </div>
  );
}

interface MissionTaskButtonProps {
  task: DailyMissionItem;
  label: string;
  roleLabel: string;
  minutesLabel: string;
  rewardLabel: string;
  updating: boolean;
  disabled: boolean;
  claimLabel: string;
  claimingLabel: string;
  claimedLabel: string;
  lockedLabel: string;
  readyLabel: string;
  actionLabel: string;
  actionHref: string;
  onClaim: () => void;
  onNavigate: () => void;
  primary?: boolean;
}

function MissionTaskButton({
  task,
  label,
  roleLabel,
  minutesLabel,
  rewardLabel,
  updating,
  disabled,
  claimLabel,
  claimingLabel,
  claimedLabel,
  lockedLabel,
  readyLabel,
  actionLabel,
  actionHref,
  onClaim,
  onNavigate,
  primary = false,
}: MissionTaskButtonProps) {
  return (
    <div
      className={cn(
        'w-full border text-left transition-colors duration-200 motion-reduce:transition-none',
        primary ? 'rounded-2xl p-3' : 'rounded-xl p-3',
        task.completed
          ? 'border-sage/40 bg-sage/10'
          : task.claimable
            ? 'border-navy/30 bg-azure/35'
          : primary
            ? 'border-navy/15 bg-muted/25'
            : 'border-border bg-muted/25'
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full border-2',
            task.completed
              ? 'border-sage bg-sage text-white'
              : task.claimable
                ? 'border-navy bg-navy text-white'
                : 'border-border bg-card text-muted-foreground'
          )}
          aria-hidden="true"
        >
          {task.completed ? (
            <Check className="size-4" />
          ) : task.claimable ? (
            <Star className="size-4" />
          ) : (
            <LockKeyhole className="size-3.5" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          {primary ? (
            <span className="text-navy mb-1 block text-[0.625rem] font-extrabold tracking-[0.12em] uppercase">
              {roleLabel}
            </span>
          ) : (
            <span className="sr-only">{roleLabel}</span>
          )}
          <span className="text-foreground block text-sm leading-5 font-semibold">
            {label}
          </span>
          <span className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6875rem]">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3.5" aria-hidden="true" />
              {minutesLabel}
            </span>
            <span className="text-navy font-bold">{rewardLabel}</span>
          </span>
          <span className="text-foreground mt-2 block text-xs font-semibold">
            {task.completed
              ? claimedLabel
              : task.claimable
                ? readyLabel
                : lockedLabel}
          </span>
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          type="button"
          className="h-11"
          variant={task.claimable && !task.completed ? 'primary' : 'outline'}
          disabled={disabled || !task.claimable || task.completed}
          onClick={onClaim}
        >
          {updating ? (
            <RefreshCw className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          ) : task.completed ? (
            <Check className="size-4" aria-hidden="true" />
          ) : task.claimable ? (
            <Star className="size-4" aria-hidden="true" />
          ) : (
            <LockKeyhole className="size-4" aria-hidden="true" />
          )}
          {updating ? claimingLabel : task.completed ? claimedLabel : claimLabel}
        </Button>
        {task.completed ? null : (
          <Link
            href={actionHref}
            onClick={onNavigate}
            className={cn(buttonVariants({ variant: 'ghost' }), 'h-11')}
          >
            {actionLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
