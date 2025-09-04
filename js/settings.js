// Settings Manager
class SettingsManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateAppInfo();
        this.calculateStorageUsage();
        this.updateProfile();
        this.updateApiKeyStatus();
        // Initialize notification settings
        this.initNotificationSettings();
    }

    setupEventListeners() {
        // Profile editing
        const editProfileBtn = document.getElementById('editProfileBtn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.showEditProfile();
            });
        }

        const saveProfileBtn = document.getElementById('saveProfileBtn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => {
                this.saveProfile();
            });
        }

        const cancelProfileBtn = document.getElementById('cancelProfileBtn');
        if (cancelProfileBtn) {
            cancelProfileBtn.addEventListener('click', () => {
                this.hideEditProfile();
            });
        }

        // API Key editing
        const editApiKeyBtn = document.getElementById('editApiKeyBtn');
        if (editApiKeyBtn) {
            editApiKeyBtn.addEventListener('click', () => {
                this.showEditApiKey();
            });
        }

        const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
        if (saveApiKeyBtn) {
            saveApiKeyBtn.addEventListener('click', () => {
                this.saveApiKey();
            });
        }

        const cancelApiKeyBtn = document.getElementById('cancelApiKeyBtn');
        if (cancelApiKeyBtn) {
            cancelApiKeyBtn.addEventListener('click', () => {
                this.hideEditApiKey();
            });
        }

        // Reset progress
        const resetProgressBtn = document.getElementById('resetProgressBtn');
        if (resetProgressBtn) {
            resetProgressBtn.addEventListener('click', () => {
                this.resetProgress();
            });
        }
    }

    // Profile Management
    updateProfile() {
        const profile = window.appState?.getProfile() || { name: 'User', avatar: 'U' };
        
        const avatarElement = document.getElementById('settingsAvatar');
        const nameElement = document.getElementById('settingsUserName');
        
        if (avatarElement) {
            avatarElement.textContent = profile.avatar;
        }
        
        if (nameElement) {
            nameElement.textContent = profile.name;
        }
    }

    showEditProfile() {
        const editForm = document.getElementById('editProfileForm');
        const profileDisplay = document.getElementById('profileDisplay');
        const nameInput = document.getElementById('profileNameInput');
        
        if (editForm && profileDisplay && nameInput) {
            const currentName = window.appState?.getProfile()?.name || 'User';
            nameInput.value = currentName;
            
            profileDisplay.classList.add('d-none');
            editForm.classList.remove('d-none');
            nameInput.focus();
        }
    }

    hideEditProfile() {
        const editForm = document.getElementById('editProfileForm');
        const profileDisplay = document.getElementById('profileDisplay');
        
        if (editForm && profileDisplay) {
            editForm.classList.add('d-none');
            profileDisplay.classList.remove('d-none');
        }
    }

    saveProfile() {
        const nameInput = document.getElementById('profileNameInput');
        const name = nameInput?.value?.trim();
        
        if (!name) {
            alert('Please enter a valid name');
            return;
        }
        
        // Update profile in state
        if (window.appState) {
            window.appState.updateProfile({ name });
        }
        
        // Update UI immediately
        this.updateProfile();
        
        // Update sidebar immediately (with small delay to ensure DOM is ready)
        setTimeout(() => {
            if (window.sidebarComponent) {
                window.sidebarComponent.updateProfile();
            }
        }, 100);
        
        // Hide form
        this.hideEditProfile();
        
        // Show success feedback
        const saveBtn = document.getElementById('saveProfileBtn');
        if (saveBtn) {
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Saved!';
            saveBtn.disabled = true;
            
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.disabled = false;
            }, 1500);
        }
    }

    async resetProgress() {
        if (confirm('Are you sure you want to reset all your progress? This action cannot be undone.')) {
            try {
                // Reset user data
                if (window.appState) {
                    window.appState.resetUserData();
                }
                
                // Clear all localStorage data except API key
                const apiKey = localStorage.getItem('groqApiKey');
                localStorage.clear();
                if (apiKey) {
                    localStorage.setItem('groqApiKey', apiKey);
                }
                
                // Show success message
                alert('Progress has been reset successfully!');
                
                // Reload the page to reflect changes
                window.location.reload();
                
            } catch (error) {
                console.error('Error resetting progress:', error);
                alert('Error resetting progress. Please try again.');
            }
        }
    }

    updateAppInfo() {
        // Check if app is installed
        const installType = document.getElementById('installType');
        if (installType) {
            const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                              window.navigator.standalone === true;
            installType.textContent = isInstalled ? 'Installed PWA' : 'Web Browser';
        }

        // Set last updated date
        const lastUpdated = document.getElementById('lastUpdated');
        if (lastUpdated) {
            const today = new Date().toLocaleDateString();
            lastUpdated.textContent = today;
        }
    }

    async calculateStorageUsage() {
        const storageElement = document.getElementById('storageUsed');
        if (!storageElement) return;

        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                const usedMB = (estimate.usage / (1024 * 1024)).toFixed(2);
                storageElement.textContent = `${usedMB} MB`;
            } else {
                storageElement.textContent = 'Unknown';
            }
        } catch (error) {
            console.error('Error calculating storage:', error);
            storageElement.textContent = 'Unknown';
        }
    }

    // API Key Management
    updateApiKeyStatus() {
        const apiKey = localStorage.getItem('groqApiKey');
        const statusText = document.getElementById('apiKeyStatusText');
        
        if (statusText) {
            if (apiKey && apiKey.trim()) {
                statusText.innerHTML = '<i class="bi bi-check-circle text-success me-1"></i>API Key configured';
            } else {
                statusText.innerHTML = '<i class="bi bi-exclamation-triangle text-warning me-1"></i>No API Key set';
            }
        }
    }

    showEditApiKey() {
        const editForm = document.getElementById('editApiKeyForm');
        const statusDisplay = document.getElementById('apiKeyStatusDisplay');
        const keyInput = document.getElementById('apiKeyInput');
        
        if (editForm && statusDisplay && keyInput) {
            const currentKey = localStorage.getItem('groqApiKey') || '';
            keyInput.value = currentKey;
            
            statusDisplay.classList.add('d-none');
            editForm.classList.remove('d-none');
            keyInput.focus();
        }
    }

    hideEditApiKey() {
        const editForm = document.getElementById('editApiKeyForm');
        const statusDisplay = document.getElementById('apiKeyStatusDisplay');
        
        if (editForm && statusDisplay) {
            editForm.classList.add('d-none');
            statusDisplay.classList.remove('d-none');
        }
    }

    saveApiKey() {
        const keyInput = document.getElementById('apiKeyInput');
        const apiKey = keyInput?.value?.trim();
        
        if (apiKey) {
            localStorage.setItem('groqApiKey', apiKey);
        } else {
            localStorage.removeItem('groqApiKey');
        }
        
        this.updateApiKeyStatus();
        this.hideEditApiKey();
        
        // Show success feedback
        const statusText = document.getElementById('apiKeyStatusText');
        if (statusText) {
            statusText.innerHTML = '<i class="bi bi-check-circle text-success me-1"></i>Saved successfully';
            setTimeout(() => {
                this.updateApiKeyStatus();
            }, 2000);
        }
    }

    // Notification Management
    initNotificationSettings() {
        const pushButton = document.getElementById('pushNotifications');
        if (!pushButton) return;

        // Set initial state from saved data
        setTimeout(() => {
            if (window.notificationManager) {
                const isSubscribed = window.notificationManager.isSubscribed();
                this.updateNotificationButton(pushButton, isSubscribed);
                console.log('🔘 Button initial state - subscribed:', isSubscribed);
            }
        }, 1000);

        // Handle button click
        pushButton.addEventListener('click', async () => {
            if (!window.notificationManager) {
                console.error('❌ Notification manager not available');
                return;
            }

            const isCurrentlySubscribed = window.notificationManager.isSubscribed();
            console.log('🔘 Button clicked - currently subscribed:', isCurrentlySubscribed);
            
            // Disable button during operation
            pushButton.disabled = true;
            pushButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Processing...';

            try {
                if (isCurrentlySubscribed) {
                    // Currently subscribed - unsubscribe
                    console.log('🔕 Unsubscribing...');
                    await window.notificationManager.unsubscribe();
                    this.updateNotificationButton(pushButton, false);
                    console.log('🔕 Unsubscribed');
                } else {
                    // Currently not subscribed - subscribe
                    console.log('🔔 Requesting permission...');
                    const granted = await window.notificationManager.requestPermission();
                    console.log('🔔 Permission granted:', granted);
                    this.updateNotificationButton(pushButton, granted);
                }
            } catch (error) {
                console.error('❌ Notification operation failed:', error);
                // Reset button state
                this.updateNotificationButton(pushButton, isCurrentlySubscribed);
            }
        });
        
        console.log('🔘 Notification button initialized');
    }

    updateNotificationButton(button, isSubscribed) {
        button.disabled = false;
        if (isSubscribed) {
            button.textContent = 'Disable';
            button.className = 'btn btn-danger btn-sm';
        } else {
            button.textContent = 'Enable';
            button.className = 'btn btn-primary btn-sm';
        }
    }

    updateNotificationStatus() {
        // Keep for compatibility but do nothing
    }

    updateNotificationUI() {
        // Keep for compatibility but do nothing
    }

    showNotificationError(message) {
        const statusDiv = document.getElementById('notificationStatus');
        if (statusDiv) {
            statusDiv.innerHTML = `<small><i class="bi bi-exclamation-triangle me-1"></i>${message}</small>`;
            statusDiv.className = 'alert alert-warning';
            statusDiv.classList.remove('d-none');
        }
    }
}

// Initialize settings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});
