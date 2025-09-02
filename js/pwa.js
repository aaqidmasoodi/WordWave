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
        this.init();
    }

    init() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    this.registration = registration;
                    console.log('SW registered: ', registration);
                    
                    // Check if there's already a waiting service worker
                    if (registration.waiting) {
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

                    // Auto-check for updates every 30 seconds (more frequent for Chrome Android)
                    setInterval(() => {
                        console.log('🔍 Auto-checking for updates...');
                        registration.update().then(() => {
                            // Force check after update call
                            setTimeout(() => {
                                if (registration.waiting || registration.installing) {
                                    console.log('🔄 Auto-detected update after interval check');
                                    this.setUpdateFlag();
                                    window.dispatchEvent(new CustomEvent('updateAvailable'));
                                }
                            }, 1000);
                        });
                    }, 30000);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }
    }

    handleUpdateFound(registration) {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('✅ Update available - setting flag');
                this.setUpdateFlag();
                
                // Dispatch event for home page to listen
                window.dispatchEvent(new CustomEvent('updateAvailable'));
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
