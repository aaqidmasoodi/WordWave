// Update UI Manager - Handles UI updates based on PWA manager
class UpdateUIManager {
    constructor() {
        this.init();
    }

    init() {
        // Check for updates on page load
        this.checkAndShowUpdateUI();
        
        // Listen for updateAvailable event from PWA manager
        window.addEventListener('updateAvailable', () => {
            this.showUpdateBanner();
        });
        
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
        // Only show on home/dashboard page
        const isDashboard = window.location.pathname === '/' || 
                           window.location.pathname === '/index.html' ||
                           window.location.pathname.endsWith('/index.html') ||
                           document.querySelector('.dashboard-container');
        
        if (!isDashboard) return;
        
        const dashboardContainer = document.querySelector('.dashboard-container, .container');
        if (dashboardContainer && !document.getElementById('updateNotificationCard')) {
            const updateCard = document.createElement('div');
            updateCard.id = 'updateNotificationCard';
            updateCard.className = 'card border-0 shadow-sm mb-4';
            updateCard.style.background = 'linear-gradient(135deg, #198754 0%, #20c997 100%)';
            updateCard.innerHTML = `
                <div class="card-body py-3">
                    <div class="d-flex align-items-center justify-content-between text-white">
                        <div class="flex-grow-1">
                            <div class="fw-semibold mb-0">New Update Available</div>
                        </div>
                        <button id="installUpdateFromBanner" class="btn btn-light btn-sm px-3 py-2 rounded-pill fw-semibold">
                            Update
                        </button>
                    </div>
                </div>
            `;
            
            // Insert at the top of the dashboard
            const firstCard = dashboardContainer.querySelector('.card');
            if (firstCard) {
                dashboardContainer.insertBefore(updateCard, firstCard);
            } else {
                dashboardContainer.appendChild(updateCard);
            }

            // Add click handler
            const installBtn = document.getElementById('installUpdateFromBanner');
            if (installBtn) {
                installBtn.addEventListener('click', () => {
                    if (window.pwaUpdateManager) {
                        window.pwaUpdateManager.installUpdate();
                    }
                });
            }
        }
    }

    hideUpdateBanner() {
        const updateCard = document.getElementById('updateNotificationCard');
        if (updateCard) {
            updateCard.remove();
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new UpdateUIManager();
});
