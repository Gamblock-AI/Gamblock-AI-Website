'use client';

import {
  ArrowRight,
  Check,
  LockKeyhole,
  Sparkles,
  Star,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import type { DailyMissionItem } from '@/hooks/use-daily-mission';
import { Link } from '@/i18n/routing';
import type { MissionNumber } from '@/lib/recovery/types';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes';

export const MISSION_ACTION_ROUTE: Record<MissionNumber, string> = {
  1: ROUTES.DASHBOARD,
  2: ROUTES.DASHBOARD,
  3: ROUTES.EDUCATION,
  4: ROUTES.PARTNERS,
  5: ROUTES.EDUCATION,
};

export interface MissionTaskCardProps {
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

/**
 * MissionTaskCard — one server-verified daily mission with its fixed EXP
 * reward and locked/claimable/claimed/skipped states. Shared between the
 * gamification FAB and the recovery workspace mission card.
 */
export function MissionTaskCard({
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
                ? 'bg-navy text-amber shadow-xs ring-2 ring-amber/30'
                : 'bg-muted text-muted-foreground'
          )}
          aria-hidden="true"
        >
          {resolved ? (
            <Check className="size-4.5 stroke-[2.5]" />
          ) : task.claimable ? (
            <Star className="fill-amber text-amber size-4.5" />
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
                    ? 'bg-amber/15 text-navy border border-amber/35'
                    : 'bg-muted text-muted-foreground'
              )}
            >
              {task.replacedFrom ? (
                replacedLabel
              ) : (
                <>
                  <Sparkles className="text-amber size-3" />
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
                className="bg-navy hover:bg-navy-light text-amber w-full font-extrabold shadow-xs active:scale-[0.98]"
                disabled={busy}
                onClick={onClaim}
              >
                <Star className="fill-amber text-amber size-4" />
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
