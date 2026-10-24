const CACHE_NAME = "workout-tracker-shell-v3";
const VIDEO_CACHE = "workout-videos-v1";
const RUNTIME_CACHE = "workout-tracker-runtime-v1";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.svg", "./icon-512.svg"];
const SCRIPT_HOSTS = new Set(["cdn.jsdelivr.net", "www.gstatic.com"]);

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key =>
        key !== CACHE_NAME && key !== VIDEO_CACHE && key !== RUNTIME_CACHE
      ).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Media elements commonly use HTTP Range requests. Let the browser/WebView handle
  // those directly: wrapping partial-content responses in Cache Storage can break MP4 playback.
  if (request.headers.has("range")) return;

  // Keep same-origin HTML available offline; refresh it whenever the network works.
  if (request.destination === "document" && url.origin === self.location.origin) {
    event.respondWith(
      fetch(request).then(response => {
        if (response && response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
        return response;
      }).catch(async () => (await caches.match(request)) || (await caches.match("./index.html")))
    );
    return;
  }

  // CDN scripts (including Firebase's ES module dependency graph) must be cached
  // after the first successful online load or the app cannot start offline.
  if (SCRIPT_HOSTS.has(url.hostname) && (request.destination === "script" || request.mode === "cors")) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async cache => {
        try {
          const response = await fetch(request);
          if (response && (response.ok || response.type === "opaque")) {
            cache.put(request, response.clone()).catch(() => {});
          }
          return response;
        } catch (error) {
          const cached = await cache.match(request);
          if (cached) return cached;
          throw error;
        }
      })
    );
    return;
  }

  // Workout demonstration videos are large, so cache them only when requested.
  if (url.pathname.endsWith(".mp4")) {
    event.respondWith(
      caches.open(VIDEO_CACHE).then(async cache => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response && response.ok) cache.put(request, response.clone()).catch(() => {});
        return response;
      })
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        if (response && response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
        return response;
      }))
    );
  }
});
