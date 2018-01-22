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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJzcmMvdmlld3MvYmFzZS9iYXNlLmpzIiwic3JjL2NvbXBvbmVudHMvbWVzc2FnZXMvbWVzc2FnZXMuanMiLCJub2RlX21vZHVsZXMvZXZlbnQtZW1pdHRlci1lczYvaW5kZXguanMiLCJzcmMvY29tcG9uZW50cy9mb3JtL2Zvcm0uanMiLCJzcmMvc2VydmljZXMvYXV0aC5qcyIsInNyYy9zZXJ2aWNlcy9tZXNzYWdlcy5qcyIsInNyYy92aWV3cy9jaGF0L2NoYXQuanMiLCJzcmMvY29tcG9uZW50cy9sb2dpbi9sb2dpbi5qcyIsInNyYy92aWV3cy9hdXRoL2F1dGguanMiLCJzcmMvcm91dGVyL3JvdXRlci5qcyIsInNyYy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEJhc2Uge1xuICAgIGNvbnN0cnVjdG9yKCRlbCkge1xuICAgICAgICB0aGlzLiRlbCA9ICRlbDtcblxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHt9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2U7XG4iLCJjbGFzcyBNZXNzYWdlcyB7XG4gICAgY29uc3RydWN0b3IoJGVsKSB7XG4gICAgICAgIHRoaXMuJGVsID0gJGVsO1xuICAgICAgICB0aGlzLmRhdGEgPSBbXTtcbiAgICB9XG5cbiAgICBzZXREYXRhKGRhdGEpIHtcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcblxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIGFkZE1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgICBpZiAoIXRoaXMuZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5kYXRhID0gW107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW1lc3NhZ2UudGltZSAmJiBtZXNzYWdlLnRpbWVzdGFtcCkge1xuICAgICAgICAgICAgbWVzc2FnZS50aW1lID0gbmV3IERhdGUobWVzc2FnZS50aW1lc3RhbXApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kYXRhLnB1c2gobWVzc2FnZSk7XG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5kYXRhKSB7XG4gICAgICAgICAgICBsZXQgaHRtbCA9IHRoaXMuZGF0YVxuICAgICAgICAgICAgICAgIC5tYXAoaXRlbSA9PiB0aGlzLnRtcGxNZXNzYWdlKGl0ZW0pKVxuICAgICAgICAgICAgICAgIC5qb2luKCdcXG4nKTtcblxuICAgICAgICAgICAgdGhpcy4kZWwuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmlubmVySFRNTCA9ICdubyBtZXNzYWdlcyc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0bXBsTWVzc2FnZSh7IG5hbWUsIG1lc3NhZ2UgfSkge1xuICAgICAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJtZXNzYWdlXCI+XG4gICAgICAgIDxzdHJvbmc+JHtuYW1lfTwvc3Ryb25nPjombmJzcDske21lc3NhZ2V9XG4gICAgICAgIDwvZGl2PmA7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNZXNzYWdlcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIERFRkFVTFRfVkFMVUVTID0ge1xuICAgIGVtaXREZWxheTogMTAsXG4gICAgc3RyaWN0TW9kZTogZmFsc2Vcbn07XG5cbi8qKlxuICogQHR5cGVkZWYge29iamVjdH0gRXZlbnRFbWl0dGVyTGlzdGVuZXJGdW5jXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IG9uY2VcbiAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb259IGZuXG4gKi9cblxuLyoqXG4gKiBAY2xhc3MgRXZlbnRFbWl0dGVyXG4gKlxuICogQHByaXZhdGVcbiAqIEBwcm9wZXJ0eSB7T2JqZWN0LjxzdHJpbmcsIEV2ZW50RW1pdHRlckxpc3RlbmVyRnVuY1tdPn0gX2xpc3RlbmVyc1xuICogQHByb3BlcnR5IHtzdHJpbmdbXX0gZXZlbnRzXG4gKi9cblxudmFyIEV2ZW50RW1pdHRlciA9IGZ1bmN0aW9uICgpIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7e319ICAgICAgW29wdHNdXG4gICAgICogQHBhcmFtIHtudW1iZXJ9ICBbb3B0cy5lbWl0RGVsYXkgPSAxMF0gLSBOdW1iZXIgaW4gbXMuIFNwZWNpZmllcyB3aGV0aGVyIGVtaXQgd2lsbCBiZSBzeW5jIG9yIGFzeW5jLiBCeSBkZWZhdWx0IC0gMTBtcy4gSWYgMCAtIGZpcmVzIHN5bmNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRzLnN0cmljdE1vZGUgPSBmYWxzZV0gLSBpcyB0cnVlLCBFbWl0dGVyIHRocm93cyBlcnJvciBvbiBlbWl0IGVycm9yIHdpdGggbm8gbGlzdGVuZXJzXG4gICAgICovXG5cbiAgICBmdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gICAgICAgIHZhciBvcHRzID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gREVGQVVMVF9WQUxVRVMgOiBhcmd1bWVudHNbMF07XG5cbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEV2ZW50RW1pdHRlcik7XG5cbiAgICAgICAgdmFyIGVtaXREZWxheSA9IHZvaWQgMCxcbiAgICAgICAgICAgIHN0cmljdE1vZGUgPSB2b2lkIDA7XG5cbiAgICAgICAgaWYgKG9wdHMuaGFzT3duUHJvcGVydHkoJ2VtaXREZWxheScpKSB7XG4gICAgICAgICAgICBlbWl0RGVsYXkgPSBvcHRzLmVtaXREZWxheTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVtaXREZWxheSA9IERFRkFVTFRfVkFMVUVTLmVtaXREZWxheTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9lbWl0RGVsYXkgPSBlbWl0RGVsYXk7XG5cbiAgICAgICAgaWYgKG9wdHMuaGFzT3duUHJvcGVydHkoJ3N0cmljdE1vZGUnKSkge1xuICAgICAgICAgICAgc3RyaWN0TW9kZSA9IG9wdHMuc3RyaWN0TW9kZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0cmljdE1vZGUgPSBERUZBVUxUX1ZBTFVFUy5zdHJpY3RNb2RlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3N0cmljdE1vZGUgPSBzdHJpY3RNb2RlO1xuXG4gICAgICAgIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xuICAgICAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb25jZSA9IGZhbHNlXVxuICAgICAqL1xuXG5cbiAgICBfY3JlYXRlQ2xhc3MoRXZlbnRFbWl0dGVyLCBbe1xuICAgICAgICBrZXk6ICdfYWRkTGlzdGVubmVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9hZGRMaXN0ZW5uZXIodHlwZSwgbGlzdGVuZXIsIG9uY2UpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5ldmVudHMuaW5kZXhPZih0eXBlKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnNbdHlwZV0gPSBbe1xuICAgICAgICAgICAgICAgICAgICBvbmNlOiBvbmNlLFxuICAgICAgICAgICAgICAgICAgICBmbjogbGlzdGVuZXJcbiAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50cy5wdXNoKHR5cGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnNbdHlwZV0ucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG9uY2U6IG9uY2UsXG4gICAgICAgICAgICAgICAgICAgIGZuOiBsaXN0ZW5lclxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN1YnNjcmliZXMgb24gZXZlbnQgdHlwZSBzcGVjaWZpZWQgZnVuY3Rpb25cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gbGlzdGVuZXJcbiAgICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29uJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9hZGRMaXN0ZW5uZXIodHlwZSwgbGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdWJzY3JpYmVzIG9uIGV2ZW50IHR5cGUgc3BlY2lmaWVkIGZ1bmN0aW9uIHRvIGZpcmUgb25seSBvbmNlXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyXG4gICAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvbmNlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uY2UodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZExpc3Rlbm5lcih0eXBlLCBsaXN0ZW5lciwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlcyBldmVudCB3aXRoIHNwZWNpZmllZCB0eXBlLiBJZiBzcGVjaWZpZWQgbGlzdGVuZXJGdW5jIC0gZGVsZXRlcyBvbmx5IG9uZSBsaXN0ZW5lciBvZiBzcGVjaWZpZWQgdHlwZVxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IFtsaXN0ZW5lckZ1bmNdXG4gICAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvZmYnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb2ZmKGV2ZW50VHlwZSwgbGlzdGVuZXJGdW5jKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgdHlwZUluZGV4ID0gdGhpcy5ldmVudHMuaW5kZXhPZihldmVudFR5cGUpO1xuICAgICAgICAgICAgdmFyIGhhc1R5cGUgPSBldmVudFR5cGUgJiYgdHlwZUluZGV4ICE9PSAtMTtcblxuICAgICAgICAgICAgaWYgKGhhc1R5cGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxpc3RlbmVyRnVuYykge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fbGlzdGVuZXJzW2V2ZW50VHlwZV07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRzLnNwbGljZSh0eXBlSW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVtb3ZlZEV2ZW50cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHR5cGVMaXN0ZW5lcnMgPSBfdGhpcy5fbGlzdGVuZXJzW2V2ZW50VHlwZV07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVMaXN0ZW5lcnMuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIHtFdmVudEVtaXR0ZXJMaXN0ZW5lckZ1bmN9IGZuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gaWR4XG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChmbiwgaWR4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZuLmZuID09PSBsaXN0ZW5lckZ1bmMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZEV2ZW50cy51bnNoaWZ0KGlkeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZWRFdmVudHMuZm9yRWFjaChmdW5jdGlvbiAoaWR4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZUxpc3RlbmVycy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXR5cGVMaXN0ZW5lcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuZXZlbnRzLnNwbGljZSh0eXBlSW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBfdGhpcy5fbGlzdGVuZXJzW2V2ZW50VHlwZV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFwcGxpZXMgYXJndW1lbnRzIHRvIHNwZWNpZmllZCBldmVudCB0eXBlXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGVcbiAgICAgICAgICogQHBhcmFtIHsqW119IGV2ZW50QXJndW1lbnRzXG4gICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ19hcHBseUV2ZW50cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBfYXBwbHlFdmVudHMoZXZlbnRUeXBlLCBldmVudEFyZ3VtZW50cykge1xuICAgICAgICAgICAgdmFyIHR5cGVMaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnNbZXZlbnRUeXBlXTtcblxuICAgICAgICAgICAgaWYgKCF0eXBlTGlzdGVuZXJzIHx8ICF0eXBlTGlzdGVuZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9zdHJpY3RNb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93ICdObyBsaXN0ZW5lcnMgc3BlY2lmaWVkIGZvciBldmVudDogJyArIGV2ZW50VHlwZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcmVtb3ZhYmxlTGlzdGVuZXJzID0gW107XG4gICAgICAgICAgICB0eXBlTGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGVlTGlzdGVuZXIsIGlkeCkge1xuICAgICAgICAgICAgICAgIGVlTGlzdGVuZXIuZm4uYXBwbHkobnVsbCwgZXZlbnRBcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIGlmIChlZUxpc3RlbmVyLm9uY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZhYmxlTGlzdGVuZXJzLnVuc2hpZnQoaWR4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmVtb3ZhYmxlTGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGlkeCkge1xuICAgICAgICAgICAgICAgIHR5cGVMaXN0ZW5lcnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFbWl0cyBldmVudCB3aXRoIHNwZWNpZmllZCB0eXBlIGFuZCBwYXJhbXMuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAgICAgICAqIEBwYXJhbSBldmVudEFyZ3NcbiAgICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2VtaXQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZW1pdCh0eXBlKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGV2ZW50QXJncyA9IEFycmF5KF9sZW4gPiAxID8gX2xlbiAtIDEgOiAwKSwgX2tleSA9IDE7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgICAgICAgICBldmVudEFyZ3NbX2tleSAtIDFdID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5fZW1pdERlbGF5KSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5fYXBwbHlFdmVudHMuY2FsbChfdGhpczIsIHR5cGUsIGV2ZW50QXJncyk7XG4gICAgICAgICAgICAgICAgfSwgdGhpcy5fZW1pdERlbGF5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYXBwbHlFdmVudHModHlwZSwgZXZlbnRBcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFbWl0cyBldmVudCB3aXRoIHNwZWNpZmllZCB0eXBlIGFuZCBwYXJhbXMgc3luY2hyb25vdXNseS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAgICAgICAgICogQHBhcmFtIGV2ZW50QXJnc1xuICAgICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZW1pdFN5bmMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZW1pdFN5bmModHlwZSkge1xuICAgICAgICAgICAgZm9yICh2YXIgX2xlbjIgPSBhcmd1bWVudHMubGVuZ3RoLCBldmVudEFyZ3MgPSBBcnJheShfbGVuMiA+IDEgPyBfbGVuMiAtIDEgOiAwKSwgX2tleTIgPSAxOyBfa2V5MiA8IF9sZW4yOyBfa2V5MisrKSB7XG4gICAgICAgICAgICAgICAgZXZlbnRBcmdzW19rZXkyIC0gMV0gPSBhcmd1bWVudHNbX2tleTJdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9hcHBseUV2ZW50cyh0eXBlLCBldmVudEFyZ3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlc3Ryb3lzIEV2ZW50RW1pdHRlclxuICAgICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGVzdHJveScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0ge307XG4gICAgICAgICAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEV2ZW50RW1pdHRlcjtcbn0oKTtcblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG4iLCJpbXBvcnQgRW1pdHRlciBmcm9tICdldmVudC1lbWl0dGVyLWVzNic7XG5cbmNsYXNzIEZvcm0gZXh0ZW5kcyBFbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvcigkZWwpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLiRlbCA9ICRlbDtcblxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdGhpcy4kZWwuaW5uZXJIVE1MID0gYDxmb3JtIGNsYXNzPVwiY29tcG9zZSBqcy1mb3JtXCIgYWN0aW9uPVwiI1wiPlxuICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImNvbXBvc2UtaW5wdXQganMtaW5wdXRcIiBuYW1lPVwibWVzc2FnZVwiIGF1dG9jb21wbGV0ZT1cIm9mZlwiLz5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG5cIj5TZW5kPC9idXR0b24+XG4gICAgICAgIDwvZm9ybT5gO1xuXG4gICAgICAgIHRoaXMuaW5pdEV2ZW50cygpO1xuICAgIH1cblxuICAgIGluaXRFdmVudHMoKSB7XG4gICAgICAgIHRoaXMuJGZvcm0gPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcuanMtZm9ybScpO1xuICAgICAgICB0aGlzLiRpbnB1dCA9IHRoaXMuJGZvcm0ucXVlcnlTZWxlY3RvcignLmpzLWlucHV0Jyk7XG5cbiAgICAgICAgdGhpcy4kZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCB0aGlzLm9uU3VibWl0LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIG9uU3VibWl0KGV2ZW50KSB7XG4gICAgICAgIGxldCBtZXNzYWdlID0gdGhpcy4kaW5wdXQudmFsdWUudHJpbSgpO1xuXG4gICAgICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ3NlbmQnLCB7IG1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB0aGlzLiRpbnB1dC52YWx1ZSA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZvcm07XG4iLCIvLyBUT0RPOiBidW5kbGVcbmltcG9ydCBFbWl0dGVyIGZyb20gJ2V2ZW50LWVtaXR0ZXItZXM2JztcbmltcG9ydCAqIGFzIGZpcmViYXNlIGZyb20gJ2ZpcmViYXNlJztcblxuY29uc3QgY29uZmlnID0ge1xuICAgIGFwaUtleTogJ0FJemFTeUJOX3dwNkR0ZFNQU2hVcUNiMnlLY2VBcm9tUVZvRWFGUScsXG4gICAgYXV0aERvbWFpbjogJ21pbmljaGF0LTk1OGZkLmZpcmViYXNlYXBwLmNvbScsXG4gICAgZGF0YWJhc2VVUkw6ICdodHRwczovL21pbmljaGF0LTk1OGZkLmZpcmViYXNlaW8uY29tJyxcbiAgICBwcm9qZWN0SWQ6ICdtaW5pY2hhdC05NThmZCcsXG4gICAgc3RvcmFnZUJ1Y2tldDogJ21pbmljaGF0LTk1OGZkLmFwcHNwb3QuY29tJyxcbiAgICBtZXNzYWdpbmdTZW5kZXJJZDogJzM3OTY3ODIwMzgwMycsXG59O1xuXG4vKipcbiAqIFNpbmdsZXRvbiBhdXRoIHNlcnZpY2VcbiAqL1xuY2xhc3MgQXV0aFNlcnZpY2UgZXh0ZW5kcyBFbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLmFwcCA9IGZpcmViYXNlLmluaXRpYWxpemVBcHAoY29uZmlnKTtcbiAgICAgICAgdGhpcy5hdXRoID0gZmlyZWJhc2UuYXV0aCgpO1xuXG4gICAgICAgIHRoaXMuYXV0aC5vbkF1dGhTdGF0ZUNoYW5nZWQodGhpcy5vbkF1dGhTdGF0ZUNoYW5nZWQuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgZ2V0VXNlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aC5jdXJyZW50VXNlcjtcbiAgICB9XG5cbiAgICBsb2dpbihlbWFpbCwgcGFzc3dvcmQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aC5zaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZChlbWFpbCwgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIHNpZ251cChlbWFpbCwgcGFzc3dvcmQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aC5jcmVhdGVVc2VyV2l0aEVtYWlsQW5kUGFzc3dvcmQoZW1haWwsIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICBvbkF1dGhTdGF0ZUNoYW5nZWQodXNlcikge1xuICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdsb2dpbicsIHVzZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdsb2dvdXQnKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IEF1dGhTZXJ2aWNlKCk7XG4iLCJpbXBvcnQgRW1pdHRlciBmcm9tICdldmVudC1lbWl0dGVyLWVzNic7XG5pbXBvcnQgKiBhcyBmaXJlYmFzZSBmcm9tICdmaXJlYmFzZSc7XG5pbXBvcnQgYXV0aFNlcnZpY2UgZnJvbSAnLi4vc2VydmljZXMvYXV0aCc7XG5cbmNsYXNzIE1lc3NhZ2VzU2VydmljZSBleHRlbmRzIEVtaXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuZGF0YWJhc2UgPSBmaXJlYmFzZS5kYXRhYmFzZSgpO1xuICAgICAgICB0aGlzLm1lc3NhZ2VzUmVmID0gdGhpcy5kYXRhYmFzZS5yZWYoJ21lc3NhZ2VzJyk7XG4gICAgICAgIHRoaXMubWVzc2FnZXNSZWYub2ZmKCk7XG5cbiAgICAgICAgdGhpcy5tZXNzYWdlc1JlZi5saW1pdFRvTGFzdCgxMDApLm9uKCdjaGlsZF9hZGRlZCcsIHRoaXMub25NZXNzYWdlLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm1lc3NhZ2VzUmVmLmxpbWl0VG9MYXN0KDEwMCkub24oJ2NoaWxkX2NoYW5nZWQnLCB0aGlzLm9uTWVzc2FnZS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBhZGRNZXNzYWdlKHsgbWVzc2FnZSB9KSB7XG4gICAgICAgIGxldCB1c2VyID0gYXV0aFNlcnZpY2UuZ2V0VXNlcigpO1xuXG4gICAgICAgIGlmICh1c2VyKSB7IFxuICAgICAgICAgICAgbGV0IGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgbmFtZTogdXNlci5kaXNwbGF5TmFtZSB8fCB1c2VyLmVtYWlsLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBmaXJlYmFzZS5kYXRhYmFzZS5TZXJ2ZXJWYWx1ZS5USU1FU1RBTVBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZXNSZWYucHVzaChkYXRhKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHt9KVxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3B1c2ggZXJyb3InLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gICBcbiAgICB9XG5cbiAgICBvbk1lc3NhZ2UoZGF0YSkge1xuICAgICAgICB0aGlzLmVtaXQoJ21lc3NhZ2UnLCBkYXRhLnZhbCgpKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBNZXNzYWdlc1NlcnZpY2UoKTsiLCJpbXBvcnQgQmFzZSBmcm9tICcuLi9iYXNlL2Jhc2UnO1xuaW1wb3J0IE1lc3NhZ2VzIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvbWVzc2FnZXMvbWVzc2FnZXMnO1xuaW1wb3J0IEZvcm0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9mb3JtL2Zvcm0nO1xuaW1wb3J0IG1lc3NhZ2VzU2VydmljZSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9tZXNzYWdlcyc7XG5cbmNsYXNzIENoYXQgZXh0ZW5kcyBCYXNlIHtcbiAgICBjb25zdHJ1Y3RvcigkZWwpIHtcbiAgICAgICAgc3VwZXIoJGVsKTtcblxuICAgICAgICBtZXNzYWdlc1NlcnZpY2Uub24oJ21lc3NhZ2UnLCB0aGlzLm9uTWVzc2FnZS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIC8vIGNsZWFyXG4gICAgICAgIHRoaXMuJGVsLmlubmVySFRNTCA9ICcnO1xuXG4gICAgICAgIC8vIG1lc3NhZ2VzXG4gICAgICAgIGxldCAkbWVzc2FnZXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgJG1lc3NhZ2VzLmNsYXNzTmFtZSA9ICdtZXNzYWdlcyc7XG4gICAgICAgIHRoaXMuJGVsLmFwcGVuZENoaWxkKCRtZXNzYWdlcyk7XG5cbiAgICAgICAgdGhpcy5tZXNzYWdlcyA9IG5ldyBNZXNzYWdlcygkbWVzc2FnZXMpO1xuXG4gICAgICAgIC8vIGNvbXBvc2VcbiAgICAgICAgbGV0ICRmb3JtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRoaXMuJGVsLmFwcGVuZENoaWxkKCRmb3JtKTtcblxuICAgICAgICB0aGlzLmNvbXBvc2UgPSBuZXcgRm9ybSgkZm9ybSk7XG4gICAgICAgIHRoaXMuY29tcG9zZS5vbignc2VuZCcsIHRoaXMub25TZW5kLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIG9uU2VuZChtZXNzYWdlKSB7XG4gICAgICAgIG1lc3NhZ2VzU2VydmljZS5hZGRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIG9uTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICAgIHRoaXMubWVzc2FnZXMuYWRkTWVzc2FnZShtZXNzYWdlKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENoYXQ7XG4iLCJpbXBvcnQgYXV0aFNlcnZpY2UgZnJvbSAnLi4vLi4vc2VydmljZXMvYXV0aCc7XG5cbmNsYXNzIExvZ2luIHtcbiAgICBjb25zdHJ1Y3RvcigkZWwpIHtcbiAgICAgICAgdGhpcy4kZWwgPSAkZWw7XG5cbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHRoaXMuJGVsLmlubmVySFRNTCA9IGA8Zm9ybSBhY3Rpb249XCIjXCI+XG4gICAgICAgIDxkaXY+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cImVtYWlsXCIvPjwvZGl2PlxuICAgICAgICA8ZGl2PjxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBuYW1lPVwicGFzc3dvcmRcIi8+PC9kaXY+XG4gICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bl9tYWluXCI+TG9nIGluPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJqcy1zaWdudXBcIj5TaWduIHVwPC9idXR0b24+YDtcblxuICAgICAgICB0aGlzLmluaXRFdmVudHMoKTtcbiAgICB9XG5cbiAgICBpbml0RXZlbnRzKCkge1xuICAgICAgICB0aGlzLiRmb3JtID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignZm9ybScpO1xuICAgICAgICB0aGlzLiRlbWFpbCA9IHRoaXMuJGZvcm0ucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImVtYWlsXCJdJyk7XG4gICAgICAgIHRoaXMuJHBhc3N3b3JkID0gdGhpcy4kZm9ybS5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwicGFzc3dvcmRcIl0nKTtcbiAgICAgICAgdGhpcy4kc2lnbnVwID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmpzLXNpZ251cCcpO1xuXG4gICAgICAgIHRoaXMuJGZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgdGhpcy5vblN1Ym1pdC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy4kc2lnbnVwLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vblNpZ251cC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBvblN1Ym1pdChldmVudCkge1xuICAgICAgICBsZXQgZW1haWwgPSB0aGlzLiRlbWFpbC52YWx1ZTtcbiAgICAgICAgbGV0IHBhc3N3b3JkID0gdGhpcy4kcGFzc3dvcmQudmFsdWU7XG5cbiAgICAgICAgYXV0aFNlcnZpY2UubG9naW4oZW1haWwsIHBhc3N3b3JkKVxuICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGFsZXJ0KGBmYWlsZWQgdG8gc2lnbiB1cDogJHtlcnJvci5jb2RlfToke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIG9uU2lnbnVwKGV2ZW50KSB7XG4gICAgICAgIGxldCBlbWFpbCA9IHRoaXMuJGVtYWlsLnZhbHVlO1xuICAgICAgICBsZXQgcGFzc3dvcmQgPSB0aGlzLiRwYXNzd29yZC52YWx1ZTtcblxuICAgICAgICBhdXRoU2VydmljZS5zaWdudXAoZW1haWwsIHBhc3N3b3JkKVxuICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGFsZXJ0KGBmYWlsZWQgdG8gc2lnbiB1cDogJHtlcnJvci5jb2RlfToke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTG9naW47XG4iLCJpbXBvcnQgQmFzZSBmcm9tICcuLi9iYXNlL2Jhc2UnO1xuaW1wb3J0IExvZ2luIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvbG9naW4vbG9naW4nO1xuXG5jbGFzcyBBdXRoIGV4dGVuZHMgQmFzZSB7XG4gICAgcmVuZGVyKCkge1xuICAgICAgICAvLyBjbGVhclxuICAgICAgICB0aGlzLmxvZ2luID0gbmV3IExvZ2luKHRoaXMuJGVsKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEF1dGg7XG4iLCJpbXBvcnQgYXV0aFNlcnZpY2UgZnJvbSAnLi4vc2VydmljZXMvYXV0aCc7XG5cbmNsYXNzIFJvdXRlciB7XG4gICAgY29uc3RydWN0b3Iodmlld3MpIHtcbiAgICAgICAgdGhpcy52aWV3cyA9IHZpZXdzO1xuICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gbnVsbDtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgICAgYXV0aFNlcnZpY2Uub24oJ2xvZ2luJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yb3V0ZSgnY2hhdCcpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhdXRoU2VydmljZS5vbignbG9nb3V0JywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yb3V0ZSgnYXV0aCcpO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgbmFtZSA9IGF1dGhTZXJ2aWNlLmdldFVzZXIoKSA/ICdjaGF0JyA6ICdhdXRoJztcblxuICAgICAgICB0aGlzLnJvdXRlKG5hbWUpO1xuICAgIH1cblxuICAgIHJvdXRlKG5hbWUpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFZpZXcpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFZpZXcuJGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdGhpcy52aWV3c1tuYW1lXTtcbiAgICAgICAgdGhpcy5jdXJyZW50Vmlldy4kZWwuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBSb3V0ZXI7XG4iLCJpbXBvcnQgQ2hhdCBmcm9tICcuL3ZpZXdzL2NoYXQvY2hhdCc7XG5pbXBvcnQgQXV0aCBmcm9tICcuL3ZpZXdzL2F1dGgvYXV0aCc7XG5pbXBvcnQgUm91dGVyIGZyb20gJy4vcm91dGVyL3JvdXRlcic7XG5pbXBvcnQgYXV0aFNlcnZpY2UgZnJvbSAnLi9zZXJ2aWNlcy9hdXRoJztcblxubGV0ICRsb2FkaW5nID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWxvYWRpbmcnKTtcbmxldCAkY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNvbXBvbmVudHMnKTtcblxuLy8gdmlld3NcbmxldCB2aWV3cyA9IHtcbiAgICBjaGF0OiBuZXcgQ2hhdChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSksXG4gICAgYXV0aDogbmV3IEF1dGgoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpLFxufTtcblxuT2JqZWN0LmtleXModmlld3MpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIHZpZXdzW2tleV0uJGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgJGNvbnRhaW5lci5hcHBlbmRDaGlsZCh2aWV3c1trZXldLiRlbCk7XG59KTtcblxuLy8gcm91dGVyXG5sZXQgcm91dGVyID0gbmV3IFJvdXRlcih2aWV3cyk7XG5cbnJvdXRlci5zdGFydCgpO1xuXG4vLyByZWFkeVxuJGxvYWRpbmcuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiRjb250YWluZXIuc3R5bGUuZGlzcGxheSA9IG51bGw7XG4iXSwibmFtZXMiOlsiRW1pdHRlciIsImZpcmViYXNlLmluaXRpYWxpemVBcHAiLCJmaXJlYmFzZS5hdXRoIiwiZmlyZWJhc2UuZGF0YWJhc2UiXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQU0sSUFBSSxDQUFDO0lBQ1AsV0FBVyxDQUFDLEdBQUcsRUFBRTtRQUNiLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDOztRQUVmLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNqQjs7SUFFRCxNQUFNLEdBQUcsRUFBRTtDQUNkOztBQ1JELE1BQU0sUUFBUSxDQUFDO0lBQ1gsV0FBVyxDQUFDLEdBQUcsRUFBRTtRQUNiLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7S0FDbEI7O0lBRUQsT0FBTyxDQUFDLElBQUksRUFBRTtRQUNWLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDOztRQUVqQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDakI7O0lBRUQsVUFBVSxDQUFDLE9BQU8sRUFBRTtRQUNoQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNaLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1NBQ2xCOztRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7WUFDcEMsT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDOUM7O1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ2pCOztJQUVELE1BQU0sR0FBRztRQUNMLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUNYLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJO2lCQUNmLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJ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
