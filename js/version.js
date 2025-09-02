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
            return '1.0.0'; // Fallback version
        } catch (error) {
            console.error('Error getting version:', error);
            return '1.0.0';
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
}

// Auto-update version displays when page loads
document.addEventListener('DOMContentLoaded', () => {
    VersionManager.updateVersionDisplays();
});
