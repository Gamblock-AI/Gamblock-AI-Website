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
  loading: boolean;
  error: string | null;
  updating: boolean;
  onToggle: () => void;
  onAlternative: () => void;
  onRetry: () => void;
}

export function DailyMission({
  label,
  minutes,
  completed,
  loading,
  error,
  updating,
  onToggle,
  onAlternative,
  onRetry,
}: DailyMissionProps) {
  const t = useTranslations('recoveryDashboard');

  return (
    <section className="border-t border-navy/10 px-4 py-5 sm:px-5" aria-labelledby="daily-mission-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="daily-mission-title" className="text-base font-bold text-navy">
            {t('missionTitle')}
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {t('missionDescription')}
          </p>
        </div>
        {!loading && !error ? (
          <Button
            type="button"
            variant="ghost"
            className="h-11 shrink-0 px-3 text-navy"
            onClick={onAlternative}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t('missionAlternative')}</span>
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-white p-4" role="status">
          <Skeleton className="size-11 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-24" />
          </div>
          <span className="sr-only">{t('missionLoading')}</span>
        </div>
      ) : error ? (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-amber/30 bg-amber/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <p className="text-sm font-medium text-foreground">{t('missionError')}</p>
          <Button type="button" variant="outline" className="h-11" onClick={onRetry}>
            <RefreshCw className="size-4" aria-hidden="true" />
            {t('missionRetry')}
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-border bg-white p-3 sm:flex-row sm:items-center sm:p-4">
          <button
            type="button"
            aria-pressed={completed}
            disabled={updating}
            onClick={onToggle}
            className="group flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-navy/30 disabled:cursor-wait disabled:opacity-60"
          >
            <span
              className={cn(
                'flex size-11 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                completed
                  ? 'border-sage bg-sage text-white'
                  : 'border-navy/25 bg-white text-transparent group-hover:border-navy/50',
              )}
              aria-hidden="true"
            >
              <Check className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  'block text-sm leading-6 font-semibold',
                  completed ? 'text-muted-foreground line-through' : 'text-foreground',
                )}
              >
                {label}
              </span>
              <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock3 className="size-3.5" aria-hidden="true" />
                {t('minutes', { count: minutes })}
              </span>
            </span>
          </button>
          <span className="sr-only" aria-live="polite">
            {updating ? t('missionUpdating') : completed ? t('missionUndo') : t('missionComplete')}
          </span>
          <Button
            type="button"
            variant="outline"
            className="h-11 sm:hidden"
            onClick={onAlternative}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            {t('missionAlternative')}
          </Button>
        </div>
      )}
    </section>
  );
}
