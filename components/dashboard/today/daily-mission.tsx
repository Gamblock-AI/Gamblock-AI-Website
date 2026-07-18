'use client';

import { Check, Clock3, RefreshCw, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface DailyMissionProps {
  label: string;
  minutes: number;
  completed: boolean;
  claimable: boolean;
  loading: boolean;
  error: string | null;
  updating: boolean;
  onClaim: () => void;
  onAlternative: () => void;
  onRetry: () => void;
}

export function DailyMission({
  label,
  minutes,
  completed,
  claimable,
  loading,
  error,
  updating,
  onClaim,
  onAlternative,
  onRetry,
}: DailyMissionProps) {
  const t = useTranslations('recoveryDashboard');

  return (
    <section className="h-full px-4 py-4 sm:px-5" aria-labelledby="daily-mission-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="daily-mission-title" className="text-navy text-base font-bold">
            {t('missionTitle')}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {t('missionDescription')}
          </p>
        </div>
        {!loading && !error ? (
          <Button
            type="button"
            variant="ghost"
            className="text-navy h-11 shrink-0 px-3"
            onClick={onAlternative}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t('missionAlternative')}</span>
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div className="border-border bg-card mt-3 flex min-h-[4.5rem] items-center gap-3 rounded-2xl border p-3" role="status">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-24" />
          </div>
          <span className="sr-only">{t('missionLoading')}</span>
        </div>
      ) : error ? (
        <div className="border-amber/40 bg-amber/[0.10] mt-3 flex min-h-[4.5rem] flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <p className="text-foreground text-sm font-medium">{t('missionError')}</p>
          <Button type="button" variant="outline" className="h-11" onClick={onRetry}>
            <RefreshCw className="size-4" aria-hidden="true" />
            {t('missionRetry')}
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            'mt-3 flex min-h-[4.5rem] flex-col gap-2 rounded-2xl border p-2.5 transition-[background-color,border-color,box-shadow] duration-200 sm:flex-row sm:items-center motion-reduce:transition-none',
            completed
              ? 'border-sage/35 bg-sage/[0.09]'
              : 'border-border bg-card shadow-soft',
          )}
        >
          <div className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl px-1 text-left">
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-[background-color,border-color,transform] duration-200 group-active:scale-95 motion-reduce:transform-none motion-reduce:transition-none',
                completed
                  ? 'border-sage bg-sage text-white'
                  : 'border-navy/35 bg-card text-transparent group-hover:border-navy/65',
              )}
              aria-hidden="true"
            >
              {updating ? (
                <RefreshCw className="text-navy size-4 animate-spin motion-reduce:animate-none" />
              ) : (
                <Check className="size-4" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  'block text-sm leading-5 font-semibold sm:text-[0.9375rem]',
                  completed ? 'text-muted-foreground line-through' : 'text-foreground',
                )}
              >
                {label}
              </span>
              <span className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs font-medium">
                <Clock3 className="size-3.5" aria-hidden="true" />
                {t('minutes', { count: minutes })}
              </span>
            </span>
          </div>
          <span className="sr-only" aria-live="polite">
            {updating ? t('claimingExp') : completed ? t('expClaimed') : claimable ? t('claimReady') : t('claimLocked')}
          </span>
          <Button
            type="button"
            variant={claimable && !completed ? 'primary' : 'outline'}
            className="h-11"
            disabled={updating || !claimable || completed}
            onClick={onClaim}
          >
            {updating ? <RefreshCw className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Check className="size-4" aria-hidden="true" />}
            {completed ? t('expClaimed') : t('claimExp')}
          </Button>
        </div>
      )}
    </section>
  );
}
