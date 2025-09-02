// js/foundations.js
class FoundationsManager {
    constructor() {
        this.currentView = 'alphabet'; // 'alphabet' or 'counting'
        this.init();
    }

    init() {
        this.generateAlphabetGrid();
        this.generateCountingGrid();
        this.setupEventListeners();
    }

    generateAlphabetGrid() {
        const grid = document.getElementById('alphabetGrid');
        grid.innerHTML = '';

        lowercaseAlphabetData.forEach((letter, index) => {
            const item = document.createElement('div');
            item.className = 'foundation-item';
            item.innerHTML = `
                <div class="letter">${letter.letter.toUpperCase()}</div>
                <div class="urdu">${letter.urdu}</div>
                <button class="btn btn-sm btn-link p-0 mt-1 speak-btn" onclick="window.app.speakText('${letter.letter}')">
                    <i class="bi bi-volume-up text-muted"></i>
                </button>
            `;
            item.addEventListener('click', () => {
                // Just play sound, no detail display needed
                window.app.speakText(letter.letter);
            });
            grid.appendChild(item);
        });
    }

    generateCountingGrid() {
        const grid = document.getElementById('countingGrid');
        grid.innerHTML = '';

        countingData.forEach((number, index) => {
            const item = document.createElement('div');
            item.className = 'foundation-item';
            item.innerHTML = `
                <div class="number">${number.number}</div>
                <div class="urdu">${number.urdu}</div>
                <button class="btn btn-sm btn-link p-0 mt-1 speak-btn" onclick="window.app.speakText('${number.word}')">
                    <i class="bi bi-volume-up text-muted"></i>
                </button>
            `;
            item.addEventListener('click', () => {
                // Just play sound, no detail display needed
                window.app.speakText(number.word);
            });
            grid.appendChild(item);
        });
    }

    switchView(view) {
        this.currentView = view;
        
        const alphabetSection = document.getElementById('alphabetSection');
        const countingSection = document.getElementById('countingSection');
        const alphabetBtn = document.getElementById('alphabetBtn');
        const countingBtn = document.getElementById('countingBtn');

        if (view === 'alphabet') {
            alphabetSection.classList.remove('d-none');
            countingSection.classList.add('d-none');
            alphabetBtn.classList.add('active');
            countingBtn.classList.remove('active');
        } else {
            alphabetSection.classList.add('d-none');
            countingSection.classList.remove('d-none');
            alphabetBtn.classList.remove('active');
            countingBtn.classList.add('active');
        }
    }

    setupEventListeners() {
        // Wait for header buttons to be available
        const setupButtons = () => {
            const alphabetBtn = document.getElementById('alphabetBtn');
            const countingBtn = document.getElementById('countingBtn');
            
            if (alphabetBtn && countingBtn) {
                // View switching
                alphabetBtn.addEventListener('click', () => {
                    this.switchView('alphabet');
                });

                countingBtn.addEventListener('click', () => {
                    this.switchView('counting');
                });
            }
        };
        
        // Try to setup immediately, or wait for header
        const alphabetBtn = document.getElementById('alphabetBtn');
        if (alphabetBtn) {
            setupButtons();
        } else {
            document.addEventListener('headerLoaded', setupButtons);
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === '1') {
                this.switchView('alphabet');
            } else if (e.key === '2') {
                this.switchView('counting');
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.app !== 'undefined') {
        // Wait for header to load before initializing foundations
        const initFoundations = () => {
            window.foundationsManager = new FoundationsManager();
        };
        
        // Check if header elements exist, or wait for header loaded event
        const alphabetBtn = document.getElementById('alphabetBtn');
        if (alphabetBtn) {
            initFoundations();
        } else {
            document.addEventListener('headerLoaded', initFoundations);
        }
    }
});