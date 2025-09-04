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
            console.log('🔄 Initializing OneSignal with combined service worker...');
            
            await OneSignal.init({
                appId: this.appId,
                allowLocalhostAsSecureOrigin: true,
                autoRegister: false,
                autoResubscribe: true,
                notifyButton: { enable: false },
                // Use our combined service worker (sw.js contains both PWA and OneSignal functionality)
                serviceWorkerPath: 'sw.js',
                serviceWorkerParam: { scope: '/' },
                welcomeNotification: {
                    disable: false,
                    title: "Thanks for subscribing to WordWave!",
                    message: "You'll receive study reminders! 📚"
                }
            });

            console.log('✅ OneSignal initialized successfully with combined service worker');

            OneSignal.User.PushSubscription.addEventListener('change', (event) => {
                console.log('📱 Subscription status changed:', event.current.optedIn);
                this.subscribed = event.current.optedIn;
                this.userId = OneSignal.User.onesignalId;
                console.log('🆔 User ID:', this.userId);
                this.saveState();
                this.updateUI();
                
                // Only set tags after subscription is stable
                if (this.subscribed) {
                    console.log('⏰ Scheduling tag update in 3 seconds...');
                    setTimeout(() => this.setUserTags(), 3000);
                }
            });

            this.initialized = true;
            this.connected = true;
            this.subscribed = OneSignal.User.PushSubscription.optedIn;
            this.userId = OneSignal.User.onesignalId;
            
            console.log('🚀 OneSignal fully initialized');
            console.log('📊 Status - Connected:', this.connected, 'Subscribed:', this.subscribed);
            console.log('🆔 Current User ID:', this.userId);
            
            this.saveState();
            this.updateConnectionStatus(true);
            this.updateUI();

            // Set tags after initialization is complete and stable
            if (this.subscribed) {
                console.log('⏰ Scheduling initial tag update in 5 seconds...');
                setTimeout(() => this.setUserTags(), 5000);
            }

        } catch (error) {
            console.error('❌ OneSignal initialization failed:', error);
            this.handleInitFailure();
        }
    }

    handleInitFailure() {
        console.warn('⚠️ OneSignal initialization failed - falling back to local state');
        this.initialized = true;
        this.connected = false;
        this.subscribed = false;
        this.saveState();
        this.updateConnectionStatus(false);
        this.updateUI();
        console.log('📱 Notification system running in offline mode');
    }

    async requestPermission() {
        if (!this.initialized || !this.connected) {
            console.warn('⚠️ Cannot request permission - OneSignal not initialized or connected');
            return false;
        }

        try {
            console.log('🔔 Requesting notification permission...');
            const permission = await OneSignal.Notifications.requestPermission();
            console.log('📋 Permission result:', permission);
            
            if (permission) {
                console.log('✅ Permission granted, opting in...');
                await OneSignal.User.PushSubscription.optIn();
                this.subscribed = true;
                this.userId = OneSignal.User.onesignalId;
                console.log('🆔 New User ID:', this.userId);
                this.saveState();
                this.setUserTags();
                console.log('✅ Successfully subscribed to notifications');
                return true;
            } else {
                console.log('❌ Permission denied');
            }
            return false;
        } catch (error) {
            console.error('❌ Permission request failed:', error);
            return false;
        }
    }

    async unsubscribe() {
        if (!this.initialized || !this.connected) {
            console.log('📱 Unsubscribing locally (OneSignal not connected)');
            this.subscribed = false;
            this.saveState();
            return;
        }

        try {
            console.log('📱 Unsubscribing from OneSignal...');
            await OneSignal.User.PushSubscription.optOut();
            this.subscribed = false;
            this.saveState();
            console.log('✅ Successfully unsubscribed');
        } catch (error) {
            console.error('❌ Unsubscribe failed:', error);
        }
    }

    setUserTags() {
        if (!this.subscribed || !this.connected) {
            console.log('⏭️ Skipping tag update - not subscribed or connected');
            return;
        }

        try {
            const userData = window.appState?.getUserData();
            const tags = {
                app_name: 'WordWave',
                difficulty_level: userData?.currentDifficulty || 'beginner',
                words_learned: userData?.learnedWords?.length || 0,
                streak_count: userData?.streakCount || 0,
                device_type: /iPhone|iPad|iPod/.test(navigator.userAgent) ? 'iOS' : /Android/.test(navigator.userAgent) ? 'Android' : 'Web',
                app_version: '6.0.7'
            };

            console.log('🏷️ Setting user tags:', tags);

            // Add delay to avoid conflicts during initialization
            setTimeout(() => {
                OneSignal.User.addTags(tags).then(() => {
                    console.log('✅ User tags updated successfully');
                }).catch(error => {
                    // Silent fail for tag conflicts - not critical
                    console.debug('⚠️ Tag update failed (non-critical):', error.message);
                });
            }, 2000);
        } catch (error) {
            // Silent fail for tag setting
            console.debug('⚠️ Failed to set user tags (non-critical):', error.message);
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
