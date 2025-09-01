class QuizManager {
    constructor() {
        this.userData = window.app.userData;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.quizQuestions = [];
        this.init();
    }

    init() {
        this.generateQuiz();
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
        
        // Update counters
        document.getElementById('questionCounter').textContent = 
            `${this.currentQuestionIndex + 1}/${this.quizQuestions.length}`;
        document.getElementById('quizScore').textContent = 
            `${this.score}/${this.currentQuestionIndex}`;

        quizContent.innerHTML = `
            <div class="mb-5">
                <h3 class="h3 mb-4 text-muted fw-light">${question.question}</h3>
            </div>
            <div class="d-grid gap-3">
                ${question.options.map((option, index) => `
                    <button class="btn btn-outline-primary quiz-option py-3 fs-5" data-index="${index}">
                        ${option}
                    </button>
                `).join('')}
            </div>
        `;

        // Add event listeners to options
        document.querySelectorAll('.quiz-option').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleAnswer(parseInt(e.target.dataset.index));
            });
        });
    }

    handleAnswer(selectedIndex) {
        const question = this.quizQuestions[this.currentQuestionIndex];
        const isCorrect = selectedIndex === question.correctIndex;
        
        // Disable all buttons
        document.querySelectorAll('.quiz-option').forEach(button => {
            button.disabled = true;
        });

        // Show correct/incorrect styling
        const buttons = document.querySelectorAll('.quiz-option');
        buttons[question.correctIndex].classList.remove('btn-outline-primary');
        buttons[question.correctIndex].classList.add('btn-success');
        
        if (!isCorrect) {
            buttons[selectedIndex].classList.remove('btn-outline-primary');
            buttons[selectedIndex].classList.add('btn-danger');
            
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

        // Move to next question after delay
        setTimeout(() => {
            this.currentQuestionIndex++;
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
