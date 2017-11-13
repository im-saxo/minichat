class Messages {
    constructor($el) {
        this.$el = $el;
        this.$el.innerHTML = '<b>messages here</b>';
    }

    setData(data) {
        this.data = data;

        this.render();
    }

    render() {
        if (this.data && this.data.messages) {
            let html = this.data.messages
                .map(item => this.tmplMessage(item.message))
                .join('\n');

            this.$el.innerHTML = html;
        } else {
            this.$el.innerHTML = 'no messages';
        }
    }

    tmplMessage(message) {
        return `<div class="message">${message}</div>`;
    }
}

export default Messages;
