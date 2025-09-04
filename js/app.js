// js/app.js
class EnglishLearningApp {
    constructor() {
        // Ensure state exists, create if needed
        if (!window.appState) {
            // If AppState class exists, create instance
            if (typeof AppState !== 'undefined') {
                window.appState = new AppState();
            } else {
                // Fallback: create simple state object
                window.appState = {
                    state: { user: this.getDefaultUserData() },
                    getUserData: function() { return this.state.user; },
                    setUserData: function(data) { 
                        this.state.user = data; 
                        localStorage.setItem('wordWaveUserData', JSON.stringify(data));
                    },
                    saveUserData: function() {
                        localStorage.setItem('wordWaveUserData', JSON.stringify(this.state.user));
                    },
                    reset: function() {
                        const defaultData = {
                            learnedWords: [],
                            reviewWords: [],
                            learnedSentences: [],
                            reviewSentences: [],
                            currentDifficulty: 'beginner',
                            streakCount: 0,
                            lastStudyDate: null,
                            totalStudyTime: 0
                        };
                        this.state.user = defaultData;
                        this.saveUserData();
                        
                        // Clear sessions
                        localStorage.removeItem('flashcardSession');
                        localStorage.removeItem('sentenceSession');
                        localStorage.removeItem('quizSession');
                        
                        // Reset global states
                        if (window.flashcardState) {
                            window.flashcardState = null;
                        }
                    }
                };
                // Load existing data
                const saved = localStorage.getItem('wordWaveUserData');
                if (saved) {
                    try {
                        window.appState.state.user = JSON.parse(saved);
                    } catch (e) {}
                }
            }
        }
        this.state = window.appState;
        this.sessionStartTime = Date.now();
        this.sessionTimer = null;
        this.init();
        this.startSessionTracking();
    }

    getDefaultUserData() {
        return {
            learnedWords: [],
            reviewWords: [],
            learnedSentences: [],
            reviewSentences: [],
            currentDifficulty: 'beginner',
            streakCount: 0,
            lastStudyDate: null,
            totalStudyTime: 0
        };
    }

    get userData() {
        return this.state.getUserData();
    }

    set userData(value) {
        this.state.setUserData(value);
    }

