'use client';

import { ArrowRight, BookOpen, CheckCircle2, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { EducationModule } from '@/hooks/use-education';
import { Link } from '@/i18n/routing';

interface LearningNextStepProps {
  module: EducationModule | null;
  allCompleted?: boolean;
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
}

export function LearningNextStep({
  module,
  allCompleted = false,
  loading,
  error,
  onRetry,
}: LearningNextStepProps) {
  const t = useTranslations('recoveryDashboard');

  return (
    <section
      className="border-border bg-card shadow-soft flex h-full flex-col justify-between rounded-2xl border p-4 sm:p-5"
      aria-labelledby="learning-next-step-title"
    >
      <div className="flex items-start gap-3 shrink-0">
        <span className="bg-navy text-sky flex size-11 shrink-0 items-center justify-center rounded-xl shadow-sm">
          <BookOpen className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-navy-light text-xs font-bold tracking-[0.1em] uppercase">
            {t('learningEyebrow')}
          </p>
          <h2
            id="learning-next-step-title"
            className="text-navy mt-1 text-lg font-bold"
          >
            {t('learningTitle')}
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 space-y-3" role="status">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-2 w-full" />
          <span className="sr-only">{t('learningLoading')}</span>
        </div>
      ) : error ? (
        <div className="border-border/80 bg-muted/20 mt-4 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm leading-6">
            {t('learningError')}
          </p>
          <Button variant="outline" className="mt-3 min-h-10 rounded-xl" onClick={onRetry}>
            <RefreshCw className="size-4" aria-hidden="true" />
            {t('learningRetry')}
          </Button>
        </div>
      ) : module ? (
        <div className="mt-3 flex-1 flex flex-col justify-between">
          <div>
            <div className="text-muted-foreground flex items-center justify-between gap-3 text-xs font-semibold">
              <span>
                {t('learningMinutes', { count: module.estimated_minutes })}
              </span>
              <span>
                {t('learningProgress', {
                  count: module.progress.progress_percent,
                })}
              </span>
            </div>
            <h3 className="text-navy mt-2 text-base leading-6 font-bold">
              {module.title}
            </h3>
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-6">
              {module.summary}
            </p>
            <div
              role="progressbar"
              aria-label={t('learningProgress', {
                count: module.progress.progress_percent,
              })}
              aria-valuenow={module.progress.progress_percent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="bg-muted mt-2.5 h-2 overflow-hidden rounded-full"
            >
              <div
                className="bg-sky h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
                style={{ width: `${module.progress.progress_percent}%` }}
              />
            </div>
          </div>
          <Link
            href={`/education/${module.slug}`}
            className="bg-navy hover:bg-navy/90 focus-visible:ring-navy/35 mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white transition-colors outline-none focus-visible:ring-2"
          >
            {module.progress.progress_percent > 0
              ? t('learningContinue')
              : t('learningStart')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-1 flex-col">
          <EmptyState
            icon={allCompleted ? CheckCircle2 : BookOpen}
            title={allCompleted ? t('learningAllDone') : t('learningEmpty')}
            hint={t('learningCatalogBody')}
            className="flex-1 h-full min-h-36 py-6"
          />
        </div>
      )}
    </section>
  );
}
