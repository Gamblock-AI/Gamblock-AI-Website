'use client';

import { useCallback } from 'react';
import { config } from '@/lib/config';
import { apiClient } from '@/lib/api-client';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }
  return outputArray;
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  const existing = await navigator.serviceWorker.getRegistration('/sw.js');
  if (existing) return existing;
  return navigator.serviceWorker.register('/sw.js', { scope: '/' });
}

/**
 * Owns the browser Web Push lifecycle for the opt-in daily reminder. The
 * subscription endpoint is delivery metadata only; no browsing data is sent.
 */
export function usePushNotifications() {
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!config.vapidPublicKey) return false;
    if (!('Notification' in window) || !('PushManager' in window)) return false;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const registration = await getServiceWorkerRegistration();
    if (!registration) return false;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(config.vapidPublicKey),
      });
    }

    await apiClient('/me/push-subscription', {
      method: 'POST',
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        p256dh: subscription.getKey('p256dh')
          ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!)))
          : '',
        auth_key: subscription.getKey('auth')
          ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
          : '',
        user_agent: navigator.userAgent,
      }),
    });
    return true;
  }, []);

  const unsubscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    const subscription = registration
      ? await registration.pushManager.getSubscription()
      : null;
    if (!subscription) return;

    const endpoint = subscription.endpoint;
    await subscription.unsubscribe().catch(() => undefined);
    try {
      await apiClient('/me/push-subscription', {
        method: 'DELETE',
        body: JSON.stringify({ endpoint }),
      });
    } catch {
      // Server-side removal is best-effort; the browser already unsubscribed.
    }
  }, []);

  return { subscribe, unsubscribe };
}
