import { loginUser } from '../../data/api';
import {
  actionLoading,
  notifAutoClose,
  notifCommon,
  validateEmail,
  validatePassword,
} from '../../utils';
import { isLoggedIn, setAuth } from '../../utils/auth';
import LoginPresenter from './login-presenter';

export default class LoginPage {
  #presenter;

  async render() {
    return `
      <section id="login-section" class="flex justify-center h-125 mt-20"> 
        <div class="w-full h-fit max-w-sm p-6 bg-white rounded-2xl shadow-xl/30">
          <h2 class="text-2xl font-bold mb-6 text-center">Log in Form</h2>
          <form id="login-form">
            <div class="mb-4">
              <label for="email" class="block mb-1 font-medium">Email</label>
              <input id="email" type="email" autocomplete="email" required class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div class="mb-4">
              <label for="password" class="block mb-1 font-medium">Password</label>
              <input id="password" type="password" autocomplete="current-password" required class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <div class="mt-2 flex items-center">
                <input id="show-password" type="checkbox" class="mr-3" />
                <label for="show-password" class="text-sm select-none cursor-pointer">Show Password</label>
              </div>
            </div>
            <button type="submit" class="w-full py-2 mt-4 bg-sky-700 text-white font-semibold rounded-xl hover:bg-sky-900 hover:cursor-pointer">Log in</button>
          </form>
          <p class="mt-4 text-center text-sm">
            Don't have an account? 
            <a href="#/register" class="text-sky-700 underline hover:font-bold">
              Create Account 
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          </p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      view: this,
      apiModel: {
        login: loginUser,
        isLoggedIn,
        setAuth,
        validate: { email: validateEmail, password: validatePassword },
      },
    });

    await this.#presenter.isLoggedIn();

    const form = document.body.querySelector('#login-form');
    form.removeEventListener('submit', (e) => {
      this.onSubmit(e);
    });
    form.addEventListener('submit', (e) => {
      this.onSubmit(e);
    });

    const showPasswordCheckbox = document.body.querySelector('#show-password');
    const passwordInput = document.body.querySelector('#password');
    showPasswordCheckbox.addEventListener('change', (e) => {
      passwordInput.type = e.target.checked ? 'text' : 'password';
    });
  }

  async onSubmit(e) {
    e.preventDefault();
    const email = document.body.querySelector('#email').value;
    const password = document.body.querySelector('#password').value;

    await this.#presenter.auth(email, password);
  }

  showLoading() {
    actionLoading.fire({
      title: 'Loading...',
    });
  }

  renderLoginSuccess(msg = '') {
    notifAutoClose
      .fire({
        icon: 'success',
        title: 'Success',
        text: msg || 'Successfully logged in',
      })
      .then((result) => {
        if (result.isDismissed) {
          window.location.href = '#/';
        }
      });
  }

  renderLoginFailed(errorMsg) {
    notifCommon.fire({
      icon: 'error',
      title: 'Login failed',
      text: errorMsg,
    });
  }

  resetForm() {
    const form = document.body.querySelector('#login-form');
    if (form) {
      form.reset();
    }
  }
}
