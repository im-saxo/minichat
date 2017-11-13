import Messages from './components/messages/messages';
import Form from './components/form/form';

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

// messages
let $messages = document.createElement('div');
$messages.className = 'messages';
$container.appendChild($messages);

let messages = new Messages($messages);
messages.setData(data);

// compose
let $form = document.createElement('div');
$container.appendChild($form);

let compose = new Form($form);
compose.onSend = (message) => {
    messages.addMessage(message);
};

// ready
$loading.style.display = 'none';
$container.style.display = null;
