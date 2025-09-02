// Version Manager - Dynamically get version from service worker
class VersionManager {
    static async getVersion() {
        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration && registration.active) {
                    // Get cache names to extract version
                    const cacheNames = await caches.keys();
                    const wordwaveCache = cacheNames.find(name => name.startsWith('wordwave-v'));
                    
                    if (wordwaveCache) {
                        // Extract version from cache name (e.g., 'wordwave-v5.0.1' -> '5.0.1')
                        const version = wordwaveCache.replace('wordwave-v', '');
                        return version;
                    }
                }
            }
            return '5.2.0'; // Current version fallback
        } catch (error) {
            console.error('Error getting version:', error);
            return '5.2.0';
        }
    }

    static async updateVersionDisplays() {
        const version = await this.getVersion();
        
        // Update all version displays
        const versionElements = document.querySelectorAll('[data-version]');
        versionElements.forEach(element => {
            element.textContent = `Version ${version}`;
        });

        // Update specific elements by ID
        const versionSpans = document.querySelectorAll('.app-version');
        versionSpans.forEach(span => {
            span.textContent = version;
        });
    }

    static showUpdateNotification(newVersion) {
        // Show update notification that slides from under navbar
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.style.cssText = `
            position: fixed;
            top: 60px;
            left: 0;
            right: 0;
            width: 100%;
            background: #198754;
            color: white;
            padding: 12px 20px;
            z-index: 9999;
            transform: translateY(-100%);
            transition: transform 0.3s ease-in-out;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;
        
        notification.innerHTML = `
            <div class="d-flex align-items-center justify-content-center">
                <i class="bi bi-check-circle me-2"></i>
                <span><strong>Updated to v${newVersion}!</strong> App is now up to date.</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
        }, 100);
        
        // Slide out and remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateY(-100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    static checkForUpdates() {
        // Check if we just updated
        const lastVersion = localStorage.getItem('wordwave_last_version');
        const currentVersion = this.getVersion();
        
        currentVersion.then(version => {
            if (lastVersion && lastVersion !== version) {
                // We updated! Show notification
                this.showUpdateNotification(version);
            }
            // Store current version
            localStorage.setItem('wordwave_last_version', version);
        });
    }
}

// Auto-update version displays when page loads
document.addEventListener('DOMContentLoaded', () => {
    VersionManager.updateVersionDisplays();
    // Removed automatic update checking - users should control updates
});
