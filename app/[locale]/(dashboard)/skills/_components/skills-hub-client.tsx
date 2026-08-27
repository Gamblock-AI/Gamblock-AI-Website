'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  LayoutGrid,
  Loader2,
  Search,
  SearchX,
  X,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Pagination } from '@/components/dashboard/pagination';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Link, useRouter } from '@/i18n/routing';
import { resolveEducationMediaURL } from '@/components/education/media-url';
import { useLearningHubProviders } from '@/hooks/use-learning-hub';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes';

function ProviderLogo({
  name,
  logoUrl,
  isFeatured,
}: {
  name: string;
  logoUrl?: string;
  isFeatured?: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const fallbackGamblock = isFeatured ? '/images/logo-mark.png' : '';
  const source = logoUrl
    ? resolveEducationMediaURL(logoUrl)
    : fallbackGamblock;

  if (source && !imageError) {
    return (
      <div className="border-border/80 relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-white p-2 shadow-2xs transition-all duration-200 group-hover:scale-105 group-hover:shadow-xs sm:size-14 sm:p-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={source}
          alt={name}
          loading="lazy"
          onError={() => setImageError(true)}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={cn(
        'flex size-12 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold shadow-2xs transition-transform duration-200 group-hover:scale-105 sm:size-14 sm:text-base',
        isFeatured
          ? 'bg-navy text-white'
          : 'from-navy to-navy-light bg-gradient-to-br text-white'
      )}
    >
      {initials}
    </div>
  );
}

export function SkillsHubClient() {
  const t = useTranslations('skillsHub');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const urlTimerRef = useRef<number | null>(null);
  const hub = useLearningHubProviders(locale, query);
  const providers = hub.items;
  const pagination = hub.pagination;

  const handleChange = (value: string) => {
    setQuery(value);
    if (urlTimerRef.current) clearTimeout(urlTimerRef.current);
    urlTimerRef.current = window.setTimeout(() => {
      urlTimerRef.current = null;
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) params.set('q', value.trim());
      else params.delete('q');
      params.delete('page[skillsProviders]');
      const query = params.toString();
      router.replace(query ? `${ROUTES.SKILLS}?${query}` : ROUTES.SKILLS, {
        scroll: false,
      });
    }, 350);
  };

  useEffect(() => {
    return () => {
      if (urlTimerRef.current) clearTimeout(urlTimerRef.current);
    };
  }, []);

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={GraduationCap}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <DashboardPanel
        icon={BookOpen}
        title={t('selectorTitle')}
        description={t('selectorDescription')}
        action={
          pagination.totalItems > 0 ? (
            <DashboardStatus tone="navy">
              <span className="flex items-center gap-1.5 font-semibold">
                <LayoutGrid className="text-navy size-3.5" aria-hidden="true" />
                {t('platformsCount', { count: pagination.totalItems })}
              </span>
            </DashboardStatus>
          ) : null
        }
      >
        {hub.loading ? (
          <div
            className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm"
            role="status"
          >
            <Loader2
              className="text-navy size-5 animate-spin"
              aria-hidden="true"
            />
            <span>{t('loading')}</span>
          </div>
        ) : hub.error ? (
          <div className="border-amber/40 bg-amber/10 mt-2 flex items-center justify-between rounded-2xl border p-4 text-sm">
            <span>{t('error')}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void hub.refetch()}
            >
              {t('retry')}
            </Button>
          </div>
        ) : providers.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title={t('noProvidersTitle')}
            hint={t('noProvidersHint')}
            className="py-10"
          />
        ) : (
          <div>
            <div className="mb-6">
              <div className="relative w-full sm:w-80 sm:max-w-sm">
                <Search
                  className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-navy focus-visible:ring-navy/20 h-10 w-full rounded-xl border pr-9 pl-10 text-xs outline-none transition-all focus-visible:ring-2 sm:text-sm"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => handleChange('')}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1"
                    aria-label={t('clearSearch')}
                  >
                    <X className="size-3.5" />
                  </button>
                ) : null}
              </div>
            </div>

            {providers.length === 0 ? (
              <div className="border-border/80 bg-muted/20 rounded-2xl border border-dashed p-8 text-center">
                <SearchX
                  className="text-muted-foreground/60 mx-auto size-8"
                  aria-hidden="true"
                />
                <p className="text-navy mt-2 text-sm font-bold">
                  {t('noSearchResults', { query })}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => handleChange('')}
                >
                  {t('clearSearch')}
                </Button>
              </div>
            ) : (
              <div>
                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  {providers.map((provider) => {
                    const isFeatured = provider.slug === 'gamblock-ai';
                    return (
                      <Link
                        key={provider.slug}
                        href={`${ROUTES.SKILLS}/${provider.slug}`}
                        className={cn(
                          'group relative flex items-start gap-4 rounded-2xl border p-4 sm:p-4.5 transition-all duration-200 outline-none hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-navy/30',
                          isFeatured
                            ? 'border-navy/30 bg-gradient-to-br from-azure/50 via-card to-card hover:border-navy/50 shadow-soft'
                            : 'border-border/80 bg-card hover:border-navy/30 hover:bg-muted/15 shadow-2xs'
                        )}
                      >
                        <ProviderLogo
                          name={provider.name}
                          logoUrl={provider.logo_url}
                          isFeatured={isFeatured}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="text-navy group-hover:text-navy-light truncate text-sm font-bold tracking-tight transition-colors sm:text-[0.9375rem]">
                              {provider.name}
                            </p>
                            {isFeatured ? (
                              <span className="bg-navy text-white rounded-full px-2 py-0.5 text-[0.625rem] font-black tracking-wider uppercase shadow-2xs">
                                {t('featuredBadge')}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-1.5 flex items-center gap-1">
                            <span className="inline-flex items-center gap-1 rounded-md bg-azure/50 border border-navy/10 px-2 py-0.5 text-[11px] font-bold text-navy">
                              <BookOpen
                                className="size-3 text-navy/70 shrink-0"
                                aria-hidden="true"
                              />
                              <span>
                                {t('courseCount', { count: provider.count })}
                              </span>
                            </span>
                          </div>
                          {provider.description ? (
                            <p className="text-muted-foreground mt-2 line-clamp-2 text-xs leading-relaxed">
                              {provider.description}
                            </p>
                          ) : null}
                        </div>
                        <span className="bg-muted/60 text-muted-foreground flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 group-hover:bg-navy group-hover:text-white self-center shadow-2xs">
                          <ArrowRight
                            className="size-4 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </span>
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={pagination.setPage}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </DashboardPanel>
    </DashboardPage>
  );
}
