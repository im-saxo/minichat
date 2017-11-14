(function () {
'use strict';

class Base {
    constructor($el) {
        this.$el = $el;

        this.render();
    }

    render() {}
}

class Messages {
    constructor($el) {
        this.$el = $el;
        this.$el.innerHTML = '<b>messages here</b>';
        this.data = {};
    }

    setData(data) {
        this.data = data;

        this.render();
    }

    addMessage(message) {
        if (!this.data.messages) {
            this.data.messages = [];
        }

        this.data.messages.push(message);
        this.render();
    }

    render() {
        if (this.data.messages) {
            let html = this.data.messages
                .map(item => this.tmplMessage(item.message))
                .join('\n');

            this.$el.innerHTML = html;
        } else {
            this.$el.innerHTML = 'no messages';
        }
    }

    tmplMessage(message) {
        return `<div class="message">${message}</div>`;
    }
}

class Form {
    constructor($el) {
        this.$el = $el;

        this.render();
    }

    render() {
        this.$el.innerHTML = `<form class="compose js-form" action="#">
        <input type="text" class="compose-input js-input" name="message" autocomplete="off"/>
        <button type="submit" class="btn">Send</button>
        </form>`;

        this.initEvents();
    }

    initEvents() {
        this.$form = this.$el.querySelector('.js-form');
        this.$input = this.$form.querySelector('.js-input');

        this.$form.addEventListener('submit', this.onSubmit.bind(this));
    }

    onSubmit(event) {
        this.onSend({ user: 'Default', message: this.$input.value });
        this.$input.value = '';

        event.preventDefault();
    }

    onSend() {}
}

class Chat extends Base {
    setData(data) {
        this.data = data;

        this.messages.setData(data);
    }

    render() {
        // clear
        this.$el.innerHTML = '';

        // messages
        let $messages = document.createElement('div');
        $messages.className = 'messages';
        this.$el.appendChild($messages);

        this.messages = new Messages($messages);
        this.messages.setData(this.data || {});

        // compose
        let $form = document.createElement('div');
        this.$el.appendChild($form);

        this.compose = new Form($form);
        this.compose.onSend = (message) => {
            this.messages.addMessage(message);
        };
    }
}

// TODO: use import
let { firebase } = window;

/**
 * Singleton auth service
 */
class AuthService {
    constructor() {
        this.auth = firebase.auth();

        this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
    }

    getUser() {
        return this.auth.currentUser;
    }

    login(email, password) {
        return this.auth.signInWithEmailAndPassword(email, password);
    }

    signup(email, password) {
        return this.auth.createUserWithEmailAndPassword(email, password);
    }

    onAuthStateChanged(user) {
        if (user) {
            this.onLogin();
        } else {
            this.onLogout();
        }
    }

    onLogin() {}

    onLogout() {}
}

var authService = new AuthService();

class Login {
    constructor($el) {
        this.$el = $el;

        this.render();
    }

    render() {
        this.$el.innerHTML = `<form action="#">
        <div><input type="text" name="email"/></div>
        <div><input type="password" name="password"/></div>
        <button type="submit" class="btn btn_main">Log in</button>
        <button class="js-signup">Sign up</button>`;

        this.initEvents();
    }

    initEvents() {
        this.$form = this.$el.querySelector('form');
        this.$email = this.$form.querySelector('input[name="email"]');
        this.$password = this.$form.querySelector('input[name="password"]');
        this.$signup = this.$el.querySelector('.js-signup');

        this.$form.addEventListener('submit', this.onSubmit.bind(this));
        this.$signup.addEventListener('click', this.onSignup.bind(this));
    }

    onSubmit(event) {
        let email = this.$email.value;
        let password = this.$password.value;

        authService.login(email, password)
            .catch((error) => {
                alert(`failed to sign up: ${error.code}:${error.message}`);
            });

        event.preventDefault();
    }

    onSignup(event) {
        let email = this.$email.value;
        let password = this.$password.value;

        authService.signup(email, password)
            .catch((error) => {
                alert(`failed to sign up: ${error.code}:${error.message}`);
            });

        event.preventDefault();
    }
}

class Auth extends Base {
    render() {
        // clear
        this.login = new Login(this.$el);
    }
}

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

let $loading = document.querySelector('.js-loading');
let $container = document.querySelector('.js-components');

// load data
let data = {
    messages: [
        {
            user: 'John',
            message: 'Hi!',
        },
        {
            user: 'Jane',
            message: 'Hello there!',
        },
    ],
};

// views
let views = {
    chat: new Chat(document.createElement('div')),
    auth: new Auth(document.createElement('div')),
};

Object.keys(views).forEach((key) => {
    views[key].$el.style.display = 'none';
    $container.appendChild(views[key].$el);
});

views.chat.setData(data);

// router
let router = new Router(views);

router.start();

// ready
$loading.style.display = 'none';
$container.style.display = null;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJzcmMvdmlld3MvYmFzZS9iYXNlLmpzIiwic3JjL2NvbXBvbmVudHMvbWVzc2FnZXMvbWVzc2FnZXMuanMiLCJzcmMvY29tcG9uZW50cy9mb3JtL2Zvcm0uanMiLCJzcmMvdmlld3MvY2hhdC9jaGF0LmpzIiwic3JjL3NlcnZpY2VzL2F1dGguanMiLCJzcmMvY29tcG9uZW50cy9sb2dpbi9sb2dpbi5qcyIsInNyYy92aWV3cy9hdXRoL2F1dGguanMiLCJzcmMvcm91dGVyL3JvdXRlci5qcyIsInNyYy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEJhc2Uge1xuICAgIGNvbnN0cnVjdG9yKCRlbCkge1xuICAgICAgICB0aGlzLiRlbCA9ICRlbDtcblxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHt9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2U7XG4iLCJjbGFzcyBNZXNzYWdlcyB7XG4gICAgY29uc3RydWN0b3IoJGVsKSB7XG4gICAgICAgIHRoaXMuJGVsID0gJGVsO1xuICAgICAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSAnPGI+bWVzc2FnZXMgaGVyZTwvYj4nO1xuICAgICAgICB0aGlzLmRhdGEgPSB7fTtcbiAgICB9XG5cbiAgICBzZXREYXRhKGRhdGEpIHtcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcblxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIGFkZE1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgICBpZiAoIXRoaXMuZGF0YS5tZXNzYWdlcykge1xuICAgICAgICAgICAgdGhpcy5kYXRhLm1lc3NhZ2VzID0gW107XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRhdGEubWVzc2FnZXMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGEubWVzc2FnZXMpIHtcbiAgICAgICAgICAgIGxldCBodG1sID0gdGhpcy5kYXRhLm1lc3NhZ2VzXG4gICAgICAgICAgICAgICAgLm1hcChpdGVtID0+IHRoaXMudG1wbE1lc3NhZ2UoaXRlbS5tZXNzYWdlKSlcbiAgICAgICAgICAgICAgICAuam9pbignXFxuJyk7XG5cbiAgICAgICAgICAgIHRoaXMuJGVsLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSAnbm8gbWVzc2FnZXMnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdG1wbE1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJtZXNzYWdlXCI+JHttZXNzYWdlfTwvZGl2PmA7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNZXNzYWdlcztcbiIsImNsYXNzIEZvcm0ge1xuICAgIGNvbnN0cnVjdG9yKCRlbCkge1xuICAgICAgICB0aGlzLiRlbCA9ICRlbDtcblxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdGhpcy4kZWwuaW5uZXJIVE1MID0gYDxmb3JtIGNsYXNzPVwiY29tcG9zZSBqcy1mb3JtXCIgYWN0aW9uPVwiI1wiPlxuICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImNvbXBvc2UtaW5wdXQganMtaW5wdXRcIiBuYW1lPVwibWVzc2FnZVwiIGF1dG9jb21wbGV0ZT1cIm9mZlwiLz5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG5cIj5TZW5kPC9idXR0b24+XG4gICAgICAgIDwvZm9ybT5gO1xuXG4gICAgICAgIHRoaXMuaW5pdEV2ZW50cygpO1xuICAgIH1cblxuICAgIGluaXRFdmVudHMoKSB7XG4gICAgICAgIHRoaXMuJGZvcm0gPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcuanMtZm9ybScpO1xuICAgICAgICB0aGlzLiRpbnB1dCA9IHRoaXMuJGZvcm0ucXVlcnlTZWxlY3RvcignLmpzLWlucHV0Jyk7XG5cbiAgICAgICAgdGhpcy4kZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCB0aGlzLm9uU3VibWl0LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIG9uU3VibWl0KGV2ZW50KSB7XG4gICAgICAgIHRoaXMub25TZW5kKHsgdXNlcjogJ0RlZmF1bHQnLCBtZXNzYWdlOiB0aGlzLiRpbnB1dC52YWx1ZSB9KTtcbiAgICAgICAgdGhpcy4kaW5wdXQudmFsdWUgPSAnJztcblxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIG9uU2VuZCgpIHt9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZvcm07XG4iLCJpbXBvcnQgQmFzZSBmcm9tICcuLi9iYXNlL2Jhc2UnO1xuaW1wb3J0IE1lc3NhZ2VzIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvbWVzc2FnZXMvbWVzc2FnZXMnO1xuaW1wb3J0IEZvcm0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9mb3JtL2Zvcm0nO1xuXG5jbGFzcyBDaGF0IGV4dGVuZHMgQmFzZSB7XG4gICAgc2V0RGF0YShkYXRhKSB7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG5cbiAgICAgICAgdGhpcy5tZXNzYWdlcy5zZXREYXRhKGRhdGEpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgLy8gY2xlYXJcbiAgICAgICAgdGhpcy4kZWwuaW5uZXJIVE1MID0gJyc7XG5cbiAgICAgICAgLy8gbWVzc2FnZXNcbiAgICAgICAgbGV0ICRtZXNzYWdlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAkbWVzc2FnZXMuY2xhc3NOYW1lID0gJ21lc3NhZ2VzJztcbiAgICAgICAgdGhpcy4kZWwuYXBwZW5kQ2hpbGQoJG1lc3NhZ2VzKTtcblxuICAgICAgICB0aGlzLm1lc3NhZ2VzID0gbmV3IE1lc3NhZ2VzKCRtZXNzYWdlcyk7XG4gICAgICAgIHRoaXMubWVzc2FnZXMuc2V0RGF0YSh0aGlzLmRhdGEgfHwge30pO1xuXG4gICAgICAgIC8vIGNvbXBvc2VcbiAgICAgICAgbGV0ICRmb3JtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRoaXMuJGVsLmFwcGVuZENoaWxkKCRmb3JtKTtcblxuICAgICAgICB0aGlzLmNvbXBvc2UgPSBuZXcgRm9ybSgkZm9ybSk7XG4gICAgICAgIHRoaXMuY29tcG9zZS5vblNlbmQgPSAobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlcy5hZGRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICB9O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2hhdDtcbiIsIi8vIFRPRE86IHVzZSBpbXBvcnRcbmxldCB7IGZpcmViYXNlIH0gPSB3aW5kb3c7XG5cbi8qKlxuICogU2luZ2xldG9uIGF1dGggc2VydmljZVxuICovXG5jbGFzcyBBdXRoU2VydmljZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuYXV0aCA9IGZpcmViYXNlLmF1dGgoKTtcblxuICAgICAgICB0aGlzLmF1dGgub25BdXRoU3RhdGVDaGFuZ2VkKHRoaXMub25BdXRoU3RhdGVDaGFuZ2VkLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGdldFVzZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF1dGguY3VycmVudFVzZXI7XG4gICAgfVxuXG4gICAgbG9naW4oZW1haWwsIHBhc3N3b3JkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF1dGguc2lnbkluV2l0aEVtYWlsQW5kUGFzc3dvcmQoZW1haWwsIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICBzaWdudXAoZW1haWwsIHBhc3N3b3JkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF1dGguY3JlYXRlVXNlcldpdGhFbWFpbEFuZFBhc3N3b3JkKGVtYWlsLCBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgb25BdXRoU3RhdGVDaGFuZ2VkKHVzZXIpIHtcbiAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgIHRoaXMub25Mb2dpbigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vbkxvZ291dCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25Mb2dpbigpIHt9XG5cbiAgICBvbkxvZ291dCgpIHt9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBBdXRoU2VydmljZSgpO1xuIiwiaW1wb3J0IGF1dGhTZXJ2aWNlIGZyb20gJy4uLy4uL3NlcnZpY2VzL2F1dGgnO1xuXG5jbGFzcyBMb2dpbiB7XG4gICAgY29uc3RydWN0b3IoJGVsKSB7XG4gICAgICAgIHRoaXMuJGVsID0gJGVsO1xuXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBgPGZvcm0gYWN0aW9uPVwiI1wiPlxuICAgICAgICA8ZGl2PjxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJlbWFpbFwiLz48L2Rpdj5cbiAgICAgICAgPGRpdj48aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgbmFtZT1cInBhc3N3b3JkXCIvPjwvZGl2PlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG5fbWFpblwiPkxvZyBpbjwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwianMtc2lnbnVwXCI+U2lnbiB1cDwvYnV0dG9uPmA7XG5cbiAgICAgICAgdGhpcy5pbml0RXZlbnRzKCk7XG4gICAgfVxuXG4gICAgaW5pdEV2ZW50cygpIHtcbiAgICAgICAgdGhpcy4kZm9ybSA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0nKTtcbiAgICAgICAgdGhpcy4kZW1haWwgPSB0aGlzLiRmb3JtLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJlbWFpbFwiXScpO1xuICAgICAgICB0aGlzLiRwYXNzd29yZCA9IHRoaXMuJGZvcm0ucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInBhc3N3b3JkXCJdJyk7XG4gICAgICAgIHRoaXMuJHNpZ251cCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zaWdudXAnKTtcblxuICAgICAgICB0aGlzLiRmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIHRoaXMub25TdWJtaXQuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuJHNpZ251cC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25TaWdudXAuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgb25TdWJtaXQoZXZlbnQpIHtcbiAgICAgICAgbGV0IGVtYWlsID0gdGhpcy4kZW1haWwudmFsdWU7XG4gICAgICAgIGxldCBwYXNzd29yZCA9IHRoaXMuJHBhc3N3b3JkLnZhbHVlO1xuXG4gICAgICAgIGF1dGhTZXJ2aWNlLmxvZ2luKGVtYWlsLCBwYXNzd29yZClcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBhbGVydChgZmFpbGVkIHRvIHNpZ24gdXA6ICR7ZXJyb3IuY29kZX06JHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG5cbiAgICBvblNpZ251cChldmVudCkge1xuICAgICAgICBsZXQgZW1haWwgPSB0aGlzLiRlbWFpbC52YWx1ZTtcbiAgICAgICAgbGV0IHBhc3N3b3JkID0gdGhpcy4kcGFzc3dvcmQudmFsdWU7XG5cbiAgICAgICAgYXV0aFNlcnZpY2Uuc2lnbnVwKGVtYWlsLCBwYXNzd29yZClcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBhbGVydChgZmFpbGVkIHRvIHNpZ24gdXA6ICR7ZXJyb3IuY29kZX06JHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IExvZ2luO1xuIiwiaW1wb3J0IEJhc2UgZnJvbSAnLi4vYmFzZS9iYXNlJztcbmltcG9ydCBMb2dpbiBmcm9tICcuLi8uLi9jb21wb25lbnRzL2xvZ2luL2xvZ2luJztcblxuY2xhc3MgQXV0aCBleHRlbmRzIEJhc2Uge1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgLy8gY2xlYXJcbiAgICAgICAgdGhpcy5sb2dpbiA9IG5ldyBMb2dpbih0aGlzLiRlbCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBBdXRoO1xuIiwiaW1wb3J0IGF1dGhTZXJ2aWNlIGZyb20gJy4uL3NlcnZpY2VzL2F1dGgnO1xuXG5jbGFzcyBSb3V0ZXIge1xuICAgIGNvbnN0cnVjdG9yKHZpZXdzKSB7XG4gICAgICAgIHRoaXMudmlld3MgPSB2aWV3cztcbiAgICAgICAgdGhpcy5jdXJyZW50VmlldyA9IG51bGw7XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7XG4gICAgICAgIGF1dGhTZXJ2aWNlLm9uTG9naW4gPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJvdXRlKCdjaGF0Jyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgYXV0aFNlcnZpY2Uub25Mb2dvdXQgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJvdXRlKCdhdXRoJyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IG5hbWUgPSBhdXRoU2VydmljZS5nZXRVc2VyKCkgPyAnY2hhdCcgOiAnYXV0aCc7XG5cbiAgICAgICAgdGhpcy5yb3V0ZShuYW1lKTtcbiAgICB9XG5cbiAgICByb3V0ZShuYW1lKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRWaWV3KSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3LiRlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jdXJyZW50VmlldyA9IHRoaXMudmlld3NbbmFtZV07XG4gICAgICAgIHRoaXMuY3VycmVudFZpZXcuJGVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUm91dGVyO1xuIiwiaW1wb3J0IENoYXQgZnJvbSAnLi92aWV3cy9jaGF0L2NoYXQnO1xuaW1wb3J0IEF1dGggZnJvbSAnLi92aWV3cy9hdXRoL2F1dGgnO1xuaW1wb3J0IFJvdXRlciBmcm9tICcuL3JvdXRlci9yb3V0ZXInO1xuXG5sZXQgJGxvYWRpbmcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtbG9hZGluZycpO1xubGV0ICRjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY29tcG9uZW50cycpO1xuXG4vLyBsb2FkIGRhdGFcbmxldCBkYXRhID0ge1xuICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIHVzZXI6ICdKb2huJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdIaSEnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICB1c2VyOiAnSmFuZScsXG4gICAgICAgICAgICBtZXNzYWdlOiAnSGVsbG8gdGhlcmUhJyxcbiAgICAgICAgfSxcbiAgICBdLFxufTtcblxuLy8gdmlld3NcbmxldCB2aWV3cyA9IHtcbiAgICBjaGF0OiBuZXcgQ2hhdChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSksXG4gICAgYXV0aDogbmV3IEF1dGgoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpLFxufTtcblxuT2JqZWN0LmtleXModmlld3MpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIHZpZXdzW2tleV0uJGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgJGNvbnRhaW5lci5hcHBlbmRDaGlsZCh2aWV3c1trZXldLiRlbCk7XG59KTtcblxudmlld3MuY2hhdC5zZXREYXRhKGRhdGEpO1xuXG4vLyByb3V0ZXJcbmxldCByb3V0ZXIgPSBuZXcgUm91dGVyKHZpZXdzKTtcblxucm91dGVyLnN0YXJ0KCk7XG5cbi8vIHJlYWR5XG4kbG9hZGluZy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuJGNvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gbnVsbDtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxNQUFNLElBQUksQ0FBQztJQUNQLFdBQVcsQ0FBQyxHQUFHLEVBQUU7UUFDYixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQzs7UUFFZixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDakI7O0lBRUQsTUFBTSxHQUFHLEVBQUU7Q0FDZDs7QUNSRCxNQUFNLFFBQVEsQ0FBQztJQUNYLFdBQVcsQ0FBQyxHQUFHLEVBQUU7UUFDYixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLHNCQUFzQixDQUFDO1FBQzVDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0tBQ2xCOztJQUVELE9BQU8sQ0FBQyxJQUFJLEVBQUU7UUFDVixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQzs7UUFFakIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ2pCOztJQUVELFVBQVUsQ0FBQyxPQUFPLEVBQUU7UUFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztTQUMzQjs7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ2pCOztJQUVELE1BQU0sR0FBRztRQUNMLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDcEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRO2lCQUN4QixH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
