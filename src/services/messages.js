import Emitter from 'event-emitter-es6';
import * as firebase from 'firebase';
import authService from '../services/auth';

class MessagesService extends Emitter {
    constructor() {
        super();

        this.database = firebase.database();
        this.messagesRef = this.database.ref('messages');
        this.messagesRef.off();

        this.messagesRef.limitToLast(100).on('child_added', this.onMessage.bind(this));
        this.messagesRef.limitToLast(100).on('child_changed', this.onMessage.bind(this));
    }

    addMessage({ message }) {
        let user = authService.getUser();

        if (user) { 
            let data = {
                name: user.displayName || user.email,
                message,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };
            
            this.messagesRef.push(data)
                .then(() => {})
                .catch((error) => {
                    console.log('push error', error);
                });
        }   
    }

    onMessage(data) {
        this.emit('message', data.val());
    }
}

export default new MessagesService();