// Video Player Component
class VideoPlayerComponent {
    constructor(options = {}) {
        this.videoId = options.videoId || '';
        this.title = options.title || 'Video';
        this.subtitle = options.subtitle || '';
        this.onBack = options.onBack || (() => window.history.back());
        this.container = options.container || document.body;
        this.load();
    }

    async load() {
        try {
            const response = await fetch('components/player/player.html');
            const html = await response.text();
            
            // Clear container and insert player
            this.container.innerHTML = html;
            
            // Set video info
            document.getElementById('videoTitle').textContent = this.title;
            document.getElementById('videoSubtitle').textContent = this.subtitle;
            
            // Load YouTube API if not already loaded
            if (!window.YT) {
                await this.loadYouTubeAPI();
            }
            
            // Initialize player
            this.initializePlayer();
            
            // Setup event listeners
            this.setupEventListeners();
            
        } catch (error) {
            console.error('Could not load video player:', error);
        }
    }

    loadYouTubeAPI() {
        return new Promise((resolve) => {
            if (window.YT && window.YT.Player) {
                resolve();
                return;
            }

            // Load YouTube API
            const script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(script);

            window.onYouTubeIframeAPIReady = () => {
                resolve();
            };
        });
    }

    initializePlayer() {
        if (!this.videoId) return;

        this.player = new YT.Player('videoPlayer', {
            height: '315',
            width: '100%',
            videoId: this.videoId,
            playerVars: {
                'playsinline': 1,
                'rel': 0,
                'modestbranding': 1
            },
            events: {
                'onReady': (event) => {
                    console.log('Player ready');
                },
                'onStateChange': (event) => {
                    // Handle player state changes if needed
                }
            }
        });
    }

    setupEventListeners() {
        // Back button
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', this.onBack);
        }

        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
    }

    toggleFullscreen() {
        const videoWrapper = document.querySelector('.video-wrapper');
        if (!document.fullscreenElement) {
            videoWrapper.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Update video
    updateVideo(videoId, title, subtitle) {
        this.videoId = videoId;
        this.title = title;
        this.subtitle = subtitle;

        document.getElementById('videoTitle').textContent = title;
        document.getElementById('videoSubtitle').textContent = subtitle;

        if (this.player && this.player.loadVideoById) {
            this.player.loadVideoById(videoId);
        }
    }
}
