// Header Component
class HeaderComponent {
    constructor(options = {}) {
        this.title = options.title || 'WordWave';
        this.rightContent = options.rightContent || null;
        this.load();
    }

    async load() {
        try {
            const response = await fetch('components/header/header.html');
            const html = await response.text();
            
            // Insert header at the beginning of body
            document.body.insertAdjacentHTML('afterbegin', html);
            
            // Set page title
            this.setTitle(this.title);
            
            // Set right content if provided
            if (this.rightContent) {
                this.setRightContent(this.rightContent);
            }
            
            // Store reference globally for updates
            window.headerComponent = this;
            
            // Dispatch event that header is loaded
            document.dispatchEvent(new CustomEvent('headerLoaded'));
            
        } catch (error) {
            console.warn('Could not load header:', error);
        }
    }

    setTitle(title) {
        const titleElement = document.getElementById('pageTitle');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    setRightContent(content) {
        const rightElement = document.getElementById('headerRight');
        if (rightElement) {
            rightElement.innerHTML = content;
        }
    }

    // Helper method to create badge HTML
    static createBadge(text, type = 'primary') {
        return `<span class="badge bg-${type}">${text}</span>`;
    }

    // Helper method to create multiple badges
    static createBadges(badges) {
        return badges.map(badge => {
            const type = badge.type || 'primary';
            const classes = badge.classes || '';
            return `<span class="badge bg-${type} ${classes}">${badge.text}</span>`;
        }).join('');
    }
}

// Global function to initialize header with options
window.initHeader = function(options) {
    document.addEventListener('DOMContentLoaded', () => {
        new HeaderComponent(options);
    });
};

// Global functions to update header content
window.updateHeaderTitle = function(title) {
    if (window.headerComponent) {
        window.headerComponent.setTitle(title);
    }
};

window.updateHeaderRight = function(content) {
    if (window.headerComponent) {
        window.headerComponent.setRightContent(content);
    }
};

// Helper function to update specific elements in header
window.updateHeaderElement = function(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        if (typeof content === 'string') {
            element.textContent = content;
        } else {
            element.innerHTML = content;
        }
    }
};
