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
                message.time = new Date(message.timestamp);
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
        <strong>${name}</strong>:&nbsp;${message}
        </div>`;
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
        let message = this.$input.value.trim();

        if (message) {
            this.emit('send', { message });
            this.$input.value = '';
        }

        event.preventDefault();
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

const generateUid = () => {
    const timestamp = Date.now().toString().slice(0, -3);
    const random = Math.random().toString(36).substr(2, 4);

    return `${random}${timestamp}`;
};

var uid = {
    generateUid,
};

class MessagesService extends eventEmitterEs6 {
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
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                uid: uid.generateUid(),
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

var messagesService = new MessagesService();

class Chat extends Base {
    constructor($el) {
        super($el);

        messagesService.on('message', this.onMessage.bind(this));
    }

    render() {
        // clear
        this.$el.innerHTML = '';

        // messages
        let $messages = document.createElement('div');
        $messages.className = 'messages';
        this.$el.appendChild($messages);

        this.messages = new Messages($messages);

        // compose
        let $form = document.createElement('div');
        this.$el.appendChild($form);

        this.compose = new Form($form);
        this.compose.on('send', this.onSend.bind(this));
    }

    onSend(message) {
        messagesService.addMessage(message);
    }

    onMessage(message) {
        this.messages.addMessage(message);
    }
}

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

// views
let views = {
    chat: new Chat(document.createElement('div')),
    auth: new Auth(document.createElement('div')),
};

Object.keys(views).forEach((key) => {
    views[key].$el.style.display = 'none';
    $container.appendChild(views[key].$el);
});

// router
let router = new Router(views);

router.start();

// ready
$loading.style.display = 'none';
$container.style.display = null;

}(firebase));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJzcmMvdmlld3MvYmFzZS9iYXNlLmpzIiwic3JjL2NvbXBvbmVudHMvbWVzc2FnZXMvbWVzc2FnZXMuanMiLCJub2RlX21vZHVsZXMvZXZlbnQtZW1pdHRlci1lczYvaW5kZXguanMiLCJzcmMvY29tcG9uZW50cy9mb3JtL2Zvcm0uanMiLCJzcmMvc2VydmljZXMvYXV0aC5qcyIsInNyYy91dGlscy91aWQuanMiLCJzcmMvc2VydmljZXMvbWVzc2FnZXMuanMiLCJzcmMvdmlld3MvY2hhdC9jaGF0LmpzIiwic3JjL2NvbXBvbmVudHMvbG9naW4vbG9naW4uanMiLCJzcmMvdmlld3MvYXV0aC9hdXRoLmpzIiwic3JjL3JvdXRlci9yb3V0ZXIuanMiLCJzcmMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBCYXNlIHtcbiAgICBjb25zdHJ1Y3RvcigkZWwpIHtcbiAgICAgICAgdGhpcy4kZWwgPSAkZWw7XG5cbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7fVxufVxuXG5leHBvcnQgZGVmYXVsdCBCYXNlO1xuIiwiY2xhc3MgTWVzc2FnZXMge1xuICAgIGNvbnN0cnVjdG9yKCRlbCkge1xuICAgICAgICB0aGlzLiRlbCA9ICRlbDtcbiAgICAgICAgdGhpcy5kYXRhID0gW107XG4gICAgfVxuXG4gICAgc2V0RGF0YShkYXRhKSB7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG5cbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICBoYXNNZXNzYWdlKGRhdGEsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIGRhdGFcbiAgICAgICAgICAgIC5maWx0ZXIoaXRlbSA9PiBtZXNzYWdlLnVpZCAmJiBpdGVtLnVpZCA9PT0gbWVzc2FnZS51aWQpXG4gICAgICAgICAgICAubGVuZ3RoO1xuICAgIH1cblxuICAgIGdldE1lc3NhZ2UoZGF0YSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gZGF0YVxuICAgICAgICAgICAgLmZpbHRlcihpdGVtID0+IG1lc3NhZ2UudWlkICYmIGl0ZW0udWlkID09PSBtZXNzYWdlLnVpZClbMF07XG4gICAgfVxuXG4gICAgYWRkTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICAgIGlmICghdGhpcy5kYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmhhc01lc3NhZ2UodGhpcy5kYXRhLCBtZXNzYWdlKSkge1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdNZXNzYWdlID0gdGhpcy5nZXRNZXNzYWdlKHRoaXMuZGF0YSwgbWVzc2FnZSk7XG5cbiAgICAgICAgICAgIC8vIFRPRE86IGlmKCFkZWVwRXF1YWwpXG4gICAgICAgICAgICAvLyBVcGRhdGUgZXhpc3RpbmcgbWVzc2FnZVxuICAgICAgICAgICAgT2JqZWN0LmV4dGVuZChleGlzdGluZ01lc3NhZ2UsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICghbWVzc2FnZS50aW1lICYmIG1lc3NhZ2UudGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZS50aW1lID0gbmV3IERhdGUobWVzc2FnZS50aW1lc3RhbXApO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgdGhpcy5kYXRhLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5kYXRhKSB7XG4gICAgICAgICAgICBsZXQgaHRtbCA9IHRoaXMuZGF0YVxuICAgICAgICAgICAgICAgIC5tYXAoaXRlbSA9PiB0aGlzLnRtcGxNZXNzYWdlKGl0ZW0pKVxuICAgICAgICAgICAgICAgIC5qb2luKCdcXG4nKTtcblxuICAgICAgICAgICAgdGhpcy4kZWwuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmlubmVySFRNTCA9ICdubyBtZXNzYWdlcyc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0bXBsTWVzc2FnZSh7IG5hbWUsIG1lc3NhZ2UgfSkge1xuICAgICAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJtZXNzYWdlXCI+XG4gICAgICAgIDxzdHJvbmc+JHtuYW1lfTwvc3Ryb25nPjombmJzcDske21lc3NhZ2V9XG4gICAgICAgIDwvZGl2PmA7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNZXNzYWdlcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIERFRkFVTFRfVkFMVUVTID0ge1xuICAgIGVtaXREZWxheTogMTAsXG4gICAgc3RyaWN0TW9kZTogZmFsc2Vcbn07XG5cbi8qKlxuICogQHR5cGVkZWYge29iamVjdH0gRXZlbnRFbWl0dGVyTGlzdGVuZXJGdW5jXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IG9uY2VcbiAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb259IGZuXG4gKi9cblxuLyoqXG4gKiBAY2xhc3MgRXZlbnRFbWl0dGVyXG4gKlxuICogQHByaXZhdGVcbiAqIEBwcm9wZXJ0eSB7T2JqZWN0LjxzdHJpbmcsIEV2ZW50RW1pdHRlckxpc3RlbmVyRnVuY1tdPn0gX2xpc3RlbmVyc1xuICogQHByb3BlcnR5IHtzdHJpbmdbXX0gZXZlbnRzXG4gKi9cblxudmFyIEV2ZW50RW1pdHRlciA9IGZ1bmN0aW9uICgpIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7e319ICAgICAgW29wdHNdXG4gICAgICogQHBhcmFtIHtudW1iZXJ9ICBbb3B0cy5lbWl0RGVsYXkgPSAxMF0gLSBOdW1iZXIgaW4gbXMuIFNwZWNpZmllcyB3aGV0aGVyIGVtaXQgd2lsbCBiZSBzeW5jIG9yIGFzeW5jLiBCeSBkZWZhdWx0IC0gMTBtcy4gSWYgMCAtIGZpcmVzIHN5bmNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRzLnN0cmljdE1vZGUgPSBmYWxzZV0gLSBpcyB0cnVlLCBFbWl0dGVyIHRocm93cyBlcnJvciBvbiBlbWl0IGVycm9yIHdpdGggbm8gbGlzdGVuZXJzXG4gICAgICovXG5cbiAgICBmdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gICAgICAgIHZhciBvcHRzID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gREVGQVVMVF9WQUxVRVMgOiBhcmd1bWVudHNbMF07XG5cbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEV2ZW50RW1pdHRlcik7XG5cbiAgICAgICAgdmFyIGVtaXREZWxheSA9IHZvaWQgMCxcbiAgICAgICAgICAgIHN0cmljdE1vZGUgPSB2b2lkIDA7XG5cbiAgICAgICAgaWYgKG9wdHMuaGFzT3duUHJvcGVydHkoJ2VtaXREZWxheScpKSB7XG4gICAgICAgICAgICBlbWl0RGVsYXkgPSBvcHRzLmVtaXREZWxheTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVtaXREZWxheSA9IERFRkFVTFRfVkFMVUVTLmVtaXREZWxheTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9lbWl0RGVsYXkgPSBlbWl0RGVsYXk7XG5cbiAgICAgICAgaWYgKG9wdHMuaGFzT3duUHJvcGVydHkoJ3N0cmljdE1vZGUnKSkge1xuICAgICAgICAgICAgc3RyaWN0TW9kZSA9IG9wdHMuc3RyaWN0TW9kZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0cmljdE1vZGUgPSBERUZBVUxUX1ZBTFVFUy5zdHJpY3RNb2RlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3N0cmljdE1vZGUgPSBzdHJpY3RNb2RlO1xuXG4gICAgICAgIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xuICAgICAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb25jZSA9IGZhbHNlXVxuICAgICAqL1xuXG5cbiAgICBfY3JlYXRlQ2xhc3MoRXZlbnRFbWl0dGVyLCBbe1xuICAgICAgICBrZXk6ICdfYWRkTGlzdGVubmVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9hZGRMaXN0ZW5uZXIodHlwZSwgbGlzdGVuZXIsIG9uY2UpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5ldmVudHMuaW5kZXhPZih0eXBlKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnNbdHlwZV0gPSBbe1xuICAgICAgICAgICAgICAgICAgICBvbmNlOiBvbmNlLFxuICAgICAgICAgICAgICAgICAgICBmbjogbGlzdGVuZXJcbiAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50cy5wdXNoKHR5cGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnNbdHlwZV0ucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG9uY2U6IG9uY2UsXG4gICAgICAgICAgICAgICAgICAgIGZuOiBsaXN0ZW5lclxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN1YnNjcmliZXMgb24gZXZlbnQgdHlwZSBzcGVjaWZpZWQgZnVuY3Rpb25cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gbGlzdGVuZXJcbiAgICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29uJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9hZGRMaXN0ZW5uZXIodHlwZSwgbGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdWJzY3JpYmVzIG9uIGV2ZW50IHR5cGUgc3BlY2lmaWVkIGZ1bmN0aW9uIHRvIGZpcmUgb25seSBvbmNlXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyXG4gICAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvbmNlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uY2UodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZExpc3Rlbm5lcih0eXBlLCBsaXN0ZW5lciwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlcyBldmVudCB3aXRoIHNwZWNpZmllZCB0eXBlLiBJZiBzcGVjaWZpZWQgbGlzdGVuZXJGdW5jIC0gZGVsZXRlcyBvbmx5IG9uZSBsaXN0ZW5lciBvZiBzcGVjaWZpZWQgdHlwZVxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IFtsaXN0ZW5lckZ1bmNdXG4gICAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvZmYnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb2ZmKGV2ZW50VHlwZSwgbGlzdGVuZXJGdW5jKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgdHlwZUluZGV4ID0gdGhpcy5ldmVudHMuaW5kZXhPZihldmVudFR5cGUpO1xuICAgICAgICAgICAgdmFyIGhhc1R5cGUgPSBldmVudFR5cGUgJiYgdHlwZUluZGV4ICE9PSAtMTtcblxuICAgICAgICAgICAgaWYgKGhhc1R5cGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxpc3RlbmVyRnVuYykge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fbGlzdGVuZXJzW2V2ZW50VHlwZV07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRzLnNwbGljZSh0eXBlSW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVtb3ZlZEV2ZW50cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHR5cGVMaXN0ZW5lcnMgPSBfdGhpcy5fbGlzdGVuZXJzW2V2ZW50VHlwZV07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVMaXN0ZW5lcnMuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIHtFdmVudEVtaXR0ZXJMaXN0ZW5lckZ1bmN9IGZuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gaWR4XG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChmbiwgaWR4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZuLmZuID09PSBsaXN0ZW5lckZ1bmMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZEV2ZW50cy51bnNoaWZ0KGlkeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZWRFdmVudHMuZm9yRWFjaChmdW5jdGlvbiAoaWR4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZUxpc3RlbmVycy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXR5cGVMaXN0ZW5lcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuZXZlbnRzLnNwbGljZSh0eXBlSW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBfdGhpcy5fbGlzdGVuZXJzW2V2ZW50VHlwZV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFwcGxpZXMgYXJndW1lbnRzIHRvIHNwZWNpZmllZCBldmVudCB0eXBlXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGVcbiAgICAgICAgICogQHBhcmFtIHsqW119IGV2ZW50QXJndW1lbnRzXG4gICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ19hcHBseUV2ZW50cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBfYXBwbHlFdmVudHMoZXZlbnRUeXBlLCBldmVudEFyZ3VtZW50cykge1xuICAgICAgICAgICAgdmFyIHR5cGVMaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnNbZXZlbnRUeXBlXTtcblxuICAgICAgICAgICAgaWYgKCF0eXBlTGlzdGVuZXJzIHx8ICF0eXBlTGlzdGVuZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9zdHJpY3RNb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93ICdObyBsaXN0ZW5lcnMgc3BlY2lmaWVkIGZvciBldmVudDogJyArIGV2ZW50VHlwZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcmVtb3ZhYmxlTGlzdGVuZXJzID0gW107XG4gICAgICAgICAgICB0eXBlTGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGVlTGlzdGVuZXIsIGlkeCkge1xuICAgICAgICAgICAgICAgIGVlTGlzdGVuZXIuZm4uYXBwbHkobnVsbCwgZXZlbnRBcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIGlmIChlZUxpc3RlbmVyLm9uY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZhYmxlTGlzdGVuZXJzLnVuc2hpZnQoaWR4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmVtb3ZhYmxlTGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGlkeCkge1xuICAgICAgICAgICAgICAgIHR5cGVMaXN0ZW5lcnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFbWl0cyBldmVudCB3aXRoIHNwZWNpZmllZCB0eXBlIGFuZCBwYXJhbXMuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAgICAgICAqIEBwYXJhbSBldmVudEFyZ3NcbiAgICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2VtaXQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZW1pdCh0eXBlKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGV2ZW50QXJncyA9IEFycmF5KF9sZW4gPiAxID8gX2xlbiAtIDEgOiAwKSwgX2tleSA9IDE7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgICAgICAgICBldmVudEFyZ3NbX2tleSAtIDFdID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5fZW1pdERlbGF5KSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5fYXBwbHlFdmVudHMuY2FsbChfdGhpczIsIHR5cGUsIGV2ZW50QXJncyk7XG4gICAgICAgICAgICAgICAgfSwgdGhpcy5fZW1pdERlbGF5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYXBwbHlFdmVudHModHlwZSwgZXZlbnRBcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFbWl0cyBldmVudCB3aXRoIHNwZWNpZmllZCB0eXBlIGFuZCBwYXJhbXMgc3luY2hyb25vdXNseS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAgICAgICAgICogQHBhcmFtIGV2ZW50QXJnc1xuICAgICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZW1pdFN5bmMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZW1pdFN5bmModHlwZSkge1xuICAgICAgICAgICAgZm9yICh2YXIgX2xlbjIgPSBhcmd1bWVudHMubGVuZ3RoLCBldmVudEFyZ3MgPSBBcnJheShfbGVuMiA+IDEgPyBfbGVuMiAtIDEgOiAwKSwgX2tleTIgPSAxOyBfa2V5MiA8IF9sZW4yOyBfa2V5MisrKSB7XG4gICAgICAgICAgICAgICAgZXZlbnRBcmdzW19rZXkyIC0gMV0gPSBhcmd1bWVudHNbX2tleTJdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9hcHBseUV2ZW50cyh0eXBlLCBldmVudEFyZ3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlc3Ryb3lzIEV2ZW50RW1pdHRlclxuICAgICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGVzdHJveScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0ge307XG4gICAgICAgICAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEV2ZW50RW1pdHRlcjtcbn0oKTtcblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG4iLCJpbXBvcnQgRW1pdHRlciBmcm9tICdldmVudC1lbWl0dGVyLWVzNic7XG5cbmNsYXNzIEZvcm0gZXh0ZW5kcyBFbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvcigkZWwpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLiRlbCA9ICRlbDtcblxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdGhpcy4kZWwuaW5uZXJIVE1MID0gYDxmb3JtIGNsYXNzPVwiY29tcG9zZSBqcy1mb3JtXCIgYWN0aW9uPVwiI1wiPlxuICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImNvbXBvc2UtaW5wdXQganMtaW5wdXRcIiBuYW1lPVwibWVzc2FnZVwiIGF1dG9jb21wbGV0ZT1cIm9mZlwiLz5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG5cIj5TZW5kPC9idXR0b24+XG4gICAgICAgIDwvZm9ybT5gO1xuXG4gICAgICAgIHRoaXMuaW5pdEV2ZW50cygpO1xuICAgIH1cblxuICAgIGluaXRFdmVudHMoKSB7XG4gICAgICAgIHRoaXMuJGZvcm0gPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcuanMtZm9ybScpO1xuICAgICAgICB0aGlzLiRpbnB1dCA9IHRoaXMuJGZvcm0ucXVlcnlTZWxlY3RvcignLmpzLWlucHV0Jyk7XG5cbiAgICAgICAgdGhpcy4kZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCB0aGlzLm9uU3VibWl0LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIG9uU3VibWl0KGV2ZW50KSB7XG4gICAgICAgIGxldCBtZXNzYWdlID0gdGhpcy4kaW5wdXQudmFsdWUudHJpbSgpO1xuXG4gICAgICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ3NlbmQnLCB7IG1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB0aGlzLiRpbnB1dC52YWx1ZSA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZvcm07XG4iLCIvLyBUT0RPOiBidW5kbGVcbmltcG9ydCBFbWl0dGVyIGZyb20gJ2V2ZW50LWVtaXR0ZXItZXM2JztcbmltcG9ydCAqIGFzIGZpcmViYXNlIGZyb20gJ2ZpcmViYXNlJztcblxuY29uc3QgY29uZmlnID0ge1xuICAgIGFwaUtleTogJ0FJemFTeUJOX3dwNkR0ZFNQU2hVcUNiMnlLY2VBcm9tUVZvRWFGUScsXG4gICAgYXV0aERvbWFpbjogJ21pbmljaGF0LTk1OGZkLmZpcmViYXNlYXBwLmNvbScsXG4gICAgZGF0YWJhc2VVUkw6ICdodHRwczovL21pbmljaGF0LTk1OGZkLmZpcmViYXNlaW8uY29tJyxcbiAgICBwcm9qZWN0SWQ6ICdtaW5pY2hhdC05NThmZCcsXG4gICAgc3RvcmFnZUJ1Y2tldDogJ21pbmljaGF0LTk1OGZkLmFwcHNwb3QuY29tJyxcbiAgICBtZXNzYWdpbmdTZW5kZXJJZDogJzM3OTY3ODIwMzgwMycsXG59O1xuXG4vKipcbiAqIFNpbmdsZXRvbiBhdXRoIHNlcnZpY2VcbiAqL1xuY2xhc3MgQXV0aFNlcnZpY2UgZXh0ZW5kcyBFbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLmFwcCA9IGZpcmViYXNlLmluaXRpYWxpemVBcHAoY29uZmlnKTtcbiAgICAgICAgdGhpcy5hdXRoID0gZmlyZWJhc2UuYXV0aCgpO1xuXG4gICAgICAgIHRoaXMuYXV0aC5vbkF1dGhTdGF0ZUNoYW5nZWQodGhpcy5vbkF1dGhTdGF0ZUNoYW5nZWQuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgZ2V0VXNlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aC5jdXJyZW50VXNlcjtcbiAgICB9XG5cbiAgICBsb2dpbihlbWFpbCwgcGFzc3dvcmQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aC5zaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZChlbWFpbCwgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIHNpZ251cChlbWFpbCwgcGFzc3dvcmQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aC5jcmVhdGVVc2VyV2l0aEVtYWlsQW5kUGFzc3dvcmQoZW1haWwsIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICBvbkF1dGhTdGF0ZUNoYW5nZWQodXNlcikge1xuICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdsb2dpbicsIHVzZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdsb2dvdXQnKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IEF1dGhTZXJ2aWNlKCk7XG4iLCJjb25zdCBnZW5lcmF0ZVVpZCA9ICgpID0+IHtcbiAgICBjb25zdCB0aW1lc3RhbXAgPSBEYXRlLm5vdygpLnRvU3RyaW5nKCkuc2xpY2UoMCwgLTMpO1xuICAgIGNvbnN0IHJhbmRvbSA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA0KTtcblxuICAgIHJldHVybiBgJHtyYW5kb219JHt0aW1lc3RhbXB9YDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBnZW5lcmF0ZVVpZCxcbn07XG4iLCJpbXBvcnQgRW1pdHRlciBmcm9tICdldmVudC1lbWl0dGVyLWVzNic7XG5pbXBvcnQgKiBhcyBmaXJlYmFzZSBmcm9tICdmaXJlYmFzZSc7XG5pbXBvcnQgYXV0aFNlcnZpY2UgZnJvbSAnLi4vc2VydmljZXMvYXV0aCc7XG5pbXBvcnQgdWlkIGZyb20gJy4uL3V0aWxzL3VpZCc7XG5cbmNsYXNzIE1lc3NhZ2VzU2VydmljZSBleHRlbmRzIEVtaXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuZGF0YWJhc2UgPSBmaXJlYmFzZS5kYXRhYmFzZSgpO1xuICAgICAgICB0aGlzLm1lc3NhZ2VzUmVmID0gdGhpcy5kYXRhYmFzZS5yZWYoJ21lc3NhZ2VzJyk7XG4gICAgICAgIHRoaXMubWVzc2FnZXNSZWYub2ZmKCk7XG5cbiAgICAgICAgdGhpcy5tZXNzYWdlc1JlZi5saW1pdFRvTGFzdCgxMDApLm9uKCdjaGlsZF9hZGRlZCcsIHRoaXMub25NZXNzYWdlLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm1lc3NhZ2VzUmVmLmxpbWl0VG9MYXN0KDEwMCkub24oJ2NoaWxkX2NoYW5nZWQnLCB0aGlzLm9uTWVzc2FnZS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBhZGRNZXNzYWdlKHsgbWVzc2FnZSB9KSB7XG4gICAgICAgIGxldCB1c2VyID0gYXV0aFNlcnZpY2UuZ2V0VXNlcigpO1xuXG4gICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBuYW1lOiB1c2VyLmRpc3BsYXlOYW1lIHx8IHVzZXIuZW1haWwsXG4gICAgICAgICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IGZpcmViYXNlLmRhdGFiYXNlLlNlcnZlclZhbHVlLlRJTUVTVEFNUCxcbiAgICAgICAgICAgICAgICB1aWQ6IHVpZC5nZW5lcmF0ZVVpZCgpLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5tZXNzYWdlc1JlZi5wdXNoKGRhdGEpXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge30pXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncHVzaCBlcnJvcicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uTWVzc2FnZShkYXRhKSB7XG4gICAgICAgIHRoaXMuZW1pdCgnbWVzc2FnZScsIGRhdGEudmFsKCkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IE1lc3NhZ2VzU2VydmljZSgpO1xuIiwiaW1wb3J0IEJhc2UgZnJvbSAnLi4vYmFzZS9iYXNlJztcbmltcG9ydCBNZXNzYWdlcyBmcm9tICcuLi8uLi9jb21wb25lbnRzL21lc3NhZ2VzL21lc3NhZ2VzJztcbmltcG9ydCBGb3JtIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvZm9ybS9mb3JtJztcbmltcG9ydCBtZXNzYWdlc1NlcnZpY2UgZnJvbSAnLi4vLi4vc2VydmljZXMvbWVzc2FnZXMnO1xuXG5jbGFzcyBDaGF0IGV4dGVuZHMgQmFzZSB7XG4gICAgY29uc3RydWN0b3IoJGVsKSB7XG4gICAgICAgIHN1cGVyKCRlbCk7XG5cbiAgICAgICAgbWVzc2FnZXNTZXJ2aWNlLm9uKCdtZXNzYWdlJywgdGhpcy5vbk1lc3NhZ2UuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICAvLyBjbGVhclxuICAgICAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSAnJztcblxuICAgICAgICAvLyBtZXNzYWdlc1xuICAgICAgICBsZXQgJG1lc3NhZ2VzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICRtZXNzYWdlcy5jbGFzc05hbWUgPSAnbWVzc2FnZXMnO1xuICAgICAgICB0aGlzLiRlbC5hcHBlbmRDaGlsZCgkbWVzc2FnZXMpO1xuXG4gICAgICAgIHRoaXMubWVzc2FnZXMgPSBuZXcgTWVzc2FnZXMoJG1lc3NhZ2VzKTtcblxuICAgICAgICAvLyBjb21wb3NlXG4gICAgICAgIGxldCAkZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0aGlzLiRlbC5hcHBlbmRDaGlsZCgkZm9ybSk7XG5cbiAgICAgICAgdGhpcy5jb21wb3NlID0gbmV3IEZvcm0oJGZvcm0pO1xuICAgICAgICB0aGlzLmNvbXBvc2Uub24oJ3NlbmQnLCB0aGlzLm9uU2VuZC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBvblNlbmQobWVzc2FnZSkge1xuICAgICAgICBtZXNzYWdlc1NlcnZpY2UuYWRkTWVzc2FnZShtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBvbk1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgICB0aGlzLm1lc3NhZ2VzLmFkZE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDaGF0O1xuIiwiaW1wb3J0IGF1dGhTZXJ2aWNlIGZyb20gJy4uLy4uL3NlcnZpY2VzL2F1dGgnO1xuXG5jbGFzcyBMb2dpbiB7XG4gICAgY29uc3RydWN0b3IoJGVsKSB7XG4gICAgICAgIHRoaXMuJGVsID0gJGVsO1xuXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBgPGZvcm0gYWN0aW9uPVwiI1wiPlxuICAgICAgICA8ZGl2PjxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJlbWFpbFwiLz48L2Rpdj5cbiAgICAgICAgPGRpdj48aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgbmFtZT1cInBhc3N3b3JkXCIvPjwvZGl2PlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG5fbWFpblwiPkxvZyBpbjwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwianMtc2lnbnVwXCI+U2lnbiB1cDwvYnV0dG9uPmA7XG5cbiAgICAgICAgdGhpcy5pbml0RXZlbnRzKCk7XG4gICAgfVxuXG4gICAgaW5pdEV2ZW50cygpIHtcbiAgICAgICAgdGhpcy4kZm9ybSA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0nKTtcbiAgICAgICAgdGhpcy4kZW1haWwgPSB0aGlzLiRmb3JtLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJlbWFpbFwiXScpO1xuICAgICAgICB0aGlzLiRwYXNzd29yZCA9IHRoaXMuJGZvcm0ucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInBhc3N3b3JkXCJdJyk7XG4gICAgICAgIHRoaXMuJHNpZ251cCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5qcy1zaWdudXAnKTtcblxuICAgICAgICB0aGlzLiRmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIHRoaXMub25TdWJtaXQuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuJHNpZ251cC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25TaWdudXAuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgb25TdWJtaXQoZXZlbnQpIHtcbiAgICAgICAgbGV0IGVtYWlsID0gdGhpcy4kZW1haWwudmFsdWU7XG4gICAgICAgIGxldCBwYXNzd29yZCA9IHRoaXMuJHBhc3N3b3JkLnZhbHVlO1xuXG4gICAgICAgIGF1dGhTZXJ2aWNlLmxvZ2luKGVtYWlsLCBwYXNzd29yZClcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBhbGVydChgZmFpbGVkIHRvIHNpZ24gdXA6ICR7ZXJyb3IuY29kZX06JHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG5cbiAgICBvblNpZ251cChldmVudCkge1xuICAgICAgICBsZXQgZW1haWwgPSB0aGlzLiRlbWFpbC52YWx1ZTtcbiAgICAgICAgbGV0IHBhc3N3b3JkID0gdGhpcy4kcGFzc3dvcmQudmFsdWU7XG5cbiAgICAgICAgYXV0aFNlcnZpY2Uuc2lnbnVwKGVtYWlsLCBwYXNzd29yZClcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBhbGVydChgZmFpbGVkIHRvIHNpZ24gdXA6ICR7ZXJyb3IuY29kZX06JHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IExvZ2luO1xuIiwiaW1wb3J0IEJhc2UgZnJvbSAnLi4vYmFzZS9iYXNlJztcbmltcG9ydCBMb2dpbiBmcm9tICcuLi8uLi9jb21wb25lbnRzL2xvZ2luL2xvZ2luJztcblxuY2xhc3MgQXV0aCBleHRlbmRzIEJhc2Uge1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgLy8gY2xlYXJcbiAgICAgICAgdGhpcy5sb2dpbiA9IG5ldyBMb2dpbih0aGlzLiRlbCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBBdXRoO1xuIiwiaW1wb3J0IGF1dGhTZXJ2aWNlIGZyb20gJy4uL3NlcnZpY2VzL2F1dGgnO1xuXG5jbGFzcyBSb3V0ZXIge1xuICAgIGNvbnN0cnVjdG9yKHZpZXdzKSB7XG4gICAgICAgIHRoaXMudmlld3MgPSB2aWV3cztcbiAgICAgICAgdGhpcy5jdXJyZW50VmlldyA9IG51bGw7XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7XG4gICAgICAgIGF1dGhTZXJ2aWNlLm9uKCdsb2dpbicsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucm91dGUoJ2NoYXQnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXV0aFNlcnZpY2Uub24oJ2xvZ291dCcsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucm91dGUoJ2F1dGgnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IG5hbWUgPSBhdXRoU2VydmljZS5nZXRVc2VyKCkgPyAnY2hhdCcgOiAnYXV0aCc7XG5cbiAgICAgICAgdGhpcy5yb3V0ZShuYW1lKTtcbiAgICB9XG5cbiAgICByb3V0ZShuYW1lKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRWaWV3KSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3LiRlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jdXJyZW50VmlldyA9IHRoaXMudmlld3NbbmFtZV07XG4gICAgICAgIHRoaXMuY3VycmVudFZpZXcuJGVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUm91dGVyO1xuIiwiaW1wb3J0IENoYXQgZnJvbSAnLi92aWV3cy9jaGF0L2NoYXQnO1xuaW1wb3J0IEF1dGggZnJvbSAnLi92aWV3cy9hdXRoL2F1dGgnO1xuaW1wb3J0IFJvdXRlciBmcm9tICcuL3JvdXRlci9yb3V0ZXInO1xuaW1wb3J0IGF1dGhTZXJ2aWNlIGZyb20gJy4vc2VydmljZXMvYXV0aCc7XG5cbmxldCAkbG9hZGluZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1sb2FkaW5nJyk7XG5sZXQgJGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jb21wb25lbnRzJyk7XG5cbi8vIHZpZXdzXG5sZXQgdmlld3MgPSB7XG4gICAgY2hhdDogbmV3IENoYXQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpLFxuICAgIGF1dGg6IG5ldyBBdXRoKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKSxcbn07XG5cbk9iamVjdC5rZXlzKHZpZXdzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICB2aWV3c1trZXldLiRlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICRjb250YWluZXIuYXBwZW5kQ2hpbGQodmlld3Nba2V5XS4kZWwpO1xufSk7XG5cbi8vIHJvdXRlclxubGV0IHJvdXRlciA9IG5ldyBSb3V0ZXIodmlld3MpO1xuXG5yb3V0ZXIuc3RhcnQoKTtcblxuLy8gcmVhZHlcbiRsb2FkaW5nLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4kY29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSBudWxsO1xuIl0sIm5hbWVzIjpbIkVtaXR0ZXIiLCJmaXJlYmFzZS5pbml0aWFsaXplQXBwIiwiZmlyZWJhc2UuYXV0aCIsImZpcmViYXNlLmRhdGFiYXNlIl0sIm1hcHBpbmdzIjoiOzs7QUFBQSxNQUFNLElBQUksQ0FBQztJQUNQLFdBQVcsQ0FBQyxHQUFHLEVBQUU7UUFDYixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQzs7UUFFZixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDakI7O0lBRUQsTUFBTSxHQUFHLEVBQUU7Q0FDZDs7QUNSRCxNQUFNLFFBQVEsQ0FBQztJQUNYLFdBQVcsQ0FBQyxHQUFHLEVBQUU7UUFDYixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0tBQ2xCOztJQUVELE9BQU8sQ0FBQyxJQUFJLEVBQUU7UUFDVixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQzs7UUFFakIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ2pCOztJQUVELFVBQVUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO1FBQ3RCLE9BQU8sSUFBSTthQUNOLE1BQU0sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxLQUFLLE9BQU8sQ0FBQyxHQUFHLENBQUM7YUFDdkQsTUFBTSxDQUFDO0tBQ2Y7O0lBRUQsVUFBVSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUU7UUFDdEIsT0FBTyxJQUFJO2FBQ04sTUFBTSxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLEtBQUssT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ25FOztJQUVELFVBQVUsQ0FBQyxPQUFPLEVBQUU7UUFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDWixJQUFJLENBQUMsSUFB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
