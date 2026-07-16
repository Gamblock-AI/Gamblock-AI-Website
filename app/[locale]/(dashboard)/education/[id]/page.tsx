'use client';

import { use } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, Clock3, LockKeyhole, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SafeMarkdown } from '@/components/education/safe-markdown';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEducationModule } from '@/hooks/use-education';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

function toPercent(progress: number) {
  if (!Number.isFinite(progress)) return 0;
  const normalized = progress <= 1 ? progress * 100 : progress;
  return Math.min(100, Math.max(0, Math.round(normalized)));
}

export default function EducationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations('educationLibrary');
  const { id } = use(params);
  const { module, loading, error, refetch } = useEducationModule(id);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-5" role="status">
        <Skeleton className="h-11 w-44" />
        <Card className="rounded-3xl p-6 sm:p-8">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-4 h-10 w-3/4" />
          <Skeleton className="mt-3 h-5 w-1/2" />
          <div className="mt-8 space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-5 w-full" />
            ))}
          </div>
        </Card>
        <span className="sr-only">{t('loading')}</span>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <Link
          href={ROUTES.EDUCATION}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-navy outline-none hover:bg-navy/[0.04] focus-visible:ring-2 focus-visible:ring-navy/30"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t('back')}
        </Link>
        <Card className="rounded-3xl p-6 text-center sm:p-10" role="alert">
          <BookOpen className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-5 text-2xl font-bold text-navy">{t('moduleUnavailableTitle')}</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
            {t('moduleUnavailableBody')}
          </p>
          <Button className="mt-6 h-11" onClick={() => void refetch()}>
            <RefreshCw className="size-4" aria-hidden="true" />
            {t('retry')}
          </Button>
        </Card>
      </div>
    );
  }

  const progress = toPercent(module.progress);

  return (
    <article className="mx-auto w-full max-w-4xl space-y-5 pb-8">
      <Link
        href={ROUTES.EDUCATION}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-navy outline-none hover:bg-navy/[0.04] focus-visible:ring-2 focus-visible:ring-navy/30"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t('back')}
      </Link>

      <Card className="overflow-hidden rounded-3xl">
        <header className="border-b border-border bg-azure/65 px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-muted-foreground">
            <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-sage/35 bg-card px-3 text-sage">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              {t('publishedContent')}
            </span>
            <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3">
              <Clock3 className="size-3.5" aria-hidden="true" />
              {t('readTime', { count: module.estimated_minutes })}
            </span>
          </div>
          <p className="mt-5 text-xs font-bold tracking-[0.12em] text-sage uppercase">
            {t('moduleEyebrow')}
          </p>
          <h1 className="mt-2 text-[1.75rem] leading-tight font-extrabold tracking-tight text-navy sm:text-[2rem]">
            {module.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {module.summary}
          </p>
        </header>

        <div className="px-5 py-7 sm:px-8 sm:py-10">
          {module.body_markdown.trim() ? (
            <SafeMarkdown markdown={module.body_markdown} />
          ) : (
            <p className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
              {t('contentEmpty')}
            </p>
          )}
        </div>

        <footer className="border-t border-border bg-muted/55 px-5 py-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
              <LockKeyhole className="mt-0.5 size-4 shrink-0 text-sage" aria-hidden="true" />
              {t('privacyNote')}
            </p>
            <div className="min-w-56">
              <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                <span className="text-muted-foreground">{t('progress')}</span>
                <span className="text-navy">{progress}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                <div className="h-full rounded-full bg-navy" style={{ width: `${progress}%` }} />
              </div>
              {progress === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">{t('progressUnavailable')}</p>
              ) : null}
            </div>
          </div>
        </footer>
      </Card>
    </article>
  );
}
