'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useDashboardTour } from '@/hooks/use-dashboard-tour';
import { useAuthoritativeUser } from '@/hooks/use-local-user';
import {
  DASHBOARD_TOUR_KEY,
  getDashboardTourSeen,
} from '@/lib/recovery/tour-storage';
import { desktopTourSteps, mobileTourSteps } from './tour-config';
import { TourBubble } from './tour-bubble';

/** How long to wait after mounting so the dashboard shell settles before starting. */
const START_DELAY_MS = 300;
/** Keep waiting for a blocking modal (e.g., the daily check-in gate) before giving up. */
const MODAL_WAIT_MS = 60 * 1000;

/**
 * First-time guided tour for the student dashboard. Highlights the dashboard
 * content, each sidebar section, and each navbar control. Appears once, is
 * skippable, and is student-role only.
 */
export function DashboardTour({ onSettled }: { onSettled: () => void }) {
  const t = useTranslations('dashboardTour');
  const { user, status } = useAuthoritativeUser();
  const ready = status === 'ready';
  const role = user?.role;
  const tour = useDashboardTour({
    desktop: desktopTourSteps,
    mobile: mobileTourSteps,
    storageKey: DASHBOARD_TOUR_KEY,
  });
  const { close, open, start } = tour;
  const settledRef = useRef(false);

  const settle = useCallback(() => {
    if (settledRef.current) return;
    settledRef.current = true;
    onSettled();
  }, [onSettled]);

  const finishTour = useCallback(() => {
    close();
    settle();
  }, [close, settle]);

  // Let the dashboard experience queue continue immediately when this tour
  // was already completed on an earlier visit.
  useEffect(() => {
    if (!ready || role !== 'user' || open || !getDashboardTourSeen()) return;
    settle();
  }, [open, ready, role, settle]);

  // The gate mounts this component only after the first-run "Niat Perubahan"
  // modal is resolved/closed, so no modal can be blocking here. The seen flag
  // is re-read from storage on every run: `start()` persists it before the
  // tour opens, so a close triggered re-run must never restart it.
  useEffect(() => {
    if (!ready || role !== 'user' || open || getDashboardTourSeen()) return;
    let cancelled = false;
    let started = false;
    let modalWaitTimer = 0;

    const tryStart = () => {
      if (cancelled || started) return;
      if (!document.querySelector('[data-tour="tour-welcome"]')) {
        modalWaitTimer = window.setTimeout(tryStart, START_DELAY_MS);
        return;
      }
      if (document.querySelector('[role="dialog"]')) {
        // Wait for a blocking modal (daily check-in gate) to close before
        // starting, so the tour never stacks over it.
        modalWaitTimer = window.setTimeout(tryStart, START_DELAY_MS);
        return;
      }
      started = true;
      start();
    };

    const delayTimer = window.setTimeout(tryStart, START_DELAY_MS);
    const deadlineTimer = window.setTimeout(() => {
      if (!started && !cancelled && !document.querySelector('[role="dialog"]')) {
        started = true;
        start();
      }
    }, MODAL_WAIT_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(delayTimer);
      window.clearTimeout(deadlineTimer);
      window.clearTimeout(modalWaitTimer);
    };
  }, [ready, role, open, start]);

  return (
    <TourBubble
      t={t}
      open={tour.open}
      index={tour.index}
      total={tour.total}
      step={tour.step}
      rect={tour.rect}
      next={tour.next}
      back={tour.back}
      close={finishTour}
    />
  );
}
