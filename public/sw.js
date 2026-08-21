// Service Worker for Aryxly CRM PWA installability and caching
const CACHE_NAME = 'aryxly-crm-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/logo-mark.png',
  '/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Continue even if some optional assets fail to pre-cache
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass through POST / server actions / mutations directly without caching
  if (event.request.method !== 'GET') {
    return;
  }

  // Network-first strategy for dynamic Next.js App Router & Supabase pages
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If valid network response, optionally cache static files
        if (response && response.status === 200 && response.type === 'basic') {
          const url = new URL(event.request.url);
          if (
            url.pathname.startsWith('/_next/static/') ||
            url.pathname.startsWith('/icons/') ||
            url.pathname.endsWith('.png') ||
            url.pathname.endsWith('.svg') ||
            url.pathname.endsWith('.ico')
          ) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If navigation request fails and nothing in cache, return root
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
