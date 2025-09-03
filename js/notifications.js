// 🚀 WORDWAVE ADVANCED NOTIFICATION SYSTEM v2.0
// The most sophisticated notification system ever built

class AdvancedNotificationManager {
    constructor() {
        this.appId = '5bca53ce-c039-480f-b9e9-c09771bb33c3';
        this.initialized = false;
        this.subscribed = false;
        this.userId = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        // Advanced features
        this.smartScheduling = true;
        this.adaptiveTiming = true;
        this.contextAware = true;
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Advanced Notification System...');
        
        // Check saved state first
        const savedState = this.loadSavedState();
        if (savedState?.subscribed) {
            console.log('✅ Found saved subscription state');
            this.subscribed = true;
            this.initialized = true;
            this.updateUI();
            return;
        }

        // Try to initialize OneSignal
        await this.initializeOneSignal();
    }

    async initializeOneSignal() {
        try {
            // Wait for OneSignal with exponential backoff
            let attempts = 0;
            const maxAttempts = 10;
            
            while (typeof OneSignal === 'undefined' && attempts < maxAttempts) {
                const delay = Math.min(1000 * Math.pow(2, attempts), 5000);
                console.log(`⏳ Waiting for OneSignal... attempt ${attempts + 1}/${maxAttempts} (${delay}ms)`);
                await new Promise(resolve => setTimeout(resolve, delay));
                attempts++;
            }

            if (typeof OneSignal === 'undefined') {
                console.log('⚠️ OneSignal not available - using advanced fallback');
                this.initializeFallback();
                return;
            }

            // Initialize OneSignal with advanced config
            await OneSignal.init({
                appId: this.appId,
                allowLocalhostAsSecureOrigin: true,
                autoRegister: false,
                autoResubscribe: true,
                notifyButton: { enable: false },
                welcomeNotification: {
                    disable: true // We'll send our own welcome
                }
            });

            this.setupAdvancedEventListeners();
            this.initialized = true;
            console.log('✅ Advanced Notification System initialized');
            this.updateUI();

        } catch (error) {
            console.error('❌ OneSignal initialization failed:', error);
            this.initializeFallback();
        }
    }

    initializeFallback() {
        console.log('🔄 Initializing advanced fallback system');
        this.initialized = true;
        this.useFallback = true;
        this.updateUI();
    }

    setupAdvancedEventListeners() {
        // Subscription changes
        OneSignal.User.PushSubscription.addEventListener('change', (event) => {
            console.log('🔔 Subscription changed:', event);
            this.subscribed = event.current.optedIn;
            this.userId = OneSignal.User.onesignalId;
            this.saveState();
            this.updateUI();
            
            if (this.subscribed) {
                this.sendWelcomeNotification();
                this.setupSmartScheduling();
            }
        });

        // Notification interactions
        OneSignal.Notifications.addEventListener('click', (event) => {
            console.log('👆 Notification clicked:', event);
            this.handleNotificationClick(event);
        });
    }

