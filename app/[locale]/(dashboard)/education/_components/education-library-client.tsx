'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useEducationModules } from '@/hooks/use-education';
import { Link, useRouter } from '@/i18n/routing';
import {
  DashboardPage,
  DashboardPageHeader,
} from '@/components/dashboard/dashboard-page';
import { ThumbnailCarousel } from '@/components/education/thumbnail-carousel';
import {
  dynamicLabelFallback,
  dynamicLabelKey,
} from '@/lib/i18n/dynamic-labels';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes';

export function EducationLibraryClient() {
  const locale = useLocale();
  const t = useTranslations('educationLibrary');
  const tDynamic = useTranslations('dynamicLabels');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { modules, loading, error, refetch } = useEducationModules(locale);
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [category, setCategory] = useState(() => {
    const requested = searchParams.get('category');
    return requested && requested !== 'all' ? requested : 'all';
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const urlTimerRef = useRef<number | null>(null);
  const categories = useMemo(
    () =>
      Array.from(new Set(modules.map((item) => item.category))).filter(Boolean),
    [modules]
  );
  // A stale/invalid URL category (e.g. after a category was removed) falls back
  // to "all" for display; the URL is corrected on the next user interaction.
  const effectiveCategory =
    category === 'all' || categories.includes(category) ? category : 'all';
  const filtered = useMemo(
    () =>
      modules.filter((item) => {
        const matchesQuery = `${item.title} ${item.summary}`
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase());
        return (
          matchesQuery &&
          (effectiveCategory === 'all' || item.category === effectiveCategory)
        );
      }),
    [effectiveCategory, modules, query]
  );
  const continued = modules.find(
    (item) =>
      item.progress.progress_percent > 0 && item.progress.progress_percent < 100
  );

  const updateParams = (nextQuery: string, nextCategory: string) => {
    const params: Record<string, string> = {};
    if (nextQuery.trim()) params.q = nextQuery.trim();
    if (nextCategory && nextCategory !== 'all') params.category = nextCategory;
    router.replace(
      {
        pathname: ROUTES.EDUCATION,
        query: Object.keys(params).length ? params : {},
      },
      { scroll: false }
    );
  };

  const clearSearchTimer = () => {
    if (urlTimerRef.current) {
      clearTimeout(urlTimerRef.current);
      urlTimerRef.current = null;
    }
  };

  const handleSearchChange = (value: string) => {
    setQuery(value);
    clearSearchTimer();
    urlTimerRef.current = window.setTimeout(() => {
      urlTimerRef.current = null;
      updateParams(value, effectiveCategory);
    }, 350);
  };

  useEffect(() => {
    return () => {
      clearSearchTimer();
    };
  }, []);

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
              <p className="flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-sky-light uppercase">
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
                <div
                  role="progressbar"
                  aria-label={t('progress')}
                  aria-valuenow={continued.progress.progress_percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-2 flex-1 overflow-hidden rounded-full bg-white/15"
                >
                  <div
                    className="bg-sky h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
                    style={{ width: `${continued.progress.progress_percent}%` }}
                  />
                </div>
                <span className="text-xs font-bold">
                  {continued.progress.progress_percent}%
                </span>
              </div>
              <Link
                href={`/education/${continued.slug}`}
                className="text-navy mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold outline-none hover:bg-azure/60 focus-visible:ring-2 focus-visible:ring-white/60"
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

      <div className="border-border bg-card shadow-soft mb-6 rounded-[1.5rem] border p-4 sm:p-5">
        {/* Mobile Header with Toggle Button */}
        <div className="flex items-center justify-between sm:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-bold text-navy shrink-0">
              {t('filterSectionTitle')}
            </span>
            <span className="bg-azure text-navy/80 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold">
              {filtered.length !== modules.length
                ? `${filtered.length}/${modules.length}`
                : modules.length}
            </span>
            {!mobileFilterOpen && (query.trim() || effectiveCategory !== 'all') && (
              <span className="bg-sky/15 text-navy shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold">
                {t('activeFiltersCount', {
                  count:
                    (query.trim() ? 1 : 0) +
                    (effectiveCategory !== 'all' ? 1 : 0),
                })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {!mobileFilterOpen && (query.trim() || effectiveCategory !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  clearSearchTimer();
                  setQuery('');
                  setCategory('all');
                  updateParams('', 'all');
                }}
                className="text-crimson hover:bg-crimson/10 inline-flex items-center justify-center rounded-lg p-1.5 text-xs font-bold transition-colors cursor-pointer"
                title={t('resetFilters')}
                aria-label={t('resetFilters')}
              >
                <RotateCcw className="size-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileFilterOpen((prev) => !prev)}
              aria-expanded={mobileFilterOpen}
              aria-controls="education-filter-content"
              className={cn(
                'focus-visible:ring-navy/30 inline-flex min-h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-all duration-200 outline-none focus-visible:ring-2 cursor-pointer',
                mobileFilterOpen || (query.trim() || effectiveCategory !== 'all')
                  ? 'border-navy/30 bg-navy text-white shadow-xs'
                  : 'border-border/80 bg-muted/40 text-navy hover:border-navy/20 hover:bg-azure/40'
              )}
            >
              <SlidersHorizontal className="size-3.5" />
              <span>
                {mobileFilterOpen ? t('filterButtonOpen') : t('filterButton')}
              </span>
              <ChevronDown
                className={cn(
                  'size-3.5 transition-transform duration-200',
                  mobileFilterOpen ? 'rotate-180' : ''
                )}
              />
            </button>
          </div>
        </div>

        {/* Filter Content (Collapsible on Mobile, always open on Desktop) */}
        <div
          id="education-filter-content"
          className={cn(
            'space-y-3.5 sm:block',
            mobileFilterOpen
              ? 'block border-t border-border/50 pt-3.5 mt-3 sm:border-0 sm:pt-0 sm:mt-0'
              : 'hidden sm:block'
          )}
        >
          {/* Top Row: Compact Search Input & Status Info */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-80 md:w-96 group">
              <span className="sr-only">{t('search')}</span>
              <Search className="text-navy-light/70 group-focus-within:text-navy absolute top-1/2 left-3.5 size-4 -translate-y-1/2 transition-colors pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder={t('searchPlaceholder')}
                className="border-input/80 bg-background/50 text-foreground placeholder:text-muted-foreground/70 min-h-11 w-full rounded-xl border pr-9 pl-10 text-sm font-medium transition-all duration-200 outline-none hover:border-border hover:bg-background focus:border-navy/50 focus:ring-2 focus:ring-navy/15 focus:bg-background shadow-2xs"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  aria-label={t('clearSearch')}
                  title={t('clearSearch')}
                  className="hover:bg-muted/60 text-muted-foreground hover:text-navy absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 transition-colors cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>

            {/* Result Info / Reset */}
            {query || effectiveCategory !== 'all' ? (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-semibold text-muted-foreground">
                  {t('filterResultsCount', {
                    filtered: filtered.length,
                    total: modules.length,
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    clearSearchTimer();
                    setQuery('');
                    setCategory('all');
                    updateParams('', 'all');
                  }}
                  className="text-crimson hover:text-crimson-dark inline-flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw className="size-3" />
                  <span>{t('resetFilters')}</span>
                </button>
              </div>
            ) : (
              <span className="text-muted-foreground/70 hidden text-xs font-semibold sm:inline">
                {t('showingModulesCount', { count: modules.length })}
              </span>
            )}
          </div>

          {/* Category Filter Pills Bar */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 border-t border-border/50 pt-3">
            <button
              type="button"
              onClick={() => {
                clearSearchTimer();
                setCategory('all');
                updateParams(query, 'all');
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all duration-150 cursor-pointer ${
                effectiveCategory === 'all'
                  ? 'border-navy bg-navy text-white shadow-xs'
                  : 'border-border/70 bg-muted/30 text-muted-foreground hover:bg-azure/50 hover:text-navy hover:border-navy/20'
              }`}
            >
              <span>{t('allCategories')}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                  effectiveCategory === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-muted text-navy'
                }`}
              >
                {modules.length}
              </span>
            </button>

            {categories.map((item) => {
              const isActive = effectiveCategory === item;
              const count = modules.filter((m) => m.category === item).length;
              const label = tDynamic(dynamicLabelKey('educationCategory', item), {
                value: dynamicLabelFallback(item),
              });

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    clearSearchTimer();
                    setCategory(item);
                    updateParams(query, item);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'border-navy bg-navy text-white shadow-xs'
                      : 'border-border/70 bg-muted/30 text-muted-foreground hover:bg-azure/50 hover:text-navy hover:border-navy/20'
                  }`}
                >
                  <span>{label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-muted text-navy'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
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
                    <span className="bg-azure/70 text-navy-light rounded-full px-2.5 py-1">
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
                        <span className="text-sage-dark inline-flex items-center gap-1">
                          <CheckCircle2 className="size-3.5" />
                          {t('completed')}
                        </span>
                      ) : (
                        t('progress')
                      )}
                    </span>
                    <span className="text-navy">{progress}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={t('progress')}
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="bg-muted mt-2 h-1.5 overflow-hidden rounded-full"
                  >
                    <div
                      className="bg-navy-light h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
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
