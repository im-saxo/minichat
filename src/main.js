import Chat from './views/chat/chat';
import Auth from './views/auth/auth';
import Router from './router/router';

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
