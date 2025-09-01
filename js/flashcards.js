// js/flashcards.js
class FlashcardManager {
    constructor() {
        this.currentCardIndex = 0;
        this.userData = window.app.userData;
        this.sessionWords = this.generateSessionWords();
        this.init();
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
        
        // Calculate session size (max 20 words per session)
        const sessionSize = Math.min(20, newWords.length + wordsForReview.length + learnedWordsData.length);
        
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
        
        console.log(`Session: ${newCount} new, ${reviewCount} review, ${learnedCount} learned words`);
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

        // Update card counter
        document.getElementById('cardCounter').textContent = `${this.currentCardIndex + 1}/${this.sessionWords.length}`;

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

    nextCard() {
        this.currentCardIndex = (this.currentCardIndex + 1) % this.sessionWords.length;
        this.displayCurrentCard();
    }

    flipCard() {
        const flashcard = document.getElementById('flashcard');
        flashcard.classList.toggle('flipped');
    }

    markAsLearned() {
        const currentWord = this.sessionWords[this.currentCardIndex];
        console.log('Current word object:', currentWord);
        console.log('Word ID type:', typeof currentWord.id, 'Value:', currentWord.id);
        console.log('Review words before:', this.userData.reviewWords);
        console.log('Review words types:', this.userData.reviewWords.map(id => typeof id));
        
        window.app.markWordAsLearned(currentWord.id);
        
        console.log('Review words after:', this.userData.reviewWords);
        this.updateProgress();
        this.updateReviewStack();
        this.animateCardOut('right');
    }

    markForReview() {
        const currentWord = this.sessionWords[this.currentCardIndex];
        window.app.markWordForReview(currentWord.id);
        this.updateProgress();
        this.updateReviewStack();
        this.animateCardOut('left');
    }

    animateCardOut(direction) {
        const flashcard = document.getElementById('flashcard');
        
        // Show feedback
        const feedback = direction === 'left' ? 
            document.getElementById('leftFeedback') : 
            document.getElementById('rightFeedback');
        feedback.classList.add('show');
        
        // Animate out
        flashcard.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease';
        flashcard.style.transform = direction === 'left' ? 
            'translateX(-120vw) rotate(-30deg)' : 
            'translateX(120vw) rotate(30deg)';
        flashcard.style.opacity = '0';
        
        setTimeout(() => {
            feedback.classList.remove('show');
            // Reset all transforms and transitions
            flashcard.style.transition = '';
            flashcard.style.transform = '';
            flashcard.style.opacity = '';
            this.nextCard();
        }, 500);
    }

    updateProgress() {
        const totalCards = this.sessionWords.length;
        const currentCard = this.currentCardIndex + 1;
        const learnedCount = this.userData.learnedWords ? this.userData.learnedWords.length : 0;

        const progressPercent = totalCards > 0 ? Math.round((currentCard / totalCards) * 100) : 0;
        document.getElementById('cardProgress').style.width = `${progressPercent}%`;
        document.getElementById('progressText').textContent = `${progressPercent}%`;
        document.getElementById('learnedCards').textContent = `${learnedCount} learned`;
        document.getElementById('totalCards').textContent = `${vocabularyData.length} total`;
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
        const frontSpeakBtn = document.getElementById('frontSpeakBtn');
        const backSpeakBtn = document.getElementById('backSpeakBtn');

        // Speak buttons
        if (frontSpeakBtn) {
            frontSpeakBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const currentWord = this.sessionWords[this.currentCardIndex].english;
                window.app.speakText(currentWord);
            });
        }

        if (backSpeakBtn) {
            backSpeakBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const currentWord = this.sessionWords[this.currentCardIndex].english;
                window.app.speakText(currentWord);
            });
        }

        // Simple click/tap to flip (works on mobile)
        flashcard.addEventListener('click', (e) => {
            // Don't flip if clicking on speak buttons
            if (e.target.closest('#frontSpeakBtn') || e.target.closest('#backSpeakBtn')) {
                return;
            }
            this.flipCard();
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
                flashcard.style.transform = `translateX(${diffX * 0.3}px) rotate(${diffX * 0.1}deg)`;
            }
        };

        const handleEnd = () => {
            if (!startX) return;
            
            const diffX = currentX - startX;
            
            // Hide feedback
            document.getElementById('leftFeedback').classList.remove('show');
            document.getElementById('rightFeedback').classList.remove('show');
            
            // Reset transform
            flashcard.style.transform = '';
            
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
        flashcard.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            handleStart(touch.clientX, touch.clientY);
        }, { passive: false });

        flashcard.addEventListener('touchmove', (e) => {
            if (startX) {
                e.preventDefault(); // Prevent scrolling only if we're tracking
                const touch = e.touches[0];
                handleMove(touch.clientX, touch.clientY);
            }
        }, { passive: false });

        flashcard.addEventListener('touchend', (e) => {
            handleEnd();
        });

        // Mouse events for desktop testing
        flashcard.addEventListener('mousedown', (e) => {
            handleStart(e.clientX, e.clientY);
        });

        flashcard.addEventListener('mousemove', (e) => {
            if (startX) {
                handleMove(e.clientX, e.clientY);
            }
        });

        flashcard.addEventListener('mouseup', () => {
            handleEnd();
        });

        flashcard.addEventListener('mouseleave', () => {
            handleEnd();
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.app !== 'undefined') {
        window.flashcardManager = new FlashcardManager();
    }
});