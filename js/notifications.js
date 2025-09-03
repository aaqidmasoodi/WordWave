// js/notifications.js - OneSignal Push Notifications

class NotificationManager {
    constructor() {
        this.appId = '5bca53ce-c039-480f-b9e9-c09771bb33c3'; // Replace with your OneSignal App ID
        this.initialized = false;
        this.useFallback = false;
        this.userId = null;
    }

    async init() {
        if (this.initialized) return;

        // Wait for OneSignal to be available
        let attempts = 0;
        while (typeof OneSignal === 'undefined' && window.oneSignalLoaded !== false && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (typeof OneSignal === 'undefined' || window.oneSignalLoaded === false) {
            console.error('❌ OneSignal failed to load after 5 seconds');
            console.log('📱 Notifications will use browser fallback only');
            this.useFallback = true;
            this.initialized = true; // Mark as initialized to allow fallback methods
            return;
        }

        try {
            await OneSignal.init({
                appId: this.appId,
                safari_web_id: 'web.onesignal.auto.YOUR_SAFARI_WEB_ID', // Optional for Safari
                allowLocalhostAsSecureOrigin: true, // For development
                autoRegister: false, // We'll handle registration manually
                autoResubscribe: true,
                notifyButton: {
                    enable: false // We'll use custom UI
                }
            });

            this.initialized = true;
            console.log('✅ OneSignal initialized');

            // Set up event listeners
            this.setupEventListeners();

        } catch (error) {
            console.error('❌ OneSignal initialization failed:', error);
        }
    }

    setupEventListeners() {
        // User subscription changed
        OneSignal.User.PushSubscription.addEventListener('change', (event) => {
            console.log('🔔 Push subscription changed:', event);
            this.userId = OneSignal.User.onesignalId;
            this.saveUserPreferences();
        });

        // Notification clicked
        OneSignal.Notifications.addEventListener('click', (event) => {
            console.log('👆 Notification clicked:', event);
            this.handleNotificationClick(event);
        });
    }

    async requestPermission() {
        if (this.useFallback) {
            // Use browser native notifications
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                console.log('📱 Browser notification permission:', permission);
                return permission === 'granted';
            }
            return false;
        }

        try {
            const permission = await OneSignal.Notifications.requestPermission();
            if (permission) {
                console.log('✅ Notification permission granted');
                this.userId = OneSignal.User.onesignalId;
                this.saveUserPreferences();
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Permission request failed:', error);
            return false;
        }
    }

    async subscribe() {
        if (this.useFallback) {
            console.log('📱 Using browser fallback - no subscription needed');
            return true;
        }

        try {
            await OneSignal.User.PushSubscription.optIn();
            console.log('✅ User subscribed to notifications');
            return true;
        } catch (error) {
            console.error('❌ Subscription failed:', error);
            return false;
        }
    }

    async unsubscribe() {
        try {
            await OneSignal.User.PushSubscription.optOut();
            console.log('🔕 User unsubscribed from notifications');
            return true;
        } catch (error) {
            console.error('❌ Unsubscription failed:', error);
            return false;
        }
    }

    // Set user tags for targeted notifications
    setUserTags(tags) {
        if (!this.initialized || this.useFallback) return;
        
        OneSignal.User.addTags(tags);
        console.log('🏷️ User tags set:', tags);
    }

    // Set user properties for segmentation
    setUserProperties() {
        if (!this.initialized || !window.appState) return;

        const userData = window.appState.getUserData();
        const tags = {
            difficulty_level: userData.currentDifficulty || 'beginner',
            words_learned: userData.learnedWords?.length || 0,
            streak_count: userData.streakCount || 0,
            last_study_date: userData.lastStudyDate || 'never',
            app_version: '1.0.0'
        };

        this.setUserTags(tags);
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
                case 'update':
                    // Handle app update
                    if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.ready.then(registration => {
                            registration.update();
                        });
                    }
                    break;
                default:
                    window.location.href = '/';
            }
        }
    }

    saveUserPreferences() {
        const prefs = {
            userId: this.userId,
            subscribed: true,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('wordwave_notifications', JSON.stringify(prefs));
    }

    getSubscriptionStatus() {
        if (this.useFallback) {
            return Notification.permission === 'granted';
        }
        return OneSignal.User.PushSubscription.optedIn;
    }

    // Schedule local reminders (fallback for when push isn't available)
    scheduleStudyReminder() {
        if ('Notification' in window && Notification.permission === 'granted') {
            // Schedule for tomorrow at same time
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const timeUntilReminder = tomorrow.getTime() - Date.now();
            
            setTimeout(() => {
                new Notification('WordWave - Time to Practice! 📚', {
                    body: 'Keep your streak going! Practice some words today.',
                    icon: '/icons/icon-192x192.png',
                    badge: '/icons/icon-72x72.png'
                });
            }, timeUntilReminder);
        }
    }
}

// Initialize notification manager
window.notificationManager = new NotificationManager();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.notificationManager.init();
});