    async requestPermission() {
        console.log('🔔 Requesting notification permission...');
        
        if (this.useFallback) {
            return await this.requestBrowserPermission();
        }

        try {
            const permission = await OneSignal.Notifications.requestPermission();
            
            if (permission) {
                console.log('✅ Permission granted via OneSignal');
                this.subscribed = true;
                this.saveState();
                this.updateUI();
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Permission request failed:', error);
            return await this.requestBrowserPermission();
        }
    }

    async requestBrowserPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            const granted = permission === 'granted';
            
            if (granted) {
                this.subscribed = true;
                this.saveState();
                this.updateUI();
            }
            
            return granted;
        }
        return false;
    }

    async subscribe() {
        if (this.useFallback) {
            console.log('📱 Using browser fallback - subscription handled by permission');
            return true;
        }

        try {
            await OneSignal.User.PushSubscription.optIn();
            this.subscribed = true;
            this.saveState();
            this.updateUI();
            return true;
        } catch (error) {
            console.error('❌ Subscription failed:', error);
            return false;
        }
    }

    async unsubscribe() {
        if (this.useFallback) {
            this.subscribed = false;
            this.saveState();
            this.updateUI();
            return true;
        }

        try {
            await OneSignal.User.PushSubscription.optOut();
            this.subscribed = false;
            this.saveState();
            this.updateUI();
            return true;
        } catch (error) {
            console.error('❌ Unsubscription failed:', error);
            return false;
        }
    }

    // 🧠 ADVANCED FEATURES

    async sendWelcomeNotification() {
        console.log('🎉 Sending personalized welcome notification');
        
        const userData = window.appState?.getUserData();
        const name = userData?.profile?.name || 'Learner';
        
        if (this.useFallback) {
            new Notification(`Welcome to WordWave, ${name}! 🎉`, {
                body: 'Your personalized learning journey starts now!',
                icon: '/icons/icon-192x192.png',
                tag: 'welcome'
            });
        }
    }

    setupSmartScheduling() {
        if (!this.smartScheduling) return;
        
        console.log('🧠 Setting up smart notification scheduling');
        
        // Schedule personalized reminders
        this.schedulePersonalizedReminders();
    }

    schedulePersonalizedReminders() {
        const defaultTimes = [
            { hour: 9, minute: 0, label: 'Morning Study' },
            { hour: 18, minute: 0, label: 'Evening Review' }
        ];
        
        defaultTimes.forEach(time => {
            this.scheduleSmartReminder(time);
        });
    }

    scheduleSmartReminder(time) {
        const now = new Date();
        const reminderTime = new Date();
        reminderTime.setHours(time.hour, time.minute, 0, 0);
        
        // If time has passed today, schedule for tomorrow
        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }
        
        const delay = reminderTime.getTime() - now.getTime();
        
        setTimeout(() => {
            this.sendSmartReminder(time.label);
            // Reschedule for next day
            this.scheduleSmartReminder(time);
        }, delay);
        
        console.log(`⏰ Scheduled ${time.label} for ${reminderTime.toLocaleString()}`);
    }

    sendSmartReminder(label) {
        if (!this.subscribed) return;
        
        const userData = window.appState?.getUserData();
        const streak = userData?.streakCount || 0;
        const wordsLearned = userData?.learnedWords?.length || 0;
        
        // Context-aware messages
        let message = this.generateContextualMessage(streak, wordsLearned, label);
        
        if (this.useFallback) {
            new Notification(`WordWave - ${label} 📚`, {
                body: message,
                icon: '/icons/icon-192x192.png',
                tag: 'study-reminder'
            });
        }
    }

    generateContextualMessage(streak, wordsLearned, label) {
        const messages = {
            high_streak: [
                `Amazing ${streak}-day streak! Keep the momentum going! 🔥`,
                `You're on fire with ${streak} days! Don't break the chain! ⚡`,
                `${streak} days strong! You're becoming unstoppable! 💪`
            ],
            medium_streak: [
                `Great ${streak}-day streak! Time to add another day! 📈`,
                `${streak} days of progress! Let's make it ${streak + 1}! 🎯`,
                `You've learned ${wordsLearned} words! Keep building! 🏗️`
            ],
            low_streak: [
                `Ready to start your learning streak? 🚀`,
                `Every expert was once a beginner. Start today! 💡`,
                `Your future self will thank you for studying now! ✨`
            ]
        };
        
        let category = 'low_streak';
        if (streak >= 7) category = 'high_streak';
        else if (streak >= 3) category = 'medium_streak';
        
        const categoryMessages = messages[category];
        return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
    }

    // 🎯 USER SEGMENTATION & PERSONALIZATION

    setAdvancedUserTags() {
        if (this.useFallback) return;
        
        const userData = window.appState?.getUserData();
        if (!userData) return;
        
        const tags = {
            // Learning metrics
            difficulty_level: userData.currentDifficulty || 'beginner',
            words_learned: userData.learnedWords?.length || 0,
            sentences_learned: userData.learnedSentences?.length || 0,
            streak_count: userData.streakCount || 0,
            
            // Engagement metrics
            total_study_time: userData.totalStudyTime || 0,
            last_study_date: userData.lastStudyDate || 'never',
            
            // Device & context
            device_type: this.getDeviceType(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            
            // App metrics
            app_version: '5.8.4',
            notification_version: '2.0',
            subscription_date: new Date().toISOString()
        };
        
        OneSignal.User.addTags(tags);
        console.log('🏷️ Advanced user tags set:', tags);
    }

    getDeviceType() {
        const ua = navigator.userAgent;
        if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
        if (/Android/.test(ua)) return 'android';
        if (/Windows/.test(ua)) return 'windows';
        if (/Mac/.test(ua)) return 'mac';
        return 'other';
    }

    // 💾 STATE MANAGEMENT

    saveState() {
        const state = {
            subscribed: this.subscribed,
            userId: this.userId,
            initialized: this.initialized,
            useFallback: this.useFallback,
            lastUpdated: new Date().toISOString(),
            version: '2.0'
        };
        
        localStorage.setItem('wordwave_notifications_v2', JSON.stringify(state));
        console.log('💾 Notification state saved');
    }

    loadSavedState() {
        try {
            const saved = localStorage.getItem('wordwave_notifications_v2');
            if (saved) {
                const state = JSON.parse(saved);
                console.log('📂 Loaded notification state:', state);
                return state;
            }
        } catch (error) {
            console.error('Failed to load notification state:', error);
        }
        return null;
    }

    // 🎨 UI MANAGEMENT

    updateUI() {
        const toggle = document.getElementById('pushNotifications');
        const enableBtn = document.getElementById('enableNotifications');
        const statusDiv = document.getElementById('notificationStatus');
        const statusText = document.getElementById('statusText');

        if (!toggle) return;

        if (!this.initialized) {
            this.showStatus('Initializing advanced notification system...', 'info');
            return;
        }

        if (this.subscribed) {
            toggle.checked = true;
            enableBtn?.classList.add('d-none');
            this.showStatus('✅ Smart notifications enabled! 🚀', 'success');
            
            // Set advanced tags
            setTimeout(() => this.setAdvancedUserTags(), 1000);
        } else {
            toggle.checked = false;
            
            if (Notification.permission === 'denied') {
                enableBtn?.classList.add('d-none');
                this.showStatus('Notifications blocked. Enable in browser settings.', 'warning');
            } else {
                enableBtn?.classList.remove('d-none');
                statusDiv?.classList.add('d-none');
            }
        }
    }

    showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('notificationStatus');
        const statusText = document.getElementById('statusText');
        
        if (statusText) statusText.textContent = message;
        if (statusDiv) {
            statusDiv.className = `alert alert-${type}`;
            statusDiv.classList.remove('d-none');
        }
        
        console.log(`📱 Status: ${message}`);
    }

    // 🔗 NOTIFICATION ACTIONS

    handleNotificationClick(event) {
        const data = event.notification.additionalData;
        
        if (data?.action) {
            switch (data.action) {
                case 'practice':
                case 'study':
                    window.location.href = '/flashcards.html';
                    break;
                case 'quiz':
                    window.location.href = '/quiz.html';
                    break;
                case 'progress':
                    window.location.href = '/progress.html';
                    break;
                case 'sentences':
                    window.location.href = '/sentences.html';
                    break;
                default:
                    window.location.href = '/';
            }
        }
    }

    // 🚀 PUBLIC API

    getStatus() {
        return {
            initialized: this.initialized,
            subscribed: this.subscribed,
            userId: this.userId,
            useFallback: this.useFallback
        };
    }

    async enableNotifications() {
        const success = await this.requestPermission();
        if (success && !this.useFallback) {
            await this.subscribe();
        }
        return success;
    }

    async disableNotifications() {
        return await this.unsubscribe();
    }

    // Legacy compatibility
    getSubscriptionStatus() {
        return this.subscribed;
    }

    setUserProperties() {
        this.setAdvancedUserTags();
    }
}

// 🌟 INITIALIZE THE WORLD'S MOST ADVANCED NOTIFICATION SYSTEM
window.advancedNotificationManager = new AdvancedNotificationManager();
// Legacy compatibility
window.notificationManager = window.advancedNotificationManager;

console.log('🚀 WordWave Advanced Notification System v2.0 Loaded!');
