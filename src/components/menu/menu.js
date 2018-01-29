import authService from '../../services/auth';
import '../menu/menu.css';

class Menu {
    constructor($el) {
        this.$el = $el;

        this.render();

        authService.on('login', this.updateHeader.bind(this));
    }

    render() {
        this.$el.innerHTML = `<div class="pure-menu pure-menu-horizontal menu">
            <span class="pure-menu-heading js-header">Chat</span>
            <ul class="pure-menu-list">
                <li class="pure-menu-item"><a href="#" class="pure-menu-link js-logout">Logout</a></li>
            </ul>
        </div>`;

        this.initEvents();
    }

    updateHeader() {
        const user = authService.getUser();
        const text = user ? user.displayName || user.email : 'chat';

        if (this.$header) {
            this.$header.textContent = text;
        }
    }

    initEvents() {
        this.$logout = this.$el.querySelector('.js-logout');
        this.$logout.addEventListener('click', this.onLogout.bind(this));

        this.$header = this.$el.querySelector('.js-header');
        this.updateHeader();
    }

    onLogout(event) {
        authService.logout()
            .catch((error) => {
                console.log(`failed to logout: ${error.code}:${error.message}`);
            });

        event.preventDefault();
    }
}

export default Menu;
