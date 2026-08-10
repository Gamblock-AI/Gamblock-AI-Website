'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDashboardTour } from '@/hooks/use-dashboard-tour';
import { useAuthoritativeUser } from '@/hooks/use-local-user';
import { getDashboardTourSeen } from '@/lib/recovery/tour-storage';

const SPOTLIGHT_RADIUS = 14;

/** How long to wait after mounting so the dashboard shell settles before starting. */
const START_DELAY_MS = 300;
/** Keep waiting for a blocking modal (e.g., the daily check-in gate) before giving up. */
const MODAL_WAIT_MS = 60 * 1000;

interface BubblePosition {
  top: number;
  left: number;
}

/**
 * First-time guided tour for the student dashboard. Highlights the dashboard
 * content, each sidebar section, and each navbar control. Appears once, is
 * skippable, and is student-role only.
 */
export function DashboardTour() {
  const t = useTranslations('dashboardTour');
  const { user, status } = useAuthoritativeUser();
  const ready = status === 'ready';
  const role = user?.role;
  const { open, index, total, step, rect, start, next, back, close } =
    useDashboardTour();
  const [bubblePosition, setBubblePosition] =
    useState<BubblePosition | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Only students, after the shell is ready, once, and never over an open
  // modal. The gate mounts this component only after the first-run "Niat
  // Perubahan" modal is resolved/closed, so no modal can be blocking here.
  // The seen flag is re-read from storage on every run: `start()` persists it
  // before the tour opens, so a close triggered re-run must never restart it.
  useEffect(() => {
    if (!ready || role !== 'user' || open || getDashboardTourSeen()) return;
    let cancelled = false;
    let started = false;
    let modalWaitTimer = 0;

    const tryStart = () => {
      if (cancelled || started) return;
      if (!document.querySelector('[data-tour="tour-welcome"]')) return;
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

  // Keep the bubble inside the viewport, preferring to sit below the target.
  useLayoutEffect(() => {
    if (!open || !rect || !bubbleRef.current) {
      setBubblePosition(null);
      return;
    }
    const bubbleWidth = bubbleRef.current.offsetWidth;
    const bubbleHeight = bubbleRef.current.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = rect.top + rect.height + 12;
    if (top + bubbleHeight > viewportHeight - 16) {
      top = Math.max(rect.top - bubbleHeight - 12, 16);
    }
    let left = rect.left + rect.width / 2 - bubbleWidth / 2;
    left = Math.min(Math.max(left, 16), viewportWidth - bubbleWidth - 16);
    setBubblePosition({ top, left });
  }, [open, rect, index]);

  // Escape skips the tour; keep focus on the bubble while it is open.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab' || !bubbleRef.current) return;
      const focusables = Array.from(
        bubbleRef.current.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute('disabled'));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  const focusBubble = useCallback(() => {
    bubbleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (open) {
      const frame = requestAnimationFrame(() => focusBubble());
      return () => cancelAnimationFrame(frame);
    }
  }, [open, index, focusBubble]);

  if (!open || !step || !rect) return null;

  const isLastStep = index === total - 1;

  return (
    <div
      className="fixed inset-0 z-[70]"
      role="dialog"
      aria-modal="true"
      aria-label={t('tourLabel')}
    >
      {/* Interaction blocker covering the whole viewport. */}
      <div className="absolute inset-0" aria-hidden="true" />

      {/* Spotlight: transparent rectangle over the target + dimmed ring. */}
      <div
        className="pointer-events-none absolute rounded-2xl transition-all duration-300"
        style={{
          top: rect.top - SPOTLIGHT_RADIUS,
          left: rect.left - SPOTLIGHT_RADIUS,
          width: rect.width + SPOTLIGHT_RADIUS * 2,
          height: rect.height + SPOTLIGHT_RADIUS * 2,
          boxShadow: '0 0 0 9999px rgba(10, 20, 40, 0.55)',
        }}
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          ref={bubbleRef}
          tabIndex={-1}
          role="group"
          aria-label={t(step.titleKey)}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed z-[80] w-[min(92vw,22rem)] rounded-2xl border border-navy/10 bg-white p-5 shadow-2xl outline-none"
          style={{
            top: bubblePosition?.top,
            left: bubblePosition?.left,
            visibility: bubblePosition ? 'visible' : 'hidden',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-navy text-base font-bold">{t(step.titleKey)}</p>
            <button
              type="button"
              onClick={close}
              aria-label={t('skip')}
              className="text-muted-foreground hover:text-navy hover:bg-muted focus-visible:ring-navy/30 -mr-1 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg outline-none focus-visible:ring-2"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {t(step.bodyKey)}
          </p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-muted-foreground text-xs font-semibold">
              {t('stepOf', { current: index + 1, total })}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={close}
                className="text-muted-foreground"
              >
                {t('skip')}
              </Button>
              {index > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={back}
                  aria-label={t('back')}
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                  {t('back')}
                </Button>
              ) : null}
              <Button size="sm" onClick={isLastStep ? close : next}>
                {isLastStep ? t('done') : t('next')}
                {!isLastStep ? (
                  <ChevronRight className="size-4" aria-hidden="true" />
                ) : null}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
