import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { API_ORIGIN } from './config';

const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest);

// Runtime caching

// Cache the web manifest file
registerRoute(
  ({ url }) => url.pathname === '/app.webmanifest',
  new CacheFirst({
    cacheName: 'app-manifest',
  })
);

// Cache images in the public images folder
registerRoute(
  ({ url }) => url.pathname.startsWith('/images/'),
  new CacheFirst({
    cacheName: 'public-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 150,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

// Cache favicons explicitly
registerRoute(
  ({ url }) => url.pathname === '/favicon.ico' || url.pathname.startsWith('/favicon-'),
  new CacheFirst({
    cacheName: 'favicons',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

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

// // Reverse geocoding from maptiler API: Uses CacheFirst because the data does not change often.
// registerRoute(
//   ({ url }) => {
//     return url.origin.includes('maptiler');
//   },
//   new CacheFirst({
//     cacheName: 'maptiler-api',
//   })
// );

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('push', (event) => {
  async function chainPromise() {
    try {
      const data = await event.data.json();
      await self.registration.showNotification(data.title, {
        body: data.options.body,
      });
    } catch (e) {
      const text = event.data ? event.data.text() : 'You have a new message';
      await self.registration.showNotification('New message', {
        body: text,
      });
    }
  }
  event.waitUntil(chainPromise());
});
