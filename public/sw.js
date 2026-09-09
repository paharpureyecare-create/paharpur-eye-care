// Paharpur Eye Care ERP - Progressive Web App Service Worker (v3)
const CACHE_NAME = 'paharpur-erp-v3-20260909';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest.webmanifest',
  '/icon.svg',
  '/favicon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  // Precache core assets and activate immediately without waiting for tabs to close
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Purge ALL outdated caches from previous versions immediately
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PWA SW] Deleting stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data) {
    if (event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    } else if (event.data.type === 'PURGE_ALL_CACHES') {
      caches.keys().then((keys) => {
        return Promise.all(keys.map((k) => caches.delete(k)));
      });
    }
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Pass through non-GET, API, Firestore, Google Auth, SW scripts, and Vite dev modules directly to network
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.includes('.vite') ||
    url.pathname.endsWith('sw.js') ||
    url.pathname.endsWith('registerSW.js') ||
    url.pathname.endsWith('dev-sw.js') ||
    url.pathname.endsWith('manifest.json') ||
    url.pathname.endsWith('manifest.webmanifest') ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('google.com') ||
    url.hostname.includes('googleapis.com')
  ) {
    return;
  }

  // Navigation requests (HTML pages ONLY): Strict Network-First so mobile apps get latest code immediately
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback
          return caches.match('/index.html').then((cached) => {
            return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
          });
        })
    );
    return;
  }

  // Static Assets: Network-first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response('Asset Unavailable Offline', { status: 404, statusText: 'Not Found' });
        });
      })
  );
});
