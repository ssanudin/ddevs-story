import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { API_ORIGIN } from './config';

precacheAndRoute(self.__WB_MANIFEST);

// Runtime caching

// Avatar icons from UI Avatars: Uses CacheFirst because the data does not change often and ensures stored data only with status code 0 to 200.
registerRoute(
  ({ url }) => {
    return url.origin === 'https://ui-avatars.com';
  },
  new CacheFirst({
    cacheName: 'avatars-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 1 * 24 * 60 * 60,
      }),
    ],
  })
);

// JSON from API: Uses NetworkFirst so users always get the latest data.
registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(API_ORIGIN);
    return (
      request.method === 'GET' && baseUrl.origin === url.origin && request.destination !== 'image'
    );
  },
  new NetworkFirst({
    cacheName: 'story-api',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 1 * 24 * 60 * 60,
      }),
    ],
  })
);

// Images from API: Uses StaleWhileRevalidate to prioritize cache and ensure data stays up-to-date.
registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(API_ORIGIN);
    return (
      request.method === 'GET' && baseUrl.origin === url.origin && request.destination === 'image'
    );
  },
  new StaleWhileRevalidate({
    cacheName: 'story-api-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 1 * 24 * 60 * 60,
      }),
    ],
  })
);

// self.addEventListener('message', (event) => {
//   // do the skipWaiting() with user interaction
//   if (event.data && event.data.type === 'SKIP_WAITING') {
//     self.skipWaiting();
//   }
// });

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  async function showNotification() {
    try {
      const data = await event.data.json();
      await self.registration.showNotification(data.title, {
        body: data.options.body,
        icon: '/images/logo.png',
      });
    } catch (e) {
      const text = event.data ? event.data.text() : 'You have a new message';
      await self.registration.showNotification('New message', {
        body: text,
        icon: '/images/logo.png',
      });
    }
  }

  event.waitUntil(showNotification());
});
