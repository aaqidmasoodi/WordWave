class SentenceManager {
    constructor() {
        this.currentSentenceIndex = 0;
        this.userData = window.app.userData;
        this.sessionSentences = this.generateSessionSentences();
        this.sessionResults = []; // Track swipe results
        this.loadSessionState();
        this.init();
    }

    loadSessionState() {
        const saved = localStorage.getItem('sentenceSession');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                if (state.sessionLength === this.sessionSentences.length) {
                    this.currentSentenceIndex = state.currentIndex || 0;
                    this.sessionResults = state.results || [];
                    return;
                }
            } catch (e) {}
        }
        
        // Reset to fresh state
        this.currentSentenceIndex = 0;
        this.sessionResults = [];
    }

    saveSessionState() {
        const state = {
            currentIndex: this.currentSentenceIndex,
            results: this.sessionResults,
            sessionLength: this.sessionSentences.length,
            timestamp: Date.now()
        };
        localStorage.setItem('sentenceSession', JSON.stringify(state));
    }

    generateSessionSentences() {
        const learnedWords = this.userData.learnedWords || [];
        
        // Check if user has learned enough words (minimum 5 for sentences)
        if (learnedWords.length < 5) {
            return [];
        }
        
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
        
        // Calculate session size (max 5 sentences per session)
        const sessionSize = Math.min(5, availableSentences.length);
        
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
            this.displayNextSentence();
            this.updateProgress();
            this.updateReviewStack();
            this.setupEventListeners();
        }
        
        // Show the cards with fade-in effect after content is loaded
        const flashcardStack = document.querySelector('.flashcard-stack');
        if (flashcardStack) {
            flashcardStack.style.opacity = '1';
        }
    }

    showNoSentencesMessage() {
        const sentenceCard = document.getElementById('sentenceCard');
        const learnedWordsCount = this.userData.learnedWords ? this.userData.learnedWords.length : 0;
        
        sentenceCard.innerHTML = `
            <div class="text-center p-4">
                <i class="bi bi-book text-muted fs-1 mb-3"></i>
                <h3 class="h5 mb-3">Need More Words</h3>
                <p class="text-muted mb-3">You need to learn at least 5 words to unlock sentence practice. You have learned ${learnedWordsCount} words.</p>
                <a href="flashcards.html" class="btn btn-primary">
                    <i class="bi bi-card-checklist me-1"></i>Learn Words
                </a>
            </div>
        `;
        
        // Hide the next sentence card
        const nextSentenceCard = document.getElementById('nextSentenceCard');
        if (nextSentenceCard) {
            nextSentenceCard.style.display = 'none';
        }
        
        // Hide progress and review sections
        const progressSection = document.querySelector('.card:has(#progressCircles)');
        const reviewSection = document.querySelector('.card:has(#reviewStack)');
        
        if (progressSection) {
            progressSection.style.display = 'none';
        }
        if (reviewSection) {
            reviewSection.style.display = 'none';
        }
    }

    displayCurrentSentence() {
        const sentence = this.sessionSentences[this.currentSentenceIndex];
        if (!sentence) return;

        const sentenceCard = document.getElementById('sentenceCard');
        
        // Create proper card structure to replace loading state
        sentenceCard.innerHTML = `
            <div class="flip-card-inner">
                <!-- Front Side -->
                <div class="flip-card-front">
                    <h2 id="currentSentenceEn" class="h4 mb-3">${sentence.english}</h2>
                    <div class="mt-3">
                        <button id="frontSpeakBtn" class="btn btn-sm btn-light">
                            <i class="bi bi-volume-up"></i> Speak
                        </button>
                    </div>
                    <p class="swipe-hint mt-3">Swipe to interact</p>
                </div>
                
                <!-- Back Side -->
                <div class="flip-card-back">
                    <h3 id="currentSentenceUr" class="h4 mb-3">${sentence.urdu}</h3>
                    <div class="mt-3">
                        <button id="backSpeakBtn" class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-volume-up"></i> Speak
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Update sentence counter using global function
        updateHeaderElement('sentenceCounter', `${this.currentSentenceIndex + 1}/${this.sessionSentences.length}`);

        // Show appropriate indicator
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

    displayNextSentence() {
        const nextIndex = this.currentSentenceIndex + 1;
        
        // If we're at the last sentence, show a preview of what's coming next
        if (nextIndex >= this.sessionSentences.length) {
            const nextSentenceCard = document.getElementById('nextSentenceCard');
            nextSentenceCard.innerHTML = `
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        <div class="text-center p-4">
                            <i class="bi bi-arrow-clockwise text-primary fs-1 mb-3"></i>
                            <h3 class="h5 mb-2">New Session</h3>
                            <p class="text-muted small">Fresh sentences coming up!</p>
                        </div>
                    </div>
                </div>
            `;
            nextSentenceCard.style.display = 'block';
            return;
        }
        
        const nextSentence = this.sessionSentences[nextIndex];
        if (!nextSentence) return;

        const nextSentenceCard = document.getElementById('nextSentenceCard');
        
        // Create proper card structure for next card
        nextSentenceCard.innerHTML = `
            <div class="flip-card-inner">
                <!-- Front Side -->
                <div class="flip-card-front">
                    <h2 id="nextCurrentSentenceEn" class="h4 mb-3">${nextSentence.english}</h2>
                    <div class="mt-3">
                        <button class="btn btn-sm btn-light">
                            <i class="bi bi-volume-up"></i> Speak
                        </button>
                    </div>
                    <p class="swipe-hint mt-3">Swipe to interact</p>
                </div>
                
                <!-- Back Side -->
                <div class="flip-card-back">
                    <h3 id="nextCurrentSentenceUr" class="h4 mb-3">${nextSentence.urdu}</h3>
                    <div class="mt-3">
                        <button class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-volume-up"></i> Speak
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Show the next card
        nextSentenceCard.style.display = 'block';

        // Show appropriate indicator for next card
        nextSentenceCard.classList.remove('review-word', 'learned-word');
        
        if (nextSentence.sentenceType === 'review') {
            nextSentenceCard.classList.add('review-word');
        } else if (nextSentence.sentenceType === 'learned') {
            nextSentenceCard.classList.add('learned-word');
        }

        // Reset card flip
        nextSentenceCard.classList.remove('flipped');
    }

    nextSentence() {
        const oldIndex = this.currentSentenceIndex;
        this.currentSentenceIndex++;
        
        // Check if we've completed the session
        if (this.currentSentenceIndex >= this.sessionSentences.length) {
            // Generate new session
            this.sessionSentences = this.generateSessionSentences();
            this.currentSentenceIndex = 0;
            this.sessionResults = [];
            
            // Clear session storage to start fresh
            localStorage.removeItem('sentenceSession');
            
            console.log('Generated new sentence session with', this.sessionSentences.length, 'sentences');
        } else {
            this.saveSessionState();
        }
        
        this.updateSentenceCounter();
        this.updateProgress();
    }

    updateSentenceCounter() {
        document.getElementById('sentenceCounter').textContent = `${this.currentSentenceIndex + 1}/${this.sessionSentences.length}`;
    }

    flipCard() {
        const sentenceCard = document.getElementById('sentenceCard');
        sentenceCard.classList.toggle('flipped');
    }

    markAsLearned() {
        const currentSentence = this.sessionSentences[this.currentSentenceIndex];
        
        // Record the result
        this.sessionResults[this.currentSentenceIndex] = 'learned';
        this.saveSessionState();
        
        window.app.markSentenceAsLearned(currentSentence.id);
        this.updateProgress();
        this.updateReviewStack();
        this.animateCardOut('right');
    }

    markForReview() {
        const currentSentence = this.sessionSentences[this.currentSentenceIndex];
        
        // Record the result
        this.sessionResults[this.currentSentenceIndex] = 'review';
        this.saveSessionState();
        
        window.app.markSentenceForReview(currentSentence.id);
        this.updateProgress();
        this.updateReviewStack();
        this.animateCardOut('left');
    }

    animateCardOut(direction) {
        const sentenceCard = document.getElementById('sentenceCard');
        const nextSentenceCard = document.getElementById('nextSentenceCard');
        
        // Show feedback
        const feedback = direction === 'left' ? 
            document.getElementById('leftFeedback') : 
            document.getElementById('rightFeedback');
        feedback.classList.add('show');
        
        // Animate current card out
        sentenceCard.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease';
        sentenceCard.style.transform = direction === 'left' ? 
            'translateX(-120vw) rotate(-30deg)' : 
            'translateX(120vw) rotate(30deg)';
        sentenceCard.style.opacity = '0';
        
        // Animate next card to front position
        nextSentenceCard.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        nextSentenceCard.style.transform = 'scale(1) translateY(0)';
        nextSentenceCard.style.opacity = '1';
        nextSentenceCard.style.zIndex = '2';
        
        setTimeout(() => {
            feedback.classList.remove('show');
            
            // Move to next sentence
            this.nextSentence();
            
            // Completely hide the swiped card to prevent glitch
            sentenceCard.style.display = 'none';
            
            setTimeout(() => {
                // Reset and reposition the swiped card as the new back card
                sentenceCard.style.display = 'block';
                sentenceCard.style.transition = '';
                sentenceCard.style.transform = 'scale(0.95) translateY(8px)';
                sentenceCard.style.opacity = '0.8';
                sentenceCard.style.zIndex = '1';
                
                // Update the back card with the next sentence content
                const nextNextIndex = (this.currentSentenceIndex + 1) % this.sessionSentences.length;
                const nextNextSentence = this.sessionSentences[nextNextIndex];
                
                if (nextNextSentence) {
                    sentenceCard.querySelector('#currentSentenceEn, #nextCurrentSentenceEn').textContent = nextNextSentence.english;
                    sentenceCard.querySelector('#currentSentenceUr, #nextCurrentSentenceUr').textContent = nextNextSentence.urdu;
                    
                    // Update indicators
                    sentenceCard.classList.remove('review-word', 'learned-word');
                    if (nextNextSentence.sentenceType === 'review') {
                        sentenceCard.classList.add('review-word');
                    } else if (nextNextSentence.sentenceType === 'learned') {
                        sentenceCard.classList.add('learned-word');
                    }
                    sentenceCard.classList.remove('flipped');
                }
                
                // Swap IDs
                const tempId = sentenceCard.id;
                sentenceCard.id = nextSentenceCard.id;
                nextSentenceCard.id = tempId;
                
                // Update progress and counter
                this.updateProgress();
                this.updateSentenceCounter();
            }, 50);
            
        }, 500);
    }

    updateProgress() {
        const totalSentences = this.sessionSentences.length;
        const currentSentence = this.currentSentenceIndex + 1;

        // Update circles
        this.updateProgressCircles();
        
        document.getElementById('progressText').textContent = `${currentSentence}/${totalSentences}`;
    }

    updateProgressCircles() {
        const container = document.getElementById('progressCircles');
        const totalSentences = this.sessionSentences.length;
        
        let circlesHTML = '';
        for (let i = 0; i < totalSentences; i++) {
            let circleClass = 'progress-circle';
            
            if (i < this.sessionResults.length) {
                // Already swiped
                circleClass += this.sessionResults[i] === 'learned' ? ' learned' : ' review';
            } else if (i === this.currentSentenceIndex) {
                // Current sentence
                circleClass += ' current';
            }
            
            circlesHTML += `<div class="${circleClass}"></div>`;
        }
        
        container.innerHTML = circlesHTML;
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
        const nextSentenceCard = document.getElementById('nextSentenceCard');

        // Add swipe functionality to both cards
        this.addSwipeListeners(sentenceCard);
        this.addSwipeListeners(nextSentenceCard);
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
                // Get the current sentence from the card that was clicked
                const sentenceElement = card.querySelector('#currentSentenceEn, #nextCurrentSentenceEn');
                if (sentenceElement) {
                    window.app.speakText(sentenceElement.textContent);
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
            
            if (Math.abs(diffX) > 10) {
                isDragging = true;
                
                // Apply transform
                card.style.transform = `translateX(${diffX}px) rotate(${diffX * 0.1}deg)`;
                
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
                e.preventDefault();
                const touch = e.touches[0];
                handleMove(touch.clientX, touch.clientY);
            }
        }, { passive: false });

        card.addEventListener('touchend', (e) => {
            handleEnd();
        });

        // Mouse events
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
        const targetCard = card || document.getElementById('sentenceCard');
        targetCard.classList.toggle('flipped');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.app !== 'undefined') {
        // Wait for header to load before initializing sentences
        const initSentences = () => {
            window.sentenceManager = new SentenceManager();
        };
        
        // Check if header elements exist, or wait for header loaded event
        const sentenceCounter = document.getElementById('sentenceCounter');
        if (sentenceCounter) {
            initSentences();
        } else {
            document.addEventListener('headerLoaded', initSentences);
        }
    }
});
