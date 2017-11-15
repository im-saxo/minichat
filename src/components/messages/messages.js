class Messages {
    constructor($el) {
        this.$el = $el;
        this.data = [];
    }

    setData(data) {
        this.data = data;

        this.render();
    }

    addMessage(message) {
        if (!this.data) {
            this.data = [];
        }

        if (!message.time && message.timestamp) {
            message.time = new Date(message.timestamp);
        }

        this.data.push(message);
        this.render();
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
        <strong>${name}</strong>:&nbsp;${message}
        </div>`;
    }
}

export default Messages;
