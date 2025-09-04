console.log('🔧 Install detector script loaded');

// Install Detection for WordWave PWA
class InstallDetector {
    constructor() {
        console.log('🔧 InstallDetector constructor called');
        this.init();
    }

    init() {
        const isMobile = this.isMobileDevice();
        const isInstalled = this.isInstalled();
        const isInstallPage = this.isInstallPage();
        
        console.log('🔍 Install Detection:', {
            isMobile,
            isInstalled,
            isInstallPage,
            userAgent: navigator.userAgent
        });
        
        // Only redirect mobile devices to install page
        if (isMobile && !isInstalled && !isInstallPage) {
            this.redirectToInstallPage();
        } else {
            console.log('✅ Allowing direct app access');
        }
    }

    isMobileDevice() {
        // Check if device is mobile (phone/tablet)
        return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
        console.log('📱 Redirecting mobile device to install page');
        window.location.href = 'install-banner.html';
    }

    // Method to bypass install check (for testing)
    bypassInstallCheck() {
        localStorage.setItem('wordwave_bypass_install', 'true');
        console.log('🔓 Install check bypassed');
    }
}

// Initialize install detector
if (typeof window !== 'undefined') {
    console.log('🔧 Creating InstallDetector instance');
    window.installDetector = new InstallDetector();
}
