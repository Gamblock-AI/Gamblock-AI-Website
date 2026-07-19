'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useEducationModules } from '@/hooks/use-education';
import { Link } from '@/i18n/routing';
import {
  DashboardPage,
  DashboardPageHeader,
} from '@/components/dashboard/dashboard-page';
import { ThumbnailCarousel } from '@/components/education/thumbnail-carousel';
import {
  dynamicLabelFallback,
  dynamicLabelKey,
} from '@/lib/i18n/dynamic-labels';

export default function EducationPage() {
  const locale = useLocale();
  const t = useTranslations('educationLibrary');
  const tDynamic = useTranslations('dynamicLabels');
  const { modules, loading, error, refetch } = useEducationModules(locale);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const categories = useMemo(
    () =>
      Array.from(new Set(modules.map((item) => item.category))).filter(Boolean),
    [modules]
  );
  const filtered = useMemo(
    () =>
      modules.filter((item) => {
        const matchesQuery = `${item.title} ${item.summary}`
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase());
        return (
          matchesQuery && (category === 'all' || item.category === category)
        );
      }),
    [category, modules, query]
  );
  const continued = modules.find(
    (item) =>
      item.progress.progress_percent > 0 && item.progress.progress_percent < 100
  );

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={BookOpen}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      {continued ? (
        <section className="bg-navy shadow-card mb-5 overflow-hidden rounded-3xl text-white">
          <div className="grid sm:grid-cols-[minmax(0,1fr)_19rem]">
            <div className="p-6 sm:p-8">
              <p className="flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-blue-200 uppercase">
                <Sparkles className="size-4" />
                {t('continueEyebrow')}
              </p>
              <h2 className="mt-3 text-xl font-extrabold sm:text-2xl">
                {continued.title}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                {continued.summary}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-blue-400"
                    style={{ width: `${continued.progress.progress_percent}%` }}
                  />
                </div>
                <span className="text-xs font-bold">
                  {continued.progress.progress_percent}%
                </span>
              </div>
              <Link
                href={`/education/${continued.slug}`}
                className="text-navy mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold outline-none hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-white/60"
              >
                {t('continueAction')}
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="hidden h-full sm:block">
              <ThumbnailCarousel
                thumbnails={continued.thumbnails}
                urls={continued.thumbnail_urls}
                locale={locale}
                title={continued.title}
                compact
                fullHeight
              />
            </div>
          </div>
        </section>
      ) : null}

      <div className="border-border bg-card mb-5 flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">{t('search')}</span>
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('searchPlaceholder')}
            className="border-input bg-background min-h-11 w-full rounded-xl border pr-3 pl-10 text-sm outline-none focus:ring-2 focus:ring-blue-600/25"
          />
        </label>
        <label className="sr-only" htmlFor="education-category">
          {t('category')}
        </label>
        <select
          id="education-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="border-input bg-background text-navy min-h-11 rounded-xl border px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-600/25"
        >
          <option value="all">{t('allCategories')}</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {tDynamic(dynamicLabelKey('educationCategory', item), {
                value: dynamicLabelFallback(item),
              })}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <div className="p-5">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="mt-3 h-16 w-full" />
              </div>
            </Card>
          ))}
          <span className="sr-only">{t('loading')}</span>
        </div>
      ) : error ? (
        <Card className="mx-auto max-w-xl p-8 text-center" role="alert">
          <RefreshCw className="text-amber mx-auto size-7" />
          <h2 className="text-navy mt-4 text-xl font-bold">
            {t('errorTitle')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">{t('errorBody')}</p>
          <Button className="mt-5" onClick={() => void refetch()}>
            {t('retry')}
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={modules.length ? t('noResultsTitle') : t('emptyTitle')}
          hint={modules.length ? t('noResultsBody') : t('emptyBody')}
          className="bg-card min-h-64"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((module) => {
            const progress = module.progress.progress_percent;
            return (
              <article
                key={module.id}
                className="group border-border bg-card shadow-soft hover:shadow-card flex h-full flex-col overflow-hidden rounded-3xl border transition hover:-translate-y-0.5 motion-reduce:transform-none"
              >
                <ThumbnailCarousel
                  thumbnails={module.thumbnails.slice(0, 1)}
                  urls={module.thumbnail_urls}
                  locale={locale}
                  title={module.title}
                  compact
                />
                <div className="flex flex-1 flex-col p-5">
                  <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                      {tDynamic(
                        dynamicLabelKey('educationCategory', module.category),
                        { value: dynamicLabelFallback(module.category) }
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="size-3.5" />
                      {t('readTime', { count: module.estimated_minutes })}
                    </span>
                  </div>
                  <h2 className="text-navy mt-4 text-lg leading-7 font-bold">
                    {module.title}
                  </h2>
                  <p className="text-muted-foreground mt-2 flex-1 text-sm leading-6">
                    {module.summary}
                  </p>
                  <div className="mt-5 flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">
                      {progress === 100 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="size-3.5" />
                          {t('completed')}
                        </span>
                      ) : (
                        t('progress')
                      )}
                    </span>
                    <span className="text-navy">{progress}%</span>
                  </div>
                  <div className="bg-muted mt-2 h-1.5 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <Link
                    href={`/education/${module.slug}`}
                    className="bg-navy hover:bg-navy/90 focus-visible:ring-navy/30 mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white outline-none focus-visible:ring-2"
                  >
                    {progress ? t('continueAction') : t('open')}
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </DashboardPage>
  );
}
