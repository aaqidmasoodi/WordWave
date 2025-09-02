class SettingsManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateAppInfo();
        this.calculateStorageUsage();
    }

    setupEventListeners() {
        // Check for updates button
        const checkUpdatesBtn = document.getElementById('checkUpdatesBtn');
        if (checkUpdatesBtn) {
            checkUpdatesBtn.addEventListener('click', () => {
                this.checkForUpdates();
            });
        }

        // Reset progress button
        const resetProgressBtn = document.getElementById('resetProgressBtn');
        if (resetProgressBtn) {
            resetProgressBtn.addEventListener('click', () => {
                this.resetProgress();
            });
        }
    }

    async checkForUpdates() {
        const btn = document.getElementById('checkUpdatesBtn');
        const status = document.getElementById('updateStatus');
        const message = document.getElementById('updateMessage');

        // Show checking status
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i>';
        status.classList.remove('d-none', 'alert-success', 'alert-warning');
        status.classList.add('alert-info');
        message.textContent = 'Checking...';

        try {
            // Actually check for updates using service worker
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    await registration.update();
                    
                    // Check if there's a waiting service worker (new version)
                    if (registration.waiting) {
                        // Update found - show updating status
                        status.classList.remove('alert-info');
                        status.classList.add('alert-warning');
                        message.innerHTML = 'Update found! Updating...';
                        btn.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i>';
                        
                        // Apply update automatically
                        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                        
                        // Clear update indicators
                        this.clearUpdateIndicators();
                        
                        // Wait a moment then reload
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                        
                    } else {
                        // No update - show up to date
                        status.classList.remove('alert-info');
                        status.classList.add('alert-success');
                        message.innerHTML = 'Up to date!';
                        
                        btn.disabled = false;
                        btn.innerHTML = '<i class="bi bi-search"></i>';
                        
                        // Hide status after 3 seconds
                        setTimeout(() => {
                            status.classList.add('d-none');
                        }, 3000);
                    }
                } else {
                    throw new Error('No service worker registration found');
                }
            } else {
                throw new Error('Service worker not available');
            }
            
        } catch (error) {
            console.error('Error checking for updates:', error);
            status.classList.remove('alert-info');
            status.classList.add('alert-warning');
            message.textContent = 'Check failed';
            
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-search"></i>';
            
            // Hide status after 3 seconds
            setTimeout(() => {
                status.classList.add('d-none');
            }, 3000);
        }
    }

    async resetProgress() {
        const btn = document.getElementById('resetProgressBtn');
        
        if (confirm('Are you sure you want to reset your learning progress? This will clear all your progress, streaks, and learned words. This cannot be undone.')) {
            btn.disabled = true;
            btn.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i>';
            
            try {
                // Only clear user progress data, keep cache intact
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('wordwave_')) {
                        keysToRemove.push(key);
                    }
                }
                
                // Remove user data keys
                keysToRemove.forEach(key => localStorage.removeItem(key));
                
                // Reset app state if available
                if (window.app && window.app.state) {
                    window.app.state.reset();
                }
                
                setTimeout(() => {
                    btn.innerHTML = '<i class="bi bi-check"></i>';
                    setTimeout(() => {
                        btn.disabled = false;
                        btn.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
                        // Redirect to home to restart fresh
                        window.location.href = '/';
                    }, 1000);
                }, 1000);
                
            } catch (error) {
                console.error('Error resetting progress:', error);
                btn.disabled = false;
                btn.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
            }
        }
    }

    updateAppInfo() {
        // Check if app is installed
        const installType = document.getElementById('installType');
        if (installType) {
            const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                              window.navigator.standalone === true;
            installType.textContent = isInstalled ? 'Installed PWA' : 'Web Browser';
        }

        // Set last updated date
        const lastUpdated = document.getElementById('lastUpdated');
        if (lastUpdated) {
            const today = new Date().toLocaleDateString();
            lastUpdated.textContent = today;
        }
    }

    async calculateStorageUsage() {
        const storageElement = document.getElementById('storageUsed');
        if (!storageElement) return;

        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                const usedMB = (estimate.usage / (1024 * 1024)).toFixed(1);
                storageElement.textContent = `${usedMB} MB`;
            } else {
                storageElement.textContent = 'Unknown';
            }
        } catch (error) {
            console.error('Error calculating storage:', error);
            storageElement.textContent = 'Unknown';
        }
    }

    clearUpdateIndicators() {
        // Remove badge from settings link
        const updateBadge = document.querySelector('.update-badge');
        if (updateBadge) {
            updateBadge.remove();
        }

        // Reset check button style
        const checkBtn = document.getElementById('checkUpdatesBtn');
        if (checkBtn) {
            checkBtn.classList.remove('btn-success');
            checkBtn.classList.add('btn-outline-primary');
            checkBtn.title = '';
        }
    }
}

// Initialize settings when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});

// Add CSS for spinning animation
const style = document.createElement('style');
style.textContent = `
    .spin {
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
