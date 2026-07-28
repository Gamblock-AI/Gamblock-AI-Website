'use client';

import { CalendarHeart, ChevronDown, type LucideIcon } from 'lucide-react';
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
  const earned = badges.filter((badge) => badge.achieved);
  const locked = badges.filter((badge) => !badge.achieved);
  const earnedCount = earned.length;

  return (
    <section className="border-navy/15 bg-azure/35 rounded-2xl border p-4 sm:p-5">
      <p className="text-navy-light text-xs font-bold tracking-[0.14em] uppercase">
        {p('badgesEyebrow')}
      </p>
      <h2 className="text-navy mt-1 text-xl font-bold">{p('badgesTitle')}</h2>
      <p className="text-muted-foreground mt-1 text-sm leading-6">
        {p('badgesBody')}
      </p>

      <div className="border-navy/15 bg-card/70 mt-3 flex items-start gap-2.5 rounded-xl border p-3">
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
        <p className="text-muted-foreground mt-4 text-sm">
          {p('badgesUnavailable')}
        </p>
      ) : (
        <>
          {earned.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {earned.map(({ id, icon }) => (
                <BadgeRow
                  key={id}
                  icon={icon}
                  achieved
                  name={p(`badges.${id}.name`)}
                  criteria={p(`badges.${id}.criteria`)}
                />
              ))}
            </ul>
          ) : null}
          {locked.length > 0 ? (
            <details className="group mt-3" open={earned.length === 0}>
              <summary className="text-navy/80 hover:text-navy focus-visible:ring-navy/30 flex min-h-10 cursor-pointer list-none items-center justify-between rounded-xl text-xs font-bold outline-none focus-visible:ring-2 [&::-webkit-details-marker]:hidden">
                <span>{p('badgesUpNext', { count: locked.length })}</span>
                <ChevronDown
                  className="text-muted-foreground size-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </summary>
              <ul className="mt-2 space-y-1.5">
                {locked.map(({ id, icon }) => (
                  <BadgeRow
                    key={id}
                    icon={icon}
                    achieved={false}
                    name={p(`badges.${id}.name`)}
                    criteria={p(`badges.${id}.criteria`)}
                  />
                ))}
              </ul>
            </details>
          ) : null}
          <p className="text-navy mt-3 text-sm font-semibold">
            {p('badgesCount', { earned: earnedCount, total: badges.length })}
          </p>
        </>
      )}
    </section>
  );
}

function BadgeRow({
  icon: Icon,
  achieved,
  name,
  criteria,
}: {
  icon: LucideIcon;
  achieved: boolean;
  name: string;
  criteria: string;
}) {
  return (
    <li
      className={cn(
        'flex items-start gap-2.5 rounded-lg border p-2',
        achieved
          ? 'border-sage/30 bg-card shadow-sm'
          : 'border-border bg-card/50 border-dashed'
      )}
    >
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg border',
          achieved
            ? 'border-sage/30 bg-sage/10 text-sage'
            : 'border-border text-muted-foreground/40 border-dashed'
        )}
        aria-hidden="true"
      >
        <Icon className="size-4" strokeWidth={1.7} />
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            'text-xs leading-5 font-bold',
            achieved ? 'text-navy' : 'text-muted-foreground'
          )}
        >
          {name}
        </p>
        <p className="text-muted-foreground mt-0.5 text-[11px] leading-4">
          {criteria}
        </p>
      </div>
    </li>
  );
}
