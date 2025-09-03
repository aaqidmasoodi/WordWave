const CACHE_NAME = 'wordwave-v5.5.4';

// Clear all old caches aggressively
self.addEventListener('activate', event => {
    console.log('🔄 SW Activating:', CACHE_NAME, '- USER INITIATED ONLY');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ SW Activated, old caches cleared:', CACHE_NAME);
            // NEVER auto-claim - wait for user permission
        })
    );
});

// Handle skip waiting message
self.addEventListener('message', event => {
    console.log('📨 SW received message:', event.data);
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('⏭️ Skipping waiting, activating immediately');
        self.skipWaiting();
    }
});

// Service Worker - ABSOLUTELY NO AUTO-UPDATES
self.addEventListener('install', event => {
    console.log('🔍 New SW detected:', CACHE_NAME, '- WAITING FOR USER PERMISSION');
    
    // Cache files but NEVER skip waiting
    if (!isLocalhost) {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then(cache => {
                    console.log('📦 Files cached, waiting for user to install');
                    return cache.addAll(urlsToCache);
                })
        );
    }
    
    // Set localStorage flag that persists across sessions
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'UPDATE_DETECTED',
                version: CACHE_NAME
            });
        });
    });
    
    // NEVER call self.skipWaiting() automatically
    console.log('✋ Service worker installed but WAITING for user permission');
});

// Disable caching on localhost for development
const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

const urlsToCache = [
  '/',
  '/index.html',
  '/flashcards.html',
  '/quiz.html',
  '/sentences.html',
  '/synthesiser.html',
  '/foundations.html',
  '/progress.html',
  '/settings.html',
  '/privacy.html',
  '/terms.html',
  '/developer.html',
  '/styles/custom.css',
  '/styles/animations.css',
  '/styles/native.css',
  '/js/app.js',
  '/js/state.js',
  '/js/data.js',
  '/js/pwa.js',
  '/js/settings.js',
  '/js/flashcards.js',
  '/js/quiz.js',
  '/js/sentences.js',
  '/js/synthesiser.js',
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

// Fetch event
self.addEventListener('fetch', event => {
  // Skip caching on localhost
  if (isLocalhost) {
    return;
  }
  
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
  // DO NOT claim clients automatically - let user control updates
  console.log('Service worker activated - waiting for user to install update');
});

// Listen for messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    // Only skip waiting when explicitly requested by user
    console.log('User requested update installation');
    self.skipWaiting();
  }
});
