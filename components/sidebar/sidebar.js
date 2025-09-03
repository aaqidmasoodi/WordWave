// Sidebar Component
class SidebarComponent {
    constructor() {
        this.load();
    }

    async load() {
        try {
            const response = await fetch('components/sidebar/sidebar.html');
            const html = await response.text();
            
            // Insert sidebar at the beginning of body
            document.body.insertAdjacentHTML('afterbegin', html);
            
            // Wait for header to load before initializing
            this.waitForHeader();
            
        } catch (error) {
            console.warn('Could not load sidebar:', error);
        }
    }

    waitForHeader() {
        // Check if burger menu exists
        const burgerMenu = document.getElementById('burgerMenu');
        if (burgerMenu) {
            this.init();
        } else {
            // Wait for header loaded event
            document.addEventListener('headerLoaded', () => {
                this.init();
            });
        }
    }

    init() {
        const burgerMenu = document.getElementById('burgerMenu');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        
        if (!burgerMenu || !sidebarOverlay) return;
        
        // Update profile display
        this.updateProfile();
        
        // Open sidebar
        burgerMenu.addEventListener('click', () => {
            sidebarOverlay.classList.add('active');
        });
        
        // Close sidebar when clicking overlay
        sidebarOverlay.addEventListener('click', (e) => {
            if (e.target === sidebarOverlay) {
                sidebarOverlay.classList.remove('active');
            }
        });
        
        // Close sidebar with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebarOverlay.classList.contains('active')) {
                sidebarOverlay.classList.remove('active');
            }
        });
    }

    updateProfile() {
        // Get profile from state with safety checks
        let profile = { name: 'User', avatar: 'U' };
        
        if (window.appState && typeof window.appState.getProfile === 'function') {
            try {
                profile = window.appState.getProfile() || profile;
            } catch (error) {
                console.warn('Error getting profile from appState:', error);
            }
        }
        
        // Update sidebar elements
        const avatarElement = document.getElementById('sidebarAvatar');
        const nameElement = document.getElementById('sidebarUserName');
        
        if (avatarElement) {
            avatarElement.textContent = profile.avatar;
        }
        
        if (nameElement) {
            nameElement.textContent = profile.name;
        }
    }
}

// Initialize sidebar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.sidebarComponent = new SidebarComponent();
});
