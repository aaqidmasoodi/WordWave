class SentenceManager {
    constructor() {
        this.currentSentenceIndex = 0;
        this.userData = window.app.userData;
        this.sessionSentences = this.generateSessionSentences();
        this.init();
    }

    generateSessionSentences() {
        const learnedWords = this.userData.learnedWords || [];
        const learnedSentences = this.userData.learnedSentences || [];
        const reviewSentences = this.userData.reviewSentences || [];
        
        // Get all sentences from learned words only
        const availableSentences = [];
        
        vocabularyData.forEach(word => {
            if (learnedWords.includes(word.id) && word.sentences) {
                word.sentences.forEach(sentenceObj => {
                    availableSentences.push({
                        id: sentenceObj.id, // Use the sentence's own unique ID
                        english: sentenceObj.sentence,
                        urdu: sentenceObj.translation,
                        wordId: word.id,
                        wordEnglish: word.english,
                        category: word.category
                    });
                });
            }
        });

        if (availableSentences.length === 0) {
            return [];
        }
        
        // Separate sentences by status
        const newSentences = availableSentences.filter(sentence => 
            !learnedSentences.includes(sentence.id) && !reviewSentences.includes(sentence.id)
        );
        
        const sentencesForReview = availableSentences.filter(sentence => 
            reviewSentences.includes(sentence.id)
        );
        
        const learnedSentencesData = availableSentences.filter(sentence => 
            learnedSentences.includes(sentence.id)
        );
        
        // Calculate session size (max 20 sentences per session)
        const sessionSize = Math.min(20, availableSentences.length);
        
        // Calculate mix: 60% new, 30% review, 10% learned
        const learnedCount = Math.min(Math.floor(sessionSize * 0.1), learnedSentencesData.length);
        const reviewCount = Math.min(Math.floor(sessionSize * 0.3), sentencesForReview.length);
        const newCount = sessionSize - reviewCount - learnedCount;
        
        // Select sentences and create copies with proper flags
        const selectedLearned = this.shuffleArray([...learnedSentencesData]).slice(0, learnedCount)
            .map(sentence => ({...sentence, sentenceType: 'learned'}));
        const selectedReview = this.shuffleArray([...sentencesForReview]).slice(0, reviewCount)
            .map(sentence => ({...sentence, sentenceType: 'review'}));
        const selectedNew = this.shuffleArray([...newSentences]).slice(0, newCount)
            .map(sentence => ({...sentence, sentenceType: 'new'}));
        
        // Combine and shuffle
        const sessionSentences = this.shuffleArray([...selectedNew, ...selectedReview, ...selectedLearned]);
        
        console.log(`Sentence session: ${newCount} new, ${reviewCount} review, ${learnedCount} learned sentences from ${learnedWords.length} learned words`);
        return sessionSentences;
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
        if (this.sessionSentences.length === 0) {
            this.showNoSentencesMessage();
        } else {
            this.displayCurrentSentence();
            this.updateProgress();
            this.updateReviewStack();
            this.setupEventListeners();
        }
    }

    showNoSentencesMessage() {
        const sentenceCard = document.getElementById('sentenceCard');
        sentenceCard.innerHTML = `
            <div class="text-center p-4">
                <i class="bi bi-book text-muted fs-1 mb-3"></i>
                <h3 class="h5 mb-3">No Sentences Available</h3>
                <p class="text-muted mb-3">Learn some words first to unlock their sentences for practice.</p>
                <a href="flashcards.html" class="btn btn-primary">
                    <i class="bi bi-card-checklist me-1"></i>Learn Words
                </a>
            </div>
        `;
    }

    displayCurrentSentence() {
        const sentence = this.sessionSentences[this.currentSentenceIndex];
        if (!sentence) return;

        document.getElementById('currentSentenceEn').textContent = sentence.english;
        document.getElementById('currentSentenceUr').textContent = sentence.urdu;

        // Update sentence counter
        document.getElementById('sentenceCounter').textContent = `${this.currentSentenceIndex + 1}/${this.sessionSentences.length}`;

        // Show appropriate indicator
        const sentenceCard = document.getElementById('sentenceCard');
        sentenceCard.classList.remove('review-word', 'learned-word');
        
        if (sentence.sentenceType === 'review') {
            sentenceCard.classList.add('review-word');
        } else if (sentence.sentenceType === 'learned') {
            sentenceCard.classList.add('learned-word');
        }

        // Reset card flip
        sentenceCard.classList.remove('flipped');

        this.updateProgress();
    }

    nextSentence() {
        this.currentSentenceIndex = (this.currentSentenceIndex + 1) % this.sessionSentences.length;
        this.displayCurrentSentence();
    }

    flipCard() {
        const sentenceCard = document.getElementById('sentenceCard');
        sentenceCard.classList.toggle('flipped');
    }

    markAsLearned() {
        const currentSentence = this.sessionSentences[this.currentSentenceIndex];
        window.app.markSentenceAsLearned(currentSentence.id);
        this.updateProgress();
        this.updateReviewStack();
        this.animateCardOut('right');
    }

    markForReview() {
        const currentSentence = this.sessionSentences[this.currentSentenceIndex];
        window.app.markSentenceForReview(currentSentence.id);
        this.updateProgress();
        this.updateReviewStack();
        this.animateCardOut('left');
    }

    animateCardOut(direction) {
        const sentenceCard = document.getElementById('sentenceCard');
        
        // Show feedback
        const feedback = direction === 'left' ? 
            document.getElementById('leftFeedback') : 
            document.getElementById('rightFeedback');
        feedback.classList.add('show');
        
        // Animate out
        sentenceCard.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease';
        sentenceCard.style.transform = direction === 'left' ? 
            'translateX(-120vw) rotate(-30deg)' : 
            'translateX(120vw) rotate(30deg)';
        sentenceCard.style.opacity = '0';
        
        setTimeout(() => {
            feedback.classList.remove('show');
            // Reset all transforms and transitions
            sentenceCard.style.transition = '';
            sentenceCard.style.transform = '';
            sentenceCard.style.opacity = '';
            
            // Move to next sentence
            this.nextSentence();
        }, 600);
    }

    updateProgress() {
        const totalSentences = this.sessionSentences.length;
        const currentSentence = this.currentSentenceIndex + 1;
        const learnedCount = this.userData.learnedSentences ? this.userData.learnedSentences.length : 0;

        // Calculate total available sentences from learned words
        const learnedWords = this.userData.learnedWords || [];
        let totalAvailableSentences = 0;
        vocabularyData.forEach(word => {
            if (learnedWords.includes(word.id) && word.sentences) {
                totalAvailableSentences += word.sentences.length;
            }
        });

        const progressPercent = totalSentences > 0 ? Math.round((currentSentence / totalSentences) * 100) : 0;
        document.getElementById('sentenceProgress').style.width = `${progressPercent}%`;
        document.getElementById('progressText').textContent = `${progressPercent}%`;
        document.getElementById('learnedSentences').textContent = `${learnedCount} learned`;
        document.getElementById('totalSentences').textContent = `${totalAvailableSentences} available`;
    }

    updateReviewStack() {
        const reviewSentences = this.userData.reviewSentences || [];
        const reviewCount = document.getElementById('reviewCount');
        const reviewStack = document.getElementById('reviewStack');
        
        reviewCount.textContent = reviewSentences.length;
        
        if (reviewSentences.length === 0) {
            reviewStack.innerHTML = '<div class="empty-stack text-center text-muted small py-2">No sentences in review stack</div>';
        } else {
            // Find the actual sentences from review IDs
            const reviewSentencesData = [];
            const learnedWords = this.userData.learnedWords || [];
            
            vocabularyData.forEach(word => {
                if (learnedWords.includes(word.id) && word.sentences) {
                    word.sentences.forEach(sentenceObj => {
                        if (reviewSentences.includes(sentenceObj.id)) {
                            reviewSentencesData.push({
                                id: sentenceObj.id,
                                english: sentenceObj.sentence,
                                wordEnglish: word.english
                            });
                        }
                    });
                }
            });
            
            const chips = reviewSentencesData.map(sentence => 
                `<span class="review-word-chip"><strong>${sentence.english.substring(0, 25)}...</strong> <em>(${sentence.wordEnglish})</em></span>`
            ).join('');
            reviewStack.innerHTML = chips;
        }
    }

    setupEventListeners() {
        const sentenceCard = document.getElementById('sentenceCard');
        const frontSpeakBtn = document.getElementById('frontSpeakBtn');
        const backSpeakBtn = document.getElementById('backSpeakBtn');

        // Speak buttons
        if (frontSpeakBtn) {
            frontSpeakBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const currentSentence = this.sessionSentences[this.currentSentenceIndex].english;
                window.app.speakText(currentSentence);
            });
        }

        if (backSpeakBtn) {
            backSpeakBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const currentSentence = this.sessionSentences[this.currentSentenceIndex].english;
                window.app.speakText(currentSentence);
            });
        }

        // Simple click/tap to flip (works on mobile)
        sentenceCard.addEventListener('click', (e) => {
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
            
            if (Math.abs(diffX) > 10) {
                isDragging = true;
                
                // Apply transform
                sentenceCard.style.transform = `translateX(${diffX}px) rotate(${diffX * 0.1}deg)`;
                
                // Show feedback
                if (diffX > 50) {
                    document.getElementById('rightFeedback').classList.add('show');
                    document.getElementById('leftFeedback').classList.remove('show');
                } else if (diffX < -50) {
                    document.getElementById('leftFeedback').classList.add('show');
                    document.getElementById('rightFeedback').classList.remove('show');
                } else {
                    document.getElementById('leftFeedback').classList.remove('show');
                    document.getElementById('rightFeedback').classList.remove('show');
                }
            }
        };

        const handleEnd = () => {
            if (!startX) return;
            
            const diffX = currentX - startX;
            
            // Hide feedback
            document.getElementById('leftFeedback').classList.remove('show');
            document.getElementById('rightFeedback').classList.remove('show');
            
            // Reset transform
            sentenceCard.style.transform = '';
            
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
        sentenceCard.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            handleStart(touch.clientX, touch.clientY);
        }, { passive: false });

        sentenceCard.addEventListener('touchmove', (e) => {
            if (startX) {
                e.preventDefault();
                const touch = e.touches[0];
                handleMove(touch.clientX, touch.clientY);
            }
        }, { passive: false });

        sentenceCard.addEventListener('touchend', (e) => {
            handleEnd();
        });

        // Mouse events
        sentenceCard.addEventListener('mousedown', (e) => {
            handleStart(e.clientX, e.clientY);
        });

        sentenceCard.addEventListener('mousemove', (e) => {
            if (startX) {
                handleMove(e.clientX, e.clientY);
            }
        });

        sentenceCard.addEventListener('mouseup', () => {
            handleEnd();
        });

        sentenceCard.addEventListener('mouseleave', () => {
            handleEnd();
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.app !== 'undefined') {
        window.sentenceManager = new SentenceManager();
    }
});
