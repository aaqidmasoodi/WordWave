class QuizManager {
    constructor() {
        this.userData = window.app.userData;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.quizQuestions = [];
        this.quizResults = []; // Track quiz results
        this.loadQuizSession();
        this.init();
    }

    loadQuizSession() {
        const savedQuiz = localStorage.getItem('quizSession');
        if (savedQuiz) {
            const session = JSON.parse(savedQuiz);
            this.currentQuestionIndex = session.currentIndex || 0;
            this.score = session.score || 0;
            this.quizResults = session.results || [];
            this.quizQuestions = session.questions || [];
        }
    }

    saveQuizSession() {
        const session = {
            currentIndex: this.currentQuestionIndex,
            score: this.score,
            results: this.quizResults,
            questions: this.quizQuestions,
            timestamp: Date.now()
        };
        localStorage.setItem('quizSession', JSON.stringify(session));
    }

    init() {
        // Load last quiz score from global state if available
        if (window.app && window.app.userData && window.app.userData.lastQuizScore) {
            const lastScore = window.app.userData.lastQuizScore;
            // If quiz is complete, show the last score
            if (this.currentQuestionIndex >= this.quizQuestions.length && this.quizQuestions.length > 0) {
                updateHeaderElement('quizScore', `${lastScore.score}/${lastScore.total}`);
                updateHeaderElement('questionCounter', 'Complete!');
            }
        }
        
        // If no saved session, generate new quiz
        if (this.quizQuestions.length === 0) {
            this.generateQuiz();
        }
        
        if (this.quizQuestions.length > 0) {
            this.displayQuestion();
        } else {
            this.showNoWordsMessage();
        }
    }

    generateQuiz() {
        const learnedWords = this.userData.learnedWords || [];
        
        if (learnedWords.length < 10) {
            this.quizQuestions = [];
            return;
        }

        // Get learned words data
        const learnedWordsData = vocabularyData.filter(word => learnedWords.includes(word.id));
        
        // Always generate exactly 5 questions
        const selectedWords = this.shuffleArray([...learnedWordsData]).slice(0, 5);
        
        this.quizQuestions = selectedWords.map(correctWord => {
            // Get 3 random wrong answers
            const wrongAnswers = vocabularyData
                .filter(word => word.id !== correctWord.id)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);
            
            // Combine and shuffle options
            const options = this.shuffleArray([correctWord, ...wrongAnswers]);
            
            return {
                question: `<strong>${correctWord.urdu}</strong> کو انگریزی میں کیا کہتے ہیں؟`,
                options: options.map(word => word.english),
                correctAnswer: correctWord.english,
                correctIndex: options.findIndex(word => word.id === correctWord.id)
            };
        });

        console.log(`Generated 5 quiz questions from ${learnedWords.length} learned words`);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    displayQuestion() {
        if (this.currentQuestionIndex >= this.quizQuestions.length) {
            this.showQuizComplete();
            return;
        }

        const question = this.quizQuestions[this.currentQuestionIndex];
        const quizContent = document.getElementById('quizContent');
        
        // Update header with current score and question number
        updateHeaderElement('quizScore', `${this.score}/${this.quizQuestions.length}`);
        updateHeaderElement('questionCounter', `${this.currentQuestionIndex + 1}/${this.quizQuestions.length}`);
        
        // Update progress circles
        this.updateProgressCircles();

        quizContent.innerHTML = `
            <div class="mb-4 text-center">
                <h4 class="h4 mb-3 text-primary fw-light lh-base quiz-question">${question.question}</h4>
            </div>
            <div class="d-grid gap-2">
                ${question.options.map((option, index) => `
                    <button class="btn quiz-option py-3 text-start" data-index="${index}">
                        <div class="d-flex align-items-center">
                            <div class="option-letter me-3">${String.fromCharCode(65 + index)}</div>
                            <div class="option-text">${option}</div>
                        </div>
                    </button>
                `).join('')}
            </div>
        `;

        // Add event listeners to options
        document.querySelectorAll('.quiz-option').forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove focus to prevent blue highlight
                const clickedButton = e.currentTarget;
                clickedButton.blur();
                this.handleAnswer(parseInt(clickedButton.dataset.index));
            });
        });
    }

    updateProgressCircles() {
        const container = document.getElementById('quizProgressCircles');
        const totalQuestions = this.quizQuestions.length;
        
        let circlesHTML = '';
        for (let i = 0; i < totalQuestions; i++) {
            let circleClass = 'progress-circle';
            
            if (i < this.quizResults.length) {
                // Already answered
                circleClass += this.quizResults[i] === 'correct' ? ' learned' : ' review';
            } else if (i === this.currentQuestionIndex) {
                // Current question
                circleClass += ' current';
            }
            
            circlesHTML += `<div class="${circleClass}"></div>`;
        }
        
        container.innerHTML = circlesHTML;
    }

    handleAnswer(selectedIndex) {
        const question = this.quizQuestions[this.currentQuestionIndex];
        const isCorrect = selectedIndex === question.correctIndex;
        
        // Record the result
        this.quizResults[this.currentQuestionIndex] = isCorrect ? 'correct' : 'incorrect';
        
        // Disable all buttons but don't add visual styling to all
        document.querySelectorAll('.quiz-option').forEach(button => {
            button.disabled = true;
        });

        // Show correct/incorrect styling only on relevant buttons
        const buttons = document.querySelectorAll('.quiz-option');
        buttons[question.correctIndex].classList.add('correct');
        
        if (!isCorrect) {
            buttons[selectedIndex].classList.add('incorrect');
            
            // Add incorrect word to review stack
            const correctAnswer = question.correctAnswer;
            const incorrectWord = vocabularyData.find(word => word.english === correctAnswer);
            if (incorrectWord) {
                window.app.markWordForReview(incorrectWord.id);
                console.log(`Added "${correctAnswer}" to review stack for getting it wrong`);
            }
        }

        // Update score
        if (isCorrect) {
            this.score++;
        }

        // Update progress circles immediately
        this.updateProgressCircles();

        // Move to next question after delay
        setTimeout(() => {
            this.currentQuestionIndex++;
            
            // Check if quiz is now complete and increment count
            if (this.currentQuestionIndex >= this.quizQuestions.length) {
                // Quiz just completed - increment count
                if (window.app && window.app.userData) {
                    window.app.userData.quizzesTaken = (window.app.userData.quizzesTaken || 0) + 1;
                    window.app.saveUserData();
                }
            }
            
            // Save session AFTER moving to next question
            this.saveQuizSession();
            
            this.displayQuestion();
        }, 1500);
    }

    showNoWordsMessage() {
        document.getElementById('quizContainer').style.display = 'none';
        document.getElementById('noWordsMessage').style.display = 'block';
    }

    showQuizComplete() {
        document.getElementById('quizContainer').style.display = 'none';
        document.getElementById('quizComplete').style.display = 'block';
        
        // Update header with final score
        updateHeaderElement('quizScore', `${this.score}/${this.quizQuestions.length}`);
        updateHeaderElement('questionCounter', 'Complete!');
        
        const percentage = Math.round((this.score / this.quizQuestions.length) * 100);
        document.getElementById('finalScore').textContent = 
            `${this.score}/${this.quizQuestions.length} (${percentage}%)`;

        // Save quiz result to global state (but don't increment count here)
        if (window.app && window.app.userData) {
            window.app.userData.lastQuizScore = {
                score: this.score,
                total: this.quizQuestions.length,
                percentage: percentage,
                date: new Date().toISOString()
            };
            window.app.saveUserData();
        }

        // Trigger confetti for perfect score
        if (this.score === this.quizQuestions.length && this.quizQuestions.length > 0) {
            this.triggerConfetti();
        }

        // Setup retake button
        document.getElementById('retakeQuiz').addEventListener('click', () => {
            this.resetQuiz();
        });
    }

    triggerConfetti() {
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);

        // Explosion center
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Create 80 confetti pieces
        for (let i = 0; i < 80; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti confetti-piece';
            
            // Start at explosion center
            confetti.style.left = centerX + 'px';
            confetti.style.top = centerY + 'px';
            
            // Random explosion direction (360 degrees)
            const angle = Math.random() * Math.PI * 2;
            const velocity = 200 + Math.random() * 300; // Random explosion force
            
            // Calculate final position
            const x = Math.cos(angle) * velocity;
            const y = Math.sin(angle) * velocity + 200; // Add gravity
            const rotation = Math.random() * 720 - 360;
            
            // Set CSS variables
            confetti.style.setProperty('--x', x + 'px');
            confetti.style.setProperty('--y', y + 'px');
            confetti.style.setProperty('--r', rotation + 'deg');
            
            // Random size
            const size = 6 + Math.random() * 8;
            confetti.style.width = size + 'px';
            confetti.style.height = size + 'px';
            
            container.appendChild(confetti);
        }

        // Remove after animation
        setTimeout(() => {
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }
        }, 3500);
    }

    createConfettiBurst(container, side) {
        // This method is no longer needed
    }

    resetQuiz() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.quizResults = [];
        
        // Clear saved session
        localStorage.removeItem('quizSession');
        
        document.getElementById('quizContainer').style.display = 'block';
        document.getElementById('quizComplete').style.display = 'none';
        this.generateQuiz();
        this.displayQuestion();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.app !== 'undefined') {
        // Wait for header to load before initializing quiz
        const initQuiz = () => {
            window.quizManager = new QuizManager();
        };
        
        // Check if header elements exist, or wait for header loaded event
        const quizScore = document.getElementById('quizScore');
        if (quizScore) {
            initQuiz();
        } else {
            document.addEventListener('headerLoaded', initQuiz);
        }
    }
});
