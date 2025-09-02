// Bottom Navigation Component
class BottomNavComponent {
    constructor() {
        this.load();
    }

    async load() {
        try {
            const response = await fetch('components/bottom-nav/bottom-nav.html');
            const html = await response.text();
            
            // Insert bottom nav at the end of body
            document.body.insertAdjacentHTML('beforeend', html);
            
            // Set active state based on current page
            this.setActiveState();
        } catch (error) {
            console.warn('Could not load bottom navigation:', error);
        }
    }

    setActiveState() {
        // Get current page name from URL
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
        
        // Find and activate the corresponding nav link
        const navLinks = document.querySelectorAll('.bottom-nav .nav-link');
        navLinks.forEach(link => {
            const pageName = link.getAttribute('data-page');
            if (pageName === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

// Initialize bottom navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new BottomNavComponent();
});
