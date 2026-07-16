/*
 * Service-worker retirement shim.
 *
 * Gamblock-AI no longer installs a website service worker. Keeping this small,
 * uncached file at the legacy URL lets browsers update and unregister workers
 * installed by older Workbox/PWA builds.
 */

self.addEventListener('install', () => {
  void self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.registration.unregister());
});
