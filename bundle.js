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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJzcmMvdmlld3MvYmFzZS9iYXNlLmpzIiwic3JjL2NvbXBvbmVudHMvbWVzc2FnZXMvbWVzc2FnZXMuanMiLCJub2RlX21vZHVsZXMvZXZlbnQtZW1pdHRlci1lczYvaW5kZXguanMiLCJzcmMvY29tcG9uZW50cy9mb3JtL2Zvcm0uanMiLCJzcmMvc2VydmljZXMvYXV0aC5qcyIsInNyYy91dGlscy91aWQuanMiLCJzcmMvc2VydmljZXMvbWVzc2FnZXMuanMiLCJzcmMvdmlld3MvY2hhdC9jaGF0LmpzIiwic3JjL2NvbXBvbmVudHMvbG9naW4vbG9naW4uanMiLCJzcmMvdmlld3MvYXV0aC9hdXRoLmpzIiwic3JjL3JvdXRlci9yb3V0ZXIuanMiLCJzcmMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBCYXNlIHtcbiAgICBjb25zdHJ1Y3RvcigkZWwpIHtcbiAgICAgICAgdGhpcy4kZWwgPSAkZWw7XG5cbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7fVxufVxuXG5leHBvcnQgZGVmYXVsdCBCYXNlO1xuIiwiY2xhc3MgTWVzc2FnZXMge1xuICAgIGNvbnN0cnVjdG9yKCRlbCkge1xuICAgICAgICB0aGlzLiRlbCA9ICRlbDtcbiAgICAgICAgdGhpcy5kYXRhID0gW107XG4gICAgfVxuXG4gICAgc2V0RGF0YShkYXRhKSB7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG5cbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICBoYXNNZXNzYWdlKGRhdGEsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIGRhdGFcbiAgICAgICAgICAgIC5maWx0ZXIoaXRlbSA9PiBtZXNzYWdlLnVpZCAmJiBpdGVtLnVpZCA9PT0gbWVzc2FnZS51aWQpXG4gICAgICAgICAgICAubGVuZ3RoO1xuICAgIH1cblxuICAgIGdldE1lc3NhZ2UoZGF0YSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gZGF0YVxuICAgICAgICAgICAgLmZpbHRlcihpdGVtID0+IG1lc3NhZ2UudWlkICYmIGl0ZW0udWlkID09PSBtZXNzYWdlLnVpZClbMF07XG4gICAgfVxuXG4gICAgYWRkTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICAgIGlmICghdGhpcy5kYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmhhc01lc3NhZ2UodGhpcy5kYXRhLCBtZXNzYWdlKSkge1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdNZXNzYWdlID0gdGhpcy5nZXRNZXNzYWdlKHRoaXMuZGF0YSwgbWVzc2FnZSk7XG5cbiAgICAgICAgICAgIC8vIFRPRE86IGlmKCFkZWVwRXF1YWwpXG4gICAgICAgICAgICAvLyBVcGRhdGUgZXhpc3RpbmcgbWVzc2FnZVxuICAgICAgICAgICAgT2JqZWN0LmV4dGVuZChleGlzdGluZ01lc3NhZ2UsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICghbWVzc2FnZS50aW1lICYmIG1lc3NhZ2UudGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZS50aW1lID0gbmV3IERhdGUobWVzc2FnZS50aW1lc3RhbXApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmRhdGEucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGEpIHtcbiAgICAgICAgICAgIGxldCBodG1sID0gdGhpcy5kYXRhXG4gICAgICAgICAgICAgICAgLm1hcChpdGVtID0+IHRoaXMudG1wbE1lc3NhZ2UoaXRlbSkpXG4gICAgICAgICAgICAgICAgLmpvaW4oJ1xcbicpO1xuXG4gICAgICAgICAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy4kZWwuaW5uZXJIVE1MID0gJ25vIG1lc3NhZ2VzJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRtcGxNZXNzYWdlKHsgbmFtZSwgbWVzc2FnZSB9KSB7XG4gICAgICAgIHJldHVybiBgPGRpdiBjbGFzcz1cIm1lc3NhZ2VcIj5cbiAgICAgICAgPHN0cm9uZz4ke25hbWV9PC9zdHJvbmc+OiZuYnNwOyR7bWVzc2FnZX1cbiAgICAgICAgPC9kaXY+YDtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1lc3NhZ2VzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgREVGQVVMVF9WQUxVRVMgPSB7XG4gICAgZW1pdERlbGF5OiAxMCxcbiAgICBzdHJpY3RNb2RlOiBmYWxzZVxufTtcblxuLyoqXG4gKiBAdHlwZWRlZiB7b2JqZWN0fSBFdmVudEVtaXR0ZXJMaXN0ZW5lckZ1bmNcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gb25jZVxuICogQHByb3BlcnR5IHtmdW5jdGlvbn0gZm5cbiAqL1xuXG4vKipcbiAqIEBjbGFzcyBFdmVudEVtaXR0ZXJcbiAqXG4gKiBAcHJpdmF0ZVxuICogQHByb3BlcnR5IHtPYmplY3QuPHN0cmluZywgRXZlbnRFbWl0dGVyTGlzdGVuZXJGdW5jW10+fSBfbGlzdGVuZXJzXG4gKiBAcHJvcGVydHkge3N0cmluZ1tdfSBldmVudHNcbiAqL1xuXG52YXIgRXZlbnRFbWl0dGVyID0gZnVuY3Rpb24gKCkge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHt7fX0gICAgICBbb3B0c11cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gIFtvcHRzLmVtaXREZWxheSA9IDEwXSAtIE51bWJlciBpbiBtcy4gU3BlY2lmaWVzIHdoZXRoZXIgZW1pdCB3aWxsIGJlIHN5bmMgb3IgYXN5bmMuIEJ5IGRlZmF1bHQgLSAxMG1zLiBJZiAwIC0gZmlyZXMgc3luY1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdHMuc3RyaWN0TW9kZSA9IGZhbHNlXSAtIGlzIHRydWUsIEVtaXR0ZXIgdGhyb3dzIGVycm9yIG9uIGVtaXQgZXJyb3Igd2l0aCBubyBsaXN0ZW5lcnNcbiAgICAgKi9cblxuICAgIGZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgICAgICAgdmFyIG9wdHMgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBERUZBVUxUX1ZBTFVFUyA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRXZlbnRFbWl0dGVyKTtcblxuICAgICAgICB2YXIgZW1pdERlbGF5ID0gdm9pZCAwLFxuICAgICAgICAgICAgc3RyaWN0TW9kZSA9IHZvaWQgMDtcblxuICAgICAgICBpZiAob3B0cy5oYXNPd25Qcm9wZXJ0eSgnZW1pdERlbGF5JykpIHtcbiAgICAgICAgICAgIGVtaXREZWxheSA9IG9wdHMuZW1pdERlbGF5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZW1pdERlbGF5ID0gREVGQVVMVF9WQUxVRVMuZW1pdERlbGF5O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2VtaXREZWxheSA9IGVtaXREZWxheTtcblxuICAgICAgICBpZiAob3B0cy5oYXNPd25Qcm9wZXJ0eSgnc3RyaWN0TW9kZScpKSB7XG4gICAgICAgICAgICBzdHJpY3RNb2RlID0gb3B0cy5zdHJpY3RNb2RlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RyaWN0TW9kZSA9IERFRkFVTFRfVkFMVUVTLnN0cmljdE1vZGU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc3RyaWN0TW9kZSA9IHN0cmljdE1vZGU7XG5cbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0ge307XG4gICAgICAgIHRoaXMuZXZlbnRzID0gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gbGlzdGVuZXJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvbmNlID0gZmFsc2VdXG4gICAgICovXG5cblxuICAgIF9jcmVhdGVDbGFzcyhFdmVudEVtaXR0ZXIsIFt7XG4gICAgICAgIGtleTogJ19hZGRMaXN0ZW5uZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gX2FkZExpc3Rlbm5lcih0eXBlLCBsaXN0ZW5lciwgb25jZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmV2ZW50cy5pbmRleE9mKHR5cGUpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1t0eXBlXSA9IFt7XG4gICAgICAgICAgICAgICAgICAgIG9uY2U6IG9uY2UsXG4gICAgICAgICAgICAgICAgICAgIGZuOiBsaXN0ZW5lclxuICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRzLnB1c2godHlwZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1t0eXBlXS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgb25jZTogb25jZSxcbiAgICAgICAgICAgICAgICAgICAgZm46IGxpc3RlbmVyXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogU3Vic2NyaWJlcyBvbiBldmVudCB0eXBlIHNwZWNpZmllZCBmdW5jdGlvblxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBsaXN0ZW5lclxuICAgICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb24nLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZExpc3Rlbm5lcih0eXBlLCBsaXN0ZW5lciwgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN1YnNjcmliZXMgb24gZXZlbnQgdHlwZSBzcGVjaWZpZWQgZnVuY3Rpb24gdG8gZmlyZSBvbmx5IG9uY2VcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gbGlzdGVuZXJcbiAgICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29uY2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb25jZSh0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgICAgICAgdGhpcy5fYWRkTGlzdGVubmVyKHR5cGUsIGxpc3RlbmVyLCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmVzIGV2ZW50IHdpdGggc3BlY2lmaWVkIHR5cGUuIElmIHNwZWNpZmllZCBsaXN0ZW5lckZ1bmMgLSBkZWxldGVzIG9ubHkgb25lIGxpc3RlbmVyIG9mIHNwZWNpZmllZCB0eXBlXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGVcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gW2xpc3RlbmVyRnVuY11cbiAgICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29mZicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvZmYoZXZlbnRUeXBlLCBsaXN0ZW5lckZ1bmMpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciB0eXBlSW5kZXggPSB0aGlzLmV2ZW50cy5pbmRleE9mKGV2ZW50VHlwZSk7XG4gICAgICAgICAgICB2YXIgaGFzVHlwZSA9IGV2ZW50VHlwZSAmJiB0eXBlSW5kZXggIT09IC0xO1xuXG4gICAgICAgICAgICBpZiAoaGFzVHlwZSkge1xuICAgICAgICAgICAgICAgIGlmICghbGlzdGVuZXJGdW5jKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9saXN0ZW5lcnNbZXZlbnRUeXBlXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ldmVudHMuc3BsaWNlKHR5cGVJbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZW1vdmVkRXZlbnRzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdHlwZUxpc3RlbmVycyA9IF90aGlzLl9saXN0ZW5lcnNbZXZlbnRUeXBlXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZUxpc3RlbmVycy5mb3JFYWNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge0V2ZW50RW1pdHRlckxpc3RlbmVyRnVuY30gZm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpZHhcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGZuLCBpZHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZm4uZm4gPT09IGxpc3RlbmVyRnVuYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVkRXZlbnRzLnVuc2hpZnQoaWR4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZEV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChpZHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlTGlzdGVuZXJzLnNwbGljZShpZHgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdHlwZUxpc3RlbmVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5ldmVudHMuc3BsaWNlKHR5cGVJbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIF90aGlzLl9saXN0ZW5lcnNbZXZlbnRUeXBlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQXBwbGllcyBhcmd1bWVudHMgdG8gc3BlY2lmaWVkIGV2ZW50IHR5cGVcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZVxuICAgICAgICAgKiBAcGFyYW0geypbXX0gZXZlbnRBcmd1bWVudHNcbiAgICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnX2FwcGx5RXZlbnRzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9hcHBseUV2ZW50cyhldmVudFR5cGUsIGV2ZW50QXJndW1lbnRzKSB7XG4gICAgICAgICAgICB2YXIgdHlwZUxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVyc1tldmVudFR5cGVdO1xuXG4gICAgICAgICAgICBpZiAoIXR5cGVMaXN0ZW5lcnMgfHwgIXR5cGVMaXN0ZW5lcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3N0cmljdE1vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgJ05vIGxpc3RlbmVycyBzcGVjaWZpZWQgZm9yIGV2ZW50OiAnICsgZXZlbnRUeXBlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciByZW1vdmFibGVMaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgICAgIHR5cGVMaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAoZWVMaXN0ZW5lciwgaWR4KSB7XG4gICAgICAgICAgICAgICAgZWVMaXN0ZW5lci5mbi5hcHBseShudWxsLCBldmVudEFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgaWYgKGVlTGlzdGVuZXIub25jZSkge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmFibGVMaXN0ZW5lcnMudW5zaGlmdChpZHgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZW1vdmFibGVMaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAoaWR4KSB7XG4gICAgICAgICAgICAgICAgdHlwZUxpc3RlbmVycy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEVtaXRzIGV2ZW50IHdpdGggc3BlY2lmaWVkIHR5cGUgYW5kIHBhcmFtcy5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAgICAgICAgICogQHBhcmFtIGV2ZW50QXJnc1xuICAgICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZW1pdCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBlbWl0KHR5cGUpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgZXZlbnRBcmdzID0gQXJyYXkoX2xlbiA+IDEgPyBfbGVuIC0gMSA6IDApLCBfa2V5ID0gMTsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICAgICAgICAgIGV2ZW50QXJnc1tfa2V5IC0gMV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLl9lbWl0RGVsYXkpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMyLl9hcHBseUV2ZW50cy5jYWxsKF90aGlzMiwgdHlwZSwgZXZlbnRBcmdzKTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzLl9lbWl0RGVsYXkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hcHBseUV2ZW50cyh0eXBlLCBldmVudEFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEVtaXRzIGV2ZW50IHdpdGggc3BlY2lmaWVkIHR5cGUgYW5kIHBhcmFtcyBzeW5jaHJvbm91c2x5LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgICAgICAgKiBAcGFyYW0gZXZlbnRBcmdzXG4gICAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdlbWl0U3luYycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBlbWl0U3luYyh0eXBlKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBfbGVuMiA9IGFyZ3VtZW50cy5sZW5ndGgsIGV2ZW50QXJncyA9IEFycmF5KF9sZW4yID4gMSA/IF9sZW4yIC0gMSA6IDApLCBfa2V5MiA9IDE7IF9rZXkyIDwgX2xlbjI7IF9rZXkyKyspIHtcbiAgICAgICAgICAgICAgICBldmVudEFyZ3NbX2tleTIgLSAxXSA9IGFyZ3VtZW50c1tfa2V5Ml07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2FwcGx5RXZlbnRzKHR5cGUsIGV2ZW50QXJncyk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogRGVzdHJveXMgRXZlbnRFbWl0dGVyXG4gICAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdkZXN0cm95JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnMgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzID0gW107XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gRXZlbnRFbWl0dGVyO1xufSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcbiIsImltcG9ydCBFbWl0dGVyIGZyb20gJ2V2ZW50LWVtaXR0ZXItZXM2JztcblxuY2xhc3MgRm9ybSBleHRlbmRzIEVtaXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yKCRlbCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuJGVsID0gJGVsO1xuXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBgPGZvcm0gY2xhc3M9XCJjb21wb3NlIGpzLWZvcm1cIiBhY3Rpb249XCIjXCI+XG4gICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiY29tcG9zZS1pbnB1dCBqcy1pbnB1dFwiIG5hbWU9XCJtZXNzYWdlXCIgYXV0b2NvbXBsZXRlPVwib2ZmXCIvPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0blwiPlNlbmQ8L2J1dHRvbj5cbiAgICAgICAgPC9mb3JtPmA7XG5cbiAgICAgICAgdGhpcy5pbml0RXZlbnRzKCk7XG4gICAgfVxuXG4gICAgaW5pdEV2ZW50cygpIHtcbiAgICAgICAgdGhpcy4kZm9ybSA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5qcy1mb3JtJyk7XG4gICAgICAgIHRoaXMuJGlucHV0ID0gdGhpcy4kZm9ybS5xdWVyeVNlbGVjdG9yKCcuanMtaW5wdXQnKTtcblxuICAgICAgICB0aGlzLiRmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIHRoaXMub25TdWJtaXQuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgb25TdWJtaXQoZXZlbnQpIHtcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSB0aGlzLiRpbnB1dC52YWx1ZS50cmltKCk7XG5cbiAgICAgICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnc2VuZCcsIHsgbWVzc2FnZSB9KTtcbiAgICAgICAgICAgIHRoaXMuJGlucHV0LnZhbHVlID0gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRm9ybTtcbiIsIi8vIFRPRE86IGJ1bmRsZVxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnZXZlbnQtZW1pdHRlci1lczYnO1xuaW1wb3J0ICogYXMgZmlyZWJhc2UgZnJvbSAnZmlyZWJhc2UnO1xuXG5jb25zdCBjb25maWcgPSB7XG4gICAgYXBpS2V5OiAnQUl6YVN5Qk5fd3A2RHRkU1BTaFVxQ2IyeUtjZUFyb21RVm9FYUZRJyxcbiAgICBhdXRoRG9tYWluOiAnbWluaWNoYXQtOTU4ZmQuZmlyZWJhc2VhcHAuY29tJyxcbiAgICBkYXRhYmFzZVVSTDogJ2h0dHBzOi8vbWluaWNoYXQtOTU4ZmQuZmlyZWJhc2Vpby5jb20nLFxuICAgIHByb2plY3RJZDogJ21pbmljaGF0LTk1OGZkJyxcbiAgICBzdG9yYWdlQnVja2V0OiAnbWluaWNoYXQtOTU4ZmQuYXBwc3BvdC5jb20nLFxuICAgIG1lc3NhZ2luZ1NlbmRlcklkOiAnMzc5Njc4MjAzODAzJyxcbn07XG5cbi8qKlxuICogU2luZ2xldG9uIGF1dGggc2VydmljZVxuICovXG5jbGFzcyBBdXRoU2VydmljZSBleHRlbmRzIEVtaXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuYXBwID0gZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xuICAgICAgICB0aGlzLmF1dGggPSBmaXJlYmFzZS5hdXRoKCk7XG5cbiAgICAgICAgdGhpcy5hdXRoLm9uQXV0aFN0YXRlQ2hhbmdlZCh0aGlzLm9uQXV0aFN0YXRlQ2hhbmdlZC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBnZXRVc2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdXRoLmN1cnJlbnRVc2VyO1xuICAgIH1cblxuICAgIGxvZ2luKGVtYWlsLCBwYXNzd29yZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdXRoLnNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkKGVtYWlsLCBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgc2lnbnVwKGVtYWlsLCBwYXNzd29yZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdXRoLmNyZWF0ZVVzZXJXaXRoRW1haWxBbmRQYXNzd29yZChlbWFpbCwgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIG9uQXV0aFN0YXRlQ2hhbmdlZCh1c2VyKSB7XG4gICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2xvZ2luJywgdXNlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2xvZ291dCcpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgQXV0aFNlcnZpY2UoKTtcbiIsImNvbnN0IGdlbmVyYXRlVWlkID0gKCkgPT4ge1xuICAgIGNvbnN0IHRpbWVzdGFtcCA9IERhdGUubm93KCkudG9TdHJpbmcoKS5zbGljZSgwLCAtMyk7XG4gICAgY29uc3QgcmFuZG9tID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDQpO1xuXG4gICAgcmV0dXJuIGAke3JhbmRvbX0ke3RpbWVzdGFtcH1gO1xufTtcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIGdlbmVyYXRlVWlkLFxufTtcbiIsImltcG9ydCBFbWl0dGVyIGZyb20gJ2V2ZW50LWVtaXR0ZXItZXM2JztcbmltcG9ydCAqIGFzIGZpcmViYXNlIGZyb20gJ2ZpcmViYXNlJztcbmltcG9ydCBhdXRoU2VydmljZSBmcm9tICcuLi9zZXJ2aWNlcy9hdXRoJztcbmltcG9ydCB1aWQgZnJvbSAnLi4vdXRpbHMvdWlkJztcblxuY2xhc3MgTWVzc2FnZXNTZXJ2aWNlIGV4dGVuZHMgRW1pdHRlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5kYXRhYmFzZSA9IGZpcmViYXNlLmRhdGFiYXNlKCk7XG4gICAgICAgIHRoaXMubWVzc2FnZXNSZWYgPSB0aGlzLmRhdGFiYXNlLnJlZignbWVzc2FnZXMnKTtcbiAgICAgICAgdGhpcy5tZXNzYWdlc1JlZi5vZmYoKTtcblxuICAgICAgICB0aGlzLm1lc3NhZ2VzUmVmLmxpbWl0VG9MYXN0KDEwMCkub24oJ2NoaWxkX2FkZGVkJywgdGhpcy5vbk1lc3NhZ2UuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMubWVzc2FnZXNSZWYubGltaXRUb0xhc3QoMTAwKS5vbignY2hpbGRfY2hhbmdlZCcsIHRoaXMub25NZXNzYWdlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGFkZE1lc3NhZ2UoeyBtZXNzYWdlIH0pIHtcbiAgICAgICAgbGV0IHVzZXIgPSBhdXRoU2VydmljZS5nZXRVc2VyKCk7XG5cbiAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgIGxldCBkYXRhID0ge1xuICAgICAgICAgICAgICAgIG5hbWU6IHVzZXIuZGlzcGxheU5hbWUgfHwgdXNlci5lbWFpbCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlLFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogZmlyZWJhc2UuZGF0YWJhc2UuU2VydmVyVmFsdWUuVElNRVNUQU1QLFxuICAgICAgICAgICAgICAgIHVpZDogdWlkLmdlbmVyYXRlVWlkKCksXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2VzUmVmLnB1c2goZGF0YSlcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7fSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwdXNoIGVycm9yJywgZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25NZXNzYWdlKGRhdGEpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdtZXNzYWdlJywgZGF0YS52YWwoKSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgTWVzc2FnZXNTZXJ2aWNlKCk7XG4iLCJpbXBvcnQgQmFzZSBmcm9tICcuLi9iYXNlL2Jhc2UnO1xuaW1wb3J0IE1lc3NhZ2VzIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvbWVzc2FnZXMvbWVzc2FnZXMnO1xuaW1wb3J0IEZvcm0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9mb3JtL2Zvcm0nO1xuaW1wb3J0IG1lc3NhZ2VzU2VydmljZSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9tZXNzYWdlcyc7XG5cbmNsYXNzIENoYXQgZXh0ZW5kcyBCYXNlIHtcbiAgICBjb25zdHJ1Y3RvcigkZWwpIHtcbiAgICAgICAgc3VwZXIoJGVsKTtcblxuICAgICAgICBtZXNzYWdlc1NlcnZpY2Uub24oJ21lc3NhZ2UnLCB0aGlzLm9uTWVzc2FnZS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIC8vIGNsZWFyXG4gICAgICAgIHRoaXMuJGVsLmlubmVySFRNTCA9ICcnO1xuXG4gICAgICAgIC8vIG1lc3NhZ2VzXG4gICAgICAgIGxldCAkbWVzc2FnZXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgJG1lc3NhZ2VzLmNsYXNzTmFtZSA9ICdtZXNzYWdlcyc7XG4gICAgICAgIHRoaXMuJGVsLmFwcGVuZENoaWxkKCRtZXNzYWdlcyk7XG5cbiAgICAgICAgdGhpcy5tZXNzYWdlcyA9IG5ldyBNZXNzYWdlcygkbWVzc2FnZXMpO1xuXG4gICAgICAgIC8vIGNvbXBvc2VcbiAgICAgICAgbGV0ICRmb3JtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRoaXMuJGVsLmFwcGVuZENoaWxkKCRmb3JtKTtcblxuICAgICAgICB0aGlzLmNvbXBvc2UgPSBuZXcgRm9ybSgkZm9ybSk7XG4gICAgICAgIHRoaXMuY29tcG9zZS5vbignc2VuZCcsIHRoaXMub25TZW5kLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIG9uU2VuZChtZXNzYWdlKSB7XG4gICAgICAgIG1lc3NhZ2VzU2VydmljZS5hZGRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIG9uTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICAgIHRoaXMubWVzc2FnZXMuYWRkTWVzc2FnZShtZXNzYWdlKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENoYXQ7XG4iLCJpbXBvcnQgYXV0aFNlcnZpY2UgZnJvbSAnLi4vLi4vc2VydmljZXMvYXV0aCc7XG5cbmNsYXNzIExvZ2luIHtcbiAgICBjb25zdHJ1Y3RvcigkZWwpIHtcbiAgICAgICAgdGhpcy4kZWwgPSAkZWw7XG5cbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHRoaXMuJGVsLmlubmVySFRNTCA9IGA8Zm9ybSBhY3Rpb249XCIjXCI+XG4gICAgICAgIDxkaXY+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cImVtYWlsXCIvPjwvZGl2PlxuICAgICAgICA8ZGl2PjxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBuYW1lPVwicGFzc3dvcmRcIi8+PC9kaXY+XG4gICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bl9tYWluXCI+TG9nIGluPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJqcy1zaWdudXBcIj5TaWduIHVwPC9idXR0b24+YDtcblxuICAgICAgICB0aGlzLmluaXRFdmVudHMoKTtcbiAgICB9XG5cbiAgICBpbml0RXZlbnRzKCkge1xuICAgICAgICB0aGlzLiRmb3JtID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignZm9ybScpO1xuICAgICAgICB0aGlzLiRlbWFpbCA9IHRoaXMuJGZvcm0ucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImVtYWlsXCJdJyk7XG4gICAgICAgIHRoaXMuJHBhc3N3b3JkID0gdGhpcy4kZm9ybS5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwicGFzc3dvcmRcIl0nKTtcbiAgICAgICAgdGhpcy4kc2lnbnVwID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmpzLXNpZ251cCcpO1xuXG4gICAgICAgIHRoaXMuJGZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgdGhpcy5vblN1Ym1pdC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy4kc2lnbnVwLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vblNpZ251cC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBvblN1Ym1pdChldmVudCkge1xuICAgICAgICBsZXQgZW1haWwgPSB0aGlzLiRlbWFpbC52YWx1ZTtcbiAgICAgICAgbGV0IHBhc3N3b3JkID0gdGhpcy4kcGFzc3dvcmQudmFsdWU7XG5cbiAgICAgICAgYXV0aFNlcnZpY2UubG9naW4oZW1haWwsIHBhc3N3b3JkKVxuICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGFsZXJ0KGBmYWlsZWQgdG8gc2lnbiB1cDogJHtlcnJvci5jb2RlfToke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIG9uU2lnbnVwKGV2ZW50KSB7XG4gICAgICAgIGxldCBlbWFpbCA9IHRoaXMuJGVtYWlsLnZhbHVlO1xuICAgICAgICBsZXQgcGFzc3dvcmQgPSB0aGlzLiRwYXNzd29yZC52YWx1ZTtcblxuICAgICAgICBhdXRoU2VydmljZS5zaWdudXAoZW1haWwsIHBhc3N3b3JkKVxuICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGFsZXJ0KGBmYWlsZWQgdG8gc2lnbiB1cDogJHtlcnJvci5jb2RlfToke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTG9naW47XG4iLCJpbXBvcnQgQmFzZSBmcm9tICcuLi9iYXNlL2Jhc2UnO1xuaW1wb3J0IExvZ2luIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvbG9naW4vbG9naW4nO1xuXG5jbGFzcyBBdXRoIGV4dGVuZHMgQmFzZSB7XG4gICAgcmVuZGVyKCkge1xuICAgICAgICAvLyBjbGVhclxuICAgICAgICB0aGlzLmxvZ2luID0gbmV3IExvZ2luKHRoaXMuJGVsKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEF1dGg7XG4iLCJpbXBvcnQgYXV0aFNlcnZpY2UgZnJvbSAnLi4vc2VydmljZXMvYXV0aCc7XG5cbmNsYXNzIFJvdXRlciB7XG4gICAgY29uc3RydWN0b3Iodmlld3MpIHtcbiAgICAgICAgdGhpcy52aWV3cyA9IHZpZXdzO1xuICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gbnVsbDtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgICAgYXV0aFNlcnZpY2Uub24oJ2xvZ2luJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yb3V0ZSgnY2hhdCcpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhdXRoU2VydmljZS5vbignbG9nb3V0JywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yb3V0ZSgnYXV0aCcpO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgbmFtZSA9IGF1dGhTZXJ2aWNlLmdldFVzZXIoKSA/ICdjaGF0JyA6ICdhdXRoJztcblxuICAgICAgICB0aGlzLnJvdXRlKG5hbWUpO1xuICAgIH1cblxuICAgIHJvdXRlKG5hbWUpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFZpZXcpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFZpZXcuJGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdGhpcy52aWV3c1tuYW1lXTtcbiAgICAgICAgdGhpcy5jdXJyZW50Vmlldy4kZWwuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBSb3V0ZXI7XG4iLCJpbXBvcnQgQ2hhdCBmcm9tICcuL3ZpZXdzL2NoYXQvY2hhdCc7XG5pbXBvcnQgQXV0aCBmcm9tICcuL3ZpZXdzL2F1dGgvYXV0aCc7XG5pbXBvcnQgUm91dGVyIGZyb20gJy4vcm91dGVyL3JvdXRlcic7XG5pbXBvcnQgYXV0aFNlcnZpY2UgZnJvbSAnLi9zZXJ2aWNlcy9hdXRoJztcblxuaW1wb3J0ICcuLi9ub2RlX21vZHVsZXMvcHVyZWNzcy9idWlsZC9wdXJlLW1pbi5jc3MnO1xuXG5sZXQgJGxvYWRpbmcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtbG9hZGluZycpO1xubGV0ICRjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY29tcG9uZW50cycpO1xuXG4vLyB2aWV3c1xubGV0IHZpZXdzID0ge1xuICAgIGNoYXQ6IG5ldyBDaGF0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKSxcbiAgICBhdXRoOiBuZXcgQXV0aChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSksXG59O1xuXG5PYmplY3Qua2V5cyh2aWV3cykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgdmlld3Nba2V5XS4kZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAkY29udGFpbmVyLmFwcGVuZENoaWxkKHZpZXdzW2tleV0uJGVsKTtcbn0pO1xuXG4vLyByb3V0ZXJcbmxldCByb3V0ZXIgPSBuZXcgUm91dGVyKHZpZXdzKTtcblxucm91dGVyLnN0YXJ0KCk7XG5cbi8vIHJlYWR5XG4kbG9hZGluZy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuJGNvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gbnVsbDtcbiJdLCJuYW1lcyI6WyJFbWl0dGVyIiwiZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcCIsImZpcmViYXNlLmF1dGgiLCJmaXJlYmFzZS5kYXRhYmFzZSJdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsTUFBTSxJQUFJLENBQUM7SUFDUCxXQUFXLENBQUMsR0FBRyxFQUFFO1FBQ2IsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7O1FBRWYsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ2pCOztJQUVELE1BQU0sR0FBRyxFQUFFO0NBQ2Q7O0FDUkQsTUFBTSxRQUFRLENBQUM7SUFDWCxXQUFXLENBQUMsR0FBRyxFQUFFO1FBQ2IsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztLQUNsQjs7SUFFRCxPQUFPLENBQUMsSUFBSSxFQUFFO1FBQ1YsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7O1FBRWpCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNqQjs7SUFFRCxVQUFVLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtRQUN0QixPQUFPLElBQUk7YUFDTixNQUFNLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsS0FBSyxPQUFPLENBQUMsR0FBRyxDQUFDO2FBQ3ZELE1BQU0sQ0FBQztLQUNmOztJQUVELFVBQVUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO1FBQ3RCLE9BQU8sSUFBSTthQUNOLE1BQU0sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxLQUFLLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNuRTs7SUFFRCxVQUFVLENBQUMsT0FBTyxFQUFFO1FB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
