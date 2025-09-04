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
                    this.setUpdateFlag();
                    this.waitingWorker = this.registration.waiting;
                } else {
                    // Only clear flags if no update is waiting
                    this.clearUpdateFlag();
                }
                
                // Listen for controller change (update installed)
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    console.log('🔄 Controller changed - reloading');
                    this.clearUpdateFlag();
                    window.location.reload();
                });
                
            } catch (error) {
                console.error('❌ SW registration failed:', error);
            }
        }
    }

    handleUpdateFound(registration) {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller && !this.isInstalling) {
                console.log('✅ NEW UPDATE AVAILABLE - setting flag');
                this.setUpdateFlag();
                this.waitingWorker = newWorker;
                
                // Dispatch event for UI updates
                window.dispatchEvent(new CustomEvent('updateAvailable'));
            }
        });
    }

    setUpdateFlag() {
        localStorage.setItem('wordwave_update_available', 'true');
        localStorage.setItem('wordwave_update_timestamp', Date.now().toString());
        console.log('🚩 Update flag SET');
    }

    clearUpdateFlag() {
        localStorage.removeItem('wordwave_update_available');
        localStorage.removeItem('wordwave_update_timestamp');
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
