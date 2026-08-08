const CACHE_NAME = 'workout-videos-v1';

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // فقط ویدیوهای mp4 رو کش می‌کنیم
  if (request.url.endsWith('.mp4')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        // ۱. بررسی می‌کنیم تو حافظه گوشی هست؟
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse; // اگه بود، مستقیماً از حافظه میاره و اینترنت مصرف نمیشه
        }

        // ۲. اگه نبود، دانلود می‌کنه و تو گوشی ذخیره می‌کنه
        const networkResponse = await fetch(request);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      })
    );
  }
});