import escapeHtml from 'escape-html';

class Messages {
    constructor($el) {
        this.$el = $el;
        this.data = [];
    }

    setData(data) {
        this.data = data;

        this.render();
    }

    hasMessage(data, message) {
        return data
            .filter(item => message.uid && item.uid === message.uid)
            .length;
    }

    getMessage(data, message) {
        return data
            .filter(item => message.uid && item.uid === message.uid)[0];
    }

    addMessage(message) {
        if (!this.data) {
            this.data = [];
        }

        if (this.hasMessage(this.data, message)) {
            const existingMessage = this.getMessage(this.data, message);

            // TODO: if(!deepEqual)
            // Update existing message
            Object.extend(existingMessage, message);
            this.render();
        } else {
            if (!message.time && message.timestamp) {
                Object.assign(message, { time: new Date(message.timestamp) });
            }

            this.data.push(message);
            this.render();
        }
    }

    render() {
        if (this.data) {
            let html = this.data
                .map(item => this.tmplMessage(item))
                .join('\n');

            this.$el.innerHTML = html;
        } else {
            this.$el.innerHTML = 'no messages';
        }
    }

    tmplMessage({ name, message }) {
        return `<div class="message">
        <strong>${escapeHtml(name)}</strong>:&nbsp;${escapeHtml(message)}
        </div>`;
    }
}

export default Messages;
