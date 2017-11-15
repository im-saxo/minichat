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
                .map(item => this.tmplMessage(item))
                .join('\n');

            this.$el.innerHTML = html;
        } else {
            this.$el.innerHTML = 'no messages';
        }
    }

    tmplMessage({ user, message }) {
        return `<div class="message"><strong>${user}</strong>: ${message}</div>`;
    }
}

export default Messages;
