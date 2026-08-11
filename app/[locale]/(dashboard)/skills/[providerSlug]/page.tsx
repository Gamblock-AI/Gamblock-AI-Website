'use client';

import { use, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Clock3,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { DashboardPage } from '@/components/dashboard/dashboard-page';
import { Pagination } from '@/components/dashboard/pagination';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';
import { slugifyProvider } from '@/lib/skills/external-platforms';
import { resolveEducationMediaURL } from '@/components/education/media-url';
import { useLearningHub, type LearningItem } from '@/hooks/use-learning-hub';

const COURSES_PER_PAGE = 9;

const kindKeys: Record<LearningItem['kind'], string> = {
  course: 'kindCourse',
  certification: 'kindCertification',
  learning_path: 'kindPath',
  mini_project: 'kindProject',
  career_snapshot: 'kindCareer',
  toolkit: 'kindToolkit',
  opportunity: 'kindOpportunity',
};

function CourseCard({ item }: { item: LearningItem }) {
  const t = useTranslations('skillsHub');
  const thumbnail = item.thumbnail_url
    ? resolveEducationMediaURL(item.thumbnail_url)
    : '';
  return (
    <article className="border-border bg-card shadow-soft flex flex-col overflow-hidden rounded-2xl border">
      {thumbnail ? (
        <div className="border-border aspect-video w-full overflow-hidden border-b">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-muted-foreground text-xs font-bold tracking-[0.12em] uppercase">
          {t(kindKeys[item.kind])}
        </p>
        <h3 className="text-navy mt-2 text-base leading-6 font-bold">
          {item.title}
        </h3>
        <p className="text-muted-foreground mt-2 flex-1 text-sm leading-6">
          {item.summary}
        </p>
        <div className="text-muted-foreground mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {item.duration_minutes ? (
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3.5" />
              {item.duration_minutes} {t('minutes')}
            </span>
          ) : null}
          {item.cost ? (
            <span>
              {item.cost === 'free_or_audit'
                ? t('freeOrAudit')
                : item.cost === 'learning_free_exam_may_cost'
                  ? t('learningFreeExamMayCost')
                  : item.cost}
            </span>
          ) : null}
          {item.certificate ? (
            <span>
              {item.certificate === 'provider_dependent'
                ? t('providerDependent')
                : item.certificate}
            </span>
          ) : null}
        </div>
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer noopener"
            className="border-navy/15 text-navy hover:bg-navy/5 mt-4 inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold"
          >
            {t('openCourse')}
            <ExternalLink className="size-3.5" aria-hidden="true" />
            <span className="sr-only">{t('opensNewTab')}</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}

export default function ProviderDetailPage({
  params,
}: {
  params: Promise<{ providerSlug: string }>;
}) {
  const t = useTranslations('skillsHub');
  const locale = useLocale();
  const { providerSlug } = use(params);
  const hub = useLearningHub(locale);
  const [page, setPage] = useState(1);
  const [activeSlug, setActiveSlug] = useState(providerSlug);
  if (activeSlug !== providerSlug) {
    setActiveSlug(providerSlug);
    setPage(1);
  }

  const providerItems = useMemo(
    () =>
      (hub.catalog?.items ?? []).filter(
        (item) => item.provider && slugifyProvider(item.provider) === providerSlug
      ),
    [hub.catalog, providerSlug]
  );

  const provider = providerItems[0];
  const totalPages = Math.max(
    1,
    Math.ceil(providerItems.length / COURSES_PER_PAGE)
  );
  const safePage = Math.min(page, totalPages);
  const pagedItems = providerItems.slice(
    (safePage - 1) * COURSES_PER_PAGE,
    safePage * COURSES_PER_PAGE
  );

  return (
    <DashboardPage>
      <Link
        href={ROUTES.SKILLS}
        className="text-navy hover:text-navy/70 focus-visible:ring-navy/30 inline-flex min-h-9 items-center gap-1.5 rounded-lg text-sm font-semibold outline-none focus-visible:ring-2"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t('backToDirections')}
      </Link>

      <div className="border-border/80 bg-gradient-to-r from-card via-azure/15 to-card shadow-2xs mt-3 flex items-center gap-4 rounded-2xl border p-4 sm:p-5">
        {provider?.provider_logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveEducationMediaURL(provider.provider_logo_url)}
            alt=""
            className="bg-card flex size-12 shrink-0 items-center justify-center rounded-xl border border-border/80 object-contain p-1.5 shadow-2xs"
          />
        ) : (
          <span className="bg-gradient-to-br from-navy to-indigo-700 text-white flex size-12 shrink-0 items-center justify-center rounded-xl text-base font-black shadow-2xs">
            {provider?.provider?.slice(0, 2).toUpperCase() ?? '?'}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-navy text-lg font-black tracking-tight sm:text-xl">
              {provider?.provider ?? t('providerUnknown')}
            </h1>
            <span className="bg-navy/10 text-navy rounded-full px-2.5 py-0.5 text-xs font-bold">
              {t('courseCount', { count: providerItems.length })}
            </span>
          </div>
          {provider?.provider_description ? (
            <p className="text-muted-foreground mt-0.5 max-w-2xl text-xs leading-relaxed sm:text-sm line-clamp-2">
              {provider.provider_description}
            </p>
          ) : null}
        </div>
      </div>

      {hub.loading ? (
        <p
          className="text-muted-foreground flex items-center gap-2 text-sm"
          role="status"
        >
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {t('loading')}
        </p>
      ) : providerItems.length === 0 ? (
        <div className="border-border bg-muted/30 text-muted-foreground mt-6 rounded-2xl border p-6 text-center text-sm">
          {t('noCourses')}
        </div>
      ) : (
        <div className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pagedItems.map((item) => (
              <CourseCard key={item.id} item={item} />
            ))}
          </div>
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </DashboardPage>
  );
}
