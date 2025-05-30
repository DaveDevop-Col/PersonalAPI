self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('triviaapp-v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/script.js',
        '/sw.js',
        '/manifest.json',
        // agrega aquí los íconos si los tienes en una carpeta o sueltos
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
