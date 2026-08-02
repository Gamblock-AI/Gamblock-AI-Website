'use client';

import { ArrowRight, Check, ListChecks, Sparkles, Target } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DailyMissionManager } from '@/components/dashboard/gamification/daily-mission-manager';
import { PrivateCheckIn } from '@/components/dashboard/today/private-check-in';
import { useDailyMission } from '@/hooks/use-daily-mission';
import { useRecoveryJourney } from '@/hooks/use-recovery-journey';
import { SYSTEM_MISSION_COPY } from '@/lib/recovery/mission-catalog';
import { Link } from '@/i18n/routing';

export function StudentNextAction() {
  const t = useTranslations('recoveryDashboard');
  const mission = useDailyMission();
  const recovery = useRecoveryJourney();
  const [open, setOpen] = useState(false);
  if (!recovery.todayCheckIn) {
    return (
      <section
        className="border-navy/15 bg-card shadow-soft rounded-2xl border"
        aria-labelledby="next-action-title"
      >
        <PrivateCheckIn onSave={recovery.recordDailyCheckIn} />
      </section>
    );
  }
  if (mission.loading) {
    return (
      <section className="border-border bg-card text-muted-foreground rounded-2xl border p-5 text-sm">
        {t('nextActionLoading')}
      </section>
    );
  }
  const task = mission.items.find(
    (item) => !item.completed && item.status !== 'skipped'
  );
  if (!task) {
    return (
      <section
        className="border-sage/30 bg-sage/8 rounded-2xl border p-5"
        aria-labelledby="next-action-title"
      >
        <div className="flex items-start gap-3">
          <Check className="text-sage mt-0.5 size-5" />
          <div>
            <h2
              id="next-action-title"
              className="text-navy text-base font-bold"
            >
              {t('nextActionComplete')}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              {t('nextActionCompleteDescription')}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setOpen(true)}
        >
          <ListChecks className="size-3.5" />
          {t('viewMissionPlan')}
        </Button>
        <MissionDialog open={open} setOpen={setOpen} />
      </section>
    );
  }
  const custom = task.source === 'custom';
  const copy = task.system_key
    ? SYSTEM_MISSION_COPY[task.system_key]
    : undefined;
  const label = custom
    ? (task.title ?? t('customMissionLabel'))
    : copy
      ? t(copy.labelKey)
      : t('missionUnavailable');
  const href = copy?.href ?? '/recovery';
  const action = task.claimable ? (
    <Button
      type="button"
      size="sm"
      disabled={mission.updatingMissionID !== null}
      onClick={() => void mission.claimMission(task.id).catch(() => undefined)}
    >
      <Sparkles className="size-3.5" />
      {t('claimEXP')}
    </Button>
  ) : (
    <Link
      href={href}
      className="border-navy/15 text-navy hover:bg-navy/5 inline-flex min-h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-semibold"
    >
      {t('openNextAction')}
      <ArrowRight className="size-3.5" />
    </Link>
  );
  return (
    <section
      className="border-navy/15 bg-card shadow-soft rounded-2xl border p-5"
      aria-labelledby="next-action-title"
    >
      <div className="flex items-start gap-3">
        <Target className="text-navy mt-0.5 size-5" />
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs font-bold tracking-[0.12em] uppercase">
            {t('nextActionEyebrow')}
          </p>
          <h2
            id="next-action-title"
            className="text-navy mt-1 text-lg font-bold"
          >
            {label}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {t('nextActionDescription')}
          </p>
        </div>
        <span className="text-navy border-navy/15 shrink-0 rounded-md border px-2 py-1 text-xs font-extrabold">
          +{task.exp_reward} EXP
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {action}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setOpen(true)}
        >
          <ListChecks className="size-3.5" />
          {t('viewMissionPlan')}
        </Button>
      </div>
      <MissionDialog open={open} setOpen={setOpen} />
    </section>
  );
}

function MissionDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const t = useTranslations('recoveryDashboard');
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-navy">{t('missionTitle')}</DialogTitle>
        </DialogHeader>
        <DailyMissionManager compact />
      </DialogContent>
    </Dialog>
  );
}
