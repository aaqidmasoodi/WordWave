// js/app.js
class EnglishLearningApp {
    constructor() {
        this.userData = this.loadUserData();
        this.sessionStartTime = Date.now();
        this.sessionTimer = null;
        this.init();
        this.startSessionTracking();
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
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay(); // 0 = Sunday
        const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD

        if (!this.userData.usageTracking) {
            this.userData.usageTracking = {};
        }

        if (!this.userData.usageTracking[dateKey]) {
            this.userData.usageTracking[dateKey] = {};
        }

        const timeKey = `${day}-${hour}`;
        this.userData.usageTracking[dateKey][timeKey] = 
            (this.userData.usageTracking[dateKey][timeKey] || 0) + 1;

        this.saveUserData();
    }

    endSession() {
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    init() {
        this.updateDashboard();
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
        try {
            localStorage.setItem('englishLearningUserData', JSON.stringify(this.userData));
        } catch (e) {
            console.error('Error saving user data:', e);
        }
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

        if (streakBadge) {
            streakBadge.textContent = `🔥 ${this.userData.streak || 0}`;
        }

        if (wordsBadge) {
            wordsBadge.textContent = `${wordsLearned}/${totalWords}`;
        }

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
        console.log('Marking word as learned:', wordId);
        
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
            
            this.updateStreak();
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

    updateStreak() {
        const today = new Date().toDateString();
        if (this.userData.lastLogin !== today) {
            this.userData.streak = (this.userData.streak || 0) + 1;
            this.userData.lastLogin = today;
            this.saveUserData();
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

        // Reset progress button
        const resetBtn = document.getElementById('resetProgressBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
                    this.resetAllProgress();
                }
            });
        }
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
        
        // Clear all session data
        localStorage.removeItem('flashcardSession');
        localStorage.removeItem('sentenceSession');
        localStorage.removeItem('quizSession');
        
        // Save the reset data
        this.saveUserData();
        
        // Update all UI elements
        this.updateDashboard();
        
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