// Proper OneSignal Integration
class OneSignalNotificationManager {
    constructor() {
        this.appId = '5bca53ce-c039-480f-b9e9-c09771bb33c3';
        this.initialized = false;
        this.subscribed = false;
        this.connected = false;
        this.userId = null;
        this.init();
    }

    async init() {
        console.log('🔄 Initializing OneSignal...');
        
        // Wait for OneSignal to load
        let attempts = 0;
        while (typeof OneSignal === 'undefined' && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }

        if (typeof OneSignal === 'undefined') {
            console.error('❌ OneSignal failed to load');
            this.updateConnectionStatus(false);
            return;
        }

        try {
            await OneSignal.init({
                appId: this.appId,
                allowLocalhostAsSecureOrigin: true,
                autoRegister: false,
                autoResubscribe: true,
                notifyButton: { enable: false },
                welcomeNotification: {
                    disable: false,
                    title: "Thanks for subscribing!",
                    message: "You'll now receive study reminders and updates from WordWave! 📚"
                },
                promptOptions: {
                    slidedown: {
                        prompts: [
                            {
                                type: "push",
                                autoPrompt: false,
                                text: {
                                    actionMessage: "We'd like to show you notifications for study reminders and progress updates.",
                                    acceptButton: "Allow",
                                    cancelButton: "No Thanks"
                                }
                            }
                        ]
                    }
                }
            });

            this.setupEventListeners();
            this.initialized = true;
            this.connected = true;
            
            // Check current subscription status
            this.subscribed = OneSignal.User.PushSubscription.optedIn;
            this.userId = OneSignal.User.onesignalId;
            
            console.log('✅ OneSignal initialized');
            console.log('📱 Subscribed:', this.subscribed);
            console.log('🆔 User ID:', this.userId);
            
            this.updateConnectionStatus(true);
            this.updateUI();

        } catch (error) {
            console.error('❌ OneSignal initialization failed:', error);
            this.updateConnectionStatus(false);
        }
    }

    setupEventListeners() {
        // Subscription state changes
        OneSignal.User.PushSubscription.addEventListener('change', (event) => {
            console.log('🔔 Subscription changed:', event);
            this.subscribed = event.current.optedIn;
            this.userId = OneSignal.User.onesignalId;
            
            if (this.subscribed) {
                console.log('✅ User subscribed! ID:', this.userId);
                this.setUserTags();
            } else {
                console.log('❌ User unsubscribed');
            }
            
            this.updateUI();
        });

        // Notification received
        OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
            console.log('📱 Notification received:', event);
        });

        // Notification clicked
        OneSignal.Notifications.addEventListener('click', (event) => {
            console.log('👆 Notification clicked:', event);
            this.handleNotificationClick(event);
        });
    }

    async requestPermission() {
        if (!this.initialized) {
            console.log('⏳ OneSignal not ready yet');
            return false;
        }

        try {
            console.log('🔔 Requesting permission...');
            const permission = await OneSignal.Notifications.requestPermission();
            
            if (permission) {
                console.log('✅ Permission granted');
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
        if (!this.initialized) return;

        try {
            await OneSignal.User.PushSubscription.optOut();
            this.subscribed = false;
            console.log('🔕 Unsubscribed');
        } catch (error) {
            console.error('❌ Unsubscribe failed:', error);
        }
    }

    setUserTags() {
        if (!this.subscribed) return;

        const userData = window.appState?.getUserData();
        const tags = {
            app_name: 'WordWave',
            difficulty_level: userData?.currentDifficulty || 'beginner',
            words_learned: userData?.learnedWords?.length || 0,
            streak_count: userData?.streakCount || 0,
            last_study_date: userData?.lastStudyDate || 'never',
            device_type: this.getDeviceType(),
            subscription_date: new Date().toISOString(),
            app_version: '5.9.3'
        };

        OneSignal.User.addTags(tags);
        console.log('🏷️ User tags set:', tags);
    }

    getDeviceType() {
        const ua = navigator.userAgent;
        if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
        if (/Android/.test(ua)) return 'Android';
        return 'Web';
    }

    handleNotificationClick(event) {
        const data = event.notification.additionalData;
        
        if (data?.action) {
            switch (data.action) {
                case 'practice':
                    window.location.href = '/flashcards.html';
                    break;
                case 'quiz':
                    window.location.href = '/quiz.html';
                    break;
                case 'progress':
                    window.location.href = '/progress.html';
                    break;
                default:
                    window.location.href = '/';
            }
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

        if (this.subscribed) {
            statusText.textContent = `✅ Connected! User ID: ${this.userId?.substring(0, 8)}...`;
            statusDiv.className = 'alert alert-success';
            statusDiv.classList.remove('d-none');
        } else if (!this.initialized) {
            statusText.textContent = 'Initializing OneSignal...';
            statusDiv.className = 'alert alert-info';
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
