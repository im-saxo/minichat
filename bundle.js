(function (firebase) {
'use strict';

class Base {
    constructor($el) {
        this.$el = $el;

        this.render();
    }

    render() {}
}

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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_VALUES = {
    emitDelay: 10,
    strictMode: false
};

/**
 * @typedef {object} EventEmitterListenerFunc
 * @property {boolean} once
 * @property {function} fn
 */

/**
 * @class EventEmitter
 *
 * @private
 * @property {Object.<string, EventEmitterListenerFunc[]>} _listeners
 * @property {string[]} events
 */

var EventEmitter = function () {

    /**
     * @constructor
     * @param {{}}      [opts]
     * @param {number}  [opts.emitDelay = 10] - Number in ms. Specifies whether emit will be sync or async. By default - 10ms. If 0 - fires sync
     * @param {boolean} [opts.strictMode = false] - is true, Emitter throws error on emit error with no listeners
     */

    function EventEmitter() {
        var opts = arguments.length <= 0 || arguments[0] === undefined ? DEFAULT_VALUES : arguments[0];

        _classCallCheck(this, EventEmitter);

        var emitDelay = void 0,
            strictMode = void 0;

        if (opts.hasOwnProperty('emitDelay')) {
            emitDelay = opts.emitDelay;
        } else {
            emitDelay = DEFAULT_VALUES.emitDelay;
        }
        this._emitDelay = emitDelay;

        if (opts.hasOwnProperty('strictMode')) {
            strictMode = opts.strictMode;
        } else {
            strictMode = DEFAULT_VALUES.strictMode;
        }
        this._strictMode = strictMode;

        this._listeners = {};
        this.events = [];
    }

    /**
     * @protected
     * @param {string} type
     * @param {function} listener
     * @param {boolean} [once = false]
     */


    _createClass(EventEmitter, [{
        key: '_addListenner',
        value: function _addListenner(type, listener, once) {
            if (typeof listener !== 'function') {
                throw TypeError('listener must be a function');
            }

            if (this.events.indexOf(type) === -1) {
                this._listeners[type] = [{
                    once: once,
                    fn: listener
                }];
                this.events.push(type);
            } else {
                this._listeners[type].push({
                    once: once,
                    fn: listener
                });
            }
        }

        /**
         * Subscribes on event type specified function
         * @param {string} type
         * @param {function} listener
         */

    }, {
        key: 'on',
        value: function on(type, listener) {
            this._addListenner(type, listener, false);
        }

        /**
         * Subscribes on event type specified function to fire only once
         * @param {string} type
         * @param {function} listener
         */

    }, {
        key: 'once',
        value: function once(type, listener) {
            this._addListenner(type, listener, true);
        }

        /**
         * Removes event with specified type. If specified listenerFunc - deletes only one listener of specified type
         * @param {string} eventType
         * @param {function} [listenerFunc]
         */

    }, {
        key: 'off',
        value: function off(eventType, listenerFunc) {
            var _this = this;

            var typeIndex = this.events.indexOf(eventType);
            var hasType = eventType && typeIndex !== -1;

            if (hasType) {
                if (!listenerFunc) {
                    delete this._listeners[eventType];
                    this.events.splice(typeIndex, 1);
                } else {
                    (function () {
                        var removedEvents = [];
                        var typeListeners = _this._listeners[eventType];

                        typeListeners.forEach(
                        /**
                         * @param {EventEmitterListenerFunc} fn
                         * @param {number} idx
                         */
                        function (fn, idx) {
                            if (fn.fn === listenerFunc) {
                                removedEvents.unshift(idx);
                            }
                        });

                        removedEvents.forEach(function (idx) {
                            typeListeners.splice(idx, 1);
                        });

                        if (!typeListeners.length) {
                            _this.events.splice(typeIndex, 1);
                            delete _this._listeners[eventType];
                        }
                    })();
                }
            }
        }

        /**
         * Applies arguments to specified event type
         * @param {string} eventType
         * @param {*[]} eventArguments
         * @protected
         */

    }, {
        key: '_applyEvents',
        value: function _applyEvents(eventType, eventArguments) {
            var typeListeners = this._listeners[eventType];

            if (!typeListeners || !typeListeners.length) {
                if (this._strictMode) {
                    throw 'No listeners specified for event: ' + eventType;
                } else {
                    return;
                }
            }

            var removableListeners = [];
            typeListeners.forEach(function (eeListener, idx) {
                eeListener.fn.apply(null, eventArguments);
                if (eeListener.once) {
                    removableListeners.unshift(idx);
                }
            });

            removableListeners.forEach(function (idx) {
                typeListeners.splice(idx, 1);
            });
        }

        /**
         * Emits event with specified type and params.
         * @param {string} type
         * @param eventArgs
         */

    }, {
        key: 'emit',
        value: function emit(type) {
            var _this2 = this;

            for (var _len = arguments.length, eventArgs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                eventArgs[_key - 1] = arguments[_key];
            }

            if (this._emitDelay) {
                setTimeout(function () {
                    _this2._applyEvents.call(_this2, type, eventArgs);
                }, this._emitDelay);
            } else {
                this._applyEvents(type, eventArgs);
            }
        }

        /**
         * Emits event with specified type and params synchronously.
         * @param {string} type
         * @param eventArgs
         */

    }, {
        key: 'emitSync',
        value: function emitSync(type) {
            for (var _len2 = arguments.length, eventArgs = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                eventArgs[_key2 - 1] = arguments[_key2];
            }

            this._applyEvents(type, eventArgs);
        }

        /**
         * Destroys EventEmitter
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            this._listeners = {};
            this.events = [];
        }
    }]);

    return EventEmitter;
}();

var eventEmitterEs6 = EventEmitter;

class Form extends eventEmitterEs6 {
    constructor($el) {
        super();

        this.$el = $el;

        this.render();
    }

    render() {
        this.$el.innerHTML = `<form class="compose js-form" action="#">
        <input type="text" class="compose-input js-input" name="message" autocomplete="off"/>
        <button type="submit" class="btn">Send</button>
        </form>`;

        this.initEvents();
    }

    initEvents() {
        this.$form = this.$el.querySelector('.js-form');
        this.$input = this.$form.querySelector('.js-input');

        this.$form.addEventListener('submit', this.onSubmit.bind(this));
    }

    onSubmit(event) {
        this.emit('send', { user: 'Default', message: this.$input.value });
        this.$input.value = '';

        event.preventDefault();
    }
}

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

// TODO: bundle
const config = {
    apiKey: 'AIzaSyBN_wp6DtdSPShUqCb2yKceAromQVoEaFQ',
    authDomain: 'minichat-958fd.firebaseapp.com',
    databaseURL: 'https://minichat-958fd.firebaseio.com',
    projectId: 'minichat-958fd',
    storageBucket: 'minichat-958fd.appspot.com',
    messagingSenderId: '379678203803',
};

/**
 * Singleton auth service
 */
class AuthService extends eventEmitterEs6 {
    constructor() {
        super();

        this.app = firebase.initializeApp(config);
        this.auth = firebase.auth();

        this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
    }

    getUser() {
        return this.auth.currentUser;
    }

    login(email, password) {
        return this.auth.signInWithEmailAndPassword(email, password);
    }

    signup(email, password) {
        return this.auth.createUserWithEmailAndPassword(email, password);
    }

    onAuthStateChanged(user) {
        if (user) {
            this.emit('login', user);
        } else {
            this.emit('logout');
        }
    }
}

var authService = new AuthService();

class Login {
    constructor($el) {
        this.$el = $el;

        this.render();
    }

    render() {
        this.$el.innerHTML = `<form action="#">
        <div><input type="text" name="email"/></div>
        <div><input type="password" name="password"/></div>
        <button type="submit" class="btn btn_main">Log in</button>
        <button class="js-signup">Sign up</button>`;

        this.initEvents();
    }

    initEvents() {
        this.$form = this.$el.querySelector('form');
        this.$email = this.$form.querySelector('input[name="email"]');
        this.$password = this.$form.querySelector('input[name="password"]');
        this.$signup = this.$el.querySelector('.js-signup');

        this.$form.addEventListener('submit', this.onSubmit.bind(this));
        this.$signup.addEventListener('click', this.onSignup.bind(this));
    }

    onSubmit(event) {
        let email = this.$email.value;
        let password = this.$password.value;

        authService.login(email, password)
            .catch((error) => {
                alert(`failed to sign up: ${error.code}:${error.message}`);
            });

        event.preventDefault();
    }

    onSignup(event) {
        let email = this.$email.value;
        let password = this.$password.value;

        authService.signup(email, password)
            .catch((error) => {
                alert(`failed to sign up: ${error.code}:${error.message}`);
            });

        event.preventDefault();
    }
}

class Auth extends Base {
    render() {
        // clear
        this.login = new Login(this.$el);
    }
}

class Router {
    constructor(views) {
        this.views = views;
        this.currentView = null;
    }

    start() {
        authService.on('login', () => {
            this.route('chat');
        });

        authService.on('logout', () => {
            this.route('auth');
        });

        let name = authService.getUser() ? 'chat' : 'auth';

        this.route(name);
    }

    route(name) {
        if (this.currentView) {
            this.currentView.$el.style.display = 'none';
        }

        this.currentView = this.views[name];
        this.currentView.$el.style.display = 'block';
    }
}

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

// views
let views = {
    chat: new Chat(document.createElement('div')),
    auth: new Auth(document.createElement('div')),
};

Object.keys(views).forEach((key) => {
    views[key].$el.style.display = 'none';
    $container.appendChild(views[key].$el);
});

views.chat.setData(data);

// router
let router = new Router(views);

router.start();

// ready
$loading.style.display = 'none';
$container.style.display = null;

}(firebase));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJzcmMvdmlld3MvYmFzZS9iYXNlLmpzIiwic3JjL2NvbXBvbmVudHMvbWVzc2FnZXMvbWVzc2FnZXMuanMiLCJub2RlX21vZHVsZXMvZXZlbnQtZW1pdHRlci1lczYvaW5kZXguanMiLCJzcmMvY29tcG9uZW50cy9mb3JtL2Zvcm0uanMiLCJzcmMvdmlld3MvY2hhdC9jaGF0LmpzIiwic3JjL3NlcnZpY2VzL2F1dGguanMiLCJzcmMvY29tcG9uZW50cy9sb2dpbi9sb2dpbi5qcyIsInNyYy92aWV3cy9hdXRoL2F1dGguanMiLCJzcmMvcm91dGVyL3JvdXRlci5qcyIsInNyYy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEJhc2Uge1xuICAgIGNvbnN0cnVjdG9yKCRlbCkge1xuICAgICAgICB0aGlzLiRlbCA9ICRlbDtcblxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHt9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2U7XG4iLCJjbGFzcyBNZXNzYWdlcyB7XG4gICAgY29uc3RydWN0b3IoJGVsKSB7XG4gICAgICAgIHRoaXMuJGVsID0gJGVsO1xuICAgICAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSAnPGI+bWVzc2FnZXMgaGVyZTwvYj4nO1xuICAgICAgICB0aGlzLmRhdGEgPSB7fTtcbiAgICB9XG5cbiAgICBzZXREYXRhKGRhdGEpIHtcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcblxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIGFkZE1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgICBpZiAoIXRoaXMuZGF0YS5tZXNzYWdlcykge1xuICAgICAgICAgICAgdGhpcy5kYXRhLm1lc3NhZ2VzID0gW107XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRhdGEubWVzc2FnZXMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGEubWVzc2FnZXMpIHtcbiAgICAgICAgICAgIGxldCBodG1sID0gdGhpcy5kYXRhLm1lc3NhZ2VzXG4gICAgICAgICAgICAgICAgLm1hcChpdGVtID0+IHRoaXMudG1wbE1lc3NhZ2UoaXRlbSkpXG4gICAgICAgICAgICAgICAgLmpvaW4oJ1xcbicpO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy4kZWwuaW5uZXJIVE1MID0gJ25vIG1lc3NhZ2VzJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRtcGxNZXNzYWdlKHsgdXNlciwgbWVzc2FnZSB9KSB7XG4gICAgICAgIHJldHVybiBgPGRpdiBjbGFzcz1cIm1lc3NhZ2VcIj48c3Ryb25nPiR7dXNlcn08L3N0cm9uZz46ICR7bWVzc2FnZX08L2Rpdj5gO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVzc2FnZXM7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBERUZBVUxUX1ZBTFVFUyA9IHtcbiAgICBlbWl0RGVsYXk6IDEwLFxuICAgIHN0cmljdE1vZGU6IGZhbHNlXG59O1xuXG4vKipcbiAqIEB0eXBlZGVmIHtvYmplY3R9IEV2ZW50RW1pdHRlckxpc3RlbmVyRnVuY1xuICogQHByb3BlcnR5IHtib29sZWFufSBvbmNlXG4gKiBAcHJvcGVydHkge2Z1bmN0aW9ufSBmblxuICovXG5cbi8qKlxuICogQGNsYXNzIEV2ZW50RW1pdHRlclxuICpcbiAqIEBwcml2YXRlXG4gKiBAcHJvcGVydHkge09iamVjdC48c3RyaW5nLCBFdmVudEVtaXR0ZXJMaXN0ZW5lckZ1bmNbXT59IF9saXN0ZW5lcnNcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nW119IGV2ZW50c1xuICovXG5cbnZhciBFdmVudEVtaXR0ZXIgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge3t9fSAgICAgIFtvcHRzXVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSAgW29wdHMuZW1pdERlbGF5ID0gMTBdIC0gTnVtYmVyIGluIG1zLiBTcGVjaWZpZXMgd2hldGhlciBlbWl0IHdpbGwgYmUgc3luYyBvciBhc3luYy4gQnkgZGVmYXVsdCAtIDEwbXMuIElmIDAgLSBmaXJlcyBzeW5jXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0cy5zdHJpY3RNb2RlID0gZmFsc2VdIC0gaXMgdHJ1ZSwgRW1pdHRlciB0aHJvd3MgZXJyb3Igb24gZW1pdCBlcnJvciB3aXRoIG5vIGxpc3RlbmVyc1xuICAgICAqL1xuXG4gICAgZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICAgICAgICB2YXIgb3B0cyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IERFRkFVTFRfVkFMVUVTIDogYXJndW1lbnRzWzBdO1xuXG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBFdmVudEVtaXR0ZXIpO1xuXG4gICAgICAgIHZhciBlbWl0RGVsYXkgPSB2b2lkIDAsXG4gICAgICAgICAgICBzdHJpY3RNb2RlID0gdm9pZCAwO1xuXG4gICAgICAgIGlmIChvcHRzLmhhc093blByb3BlcnR5KCdlbWl0RGVsYXknKSkge1xuICAgICAgICAgICAgZW1pdERlbGF5ID0gb3B0cy5lbWl0RGVsYXk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbWl0RGVsYXkgPSBERUZBVUxUX1ZBTFVFUy5lbWl0RGVsYXk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZW1pdERlbGF5ID0gZW1pdERlbGF5O1xuXG4gICAgICAgIGlmIChvcHRzLmhhc093blByb3BlcnR5KCdzdHJpY3RNb2RlJykpIHtcbiAgICAgICAgICAgIHN0cmljdE1vZGUgPSBvcHRzLnN0cmljdE1vZGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHJpY3RNb2RlID0gREVGQVVMVF9WQUxVRVMuc3RyaWN0TW9kZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zdHJpY3RNb2RlID0gc3RyaWN0TW9kZTtcblxuICAgICAgICB0aGlzLl9saXN0ZW5lcnMgPSB7fTtcbiAgICAgICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBsaXN0ZW5lclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29uY2UgPSBmYWxzZV1cbiAgICAgKi9cblxuXG4gICAgX2NyZWF0ZUNsYXNzKEV2ZW50RW1pdHRlciwgW3tcbiAgICAgICAga2V5OiAnX2FkZExpc3Rlbm5lcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBfYWRkTGlzdGVubmVyKHR5cGUsIGxpc3RlbmVyLCBvbmNlKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuZXZlbnRzLmluZGV4T2YodHlwZSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzW3R5cGVdID0gW3tcbiAgICAgICAgICAgICAgICAgICAgb25jZTogb25jZSxcbiAgICAgICAgICAgICAgICAgICAgZm46IGxpc3RlbmVyXG4gICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudHMucHVzaCh0eXBlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzW3R5cGVdLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBvbmNlOiBvbmNlLFxuICAgICAgICAgICAgICAgICAgICBmbjogbGlzdGVuZXJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdWJzY3JpYmVzIG9uIGV2ZW50IHR5cGUgc3BlY2lmaWVkIGZ1bmN0aW9uXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyXG4gICAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvbih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgICAgICAgdGhpcy5fYWRkTGlzdGVubmVyKHR5cGUsIGxpc3RlbmVyLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogU3Vic2NyaWJlcyBvbiBldmVudCB0eXBlIHNwZWNpZmllZCBmdW5jdGlvbiB0byBmaXJlIG9ubHkgb25jZVxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBsaXN0ZW5lclxuICAgICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb25jZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvbmNlKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9hZGRMaXN0ZW5uZXIodHlwZSwgbGlzdGVuZXIsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlbW92ZXMgZXZlbnQgd2l0aCBzcGVjaWZpZWQgdHlwZS4gSWYgc3BlY2lmaWVkIGxpc3RlbmVyRnVuYyAtIGRlbGV0ZXMgb25seSBvbmUgbGlzdGVuZXIgb2Ygc3BlY2lmaWVkIHR5cGVcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZVxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBbbGlzdGVuZXJGdW5jXVxuICAgICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb2ZmJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9mZihldmVudFR5cGUsIGxpc3RlbmVyRnVuYykge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIHR5cGVJbmRleCA9IHRoaXMuZXZlbnRzLmluZGV4T2YoZXZlbnRUeXBlKTtcbiAgICAgICAgICAgIHZhciBoYXNUeXBlID0gZXZlbnRUeXBlICYmIHR5cGVJbmRleCAhPT0gLTE7XG5cbiAgICAgICAgICAgIGlmIChoYXNUeXBlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFsaXN0ZW5lckZ1bmMpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2xpc3RlbmVyc1tldmVudFR5cGVdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmV2ZW50cy5zcGxpY2UodHlwZUluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlbW92ZWRFdmVudHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0eXBlTGlzdGVuZXJzID0gX3RoaXMuX2xpc3RlbmVyc1tldmVudFR5cGVdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlTGlzdGVuZXJzLmZvckVhY2goXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7RXZlbnRFbWl0dGVyTGlzdGVuZXJGdW5jfSBmblxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IGlkeFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZm4sIGlkeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmbi5mbiA9PT0gbGlzdGVuZXJGdW5jKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZWRFdmVudHMudW5zaGlmdChpZHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVkRXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGlkeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVMaXN0ZW5lcnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0eXBlTGlzdGVuZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmV2ZW50cy5zcGxpY2UodHlwZUluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgX3RoaXMuX2xpc3RlbmVyc1tldmVudFR5cGVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBcHBsaWVzIGFyZ3VtZW50cyB0byBzcGVjaWZpZWQgZXZlbnQgdHlwZVxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlXG4gICAgICAgICAqIEBwYXJhbSB7KltdfSBldmVudEFyZ3VtZW50c1xuICAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdfYXBwbHlFdmVudHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gX2FwcGx5RXZlbnRzKGV2ZW50VHlwZSwgZXZlbnRBcmd1bWVudHMpIHtcbiAgICAgICAgICAgIHZhciB0eXBlTGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzW2V2ZW50VHlwZV07XG5cbiAgICAgICAgICAgIGlmICghdHlwZUxpc3RlbmVycyB8fCAhdHlwZUxpc3RlbmVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fc3RyaWN0TW9kZSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyAnTm8gbGlzdGVuZXJzIHNwZWNpZmllZCBmb3IgZXZlbnQ6ICcgKyBldmVudFR5cGU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHJlbW92YWJsZUxpc3RlbmVycyA9IFtdO1xuICAgICAgICAgICAgdHlwZUxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChlZUxpc3RlbmVyLCBpZHgpIHtcbiAgICAgICAgICAgICAgICBlZUxpc3RlbmVyLmZuLmFwcGx5KG51bGwsIGV2ZW50QXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICBpZiAoZWVMaXN0ZW5lci5vbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92YWJsZUxpc3RlbmVycy51bnNoaWZ0KGlkeCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJlbW92YWJsZUxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChpZHgpIHtcbiAgICAgICAgICAgICAgICB0eXBlTGlzdGVuZXJzLnNwbGljZShpZHgsIDEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogRW1pdHMgZXZlbnQgd2l0aCBzcGVjaWZpZWQgdHlwZSBhbmQgcGFyYW1zLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgICAgICAgKiBAcGFyYW0gZXZlbnRBcmdzXG4gICAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdlbWl0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGVtaXQodHlwZSkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBldmVudEFyZ3MgPSBBcnJheShfbGVuID4gMSA/IF9sZW4gLSAxIDogMCksIF9rZXkgPSAxOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgICAgICAgICAgZXZlbnRBcmdzW19rZXkgLSAxXSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuX2VtaXREZWxheSkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIuX2FwcGx5RXZlbnRzLmNhbGwoX3RoaXMyLCB0eXBlLCBldmVudEFyZ3MpO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMuX2VtaXREZWxheSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FwcGx5RXZlbnRzKHR5cGUsIGV2ZW50QXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogRW1pdHMgZXZlbnQgd2l0aCBzcGVjaWZpZWQgdHlwZSBhbmQgcGFyYW1zIHN5bmNocm9ub3VzbHkuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAgICAgICAqIEBwYXJhbSBldmVudEFyZ3NcbiAgICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2VtaXRTeW5jJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGVtaXRTeW5jKHR5cGUpIHtcbiAgICAgICAgICAgIGZvciAodmFyIF9sZW4yID0gYXJndW1lbnRzLmxlbmd0aCwgZXZlbnRBcmdzID0gQXJyYXkoX2xlbjIgPiAxID8gX2xlbjIgLSAxIDogMCksIF9rZXkyID0gMTsgX2tleTIgPCBfbGVuMjsgX2tleTIrKykge1xuICAgICAgICAgICAgICAgIGV2ZW50QXJnc1tfa2V5MiAtIDFdID0gYXJndW1lbnRzW19rZXkyXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fYXBwbHlFdmVudHModHlwZSwgZXZlbnRBcmdzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZXN0cm95cyBFdmVudEVtaXR0ZXJcbiAgICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Rlc3Ryb3knLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xuICAgICAgICAgICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBFdmVudEVtaXR0ZXI7XG59KCk7XG5cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuIiwiaW1wb3J0IEVtaXR0ZXIgZnJvbSAnZXZlbnQtZW1pdHRlci1lczYnO1xuXG5jbGFzcyBGb3JtIGV4dGVuZHMgRW1pdHRlciB7XG4gICAgY29uc3RydWN0b3IoJGVsKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy4kZWwgPSAkZWw7XG5cbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHRoaXMuJGVsLmlubmVySFRNTCA9IGA8Zm9ybSBjbGFzcz1cImNvbXBvc2UganMtZm9ybVwiIGFjdGlvbj1cIiNcIj5cbiAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJjb21wb3NlLWlucHV0IGpzLWlucHV0XCIgbmFtZT1cIm1lc3NhZ2VcIiBhdXRvY29tcGxldGU9XCJvZmZcIi8+XG4gICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuXCI+U2VuZDwvYnV0dG9uPlxuICAgICAgICA8L2Zvcm0+YDtcblxuICAgICAgICB0aGlzLmluaXRFdmVudHMoKTtcbiAgICB9XG5cbiAgICBpbml0RXZlbnRzKCkge1xuICAgICAgICB0aGlzLiRmb3JtID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmpzLWZvcm0nKTtcbiAgICAgICAgdGhpcy4kaW5wdXQgPSB0aGlzLiRmb3JtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1pbnB1dCcpO1xuXG4gICAgICAgIHRoaXMuJGZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgdGhpcy5vblN1Ym1pdC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBvblN1Ym1pdChldmVudCkge1xuICAgICAgICB0aGlzLmVtaXQoJ3NlbmQnLCB7IHVzZXI6ICdEZWZhdWx0JywgbWVzc2FnZTogdGhpcy4kaW5wdXQudmFsdWUgfSk7XG4gICAgICAgIHRoaXMuJGlucHV0LnZhbHVlID0gJyc7XG5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZvcm07XG4iLCJpbXBvcnQgQmFzZSBmcm9tICcuLi9iYXNlL2Jhc2UnO1xuaW1wb3J0IE1lc3NhZ2VzIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvbWVzc2FnZXMvbWVzc2FnZXMnO1xuaW1wb3J0IEZvcm0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9mb3JtL2Zvcm0nO1xuXG5jbGFzcyBDaGF0IGV4dGVuZHMgQmFzZSB7XG4gICAgc2V0RGF0YShkYXRhKSB7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG5cbiAgICAgICAgdGhpcy5tZXNzYWdlcy5zZXREYXRhKGRhdGEpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgLy8gY2xlYXJcbiAgICAgICAgdGhpcy4kZWwuaW5uZXJIVE1MID0gJyc7XG5cbiAgICAgICAgLy8gbWVzc2FnZXNcbiAgICAgICAgbGV0ICRtZXNzYWdlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAkbWVzc2FnZXMuY2xhc3NOYW1lID0gJ21lc3NhZ2VzJztcbiAgICAgICAgdGhpcy4kZWwuYXBwZW5kQ2hpbGQoJG1lc3NhZ2VzKTtcblxuICAgICAgICB0aGlzLm1lc3NhZ2VzID0gbmV3IE1lc3NhZ2VzKCRtZXNzYWdlcyk7XG4gICAgICAgIHRoaXMubWVzc2FnZXMuc2V0RGF0YSh0aGlzLmRhdGEgfHwge30pO1xuXG4gICAgICAgIC8vIGNvbXBvc2VcbiAgICAgICAgbGV0ICRmb3JtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRoaXMuJGVsLmFwcGVuZENoaWxkKCRmb3JtKTtcblxuICAgICAgICB0aGlzLmNvbXBvc2UgPSBuZXcgRm9ybSgkZm9ybSk7XG4gICAgICAgIHRoaXMuY29tcG9zZS5vbignc2VuZCcsIChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2VzLmFkZE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2hhdDtcbiIsIi8vIFRPRE86IGJ1bmRsZVxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnZXZlbnQtZW1pdHRlci1lczYnO1xuaW1wb3J0ICogYXMgZmlyZWJhc2UgZnJvbSAnZmlyZWJhc2UnO1xuXG5jb25zdCBjb25maWcgPSB7XG4gICAgYXBpS2V5OiAnQUl6YVN5Qk5fd3A2RHRkU1BTaFVxQ2IyeUtjZUFyb21RVm9FYUZRJyxcbiAgICBhdXRoRG9tYWluOiAnbWluaWNoYXQtOTU4ZmQuZmlyZWJhc2VhcHAuY29tJyxcbiAgICBkYXRhYmFzZVVSTDogJ2h0dHBzOi8vbWluaWNoYXQtOTU4ZmQuZmlyZWJhc2Vpby5jb20nLFxuICAgIHByb2plY3RJZDogJ21pbmljaGF0LTk1OGZkJyxcbiAgICBzdG9yYWdlQnVja2V0OiAnbWluaWNoYXQtOTU4ZmQuYXBwc3BvdC5jb20nLFxuICAgIG1lc3NhZ2luZ1NlbmRlcklkOiAnMzc5Njc4MjAzODAzJyxcbn07XG5cbi8qKlxuICogU2luZ2xldG9uIGF1dGggc2VydmljZVxuICovXG5jbGFzcyBBdXRoU2VydmljZSBleHRlbmRzIEVtaXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuYXBwID0gZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xuICAgICAgICB0aGlzLmF1dGggPSBmaXJlYmFzZS5hdXRoKCk7XG5cbiAgICAgICAgdGhpcy5hdXRoLm9uQXV0aFN0YXRlQ2hhbmdlZCh0aGlzLm9uQXV0aFN0YXRlQ2hhbmdlZC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBnZXRVc2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdXRoLmN1cnJlbnRVc2VyO1xuICAgIH1cblxuICAgIGxvZ2luKGVtYWlsLCBwYXNzd29yZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdXRoLnNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkKGVtYWlsLCBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgc2lnbnVwKGVtYWlsLCBwYXNzd29yZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdXRoLmNyZWF0ZVVzZXJXaXRoRW1haWxBbmRQYXNzd29yZChlbWFpbCwgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIG9uQXV0aFN0YXRlQ2hhbmdlZCh1c2VyKSB7XG4gICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2xvZ2luJywgdXNlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2xvZ291dCcpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgQXV0aFNlcnZpY2UoKTtcbiIsImltcG9ydCBhdXRoU2VydmljZSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9hdXRoJztcblxuY2xhc3MgTG9naW4ge1xuICAgIGNvbnN0cnVjdG9yKCRlbCkge1xuICAgICAgICB0aGlzLiRlbCA9ICRlbDtcblxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdGhpcy4kZWwuaW5uZXJIVE1MID0gYDxmb3JtIGFjdGlvbj1cIiNcIj5cbiAgICAgICAgPGRpdj48aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwiZW1haWxcIi8+PC9kaXY+XG4gICAgICAgIDxkaXY+PGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIG5hbWU9XCJwYXNzd29yZFwiLz48L2Rpdj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gYnRuX21haW5cIj5Mb2cgaW48L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImpzLXNpZ251cFwiPlNpZ24gdXA8L2J1dHRvbj5gO1xuXG4gICAgICAgIHRoaXMuaW5pdEV2ZW50cygpO1xuICAgIH1cblxuICAgIGluaXRFdmVudHMoKSB7XG4gICAgICAgIHRoaXMuJGZvcm0gPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCdmb3JtJyk7XG4gICAgICAgIHRoaXMuJGVtYWlsID0gdGhpcy4kZm9ybS5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiZW1haWxcIl0nKTtcbiAgICAgICAgdGhpcy4kcGFzc3dvcmQgPSB0aGlzLiRmb3JtLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJwYXNzd29yZFwiXScpO1xuICAgICAgICB0aGlzLiRzaWdudXAgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcuanMtc2lnbnVwJyk7XG5cbiAgICAgICAgdGhpcy4kZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCB0aGlzLm9uU3VibWl0LmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLiRzaWdudXAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uU2lnbnVwLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIG9uU3VibWl0KGV2ZW50KSB7XG4gICAgICAgIGxldCBlbWFpbCA9IHRoaXMuJGVtYWlsLnZhbHVlO1xuICAgICAgICBsZXQgcGFzc3dvcmQgPSB0aGlzLiRwYXNzd29yZC52YWx1ZTtcblxuICAgICAgICBhdXRoU2VydmljZS5sb2dpbihlbWFpbCwgcGFzc3dvcmQpXG4gICAgICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgYWxlcnQoYGZhaWxlZCB0byBzaWduIHVwOiAke2Vycm9yLmNvZGV9OiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgb25TaWdudXAoZXZlbnQpIHtcbiAgICAgICAgbGV0IGVtYWlsID0gdGhpcy4kZW1haWwudmFsdWU7XG4gICAgICAgIGxldCBwYXNzd29yZCA9IHRoaXMuJHBhc3N3b3JkLnZhbHVlO1xuXG4gICAgICAgIGF1dGhTZXJ2aWNlLnNpZ251cChlbWFpbCwgcGFzc3dvcmQpXG4gICAgICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgYWxlcnQoYGZhaWxlZCB0byBzaWduIHVwOiAke2Vycm9yLmNvZGV9OiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMb2dpbjtcbiIsImltcG9ydCBCYXNlIGZyb20gJy4uL2Jhc2UvYmFzZSc7XG5pbXBvcnQgTG9naW4gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9sb2dpbi9sb2dpbic7XG5cbmNsYXNzIEF1dGggZXh0ZW5kcyBCYXNlIHtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIC8vIGNsZWFyXG4gICAgICAgIHRoaXMubG9naW4gPSBuZXcgTG9naW4odGhpcy4kZWwpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXV0aDtcbiIsImltcG9ydCBhdXRoU2VydmljZSBmcm9tICcuLi9zZXJ2aWNlcy9hdXRoJztcblxuY2xhc3MgUm91dGVyIHtcbiAgICBjb25zdHJ1Y3Rvcih2aWV3cykge1xuICAgICAgICB0aGlzLnZpZXdzID0gdmlld3M7XG4gICAgICAgIHRoaXMuY3VycmVudFZpZXcgPSBudWxsO1xuICAgIH1cblxuICAgIHN0YXJ0KCkge1xuICAgICAgICBhdXRoU2VydmljZS5vbignbG9naW4nLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJvdXRlKCdjaGF0Jyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGF1dGhTZXJ2aWNlLm9uKCdsb2dvdXQnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJvdXRlKCdhdXRoJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBuYW1lID0gYXV0aFNlcnZpY2UuZ2V0VXNlcigpID8gJ2NoYXQnIDogJ2F1dGgnO1xuXG4gICAgICAgIHRoaXMucm91dGUobmFtZSk7XG4gICAgfVxuXG4gICAgcm91dGUobmFtZSkge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50Vmlldykge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50Vmlldy4kZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY3VycmVudFZpZXcgPSB0aGlzLnZpZXdzW25hbWVdO1xuICAgICAgICB0aGlzLmN1cnJlbnRWaWV3LiRlbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJvdXRlcjtcbiIsImltcG9ydCBDaGF0IGZyb20gJy4vdmlld3MvY2hhdC9jaGF0JztcbmltcG9ydCBBdXRoIGZyb20gJy4vdmlld3MvYXV0aC9hdXRoJztcbmltcG9ydCBSb3V0ZXIgZnJvbSAnLi9yb3V0ZXIvcm91dGVyJztcblxubGV0ICRsb2FkaW5nID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWxvYWRpbmcnKTtcbmxldCAkY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNvbXBvbmVudHMnKTtcblxuLy8gbG9hZCBkYXRhXG5sZXQgZGF0YSA9IHtcbiAgICBtZXNzYWdlczogW1xuICAgICAgICB7XG4gICAgICAgICAgICB1c2VyOiAnSm9obicsXG4gICAgICAgICAgICBtZXNzYWdlOiAnSGkhJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgdXNlcjogJ0phbmUnLFxuICAgICAgICAgICAgbWVzc2FnZTogJ0hlbGxvIHRoZXJlIScsXG4gICAgICAgIH0sXG4gICAgXSxcbn07XG5cbi8vIHZpZXdzXG5sZXQgdmlld3MgPSB7XG4gICAgY2hhdDogbmV3IENoYXQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpLFxuICAgIGF1dGg6IG5ldyBBdXRoKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKSxcbn07XG5cbk9iamVjdC5rZXlzKHZpZXdzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICB2aWV3c1trZXldLiRlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICRjb250YWluZXIuYXBwZW5kQ2hpbGQodmlld3Nba2V5XS4kZWwpO1xufSk7XG5cbnZpZXdzLmNoYXQuc2V0RGF0YShkYXRhKTtcblxuLy8gcm91dGVyXG5sZXQgcm91dGVyID0gbmV3IFJvdXRlcih2aWV3cyk7XG5cbnJvdXRlci5zdGFydCgpO1xuXG4vLyByZWFkeVxuJGxvYWRpbmcuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiRjb250YWluZXIuc3R5bGUuZGlzcGxheSA9IG51bGw7XG4iXSwibmFtZXMiOlsiRW1pdHRlciIsImZpcmViYXNlLmluaXRpYWxpemVBcHAiLCJmaXJlYmFzZS5hdXRoIl0sIm1hcHBpbmdzIjoiOzs7QUFBQSxNQUFNLElBQUksQ0FBQztJQUNQLFdBQVcsQ0FBQyxHQUFHLEVBQUU7UUFDYixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQzs7UUFFZixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDakI7O0lBRUQsTUFBTSxHQUFHLEVBQUU7Q0FDZDs7QUNSRCxNQUFNLFFBQVEsQ0FBQztJQUNYLFdBQVcsQ0FBQyxHQUFHLEVBQUU7UUFDYixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLHNCQUFz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
