// Splash Screen Manager
class SplashScreen {
    constructor() {
        this.splashElement = document.getElementById('splashScreen');
        this.minDisplayTime = 2000; // Minimum 2 seconds
        this.startTime = Date.now();
        this.init();
    }

    init() {
        // Show splash screen immediately
        this.show();
        
        // Wait for app to be ready and minimum display time
        Promise.all([
            this.waitForAppReady(),
            this.waitForMinimumTime()
        ]).then(() => {
            this.hide();
        });
    }

    show() {
        if (this.splashElement) {
            this.splashElement.classList.remove('fade-out');
            document.body.classList.add('splash-active');
        }
    }

    hide() {
        if (this.splashElement) {
            this.splashElement.classList.add('fade-out');
            document.body.classList.remove('splash-active');
            
            // Remove splash screen from DOM after animation
            setTimeout(() => {
                if (this.splashElement && this.splashElement.parentNode) {
                    this.splashElement.remove();
                }
            }, 500);
        }
    }

    waitForMinimumTime() {
        const elapsed = Date.now() - this.startTime;
        const remaining = Math.max(0, this.minDisplayTime - elapsed);
        return new Promise(resolve => setTimeout(resolve, remaining));
    }

    waitForAppReady() {
        return new Promise(resolve => {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    // Static method to check if we should show splash (for PWA detection)
    static shouldShow() {
        // Show splash if:
        // 1. It's a PWA (standalone mode)
        // 2. Or it's the first load in a session
        const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                     window.navigator.standalone === true;
        
        const isFirstLoad = !sessionStorage.getItem('appLoaded');
        
        if (isFirstLoad) {
            sessionStorage.setItem('appLoaded', 'true');
        }
        
        return isPWA || isFirstLoad;
    }
}

// Initialize splash screen if it should be shown
if (SplashScreen.shouldShow()) {
    // Start splash screen immediately
    document.addEventListener('DOMContentLoaded', () => {
        new SplashScreen();
    });
} else {
    // Remove splash screen elements if not needed
    document.addEventListener('DOMContentLoaded', () => {
        const splash = document.getElementById('splashScreen');
        if (splash) {
            splash.remove();
        }
        document.body.classList.remove('splash-active');
    });
}
