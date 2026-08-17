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

    if (process.env.NODE_ENV !== 'production') {
      // In development, unregister any active service workers and clear stale caches
      // to prevent Turbopack HMR chunk factory errors.
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          void registration.unregister();
        }
      });
      if ('caches' in window) {
        void caches.keys().then((keys) => {
          for (const key of keys) {
            void caches.delete(key);
          }
        });
      }
      return;
    }

    const registrationPromise = navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    registrationPromise.catch(() => {
      // Production service worker registration failure is handled silently.
    });
  }, []);

  return null;
}
