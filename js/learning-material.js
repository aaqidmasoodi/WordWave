// js/learning-material.js
class LearningMaterialManager {
    constructor() {
        this.currentView = 'lessons';
        this.learningData = null;
        this.currentLesson = null;
        this.init();
    }

    async init() {
        await this.loadLearningData();
        this.setupEventListeners();
        this.renderLessons();
        this.renderPodcasts();
    }

    async loadLearningData() {
        try {
            const response = await fetch('Learning Material/learning_material.json');
            this.learningData = await response.json();
            console.log('Learning data loaded:', this.learningData);
        } catch (error) {
            console.error('Failed to load learning data:', error);
        }
    }

    renderLessons() {
        if (!this.learningData?.lessons) return;

        const lessonsGrid = document.getElementById('lessonsGrid');
        lessonsGrid.innerHTML = '';

        Object.keys(this.learningData.lessons).forEach(lessonKey => {
            const lesson = this.learningData.lessons[lessonKey];
            const videoCount = Object.keys(lesson).length;
            const firstVideoId = Object.values(lesson)[0]; // Get first video for thumbnail
            
            const lessonCard = document.createElement('div');
            lessonCard.className = 'col-md-6 col-lg-4 mb-4';
            lessonCard.innerHTML = `
                <div class="card h-100 lesson-card" data-lesson="${lessonKey}">
                    <div class="lesson-thumbnail">
                        <img src="https://img.youtube.com/vi/${firstVideoId}/maxresdefault.jpg" 
                             class="card-img-top" alt="${lessonKey}">
                        <div class="lesson-overlay">
                            <div class="lesson-play-btn">
                                <i class="bi bi-play-circle-fill"></i>
                            </div>
                            <div class="lesson-count">
                                ${videoCount} video${videoCount > 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${this.formatLessonTitle(lessonKey)}</h5>
                        <p class="card-text text-muted">Learn with ${videoCount} engaging video${videoCount > 1 ? 's' : ''}</p>
                        <button class="btn btn-primary w-100">
                            <i class="bi bi-play me-1"></i>Start Learning
                        </button>
                    </div>
                </div>
            `;

            lessonCard.addEventListener('click', () => {
                this.showLessonDetail(lessonKey);
            });

            lessonsGrid.appendChild(lessonCard);
        });
    }

    renderPodcasts() {
        if (!this.learningData?.podcasts) return;

        const podcastsGrid = document.getElementById('podcastsGrid');
        podcastsGrid.innerHTML = '';

        Object.keys(this.learningData.podcasts).forEach(podcastKey => {
            const podcast = this.learningData.podcasts[podcastKey];
            const videoCount = Object.keys(podcast).length;
            const firstVideoId = Object.values(podcast)[0]; // Get first video for thumbnail
            
            const podcastCard = document.createElement('div');
            podcastCard.className = 'col-md-6 col-lg-4 mb-4';
            podcastCard.innerHTML = `
                <div class="card h-100 podcast-card" data-podcast="${podcastKey}">
                    <div class="podcast-thumbnail">
                        <img src="https://img.youtube.com/vi/${firstVideoId}/maxresdefault.jpg" 
                             class="card-img-top" alt="${podcastKey}">
                        <div class="podcast-overlay">
                            <div class="podcast-play-btn">
                                <i class="bi bi-headphones"></i>
                            </div>
                            <div class="podcast-badge">
                                ${videoCount} episode${videoCount > 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${this.formatPodcastTitle(podcastKey)}</h5>
                        <p class="card-text text-muted">Listen to ${videoCount} engaging episode${videoCount > 1 ? 's' : ''}</p>
                        <button class="btn btn-success w-100">
                            <i class="bi bi-play me-1"></i>Start Listening
                        </button>
                    </div>
                </div>
            `;

            podcastCard.addEventListener('click', () => {
                this.showPodcastDetail(podcastKey);
            });

            podcastsGrid.appendChild(podcastCard);
        });
    }

