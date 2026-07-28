'use client';

import { useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { FadeSwap } from '@/components/common/fade-swap';
import { GamiCard } from '@/components/dashboard/gami-card';
import { useDayOfYear } from '@/hooks/use-daily-rotation';
import { useRecoveryJourney } from '@/hooks/use-recovery-journey';
import { Link } from '@/i18n/routing';
import { dashboardGamiState } from '@/lib/recovery/gami-dialog';
import {
  getMissionSummarySnapshot,
  getServerMissionSummarySnapshot,
  subscribeMissionSummary,
} from '@/lib/recovery/experience-store';
import { getLocalDateString } from '@/lib/recovery/date';
import { GAMI_VARIANTS } from '@/lib/recovery/gami-dialog';
import { ROUTES } from '@/routes';

const SEEN_STORAGE_KEY = 'gamblock:dashboard-seen:v1';

// First-visit-of-day marker, resolved once per session on the client. SSR
// treats every render as "not first visit" so hydration stays silent; the
// marker is written immediately after the first client read.
const subscribeNever = () => () => {};
let cachedFirstVisit: boolean | null = null;
const getFirstVisitSnapshot = () => {
  if (cachedFirstVisit === null) {
    try {
      const today = getLocalDateString(new Date());
      cachedFirstVisit = window.localStorage.getItem(SEEN_STORAGE_KEY) !== today;
      window.localStorage.setItem(SEEN_STORAGE_KEY, today);
    } catch {
      cachedFirstVisit = false;
    }
  }
  return cachedFirstVisit;
};
const getFirstVisitServerSnapshot = () => false;

const STATE_POSES: Record<'celebrate' | 'gentle' | 'wave', string> = {
  celebrate: '/images/mascot/gami-celebrate.webp',
  gentle: '/images/mascot/gami-meditate.webp',
  wave: '/images/mascot/gami-wave.webp',
};

/**
 * Contextual Gami companion under the dashboard greeting. Reacts to state the
 * client already holds (mission summary store, today's local check-in, the
 * first visit of the day) — deterministic, no extra fetch, renders nothing
 * when there is nothing meaningful to say.
 */
export function GamiCompanion() {
  const t = useTranslations('gamiDialog');
  const dayIndex = useDayOfYear();
  const journey = useRecoveryJourney();
  const missionSummary = useSyncExternalStore(
    subscribeMissionSummary,
    getMissionSummarySnapshot,
    getServerMissionSummarySnapshot
  );
  const firstVisitToday = useSyncExternalStore(
    subscribeNever,
    getFirstVisitSnapshot,
    getFirstVisitServerSnapshot
  );

  const state = dashboardGamiState({
    missionsResolved: missionSummary?.resolved ?? 0,
    missionsTotal: missionSummary?.total ?? 0,
    todayMood: journey.todayCheckIn?.mood ?? null,
    firstVisitToday,
  });

  if (state === null) return null;

  const variant = (dayIndex % GAMI_VARIANTS) + 1;
  return (
    <FadeSwap swapKey={state}>
      <GamiCard
        image={STATE_POSES[state]}
        message={t(`dashboard${capitalize(state)}${variant}`)}
        action={
          state === 'gentle' ? (
            <Link
              href={ROUTES.RECOVERY}
              className="border-navy/20 text-navy hover:bg-azure/45 focus-visible:ring-navy/30 inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-bold transition-colors outline-none focus-visible:ring-2"
            >
              {t('dashboardPracticeChip')}
            </Link>
          ) : undefined
        }
      />
    </FadeSwap>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
