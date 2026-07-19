'use client';

import { ArrowRight, BookOpen, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { EducationModule } from '@/hooks/use-education';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

interface LearningNextStepProps {
  module: EducationModule | null;
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
}

export function LearningNextStep({
  module,
  loading,
  error,
  onRetry,
}: LearningNextStepProps) {
  const t = useTranslations('recoveryDashboard');

  return (
    <section
      className="border-border bg-card shadow-soft flex h-full min-h-64 flex-col rounded-2xl border p-5"
      aria-labelledby="learning-next-step-title"
    >
      <div className="flex items-start gap-3">
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
        <div className="mt-5 space-y-3" role="status">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-2 w-full" />
          <span className="sr-only">{t('learningLoading')}</span>
        </div>
      ) : error ? (
        <div className="border-border bg-muted/30 mt-5 rounded-xl border border-dashed p-4">
          <p className="text-muted-foreground text-sm leading-6">
            {t('learningError')}
          </p>
          <Button variant="outline" className="mt-3 min-h-11" onClick={onRetry}>
            <RefreshCw className="size-4" aria-hidden="true" />
            {t('learningRetry')}
          </Button>
        </div>
      ) : module ? (
        <div className="mt-5 flex flex-1 flex-col">
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
          <h3 className="text-navy mt-3 text-base leading-6 font-bold">
            {module.title}
          </h3>
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-6">
            {module.summary}
          </p>
          <div
            className="bg-muted mt-4 h-2 overflow-hidden rounded-full"
            aria-hidden="true"
          >
            <div
              className="bg-sky h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${module.progress.progress_percent}%` }}
            />
          </div>
          <Link
            href={`/education/${module.slug}`}
            className="bg-navy hover:bg-navy/90 focus-visible:ring-navy/35 mt-5 inline-flex min-h-11 items-center gap-2 self-start rounded-xl px-4 text-sm font-bold text-white transition-colors outline-none focus-visible:ring-2"
          >
            {module.progress.progress_percent > 0
              ? t('learningContinue')
              : t('learningStart')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="border-border bg-muted/30 mt-5 flex flex-1 flex-col justify-between rounded-xl border border-dashed p-4">
          <p className="text-muted-foreground text-sm leading-6">
            {t('learningEmpty')}
          </p>
          <Link
            href={ROUTES.EDUCATION}
            className="text-navy focus-visible:ring-navy/35 mt-4 inline-flex min-h-11 items-center gap-2 self-start rounded-xl text-sm font-bold outline-none hover:underline focus-visible:ring-2"
          >
            {t('learningBrowse')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
}
