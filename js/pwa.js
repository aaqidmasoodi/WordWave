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

// PWA Update Manager
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
                    
                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        this.handleUpdateFound(registration);
                    });
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
                // New update available - show subtle indicator
                this.showUpdateIndicator();
            }
        });
    }

    showUpdateIndicator() {
        // Add update badge to settings link in sidebar
        const settingsLink = document.querySelector('a[href="settings.html"]');
        if (settingsLink && !settingsLink.querySelector('.update-badge')) {
            const badge = document.createElement('span');
            badge.className = 'update-badge badge bg-danger ms-2';
            badge.style.fontSize = '0.6rem';
            badge.textContent = '1';
            settingsLink.appendChild(badge);
        }

        // Add update indicator to check button if on settings page
        const checkBtn = document.getElementById('checkUpdatesBtn');
        if (checkBtn && !checkBtn.classList.contains('btn-success')) {
            checkBtn.classList.remove('btn-outline-primary');
            checkBtn.classList.add('btn-success');
            checkBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
            checkBtn.title = 'Update available - click to update';
        }
    }

    async applyUpdate() {
        if (this.registration && this.registration.waiting) {
            // Tell the waiting service worker to skip waiting
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            
            // Reload the page to get the new version
            window.location.reload();
        }
    }

    async checkForUpdates() {
        if (this.registration) {
            await this.registration.update();
            return true;
        }
        return false;
    }
}

// Initialize PWA components
document.addEventListener('DOMContentLoaded', () => {
    new PWAInstaller();
    window.pwaUpdateManager = new PWAUpdateManager();
});
