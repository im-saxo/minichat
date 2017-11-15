import Base from '../base/base';
import Messages from '../../components/messages/messages';
import Form from '../../components/form/form';

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
        this.compose.on('send', (message) => {
            this.messages.addMessage(message);
        });
    }
}

export default Chat;
