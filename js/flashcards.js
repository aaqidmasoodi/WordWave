// js/flashcards.js
// js/flashcards.js
class FlashcardManager {
    constructor() {
        this.userData = window.app.userData;
        this.sessionWords = this.generateSessionWords();
        this.initializeGlobalState();
        this.loadSessionState();
        this.init();
    }

    initializeGlobalState() {
        if (!window.flashcardState) {
            window.flashcardState = {
                currentCardIndex: 0,
                sessionResults: []
            };
        }
    }

    // Getters that always read from global state
    get currentCardIndex() {
        return window.flashcardState.currentCardIndex;
    }

    set currentCardIndex(value) {
        window.flashcardState.currentCardIndex = value;
    }

    get sessionResults() {
        return window.flashcardState.sessionResults;
    }

    set sessionResults(value) {
        window.flashcardState.sessionResults = value;
    }

    // Global reset function
    static resetGlobalState() {
        window.flashcardState = {
            currentCardIndex: 0,
            sessionResults: []
        };
        localStorage.removeItem('flashcardSession');
    }

    loadSessionState() {
        const saved = localStorage.getItem('flashcardSession');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                if (state.sessionLength === this.sessionWords.length) {
                    window.flashcardState.currentCardIndex = state.currentIndex || 0;
                    window.flashcardState.sessionResults = state.results || [];
                    return;
                }
            } catch (e) {}
        }
        
        // Reset to fresh state
        window.flashcardState.currentCardIndex = 0;
        window.flashcardState.sessionResults = [];
    }

    saveSessionState() {
        const state = {
            currentIndex: this.currentCardIndex,
            results: this.sessionResults,
            sessionLength: this.sessionWords.length,
            timestamp: Date.now()
        };
        localStorage.setItem('flashcardSession', JSON.stringify(state));
    }

    generateSessionWords() {
        const learnedWords = this.userData.learnedWords || [];
        const reviewWords = this.userData.reviewWords || [];
        
        // Get available words based on difficulty level
        const availableWords = window.app.getAvailableWords();
        
        // Get new words (not learned and not in review)
        const newWords = availableWords.filter(word => 
            !learnedWords.includes(word.id) && !reviewWords.includes(word.id)
        );
        
        // Get review words (marked for review)
        const wordsForReview = availableWords.filter(word => reviewWords.includes(word.id));
        
        // Get previously learned words (for occasional review)
        const learnedWordsData = availableWords.filter(word => learnedWords.includes(word.id));
        
        // Calculate session size (max 5 words per session)
        const sessionSize = Math.min(5, newWords.length + wordsForReview.length + learnedWordsData.length);
        
        // Calculate mix: 60% new, 30% review, 10% learned
        const learnedCount = Math.min(Math.floor(sessionSize * 0.1), learnedWordsData.length);
        const reviewCount = Math.min(Math.floor(sessionSize * 0.3), wordsForReview.length);
        const newCount = sessionSize - reviewCount - learnedCount;
        
        // Select words and create copies with proper flags
        const selectedLearned = this.shuffleArray([...learnedWordsData]).slice(0, learnedCount)
            .map(word => ({...word, wordType: 'learned'}));
        const selectedReview = this.shuffleArray([...wordsForReview]).slice(0, reviewCount)
            .map(word => ({...word, wordType: 'review'}));
        const selectedNew = this.shuffleArray([...newWords]).slice(0, newCount)
            .map(word => ({...word, wordType: 'new'}));
        
        // Combine and shuffle
        const sessionWords = this.shuffleArray([...selectedNew, ...selectedReview, ...selectedLearned]);
        
        return sessionWords;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    init() {
        this.displayCurrentCard();
        this.displayNextCard();
        this.updateProgress();
        this.updateReviewStack();
        this.setupEventListeners();
    }

    displayCurrentCard() {
        const word = this.sessionWords[this.currentCardIndex];
        if (!word) return;

        document.getElementById('currentWord').textContent = word.english;
        document.getElementById('wordTranslation').textContent = word.urdu;
        document.getElementById('wordPhonetic').textContent = word.phonetic;

        // Update card counter using global function
        updateHeaderElement('cardCounter', `${this.currentCardIndex + 1}/${this.sessionWords.length}`);

        // Show appropriate indicator
        const flashcard = document.getElementById('flashcard');
        flashcard.classList.remove('review-word', 'learned-word');
        
        if (word.wordType === 'review') {
            flashcard.classList.add('review-word');
        } else if (word.wordType === 'learned') {
            flashcard.classList.add('learned-word');
        }

        // Reset card flip
        flashcard.classList.remove('flipped');

        this.updateProgress();
    }

    displayNextCard() {
        const nextIndex = this.currentCardIndex + 1;
        
        // If we're at the last card, show a preview of what's coming next
        if (nextIndex >= this.sessionWords.length) {
            const nextFlashcard = document.getElementById('nextFlashcard');
            nextFlashcard.innerHTML = `
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        <div class="text-center p-4">
                            <i class="bi bi-arrow-clockwise text-primary fs-1 mb-3"></i>
                            <h3 class="h5 mb-2">New Session</h3>
                            <p class="text-muted small">Fresh cards coming up!</p>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        const nextWord = this.sessionWords[nextIndex];
        if (!nextWord) return;

        document.getElementById('nextCurrentWord').textContent = nextWord.english;
        document.getElementById('nextWordTranslation').textContent = nextWord.urdu;
        document.getElementById('nextWordPhonetic').textContent = nextWord.phonetic;

        // Show appropriate indicator for next card
        const nextFlashcard = document.getElementById('nextFlashcard');
        nextFlashcard.classList.remove('review-word', 'learned-word');
        
        if (nextWord.wordType === 'review') {
            nextFlashcard.classList.add('review-word');
        } else if (nextWord.wordType === 'learned') {
            nextFlashcard.classList.add('learned-word');
        }

        // Reset card flip
        nextFlashcard.classList.remove('flipped');
    }

    nextCard() {
        const oldIndex = this.currentCardIndex;
        this.currentCardIndex++;
        
        // Check if we've completed the session
        if (this.currentCardIndex >= this.sessionWords.length) {
            // Generate new session with 80% new, 10% learned, 10% review
            this.sessionWords = this.generateSessionWords();
            this.currentCardIndex = 0;
            this.sessionResults = [];
            
            // Clear session storage to start fresh
            localStorage.removeItem('flashcardSession');
            
            // Reset global state
            if (window.flashcardState) {
                window.flashcardState.currentCardIndex = 0;
                window.flashcardState.sessionResults = [];
            }
            
            console.log('Generated new session with', this.sessionWords.length, 'cards');
        } else {
            this.saveSessionState();
        }
        
        this.updateCardCounter();
        this.updateProgress();
    }

    flipCard() {
        const flashcard = document.getElementById('flashcard');
        flashcard.classList.toggle('flipped');
    }

    markAsLearned() {
        const currentWord = this.sessionWords[this.currentCardIndex];
        
        // Record the result
        this.sessionResults[this.currentCardIndex] = 'learned';
        this.saveSessionState();
        
        window.app.markWordAsLearned(currentWord.id);
        
        this.updateProgress();
        this.updateReviewStack();
        this.animateCardOut('right');
    }

    markForReview() {
        const currentWord = this.sessionWords[this.currentCardIndex];
        
        // Record the result
        this.sessionResults[this.currentCardIndex] = 'review';
        this.saveSessionState();
        
        window.app.markWordForReview(currentWord.id);
        this.updateProgress();
        this.updateReviewStack();
        this.animateCardOut('left');
    }

    animateCardOut(direction) {
        const flashcard = document.getElementById('flashcard');
        const nextFlashcard = document.getElementById('nextFlashcard');
        
        // Show feedback
        const feedback = direction === 'left' ? 
            document.getElementById('leftFeedback') : 
            document.getElementById('rightFeedback');
        feedback.classList.add('show');
        
        // Animate current card out
        flashcard.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease';
        flashcard.style.transform = direction === 'left' ? 
            'translateX(-120vw) rotate(-30deg)' : 
            'translateX(120vw) rotate(30deg)';
        flashcard.style.opacity = '0';
        
        // Animate next card to front position
        nextFlashcard.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        nextFlashcard.style.transform = 'scale(1) translateY(0)';
        nextFlashcard.style.opacity = '1';
        nextFlashcard.style.zIndex = '2';
        
        setTimeout(() => {
            feedback.classList.remove('show');
            
            // Move to next card
            this.nextCard();
            
            // Completely hide the swiped card to prevent glitch
            flashcard.style.display = 'none';
            
            setTimeout(() => {
                // Reset and reposition the swiped card as the new back card
                flashcard.style.display = 'block';
                flashcard.style.transition = '';
                flashcard.style.transform = 'scale(0.95) translateY(8px)';
                flashcard.style.opacity = '0.8';
                flashcard.style.zIndex = '1';
                
                // Update the back card with the next word content
                const nextNextIndex = (this.currentCardIndex + 1) % this.sessionWords.length;
                const nextNextWord = this.sessionWords[nextNextIndex];
                
                if (nextNextWord) {
                    flashcard.querySelector('#currentWord, #nextCurrentWord').textContent = nextNextWord.english;
                    flashcard.querySelector('#wordTranslation, #nextWordTranslation').textContent = nextNextWord.urdu;
                    flashcard.querySelector('#wordPhonetic, #nextWordPhonetic').textContent = nextNextWord.phonetic;
                    
                    // Update indicators
                    flashcard.classList.remove('review-word', 'learned-word');
                    if (nextNextWord.wordType === 'review') {
                        flashcard.classList.add('review-word');
                    } else if (nextNextWord.wordType === 'learned') {
                        flashcard.classList.add('learned-word');
                    }
                    flashcard.classList.remove('flipped');
                }
                
                // Swap IDs
                const tempId = flashcard.id;
                flashcard.id = nextFlashcard.id;
                nextFlashcard.id = tempId;
                
                // Update progress and card counter immediately
                this.updateProgress();
                this.updateCardCounter();
            }, 50);
            
        }, 500);
    }

    updateCardCounter() {
        document.getElementById('cardCounter').textContent = `${this.currentCardIndex + 1}/${this.sessionWords.length}`;
    }

    updateProgress() {
        const totalCards = this.sessionWords.length;
        const currentCard = this.currentCardIndex + 1;

        // Update circles
        this.updateProgressCircles();
        
        document.getElementById('progressText').textContent = `${currentCard}/${totalCards}`;
    }

    updateProgressCircles() {
        const container = document.getElementById('progressCircles');
        const totalCards = this.sessionWords.length;
        
        let circlesHTML = '';
        for (let i = 0; i < totalCards; i++) {
            let circleClass = 'progress-circle';
            
            if (i < this.sessionResults.length) {
                // Already swiped
                circleClass += this.sessionResults[i] === 'learned' ? ' learned' : ' review';
            } else if (i === this.currentCardIndex) {
                // Current card
                circleClass += ' current';
            }
            
            circlesHTML += `<div class="${circleClass}"></div>`;
        }
        
        container.innerHTML = circlesHTML;
    }

    updateReviewStack() {
        const reviewWords = this.userData.reviewWords || [];
        const reviewCount = document.getElementById('reviewCount');
        const reviewStack = document.getElementById('reviewStack');
        
        console.log('Updating review stack. Current review words:', reviewWords);
        
        reviewCount.textContent = reviewWords.length;
        
        if (reviewWords.length === 0) {
            reviewStack.innerHTML = '<div class="empty-stack text-center text-muted small py-2">No words in review stack</div>';
        } else {
            const reviewWordsData = vocabularyData.filter(word => reviewWords.includes(word.id));
            console.log('Review words data:', reviewWordsData.map(w => w.english));
            const chips = reviewWordsData.map(word => 
                `<span class="review-word-chip"><strong>${word.english}</strong> <em>${word.urdu}</em></span>`
            ).join('');
            reviewStack.innerHTML = chips;
        }
    }

    setupEventListeners() {
        const flashcard = document.getElementById('flashcard');
        const nextFlashcard = document.getElementById('nextFlashcard');

        // Add swipe functionality to both cards
        this.addSwipeListeners(flashcard);
        this.addSwipeListeners(nextFlashcard);
    }

    addSwipeListeners(card) {
        // Simple click/tap to flip (works on mobile)
        card.addEventListener('click', (e) => {
            // Don't flip if clicking on speak buttons
            if (e.target.closest('button')) {
                return;
            }
            this.flipCard(card);
        });

        // Add speak button listeners for this card
        const speakButtons = card.querySelectorAll('button');
        speakButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                // Get the current word from the card that was clicked
                const wordElement = card.querySelector('#currentWord, #nextCurrentWord');
                if (wordElement) {
                    window.app.speakText(wordElement.textContent);
                }
            });
        });

        // Swipe handling
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let isDragging = false;

        const handleStart = (x, y) => {
            startX = x;
            startY = y;
            currentX = x;
            isDragging = false;
        };

        const handleMove = (x, y) => {
            if (!startX) return;
            
            currentX = x;
            const diffX = currentX - startX;
            const diffY = y - startY;
            
            // Only start dragging if horizontal movement is greater than vertical
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
                isDragging = true;
                
                // Visual feedback
                if (diffX > 30) {
                    document.getElementById('rightFeedback').classList.add('show');
                    document.getElementById('leftFeedback').classList.remove('show');
                } else if (diffX < -30) {
                    document.getElementById('leftFeedback').classList.add('show');
                    document.getElementById('rightFeedback').classList.remove('show');
                } else {
                    document.getElementById('leftFeedback').classList.remove('show');
                    document.getElementById('rightFeedback').classList.remove('show');
                }
                
                // Apply transform for visual drag
                card.style.transform = `translateX(${diffX * 0.3}px) rotate(${diffX * 0.1}deg)`;
            }
        };

        const handleEnd = () => {
            if (!startX) return;
            
            const diffX = currentX - startX;
            
            // Hide feedback
            document.getElementById('leftFeedback').classList.remove('show');
            document.getElementById('rightFeedback').classList.remove('show');
            
            // Reset transform
            card.style.transform = '';
            
            // Trigger action if dragged far enough
            if (isDragging && Math.abs(diffX) > 80) {
                if (diffX > 0) {
                    this.markAsLearned();
                } else {
                    this.markForReview();
                }
            }
            
            // Reset
            startX = 0;
            startY = 0;
            currentX = 0;
            isDragging = false;
        };

        // Touch events
        card.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            handleStart(touch.clientX, touch.clientY);
        }, { passive: false });

        card.addEventListener('touchmove', (e) => {
            if (startX) {
                e.preventDefault(); // Prevent scrolling only if we're tracking
                const touch = e.touches[0];
                handleMove(touch.clientX, touch.clientY);
            }
        }, { passive: false });

        card.addEventListener('touchend', (e) => {
            handleEnd();
        });

        // Mouse events for desktop testing
        card.addEventListener('mousedown', (e) => {
            handleStart(e.clientX, e.clientY);
        });

        card.addEventListener('mousemove', (e) => {
            if (startX) {
                handleMove(e.clientX, e.clientY);
            }
        });

        card.addEventListener('mouseup', () => {
            handleEnd();
        });

        card.addEventListener('mouseleave', () => {
            handleEnd();
        });
    }

    flipCard(card = null) {
        const targetCard = card || document.getElementById('flashcard');
        targetCard.classList.toggle('flipped');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.app !== 'undefined') {
        // Wait for header to load before initializing flashcards
        const initFlashcards = () => {
            window.flashcardManager = new FlashcardManager();
        };
        
        // Check if header elements exist, or wait for header loaded event
        const cardCounter = document.getElementById('cardCounter');
        if (cardCounter) {
            initFlashcards();
        } else {
            document.addEventListener('headerLoaded', initFlashcards);
        }
    }
});