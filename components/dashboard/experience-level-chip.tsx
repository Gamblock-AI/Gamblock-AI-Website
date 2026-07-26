'use client';

import { Trophy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useExperienceProgress } from '@/hooks/use-experience-progress';
import { useLocalUser } from '@/hooks/use-local-user';
import { Link } from '@/i18n/routing';
import { getLevelTitleKey } from '@/lib/recovery/level-titles';
import { ROUTES } from '@/routes';

/**
 * Compact journey-level chip for the student navbar. Purely subscription
 * based: it renders nothing until the shared experience store is filled by a
 * `/missions/today` response, and updates instantly after claims.
 */
export function ExperienceLevelChip() {
  const t = useTranslations('recoveryDashboard');
  const user = useLocalUser();
  const experience = useExperienceProgress();

  if (user.role !== 'user' || !experience) return null;

  const title = t(getLevelTitleKey(experience.level));

  return (
    <Link
      href={ROUTES.PROGRESS}
      aria-label={t('levelChipAria', { count: experience.level, title })}
      className="border-border bg-card text-navy hover:border-navy/25 hover:bg-azure/45 focus-visible:ring-navy/35 flex min-h-11 items-center gap-2 rounded-xl border px-2 text-sm font-semibold transition-[background-color,border-color] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none"
    >
      <span
        key={experience.level}
        className="animate-in fade-in zoom-in-95 flex items-center gap-2 duration-500 motion-reduce:animate-none"
      >
        <span
          className="bg-navy flex size-6 items-center justify-center rounded-md"
          aria-hidden="true"
        >
          <Trophy className="text-amber size-3.5" />
        </span>
        <span className="text-xs font-extrabold">
          Lv {experience.level}
          <span className="text-navy/70 hidden font-bold sm:inline">
            {' · '}
            {title}
          </span>
        </span>
      </span>
    </Link>
  );
}
