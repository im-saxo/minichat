import Messages from './components/messages/messages';

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

let $messages = document.createElement('div');
$messages.className = 'messages';
$container.appendChild($messages);

let messages = new Messages($messages);
messages.setData(data);

// ready
$loading.style.display = 'none';
$container.style.display = null;

