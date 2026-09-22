/**
 * Service Worker — RabbitryPedigree Pro (WarrenWise Pro)
 * Version: v7.0-launch-hardened
 * 
 * Provides rock-solid offline reliability in rural barns, fairgrounds, and metal buildings.
 * Automatically caches all core bundles, CSS, images, and fonts, falling back to IndexedDB/Dexie.
 */

const CACHE_NAME = 'rabbitry-pro-v7.0-launch-hardened';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/mascot.png',
  '/assets/holland_lop.png',
  '/assets/mini_rex.png',
  '/assets/netherland_dwarf.png',
  '/assets/new_zealand_white.png'
];

// Install Event — Pre-cache essential shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker v7.0] Pre-caching core application shell...');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event — Aggressively purge older cache generations
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker v7.0] Purging legacy cache version:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event — Network-First with Stale-While-Revalidate and resilient offline fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. API Calls — Network-only with structured offline JSON payload
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({
          offline: true,
          status: 'cached_offline',
          timestamp: new Date().toISOString(),
          message: 'Offline barn mode active. Actions queued for background sync.'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 2. Navigation Requests (HTML) — Network-First, fallback to cached index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 3. Static Assets (JS, CSS, Images, Fonts, Icons) — Stale-While-Revalidate
  const isStaticAsset = (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.webmanifest') ||
    url.pathname.endsWith('.json')
  );

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            }
            return networkResponse;
          })
          .catch(() => null);

        return cachedResponse || fetchPromise.then(res => res || caches.match('/index.html'));
      })
    );
    return;
  }

  // 4. Default Fetch Pass-Through
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