    showPodcastDetail(podcastKey) {
        this.currentPodcast = podcastKey;
        const podcast = this.learningData.podcasts[podcastKey];
        
        document.getElementById('podcastsListView').classList.add('d-none');
        document.getElementById('podcastPlayerView').classList.remove('d-none');
        document.getElementById('podcastTitle').textContent = this.formatPodcastTitle(podcastKey);
        
        // Initialize YouTube API if not loaded
        this.initializeYouTubeAPI();
        
        const allPodcastsGrid = document.getElementById('allPodcastsGrid');
        allPodcastsGrid.innerHTML = '';

        Object.keys(podcast).forEach((episodeKey, index) => {
            const videoId = podcast[episodeKey];
            
            const episodeItem = document.createElement('div');
            episodeItem.className = 'podcast-list-item border rounded';
            episodeItem.setAttribute('data-podcast-id', videoId);
            episodeItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="video-thumbnail-small me-2">
                        <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" 
                             class="img-fluid rounded" alt="${episodeKey}">
                        <div class="play-overlay-small">
                            <i class="bi bi-play-circle-fill"></i>
                        </div>
                    </div>
                    <div class="flex-grow-1">
                        <h6 class="mb-0">${this.formatVideoTitle(episodeKey)}</h6>
                        <small class="text-muted">Tap to play</small>
                    </div>
                </div>
            `;

            episodeItem.style.cursor = 'pointer';
            episodeItem.addEventListener('click', () => {
                this.playPodcastInPlayer(videoId, this.formatVideoTitle(episodeKey), this.formatPodcastTitle(podcastKey));
                // Highlight selected episode
                document.querySelectorAll('.podcast-list-item').forEach(item => item.classList.remove('border-primary', 'bg-primary', 'bg-opacity-10'));
                episodeItem.classList.add('border-primary', 'bg-primary', 'bg-opacity-10');
            });

            allPodcastsGrid.appendChild(episodeItem);

            // Auto-play first episode
            if (index === 0) {
                setTimeout(() => {
                    episodeItem.click();
                }, 500);
            }
        });

        // Setup back button
        const backBtn = document.getElementById('backToPodcastsBtn');
        backBtn.replaceWith(backBtn.cloneNode(true)); // Remove old listeners
        document.getElementById('backToPodcastsBtn').addEventListener('click', () => {
            this.showPodcastsList();
        });
    }

    showPodcastsList() {
        document.getElementById('podcastPlayerView').classList.add('d-none');
        document.getElementById('podcastsListView').classList.remove('d-none');
        
        // Stop podcast if playing
        if (this.podcastPlayer && this.podcastPlayer.stopVideo) {
            this.podcastPlayer.stopVideo();
        }
    }

    playPodcastInPlayer(videoId, title, subtitle) {
        document.getElementById('currentPodcastTitle').textContent = title;

        if (this.podcastPlayer && this.podcastPlayer.loadVideoById) {
            this.podcastPlayer.loadVideoById(videoId);
        } else {
            // Initialize player
            this.podcastPlayer = new YT.Player('podcastPlayer', {
                height: '315',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    'playsinline': 1,
                    'rel': 0,
                    'modestbranding': 1
                }
            });
        }
    }

    showLessonDetail(lessonKey) {
        this.currentLesson = lessonKey;
        const lesson = this.learningData.lessons[lessonKey];
        
        document.getElementById('lessonsListView').classList.add('d-none');
        document.getElementById('lessonDetailView').classList.remove('d-none');
        document.getElementById('lessonTitle').textContent = this.formatLessonTitle(lessonKey);

        // Initialize YouTube API if not loaded
        this.initializeYouTubeAPI();

        const videosGrid = document.getElementById('lessonVideosGrid');
        videosGrid.innerHTML = '';

        Object.keys(lesson).forEach((videoKey, index) => {
            const videoId = lesson[videoKey];
            
            const videoItem = document.createElement('div');
            videoItem.className = 'video-list-item border rounded';
            videoItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="video-thumbnail-small me-2">
                        <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" 
                             class="img-fluid rounded" alt="${videoKey}">
                        <div class="play-overlay-small">
                            <i class="bi bi-play-circle-fill"></i>
                        </div>
                    </div>
                    <div class="flex-grow-1">
                        <h6 class="mb-0">${this.formatVideoTitle(videoKey)}</h6>
                        <small class="text-muted">Tap to play</small>
                    </div>
                </div>
            `;

            videoItem.style.cursor = 'pointer';
            videoItem.addEventListener('click', () => {
                this.playVideoInPlayer(videoId, this.formatVideoTitle(videoKey), this.formatLessonTitle(lessonKey));
                // Highlight selected video
                document.querySelectorAll('.video-list-item').forEach(item => item.classList.remove('border-primary', 'bg-primary', 'bg-opacity-10'));
                videoItem.classList.add('border-primary', 'bg-primary', 'bg-opacity-10');
            });

            videosGrid.appendChild(videoItem);

            // Auto-play first video
            if (index === 0) {
                setTimeout(() => {
                    videoItem.click();
                }, 500);
            }
        });

        // Setup back button
        const backBtn = document.getElementById('backToLessonsBtn');
        backBtn.replaceWith(backBtn.cloneNode(true)); // Remove old listeners
        document.getElementById('backToLessonsBtn').addEventListener('click', () => {
            this.showLessonsList();
        });
    }

