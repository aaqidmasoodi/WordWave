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

// Initialize PWA installer
document.addEventListener('DOMContentLoaded', () => {
    new PWAInstaller();
});
