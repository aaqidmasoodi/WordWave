const CACHE_NAME = 'wordwave-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/flashcards.html',
  '/quiz.html',
  '/sentences.html',
  '/foundations.html',
  '/progress.html',
  '/styles/custom.css',
  '/styles/animations.css',
  '/js/app.js',
  '/js/state.js',
  '/js/data.js',
  '/js/flashcards.js',
  '/js/quiz.js',
  '/js/sentences.js',
  '/js/foundations.js',
  '/js/progress.js',
  '/components/header/header.html',
  '/components/header/header.js',
  '/components/sidebar/sidebar.html',
  '/components/sidebar/sidebar.js',
  '/components/bottom-nav/bottom-nav.html',
  '/components/bottom-nav/bottom-nav.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim all clients immediately
  return self.clients.claim();
});

// Listen for messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
