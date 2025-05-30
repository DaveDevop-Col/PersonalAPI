const CACHE_NAME = 'trivia-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './js/script.js',    // Ruta corregida: ahora apunta a /js/script.js
  './manifest.json',
  './icon-only.png',
  './icon-foreground.png',
  './sw.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
