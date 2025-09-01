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
        
        // Update progress circles
        this.updateProgressCircles();

        quizContent.innerHTML = `
            <div class="mb-4">
                <h4 class="h5 mb-3 text-primary fw-normal lh-base">${question.question}</h4>
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
        
        const percentage = Math.round((this.score / this.quizQuestions.length) * 100);
        document.getElementById('finalScore').textContent = 
            `${this.score}/${this.quizQuestions.length} (${percentage}%)`;

        // Setup retake button
        document.getElementById('retakeQuiz').addEventListener('click', () => {
            this.resetQuiz();
        });
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
        window.quizManager = new QuizManager();
    }
});
