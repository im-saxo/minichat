import authService from '../services/auth';

class Router {
    constructor(views) {
        this.views = views;
        this.currentView = null;
    }

    start() {
        authService.onLogin = () => {
            this.route('chat');
        };

        authService.onLogout = () => {
            this.route('auth');
        };

        let name = authService.getUser() ? 'chat' : 'auth';

        this.route(name);
    }

    route(name) {
        if (this.currentView) {
            this.currentView.$el.style.display = 'none';
        }

        this.currentView = this.views[name];
        this.currentView.$el.style.display = 'block';
    }
}

export default Router;
