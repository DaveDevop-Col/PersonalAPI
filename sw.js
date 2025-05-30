const CACHE_NAME = 'trivia-cache-v1';
const urlsToCache = [
  '/dave-trivia/',
  '/dave-trivia/index.html',
  '/dave-trivia/style.css',
  '/dave-trivia/js/script.js',
  '/dave-trivia/icon-only.png',
  '/dave-trivia/icon-foreground.png',
  '/dave-trivia/manifest.json'
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
