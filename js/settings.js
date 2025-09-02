class SettingsManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateAppInfo();
        this.calculateStorageUsage();
    }

    setupEventListeners() {
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
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    await registration.update();
                    
                    // Check if there's a waiting service worker (new version)
                    if (registration.waiting) {
                        // Update found - transform button to install
                        status.classList.remove('alert-info');
                        status.classList.add('alert-success');
                        message.innerHTML = 'Update available!';
                        updateAvailable.classList.remove('d-none');
                        
                        // Transform button to install update
                        btn.innerHTML = '<i class="bi bi-download"></i> Install Update';
                        btn.disabled = false;
                        btn.classList.remove('btn-outline-primary');
                        btn.classList.add('btn-primary');
                        
                        // Store the waiting worker and change button behavior
                        this.waitingWorker = registration.waiting;
                        this.isInstallMode = true;
                        
                    } else {
                        // No update - show up to date
                        status.classList.remove('alert-info');
                        status.classList.add('alert-success');
                        message.innerHTML = 'Up to date!';
                        updateAvailable.classList.add('d-none');
                        
                        // Reset button to check mode
                        btn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Check for Updates';
                        btn.disabled = false;
                        btn.classList.remove('btn-primary');
                        btn.classList.add('btn-outline-primary');
                        this.isInstallMode = false;
                        
                        // Hide status after 3 seconds
                        setTimeout(() => {
                            status.classList.add('d-none');
                        }, 3000);
                    }
                } else {
                    throw new Error('No service worker registration found');
                }
            } else {
                throw new Error('Service worker not available');
            }
            
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-search"></i>';
            
        } catch (error) {
            console.error('Error checking for updates:', error);
            status.classList.remove('alert-info');
            status.classList.add('alert-warning');
            message.textContent = 'Check failed';
            
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
