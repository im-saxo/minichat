(function (firebase) {
'use strict';

class Base {
    constructor($el) {
        this.$el = $el;

        this.render();
    }

    render() {}
}

/*!
 * escape-html
 * Copyright(c) 2012-2013 TJ Holowaychuk
 * Copyright(c) 2015 Andreas Lubbe
 * Copyright(c) 2015 Tiancheng "Timothy" Gu
 * MIT Licensed
 */

/**
 * Module variables.
 * @private
 */

var matchHtmlRegExp = /["'&<>]/;

/**
 * Module exports.
 * @public
 */

var escapeHtml_1 = escapeHtml;

/**
 * Escape special characters in the given string of html.
 *
 * @param  {string} string The string to escape for inserting into HTML
 * @return {string}
 * @public
 */

function escapeHtml(string) {
  var str = '' + string;
  var match = matchHtmlRegExp.exec(str);

  if (!match) {
    return str;
  }

  var escape;
  var html = '';
  var index = 0;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = '&quot;';
        break;
      case 38: // &
        escape = '&amp;';
        break;
      case 39: // '
        escape = '&#39;';
        break;
      case 60: // <
        escape = '&lt;';
        break;
      case 62: // >
        escape = '&gt;';
        break;
      default:
        continue;
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index
    ? html + str.substring(lastIndex, index)
    : html;
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
        <strong>${escapeHtml_1(name)}</strong>:&nbsp;${escapeHtml_1(message)}
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

    logout() {
        return this.auth.signOut();
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

class Menu {
    constructor($el) {
        this.$el = $el;

        this.render();

        authService.on('login', this.updateHeader.bind(this));
    }

    render() {
        this.$el.innerHTML = `<div class="pure-menu pure-menu-horizontal menu">
            <span class="pure-menu-heading js-header">Chat</span>
            <ul class="pure-menu-list">
                <li class="pure-menu-item"><a href="#" class="pure-menu-link js-logout">Logout</a></li>
            </ul>
        </div>`;

        this.initEvents();
    }

    updateHeader() {
        const user = authService.getUser();
        const text = user ? user.displayName || user.email : 'chat';

        if (this.$header) {
            this.$header.textContent = text;
        }
    }

    initEvents() {
        this.$logout = this.$el.querySelector('.js-logout');
        this.$logout.addEventListener('click', this.onLogout.bind(this));

        this.$header = this.$el.querySelector('.js-header');
        this.updateHeader();
    }

    onLogout(event) {
        authService.logout()
            .catch((error) => {
                console.log(`failed to logout: ${error.code}:${error.message}`);
            });

        event.preventDefault();
    }
}

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
                .catch(() => {
                    // console.log('push error', error);
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

        // menu
        let $menu = this.addContainer();

        this.menu = new Menu($menu);

        // messages
        let $messages = this.addContainer('messages');

        this.messages = new Messages($messages);

        // compose
        let $form = this.addContainer();

        this.compose = new Form($form);
        this.compose.on('send', this.onSend.bind(this));
    }

    addContainer(classes) {
        let $element = document.createElement('div');

        if (classes) {
            $element.className = classes;
        }

        this.$el.appendChild($element);

        return $element;
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
        this.$el.innerHTML = `<form class="pure-form" action="#">
        <div><input type="text" name="email"/></div>
        <div><input type="password" name="password"/></div>
        <button type="submit" class="pure-button pure-button-primary btn btn_main">Log in</button>
        <button class="pure-button js-signup">Sign up</button>`;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJzcmMvdmlld3MvYmFzZS9iYXNlLmpzIiwibm9kZV9tb2R1bGVzL2VzY2FwZS1odG1sL2luZGV4LmpzIiwic3JjL2NvbXBvbmVudHMvbWVzc2FnZXMvbWVzc2FnZXMuanMiLCJub2RlX21vZHVsZXMvZXZlbnQtZW1pdHRlci1lczYvaW5kZXguanMiLCJzcmMvY29tcG9uZW50cy9mb3JtL2Zvcm0uanMiLCJzcmMvc2VydmljZXMvYXV0aC5qcyIsInNyYy9jb21wb25lbnRzL21lbnUvbWVudS5qcyIsInNyYy91dGlscy91aWQuanMiLCJzcmMvc2VydmljZXMvbWVzc2FnZXMuanMiLCJzcmMvdmlld3MvY2hhdC9jaGF0LmpzIiwic3JjL2NvbXBvbmVudHMvbG9naW4vbG9naW4uanMiLCJzcmMvdmlld3MvYXV0aC9hdXRoLmpzIiwic3JjL3JvdXRlci9yb3V0ZXIuanMiLCJzcmMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBCYXNlIHtcbiAgICBjb25zdHJ1Y3RvcigkZWwpIHtcbiAgICAgICAgdGhpcy4kZWwgPSAkZWw7XG5cbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7fVxufVxuXG5leHBvcnQgZGVmYXVsdCBCYXNlO1xuIiwiLyohXG4gKiBlc2NhcGUtaHRtbFxuICogQ29weXJpZ2h0KGMpIDIwMTItMjAxMyBUSiBIb2xvd2F5Y2h1a1xuICogQ29weXJpZ2h0KGMpIDIwMTUgQW5kcmVhcyBMdWJiZVxuICogQ29weXJpZ2h0KGMpIDIwMTUgVGlhbmNoZW5nIFwiVGltb3RoeVwiIEd1XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTW9kdWxlIHZhcmlhYmxlcy5cbiAqIEBwcml2YXRlXG4gKi9cblxudmFyIG1hdGNoSHRtbFJlZ0V4cCA9IC9bXCInJjw+XS87XG5cbi8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKiBAcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBlc2NhcGVIdG1sO1xuXG4vKipcbiAqIEVzY2FwZSBzcGVjaWFsIGNoYXJhY3RlcnMgaW4gdGhlIGdpdmVuIHN0cmluZyBvZiBodG1sLlxuICpcbiAqIEBwYXJhbSAge3N0cmluZ30gc3RyaW5nIFRoZSBzdHJpbmcgdG8gZXNjYXBlIGZvciBpbnNlcnRpbmcgaW50byBIVE1MXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKiBAcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZXNjYXBlSHRtbChzdHJpbmcpIHtcbiAgdmFyIHN0ciA9ICcnICsgc3RyaW5nO1xuICB2YXIgbWF0Y2ggPSBtYXRjaEh0bWxSZWdFeHAuZXhlYyhzdHIpO1xuXG4gIGlmICghbWF0Y2gpIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG5cbiAgdmFyIGVzY2FwZTtcbiAgdmFyIGh0bWwgPSAnJztcbiAgdmFyIGluZGV4ID0gMDtcbiAgdmFyIGxhc3RJbmRleCA9IDA7XG5cbiAgZm9yIChpbmRleCA9IG1hdGNoLmluZGV4OyBpbmRleCA8IHN0ci5sZW5ndGg7IGluZGV4KyspIHtcbiAgICBzd2l0Y2ggKHN0ci5jaGFyQ29kZUF0KGluZGV4KSkge1xuICAgICAgY2FzZSAzNDogLy8gXCJcbiAgICAgICAgZXNjYXBlID0gJyZxdW90Oyc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzODogLy8gJlxuICAgICAgICBlc2NhcGUgPSAnJmFtcDsnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzk6IC8vICdcbiAgICAgICAgZXNjYXBlID0gJyYjMzk7JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDYwOiAvLyA8XG4gICAgICAgIGVzY2FwZSA9ICcmbHQ7JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDYyOiAvLyA+XG4gICAgICAgIGVzY2FwZSA9ICcmZ3Q7JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAobGFzdEluZGV4ICE9PSBpbmRleCkge1xuICAgICAgaHRtbCArPSBzdHIuc3Vic3RyaW5nKGxhc3RJbmRleCwgaW5kZXgpO1xuICAgIH1cblxuICAgIGxhc3RJbmRleCA9IGluZGV4ICsgMTtcbiAgICBodG1sICs9IGVzY2FwZTtcbiAgfVxuXG4gIHJldHVybiBsYXN0SW5kZXggIT09IGluZGV4XG4gICAgPyBodG1sICsgc3RyLnN1YnN0cmluZyhsYXN0SW5kZXgsIGluZGV4KVxuICAgIDogaHRtbDtcbn1cbiIsImltcG9ydCBlc2NhcGVIdG1sIGZyb20gJ2VzY2FwZS1odG1sJztcblxuY2xhc3MgTWVzc2FnZXMge1xuICAgIGNvbnN0cnVjdG9yKCRlbCkge1xuICAgICAgICB0aGlzLiRlbCA9ICRlbDtcbiAgICAgICAgdGhpcy5kYXRhID0gW107XG4gICAgfVxuXG4gICAgc2V0RGF0YShkYXRhKSB7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG5cbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICBoYXNNZXNzYWdlKGRhdGEsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIGRhdGFcbiAgICAgICAgICAgIC5maWx0ZXIoaXRlbSA9PiBtZXNzYWdlLnVpZCAmJiBpdGVtLnVpZCA9PT0gbWVzc2FnZS51aWQpXG4gICAgICAgICAgICAubGVuZ3RoO1xuICAgIH1cblxuICAgIGdldE1lc3NhZ2UoZGF0YSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gZGF0YVxuICAgICAgICAgICAgLmZpbHRlcihpdGVtID0+IG1lc3NhZ2UudWlkICYmIGl0ZW0udWlkID09PSBtZXNzYWdlLnVpZClbMF07XG4gICAgfVxuXG4gICAgYWRkTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICAgIGlmICghdGhpcy5kYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmhhc01lc3NhZ2UodGhpcy5kYXRhLCBtZXNzYWdlKSkge1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdNZXNzYWdlID0gdGhpcy5nZXRNZXNzYWdlKHRoaXMuZGF0YSwgbWVzc2FnZSk7XG5cbiAgICAgICAgICAgIC8vIFRPRE86IGlmKCFkZWVwRXF1YWwpXG4gICAgICAgICAgICAvLyBVcGRhdGUgZXhpc3RpbmcgbWVzc2FnZVxuICAgICAgICAgICAgT2JqZWN0LmV4dGVuZChleGlzdGluZ01lc3NhZ2UsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICghbWVzc2FnZS50aW1lICYmIG1lc3NhZ2UudGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihtZXNzYWdlLCB7IHRpbWU6IG5ldyBEYXRlKG1lc3NhZ2UudGltZXN0YW1wKSB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5kYXRhLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5kYXRhKSB7XG4gICAgICAgICAgICBsZXQgaHRtbCA9IHRoaXMuZGF0YVxuICAgICAgICAgICAgICAgIC5tYXAoaXRlbSA9PiB0aGlzLnRtcGxNZXNzYWdlKGl0ZW0pKVxuICAgICAgICAgICAgICAgIC5qb2luKCdcXG4nKTtcblxuICAgICAgICAgICAgdGhpcy4kZWwuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmlubmVySFRNTCA9ICdubyBtZXNzYWdlcyc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0bXBsTWVzc2FnZSh7IG5hbWUsIG1lc3NhZ2UgfSkge1xuICAgICAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJtZXNzYWdlXCI+XG4gICAgICAgIDxzdHJvbmc+JHtlc2NhcGVIdG1sKG5hbWUpfTwvc3Ryb25nPjombmJzcDske2VzY2FwZUh0bWwobWVzc2FnZSl9XG4gICAgICAgIDwvZGl2PmA7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNZXNzYWdlcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIERFRkFVTFRfVkFMVUVTID0ge1xuICAgIGVtaXREZWxheTogMTAsXG4gICAgc3RyaWN0TW9kZTogZmFsc2Vcbn07XG5cbi8qKlxuICogQHR5cGVkZWYge29iamVjdH0gRXZlbnRFbWl0dGVyTGlzdGVuZXJGdW5jXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IG9uY2VcbiAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb259IGZuXG4gKi9cblxuLyoqXG4gKiBAY2xhc3MgRXZlbnRFbWl0dGVyXG4gKlxuICogQHByaXZhdGVcbiAqIEBwcm9wZXJ0eSB7T2JqZWN0LjxzdHJpbmcsIEV2ZW50RW1pdHRlckxpc3RlbmVyRnVuY1tdPn0gX2xpc3RlbmVyc1xuICogQHByb3BlcnR5IHtzdHJpbmdbXX0gZXZlbnRzXG4gKi9cblxudmFyIEV2ZW50RW1pdHRlciA9IGZ1bmN0aW9uICgpIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7e319ICAgICAgW29wdHNdXG4gICAgICogQHBhcmFtIHtudW1iZXJ9ICBbb3B0cy5lbWl0RGVsYXkgPSAxMF0gLSBOdW1iZXIgaW4gbXMuIFNwZWNpZmllcyB3aGV0aGVyIGVtaXQgd2lsbCBiZSBzeW5jIG9yIGFzeW5jLiBCeSBkZWZhdWx0IC0gMTBtcy4gSWYgMCAtIGZpcmVzIHN5bmNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRzLnN0cmljdE1vZGUgPSBmYWxzZV0gLSBpcyB0cnVlLCBFbWl0dGVyIHRocm93cyBlcnJvciBvbiBlbWl0IGVycm9yIHdpdGggbm8gbGlzdGVuZXJzXG4gICAgICovXG5cbiAgICBmdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gICAgICAgIHZhciBvcHRzID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gREVGQVVMVF9WQUxVRVMgOiBhcmd1bWVudHNbMF07XG5cbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEV2ZW50RW1pdHRlcik7XG5cbiAgICAgICAgdmFyIGVtaXREZWxheSA9IHZvaWQgMCxcbiAgICAgICAgICAgIHN0cmljdE1vZGUgPSB2b2lkIDA7XG5cbiAgICAgICAgaWYgKG9wdHMuaGFzT3duUHJvcGVydHkoJ2VtaXREZWxheScpKSB7XG4gICAgICAgICAgICBlbWl0RGVsYXkgPSBvcHRzLmVtaXREZWxheTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVtaXREZWxheSA9IERFRkFVTFRfVkFMVUVTLmVtaXREZWxheTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9lbWl0RGVsYXkgPSBlbWl0RGVsYXk7XG5cbiAgICAgICAgaWYgKG9wdHMuaGFzT3duUHJvcGVydHkoJ3N0cmljdE1vZGUnKSkge1xuICAgICAgICAgICAgc3RyaWN0TW9kZSA9IG9wdHMuc3RyaWN0TW9kZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0cmljdE1vZGUgPSBERUZBVUxUX1ZBTFVFUy5zdHJpY3RNb2RlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3N0cmljdE1vZGUgPSBzdHJpY3RNb2RlO1xuXG4gICAgICAgIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xuICAgICAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb25jZSA9IGZhbHNlXVxuICAgICAqL1xuXG5cbiAgICBfY3JlYXRlQ2xhc3MoRXZlbnRFbWl0dGVyLCBbe1xuICAgICAgICBrZXk6ICdfYWRkTGlzdGVubmVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9hZGRMaXN0ZW5uZXIodHlwZSwgbGlzdGVuZXIsIG9uY2UpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5ldmVudHMuaW5kZXhPZih0eXBlKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnNbdHlwZV0gPSBbe1xuICAgICAgICAgICAgICAgICAgICBvbmNlOiBvbmNlLFxuICAgICAgICAgICAgICAgICAgICBmbjogbGlzdGVuZXJcbiAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50cy5wdXNoKHR5cGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnNbdHlwZV0ucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG9uY2U6IG9uY2UsXG4gICAgICAgICAgICAgICAgICAgIGZuOiBsaXN0ZW5lclxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN1YnNjcmliZXMgb24gZXZlbnQgdHlwZSBzcGVjaWZpZWQgZnVuY3Rpb25cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gbGlzdGVuZXJcbiAgICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29uJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICAgICAgICB0aGlzLl9hZGRMaXN0ZW5uZXIodHlwZSwgbGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdWJzY3JpYmVzIG9uIGV2ZW50IHR5cGUgc3BlY2lmaWVkIGZ1bmN0aW9uIHRvIGZpcmUgb25seSBvbmNlXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyXG4gICAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvbmNlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uY2UodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZExpc3Rlbm5lcih0eXBlLCBsaXN0ZW5lciwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlcyBldmVudCB3aXRoIHNwZWNpZmllZCB0eXBlLiBJZiBzcGVjaWZpZWQgbGlzdGVuZXJGdW5jIC0gZGVsZXRlcyBvbmx5IG9uZSBsaXN0ZW5lciBvZiBzcGVjaWZpZWQgdHlwZVxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IFtsaXN0ZW5lckZ1bmNdXG4gICAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvZmYnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb2ZmKGV2ZW50VHlwZSwgbGlzdGVuZXJGdW5jKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgdHlwZUluZGV4ID0gdGhpcy5ldmVudHMuaW5kZXhPZihldmVudFR5cGUpO1xuICAgICAgICAgICAgdmFyIGhhc1R5cGUgPSBldmVudFR5cGUgJiYgdHlwZUluZGV4ICE9PSAtMTtcblxuICAgICAgICAgICAgaWYgKGhhc1R5cGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxpc3RlbmVyRnVuYykge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fbGlzdGVuZXJzW2V2ZW50VHlwZV07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRzLnNwbGljZSh0eXBlSW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVtb3ZlZEV2ZW50cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHR5cGVMaXN0ZW5lcnMgPSBfdGhpcy5fbGlzdGVuZXJzW2V2ZW50VHlwZV07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVMaXN0ZW5lcnMuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIHtFdmVudEVtaXR0ZXJMaXN0ZW5lckZ1bmN9IGZuXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gaWR4XG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChmbiwgaWR4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZuLmZuID09PSBsaXN0ZW5lckZ1bmMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZEV2ZW50cy51bnNoaWZ0KGlkeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZWRFdmVudHMuZm9yRWFjaChmdW5jdGlvbiAoaWR4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZUxpc3RlbmVycy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXR5cGVMaXN0ZW5lcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuZXZlbnRzLnNwbGljZSh0eXBlSW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBfdGhpcy5fbGlzdGVuZXJzW2V2ZW50VHlwZV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFwcGxpZXMgYXJndW1lbnRzIHRvIHNwZWNpZmllZCBldmVudCB0eXBlXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGVcbiAgICAgICAgICogQHBhcmFtIHsqW119IGV2ZW50QXJndW1lbnRzXG4gICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ19hcHBseUV2ZW50cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBfYXBwbHlFdmVudHMoZXZlbnRUeXBlLCBldmVudEFyZ3VtZW50cykge1xuICAgICAgICAgICAgdmFyIHR5cGVMaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnNbZXZlbnRUeXBlXTtcblxuICAgICAgICAgICAgaWYgKCF0eXBlTGlzdGVuZXJzIHx8ICF0eXBlTGlzdGVuZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9zdHJpY3RNb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93ICdObyBsaXN0ZW5lcnMgc3BlY2lmaWVkIGZvciBldmVudDogJyArIGV2ZW50VHlwZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcmVtb3ZhYmxlTGlzdGVuZXJzID0gW107XG4gICAgICAgICAgICB0eXBlTGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGVlTGlzdGVuZXIsIGlkeCkge1xuICAgICAgICAgICAgICAgIGVlTGlzdGVuZXIuZm4uYXBwbHkobnVsbCwgZXZlbnRBcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIGlmIChlZUxpc3RlbmVyLm9uY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZhYmxlTGlzdGVuZXJzLnVuc2hpZnQoaWR4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmVtb3ZhYmxlTGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGlkeCkge1xuICAgICAgICAgICAgICAgIHR5cGVMaXN0ZW5lcnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFbWl0cyBldmVudCB3aXRoIHNwZWNpZmllZCB0eXBlIGFuZCBwYXJhbXMuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAgICAgICAqIEBwYXJhbSBldmVudEFyZ3NcbiAgICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2VtaXQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZW1pdCh0eXBlKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGV2ZW50QXJncyA9IEFycmF5KF9sZW4gPiAxID8gX2xlbiAtIDEgOiAwKSwgX2tleSA9IDE7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgICAgICAgICBldmVudEFyZ3NbX2tleSAtIDFdID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5fZW1pdERlbGF5KSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5fYXBwbHlFdmVudHMuY2FsbChfdGhpczIsIHR5cGUsIGV2ZW50QXJncyk7XG4gICAgICAgICAgICAgICAgfSwgdGhpcy5fZW1pdERlbGF5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYXBwbHlFdmVudHModHlwZSwgZXZlbnRBcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFbWl0cyBldmVudCB3aXRoIHNwZWNpZmllZCB0eXBlIGFuZCBwYXJhbXMgc3luY2hyb25vdXNseS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAgICAgICAgICogQHBhcmFtIGV2ZW50QXJnc1xuICAgICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZW1pdFN5bmMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZW1pdFN5bmModHlwZSkge1xuICAgICAgICAgICAgZm9yICh2YXIgX2xlbjIgPSBhcmd1bWVudHMubGVuZ3RoLCBldmVudEFyZ3MgPSBBcnJheShfbGVuMiA+IDEgPyBfbGVuMiAtIDEgOiAwKSwgX2tleTIgPSAxOyBfa2V5MiA8IF9sZW4yOyBfa2V5MisrKSB7XG4gICAgICAgICAgICAgICAgZXZlbnRBcmdzW19rZXkyIC0gMV0gPSBhcmd1bWVudHNbX2tleTJdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9hcHBseUV2ZW50cyh0eXBlLCBldmVudEFyZ3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlc3Ryb3lzIEV2ZW50RW1pdHRlclxuICAgICAgICAgKi9cblxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGVzdHJveScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0ge307XG4gICAgICAgICAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEV2ZW50RW1pdHRlcjtcbn0oKTtcblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG4iLCJpbXBvcnQgRW1pdHRlciBmcm9tICdldmVudC1lbWl0dGVyLWVzNic7XG5cbmNsYXNzIEZvcm0gZXh0ZW5kcyBFbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvcigkZWwpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLiRlbCA9ICRlbDtcblxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdGhpcy4kZWwuaW5uZXJIVE1MID0gYDxmb3JtIGNsYXNzPVwicHVyZS1mb3JtIGpzLWZvcm1cIiBhY3Rpb249XCIjXCI+XG4gICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiY29tcG9zZS1pbnB1dCBqcy1pbnB1dFwiIG5hbWU9XCJtZXNzYWdlXCIgYXV0b2NvbXBsZXRlPVwib2ZmXCIvPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cInB1cmUtYnV0dG9uIHB1cmUtYnV0dG9uLXByaW1hcnlcIj5TZW5kPC9idXR0b24+XG4gICAgICAgIDwvZm9ybT5gO1xuXG4gICAgICAgIHRoaXMuaW5pdEV2ZW50cygpO1xuICAgIH1cblxuICAgIGluaXRFdmVudHMoKSB7XG4gICAgICAgIHRoaXMuJGZvcm0gPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcuanMtZm9ybScpO1xuICAgICAgICB0aGlzLiRpbnB1dCA9IHRoaXMuJGZvcm0ucXVlcnlTZWxlY3RvcignLmpzLWlucHV0Jyk7XG5cbiAgICAgICAgdGhpcy4kZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCB0aGlzLm9uU3VibWl0LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIG9uU3VibWl0KGV2ZW50KSB7XG4gICAgICAgIGxldCBtZXNzYWdlID0gdGhpcy4kaW5wdXQudmFsdWUudHJpbSgpO1xuXG4gICAgICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ3NlbmQnLCB7IG1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB0aGlzLiRpbnB1dC52YWx1ZSA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZvcm07XG4iLCIvLyBUT0RPOiBidW5kbGVcbmltcG9ydCBFbWl0dGVyIGZyb20gJ2V2ZW50LWVtaXR0ZXItZXM2JztcbmltcG9ydCAqIGFzIGZpcmViYXNlIGZyb20gJ2ZpcmViYXNlJztcblxuY29uc3QgY29uZmlnID0ge1xuICAgIGFwaUtleTogJ0FJemFTeUJOX3dwNkR0ZFNQU2hVcUNiMnlLY2VBcm9tUVZvRWFGUScsXG4gICAgYXV0aERvbWFpbjogJ21pbmljaGF0LTk1OGZkLmZpcmViYXNlYXBwLmNvbScsXG4gICAgZGF0YWJhc2VVUkw6ICdodHRwczovL21pbmljaGF0LTk1OGZkLmZpcmViYXNlaW8uY29tJyxcbiAgICBwcm9qZWN0SWQ6ICdtaW5pY2hhdC05NThmZCcsXG4gICAgc3RvcmFnZUJ1Y2tldDogJ21pbmljaGF0LTk1OGZkLmFwcHNwb3QuY29tJyxcbiAgICBtZXNzYWdpbmdTZW5kZXJJZDogJzM3OTY3ODIwMzgwMycsXG59O1xuXG4vKipcbiAqIFNpbmdsZXRvbiBhdXRoIHNlcnZpY2VcbiAqL1xuY2xhc3MgQXV0aFNlcnZpY2UgZXh0ZW5kcyBFbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLmFwcCA9IGZpcmViYXNlLmluaXRpYWxpemVBcHAoY29uZmlnKTtcbiAgICAgICAgdGhpcy5hdXRoID0gZmlyZWJhc2UuYXV0aCgpO1xuXG4gICAgICAgIHRoaXMuYXV0aC5vbkF1dGhTdGF0ZUNoYW5nZWQodGhpcy5vbkF1dGhTdGF0ZUNoYW5nZWQuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgZ2V0VXNlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aC5jdXJyZW50VXNlcjtcbiAgICB9XG5cbiAgICBsb2dvdXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF1dGguc2lnbk91dCgpO1xuICAgIH1cblxuICAgIGxvZ2luKGVtYWlsLCBwYXNzd29yZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdXRoLnNpZ25JbldpdGhFbWFpbEFuZFBhc3N3b3JkKGVtYWlsLCBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgc2lnbnVwKGVtYWlsLCBwYXNzd29yZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdXRoLmNyZWF0ZVVzZXJXaXRoRW1haWxBbmRQYXNzd29yZChlbWFpbCwgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIG9uQXV0aFN0YXRlQ2hhbmdlZCh1c2VyKSB7XG4gICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2xvZ2luJywgdXNlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2xvZ291dCcpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgQXV0aFNlcnZpY2UoKTtcbiIsImltcG9ydCBhdXRoU2VydmljZSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9hdXRoJztcbmltcG9ydCAnLi4vbWVudS9tZW51LmNzcyc7XG5cbmNsYXNzIE1lbnUge1xuICAgIGNvbnN0cnVjdG9yKCRlbCkge1xuICAgICAgICB0aGlzLiRlbCA9ICRlbDtcblxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuXG4gICAgICAgIGF1dGhTZXJ2aWNlLm9uKCdsb2dpbicsIHRoaXMudXBkYXRlSGVhZGVyLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdGhpcy4kZWwuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJwdXJlLW1lbnUgcHVyZS1tZW51LWhvcml6b250YWwgbWVudVwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJwdXJlLW1lbnUtaGVhZGluZyBqcy1oZWFkZXJcIj5DaGF0PC9zcGFuPlxuICAgICAgICAgICAgPHVsIGNsYXNzPVwicHVyZS1tZW51LWxpc3RcIj5cbiAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJwdXJlLW1lbnUtaXRlbVwiPjxhIGhyZWY9XCIjXCIgY2xhc3M9XCJwdXJlLW1lbnUtbGluayBqcy1sb2dvdXRcIj5Mb2dvdXQ8L2E+PC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PmA7XG5cbiAgICAgICAgdGhpcy5pbml0RXZlbnRzKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlSGVhZGVyKCkge1xuICAgICAgICBjb25zdCB1c2VyID0gYXV0aFNlcnZpY2UuZ2V0VXNlcigpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gdXNlciA/IHVzZXIuZGlzcGxheU5hbWUgfHwgdXNlci5lbWFpbCA6ICdjaGF0JztcblxuICAgICAgICBpZiAodGhpcy4kaGVhZGVyKSB7XG4gICAgICAgICAgICB0aGlzLiRoZWFkZXIudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5pdEV2ZW50cygpIHtcbiAgICAgICAgdGhpcy4kbG9nb3V0ID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmpzLWxvZ291dCcpO1xuICAgICAgICB0aGlzLiRsb2dvdXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uTG9nb3V0LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuJGhlYWRlciA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5qcy1oZWFkZXInKTtcbiAgICAgICAgdGhpcy51cGRhdGVIZWFkZXIoKTtcbiAgICB9XG5cbiAgICBvbkxvZ291dChldmVudCkge1xuICAgICAgICBhdXRoU2VydmljZS5sb2dvdXQoKVxuICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBmYWlsZWQgdG8gbG9nb3V0OiAke2Vycm9yLmNvZGV9OiR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNZW51O1xuIiwiY29uc3QgZ2VuZXJhdGVVaWQgPSAoKSA9PiB7XG4gICAgY29uc3QgdGltZXN0YW1wID0gRGF0ZS5ub3coKS50b1N0cmluZygpLnNsaWNlKDAsIC0zKTtcbiAgICBjb25zdCByYW5kb20gPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgNCk7XG5cbiAgICByZXR1cm4gYCR7cmFuZG9tfSR7dGltZXN0YW1wfWA7XG59O1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgZ2VuZXJhdGVVaWQsXG59O1xuIiwiaW1wb3J0IEVtaXR0ZXIgZnJvbSAnZXZlbnQtZW1pdHRlci1lczYnO1xuaW1wb3J0ICogYXMgZmlyZWJhc2UgZnJvbSAnZmlyZWJhc2UnO1xuaW1wb3J0IGF1dGhTZXJ2aWNlIGZyb20gJy4uL3NlcnZpY2VzL2F1dGgnO1xuaW1wb3J0IHVpZCBmcm9tICcuLi91dGlscy91aWQnO1xuXG5jbGFzcyBNZXNzYWdlc1NlcnZpY2UgZXh0ZW5kcyBFbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLmRhdGFiYXNlID0gZmlyZWJhc2UuZGF0YWJhc2UoKTtcbiAgICAgICAgdGhpcy5tZXNzYWdlc1JlZiA9IHRoaXMuZGF0YWJhc2UucmVmKCdtZXNzYWdlcycpO1xuICAgICAgICB0aGlzLm1lc3NhZ2VzUmVmLm9mZigpO1xuXG4gICAgICAgIHRoaXMubWVzc2FnZXNSZWYubGltaXRUb0xhc3QoMTAwKS5vbignY2hpbGRfYWRkZWQnLCB0aGlzLm9uTWVzc2FnZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5tZXNzYWdlc1JlZi5saW1pdFRvTGFzdCgxMDApLm9uKCdjaGlsZF9jaGFuZ2VkJywgdGhpcy5vbk1lc3NhZ2UuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgYWRkTWVzc2FnZSh7IG1lc3NhZ2UgfSkge1xuICAgICAgICBsZXQgdXNlciA9IGF1dGhTZXJ2aWNlLmdldFVzZXIoKTtcblxuICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgbmFtZTogdXNlci5kaXNwbGF5TmFtZSB8fCB1c2VyLmVtYWlsLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBmaXJlYmFzZS5kYXRhYmFzZS5TZXJ2ZXJWYWx1ZS5USU1FU1RBTVAsXG4gICAgICAgICAgICAgICAgdWlkOiB1aWQuZ2VuZXJhdGVVaWQoKSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMubWVzc2FnZXNSZWYucHVzaChkYXRhKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHt9KVxuICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdwdXNoIGVycm9yJywgZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25NZXNzYWdlKGRhdGEpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdtZXNzYWdlJywgZGF0YS52YWwoKSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgTWVzc2FnZXNTZXJ2aWNlKCk7XG4iLCJpbXBvcnQgQmFzZSBmcm9tICcuLi9iYXNlL2Jhc2UnO1xuaW1wb3J0IE1lc3NhZ2VzIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvbWVzc2FnZXMvbWVzc2FnZXMnO1xuaW1wb3J0IEZvcm0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9mb3JtL2Zvcm0nO1xuaW1wb3J0IE1lbnUgZnJvbSAnLi4vLi4vY29tcG9uZW50cy9tZW51L21lbnUnO1xuaW1wb3J0IG1lc3NhZ2VzU2VydmljZSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9tZXNzYWdlcyc7XG5cbmNsYXNzIENoYXQgZXh0ZW5kcyBCYXNlIHtcbiAgICBjb25zdHJ1Y3RvcigkZWwpIHtcbiAgICAgICAgc3VwZXIoJGVsKTtcblxuICAgICAgICBtZXNzYWdlc1NlcnZpY2Uub24oJ21lc3NhZ2UnLCB0aGlzLm9uTWVzc2FnZS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIC8vIGNsZWFyXG4gICAgICAgIHRoaXMuJGVsLmlubmVySFRNTCA9ICcnO1xuXG4gICAgICAgIC8vIG1lbnVcbiAgICAgICAgbGV0ICRtZW51ID0gdGhpcy5hZGRDb250YWluZXIoKTtcblxuICAgICAgICB0aGlzLm1lbnUgPSBuZXcgTWVudSgkbWVudSk7XG5cbiAgICAgICAgLy8gbWVzc2FnZXNcbiAgICAgICAgbGV0ICRtZXNzYWdlcyA9IHRoaXMuYWRkQ29udGFpbmVyKCdtZXNzYWdlcycpO1xuXG4gICAgICAgIHRoaXMubWVzc2FnZXMgPSBuZXcgTWVzc2FnZXMoJG1lc3NhZ2VzKTtcblxuICAgICAgICAvLyBjb21wb3NlXG4gICAgICAgIGxldCAkZm9ybSA9IHRoaXMuYWRkQ29udGFpbmVyKCk7XG5cbiAgICAgICAgdGhpcy5jb21wb3NlID0gbmV3IEZvcm0oJGZvcm0pO1xuICAgICAgICB0aGlzLmNvbXBvc2Uub24oJ3NlbmQnLCB0aGlzLm9uU2VuZC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBhZGRDb250YWluZXIoY2xhc3Nlcykge1xuICAgICAgICBsZXQgJGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgICAgICBpZiAoY2xhc3Nlcykge1xuICAgICAgICAgICAgJGVsZW1lbnQuY2xhc3NOYW1lID0gY2xhc3NlcztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuJGVsLmFwcGVuZENoaWxkKCRlbGVtZW50KTtcblxuICAgICAgICByZXR1cm4gJGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgb25TZW5kKG1lc3NhZ2UpIHtcbiAgICAgICAgbWVzc2FnZXNTZXJ2aWNlLmFkZE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgfVxuXG4gICAgb25NZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICAgICAgdGhpcy5tZXNzYWdlcy5hZGRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2hhdDtcbiIsImltcG9ydCBhdXRoU2VydmljZSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9hdXRoJztcblxuY2xhc3MgTG9naW4ge1xuICAgIGNvbnN0cnVjdG9yKCRlbCkge1xuICAgICAgICB0aGlzLiRlbCA9ICRlbDtcblxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdGhpcy4kZWwuaW5uZXJIVE1MID0gYDxmb3JtIGNsYXNzPVwicHVyZS1mb3JtXCIgYWN0aW9uPVwiI1wiPlxuICAgICAgICA8ZGl2PjxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJlbWFpbFwiLz48L2Rpdj5cbiAgICAgICAgPGRpdj48aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgbmFtZT1cInBhc3N3b3JkXCIvPjwvZGl2PlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cInB1cmUtYnV0dG9uIHB1cmUtYnV0dG9uLXByaW1hcnkgYnRuIGJ0bl9tYWluXCI+TG9nIGluPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJwdXJlLWJ1dHRvbiBqcy1zaWdudXBcIj5TaWduIHVwPC9idXR0b24+YDtcblxuICAgICAgICB0aGlzLmluaXRFdmVudHMoKTtcbiAgICB9XG5cbiAgICBpbml0RXZlbnRzKCkge1xuICAgICAgICB0aGlzLiRmb3JtID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignZm9ybScpO1xuICAgICAgICB0aGlzLiRlbWFpbCA9IHRoaXMuJGZvcm0ucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImVtYWlsXCJdJyk7XG4gICAgICAgIHRoaXMuJHBhc3N3b3JkID0gdGhpcy4kZm9ybS5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwicGFzc3dvcmRcIl0nKTtcbiAgICAgICAgdGhpcy4kc2lnbnVwID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmpzLXNpZ251cCcpO1xuXG4gICAgICAgIHRoaXMuJGZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgdGhpcy5vblN1Ym1pdC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy4kc2lnbnVwLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vblNpZ251cC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBvblN1Ym1pdChldmVudCkge1xuICAgICAgICBsZXQgZW1haWwgPSB0aGlzLiRlbWFpbC52YWx1ZTtcbiAgICAgICAgbGV0IHBhc3N3b3JkID0gdGhpcy4kcGFzc3dvcmQudmFsdWU7XG5cbiAgICAgICAgYXV0aFNlcnZpY2UubG9naW4oZW1haWwsIHBhc3N3b3JkKVxuICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGFsZXJ0KGBmYWlsZWQgdG8gc2lnbiB1cDogJHtlcnJvci5jb2RlfToke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIG9uU2lnbnVwKGV2ZW50KSB7XG4gICAgICAgIGxldCBlbWFpbCA9IHRoaXMuJGVtYWlsLnZhbHVlO1xuICAgICAgICBsZXQgcGFzc3dvcmQgPSB0aGlzLiRwYXNzd29yZC52YWx1ZTtcblxuICAgICAgICBhdXRoU2VydmljZS5zaWdudXAoZW1haWwsIHBhc3N3b3JkKVxuICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGFsZXJ0KGBmYWlsZWQgdG8gc2lnbiB1cDogJHtlcnJvci5jb2RlfToke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTG9naW47XG4iLCJpbXBvcnQgQmFzZSBmcm9tICcuLi9iYXNlL2Jhc2UnO1xuaW1wb3J0IExvZ2luIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvbG9naW4vbG9naW4nO1xuXG5jbGFzcyBBdXRoIGV4dGVuZHMgQmFzZSB7XG4gICAgcmVuZGVyKCkge1xuICAgICAgICAvLyBjbGVhclxuICAgICAgICB0aGlzLmxvZ2luID0gbmV3IExvZ2luKHRoaXMuJGVsKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEF1dGg7XG4iLCJpbXBvcnQgYXV0aFNlcnZpY2UgZnJvbSAnLi4vc2VydmljZXMvYXV0aCc7XG5cbmNsYXNzIFJvdXRlciB7XG4gICAgY29uc3RydWN0b3Iodmlld3MpIHtcbiAgICAgICAgdGhpcy52aWV3cyA9IHZpZXdzO1xuICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gbnVsbDtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgICAgYXV0aFNlcnZpY2Uub24oJ2xvZ2luJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yb3V0ZSgnY2hhdCcpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhdXRoU2VydmljZS5vbignbG9nb3V0JywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yb3V0ZSgnYXV0aCcpO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgbmFtZSA9IGF1dGhTZXJ2aWNlLmdldFVzZXIoKSA/ICdjaGF0JyA6ICdhdXRoJztcblxuICAgICAgICB0aGlzLnJvdXRlKG5hbWUpO1xuICAgIH1cblxuICAgIHJvdXRlKG5hbWUpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFZpZXcpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFZpZXcuJGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdGhpcy52aWV3c1tuYW1lXTtcbiAgICAgICAgdGhpcy5jdXJyZW50Vmlldy4kZWwuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBSb3V0ZXI7XG4iLCJpbXBvcnQgQ2hhdCBmcm9tICcuL3ZpZXdzL2NoYXQvY2hhdCc7XG5pbXBvcnQgQXV0aCBmcm9tICcuL3ZpZXdzL2F1dGgvYXV0aCc7XG5pbXBvcnQgUm91dGVyIGZyb20gJy4vcm91dGVyL3JvdXRlcic7XG5cbmltcG9ydCAnLi4vbm9kZV9tb2R1bGVzL3B1cmVjc3MvYnVpbGQvcHVyZS1taW4uY3NzJztcblxubGV0ICRsb2FkaW5nID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWxvYWRpbmcnKTtcbmxldCAkY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNvbXBvbmVudHMnKTtcblxuLy8gdmlld3NcbmxldCB2aWV3cyA9IHtcbiAgICBjaGF0OiBuZXcgQ2hhdChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSksXG4gICAgYXV0aDogbmV3IEF1dGgoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpLFxufTtcblxuT2JqZWN0LmtleXModmlld3MpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIHZpZXdzW2tleV0uJGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgJGNvbnRhaW5lci5hcHBlbmRDaGlsZCh2aWV3c1trZXldLiRlbCk7XG59KTtcblxuLy8gcm91dGVyXG5sZXQgcm91dGVyID0gbmV3IFJvdXRlcih2aWV3cyk7XG5cbnJvdXRlci5zdGFydCgpO1xuXG4vLyByZWFkeVxuJGxvYWRpbmcuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiRjb250YWluZXIuc3R5bGUuZGlzcGxheSA9IG51bGw7XG4iXSwibmFtZXMiOlsiZXNjYXBlSHRtbCIsIkVtaXR0ZXIiLCJmaXJlYmFzZS5pbml0aWFsaXplQXBwIiwiZmlyZWJhc2UuYXV0aCIsImZpcmViYXNlLmRhdGFiYXNlIl0sIm1hcHBpbmdzIjoiOzs7QUFBQSxNQUFNLElBQUksQ0FBQztJQUNQLFdBQVcsQ0FBQyxHQUFHLEVB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