    async initializeYouTubeAPI() {
        if (window.YT && window.YT.Player) return;

        return new Promise((resolve) => {
            if (window.YT && window.YT.Player) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(script);

            window.onYouTubeIframeAPIReady = () => {
                resolve();
            };
        });
    }

    playVideoInPlayer(videoId, title, subtitle) {
        document.getElementById('currentVideoTitle').textContent = title;
        document.getElementById('currentVideoSubtitle').textContent = subtitle;

        if (this.player && this.player.loadVideoById) {
            this.player.loadVideoById(videoId);
        } else {
            // Initialize player
            this.player = new YT.Player('videoPlayer', {
                height: '315',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    'playsinline': 1,
                    'rel': 0,
                    'modestbranding': 1
                }
            });
        }
    }

    showLessonsList() {
        document.getElementById('lessonDetailView').classList.add('d-none');
        document.getElementById('lessonsListView').classList.remove('d-none');
        
        // Stop video if playing
        if (this.player && this.player.stopVideo) {
            this.player.stopVideo();
        }
    }

    formatLessonTitle(lessonKey) {
        return lessonKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    formatPodcastTitle(podcastKey) {
        return podcastKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    formatVideoTitle(videoKey) {
        return videoKey.replace(/\b\w/g, l => l.toUpperCase());
    }

    switchView(view) {
        this.currentView = view;
        
        const lessonsSection = document.getElementById('lessonsSection');
        const podcastsSection = document.getElementById('podcastsSection');
        const lessonsTab = document.getElementById('lessonsTab');
        const podcastsTab = document.getElementById('podcastsTab');

        if (view === 'lessons') {
            lessonsSection.classList.remove('d-none');
            podcastsSection.classList.add('d-none');
            lessonsTab.classList.add('active');
            podcastsTab.classList.remove('active');
            
            // Reset to lessons list view
            this.showLessonsList();
        } else {
            lessonsSection.classList.add('d-none');
            podcastsSection.classList.remove('d-none');
            lessonsTab.classList.remove('active');
            podcastsTab.classList.add('active');
            
            // Reset to podcasts list view
            this.showPodcastsList();
        }
    }

    setupEventListeners() {
        // Wait for header buttons to be available
        const setupButtons = () => {
            const lessonsTab = document.getElementById('lessonsTab');
            const podcastsTab = document.getElementById('podcastsTab');
            
            if (lessonsTab && podcastsTab) {
                // View switching
                lessonsTab.addEventListener('click', () => {
                    this.switchView('lessons');
                });

                podcastsTab.addEventListener('click', () => {
                    this.switchView('podcasts');
                });
            }
        };
        
        // Try to setup immediately, or wait for header
        const lessonsTab = document.getElementById('lessonsTab');
        if (lessonsTab) {
            setupButtons();
        } else {
            document.addEventListener('headerLoaded', setupButtons);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.app !== 'undefined') {
        // Wait for header to load before initializing learning material
        const initLearningMaterial = () => {
            window.learningMaterialManager = new LearningMaterialManager();
        };
        
        // Check if header elements exist, or wait for header loaded event
        const lessonsTab = document.getElementById('lessonsTab');
        if (lessonsTab) {
            initLearningMaterial();
        } else {
            document.addEventListener('headerLoaded', initLearningMaterial);
        }
    }
});
