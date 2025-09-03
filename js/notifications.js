// Simple OneSignal Notification System
class SimpleNotificationManager {
    constructor() {
        this.appId = '5bca53ce-c039-480f-b9e9-c09771bb33c3';
        this.initialized = false;
        this.subscribed = false;
        this.init();
    }

    async init() {
        // Wait for OneSignal
        let attempts = 0;
        while (typeof OneSignal === 'undefined' && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }

        if (typeof OneSignal === 'undefined') {
            console.log('OneSignal not available');
            this.initialized = true;
            return;
        }

        try {
            await OneSignal.init({
                appId: this.appId,
                allowLocalhostAsSecureOrigin: true,
                autoRegister: false
            });

            // Check if already subscribed
            this.subscribed = OneSignal.User.PushSubscription.optedIn;
            this.initialized = true;
            
            console.log('OneSignal initialized, subscribed:', this.subscribed);
        } catch (error) {
            console.error('OneSignal init failed:', error);
            this.initialized = true;
        }
    }

    async requestPermission() {
        if (!this.initialized || typeof OneSignal === 'undefined') {
            return false;
        }

        try {
            const permission = await OneSignal.Notifications.requestPermission();
            if (permission) {
                await OneSignal.User.PushSubscription.optIn();
                this.subscribed = true;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Permission request failed:', error);
            return false;
        }
    }

    async unsubscribe() {
        if (!this.initialized || typeof OneSignal === 'undefined') {
            this.subscribed = false;
            return;
        }

        try {
            await OneSignal.User.PushSubscription.optOut();
            this.subscribed = false;
        } catch (error) {
            console.error('Unsubscribe failed:', error);
        }
    }

    isSubscribed() {
        if (typeof OneSignal !== 'undefined' && this.initialized) {
            return OneSignal.User.PushSubscription.optedIn;
        }
        return this.subscribed;
    }
}

// Initialize
window.notificationManager = new SimpleNotificationManager();
