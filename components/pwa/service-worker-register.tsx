'use client';

import { useEffect } from 'react';

/**
 * Registers the Gamblock-AI service worker (app-shell caching + Web Push).
 * Replaces the old worker-retirement shim; the PWA is now a real installable
 * surface with an opt-in daily reminder delivered through server push.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const registrationPromise = navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    registrationPromise.catch((error) => {
      if (process.env.NODE_ENV !== 'production') {
        // Expected when the app is served from an incompatible context; the
        // rest of the site keeps working without a service worker.
        console.debug('Service worker registration failed', error);
      }
    });
  }, []);

  return null;
}
