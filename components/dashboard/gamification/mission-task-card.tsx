'use client';

import { ArrowRight, Check, Pencil, Sparkles, Star, Target, Trash2 } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import type { DailyMissionItem } from '@/hooks/use-daily-mission';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

interface MissionTaskCardProps {
  task: DailyMissionItem;
  label: string;
  sourceLabel: string;
  actionLabel?: string;
  actionHref?: string;
  claimLabel: string;
  claimedLabel: string;
  selfAttestedLabel: string;
  editLabel: string;
  deleteLabel: string;
  busy: boolean;
  onClaim: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MissionTaskCard({
  task,
  label,
  sourceLabel,
  actionLabel,
  actionHref,
  claimLabel,
  claimedLabel,
  selfAttestedLabel,
  editLabel,
  deleteLabel,
  busy,
  onClaim,
  onEdit,
  onDelete,
}: MissionTaskCardProps) {
  const isCustom = task.source === 'custom';
  // Older snapshots can contain a skipped task. It remains non-actionable, but
  // is rendered as its original source rather than as a third visual mission type.
  const isResolved = task.completed || task.status === 'skipped';

  return (
    <article
      className={cn(
        'rounded-xl border p-3 transition-colors',
        task.completed
          ? 'border-sage/35 bg-sage/8'
          : isCustom
            ? 'border-navy/25 bg-azure/20'
            : 'border-border/80 bg-card'
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl',
            task.completed
              ? 'bg-sage text-white'
              : isCustom
                ? 'bg-navy text-sky'
                : 'bg-muted text-muted-foreground'
          )}
          aria-hidden="true"
        >
          {task.completed ? <Check className="size-4.5" /> : isCustom ? <Star className="size-4.5 fill-sky" /> : <Target className="size-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-bold leading-snug text-navy sm:text-sm">{label}</p>
              <p className="mt-1 text-[0.6875rem] font-semibold text-muted-foreground">
                {sourceLabel}{isCustom ? ` · ${selfAttestedLabel}` : ''}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-navy/15 bg-card px-2 py-0.5 text-[0.6875rem] font-extrabold text-navy">
              <Sparkles className="size-3 text-sky" aria-hidden="true" />
              +{task.exp_reward} EXP
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-2">
            {task.completed ? (
              <p className="flex min-h-9 items-center gap-1.5 text-xs font-bold text-sage"><Check className="size-3.5" />{claimedLabel}</p>
            ) : task.claimable ? (
              <Button type="button" size="sm" className="bg-navy font-extrabold text-white hover:bg-navy-light" disabled={busy} onClick={onClaim}>
                <Star className="size-3.5 fill-sky text-sky" />{claimLabel}
              </Button>
            ) : !isResolved && actionHref && actionLabel ? (
              <Link href={actionHref} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'border-navy/15 font-semibold text-navy hover:bg-navy/5')}>
                {actionLabel}<ArrowRight className="size-3.5" />
              </Link>
            ) : null}
            {isCustom && !isResolved && onEdit && onDelete ? (
              <>
                <Button type="button" size="icon-sm" variant="ghost" aria-label={editLabel} disabled={busy} onClick={onEdit}><Pencil className="size-3.5" /></Button>
                <Button type="button" size="icon-sm" variant="ghost" aria-label={deleteLabel} disabled={busy} onClick={onDelete}><Trash2 className="size-3.5" /></Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
