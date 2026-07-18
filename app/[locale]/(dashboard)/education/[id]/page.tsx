'use client';

import { use, useCallback } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEducationModule } from '@/hooks/use-education';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';
import { ThumbnailCarousel } from '@/components/education/thumbnail-carousel';
import { RichContent } from '@/components/education/rich-content';
import { KnowledgeCheck } from '@/components/education/knowledge-check';
import {
  dynamicLabelFallback,
  dynamicLabelKey,
} from '@/lib/i18n/dynamic-labels';

export default function EducationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const locale = useLocale();
  const t = useTranslations('educationLibrary');
  const tDynamic = useTranslations('dynamicLabels');
  const { id } = use(params);
  const { module, loading, error, refetch, updateProgress, answerCheck } =
    useEducationModule(id, locale);

  const markMediaOpened = useCallback(
    (mediaID: string) => {
      if (!module || module.progress.opened_media_ids.includes(mediaID)) return;
      void updateProgress(module.progress.completed_section_ids, [
        ...module.progress.opened_media_ids,
        mediaID,
      ]);
    },
    [module, updateProgress]
  );

  if (loading)
    return (
      <div className="mx-auto w-full max-w-5xl space-y-5" role="status">
        <Skeleton className="h-11 w-44" />
        <Card className="overflow-hidden rounded-3xl">
          <Skeleton className="aspect-[16/7] w-full" />
          <div className="p-8">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="mt-5 h-40 w-full" />
          </div>
        </Card>
        <span className="sr-only">{t('loading')}</span>
      </div>
    );
  if (error || !module)
    return (
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <Link
          href={ROUTES.EDUCATION}
          className="text-navy inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold"
        >
          <ArrowLeft className="size-4" />
          {t('back')}
        </Link>
        <Card className="p-10 text-center" role="alert">
          <BookOpen className="text-muted-foreground mx-auto size-10" />
          <h1 className="text-navy mt-5 text-2xl font-bold">
            {t('moduleUnavailableTitle')}
          </h1>
          <p className="text-muted-foreground mt-3 text-sm">
            {t('moduleUnavailableBody')}
          </p>
          <Button className="mt-6" onClick={() => void refetch()}>
            <RefreshCw className="size-4" />
            {t('retry')}
          </Button>
        </Card>
      </div>
    );

  const progress = module.progress.progress_percent;
  const parsedReviewDate = module.reviewed_at
    ? new Date(`${module.reviewed_at}T00:00:00+07:00`)
    : null;
  const reviewedAt =
    parsedReviewDate && !Number.isNaN(parsedReviewDate.getTime())
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: 'medium',
          timeZone: 'Asia/Jakarta',
        }).format(parsedReviewDate)
      : module.reviewed_at;
  return (
    <article className="mx-auto w-full max-w-5xl space-y-5 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={ROUTES.EDUCATION}
          className="text-navy hover:bg-navy/[0.04] focus-visible:ring-navy/30 inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold outline-none focus-visible:ring-2"
        >
          <ArrowLeft className="size-4" />
          {t('back')}
        </Link>
        <div className="flex min-w-64 items-center gap-3">
          <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-navy text-sm font-extrabold">{progress}%</span>
        </div>
      </div>

      <Card className="overflow-hidden rounded-3xl">
        <ThumbnailCarousel
          thumbnails={module.thumbnails}
          urls={module.thumbnail_urls}
          locale={locale}
          title={module.title}
        />
        <header className="border-border to-card border-b bg-gradient-to-b from-blue-50/90 px-5 py-7 sm:px-9 sm:py-9">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="rounded-full bg-blue-100 px-3 py-1.5 text-blue-800">
              {tDynamic(dynamicLabelKey('educationCategory', module.category), {
                value: dynamicLabelFallback(module.category),
              })}
            </span>
            <span className="border-border bg-card text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5">
              <Clock3 className="size-3.5" />
              {t('readTime', { count: module.estimated_minutes })}
            </span>
          </div>
          <p className="mt-5 text-xs font-extrabold tracking-[0.12em] text-blue-700 uppercase">
            {t('moduleEyebrow')}
          </p>
          <h1 className="text-navy mt-2 max-w-3xl text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
            {module.title}
          </h1>
          <p className="text-muted-foreground mt-4 max-w-3xl text-base leading-7">
            {module.summary}
          </p>
          <div className="bg-card mt-6 flex items-start gap-3 rounded-2xl border border-blue-200 p-4">
            <Target className="mt-0.5 size-5 shrink-0 text-blue-700" />
            <div>
              <p className="text-xs font-bold tracking-wide text-blue-700 uppercase">
                {t('objective')}
              </p>
              <p className="text-navy mt-1 text-sm leading-6">
                {module.learning_objective}
              </p>
            </div>
          </div>
        </header>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
        <div className="space-y-5">
          {module.sections.map((section, index) => {
            const completed = module.progress.completed_section_ids.includes(
              section.id
            );
            return (
              <section
                key={section.id}
                className="border-border bg-card shadow-soft rounded-3xl border p-5 sm:p-8"
              >
                <p className="text-xs font-extrabold tracking-[0.12em] text-blue-700 uppercase">
                  {t('sectionNumber', { number: index + 1 })}
                </p>
                <h2 className="text-navy mt-2 text-2xl font-extrabold">
                  {section.title}
                </h2>
                <div className="mt-6">
                  <RichContent
                    document={section.content}
                    mediaURLs={module.media_urls}
                    onMediaOpened={markMediaOpened}
                    labels={{
                      externalTitle: t('externalTitle'),
                      externalBody: t('externalBody'),
                      externalAction: t('externalAction'),
                      videoUnsupported: t('videoUnsupported'),
                      pdfDocument: t('pdfDocument'),
                      pdfOpen: t('pdfOpen'),
                    }}
                  />
                </div>
                {section.knowledge_check ? (
                  <KnowledgeCheck
                    check={section.knowledge_check}
                    completed={module.progress.correct_check_ids.includes(
                      section.knowledge_check.id
                    )}
                    labels={{
                      eyebrow: t('checkEyebrow'),
                      submit: t('checkSubmit'),
                      correct: t('checkCorrect'),
                      incorrect: t('checkIncorrect'),
                      completed: t('checkCompleted'),
                    }}
                    onAnswer={(choiceID) =>
                      answerCheck(section.knowledge_check!.id, choiceID)
                    }
                  />
                ) : null}
                <div className="border-border mt-7 border-t pt-5">
                  <Button
                    variant={completed ? 'outline' : 'primary'}
                    disabled={completed}
                    onClick={() =>
                      void updateProgress(
                        [...module.progress.completed_section_ids, section.id],
                        module.progress.opened_media_ids
                      )
                    }
                  >
                    {completed ? (
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    ) : null}
                    {completed
                      ? t('sectionCompleted')
                      : t('markSectionComplete')}
                  </Button>
                </div>
              </section>
            );
          })}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card className="rounded-2xl p-5">
            <p className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-blue-700 uppercase">
              <ShieldCheck className="size-4" />
              {t('reviewedBy')}
            </p>
            <p className="text-navy mt-3 text-sm font-bold">
              {module.reviewer_name}
            </p>
            <p className="text-muted-foreground mt-1 text-xs leading-5">
              {module.reviewer_role} · {reviewedAt}
            </p>
          </Card>
          <Card className="rounded-2xl p-5">
            <h2 className="text-navy text-sm font-extrabold">{t('sources')}</h2>
            <ul className="mt-3 space-y-3">
              {module.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-start gap-2 text-xs leading-5 text-blue-700 underline-offset-2 hover:underline"
                  >
                    <ExternalLink className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                      <strong>{source.title}</strong>
                      <br />
                      <span className="text-muted-foreground">
                        {source.publisher}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Card>
          <p className="bg-muted text-muted-foreground rounded-2xl p-4 text-xs leading-5">
            {module.disclaimer}
          </p>
        </aside>
      </div>
    </article>
  );
}
