'use client';

import { ArrowRight, BookOpen, Brain, Clock3, Leaf, LockKeyhole, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useEducationModules } from '@/hooks/use-education';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const moduleIcons = [BookOpen, Brain, Leaf] as const;

function toPercent(progress: number) {
  if (!Number.isFinite(progress)) return 0;
  const normalized = progress <= 1 ? progress * 100 : progress;
  return Math.min(100, Math.max(0, Math.round(normalized)));
}

export default function EducationPage() {
  const t = useTranslations('educationLibrary');
  const { modules, loading, error, refetch } = useEducationModules();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 pb-8">
      <header className="grid gap-5 border-b border-border pb-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-sage uppercase">{t('eyebrow')}</p>
          <h1 className="mt-2 max-w-3xl text-3xl leading-tight font-extrabold tracking-tight text-navy sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {t('description')}
          </p>
        </div>
        <p className="flex items-start gap-3 rounded-2xl border border-sage/20 bg-sage/[0.055] p-4 text-sm leading-6 text-muted-foreground">
          <LockKeyhole className="mt-0.5 size-5 shrink-0 text-sage" aria-hidden="true" />
          {t('privacyNote')}
        </p>
      </header>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="size-11 rounded-xl" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="mt-5 h-5 w-2/3" />
              <Skeleton className="mt-3 h-16 w-full" />
              <Skeleton className="mt-6 h-11 w-full" />
            </Card>
          ))}
          <span className="sr-only">{t('loading')}</span>
        </div>
      ) : error ? (
        <Card className="mx-auto max-w-xl p-6 text-center sm:p-8" role="alert">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber/10 text-amber">
            <RefreshCw className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-xl font-bold text-navy">{t('errorTitle')}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('errorBody')}</p>
          <Button className="mt-5 h-11" onClick={() => void refetch()}>
            <RefreshCw className="size-4" aria-hidden="true" />
            {t('retry')}
          </Button>
        </Card>
      ) : modules.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t('emptyTitle')}
          hint={t('emptyBody')}
          className="min-h-64 bg-card"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module, index) => {
            const Icon = moduleIcons[index % moduleIcons.length];
            const progress = toPercent(module.progress);
            const progressLabel =
              progress === 0
                ? t('notStarted')
                : progress === 100
                  ? t('completed')
                  : t('inProgress');

            return (
              <article key={module.id || module.slug} className="group flex h-full flex-col rounded-[1.5rem] border border-border bg-card p-5 shadow-soft transition-colors hover:border-navy/25">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-azure text-navy">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Clock3 className="size-3.5" aria-hidden="true" />
                    {t('readTime', { count: module.estimated_minutes })}
                  </span>
                </div>

                <h2 className="mt-5 text-lg leading-7 font-bold text-navy">{module.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{module.summary}</p>

                <div className="mt-5 border-t border-border pt-4">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-medium text-muted-foreground">{t('progress')}</span>
                    <span className={cn('font-semibold', progress === 100 ? 'text-sage' : 'text-navy')}>
                      {progressLabel}{progress > 0 && progress < 100 ? `, ${progress}%` : ''}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                    <div
                      className={cn('h-full rounded-full', progress === 100 ? 'bg-sage' : 'bg-navy')}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <Link
                    href={`/education/${module.slug}`}
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-navy/15 text-sm font-semibold text-navy outline-none transition-colors hover:bg-navy/[0.04] focus-visible:ring-2 focus-visible:ring-navy/30"
                  >
                    {t('open')}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
