import Base from '../base/base';
import Login from '../../components/login/login';

class Auth extends Base {
    render() {
        // clear
        this.login = new Login(this.$el);
    }
}

export default Auth;
