const CACHE_NAME = 'triviaapp-v2';  // Actualiza la versión al hacer cambios
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './sw.js',
  './manifest.json',
  './icon-foreground.png',
  './icon-only.png'
];

// ----- Instalación -----
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Installing...');
  
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(ASSETS)
          .catch((err) => {
            console.error('[Service Worker] Cache addAll error:', err);
            throw err; // Opcional: fuerza el fallo si quieres que la instalación falle
          });
      })
      .then(() => self.skipWaiting()) // Activa el SW inmediatamente
  );
});

// ----- Activación (limpieza de cachés viejos) -----
self.addEventListener('activate', (e) => {
  console.log('[Service Worker] Activated');
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim()) // Toma el control de todas las pestañas
  );
});

// ----- Estrategia de Fetch (Cache First + Network Fallback) -----
self.addEventListener('fetch', (e) => {
  console.log('[Service Worker] Fetching:', e.request.url);
  
  // Excluye peticiones no-GET (como POST a APIs)
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request)
      .then((cachedResponse) => {
        // Devuelve el recurso en caché si existe
        if (cachedResponse) {
          console.log('[Service Worker] Serving from cache:', e.request.url);
          return cachedResponse;
        }

        // Si no está en caché, haz la petición a red
        return fetch(e.request)
          .then((networkResponse) => {
            // Opcional: guarda en caché nuevas respuestas
            if (e.request.url.startsWith('http') && !networkResponse.redirected) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(e.request, responseToCache));
            }
            return networkResponse;
          })
          .catch(() => {
            // Fallback para páginas (solo si es una navegación)
            if (e.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});
