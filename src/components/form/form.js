import Emitter from 'event-emitter-es6';

class Form extends Emitter {
    constructor($el) {
        super();

        this.$el = $el;

        this.render();
    }

    render() {
        this.$el.innerHTML = `<form class="pure-form js-form" action="#">
        <input type="text" class="compose-input js-input" name="message" autocomplete="off"/>
        <button type="submit" class="pure-button pure-button-primary">Send</button>
        </form>`;

        this.initEvents();
    }

    initEvents() {
        this.$form = this.$el.querySelector('.js-form');
        this.$input = this.$form.querySelector('.js-input');

        this.$form.addEventListener('submit', this.onSubmit.bind(this));
    }

    onSubmit(event) {
        let message = this.$input.value.trim();

        if (message) {
            this.emit('send', { message });
            this.$input.value = '';
        }

        event.preventDefault();
    }
}

export default Form;
