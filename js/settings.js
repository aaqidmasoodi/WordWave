class SettingsManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateAppInfo();
        this.calculateStorageUsage();
        this.updateProfile();
        // Set initial button state based on update availability
        this.updateButtonState();
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

        // Show checking status
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i>';
        status.classList.remove('d-none', 'alert-success', 'alert-warning');
        status.classList.add('alert-info');
        message.textContent = 'Checking...';

        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    console.log('🔍 Current SW state:', registration.active?.state);
                    console.log('🔍 Waiting SW exists:', !!registration.waiting);
                    console.log('🔍 Installing SW exists:', !!registration.installing);
                    
                    // Force update check - more aggressive for Chrome Android
                    await registration.update();
                    
                    // Wait a bit for the update to process
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Check again after forced update
                    const updatedRegistration = await navigator.serviceWorker.getRegistration();
                    console.log('🔍 After update - Waiting SW:', !!updatedRegistration.waiting);
                    console.log('🔍 After update - Installing SW:', !!updatedRegistration.installing);
                    
                    // Check if there's a waiting service worker (new version)
                    if (updatedRegistration.waiting || updatedRegistration.installing) {
                        // Update found - set flag and transform button
                        localStorage.setItem('wordwave_update_available', 'true');
                        localStorage.setItem('wordwave_update_timestamp', Date.now().toString());
                        
                        status.classList.remove('alert-info');
                        status.classList.add('alert-success');
                        message.innerHTML = 'Update available!';
                        updateAvailable.classList.remove('d-none');
                        
                        // Transform button to install update
                        this.updateButtonState();
                        this.waitingWorker = updatedRegistration.waiting || updatedRegistration.installing;
                        
                    } else {
                        // Try cache busting approach for stubborn browsers
                        const cacheBuster = Date.now();
                        const swUrl = `/sw.js?v=${cacheBuster}`;
                        console.log('🔍 Trying cache-busted SW check:', swUrl);
                        
                        try {
                            const response = await fetch(swUrl, { cache: 'no-cache' });
                            if (response.ok) {
                                console.log('🔍 SW file fetched successfully');
                                // Re-register with cache buster
                                const newRegistration = await navigator.serviceWorker.register(swUrl);
                                await new Promise(resolve => setTimeout(resolve, 1500));
                                
                                if (newRegistration.waiting || newRegistration.installing) {
                                    localStorage.setItem('wordwave_update_available', 'true');
                                    localStorage.setItem('wordwave_update_timestamp', Date.now().toString());
                                    
                                    status.classList.remove('alert-info');
                                    status.classList.add('alert-success');
                                    message.innerHTML = 'Update found!';
                                    updateAvailable.classList.remove('d-none');
                                    this.updateButtonState();
                                    this.waitingWorker = newRegistration.waiting || newRegistration.installing;
                                    return;
                                }
                            }
                        } catch (e) {
                            console.log('🔍 Cache-busted check failed:', e);
                        }
                        
                        // No update - show up to date
                        status.classList.remove('alert-info');
                        status.classList.add('alert-success');
                        message.innerHTML = 'Up to date!';
                        updateAvailable.classList.add('d-none');
                        
                        // Reset button using consistent method
                        this.updateButtonState();
                        
                        // Hide status after 3 seconds
                        setTimeout(() => {
                            status.classList.add('d-none');
                        }, 3000);
                    }
                } else {
                    // No registration found
                    status.classList.remove('alert-info');
                    status.classList.add('alert-warning');
                    message.textContent = 'Service worker not registered';
                    this.updateButtonState();
                }
            } else {
                // Service worker not supported
                status.classList.remove('alert-info');
                status.classList.add('alert-warning');
                message.textContent = 'Service worker not supported';
                this.updateButtonState();
            }
            
        } catch (error) {
            console.error('Error checking for updates:', error);
            status.classList.remove('alert-info');
            status.classList.add('alert-warning');
            message.textContent = 'Check failed - try again';
            this.updateButtonState();
            
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-search"></i>';
            
            // Hide status after 3 seconds
            setTimeout(() => {
                status.classList.add('d-none');
            }, 3000);
        }
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
            
            // Wait a moment then reload
            setTimeout(() => {
                window.location.reload();
            }, 1500);
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
