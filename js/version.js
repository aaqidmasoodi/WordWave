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
            return '5.0.3'; // Current version fallback
        } catch (error) {
            console.error('Error getting version:', error);
            return '5.0.3';
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
        // Show temporary update notification
        const notification = document.createElement('div');
        notification.className = 'position-fixed top-0 start-50 translate-middle-x mt-3';
        notification.style.zIndex = '10000';
        notification.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show shadow" role="alert">
                <i class="bi bi-check-circle me-2"></i>
                <strong>Updated to v${newVersion}!</strong> App is now up to date.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
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
    VersionManager.checkForUpdates();
});
