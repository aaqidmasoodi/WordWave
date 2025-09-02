/**
 * Centralized State Management for WordWave
 * Replaces localStorage management in app.js
 */

class AppState {
    constructor() {
        this.state = {
            user: {
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
                totalStudyTime: 0
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
            quizzesTaken: 0
        };
        
        this.clearAllSessions();
        this.saveUserData();
        
        // Reset all global UI states
        if (window.flashcardState) {
            window.flashcardState = null;
        }
        if (window.sentenceState) {
            window.sentenceState = null;
        }
        
        // Also clear the old localStorage keys for compatibility
        localStorage.removeItem('englishLearningUserData');
        localStorage.removeItem('wordWaveUserData');
    }
}

// Create global instance
window.appState = new AppState();
