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
        ['flashcard', 'sentence', 'quiz'].forEach(type => {
            this.clearSession(type);
        });
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
            totalStudyTime: 0
        };
        
        this.clearAllSessions();
        this.saveUserData();
    }
}

// Create global instance
window.appState = new AppState();
