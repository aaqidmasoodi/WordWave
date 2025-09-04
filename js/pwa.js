// PWA Update Manager - Auto Updates Only
class PWAUpdateManager {
    constructor() {
        this.registration = null;
        this.waitingWorker = null;
        this.init();
    }

    async init() {
        if ('serviceWorker' in navigator) {
            try {
                this.registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered');
                
                // Listen for updates
                this.registration.addEventListener('updatefound', () => {
                    this.handleUpdateFound();
                });

                // Handle waiting service worker
                if (this.registration.waiting) {
                    this.handleUpdateFound();
                }

            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }

    handleUpdateFound() {
        const newWorker = this.registration.installing || this.registration.waiting;
        if (!newWorker) return;

        console.log('🔄 New service worker found, checking for genuine update...');
        
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.checkForGenuineUpdate(newWorker);
            }
        });

        // If already installed, check immediately
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.checkForGenuineUpdate(newWorker);
        }
    }

    async checkForGenuineUpdate(newWorker) {
        try {
            const cacheNames = await caches.keys();
            const currentCacheName = await this.getCurrentCacheName();
            
            console.log('  Current cache:', currentCacheName);
            console.log('  All caches:', cacheNames);
            
            const newerCaches = cacheNames.filter(name => 
                name.startsWith('wordwave-v') && name !== currentCacheName
            );
            
            if (newerCaches.length > 0) {
                console.log('✅ GENUINE UPDATE DETECTED - auto-updating...');
                this.waitingWorker = newWorker;
                this.installUpdate();
            } else {
                console.log('🔕 No genuine update - same cache name');
            }
        } catch (error) {
            console.error('❌ Error checking for genuine update:', error);
        }
    }

    async getCurrentCacheName() {
        try {
            const cacheNames = await caches.keys();
            return cacheNames.find(name => name.startsWith('wordwave-v')) || 'unknown';
        } catch (error) {
            console.error('❌ Error getting current cache name:', error);
            return 'unknown';
        }
    }

    installUpdate() {
        if (this.waitingWorker) {
            console.log('🔄 Installing update automatically...');
            this.waitingWorker.postMessage({ type: 'SKIP_WAITING' });
            
            // Reload page after update
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('✅ Update installed, reloading page...');
                window.location.reload();
            });
        }
    }
}

// Initialize PWA Update Manager
if (typeof window !== 'undefined') {
    window.pwaUpdateManager = new PWAUpdateManager();
}
