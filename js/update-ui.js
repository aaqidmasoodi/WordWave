// Update UI Manager - Handles UI updates based on PWA manager
class UpdateUIManager {
    constructor() {
        this.init();
    }

    init() {
        // Small delay to let PWA manager initialize and clear stale flags first
        setTimeout(() => {
            this.checkAndShowUpdateUI();
        }, 500);
        
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
                    // Redirect to settings page instead of installing directly
                    window.location.href = '/settings.html';
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