    startSessionTracking() {
        // Track session every minute
        this.sessionTimer = setInterval(() => {
            this.recordUsageTime();
        }, 60000); // Every minute

        // Save session on page unload
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });

        // Save session on visibility change (tab switch, minimize)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.endSession();
            } else {
                this.sessionStartTime = Date.now();
                this.startSessionTracking();
            }
        });
    }

    recordUsageTime() {
        // Safety check - ensure userData exists
        if (!this.userData) {
            console.debug('⚠️ userData not available for usage tracking');
            return;
        }

        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay(); // 0 = Sunday
        const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD

        // Ensure usageTracking exists
        if (!this.userData.usageTracking) {
            this.userData.usageTracking = {};
        }

        // Ensure date key exists
        if (!this.userData.usageTracking[dateKey]) {
            this.userData.usageTracking[dateKey] = {};
        }

        const timeKey = `${day}-${hour}`;
        
        // Safely update the tracking
        if (!this.userData.usageTracking[dateKey][timeKey]) {
            this.userData.usageTracking[dateKey][timeKey] = 0;
        }
        this.userData.usageTracking[dateKey][timeKey]++;

        this.saveUserData();
    }

    endSession() {
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    init() {
        // Debug version information
        console.log('🔍 App initializing...');
        console.log('🔍 Expected version: 6.1.4');
        console.log('🔍 Update flag status:', localStorage.getItem('wordwave_update_available'));
        
        // Force clear any stale update flags on init
        const flagTimestamp = localStorage.getItem('wordwave_update_timestamp');
        if (flagTimestamp) {
            const flagAge = Date.now() - parseInt(flagTimestamp);
            const maxAge = 10 * 60 * 1000; // 10 minutes
            if (flagAge > maxAge) {
                console.log('🧹 Clearing stale update flag (age:', Math.round(flagAge/1000), 'seconds)');
                localStorage.removeItem('wordwave_update_available');
                localStorage.removeItem('wordwave_update_timestamp');
            }
        }
        
        // Migrate old streak property to streakCount if needed
        if (this.userData.streak && !this.userData.streakCount) {
            this.userData.streakCount = this.userData.streak;
            delete this.userData.streak;
            this.saveUserData();
        }
        
        // Check for available updates and show banner
        this.checkUpdateBanner();
        
        // Listen for update events
        window.addEventListener('updateAvailable', () => {
            this.showUpdateBanner();
        });
        
        // Wait for header to load before updating dashboard
        const initDashboard = () => {
            this.updateDashboard();
        };
        
        // Check if header elements exist, or wait for header loaded event
        const headerRight = document.getElementById('headerRight');
        if (headerRight) {
            initDashboard();
        } else {
            document.addEventListener('headerLoaded', initDashboard);
        }
        
        this.setupEventListeners();
    }

    loadUserData() {
        const savedData = localStorage.getItem('englishLearningUserData');
        if (savedData) {
            try {
                return JSON.parse(savedData);
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
        // Make sure all required properties exist
        return {
            learnedWords: [],
            reviewWords: [],
            learnedSentences: [],
            reviewSentences: [],
            streak: 0,
            lastLogin: null,
            totalStudyTime: 0
        };
    }

    saveUserData() {
        // Data is automatically saved by the state system
        this.state.saveUserData();
    }

    updateDashboard() {
        const wordsLearned = this.userData.learnedWords ? this.userData.learnedWords.length : 0;
        const totalWords = vocabularyData.length;
        const progressPercent = totalWords > 0 ? Math.round((wordsLearned / totalWords) * 100) : 0;

        // Update badges
        const streakBadge = document.getElementById('streakBadge');
        const wordsBadge = document.getElementById('wordsBadge');
        const progressPercentElement = document.getElementById('progressPercent');
        const mainProgressElement = document.getElementById('mainProgress');
        const learnedCountElement = document.getElementById('learnedCount');
        const totalCountElement = document.getElementById('totalCount');

        // Home page specific elements
        const homeWordsLearned = document.getElementById('homeWordsLearned');
        const homeWordsReview = document.getElementById('homeWordsReview');
        const homeSentencesLearned = document.getElementById('homeSentencesLearned');
        const homeSentencesReview = document.getElementById('homeSentencesReview');
        const homeQuizzesTaken = document.getElementById('homeQuizzesTaken');

        // Calculate sentence stats
        const learnedSentences = this.userData.learnedSentences ? this.userData.learnedSentences.length : 0;
        const reviewSentences = this.userData.reviewSentences ? this.userData.reviewSentences.length : 0;
        const reviewWords = this.userData.reviewWords ? this.userData.reviewWords.length : 0;
        
        // Calculate total available sentences from learned words
        const learnedWordIds = this.userData.learnedWords || [];
        let totalAvailableSentences = 0;
        vocabularyData.forEach(word => {
            if (learnedWordIds.includes(word.id) && word.sentences) {
                totalAvailableSentences += word.sentences.length;
            }
        });

        // Update badges using global header functions
        console.log('🔥 Updating streak badge:', this.userData.streakCount);
        updateHeaderElement('streakBadge', `🔥 ${this.userData.streakCount || 0}`);
        updateHeaderElement('wordsBadge', `${wordsLearned}/${totalWords}`);

        if (progressPercentElement) {
            progressPercentElement.textContent = `${progressPercent}%`;
        }

        if (mainProgressElement) {
            mainProgressElement.style.width = `${progressPercent}%`;
            mainProgressElement.className = 'progress-bar';
            if (progressPercent < 30) {
                mainProgressElement.classList.add('bg-warning');
            } else if (progressPercent < 70) {
                mainProgressElement.classList.add('bg-info');
            } else {
                mainProgressElement.classList.add('bg-success');
            }
        }

        // Update home page progress elements
        if (homeWordsLearned) {
            homeWordsLearned.textContent = wordsLearned;
        }

        if (homeWordsReview) {
            homeWordsReview.textContent = reviewWords;
        }

        if (homeSentencesLearned) {
            homeSentencesLearned.textContent = learnedSentences;
        }

        if (homeSentencesReview) {
            homeSentencesReview.textContent = reviewSentences;
        }

        if (homeQuizzesTaken) {
            homeQuizzesTaken.textContent = this.userData.quizzesTaken || 0;
        }

        if (learnedCountElement) {
            learnedCountElement.textContent = `${wordsLearned} learned`;
        }

        if (totalCountElement) {
            totalCountElement.textContent = `${totalWords} total`;
        }

        // Update difficulty levels and word of the day
        this.updateDifficultyLevels();
        this.updateWordOfTheDay();
    }

    updateWordOfTheDay() {
        const englishElement = document.getElementById('dailyWordEnglish');
        const urduElement = document.getElementById('dailyWordUrdu');
        const speakButton = document.getElementById('speakDailyWord');
        
        if (!englishElement || !urduElement) return;

        // Get available words based on user's current difficulty level
        const availableWords = this.getAvailableWords();
        
        if (availableWords.length === 0) return;

        // Create a simple hash from today's date
        const today = new Date();
        const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
        let hash = 0;
        for (let i = 0; i < dateString.length; i++) {
            const char = dateString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        // Use hash to pick a word from available words (ensure positive index)
        const wordIndex = Math.abs(hash) % availableWords.length;
        const dailyWord = availableWords[wordIndex];

        englishElement.textContent = dailyWord.english;
        urduElement.textContent = dailyWord.urdu;

        // Add speak functionality
        if (speakButton) {
            speakButton.onclick = () => this.speakText(dailyWord.english);
        }
    }

    updateDifficultyLevels() {
        const difficultyInfo = this.getCurrentDifficultyLevel();
        const levelsContainer = document.getElementById('difficultyLevels');
        const progressContainer = document.getElementById('levelProgress');
        
        if (!levelsContainer || !progressContainer) return;

        const levelIcons = {
            'Beginner': 'bi-star',
            'Medium': 'bi-star-fill',
            'Hard': 'bi-trophy'
        };

        let badgesHTML = '';
        Object.entries(difficultyInfo.levels).forEach(([level, data]) => {
            const isCurrent = difficultyInfo.current === level;
            const isUnlocked = data.unlocked;
            
            let badgeClass = 'difficulty-badge';
            if (isCurrent) badgeClass += ' current';
            else if (isUnlocked) badgeClass += ' unlocked';
            else badgeClass += ' locked';

            badgesHTML += `
                <div class="${badgeClass}">
                    <i class="difficulty-icon ${levelIcons[level]}"></i>
                    <div class="difficulty-name">${level}</div>
                    <div class="difficulty-progress">${Math.round(data.progress)}%</div>
                </div>
            `;
        });

        levelsContainer.innerHTML = badgesHTML;

        // Show current level progress
        const currentLevelData = difficultyInfo.levels[difficultyInfo.current];
        const nextLevel = difficultyInfo.current === 'Beginner' ? 'Medium' : 
                         difficultyInfo.current === 'Medium' ? 'Hard' : null;
        
        let progressHTML = `
            <div class="level-info">
                <div class="small text-muted mb-1">Current Level: <strong>${difficultyInfo.current}</strong></div>
                <div class="small">Progress: ${currentLevelData.learned}/${currentLevelData.total} words (${Math.round(currentLevelData.progress)}%)</div>
        `;

        if (nextLevel && currentLevelData.progress < 80) {
            const wordsNeeded = Math.ceil(currentLevelData.total * 0.8) - currentLevelData.learned;
            progressHTML += `
                <div class="small text-primary mt-1">
                    <i class="bi bi-lock"></i> Learn ${wordsNeeded} more words to unlock ${nextLevel} level
                </div>
            `;
        } else if (nextLevel && currentLevelData.progress >= 80) {
            progressHTML += `
                <div class="small text-success mt-1">
                    <i class="bi bi-unlock"></i> ${nextLevel} level unlocked!
                </div>
            `;
        } else if (!nextLevel) {
            progressHTML += `
                <div class="small text-warning mt-1">
                    <i class="bi bi-trophy"></i> Congratulations! You've mastered all levels!
                </div>
            `;
        }

        progressHTML += '</div>';
        progressContainer.innerHTML = progressHTML;
    }

    markWordAsLearned(wordId) {
        console.log('🎯 markWordAsLearned called with:', wordId);
        console.log('🎯 Current streakCount before:', this.userData.streakCount);
        console.log('🎯 Current lastStudyDate before:', this.userData.lastStudyDate);
        
        // Ensure arrays exist
        if (!this.userData.learnedWords) {
            this.userData.learnedWords = [];
        }
        if (!this.userData.reviewWords) {
            this.userData.reviewWords = [];
        }
        
        if (!this.userData.learnedWords.includes(wordId)) {
            this.userData.learnedWords.push(wordId);
            
            // Remove from review if it was there
            const reviewIndex = this.userData.reviewWords.indexOf(wordId);
            if (reviewIndex > -1) {
                this.userData.reviewWords.splice(reviewIndex, 1);
            }
            
            console.log('🎯 About to call updateStreak...');
            this.updateStreak();
            console.log('🎯 After updateStreak - streakCount:', this.userData.streakCount);
            console.log('🎯 After updateStreak - lastStudyDate:', this.userData.lastStudyDate);
            
            this.saveUserData();
            this.updateDashboard();
            console.log('Word marked as learned. Learned words:', this.userData.learnedWords);
        } else {
            console.log('Word already learned');
        }
    }

    markWordForReview(wordId) {
        console.log('Marking word for review:', wordId);
        
        // Ensure arrays exist
        if (!this.userData.learnedWords) {
            this.userData.learnedWords = [];
        }
        if (!this.userData.reviewWords) {
            this.userData.reviewWords = [];
        }
        
        // Remove from learned words if it was there
        const learnedIndex = this.userData.learnedWords.indexOf(wordId);
        if (learnedIndex > -1) {
            this.userData.learnedWords.splice(learnedIndex, 1);
        }
        
        // Add to review words if not already there
        if (!this.userData.reviewWords.includes(wordId)) {
            this.userData.reviewWords.push(wordId);
        }
        
        this.saveUserData();
        this.updateDashboard();
        console.log('Word marked for review. Review words:', this.userData.reviewWords);
        console.log('Learned words after removal:', this.userData.learnedWords);
    }

    markSentenceAsLearned(sentenceId) {
        console.log('Marking sentence as learned:', sentenceId);
        
        // Ensure arrays exist
        if (!this.userData.learnedSentences) {
            this.userData.learnedSentences = [];
        }
        if (!this.userData.reviewSentences) {
            this.userData.reviewSentences = [];
        }
        
        if (!this.userData.learnedSentences.includes(sentenceId)) {
            this.userData.learnedSentences.push(sentenceId);
            
            // Remove from review if it was there
            const reviewIndex = this.userData.reviewSentences.indexOf(sentenceId);
            if (reviewIndex > -1) {
                this.userData.reviewSentences.splice(reviewIndex, 1);
            }
            
            this.saveUserData();
            console.log('Sentence marked as learned. Learned sentences:', this.userData.learnedSentences);
        }
    }

    markSentenceForReview(sentenceId) {
        console.log('Marking sentence for review:', sentenceId);
        
        // Ensure arrays exist
        if (!this.userData.learnedSentences) {
            this.userData.learnedSentences = [];
        }
        if (!this.userData.reviewSentences) {
            this.userData.reviewSentences = [];
        }
        
        // Remove from learned sentences if it was there
        const learnedIndex = this.userData.learnedSentences.indexOf(sentenceId);
        if (learnedIndex > -1) {
            this.userData.learnedSentences.splice(learnedIndex, 1);
        }
        
        // Add to review sentences if not already there
        if (!this.userData.reviewSentences.includes(sentenceId)) {
            this.userData.reviewSentences.push(sentenceId);
        }
        
        this.saveUserData();
        console.log('Sentence marked for review. Review sentences:', this.userData.reviewSentences);
    }

    checkUpdateBanner() {
        // SIMPLE: Only show if flag is true, and verify it's actually needed
        const updateFlag = localStorage.getItem('wordwave_update_available');
        console.log('🔍 Checking update banner - flag:', updateFlag);
        
        if (updateFlag === 'true') {
            // Verify there's actually an update available
            this.verifyUpdateAvailability().then(hasUpdate => {
                if (hasUpdate) {
                    console.log('✅ Update verified - showing banner');
                    this.showUpdateBanner();
                } else {
                    console.log('❌ No actual update - clearing flag');
                    localStorage.removeItem('wordwave_update_available');
                    localStorage.removeItem('wordwave_update_timestamp');
                    localStorage.removeItem('wordwave_update_version');
                }
            });
        }
    }

    async verifyUpdateAvailability() {
        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    // Check if there's actually a waiting service worker
                    const hasWaiting = !!registration.waiting;
                    const hasInstalling = !!registration.installing;
                    console.log('🔍 SW verification - waiting:', hasWaiting, 'installing:', hasInstalling);
                    return hasWaiting || hasInstalling;
                }
            }
            return false;
        } catch (error) {
            console.error('Error verifying update:', error);
            return false;
        }
    }

    showUpdateBanner() {
        const banner = document.getElementById('updateBanner');
        if (banner) {
            banner.classList.remove('d-none');
            
            // Add click handler for install button
            const installBtn = document.getElementById('installUpdateFromBanner');
            if (installBtn && !installBtn.hasAttribute('data-listener')) {
                installBtn.setAttribute('data-listener', 'true');
                installBtn.addEventListener('click', () => {
                    this.installUpdateFromBanner();
                });
            }
        }
    }

    hideUpdateBanner() {
        const banner = document.getElementById('updateBanner');
        if (banner) {
            banner.classList.add('d-none');
        }
    }

    async installUpdateFromBanner() {
        const installBtn = document.getElementById('installUpdateFromBanner');
        if (installBtn) {
            installBtn.disabled = true;
            installBtn.innerHTML = '<i class="bi bi-arrow-clockwise spin me-1"></i>Installing...';
        }

        try {
            console.log('🔄 Starting update installation...');
            
            // Get service worker registration
            const registration = await navigator.serviceWorker.getRegistration();
            console.log('🔍 Registration found:', !!registration);
            console.log('🔍 Waiting SW:', !!registration?.waiting);
            console.log('🔍 Installing SW:', !!registration?.installing);
            
            if (registration && (registration.waiting || registration.installing)) {
                console.log('🔄 Installing update...');
                
                // Clear ALL update flags FIRST
                localStorage.removeItem('wordwave_update_available');
                localStorage.removeItem('wordwave_update_timestamp');
                localStorage.removeItem('wordwave_update_version');
                console.log('🧹 Cleared ALL update flags');
                
                // Apply the update
                const workerToActivate = registration.waiting || registration.installing;
                workerToActivate.postMessage({ type: 'SKIP_WAITING' });
                
                // Force reload after a short delay
                setTimeout(() => {
                    console.log('🔄 Force reloading page...');
                    window.location.reload(true);
                }, 1000);
                
            } else {
                console.log('❌ No waiting service worker found, performing nuclear reset');
                
                // Nuclear option: unregister all service workers and reload
                if ('serviceWorker' in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (let registration of registrations) {
                        console.log('🗑️ Unregistering SW:', registration.scope);
                        await registration.unregister();
                    }
                }
                
                // Clear ALL update flags
                localStorage.removeItem('wordwave_update_available');
                localStorage.removeItem('wordwave_update_timestamp');
                localStorage.removeItem('wordwave_update_version');
                
                // Clear all caches
                if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    for (const cacheName of cacheNames) {
                        console.log('🗑️ Deleting cache:', cacheName);
                        await caches.delete(cacheName);
                    }
                }
                
                // Hide banner and reload
                this.hideUpdateBanner();
                console.log('🔄 Nuclear reset complete, reloading...');
                window.location.reload(true);
            }
        } catch (error) {
            console.error('Error installing update:', error);
            
            // Clear potentially stale flag
            localStorage.removeItem('wordwave_update_available');
            localStorage.removeItem('wordwave_update_timestamp');
            this.hideUpdateBanner();
            
            if (installBtn) {
                installBtn.disabled = false;
                installBtn.innerHTML = '<i class="bi bi-download me-1"></i>Install';
            }
        }
    }

    updateStreak() {
        const today = new Date().toDateString();
        console.log('🔥 Checking streak - Today:', today, 'Last study date:', this.userData.lastStudyDate);
        
        // Use lastStudyDate instead of lastLogin for streak tracking
        if (this.userData.lastStudyDate !== today) {
            const oldStreak = this.userData.streakCount || 0;
            
            // Update through the correct state path
            this.state.state.user.streakCount = oldStreak + 1;
            this.state.state.user.lastStudyDate = today;
            
            this.saveUserData();
            
            // Update the badge immediately
            updateHeaderElement('streakBadge', `🔥 ${this.userData.streakCount}`);
        } else {
            console.log('🔥 Already studied today, current streak:', this.userData.streakCount);
        }
    }

    setupEventListeners() {
        // Handle tab navigation highlighting
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '' && href === 'index.html') || 
                (currentPath === '/' && href === 'index.html')) {
                link.classList.add('active');
            }
        });

        // Reset progress button - handled by settings.js on settings page
        // Removed duplicate event listener to prevent double prompts
    }

    resetAllProgress() {
        // Reset user data to initial state
        this.userData = {
            learnedWords: [],
            reviewWords: [],
            streak: 0,
            lastLogin: null,
            totalStudyTime: 0
        };
        
        // Reset using centralized state
        this.state.reset();
        
        // Reset flashcard global state
        if (typeof FlashcardManager !== 'undefined') {
            FlashcardManager.resetGlobalState();
        }
        
        // Show confirmation
        alert('All progress has been reset successfully!');
        
        // Reload the page to refresh all components
        window.location.reload();
    }

    getCurrentDifficultyLevel() {
        const learnedWords = this.userData.learnedWords || [];
        
        // Count words by difficulty
        const beginnerWords = vocabularyData.filter(word => word.difficulty === 'Beginner');
        const mediumWords = vocabularyData.filter(word => word.difficulty === 'Medium');
        const hardWords = vocabularyData.filter(word => word.difficulty === 'Hard');
        
        const learnedBeginner = beginnerWords.filter(word => learnedWords.includes(word.id)).length;
        const learnedMedium = mediumWords.filter(word => learnedWords.includes(word.id)).length;
        const learnedHard = hardWords.filter(word => learnedWords.includes(word.id)).length;
        
        const beginnerProgress = beginnerWords.length > 0 ? (learnedBeginner / beginnerWords.length) * 100 : 0;
        const mediumProgress = mediumWords.length > 0 ? (learnedMedium / mediumWords.length) * 100 : 0;
        const hardProgress = hardWords.length > 0 ? (learnedHard / hardWords.length) * 100 : 0;
        
        return {
            current: beginnerProgress >= 80 ? (mediumProgress >= 80 ? 'Hard' : 'Medium') : 'Beginner',
            levels: {
                Beginner: { learned: learnedBeginner, total: beginnerWords.length, progress: beginnerProgress, unlocked: true },
                Medium: { learned: learnedMedium, total: mediumWords.length, progress: mediumProgress, unlocked: beginnerProgress >= 80 },
                Hard: { learned: learnedHard, total: hardWords.length, progress: hardProgress, unlocked: mediumProgress >= 80 }
            }
        };
    }

    getAvailableWords() {
        const difficultyInfo = this.getCurrentDifficultyLevel();
        const currentLevel = difficultyInfo.current;
        
        // Return words up to current unlocked level
        return vocabularyData.filter(word => {
            if (currentLevel === 'Beginner') return word.difficulty === 'Beginner';
            if (currentLevel === 'Medium') return word.difficulty === 'Beginner' || word.difficulty === 'Medium';
            // Update user properties for notifications when words are learned
        if (window.notificationManager?.initialized) {
            window.notificationManager.setUserProperties();
        }
        
        return true; // Hard level - all words available
        });
    }

    speakText(text) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Get available voices
            const voices = window.speechSynthesis.getVoices();
            
            // Try to find English (India) voice
            const indianEnglishVoice = voices.find(voice => 
                voice.lang.includes('en-IN') || 
                voice.name.toLowerCase().includes('india') ||
                voice.name.toLowerCase().includes('indian')
            );
            
            // Fallback to any English voice if Indian not available
            const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
            
            // Set the voice
            if (indianEnglishVoice) {
                utterance.voice = indianEnglishVoice;
            } else if (englishVoice) {
                utterance.voice = englishVoice;
            }
            
            utterance.lang = 'en-IN'; // Set language to English (India)
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        } else {
            console.log('Text-to-speech not supported');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.app = new EnglishLearningApp();
});