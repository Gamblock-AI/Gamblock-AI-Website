'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useDashboardTour } from '@/hooks/use-dashboard-tour';
import { useAuthoritativeUser } from '@/hooks/use-local-user';
import {
  getAdminTourSeen,
  ADMIN_TOUR_KEY,
} from '@/lib/recovery/tour-storage';
import { adminDesktopTourSteps, adminMobileTourSteps } from './tour-config';
import { TourBubble } from './tour-bubble';

/** How long to wait after mounting so the dashboard shell settles before starting. */
const START_DELAY_MS = 300;
/** Keep waiting for a blocking modal (e.g., the re-auth dialog) before giving up. */
const MODAL_WAIT_MS = 60 * 1000;

/**
 * First-time guided tour for the admin dashboard. Highlights the attention
 * queue, workspace grid, platform analytics, the sidebar operational group,
 * and the shared shell controls. Appears once, is skippable, and is
 * admin-role only.
 */
export function AdminTour() {
  const t = useTranslations('adminTour');
  const { user, status } = useAuthoritativeUser();
  const ready = status === 'ready';
  const role = user?.role;
  const tour = useDashboardTour({
    desktop: adminDesktopTourSteps,
    mobile: adminMobileTourSteps,
    storageKey: ADMIN_TOUR_KEY,
  });
  const { open, start } = tour;

  useEffect(() => {
    if (!ready || role !== 'admin' || open || getAdminTourSeen()) return;
    let cancelled = false;
    let started = false;
    let modalWaitTimer = 0;

    const tryStart = () => {
      if (cancelled || started) return;
      if (!document.querySelector('[data-tour="tour-admin-welcome"]')) {
        modalWaitTimer = window.setTimeout(tryStart, START_DELAY_MS);
        return;
      }
      if (document.querySelector('[role="dialog"]')) {
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
      close={tour.close}
    />
  );
}
