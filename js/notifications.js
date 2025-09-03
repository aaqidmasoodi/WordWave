// Simple OneSignal Integration - FIXED
class OneSignalNotificationManager {
    constructor() {
        this.appId = '5bca53ce-c039-480f-b9e9-c09771bb33c3';
        this.initialized = false;
        this.subscribed = false;
        this.connected = false;
        this.userId = null;
        
        // Wait for DOM to be ready, then initialize
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        console.log('🔄 Initializing OneSignal...');
        
        // Wait for OneSignal to be available - much longer timeout
        let attempts = 0;
        const maxAttempts = 100; // 20 seconds total
        
        while (typeof OneSignal === 'undefined' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
            
            if (attempts % 10 === 0) {
                console.log(`⏳ Still waiting for OneSignal... attempt ${attempts}/${maxAttempts}`);
            }
        }

        if (typeof OneSignal === 'undefined') {
            console.error('❌ OneSignal not available after 20 seconds');
            this.updateConnectionStatus(false);
            this.initialized = true; // Mark as initialized to prevent hanging
            return;
        }

        try {
            console.log('🚀 OneSignal found! Initializing...');
            
            await OneSignal.init({
                appId: this.appId,
                allowLocalhostAsSecureOrigin: true,
                autoRegister: false,
                autoResubscribe: true,
                notifyButton: { enable: false },
                welcomeNotification: {
                    disable: false,
                    title: "Thanks for subscribing to WordWave!",
                    message: "You'll receive study reminders and progress updates! 📚"
                }
            });

            // Set up event listeners
            OneSignal.User.PushSubscription.addEventListener('change', (event) => {
                console.log('🔔 Subscription changed:', event);
                this.subscribed = event.current.optedIn;
                this.userId = OneSignal.User.onesignalId;
                this.updateUI();
                
                if (this.subscribed) {
                    this.setUserTags();
                }
            });

            this.initialized = true;
            this.connected = true;
            
            // Check current status
            this.subscribed = OneSignal.User.PushSubscription.optedIn;
            this.userId = OneSignal.User.onesignalId;
            
            console.log('✅ OneSignal initialized successfully!');
            console.log('📱 Current subscription status:', this.subscribed);
            console.log('🆔 User ID:', this.userId);
            
            this.updateConnectionStatus(true);
            this.updateUI();

        } catch (error) {
            console.error('❌ OneSignal initialization error:', error);
            this.updateConnectionStatus(false);
            this.initialized = true;
        }
    }

    async requestPermission() {
        if (!this.initialized || !this.connected) {
            console.log('⏳ OneSignal not ready');
            return false;
        }

        try {
            console.log('🔔 Requesting notification permission...');
            const permission = await OneSignal.Notifications.requestPermission();
            
            if (permission) {
                console.log('✅ Permission granted!');
                await OneSignal.User.PushSubscription.optIn();
                this.subscribed = true;
                this.userId = OneSignal.User.onesignalId;
                this.setUserTags();
                return true;
            } else {
                console.log('❌ Permission denied');
                return false;
            }
        } catch (error) {
            console.error('❌ Permission request failed:', error);
            return false;
        }
    }

    async unsubscribe() {
        if (!this.initialized || !this.connected) return;

        try {
            await OneSignal.User.PushSubscription.optOut();
            this.subscribed = false;
            console.log('🔕 Unsubscribed successfully');
        } catch (error) {
            console.error('❌ Unsubscribe failed:', error);
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
                subscription_date: new Date().toISOString(),
                app_version: '5.9.7'
            };

            OneSignal.User.addTags(tags);
            console.log('🏷️ User tags set:', tags);
        } catch (error) {
            console.error('❌ Failed to set user tags:', error);
        }
    }

    updateConnectionStatus(connected) {
        this.connected = connected;
        const indicator = document.getElementById('notificationIndicator');
        
        if (indicator) {
            if (connected) {
                indicator.className = 'notification-indicator connected';
                indicator.title = 'Connected to OneSignal';
            } else {
                indicator.className = 'notification-indicator disconnected';
                indicator.title = 'Not connected to OneSignal';
            }
        }
    }

    updateUI() {
        const toggle = document.getElementById('pushNotifications');
        const statusDiv = document.getElementById('notificationStatus');
        const statusText = document.getElementById('statusText');

        if (!toggle) return;

        toggle.checked = this.subscribed;

        if (this.subscribed && this.userId) {
            statusText.textContent = `✅ Connected! User ID: ${this.userId.substring(0, 8)}...`;
            statusDiv.className = 'alert alert-success';
            statusDiv.classList.remove('d-none');
        } else if (!this.initialized) {
            statusText.textContent = 'Initializing OneSignal...';
            statusDiv.className = 'alert alert-info';
            statusDiv.classList.remove('d-none');
        } else if (!this.connected) {
            statusText.textContent = 'OneSignal connection failed';
            statusDiv.className = 'alert alert-danger';
            statusDiv.classList.remove('d-none');
        } else if (Notification.permission === 'denied') {
            statusText.textContent = 'Notifications blocked. Enable in browser settings.';
            statusDiv.className = 'alert alert-warning';
            statusDiv.classList.remove('d-none');
        } else {
            statusDiv.classList.add('d-none');
        }
    }

    // Public API
    isSubscribed() {
        return this.subscribed;
    }

    isConnected() {
        return this.connected;
    }

    getUserId() {
        return this.userId;
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

// Initialize
window.notificationManager = new OneSignalNotificationManager();
