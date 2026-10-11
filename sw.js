const CACHE_NAME = 'workout-tracker-shell-v2';
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.svg', './icon-512.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME && k !== 'workout-videos-v1').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;
  if (request.destination === 'document' && url.origin === self.location.origin) {
    event.respondWith(fetch(request).then(response => {
      const copy=response.clone(); caches.open(CACHE_NAME).then(cache=>cache.put(request,copy)); return response;
    }).catch(() => caches.match(request).then(r=>r || caches.match('./index.html'))));
    return;
  }
  if (request.url.endsWith('.mp4')) {
    event.respondWith(caches.open('workout-videos-v1').then(async cache => {
      const cached=await cache.match(request); if(cached) return cached;
      const response=await fetch(request); if(response.ok) cache.put(request,response.clone()); return response;
    }));
    return;
  }
  if (url.origin === self.location.origin) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
      if(response.ok) caches.open(CACHE_NAME).then(cache=>cache.put(request,response.clone())); return response;
    })));
  }
});
