// Install Detection for WordWave PWA
class InstallDetector {
    constructor() {
        this.init();
    }

    init() {
        // Check if app is installed on page load
        if (!this.isInstalled() && !this.isInstallPage()) {
            this.redirectToInstallPage();
        }
    }

    isInstalled() {
        // Check if running in standalone mode (installed PWA)
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone === true;
    }

    isInstallPage() {
        // Check if we're already on the install page
        return window.location.pathname.includes('install-banner.html');
    }

    redirectToInstallPage() {
        // Redirect to install banner
        console.log('🔄 Redirecting to install page - PWA not detected');
        window.location.href = 'install-banner.html';
    }

    // Method to bypass install check (for testing)
    bypassInstallCheck() {
        localStorage.setItem('wordwave_bypass_install', 'true');
        console.log('🔓 Install check bypassed');
    }

    // Check if install check is bypassed
    isInstallBypassed() {
        return localStorage.getItem('wordwave_bypass_install') === 'true';
    }
}

// Initialize install detector
if (typeof window !== 'undefined') {
    window.installDetector = new InstallDetector();
}
