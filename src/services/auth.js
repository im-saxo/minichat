// TODO: bundle
import Emitter from 'event-emitter-es6';
import * as firebase from 'firebase';

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
class AuthService extends Emitter {
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

export default new AuthService();
