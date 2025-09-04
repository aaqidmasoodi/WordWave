// Update UI Manager - Handles UI updates based on PWA manager
class UpdateUIManager {
    constructor() {
        this.init();
    }

    init() {
        // Check for updates on page load
        this.checkAndShowUpdateUI();
        
        
        // Listen for storage changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'wordwave_update_available') {
                this.checkAndShowUpdateUI();
            }
        });
    }

    checkAndShowUpdateUI() {
        const updateAvailable = localStorage.getItem('wordwave_update_available') === 'true';
        
        if (updateAvailable) {
            this.showUpdateBanner();
        } else {
            this.hideUpdateBanner();
        }
    }

    showUpdateBanner() {
        // Use the existing banner in the HTML
        const banner = document.getElementById('updateBanner');
        if (banner) {
            banner.classList.remove('d-none');
            
            // Add click handler for install button if not already added
            const installBtn = document.getElementById('installUpdateFromBanner');
            if (installBtn && !installBtn.hasAttribute('data-listener')) {
                installBtn.setAttribute('data-listener', 'true');
                installBtn.addEventListener('click', () => {
                    if (window.pwaUpdateManager) {
                        window.pwaUpdateManager.installUpdate();
                    }
                });
            }
        }
    }

    hideUpdateBanner() {
        // Hide the existing banner
        const banner = document.getElementById('updateBanner');
        if (banner) {
            banner.classList.add('d-none');
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new UpdateUIManager();
});
