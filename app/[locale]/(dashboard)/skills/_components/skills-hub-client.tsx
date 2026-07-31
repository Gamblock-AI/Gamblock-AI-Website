'use client';

import { ExternalLink, GraduationCap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { EXTERNAL_SKILL_PLATFORMS } from '@/lib/skills/external-platforms';
import { SkillsSection } from './skills-section';

/**
 * Skills hub — internal short practices plus curated quick access to free
 * external courses and certifications (supporting feature around the
 * PKM-WEB-006 skill recommendations).
 */
export function SkillsHubClient() {
  const t = useTranslations('skillsHub');

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={GraduationCap}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <SkillsSection />

      <section aria-labelledby="skills-courses-title">
        <div>
          <h2
            id="skills-courses-title"
            className="text-navy text-2xl font-bold tracking-tight"
          >
            {t('coursesTitle')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {t('coursesDescription')}
          </p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {EXTERNAL_SKILL_PLATFORMS.map((platform) => (
            <a
              key={platform.id}
              href={platform.url}
              target="_blank"
              rel="noreferrer noopener"
              className="border-border bg-card shadow-soft hover:border-navy/30 hover:shadow-card focus-visible:ring-navy/30 group flex min-h-11 flex-col rounded-2xl border p-4 transition-[border-color,box-shadow] outline-none focus-visible:ring-2 motion-reduce:transition-none"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-navy text-sm font-bold sm:text-base">
                  {platform.name}
                </h3>
                <DashboardStatus tone="navy">{t('freeBadge')}</DashboardStatus>
              </div>
              <p className="text-muted-foreground mt-1.5 flex-1 text-xs leading-5 sm:text-sm">
                {t(platform.descriptionKey)}
              </p>
              <span className="text-navy group-hover:text-navy-light mt-3 inline-flex items-center gap-1 text-xs font-semibold">
                {t('openPlatform')}
                <ExternalLink className="size-3.5" aria-hidden="true" />
                <span className="sr-only">{t('opensNewTab')}</span>
              </span>
            </a>
          ))}
        </div>
      </section>
    </DashboardPage>
  );
}
