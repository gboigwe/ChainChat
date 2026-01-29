/**
 * Service Worker Registration
 * Register and manage service worker lifecycle
 */

import { SERVICE_WORKER_CONFIG } from '../config/pwaConfig';

export function register(onSuccess?: () => void, onUpdate?: () => void): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const { swUrl, scope } = SERVICE_WORKER_CONFIG;

      navigator.serviceWorker
        .register(swUrl, { scope })
        .then((registration) => {
          console.log('Service Worker registered:', registration);

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;

            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New content available');
                  onUpdate?.();
                }
              });
            }
          });

          if (onSuccess) {
            onSuccess();
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}

export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('Service Worker unregistration failed:', error);
      });
  }
}

export async function update(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
  }
}

export function getRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.getRegistration();
  }
  return Promise.resolve(undefined);
}

export default { register, unregister, update, getRegistration };
