const CACHE_NAME = 'adriano-jorge-digital-card-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/icon.svg',
  '/manifest.json'
];

// Detect development or preview environment to bypass aggressive caching
const isDev = self.location.hostname.includes('localhost') || 
              self.location.hostname.includes('ais-dev') || 
              self.location.hostname.includes('ais-pre') || 
              self.location.hostname.includes('run.app');

// On installation, cache core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell Assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Clean up old caches on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// Cache strategy: Bypass cache completely in dev/preview environments so updates are instant
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (isDev) {
    // In dev, always go directly to network
    event.respondWith(fetch(event.request));
    return;
  }

  // Production stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response immediately, and fetch a fresh version in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {/* Ignore network failures on background refresh */});
        
        return cachedResponse;
      }

      // If not in cache, fetch from network
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && !event.request.url.includes('unsplash') && !event.request.url.includes('googleapis') && !event.request.url.includes('gstatic')) {
          return networkResponse;
        }

        // Cache new local/font/unsplash requests dynamically
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // If network is completely down and request is for page, return cached root
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/');
        }
      });
    })
  );
});
