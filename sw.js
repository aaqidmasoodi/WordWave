// WordWave Service Worker with OneSignal Integration
const CACHE_NAME = 'wordwave-v6.2.5';

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
                console.log('📦 Files cached, waiting for user to install');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✋ Service worker installed but WAITING for user permission');
                // Don't skip waiting - let user decide when to update
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

// Fetch event
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});
