// Native Browser Notification System - No Service Worker Conflicts
class SimpleNotificationManager {
    constructor() {
        this.subscribed = false;
        this.connected = false;
        this.loadState();
        this.updateUI();
    }

    async requestPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.connected = true;
            this.subscribed = permission === 'granted';
            this.saveState();
            this.updateUI();
            
            if (this.subscribed) {
                // Show welcome notification
                new Notification('Thanks for subscribing to WordWave!', {
                    body: "You'll receive study reminders! 📚",
                    icon: 'icons/icon-192x192.png'
                });
            }
            
            return this.subscribed;
        }
        return false;
    }

    unsubscribe() {
        this.subscribed = false;
        this.saveState();
        this.updateUI();
    }

    updateUI() {
        const toggle = document.getElementById('pushNotifications');
        const statusDiv = document.getElementById('notificationStatus');
        const indicator = document.getElementById('notificationIndicator');

        if (toggle) {
            toggle.checked = this.subscribed;
        }

        if (statusDiv) {
            statusDiv.classList.add('d-none');
        }

        if (indicator) {
            if (this.subscribed) {
                indicator.className = 'notification-indicator connected';
                indicator.title = 'Notifications enabled';
            } else {
                indicator.className = 'notification-indicator disconnected';
                indicator.title = 'Notifications disabled';
            }
        }
    }

    saveState() {
        localStorage.setItem('wordwave_notifications_simple', JSON.stringify({
            subscribed: this.subscribed,
            connected: this.connected,
            timestamp: Date.now()
        }));
    }

    loadState() {
        try {
            const saved = localStorage.getItem('wordwave_notifications_simple');
            if (saved) {
                const state = JSON.parse(saved);
                this.subscribed = state.subscribed || false;
                this.connected = state.connected || false;
            }
        } catch (error) {
            // Silent fail
        }
    }

    // Public API
    isSubscribed() {
        return this.subscribed;
    }

    isConnected() {
        return this.connected;
    }

    getStatus() {
        return {
            initialized: true,
            connected: this.connected,
            subscribed: this.subscribed
        };
    }
}

// Initialize
window.notificationManager = new SimpleNotificationManager();
