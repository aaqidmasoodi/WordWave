// WordWave Service Worker with OneSignal Integration
const CACHE_NAME = 'wordwave-v6.2.7';

// Import OneSignal service worker functionality FIRST
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// Handle messages from main thread - AFTER OneSignal import
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('⚡ Received SKIP_WAITING message - activating new SW');
        self.skipWaiting();
    }
});

const urlsToCache = [
    '/',
    '/index.html',
    '/install-banner.html',
    '/settings.html',
    '/flashcards.html',
    '/quiz.html',
    '/progress.html',
    '/sentences.html',
    '/foundations.html',
    '/synthesiser.html',
    '/js/app.js',
    '/js/pwa.js',
    '/js/settings.js',
    '/js/notifications.js',
    '/js/flashcards.js',
    '/js/quiz.js',
    '/js/progress.js',
    '/js/sentences.js',
    '/js/foundations.js',
    '/js/synthesiser.js',
    '/styles/custom.css',
    '/styles/animations.css',
    '/styles/native.css',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
    console.log('🔍 New SW detected: ' + CACHE_NAME + ' - WAITING FOR USER PERMISSION');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Caching files...');
                // Cache files individually to handle errors better
                return Promise.all(
                    urlsToCache.map(url => {
                        return cache.add(url).catch(error => {
                            console.warn('⚠️ Failed to cache:', url, error);
                            // Continue even if some files fail to cache
                            return Promise.resolve();
                        });
                    })
                );
            })
            .then(() => {
                console.log('✅ Service worker installed successfully');
                // Don't skip waiting - let user decide when to update
            })
            .catch(error => {
                console.error('❌ Service worker installation failed:', error);
            })
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('🚀 Service worker activated: ' + CACHE_NAME);
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache: ' + cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - Improved caching strategy
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip external requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    // Skip very large files (over 10MB)
    if (event.request.url.includes('.svg') && event.request.headers.get('content-length') > 10485760) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // If we have a cached response, return it
                if (cachedResponse) {
                    // For HTML files, also fetch from network to update cache
                    if (event.request.destination === 'document') {
                        fetch(event.request)
                            .then(networkResponse => {
                                if (networkResponse && networkResponse.status === 200) {
                                    const responseClone = networkResponse.clone();
                                    caches.open(CACHE_NAME)
                                        .then(cache => {
                                            cache.put(event.request, responseClone);
                                        })
                                        .catch(error => {
                                            console.warn('⚠️ Failed to update cache:', error);
                                        });
                                }
                            })
                            .catch(() => {
                                // Network failed, but we have cache
                            });
                    }
                    return cachedResponse;
                }
                
                // No cached response, fetch from network
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Check if we received a valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        // Don't cache very large responses
                        const contentLength = networkResponse.headers.get('content-length');
                        if (contentLength && parseInt(contentLength) > 10485760) {
                            return networkResponse;
                        }
                        
                        // Clone the response
                        const responseToCache = networkResponse.clone();
                        
                        // Add to cache
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            })
                            .catch(error => {
                                console.warn('⚠️ Failed to cache response:', error);
                            });
                        
                        return networkResponse;
                    })
                    .catch(() => {
                        // Network failed and no cache
                        if (event.request.destination === 'document') {
                            return new Response('App is offline', {
                                status: 503,
                                statusText: 'Service Unavailable',
                                headers: new Headers({
                                    'Content-Type': 'text/html'
                                })
                            });
                        }
                    });
            })
    );
});
