// PWA Install Prompt
class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }

    init() {
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            this.deferredPrompt = e;
            // Show install button
            this.showInstallButton();
        });

        // Listen for the app being installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.hideInstallButton();
        });
    }

    showInstallButton() {
        // Create install button if it doesn't exist
        if (!document.getElementById('pwaInstallBtn')) {
            const installBtn = document.createElement('button');
            installBtn.id = 'pwaInstallBtn';
            installBtn.className = 'btn btn-primary btn-sm position-fixed';
            installBtn.style.cssText = `
                bottom: 80px;
                right: 20px;
                z-index: 1000;
                border-radius: 25px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            `;
            installBtn.innerHTML = '<i class="bi bi-download me-1"></i>Install App';
            
            installBtn.addEventListener('click', () => {
                this.installApp();
            });
            
            document.body.appendChild(installBtn);
        }
    }

    hideInstallButton() {
        const installBtn = document.getElementById('pwaInstallBtn');
        if (installBtn) {
            installBtn.remove();
        }
    }

    async installApp() {
        if (!this.deferredPrompt) return;

        // Show the install prompt
        this.deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await this.deferredPrompt.userChoice;
        
        console.log(`User response to the install prompt: ${outcome}`);
        
        // Clear the deferredPrompt
        this.deferredPrompt = null;
        
        // Hide the install button
        this.hideInstallButton();
    }

    // Check if app is already installed
    isInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone === true;
    }
}

// PWA Update Manager - Automatic update detection with flag system
class PWAUpdateManager {
    constructor() {
        this.registration = null;
        this.currentVersion = '5.9.6'; // Current app version
        this.init();
    }

    init() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    this.registration = registration;
                    console.log('SW registered: ', registration);
                    
                    // FORCE CLEAR update flags on init if version matches
                    this.checkVersionAndClearFlags();
                    
                    // Check if there's already a waiting service worker
                    if (registration.waiting && !this.isCurrentVersion()) {
                        console.log('🔄 Update available immediately');
                        this.setUpdateFlag();
                    }
                    
                    // Listen for new service worker installing
                    registration.addEventListener('updatefound', () => {
                        console.log('🔄 New service worker found');
                        this.handleUpdateFound(registration);
                    });
                    
                    // Listen for service worker state changes
                    navigator.serviceWorker.addEventListener('controllerchange', () => {
                        console.log('🔄 Controller changed - clearing flag and reloading');
                        this.clearUpdateFlag();
                        window.location.reload();
                    });

                    // DISABLED automatic checking - only manual checks
                    // setInterval(() => {
                    //     console.log('🔍 Auto-checking for updates...');
                    //     registration.update();
                    // }, 300000);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }
    }

    checkVersionAndClearFlags() {
        const storedVersion = localStorage.getItem('wordwave_app_version');
        
        if (storedVersion === this.currentVersion) {
            console.log('🧹 Version matches - force clearing update flags');
            this.clearUpdateFlag();
        } else {
            // Update stored version
            localStorage.setItem('wordwave_app_version', this.currentVersion);
            console.log('📝 Updated stored version to:', this.currentVersion);
        }
    }

    isCurrentVersion() {
        const storedVersion = localStorage.getItem('wordwave_app_version');
        return storedVersion === this.currentVersion;
    }

    handleUpdateFound(registration) {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Only set flag if it's actually a new version
                if (!this.isCurrentVersion()) {
                    console.log('✅ NEW VERSION available - setting flag');
                    this.setUpdateFlag();
                    window.dispatchEvent(new CustomEvent('updateAvailable'));
                } else {
                    console.log('✅ Same version - not setting flag');
                }
            }
        });
    }

    setUpdateFlag() {
        localStorage.setItem('wordwave_update_available', 'true');
        localStorage.setItem('wordwave_update_timestamp', Date.now().toString());
        console.log('🚩 Update flag set to true');
    }

    clearUpdateFlag() {
        localStorage.removeItem('wordwave_update_available');
        localStorage.removeItem('wordwave_update_timestamp');
        console.log('🚩 Update flag cleared');
    }

    // Static methods for other components to use
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
    new PWAUpdateManager();
});
