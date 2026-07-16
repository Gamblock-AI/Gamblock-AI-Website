'use client';

import { useEffect } from 'react';

import { reportDevelopmentError } from '@/lib/diagnostics';

const LEGACY_WORKER_PATH = '/sw.js';
const RELOAD_GUARD_KEY = 'gamblock:legacy-service-worker-reload:v1';

function isLegacyWorker(scriptUrl: string | undefined): boolean {
  if (!scriptUrl) return false;

  try {
    const url = new URL(scriptUrl);
    return (
      url.origin === window.location.origin &&
      url.pathname === LEGACY_WORKER_PATH
    );
  } catch {
    return false;
  }
}

/**
 * Retire the root-scoped Workbox worker shipped by an older website build.
 * The current website is not a PWA, so leaving it registered can make a stale
 * navigation strategy reject otherwise healthy pages with `no-response`.
 */
export function LegacyServiceWorkerCleanup() {
  useEffect(() => {
    let cancelled = false;

    async function unregisterLegacyWorker() {
      if (!('serviceWorker' in navigator)) return;

      const registrations = await navigator.serviceWorker.getRegistrations();
      const legacyRegistrations = registrations.filter((registration) => {
        const workers = [
          registration.installing,
          registration.waiting,
          registration.active,
        ];

        return workers.some((worker) => isLegacyWorker(worker?.scriptURL));
      });

      if (legacyRegistrations.length === 0) {
        sessionStorage.removeItem(RELOAD_GUARD_KEY);
        return;
      }

      const pageIsControlledByLegacyWorker = isLegacyWorker(
        navigator.serviceWorker.controller?.scriptURL
      );
      const results = await Promise.all(
        legacyRegistrations.map((registration) => registration.unregister())
      );

      if (
        cancelled ||
        !pageIsControlledByLegacyWorker ||
        !results.some(Boolean) ||
        sessionStorage.getItem(RELOAD_GUARD_KEY)
      ) {
        return;
      }

      // Unregistering affects the next navigation. Reload once so the current
      // tab is immediately released from the retired worker as well.
      sessionStorage.setItem(RELOAD_GUARD_KEY, '1');
      window.location.reload();
    }

    void unregisterLegacyWorker().catch((error: unknown) => {
      reportDevelopmentError('legacy service worker cleanup failed', error);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
