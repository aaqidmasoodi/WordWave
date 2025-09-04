/**
 * Centralized State Management for WordWave
 * Replaces localStorage management in app.js
 */

class AppState {
    constructor() {
        this.state = {
            user: {
                // User Profile
                profile: {
                    name: 'User',
                    avatar: 'U',
                    joinDate: new Date().toISOString()
                },
                
                // Learning Data
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
                
                // Voice Translations
                voiceTranslations: []
            },
            sessions: {
                flashcards: null,
                sentences: null,
                quiz: null
            }
        };
        
        this.loadState();
        this.setupAutoSave();
    }

    // User data methods
    getUserData() {
        return { ...this.state.user };
    }

    setUserData(userData) {
        this.state.user = { ...userData };
        this.saveUserData();
    }

    updateUserData(updates) {
        this.state.user = { ...this.state.user, ...updates };
        this.saveUserData();
    }

    // Profile Management
    updateProfile(profileData) {
        this.state.user.profile = { ...this.state.user.profile, ...profileData };
        
        // Auto-update avatar if name changes
        if (profileData.name) {
            this.state.user.profile.avatar = profileData.name.charAt(0).toUpperCase();
        }
        
        this.saveUserData();
    }

    getProfile() {
        return this.state.user.profile;
    }

    // Session methods
    getSession(type) {
        const saved = localStorage.getItem(`${type}Session`);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    saveSession(type, data) {
        localStorage.setItem(`${type}Session`, JSON.stringify(data));
        this.state.sessions[type] = data;
    }

    clearSession(type) {
        localStorage.removeItem(`${type}Session`);
        this.state.sessions[type] = null;
    }

    clearAllSessions() {
        console.log('Clearing all sessions...');
        
        // Clear localStorage session keys
        localStorage.removeItem('flashcardSession');
        localStorage.removeItem('sentenceSession');
        localStorage.removeItem('quizSession');
        
        console.log('Cleared localStorage sessions');
        
        // Clear internal session state
        this.state.sessions = {
            flashcards: null,
            sentences: null,
            quiz: null
        };
        
        console.log('Sessions cleared');
    }

    // Persistence
    loadState() {
        const saved = localStorage.getItem('wordWaveUserData');
        if (saved) {
            try {
                const userData = JSON.parse(saved);
                this.state.user = { ...this.state.user, ...userData };
            } catch (e) {
                console.warn('Failed to load user data');
            }
        }
    }

    saveUserData() {
        localStorage.setItem('wordWaveUserData', JSON.stringify(this.state.user));
    }

    setupAutoSave() {
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveUserData();
        });
    }

    // Session management for flashcards
    getFlashcardSession() {
        const saved = localStorage.getItem('wordwave_flashcard_session');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error parsing flashcard session:', e);
            }
        }
        return null;
    }

    saveFlashcardSession(sessionWords, currentIndex, results) {
        const session = {
            words: sessionWords,
            currentIndex: currentIndex,
            results: results,
            timestamp: Date.now()
        };
        localStorage.setItem('wordwave_flashcard_session', JSON.stringify(session));
    }

    clearFlashcardSession() {
        localStorage.removeItem('wordwave_flashcard_session');
    }

    // Session management for sentences
    getSentenceSession() {
        const saved = localStorage.getItem('wordwave_sentence_session');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error parsing sentence session:', e);
            }
        }
        return null;
    }

    saveSentenceSession(sessionSentences, currentIndex, results) {
        const session = {
            sentences: sessionSentences,
            currentIndex: currentIndex,
            results: results,
            timestamp: Date.now()
        };
        localStorage.setItem('wordwave_sentence_session', JSON.stringify(session));
    }

    clearSentenceSession() {
        localStorage.removeItem('wordwave_sentence_session');
    }

    // Reset
    reset() {
        this.state.user = {
            learnedWords: [],
            reviewWords: [],
            learnedSentences: [],
            reviewSentences: [],
            currentDifficulty: 'beginner',
            streakCount: 0,
            lastStudyDate: null,
            totalStudyTime: 0,
            quizzesTaken: 0,
            voiceTranslations: []
        };
        
        this.clearAllSessions();
        this.saveUserData();
        
        // Clear Groq API key
        localStorage.removeItem('groqApiKey');
        
        // Reset all global UI states
        if (window.flashcardState) {
            window.flashcardState = null;
        }
        if (window.sentenceState) {
            window.sentenceState = null;
        }
        
        // Refresh synthesiser page if it exists
        if (window.voiceSynthesiser) {
            window.voiceSynthesiser.loadTranslations();
        }
        
        // Update voice translations UI
        this.updateVoiceTranslationsUI();
        
        // Also clear the old localStorage keys for compatibility
        localStorage.removeItem('englishLearningUserData');
        localStorage.removeItem('wordWaveUserData');
        localStorage.removeItem('voiceTranslations'); // Clear old voice translations storage
    }
    
    // Voice Translations Management
    getVoiceTranslations() {
        return this.state.user.voiceTranslations || [];
    }
    
    addVoiceTranslation(translation) {
        if (!this.state.user.voiceTranslations) {
            this.state.user.voiceTranslations = [];
        }
        this.state.user.voiceTranslations.unshift(translation); // Add to beginning
        this.saveUserData();
        
        // Update header button state
        this.updateVoiceTranslationsUI();
    }
    
    deleteVoiceTranslation(id) {
        if (!this.state.user.voiceTranslations) return;
        this.state.user.voiceTranslations = this.state.user.voiceTranslations.filter(t => t.id !== id);
        this.saveUserData();
        
        // Update header button state
        this.updateVoiceTranslationsUI();
    }
    
    clearAllVoiceTranslations() {
        this.state.user.voiceTranslations = [];
        this.saveUserData();
        
        // Update header button state
        this.updateVoiceTranslationsUI();
        
        // Reload translations list
        if (window.voiceSynthesiser) {
            window.voiceSynthesiser.loadTranslations();
        }
    }
    
    updateVoiceTranslationsUI() {
        const clearAllBtn = document.getElementById('clearAllBtn');
        if (clearAllBtn) {
            const hasTranslations = this.getVoiceTranslations().length > 0;
            clearAllBtn.disabled = !hasTranslations;
            if (hasTranslations) {
                clearAllBtn.classList.remove('disabled');
            } else {
                clearAllBtn.classList.add('disabled');
            }
        }
    }
    
    // Simple update flag management for PWA manager
    setUpdateFlag(available) {
        if (available) {
            localStorage.setItem('wordwave_update_available', 'true');
            localStorage.setItem('wordwave_update_timestamp', Date.now().toString());
        } else {
            localStorage.removeItem('wordwave_update_available');
            localStorage.removeItem('wordwave_update_timestamp');
        }
    }
}

// Create global instance
window.appState = new AppState();
