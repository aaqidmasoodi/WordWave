class LearningMaterialManager {
    constructor() {
        this.currentView = 'lessons';
        this.learningData = null;
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
        } catch (error) {
            console.error('Failed to load learning data:', error);
        }
    }

    renderLessons(levelFilter = '') {
        if (!this.learningData?.lessons) return;

        const grid = document.getElementById('lessonsGrid');
        const lessons = Object.keys(this.learningData.lessons).filter(key => {
            const lesson = this.learningData.lessons[key];
            return !levelFilter || lesson.level === levelFilter || lesson.level === 'all_levels';
        });

        if (lessons.length === 0) {
            grid.innerHTML = '<div class="empty-state"><i class="bi bi-search"></i><h6>No lessons found</h6><p>Try adjusting filters</p></div>';
            return;
        }

        grid.innerHTML = lessons.map(key => {
            const lesson = this.learningData.lessons[key];
            const videoCount = Object.keys(lesson).filter(k => k.startsWith('video_')).length;
            const thumbnail = `https://img.youtube.com/vi/${lesson.video_1}/mqdefault.jpg`;
            
            return `
                <div class="lesson-card" data-lesson="${key}">
                    <div class="card-thumbnail">
                        <img src="${thumbnail}" alt="${key}" loading="lazy">
                        <div class="thumbnail-overlay">
                            <i class="bi bi-play-circle-fill play-icon"></i>
                        </div>
                        <div class="card-badges">
                            <span class="badge bg-primary">${videoCount}</span>
                            <span class="badge bg-secondary">${this.formatLevel(lesson.level)}</span>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="card-title">${this.formatTitle(key)}</div>
                        <div class="card-description">${lesson.description}</div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click listeners
        grid.querySelectorAll('.lesson-card').forEach(card => {
            card.addEventListener('click', () => {
                this.showLessonDetail(card.dataset.lesson);
            });
        });
    }

    renderPodcasts(levelFilter = '', difficultyFilter = '') {
        if (!this.learningData?.podcasts) return;

        const grid = document.getElementById('podcastsGrid');
        const podcasts = Object.keys(this.learningData.podcasts).filter(key => {
            const podcast = this.learningData.podcasts[key];
            const levelMatch = !levelFilter || podcast.level === levelFilter || podcast.level === 'all_levels';
            const difficultyMatch = !difficultyFilter || podcast.difficulty.includes(difficultyFilter);
            return levelMatch && difficultyMatch;
        });

        if (podcasts.length === 0) {
            grid.innerHTML = '<div class="empty-state"><i class="bi bi-search"></i><h6>No podcasts found</h6><p>Try adjusting filters</p></div>';
            return;
        }

        grid.innerHTML = podcasts.map(key => {
            const podcast = this.learningData.podcasts[key];
            const episodeCount = Object.keys(podcast).filter(k => k.startsWith('episode_')).length;
            const thumbnail = `https://img.youtube.com/vi/${podcast.episode_1}/mqdefault.jpg`;
            
            return `
                <div class="podcast-card" data-podcast="${key}">
                    <div class="card-thumbnail">
                        <img src="${thumbnail}" alt="${key}" loading="lazy">
                        <div class="thumbnail-overlay">
                            <i class="bi bi-headphones play-icon"></i>
                        </div>
                        <div class="card-badges">
                            <span class="badge bg-success">${episodeCount}</span>
                            <span class="badge bg-warning text-dark">${podcast.duration}</span>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="card-title">${this.formatTitle(key)}</div>
                        <div class="card-description">${podcast.description}</div>
                        <div class="card-meta">
                            <span class="badge bg-secondary">${this.formatLevel(podcast.level)}</span>
                            <span class="badge bg-info">${this.formatDifficulty(podcast.difficulty)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click listeners
        grid.querySelectorAll('.podcast-card').forEach(card => {
            card.addEventListener('click', () => {
                this.showPodcastDetail(card.dataset.podcast);
            });
        });
    }

    showLessonDetail(lessonKey) {
        const lesson = this.learningData.lessons[lessonKey];
        
        document.getElementById('lessonsListView').classList.add('d-none');
        document.getElementById('lessonDetailView').classList.remove('d-none');
        document.getElementById('lessonTitle').textContent = this.formatTitle(lessonKey);
        document.getElementById('lessonDescription').textContent = lesson.description;

        this.initializeYouTubeAPI();

        const videoList = document.getElementById('lessonVideosGrid');
        const videoKeys = Object.keys(lesson).filter(key => key.startsWith('video_'));
        
        videoList.innerHTML = videoKeys.map((videoKey, index) => {
            const videoId = lesson[videoKey];
            const thumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            
            return `
                <div class="video-list-item" data-video="${videoId}">
                    <div class="d-flex align-items-center">
                        <div class="video-item-thumbnail">
                            <img src="${thumbnail}" alt="${videoKey}" loading="lazy">
                            <i class="bi bi-play-circle-fill video-item-play"></i>
                        </div>
                        <div class="video-item-content">
                            <div class="video-item-title">${this.formatVideoTitle(videoKey)}</div>
                            <div class="video-item-meta">Part ${index + 1} of ${videoKeys.length}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click listeners and auto-play first
        videoList.querySelectorAll('.video-list-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.playVideo(item.dataset.video, this.formatVideoTitle(videoKeys[index]), this.formatTitle(lessonKey));
                this.highlightActive(item, '.video-list-item');
            });
            
            if (index === 0) {
                setTimeout(() => item.click(), 300);
            }
        });

        document.getElementById('backToLessonsBtn').onclick = () => this.showLessonsList();
    }

    showPodcastDetail(podcastKey) {
        const podcast = this.learningData.podcasts[podcastKey];
        
        document.getElementById('podcastsListView').classList.add('d-none');
        document.getElementById('podcastPlayerView').classList.remove('d-none');
        document.getElementById('podcastTitle').textContent = this.formatTitle(podcastKey);
        document.getElementById('podcastDescription').textContent = podcast.description;
        document.getElementById('podcastLevel').textContent = this.formatLevel(podcast.level);
        document.getElementById('podcastDifficulty').textContent = this.formatDifficulty(podcast.difficulty);
        document.getElementById('podcastDuration').textContent = podcast.duration;

        this.initializeYouTubeAPI();

        const episodeList = document.getElementById('allPodcastsGrid');
        const episodeKeys = Object.keys(podcast).filter(key => key.startsWith('episode_'));
        
        episodeList.innerHTML = episodeKeys.map((episodeKey, index) => {
            const videoId = podcast[episodeKey];
            const thumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            
            return `
                <div class="podcast-list-item" data-video="${videoId}">
                    <div class="d-flex align-items-center">
                        <div class="video-item-thumbnail">
                            <img src="${thumbnail}" alt="${episodeKey}" loading="lazy">
                            <i class="bi bi-play-circle-fill video-item-play"></i>
                        </div>
                        <div class="video-item-content">
                            <div class="video-item-title">${this.formatVideoTitle(episodeKey)}</div>
                            <div class="video-item-meta">Episode ${index + 1} of ${episodeKeys.length}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click listeners and auto-play first
        episodeList.querySelectorAll('.podcast-list-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.playPodcast(item.dataset.video, this.formatVideoTitle(episodeKeys[index]), this.formatTitle(podcastKey));
                this.highlightActive(item, '.podcast-list-item');
            });
            
            if (index === 0) {
                setTimeout(() => item.click(), 300);
            }
        });

        document.getElementById('backToPodcastsBtn').onclick = () => this.showPodcastsList();
    }

    showLearningPaths() {
        const modal = new bootstrap.Modal(document.getElementById('learningPathsModal'));
        const content = document.getElementById('learningPathsContent');
        
        content.innerHTML = Object.keys(this.learningData.learning_paths || {}).map(pathKey => {
            const path = this.learningData.learning_paths[pathKey];
            return `
                <div class="path-card">
                    <div class="path-title">${this.formatTitle(pathKey)}</div>
                    <div class="path-description">${path.description}</div>
                    <div class="mb-2">
                        <span class="badge bg-primary me-1">${path.estimated_duration}</span>
                        <span class="badge bg-secondary">${path.recommended_sequence.length} lessons</span>
                    </div>
                    <div class="small">
                        <strong>Lessons:</strong> ${path.recommended_sequence.map(l => this.formatTitle(l)).join(', ')}
                    </div>
                </div>
            `;
        }).join('');
        
        modal.show();
    }

    showSupplementaryContent() {
        const modal = new bootstrap.Modal(document.getElementById('supplementaryModal'));
        const content = document.getElementById('supplementaryContent');
        
        content.innerHTML = Object.keys(this.learningData.supplementary_content || {}).map(categoryKey => {
            const category = this.learningData.supplementary_content[categoryKey];
            return `
                <div class="supp-card">
                    <div class="supp-title">${this.formatTitle(categoryKey)}</div>
                    <div class="supp-description">${category.description}</div>
                    ${Object.keys(category).filter(key => key !== 'description').map(contentKey => {
                        const videoId = category[contentKey];
                        return `
                            <div class="supp-item">
                                <div class="supp-thumbnail">
                                    <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="${contentKey}" loading="lazy">
                                </div>
                                <div class="supp-content">
                                    <div class="supp-name">${this.formatTitle(contentKey)}</div>
                                    <button class="btn btn-outline-primary btn-watch" onclick="window.open('https://youtube.com/watch?v=${videoId}', '_blank')">
                                        <i class="bi bi-play me-1"></i>Watch
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }).join('');
        
        modal.show();
    }

    async initializeYouTubeAPI() {
        if (window.YT?.Player) return;
        
        return new Promise(resolve => {
            if (window.YT?.Player) return resolve();
            
            const script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(script);
            
            window.onYouTubeIframeAPIReady = resolve;
        });
    }

    playVideo(videoId, title, subtitle) {
        document.getElementById('currentVideoTitle').textContent = title;
        document.getElementById('currentVideoSubtitle').textContent = subtitle;

        if (this.player?.loadVideoById) {
            this.player.loadVideoById(videoId);
        } else {
            this.player = new YT.Player('videoPlayer', {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: { playsinline: 1, rel: 0, modestbranding: 1 }
            });
        }
    }

    playPodcast(videoId, title, subtitle) {
        document.getElementById('currentPodcastTitle').textContent = title;

        if (this.podcastPlayer?.loadVideoById) {
            this.podcastPlayer.loadVideoById(videoId);
        } else {
            this.podcastPlayer = new YT.Player('podcastPlayer', {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: { playsinline: 1, rel: 0, modestbranding: 1 }
            });
        }
    }

    highlightActive(activeItem, selector) {
        document.querySelectorAll(selector).forEach(item => {
            item.classList.remove('border-primary', 'bg-primary', 'bg-opacity-10');
        });
        activeItem.classList.add('border-primary', 'bg-primary', 'bg-opacity-10');
    }

    showLessonsList() {
        document.getElementById('lessonDetailView').classList.add('d-none');
        document.getElementById('lessonsListView').classList.remove('d-none');
        this.player?.stopVideo?.();
    }

    showPodcastsList() {
        document.getElementById('podcastPlayerView').classList.add('d-none');
        document.getElementById('podcastsListView').classList.remove('d-none');
        this.podcastPlayer?.stopVideo?.();
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
            this.showLessonsList();
        } else {
            lessonsSection.classList.add('d-none');
            podcastsSection.classList.remove('d-none');
            lessonsTab.classList.remove('active');
            podcastsTab.classList.add('active');
            this.showPodcastsList();
        }
    }

    formatLevel(level) {
        return level.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    formatDifficulty(difficulty) {
        return difficulty.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    formatTitle(title) {
        return title.replace(/^(lesson|podcast)_\d+_/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    formatVideoTitle(videoKey) {
        return videoKey.replace(/^(video|episode)_\d+/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 
               videoKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    setupEventListeners() {
        // Tab switching
        const setupTabs = () => {
            document.getElementById('lessonsTab')?.addEventListener('click', () => this.switchView('lessons'));
            document.getElementById('podcastsTab')?.addEventListener('click', () => this.switchView('podcasts'));
        };

        // Filters
        document.getElementById('levelFilter')?.addEventListener('change', e => this.renderLessons(e.target.value));
        document.getElementById('podcastLevelFilter')?.addEventListener('change', e => {
            const difficulty = document.getElementById('difficultyFilter').value;
            this.renderPodcasts(e.target.value, difficulty);
        });
        document.getElementById('difficultyFilter')?.addEventListener('change', e => {
            const level = document.getElementById('podcastLevelFilter').value;
            this.renderPodcasts(level, e.target.value);
        });

        // Modals
        document.getElementById('learningPathsBtn')?.addEventListener('click', () => this.showLearningPaths());
        document.getElementById('supplementaryBtn')?.addEventListener('click', () => this.showSupplementaryContent());

        // Setup tabs
        if (document.getElementById('lessonsTab')) {
            setupTabs();
        } else {
            document.addEventListener('headerLoaded', setupTabs);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.app !== 'undefined') {
        const init = () => window.learningMaterialManager = new LearningMaterialManager();
        
        if (document.getElementById('lessonsTab')) {
            init();
        } else {
            document.addEventListener('headerLoaded', init);
        }
    }
});
