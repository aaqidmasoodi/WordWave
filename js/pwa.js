// PWA Installation and Update Management

// PWA Installer
class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }

    init() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            console.log('💾 Install prompt ready');
        });

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed successfully');
            this.deferredPrompt = null;
        });
    }

    async install() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log('📱 Install outcome:', outcome);
            this.deferredPrompt = null;
            return outcome === 'accepted';
        }
        return false;
    }

    isInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone === true;
    }
}

// PWA Update Manager - Simple flag-based system
class PWAUpdateManager {
    constructor() {
        this.registration = null;
        this.waitingWorker = null;
        this.isInstalling = false; // Track if we're currently installing
        this.init();
    }

    async init() {
        if ('serviceWorker' in navigator) {
            try {
                this.registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ SW registered');
                
                // Listen for new service worker
                this.registration.addEventListener('updatefound', () => {
                    console.log('🔄 New service worker found');
                    this.handleUpdateFound(this.registration);
                });
                
                // Check if there's already a waiting worker
                if (this.registration.waiting) {
                    console.log('🔄 Update available immediately');
                    // Only set flag if this is a new update (not already notified)
                    const lastNotified = localStorage.getItem('wordwave_update_timestamp');
                    const currentTime = Date.now();
                    
                    if (!lastNotified || (currentTime - parseInt(lastNotified)) > 60000) { // 1 minute cooldown
                        this.setUpdateFlag();
                        this.waitingWorker = this.registration.waiting;
                    } else {
                        console.log('🔕 Update already notified recently, skipping banner');
                        this.waitingWorker = this.registration.waiting;
                    }
                } else {
                    // Only clear flags if no update is waiting
                    this.clearUpdateFlag();
                }
                
                // Listen for actual service worker updates (not random controller changes)
                navigator.serviceWorker.addEventListener('message', (event) => {
                    if (event.data && event.data.type === 'SW_UPDATED') {
                        console.log('🔄 Service worker updated - reloading');
                        this.clearUpdateFlag();
                        window.location.reload();
                    }
                });
                
            } catch (error) {
                console.error('❌ SW registration failed:', error);
            }
        }
    }

    async getCurrentCacheName() {
        // Get the current active cache name
        const cacheNames = await caches.keys();
        const currentCache = cacheNames.find(name => name.startsWith('wordwave-v'));
        return currentCache || 'wordwave-v6.3.4';
    }

    handleUpdateFound(registration) {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', async () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller && !this.isInstalling) {
                console.log('🔍 Checking for genuine update...');
                
                // Get all cache names
                const cacheNames = await caches.keys();
                const currentCacheName = await this.getCurrentCacheName();
                
                console.log('  Current cache:', currentCacheName);
                console.log('  All caches:', cacheNames);
                
                // Check if there's a newer cache name (different version)
                const newerCaches = cacheNames.filter(name => 
                    name.startsWith('wordwave-v') && name !== currentCacheName
                );
                
                if (newerCaches.length > 0) {
                    console.log('✅ GENUINE UPDATE DETECTED - new cache:', newerCaches[0]);
                    this.setUpdateFlag();
                    this.waitingWorker = newWorker;
                    window.dispatchEvent(new CustomEvent('updateAvailable'));
                } else {
                    console.log('🔕 No genuine update - same cache name, clearing stale flags');
                    this.clearUpdateFlag();
                }
            }
        });
    }

    setUpdateFlag() {
        if (window.stateManager) {
            window.stateManager.setUpdateFlag(true);
        } else {
            // Fallback if state manager not available
            localStorage.setItem('wordwave_update_available', 'true');
            localStorage.setItem('wordwave_update_timestamp', Date.now().toString());
        }
        console.log('🚩 Update flag SET');
    }

    clearUpdateFlag() {
        if (window.stateManager) {
            window.stateManager.setUpdateFlag(false);
        } else {
            // Fallback if state manager not available
            localStorage.removeItem('wordwave_update_available');
            localStorage.removeItem('wordwave_update_timestamp');
        }
        console.log('🚩 Update flag CLEARED');
    }

    // Install the waiting update
    installUpdate() {
        if (this.waitingWorker) {
            console.log('🔄 Installing update...');
            this.isInstalling = true; // Prevent flag from being set again
            this.clearUpdateFlag();
            this.waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        }
    }

    // Force check for updates (called by settings button)
    async forceUpdateCheck() {
        console.log('🔍 Force checking for updates...');
        
        if (this.registration) {
            try {
                // Force service worker to check for updates
                await this.registration.update();
                
                // Wait a moment for the update to process
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Get fresh registration and check for waiting worker
                const updatedRegistration = await navigator.serviceWorker.getRegistration();
                const hasWaitingWorker = !!(updatedRegistration && updatedRegistration.waiting);
                
                console.log('✅ Update check completed - waiting worker:', hasWaitingWorker);
                
                if (hasWaitingWorker) {
                    // Manually trigger the same logic as handleUpdateFound
                    return await this.checkForGenuineUpdate(updatedRegistration.waiting);
                } else {
                    // No waiting worker - clear any stale flags using state manager
                    this.clearUpdateFlag();
                    return false;
                }
            } catch (error) {
                console.error('❌ Update check failed:', error);
                // Clear flags on error too
                this.clearUpdateFlag();
                return false;
            }
        }
        return false;
    }

    // Check if this is a genuine update (different cache name)
    async checkForGenuineUpdate(newWorker) {
        console.log('🔍 Checking for genuine update...');
        
        const cacheNames = await caches.keys();
        const currentCacheName = await this.getCurrentCacheName();
        
        console.log('  Current cache:', currentCacheName);
        console.log('  All caches:', cacheNames);
        
        const newerCaches = cacheNames.filter(name => 
            name.startsWith('wordwave-v') && name !== currentCacheName
        );
        
        if (newerCaches.length > 0) {
            console.log('✅ GENUINE UPDATE DETECTED - new cache:', newerCaches[0]);
            this.setUpdateFlag();
            this.waitingWorker = newWorker;
            window.dispatchEvent(new CustomEvent('updateAvailable'));
            return true;
        } else {
            console.log('🔕 No genuine update - same cache name, clearing stale flags');
            this.clearUpdateFlag();
            return false;
        }
    }

    // Static methods for other components
    static isUpdateAvailable() {
        return localStorage.getItem('wordwave_update_available') === 'true';
    }

    static clearUpdateFlag() {
        localStorage.removeItem('wordwave_update_available');
        localStorage.removeItem('wordwave_update_timestamp');
        console.log('🚩 Update flag cleared (static)');
    }
}

// Initialize PWA features
document.addEventListener('DOMContentLoaded', () => {
    new PWAInstaller();
    window.pwaUpdateManager = new PWAUpdateManager();
});
