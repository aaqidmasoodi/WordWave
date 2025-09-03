// Voice Synthesiser functionality
class VoiceSynthesiser {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTranslations();
        this.setupRecording();
    }

    setupEventListeners() {
        const recordBtn = document.getElementById('recordBtn');
        const clearAllBtn = document.getElementById('clearAllBtn');

        if (recordBtn) {
            recordBtn.addEventListener('click', () => {
                if (!this.isRecording) {
                    this.startRecording();
                } else {
                    this.stopRecording();
                }
            });
        }

        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearAllTranslations();
            });
        }
    }

    async setupRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                this.audioChunks = [];
                await this.processAudio(audioBlob);
            };
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            this.showStatus('Microphone access denied. Please allow microphone access to use this feature.', 'error');
        }
    }

    startRecording() {
        // Check if API key is configured
        const apiKey = localStorage.getItem('groqApiKey');
        if (!apiKey || !apiKey.trim()) {
            this.showStatus('Configure API key in Settings first', 'error');
            return;
        }

        if (!this.mediaRecorder) {
            this.showStatus('Microphone not available', 'error');
            return;
        }
        
        this.mediaRecorder.start();
        this.isRecording = true;
        
        const recordBtn = document.getElementById('recordBtn');
        const waveVisualizer = document.getElementById('waveVisualizer');
        const statusElement = document.getElementById('recordingStatus');
        
        // Animate button
        recordBtn.classList.add('recording');
        recordBtn.innerHTML = '<i class="bi bi-stop-fill"></i>';
        
        // Show wave visualizer
        waveVisualizer.classList.add('active');
        
        // Countdown animation
        let countdown = 3;
        statusElement.innerHTML = `<span class="countdown-text">Recording... ${countdown}s (tap to stop)</span>`;
        
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0 && this.isRecording) {
                statusElement.innerHTML = `<span class="countdown-text">Recording... ${countdown}s (tap to stop)</span>`;
            } else {
                clearInterval(countdownInterval);
            }
        }, 1000);
        
        // Store interval reference to clear it if user stops early
        this.countdownInterval = countdownInterval;
        
        // Auto-stop after 3 seconds
        this.autoStopTimeout = setTimeout(() => {
            if (this.isRecording) {
                this.stopRecording();
            }
        }, 3000);
    }

    stopRecording() {
        this.mediaRecorder.stop();
        this.isRecording = false;
        
        // Clear countdown interval and auto-stop timeout
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        if (this.autoStopTimeout) {
            clearTimeout(this.autoStopTimeout);
        }
        
        const recordBtn = document.getElementById('recordBtn');
        const waveVisualizer = document.getElementById('waveVisualizer');
        const statusElement = document.getElementById('recordingStatus');
        
        // Reset button
        recordBtn.classList.remove('recording');
        recordBtn.innerHTML = '<i class="bi bi-mic-fill"></i>';
        
        // Hide wave visualizer
        waveVisualizer.classList.remove('active');
        
        // Show processing animation
        statusElement.innerHTML = '<div class="processing-spinner"></div>Processing your audio...';
    }

    async processAudio(audioBlob) {
        const apiKey = localStorage.getItem('groqApiKey');
        
        try {
            // Step 1: Speech to text with Whisper
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');
            formData.append('model', 'whisper-large-v3-turbo');
            formData.append('language', 'ur'); // Force Urdu language
            formData.append('response_format', 'json');
            
            const transcriptionResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                },
                body: formData
            });
            
            if (!transcriptionResponse.ok) {
                throw new Error('Speech recognition failed');
            }
            
            const transcriptionData = await transcriptionResponse.json();
            const urduText = transcriptionData.text;
            
            if (!urduText || urduText.trim() === '') {
                throw new Error('No speech detected. Please try again.');
            }
            
            // Step 2: Translate to English with LLM
            const translationResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a translator. Convert Urdu text into natural, conversational English that a native English speaker would actually say. Do not transliterate - provide the English meaning.'
                        },
                        {
                            role: 'user',
                            content: `Convert this Urdu text to natural English: "${urduText}"`
                        }
                    ],
                    max_tokens: 50,
                    temperature: 0.1
                })
            });
            
            if (!translationResponse.ok) {
                throw new Error('Translation failed');
            }
            
            const translationData = await translationResponse.json();
            const englishText = translationData.choices[0].message.content.trim();
            
            // Save translation
            this.saveTranslation(urduText, englishText);
            this.showStatus('Translation completed!', 'success');
            
        } catch (error) {
            console.error('Processing error:', error);
            this.showStatus(error.message || 'Error processing audio. Please try again.', 'error');
        } finally {
            const statusElement = document.getElementById('recordingStatus');
            
            setTimeout(() => {
                statusElement.textContent = 'Tap to record 3 seconds of Urdu';
            }, 2000);
        }
    }

    saveTranslation(urdu, english) {
        const translation = {
            id: Date.now(),
            urdu: urdu,
            english: english,
            timestamp: new Date().toISOString()
        };
        
        // Get existing translations
        const translations = JSON.parse(localStorage.getItem('voiceTranslations') || '[]');
        translations.unshift(translation); // Add to beginning (newest first)
        
        // Keep only last 50 translations
        if (translations.length > 50) {
            translations.splice(50);
        }
        
        localStorage.setItem('voiceTranslations', JSON.stringify(translations));
        this.loadTranslations();
    }

    loadTranslations() {
        const translations = JSON.parse(localStorage.getItem('voiceTranslations') || '[]');
        const translationsList = document.getElementById('translationsList');
        const clearAllBtn = document.getElementById('clearAllBtn');
        
        if (!translationsList) return; // Exit if element doesn't exist
        
        if (translations.length === 0) {
            translationsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎤</div>
                    <div class="empty-title">Ready to Translate</div>
                    <div class="empty-subtitle">Record your voice to see translations appear here</div>
                </div>
            `;
            if (clearAllBtn) clearAllBtn.classList.add('d-none');
            return;
        }
        
        if (clearAllBtn) clearAllBtn.classList.remove('d-none');
        
        translationsList.innerHTML = translations.map((translation, index) => `
            <div class="translation-card" style="animation-delay: ${index * 0.1}s">
                <div class="english-text">${translation.english}</div>
                <div class="urdu-text">${translation.urdu}</div>
                <div class="card-footer">
                    <div class="timestamp">
                        <i class="bi bi-clock me-1"></i>
                        ${new Date(translation.timestamp).toLocaleString()}
                    </div>
                    <div class="card-actions">
                        <button class="action-btn speak-btn" data-index="${index}">
                            <i class="bi bi-volume-up"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="voiceSynthesiser.deleteTranslation(${translation.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners for speak buttons
        translationsList.querySelectorAll('.speak-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.speakText(translations[index].english);
            });
        });
    }

    deleteTranslation(id) {
        const translations = JSON.parse(localStorage.getItem('voiceTranslations') || '[]');
        const filtered = translations.filter(t => t.id !== id);
        localStorage.setItem('voiceTranslations', JSON.stringify(filtered));
        this.loadTranslations();
    }

    clearAllTranslations() {
        if (confirm('Are you sure you want to delete all translations?')) {
            localStorage.removeItem('voiceTranslations');
            this.loadTranslations();
        }
    }

    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('recordingStatus');
        if (statusElement) {
            let className = 'text-muted';
            let icon = '';
            
            switch (type) {
                case 'error':
                    className = 'text-danger';
                    icon = '<i class="bi bi-exclamation-triangle me-1"></i>';
                    break;
                case 'success':
                    className = 'text-success';
                    icon = '<i class="bi bi-check-circle me-1"></i>';
                    break;
                case 'recording':
                    className = 'text-warning';
                    icon = '<i class="bi bi-record-circle me-1"></i>';
                    break;
                case 'processing':
                    className = 'text-info';
                    icon = '<i class="bi bi-hourglass-split me-1"></i>';
                    break;
            }
            
            statusElement.innerHTML = `${icon}${message}`;
            statusElement.className = className;
        }
    }

    clearStatus() {
        const statusElement = document.getElementById('recordingStatus');
        if (statusElement) {
            statusElement.innerHTML = '';
        }
    }

    speakText(text) {
        console.log('Speaking:', text);
        
        if (!('speechSynthesis' in window)) {
            alert('Text-to-speech not supported in this browser');
            return;
        }
        
        // Stop any ongoing speech
        speechSynthesis.cancel();
        
        // Wait a bit for cancel to complete
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            utterance.onstart = () => console.log('Speech started');
            utterance.onend = () => console.log('Speech ended');
            utterance.onerror = (e) => console.error('Speech error:', e);
            
            speechSynthesis.speak(utterance);
        }, 100);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.voiceSynthesiser = new VoiceSynthesiser();
});
