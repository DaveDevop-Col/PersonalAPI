self.addEventListener('install', e => {
    e.waitUntil(
      caches.open('pokeapp-v1').then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/css/styles.css',
          '/js/app.js',
          '/icons/icon-192.png',
          '/icons/icon-512.png'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', e => {
    e.respondWith(
      caches.match(e.request).then(response => {
        return response || fetch(e.request);
      })
    );
  });
  
