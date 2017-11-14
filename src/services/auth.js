// TODO: use import
let { firebase } = window;

/**
 * Singleton auth service
 */
class AuthService {
    constructor() {
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
            this.onLogin();
        } else {
            this.onLogout();
        }
    }

    onLogin() {}

    onLogout() {}
}

export default new AuthService();
