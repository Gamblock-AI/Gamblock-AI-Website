'use client';

import { CalendarHeart } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSyncExternalStore } from 'react';
import { useExperienceProgress } from '@/hooks/use-experience-progress';
import { useEducationModules } from '@/hooks/use-education';
import { useProgressSnapshot } from '@/hooks/use-progress-snapshot';
import { useRecoveryPractices } from '@/hooks/use-recovery-experience';
import { buildJourneyBadges } from '@/lib/recovery/badges';
import { getLocalDateString } from '@/lib/recovery/date';
import { cn } from '@/lib/utils';

const DAY_MS = 86_400_000;

// Last-7 local (Jakarta) date keys, computed once per session on the client;
// empty during SSR so hydration stays deterministic.
const subscribeNever = () => () => {};
const EMPTY_KEYS: readonly string[] = [];
let cachedRecentKeys: readonly string[] | null = null;
const getRecentDateKeys = (): readonly string[] => {
  cachedRecentKeys ??= Array.from({ length: 7 }, (_, index) =>
    getLocalDateString(new Date(Date.now() - index * DAY_MS))
  );
  return cachedRecentKeys;
};
const getRecentDateKeysServer = () => EMPTY_KEYS;

/**
 * Journey badges + presence rhythm. Uses its own fixed 90-day snapshot so
 * badge state never shifts with the page's range toggle. Every criterion is
 * always visible (no mystery boxes) and nothing can be lost once earned.
 */
export function JourneyBadges() {
  const p = useTranslations('progressExperience');
  const locale = useLocale();
  const snapshot = useProgressSnapshot(90);
  const practices = useRecoveryPractices();
  const education = useEducationModules(locale);
  const experience = useExperienceProgress();

  const data = snapshot.data;
  const activityByDate = new Map(
    (data?.activity_days ?? []).map((day) => [day.date, day])
  );

  const countDays = (
    selector: (day: NonNullable<typeof data>['activity_days'][number]) => number
  ) =>
    (data?.activity_days ?? []).filter((day) => selector(day) > 0).length;

  const recentKeys = useSyncExternalStore(
    subscribeNever,
    getRecentDateKeys,
    getRecentDateKeysServer
  );
  const rhythmCount = recentKeys.filter((key) => {
    const day = activityByDate.get(key);
    if (!day) return false;
    return (
      day.check_ins +
        day.practices +
        day.journals +
        day.missions +
        day.education +
        day.reviews >
      0
    );
  }).length;

  const badges = buildJourneyBadges({
    checkInCount: data?.check_in_count ?? 0,
    activeDays: data?.active_days ?? 0,
    reflections: data?.reflections ?? 0,
    missionDays: countDays((day) => day.missions),
    reviewDays: countDays((day) => day.reviews),
    educationDays: countDays((day) => day.education),
    practiceKinds: new Set(
      (practices.data ?? []).map((session) => session.practice_kind)
    ),
    practiceCount: practices.data?.length ?? 0,
    modulesStarted: education.modules.filter(
      (module) => module.progress.progress_percent > 0
    ).length,
    modulesCompleted: education.modules.filter(
      (module) => module.progress.progress_percent >= 100
    ).length,
    level: experience?.level ?? 0,
  });
  const earnedCount = badges.filter((badge) => badge.achieved).length;

  return (
    <section className="border-border rounded-[2rem] border bg-[linear-gradient(150deg,rgba(37,196,232,0.12),rgba(114,184,154,0.08))] p-5 sm:p-6">
      <p className="text-navy-light text-xs font-bold tracking-[0.14em] uppercase">
        {p('badgesEyebrow')}
      </p>
      <h2 className="text-navy mt-2 text-xl font-bold">{p('badgesTitle')}</h2>
      <p className="text-muted-foreground mt-2 text-sm leading-6">
        {p('badgesBody')}
      </p>

      <div className="border-navy/15 bg-card/70 mt-4 flex items-start gap-2.5 rounded-xl border p-3">
        <CalendarHeart
          className="text-navy-light mt-0.5 size-4 shrink-0"
          aria-hidden="true"
        />
        <div>
          <p className="text-navy text-sm font-bold">
            {p('rhythmLine', { count: rhythmCount })}
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs leading-5">
            {p('rhythmHint')}
          </p>
        </div>
      </div>

      {snapshot.error && !data ? (
        <p className="text-muted-foreground mt-5 text-sm">
          {p('badgesUnavailable')}
        </p>
      ) : (
        <>
          <ul className="mt-5 space-y-2">
            {badges.map(({ id, icon: Icon, achieved }) => (
              <li
                key={id}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-2.5',
                  achieved
                    ? 'border-sage/30 bg-card shadow-sm'
                    : 'border-border bg-card/50 border-dashed'
                )}
              >
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg border',
                    achieved
                      ? 'border-sage/30 bg-sage/10 text-sage'
                      : 'border-border text-muted-foreground/40 border-dashed'
                  )}
                  aria-hidden="true"
                >
                  <Icon className="size-4.5" strokeWidth={1.7} />
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-sm font-bold',
                      achieved ? 'text-navy' : 'text-muted-foreground'
                    )}
                  >
                    {p(`badges.${id}.name`)}
                    {!achieved ? (
                      <span className="text-muted-foreground/80 ml-2 text-xs font-semibold">
                        {p('badgesLocked')}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-5">
                    {p(`badges.${id}.criteria`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-navy mt-5 text-sm font-semibold">
            {p('badgesCount', { earned: earnedCount, total: badges.length })}
          </p>
        </>
      )}
    </section>
  );
}
