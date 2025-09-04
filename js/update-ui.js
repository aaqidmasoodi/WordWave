// Update UI Manager - Handles UI updates based on localStorage flags
class UpdateUIManager {
    constructor() {
        this.init();
    }

    init() {
        // Check for updates on page load
        this.checkAndShowUpdateUI();
        
        // Listen for storage changes (in case update flag is set from another tab)
        window.addEventListener('storage', (e) => {
            if (e.key === 'wordwave_update_available') {
                this.checkAndShowUpdateUI();
            }
        });
        
        // Listen for updateAvailable event from PWA manager
        window.addEventListener('updateAvailable', () => {
            this.checkAndShowUpdateUI();
        });
        
        // Listen for controllerchange to hide UI when update is installed
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                this.hideUpdateIndicators();
            });
        }
    }

    checkAndShowUpdateUI() {
        const updateAvailable = localStorage.getItem('wordwave_update_available') === 'true';
        
        if (updateAvailable) {
            this.showUpdateIndicators();
        } else {
            this.hideUpdateIndicators();
        }
    }

    showUpdateIndicators() {
        // Show red badge on settings link
        this.showSettingsBadge();
        
        // Show dashboard notification if on home page
        this.showDashboardNotification();
        
        // Update settings page if on settings
        this.updateSettingsPage();
    }

    hideUpdateIndicators() {
        // Remove all update indicators
        this.removeSettingsBadge();
        this.removeDashboardNotification();
        this.resetSettingsPage();
    }

    showSettingsBadge() {
        const settingsLink = document.querySelector('a[href="settings.html"]');
        if (settingsLink && !settingsLink.querySelector('.update-badge')) {
            const badge = document.createElement('span');
            badge.className = 'update-badge badge bg-danger ms-2';
            badge.style.fontSize = '0.6rem';
            badge.textContent = '1';
            settingsLink.appendChild(badge);
        }
    }

    removeSettingsBadge() {
        const updateBadge = document.querySelector('.update-badge');
        if (updateBadge) {
            updateBadge.remove();
        }
    }

    showDashboardNotification() {
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
                        <a href="settings.html" class="btn btn-light btn-sm px-3 py-2 rounded-pill fw-semibold">
                            Update
                        </a>
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
        }
    }

    removeDashboardNotification() {
        const updateCard = document.getElementById('updateNotificationCard');
        if (updateCard) {
            updateCard.remove();
        }
    }

    updateSettingsPage() {
        // Show "1 update available" text
        const updateAvailable = document.getElementById('updateAvailable');
        if (updateAvailable) {
            updateAvailable.classList.remove('d-none');
        }

        // Show install update button
        const installBtn = document.getElementById('installUpdateBtn');
        if (installBtn) {
            installBtn.classList.remove('d-none');
        }

        // Update check button style
        const checkBtn = document.getElementById('checkUpdatesBtn');
        if (checkBtn) {
            checkBtn.classList.remove('btn-outline-primary');
            checkBtn.classList.add('btn-success');
            checkBtn.innerHTML = '<i class="bi bi-check-circle"></i>';
            checkBtn.title = 'Update available';
        }
    }

    resetSettingsPage() {
        // Hide "1 update available" text
        const updateAvailable = document.getElementById('updateAvailable');
        if (updateAvailable) {
            updateAvailable.classList.add('d-none');
        }

        // Hide install update button
        const installBtn = document.getElementById('installUpdateBtn');
        if (installBtn) {
            installBtn.classList.add('d-none');
        }

        // Reset check button style
        const checkBtn = document.getElementById('checkUpdatesBtn');
        if (checkBtn) {
            checkBtn.classList.remove('btn-success');
            checkBtn.classList.add('btn-outline-primary');
            checkBtn.innerHTML = '<i class="bi bi-search"></i>';
            checkBtn.title = '';
        }
    }

    // Method to clear update flag (called after successful update)
    static clearUpdateFlag() {
        localStorage.removeItem('wordwave_update_available');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new UpdateUIManager();
});
