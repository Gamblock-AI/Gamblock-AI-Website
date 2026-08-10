'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  desktopTourSteps,
  mobileTourSteps,
  type TourStep,
} from '@/components/dashboard/tour/tour-config';
import {
  DASHBOARD_TOUR_KEY,
  setTourSeen,
} from '@/lib/recovery/tour-storage';

export interface TourRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface TourConfig {
  desktop: TourStep[];
  mobile: TourStep[];
  storageKey: string;
}

/**
 * State machine for a first-time guided tour (student or partner dashboard).
 * Owns the step list (desktop vs mobile), the current index, and the measured
 * bounding rect of the highlighted element so the spotlight and bubble stay
 * glued to it while scrolling or resizing.
 */
export function useDashboardTour(config?: TourConfig) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [rect, setRect] = useState<TourRect | null>(null);

  const steps = isMobile
    ? (config?.mobile ?? mobileTourSteps)
    : (config?.desktop ?? desktopTourSteps);
  // Clamp on render so a breakpoint switch never points past the current list.
  const safeIndex = Math.min(index, steps.length - 1);
  const step = steps[safeIndex];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const query = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsMobile(!query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const measureRect = useCallback((targetStep: TourStep): TourRect | null => {
    const element = document.querySelector<HTMLElement>(
      `[data-tour="${targetStep.target}"]`
    );
    if (!element) return null;
    const bounds = element.getBoundingClientRect();
    if (bounds.width === 0 && bounds.height === 0) return null;
    return {
      top: bounds.top,
      left: bounds.left,
      width: bounds.width,
      height: bounds.height,
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const target = step.target;
    let cancelled = false;

    const reveal = () => {
      const element = document.querySelector<HTMLElement>(
        `[data-tour="${target}"]`
      );
      element?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    };
    const frame = window.requestAnimationFrame(reveal);
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      setRect(measureRect(step));
    }, 80);

    const onViewportChange = () => {
      if (!cancelled) setRect(measureRect(step));
    };

    window.addEventListener('resize', onViewportChange);
    document.addEventListener('scroll', onViewportChange, true);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener('resize', onViewportChange);
      document.removeEventListener('scroll', onViewportChange, true);
    };
  }, [open, safeIndex, step, measureRect]);

  const start = useCallback(() => {
    setIndex(0);
    setOpen(true);
    setTourSeen(config?.storageKey ?? DASHBOARD_TOUR_KEY);
  }, [config?.storageKey]);

  const next = useCallback(() => {
    setIndex((current) => Math.min(current + 1, steps.length - 1));
  }, [steps.length]);

  const back = useCallback(() => {
    setIndex((current) => Math.max(current - 1, 0));
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setRect(null);
  }, []);

  return useMemo(
    () => ({
      open,
      index: safeIndex,
      total: steps.length,
      step,
      rect,
      isMobile,
      start,
      next,
      back,
      close,
    }),
    [
      open,
      safeIndex,
      steps.length,
      step,
      rect,
      isMobile,
      start,
      next,
      back,
      close,
    ]
  );
}
