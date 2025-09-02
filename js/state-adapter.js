/**
 * State Migration Adapter
 * Bridges old app.js system with new centralized state
 * Allows gradual migration without breaking existing functionality
 */

class StateAdapter {
    constructor() {
        this.state = window.appState;
        this.legacyApp = null;
        this.migrationComplete = false;
        
        this.setupLegacyBridge();
        this.migrateExistingData();
    }

    setupLegacyBridge() {
        // Wait for app.js to initialize
        const checkApp = () => {
            if (window.app) {
                this.legacyApp = window.app;
                this.bridgeLegacyMethods();
                this.syncLegacyData();
            } else {
                setTimeout(checkApp, 100);
            }
        };
        checkApp();
    }

    bridgeLegacyMethods() {
        // Bridge userData getter/setter with live sync
        Object.defineProperty(this.legacyApp, 'userData', {
            get: () => {
                const currentUser = this.state.getState('user');
                // Always return fresh data and update the internal object
                Object.assign(this.legacyApp._userData || {}, currentUser);
                return currentUser;
            },
            set: (value) => {
                this.state.setState('user', value);
                this.legacyApp._userData = value;
            }
        });

        // Bridge key methods to use new state
        const originalMethods = {
            markWordAsLearned: this.legacyApp.markWordAsLearned.bind(this.legacyApp),
            markWordForReview: this.legacyApp.markWordForReview.bind(this.legacyApp),
            markSentenceAsLearned: this.legacyApp.markSentenceAsLearned.bind(this.legacyApp),
            markSentenceForReview: this.legacyApp.markSentenceForReview.bind(this.legacyApp),
            saveUserData: this.legacyApp.saveUserData.bind(this.legacyApp)
        };

        // Override with state-aware versions
        this.legacyApp.markWordAsLearned = (wordId) => {
            this.state.addLearnedWord(wordId);
            this.state.removeReviewWord(wordId);
            // Update legacy userData to trigger UI updates
            this.syncToLegacy();
        };

        this.legacyApp.markWordForReview = (wordId) => {
            this.state.addReviewWord(wordId);
            // Update legacy userData to trigger UI updates
            this.syncToLegacy();
        };

        this.legacyApp.markSentenceAsLearned = (sentenceId) => {
            this.state.updateState('user.learnedSentences', sentences => {
                if (!sentences.includes(sentenceId)) {
                    return [...sentences, sentenceId];
                }
                return sentences;
            });
            this.syncToLegacy();
        };

        this.legacyApp.markSentenceForReview = (sentenceId) => {
            this.state.updateState('user.reviewSentences', sentences => {
                if (!sentences.includes(sentenceId)) {
                    return [...sentences, sentenceId];
                }
                return sentences;
            });
            this.syncToLegacy();
        };

        this.legacyApp.saveUserData = () => {
            // Data is auto-saved by state system
            this.state.persistState('user');
        };
    }

    syncToLegacy() {
        // Force update the legacy userData object to trigger UI updates
        const currentUser = this.state.getState('user');
        
        // Update internal userData if it exists
        if (this.legacyApp._userData) {
            Object.assign(this.legacyApp._userData, currentUser);
        }
        
        // Force save to localStorage to ensure persistence
        localStorage.setItem('wordWaveUserData', JSON.stringify(currentUser));
        
        // Trigger any legacy UI updates immediately
        setTimeout(() => {
            if (this.legacyApp.updateDashboard) {
                this.legacyApp.updateDashboard();
            }
            if (this.legacyApp.updateUI) {
                this.legacyApp.updateUI();
            }
            
            // Force update any progress displays
            const event = new CustomEvent('userDataUpdated', { detail: currentUser });
            window.dispatchEvent(event);
        }, 0);
    }

    syncLegacyData() {
        // Sync any existing localStorage data to new state
        const legacyData = localStorage.getItem('wordWaveUserData');
        if (legacyData) {
            try {
                const parsed = JSON.parse(legacyData);
                this.state.setState('user', {
                    ...this.state.getState('user'),
                    ...parsed
                }, { silent: true });
            } catch (error) {
                console.warn('Failed to migrate legacy data:', error);
            }
        }
    }

    migrateExistingData() {
        // Migrate old session data
        const migrations = [
            { old: 'flashcardSession', new: 'sessions.flashcards' },
            { old: 'sentenceSession', new: 'sessions.sentences' },
            { old: 'quizSession', new: 'sessions.quiz' }
        ];

        migrations.forEach(({ old, new: newPath }) => {
            const oldData = localStorage.getItem(old);
            if (oldData) {
                try {
                    const parsed = JSON.parse(oldData);
                    // Map old structure to new structure
                    const mapped = this.mapLegacySession(parsed, old);
                    this.state.setState(newPath, mapped, { silent: true });
                    
                    // Remove old data
                    localStorage.removeItem(old);
                } catch (error) {
                    console.warn(`Failed to migrate ${old}:`, error);
                }
            }
        });
    }

    mapLegacySession(data, type) {
        const baseSession = this.state.getInitialState().sessions;
        
        switch (type) {
            case 'flashcardSession':
                return {
                    ...baseSession.flashcards,
                    currentIndex: data.currentIndex || 0,
                    results: data.results || [],
                    sessionWords: data.sessionWords || [],
                    isActive: true,
                    timestamp: data.timestamp || Date.now()
                };
                
            case 'sentenceSession':
                return {
                    ...baseSession.sentences,
                    currentIndex: data.currentIndex || 0,
                    results: data.results || [],
                    sessionSentences: data.sessionSentences || [],
                    isActive: true,
                    timestamp: data.timestamp || Date.now()
                };
                
            case 'quizSession':
                return {
                    ...baseSession.quiz,
                    currentIndex: data.currentIndex || 0,
                    score: data.score || 0,
                    results: data.results || [],
                    questions: data.questions || [],
                    isActive: true,
                    timestamp: data.timestamp || Date.now()
                };
                
            default:
                return data;
        }
    }

    // Helper methods for components to gradually migrate
    getFlashcardSession() {
        return this.state.getState('sessions.flashcards');
    }

    updateFlashcardSession(updates) {
        return this.state.updateState('sessions.flashcards', updates);
    }

    getSentenceSession() {
        return this.state.getState('sessions.sentences');
    }

    updateSentenceSession(updates) {
        return this.state.updateState('sessions.sentences', updates);
    }

    getQuizSession() {
        return this.state.getState('sessions.quiz');
    }

    updateQuizSession(updates) {
        return this.state.updateState('sessions.quiz', updates);
    }

    // Subscribe to state changes
    onUserDataChange(callback) {
        return this.state.subscribe('user', callback);
    }

    onSessionChange(type, callback) {
        return this.state.subscribe(`sessions.${type}`, callback);
    }
}

// Initialize adapter
window.stateAdapter = new StateAdapter();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StateAdapter;
}
