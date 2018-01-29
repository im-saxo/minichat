import Chat from './views/chat/chat';
import Auth from './views/auth/auth';
import Router from './router/router';

import '../node_modules/purecss/build/pure-min.css';

let $loading = document.querySelector('.js-loading');
let $container = document.querySelector('.js-components');

// views
let views = {
    chat: new Chat(document.createElement('div')),
    auth: new Auth(document.createElement('div')),
};

Object.keys(views).forEach((key) => {
    views[key].$el.style.display = 'none';
    $container.appendChild(views[key].$el);
});

// router
let router = new Router(views);

router.start();

// ready
$loading.style.display = 'none';
$container.style.display = null;
