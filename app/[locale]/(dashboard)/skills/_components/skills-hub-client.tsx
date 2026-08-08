'use client';

import { ArrowRight, BookOpen, GraduationCap, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  DashboardPage,
  DashboardPageHeader,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { slugifyProvider } from '@/lib/skills/external-platforms';
import { resolveEducationMediaURL } from '@/components/education/media-url';
import { useLearningHub } from '@/hooks/use-learning-hub';

interface LearningProvider {
  slug: string;
  name: string;
  logoUrl?: string;
  count: number;
}

function ProviderLogo({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl?: string;
}) {
  const source = logoUrl ? resolveEducationMediaURL(logoUrl) : '';
  if (source) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={source}
        alt=""
        loading="lazy"
        className="bg-muted flex size-14 shrink-0 items-center justify-center rounded-xl border border-navy/10 object-contain p-1.5"
      />
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
    <span className="bg-navy text-white flex size-14 shrink-0 items-center justify-center rounded-xl text-base font-extrabold">
      {initials}
    </span>
  );
}

export function SkillsHubClient() {
  const t = useTranslations('skillsHub');
  const locale = useLocale();
  const hub = useLearningHub(locale);

  const providers: LearningProvider[] = (() => {
    if (!hub.catalog) return [];
    const bySlug = new Map<string, LearningProvider>();
    for (const item of hub.catalog.items) {
      if (!item.provider) continue;
      const slug = slugifyProvider(item.provider);
      const existing = bySlug.get(slug);
      if (existing) {
        existing.count += 1;
        if (!existing.logoUrl && item.provider_logo_url) {
          existing.logoUrl = item.provider_logo_url;
        }
      } else {
        bySlug.set(slug, {
          slug,
          name: item.provider,
          logoUrl: item.provider_logo_url,
          count: 1,
        });
      }
    }
    return Array.from(bySlug.values()).sort(
      (left, right) => right.count - left.count
    );
  })();

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={GraduationCap}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <section
        className="border-border bg-card shadow-soft rounded-2xl border p-5 sm:p-6"
        aria-labelledby="learning-hub-providers-title"
      >
        <div className="flex items-start gap-3">
          <span className="bg-navy flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm">
            <BookOpen className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="learning-hub-providers-title"
              className="text-navy text-lg font-bold"
            >
              {t('selectorTitle')}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              {t('selectorDescription')}
            </p>
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
        ) : hub.error ? (
          <div className="border-amber/40 bg-amber/10 mt-5 rounded-xl border p-4 text-sm">
            {t('error')}{' '}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => void hub.refetch()}
            >
              {t('retry')}
            </Button>
          </div>
        ) : providers.length === 0 ? (
          <p className="text-muted-foreground mt-5 rounded-2xl border border-dashed p-6 text-center text-sm">
            {t('noProviders')}
          </p>
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <Link
                key={provider.slug}
                href={`/skills/${provider.slug}`}
                className="border-border bg-card text-foreground hover:border-navy/30 hover:bg-azure/40 focus-visible:ring-navy/30 group flex items-center gap-4 rounded-2xl border p-4 transition-colors outline-none focus-visible:ring-2"
              >
                <ProviderLogo name={provider.name} logoUrl={provider.logoUrl} />
                <div className="min-w-0 flex-1">
                  <p className="text-navy font-bold">{provider.name}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {t('courseCount', { count: provider.count })}
                  </p>
                </div>
                <ArrowRight
                  className="text-navy/50 group-hover:text-navy size-4 shrink-0 transition-colors"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        )}
      </section>
    </DashboardPage>
  );
}
