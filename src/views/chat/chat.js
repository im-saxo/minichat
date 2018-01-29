import Base from '../base/base';
import Messages from '../../components/messages/messages';
import Form from '../../components/form/form';
import Menu from '../../components/menu/menu';
import messagesService from '../../services/messages';

class Chat extends Base {
    constructor($el) {
        super($el);

        messagesService.on('message', this.onMessage.bind(this));
    }

    render() {
        // clear
        this.$el.innerHTML = '';

        // menu
        let $menu = this.addContainer();

        this.menu = new Menu($menu);

        // messages
        let $messages = this.addContainer('messages');

        this.messages = new Messages($messages);

        // compose
        let $form = this.addContainer();

        this.compose = new Form($form);
        this.compose.on('send', this.onSend.bind(this));
    }

    addContainer(classes) {
        let $element = document.createElement('div');

        if (classes) {
            $element.className = classes;
        }

        this.$el.appendChild($element);

        return $element;
    }

    onSend(message) {
        messagesService.addMessage(message);
    }

    onMessage(message) {
        this.messages.addMessage(message);
    }
}

export default Chat;
