class SettingsManager {
    constructor() {
        this.isInstallMode = false;
        this.waitingWorker = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateAppInfo();
        this.calculateStorageUsage();
        this.updateProfile();
        this.updateApiKeyStatus();
        // Set initial button state based on update availability
        this.updateButtonState();
        // Initialize notification settings
        this.initNotificationSettings();
    }

    setupEventListeners() {
        // Profile editing
        const editProfileBtn = document.getElementById('editProfileBtn');
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        const cancelProfileBtn = document.getElementById('cancelProfileBtn');
        const editProfileForm = document.getElementById('editProfileForm');
        
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.showEditProfile();
            });
        }
        
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => {
                this.saveProfile();
            });
        }
        
        if (cancelProfileBtn) {
            cancelProfileBtn.addEventListener('click', () => {
                this.hideEditProfile();
            });
        }

        // Check for updates button
        const checkUpdatesBtn = document.getElementById('checkUpdatesBtn');
        if (checkUpdatesBtn) {
            checkUpdatesBtn.addEventListener('click', () => {
                if (this.isInstallMode) {
                    this.installUpdate();
                } else {
                    this.checkForUpdates();
                }
            });
        }

        // API Key editing
        const editApiKeyBtn = document.getElementById('editApiKeyBtn');
        const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
        const cancelApiKeyBtn = document.getElementById('cancelApiKeyBtn');
        
        if (editApiKeyBtn) {
            editApiKeyBtn.addEventListener('click', () => {
                this.showEditApiKey();
            });
        }
        
        if (saveApiKeyBtn) {
            saveApiKeyBtn.addEventListener('click', () => {
                this.saveApiKey();
            });
        }
        
        if (cancelApiKeyBtn) {
            cancelApiKeyBtn.addEventListener('click', () => {
                this.hideEditApiKey();
            });
        }

        // Install update button
        const installUpdateBtn = document.getElementById('installUpdateBtn');
        if (installUpdateBtn) {
            installUpdateBtn.addEventListener('click', () => {
                this.installUpdate();
            });
        }

        // Reset progress button
        const resetProgressBtn = document.getElementById('resetProgressBtn');
        if (resetProgressBtn) {
            resetProgressBtn.addEventListener('click', () => {
                this.resetProgress();
            });
        }
    }

    updateButtonState() {
        const btn = document.getElementById('checkUpdatesBtn');
        if (!btn) return;

        // Only two states based on flag
        if (localStorage.getItem('wordwave_update_available') === 'true') {
            // Install mode
            btn.innerHTML = '<i class="bi bi-download"></i> Install Update';
            btn.classList.remove('btn-outline-primary');
            btn.classList.add('btn-primary');
            this.isInstallMode = true;
        } else {
            // Check mode
            btn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Check for Updates';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline-primary');
            this.isInstallMode = false;
        }
        btn.disabled = false;
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
        const form = document.getElementById('editProfileForm');
        const nameInput = document.getElementById('profileName');
        const profile = window.appState?.getProfile() || { name: 'User' };
        
        if (nameInput) {
            nameInput.value = profile.name;
        }
        
        if (form) {
            form.classList.remove('d-none');
        }
    }

    hideEditProfile() {
        const form = document.getElementById('editProfileForm');
        if (form) {
            form.classList.add('d-none');
        }
    }

    saveProfile() {
        const nameInput = document.getElementById('profileName');
        const name = nameInput?.value.trim();
        
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
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Saved!';
            saveBtn.disabled = true;
            
            setTimeout(() => {
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
            }, 1500);
        }
    }

    async checkForUpdates() {
        const btn = document.getElementById('checkUpdatesBtn');
        const status = document.getElementById('updateStatus');
        const message = document.getElementById('updateMessage');
        const updateAvailable = document.getElementById('updateAvailable');

        // Show amazing checking animation
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-arrow-clockwise spin me-1"></i>Checking...';
        status.classList.remove('d-none', 'alert-success', 'alert-warning', 'alert-danger');
        status.classList.add('alert-info');
        message.innerHTML = '<i class="bi bi-search me-1"></i>Scanning for updates...';

        try {
            // Get current version from cache name
            const currentVersion = await this.getCurrentVersion();
            console.log('📱 Current version:', currentVersion);
            
            // Clear any stale update flags first
            localStorage.removeItem('wordwave_update_available');
            localStorage.removeItem('wordwave_update_version');
            
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    // Force update check with cache busting
                    message.innerHTML = '<i class="bi bi-cloud-download me-1"></i>Checking server...';
                    await registration.update();
                    
                    // Wait for update to process
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    // Get fresh registration
                    const updatedRegistration = await navigator.serviceWorker.getRegistration();
                    
                    // Check if there's a waiting service worker (new version available)
                    if (updatedRegistration.waiting || updatedRegistration.installing) {
                        const newVersion = await this.getWaitingVersion(updatedRegistration);
                        console.log('🆕 New version found:', newVersion);
                        
                        // Compare versions properly
                        if (this.isNewerVersion(newVersion, currentVersion)) {
                            // 🎉 UPDATE AVAILABLE!
                            localStorage.setItem('wordwave_update_available', 'true');
                            localStorage.setItem('wordwave_update_version', newVersion);
                            
                            status.classList.remove('alert-info');
                            status.classList.add('alert-success');
                            message.innerHTML = `<i class="bi bi-download me-1"></i>Update available! <strong>${newVersion}</strong>`;
                            updateAvailable.classList.remove('d-none');
                            
                            // Transform button to install mode
                            this.isInstallMode = true;
                            btn.innerHTML = '<i class="bi bi-download me-1"></i>Install Update';
                            btn.classList.remove('btn-outline-primary');
                            btn.classList.add('btn-success');
                            btn.disabled = false;
                            
                            this.waitingWorker = updatedRegistration.waiting || updatedRegistration.installing;
                            return;
                        }
                    }
                    
                    // No update found - you're up to date! 
                    status.classList.remove('alert-info');
                    status.classList.add('alert-success');
                    message.innerHTML = `<i class="bi bi-check-circle me-1"></i>You're up to date! <strong>${currentVersion}</strong>`;
                    updateAvailable.classList.add('d-none');
                    
                    btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Up to Date';
                    btn.classList.remove('btn-outline-primary');
                    btn.classList.add('btn-outline-success');
                    btn.disabled = true;
                    
                    // Re-enable button after 3 seconds
                    setTimeout(() => {
                        btn.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i>Check for Updates';
                        btn.classList.remove('btn-outline-success');
                        btn.classList.add('btn-outline-primary');
                        btn.disabled = false;
                    }, 3000);
                    
                } else {
                    throw new Error('Service worker not registered');
                }
            } else {
                throw new Error('Service workers not supported');
            }
            
        } catch (error) {
            console.error('❌ Update check failed:', error);
            
            status.classList.remove('alert-info');
            status.classList.add('alert-danger');
            message.innerHTML = `<i class="bi bi-exclamation-triangle me-1"></i>Check failed: ${error.message}`;
            
            btn.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i>Try Again';
            btn.disabled = false;
        }
    }
    
    async getCurrentVersion() {
        try {
            const cacheNames = await caches.keys();
            const wordwaveCache = cacheNames.find(name => name.startsWith('wordwave-v'));
            return wordwaveCache ? wordwaveCache.replace('wordwave-v', '') : '5.5.4';
        } catch (error) {
            return '5.5.4'; // fallback
        }
    }
    
    async getWaitingVersion(registration) {
        try {
            // Try to get version from waiting worker
            const worker = registration.waiting || registration.installing;
            if (worker && worker.scriptURL) {
                // Extract version from script URL or use timestamp
                const url = new URL(worker.scriptURL);
                const version = url.searchParams.get('v');
                if (version) {
                    return `5.5.${version.slice(-3)}`; // Convert timestamp to version
                }
            }
            
            // Fallback: increment current version
            const current = await this.getCurrentVersion();
            const parts = current.split('.');
            const patch = parseInt(parts[2] || 0) + 1;
            return `${parts[0]}.${parts[1]}.${patch}`;
        } catch (error) {
            return '5.5.5'; // fallback
        }
    }
    
    isNewerVersion(newVer, currentVer) {
        const parseVersion = (v) => v.split('.').map(n => parseInt(n) || 0);
        const newParts = parseVersion(newVer);
        const currentParts = parseVersion(currentVer);
        
        for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
            const newPart = newParts[i] || 0;
            const currentPart = currentParts[i] || 0;
            
            if (newPart > currentPart) return true;
            if (newPart < currentPart) return false;
        }
        
        return false; // versions are equal
    }

    async installUpdate() {
        const btn = document.getElementById('checkUpdatesBtn');
        const updateAvailable = document.getElementById('updateAvailable');
        
        if (this.waitingWorker) {
            btn.disabled = true;
            btn.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i> Installing...';
            
            // Clear the update flag
            localStorage.removeItem('wordwave_update_available');
            
            // Clear all sessions to prevent compatibility issues
            console.log('🧹 Clearing all sessions for update compatibility...');
            localStorage.removeItem('wordwave_flashcard_session');
            localStorage.removeItem('wordwave_sentence_session');
            localStorage.removeItem('flashcardSession');
            localStorage.removeItem('sentenceSession');
            localStorage.removeItem('quizSession');
            
            // Apply the update
            this.waitingWorker.postMessage({ type: 'SKIP_WAITING' });
            
            // Android Chrome fix: Force hard reload
            if (navigator.userAgent.includes('Android')) {
                setTimeout(() => {
                    console.log('🔄 Android detected - forcing hard reload');
                    window.location.reload(true);
                }, 1000);
            } else {
                // iOS/other browsers: Normal reload
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        }
    }

    async resetProgress() {
        const btn = document.getElementById('resetProgressBtn');
        
        if (confirm('Are you sure you want to reset your learning progress? This will clear all your progress, streaks, and learned words. This cannot be undone.')) {
            btn.disabled = true;
            btn.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i>';
            
            try {
                // Reset app state directly
                if (window.app && window.app.state) {
                    window.app.state.state.user = {
                        learnedWords: [],
                        reviewWords: [],
                        learnedSentences: [],
                        reviewSentences: [],
                        currentDifficulty: 'beginner',
                        sessionLength: {
                            flashcards: 10,
                            sentences: 10,
                            quiz: 10
                        },
                        streakCount: 0,
                        lastStudyDate: null,
                        totalStudyTime: 0,
                        quizzesTaken: 0
                    };
                    
                    window.app.state.clearAllSessions();
                    window.app.state.saveUserData();
                }
                
                // Show success immediately
                btn.innerHTML = '<i class="bi bi-check"></i>';
                alert('All progress has been reset successfully!');
                
                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
                
            } catch (error) {
                console.error('Error resetting progress:', error);
                btn.disabled = false;
                btn.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
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
                const usedMB = (estimate.usage / (1024 * 1024)).toFixed(1);
                storageElement.textContent = `${usedMB} MB`;
            } else {
                storageElement.textContent = 'Unknown';
            }
        } catch (error) {
            console.error('Error calculating storage:', error);
            storageElement.textContent = 'Unknown';
        }
    }

    clearUpdateIndicators() {
        // Remove badge from settings link
        const updateBadge = document.querySelector('.update-badge');
        if (updateBadge) {
            updateBadge.remove();
        }

        // Reset check button style
        const checkBtn = document.getElementById('checkUpdatesBtn');
        if (checkBtn) {
            checkBtn.classList.remove('btn-success');
            checkBtn.classList.add('btn-outline-primary');
            checkBtn.title = '';
        }

        // Remove dashboard update notification
        const updateCard = document.getElementById('updateNotificationCard');
        if (updateCard) {
            updateCard.remove();
        }
    }

    // API Key Management
    updateApiKeyStatus() {
        const apiKey = localStorage.getItem('groqApiKey');
        const statusText = document.getElementById('apiKeyStatusText');
        
        if (statusText) {
            if (apiKey && apiKey.trim()) {
                statusText.innerHTML = '<i class="bi bi-check-circle text-success me-1"></i>API key configured';
            } else {
                statusText.innerHTML = '<i class="bi bi-x-circle text-muted me-1"></i>No API key configured';
            }
        }
    }

    showEditApiKey() {
        const form = document.getElementById('editApiKeyForm');
        const input = document.getElementById('groqApiKey');
        
        if (form && input) {
            // Load current API key
            const currentKey = localStorage.getItem('groqApiKey') || '';
            input.value = currentKey;
            
            form.classList.remove('d-none');
            input.focus();
        }
    }

    hideEditApiKey() {
        const form = document.getElementById('editApiKeyForm');
        if (form) {
            form.classList.add('d-none');
        }
    }

    saveApiKey() {
        const input = document.getElementById('groqApiKey');
        if (input) {
            const apiKey = input.value.trim();
            
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
    }

    initNotificationSettings() {
        const pushToggle = document.getElementById('pushNotifications');
        const enableBtn = document.getElementById('enableNotifications');
        const statusDiv = document.getElementById('notificationStatus');
        const statusText = document.getElementById('statusText');

        if (!pushToggle || !window.notificationManager) return;

        // Check current status after a short delay to ensure OneSignal is ready
        setTimeout(() => {
            this.updateNotificationStatus();
        }, 1000);

        // Handle toggle
        pushToggle.addEventListener('change', async (e) => {
            if (e.target.checked) {
                const success = await window.notificationManager.requestPermission();
                if (success) {
                    await window.notificationManager.subscribe();
                    window.notificationManager.setUserProperties();
                    this.updateNotificationStatus();
                } else {
                    e.target.checked = false;
                    this.showNotificationError('Permission denied. Please enable in browser settings.');
                }
            } else {
                await window.notificationManager.unsubscribe();
                this.updateNotificationStatus();
            }
        });

        // Handle enable button
        enableBtn?.addEventListener('click', async () => {
            const success = await window.notificationManager.requestPermission();
            if (success) {
                await window.notificationManager.subscribe();
                window.notificationManager.setUserProperties();
                pushToggle.checked = true;
                this.updateNotificationStatus();
            } else {
                this.showNotificationError('Permission denied. Please enable in browser settings.');
            }
        });
    }

    updateNotificationStatus() {
        const pushToggle = document.getElementById('pushNotifications');
        const enableBtn = document.getElementById('enableNotifications');
        const statusDiv = document.getElementById('notificationStatus');
        const statusText = document.getElementById('statusText');

        if (!window.notificationManager?.initialized) {
            statusText.textContent = 'Initializing notifications...';
            statusDiv.className = 'alert alert-info';
            statusDiv.classList.remove('d-none');
            return;
        }

        const isSubscribed = window.notificationManager.getSubscriptionStatus();
        
        if (isSubscribed) {
            pushToggle.checked = true;
            enableBtn?.classList.add('d-none');
            statusText.textContent = 'Notifications enabled ✓';
            statusDiv.className = 'alert alert-success';
            statusDiv.classList.remove('d-none');
        } else {
            pushToggle.checked = false;
            if (Notification.permission === 'denied') {
                enableBtn?.classList.add('d-none');
                statusText.textContent = 'Notifications blocked. Enable in browser settings.';
                statusDiv.className = 'alert alert-warning';
                statusDiv.classList.remove('d-none');
            } else {
                enableBtn?.classList.remove('d-none');
                statusDiv.classList.add('d-none');
            }
        }
    }

    showNotificationError(message) {
        const statusDiv = document.getElementById('notificationStatus');
        const statusText = document.getElementById('statusText');
        
        statusText.textContent = message;
        statusDiv.className = 'alert alert-danger';
        statusDiv.classList.remove('d-none');
        
        setTimeout(() => {
            statusDiv.classList.add('d-none');
        }, 5000);
    }
}

// Initialize settings when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});

// Add CSS for spinning animation
const style = document.createElement('style');
style.textContent = `
    .spin {
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);