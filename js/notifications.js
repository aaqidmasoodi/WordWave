// OneSignal Integration with Merged Service Worker
class OneSignalNotificationManager {
    constructor() {
        this.appId = '5bca53ce-c039-480f-b9e9-c09771bb33c3';
        this.initialized = false;
        this.subscribed = false;
        this.connected = false;
        this.userId = null;
        
        this.loadState();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (typeof OneSignal === 'undefined' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }

        if (typeof OneSignal === 'undefined') {
            this.handleInitFailure();
            return;
        }

        try {
            await OneSignal.init({
                appId: this.appId,
                allowLocalhostAsSecureOrigin: true,
                autoRegister: false,
                autoResubscribe: true,
                notifyButton: { enable: false },
                // Use our merged service worker
                serviceWorkerPath: 'sw.js',
                serviceWorkerParam: { scope: '/' },
                welcomeNotification: {
                    disable: false,
                    title: "Thanks for subscribing to WordWave!",
                    message: "You'll receive study reminders! 📚"
                }
            });

            OneSignal.User.PushSubscription.addEventListener('change', (event) => {
                this.subscribed = event.current.optedIn;
                this.userId = OneSignal.User.onesignalId;
                this.saveState();
                this.updateUI();
                
                if (this.subscribed) {
                    this.setUserTags();
                }
            });

            this.initialized = true;
            this.connected = true;
            this.subscribed = OneSignal.User.PushSubscription.optedIn;
            this.userId = OneSignal.User.onesignalId;
            
            this.saveState();
            this.updateConnectionStatus(true);
            this.updateUI();

        } catch (error) {
            console.error('OneSignal init failed:', error);
            this.handleInitFailure();
        }
    }

    handleInitFailure() {
        this.initialized = true;
        this.connected = false;
        this.subscribed = false;
        this.saveState();
        this.updateConnectionStatus(false);
        this.updateUI();
    }

    async requestPermission() {
        if (!this.initialized || !this.connected) {
            return false;
        }

        try {
            const permission = await OneSignal.Notifications.requestPermission();
            
            if (permission) {
                await OneSignal.User.PushSubscription.optIn();
                this.subscribed = true;
                this.userId = OneSignal.User.onesignalId;
                this.saveState();
                this.setUserTags();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Permission request failed:', error);
            return false;
        }
    }

    async unsubscribe() {
        if (!this.initialized || !this.connected) {
            this.subscribed = false;
            this.saveState();
            return;
        }

        try {
            await OneSignal.User.PushSubscription.optOut();
            this.subscribed = false;
            this.saveState();
        } catch (error) {
            console.error('Unsubscribe failed:', error);
        }
    }

    setUserTags() {
        if (!this.subscribed || !this.connected) return;

        try {
            const userData = window.appState?.getUserData();
            const tags = {
                app_name: 'WordWave',
                difficulty_level: userData?.currentDifficulty || 'beginner',
                words_learned: userData?.learnedWords?.length || 0,
                streak_count: userData?.streakCount || 0,
                device_type: /iPhone|iPad|iPod/.test(navigator.userAgent) ? 'iOS' : /Android/.test(navigator.userAgent) ? 'Android' : 'Web',
                app_version: '6.0.3'
            };

            OneSignal.User.addTags(tags);
        } catch (error) {
            console.error('Failed to set user tags:', error);
        }
    }

    updateConnectionStatus(connected) {
        this.connected = connected;
        const indicator = document.getElementById('notificationIndicator');
        
        if (indicator) {
            if (connected && this.subscribed) {
                indicator.className = 'notification-indicator connected';
                indicator.title = 'Notifications enabled';
            } else {
                indicator.className = 'notification-indicator disconnected';
                indicator.title = 'Notifications disabled';
            }
        }
    }

    updateUI() {
        const toggle = document.getElementById('pushNotifications');
        const statusDiv = document.getElementById('notificationStatus');

        if (!toggle) return;

        toggle.checked = this.subscribed;

        if (statusDiv) {
            statusDiv.classList.add('d-none');
        }

        this.updateConnectionStatus(this.connected);
    }

    saveState() {
        const state = {
            subscribed: this.subscribed,
            connected: this.connected,
            userId: this.userId,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('wordwave_notifications_state', JSON.stringify(state));
    }

    loadState() {
        try {
            const saved = localStorage.getItem('wordwave_notifications_state');
            if (saved) {
                const state = JSON.parse(saved);
                this.subscribed = state.subscribed || false;
                this.connected = state.connected || false;
                this.userId = state.userId || null;
            }
        } catch (error) {
            // Silent fail
        }
    }

    isSubscribed() {
        return this.subscribed;
    }

    isConnected() {
        return this.connected;
    }

    getStatus() {
        return {
            initialized: this.initialized,
            connected: this.connected,
            subscribed: this.subscribed,
            userId: this.userId
        };
    }
}

window.notificationManager = new OneSignalNotificationManager();
